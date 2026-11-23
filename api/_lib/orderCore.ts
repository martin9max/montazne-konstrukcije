/**
 * Logika porudžbine, nezavisna od platforme (koristi je Vercel funkcija i Vite dev server).
 */
import { initialState, sanitize, summaryRows, type ConfigState } from '../../src/lib/configState.js'
import { isValidEmail, isValidSerbianPhone, normalizePhone, validateContact, validateDims, type ContactData } from '../../src/lib/validation.js'
import { products, type ProductType } from '../../src/config/products.js'
import { uploadLimits } from '../../src/config/options.js'
import { business } from '../../src/config/business.js'

export interface Env {
  TELEGRAM_BOT_TOKEN?: string
  TELEGRAM_CHAT_ID?: string
  RESEND_API_KEY?: string
  ORDER_EMAIL_FROM?: string
  ORDER_EMAIL_TO?: string
  /** u lokalnom razvoju, bez podešenih kanala, porudžbina se samo ispiše u konzoli */
  DEV_MOCK?: boolean
}

export interface Result {
  status: number
  body: Record<string, unknown>
}

interface InFile { name: string; type: string; data: string }

// ---------- rate limit (u memoriji instance; dovoljno protiv prostog spama) ----------
const hits = new Map<string, number[]>()
const WINDOW_MS = 10 * 60 * 1000
const MAX_HITS = 5
function rateLimited(ip: string): boolean {
  const now = Date.now()
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  arr.push(now)
  hits.set(ip, arr)
  if (hits.size > 5000) hits.clear()
  return arr.length > MAX_HITS
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const str = (v: unknown, max = 500) => (typeof v === 'string' ? v.slice(0, max) : '')

function orderId(): string {
  const year = new Date().getFullYear()
  const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
  let id = ''
  for (let i = 0; i < 5; i++) id += alphabet[Math.floor(Math.random() * alphabet.length)]
  return `MK-${year}-${id}`
}

// ---------- kanali ----------
async function sendTelegram(env: Env, html: string, files: InFile[]) {
  const base = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}`
  const r = await fetch(`${base}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: html, parse_mode: 'HTML', disable_web_page_preview: true }),
  })
  if (!r.ok) throw new Error(`Telegram ${r.status}: ${await r.text()}`)
  for (const f of files) {
    // slike šaljemo kao fotografije (vide se odmah u četu), PDF kao dokument
    const asPhoto = f.type === 'image/jpeg' || f.type === 'image/png'
    const fd = new FormData()
    fd.append('chat_id', String(env.TELEGRAM_CHAT_ID))
    if (f.name.startsWith('konstrukcija-crtez')) fd.append('caption', 'Crtež konstrukcije (kako ga kupac vidi)')
    if (f.name.startsWith('skica-sa-merama')) fd.append('caption', 'Skica kupca sa merama')
    fd.append(asPhoto ? 'photo' : 'document', new Blob([Buffer.from(f.data, 'base64')], { type: f.type }), f.name)
    const d = await fetch(`${base}/${asPhoto ? 'sendPhoto' : 'sendDocument'}`, { method: 'POST', body: fd })
    if (!d.ok) console.error('Telegram fajl nije poslat', f.name, d.status)
  }
}

async function sendEmail(env: Env, to: string, subject: string, html: string, files: InFile[] = [], replyTo?: string) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: env.ORDER_EMAIL_FROM,
      to: [to],
      subject,
      html,
      reply_to: replyTo,
      attachments: files.map((f) => ({ filename: f.name, content: f.data })),
    }),
  })
  if (!r.ok) throw new Error(`Email ${r.status}: ${await r.text()}`)
}

const hasTelegram = (e: Env) => !!(e.TELEGRAM_BOT_TOKEN && e.TELEGRAM_CHAT_ID)
const hasEmail = (e: Env) => !!(e.RESEND_API_KEY && e.ORDER_EMAIL_FROM && e.ORDER_EMAIL_TO)

/** Šalje vlasniku: Telegram primarno, email kao rezerva. Uspeh ako prođe bar jedan kanal. */
async function notifyOwner(env: Env, subject: string, tgHtml: string, emailHtml: string, files: InFile[], replyTo?: string) {
  const errors: string[] = []
  let delivered = false
  if (hasTelegram(env)) {
    try {
      await sendTelegram(env, tgHtml, files)
      delivered = true
    } catch (e) {
      errors.push(String(e))
    }
  }
  if (hasEmail(env)) {
    try {
      await sendEmail(env, env.ORDER_EMAIL_TO!, subject, emailHtml, files, replyTo)
      delivered = true
    } catch (e) {
      errors.push(String(e))
    }
  }
  if (!delivered && env.DEV_MOCK) {
    console.log('\n[DEV] Kanali nisu podešeni – porudžbina samo u konzoli:\n' + tgHtml.replace(/<[^>]+>/g, '') + '\n')
    return
  }
  if (!delivered) {
    console.error('Obaveštenje nije isporučeno', errors.length ? errors : 'nijedan kanal nije podešen')
    throw new Error('notify-failed')
  }
  if (errors.length) console.error('Delimična greška pri slanju', errors)
}

// ---------- glavni handler ----------
export async function processOrder(raw: unknown, ip: string, env: Env): Promise<Result> {
  if (!raw || typeof raw !== 'object') return { status: 400, body: { error: 'Neispravan zahtev.' } }
  const body = raw as Record<string, unknown>

  // honeypot: tiho „uspe“ za botove
  if (str(body.website)) return { status: 200, body: { ok: true, orderId: orderId() } }
  if (rateLimited(ip)) return { status: 429, body: { error: 'Previše pokušaja. Sačekajte nekoliko minuta.' } }

  if (body.kind === 'question') return processQuestion(body, env)
  if (body.kind !== 'order') return { status: 400, body: { error: 'Neispravan zahtev.' } }

  // kontakt
  const c = (body.contact ?? {}) as Record<string, unknown>
  const contact: ContactData = {
    name: str(c.name, 120).trim(),
    phone: str(c.phone, 40).trim(),
    email: str(c.email, 160).trim(),
    address: str(c.address, 300).trim(),
    preferredDate: str(c.preferredDate, 120).trim(),
    consent: c.consent === true,
  }
  const cErr = validateContact(contact)
  if (Object.keys(cErr).length) return { status: 422, body: { error: Object.values(cErr)[0], fields: cErr } }

  // konfiguracija
  const cfgIn = (body.config ?? {}) as Partial<ConfigState>
  const type = cfgIn.type as ProductType
  if (!products.some((p) => p.id === type)) return { status: 422, body: { error: 'Nepoznat tip konstrukcije.' } }
  const dimErr = validateDims(type, Number(cfgIn.length), Number(cfgIn.width), Number(cfgIn.height))
  if (dimErr) return { status: 422, body: { error: dimErr } }
  const config = sanitize({ ...initialState(type), ...cfgIn, type } as ConfigState)

  // fajlovi
  const filesIn = Array.isArray(body.files) ? (body.files as unknown[]) : []
  // + 2 fajla za skicu (očišćena skica sa kotama i originalna fotografija)
  if (filesIn.length > uploadLimits.maxFiles + 2) return { status: 422, body: { error: `Najviše ${uploadLimits.maxFiles} fajla.` } }
  const files: InFile[] = []
  for (const f of filesIn) {
    const o = (f ?? {}) as Record<string, unknown>
    const name = str(o.name, 120).replace(/[^\w.\- ()čćšžđČĆŠŽĐ]/g, '_') || 'fajl'
    const ftype = str(o.type, 80)
    const data = typeof o.data === 'string' ? o.data : ''
    if (!uploadLimits.accept.includes(ftype)) return { status: 422, body: { error: `Fajl „${name}“ nije JPG, PNG ili PDF.` } }
    if ((data.length * 3) / 4 > uploadLimits.maxFileMB * 1024 * 1024) return { status: 422, body: { error: `Fajl „${name}“ je prevelik.` } }
    files.push({ name, type: ftype, data })
  }

  const sketchDims = (Array.isArray(body.sketchDims) ? (body.sketchDims as unknown[]) : []).slice(0, 30).map((x) => str(x, 40)).filter(Boolean)
  const id = orderId()
  const rows = summaryRows(config)
  const configUrl = str(body.configUrl, 1000)
  const phoneE164 = (() => {
    const p = normalizePhone(contact.phone)
    return p.startsWith('+') ? p : p.startsWith('00') ? '+' + p.slice(2) : '+381' + p.slice(1)
  })()

  const tg = [
    `<b>Novi upit ${id}</b>`,
    '',
    ...rows.map((r) => `<b>${esc(r.label)}:</b> ${esc(r.value)}`),
    sketchDims.length ? `<b>Kote na skici:</b> ${esc(sketchDims.join(' · '))}` : '',
    config.note ? `\n<b>Napomena:</b>\n${esc(config.note)}` : '',
    '',
    `<b>Kupac:</b> ${esc(contact.name)}`,
    `<b>Telefon:</b> <a href="tel:${phoneE164}">${esc(contact.phone)}</a>`,
    contact.email ? `<b>Email:</b> ${esc(contact.email)}` : '',
    contact.address ? `<b>Mesto:</b> ${esc(contact.address)}` : '',
    contact.preferredDate ? `<b>Željeni termin:</b> ${esc(contact.preferredDate)}` : '',
    files.length ? `<b>Fajlovi:</b> ${files.length} (stižu ispod)` : '',
    configUrl ? `\n<a href="${esc(configUrl)}">Otvori konfiguraciju na sajtu</a>` : '',
  ]
    .filter((l) => l !== '')
    .join('\n')

  const table = (rs: { label: string; value: string }[]) =>
    `<table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:15px">${rs
      .map((r) => `<tr><td style="color:#555;border-bottom:1px solid #ddd">${esc(r.label)}</td><td style="font-weight:bold;border-bottom:1px solid #ddd">${esc(r.value)}</td></tr>`)
      .join('')}</table>`

  const ownerHtml = `<h2 style="font-family:Arial">Novi upit ${id}</h2>${table([
    ...rows,
    ...(sketchDims.length ? [{ label: 'Kote na skici', value: sketchDims.join(' · ') }] : []),
    ...(config.note ? [{ label: 'Napomena', value: config.note }] : []),
    { label: 'Kupac', value: contact.name },
    { label: 'Telefon', value: contact.phone },
    ...(contact.email ? [{ label: 'Email', value: contact.email }] : []),
    ...(contact.address ? [{ label: 'Mesto', value: contact.address }] : []),
    ...(contact.preferredDate ? [{ label: 'Željeni termin', value: contact.preferredDate }] : []),
  ])}<p><a href="tel:${phoneE164}">Pozovi kupca</a>${configUrl ? ` · <a href="${esc(configUrl)}">Otvori konfiguraciju</a>` : ''}</p>`

  try {
    await notifyOwner(env, `Novi upit ${id} – ${contact.name}`, tg, ownerHtml, files, contact.email || undefined)
  } catch {
    return { status: 502, body: { error: 'Server trenutno ne može da prosledi porudžbinu.' } }
  }

  // potvrda kupcu (greška ovde ne obara porudžbinu)
  if (contact.email && isValidEmail(contact.email) && env.RESEND_API_KEY && env.ORDER_EMAIL_FROM) {
    const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#111">
      <h2>Hvala, upit ${id} je primljen</h2>
      <p>Javljamo se ${business.responseTime} na broj ${esc(contact.phone)} da potvrdimo detalje i cenu.</p>
      ${table(rows)}
      <p>Pitanja: <a href="${business.phoneHref}">${business.phoneDisplay}</a></p>
      <p>${business.name}</p></div>`
    try {
      await sendEmail(env, contact.email, `Upit ${id} – ${business.name}`, html, [], env.ORDER_EMAIL_TO)
    } catch (e) {
      console.error('Potvrda kupcu nije poslata', e)
    }
  }

  return { status: 200, body: { ok: true, orderId: id } }
}

async function processQuestion(body: Record<string, unknown>, env: Env): Promise<Result> {
  const name = str(body.name, 120).trim()
  const phone = str(body.phone, 40).trim()
  const message = str(body.message, 2000).trim()
  if (name.length < 2 || message.length < 5) return { status: 422, body: { error: 'Popunite ime i pitanje.' } }
  if (!isValidSerbianPhone(phone)) return { status: 422, body: { error: 'Broj telefona nije ispravan.' } }
  const tg = `<b>Novo pitanje sa sajta</b>\n\n<b>Ime:</b> ${esc(name)}\n<b>Telefon:</b> ${esc(phone)}\n\n${esc(message)}`
  const html = `<h2 style="font-family:Arial">Novo pitanje sa sajta</h2><p><b>Ime:</b> ${esc(name)}<br><b>Telefon:</b> ${esc(phone)}</p><p style="white-space:pre-line">${esc(message)}</p>`
  try {
    await notifyOwner(env, `Pitanje sa sajta – ${name}`, tg, html, [])
  } catch {
    return { status: 502, body: { error: 'Server trenutno ne može da prosledi poruku.' } }
  }
  return { status: 200, body: { ok: true } }
}
