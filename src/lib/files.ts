import { uploadLimits } from '../config/options'

export interface EncodedFile {
  name: string
  type: string
  size: number
  data: string // base64 bez prefiksa
}

export function checkFile(f: File): string | null {
  const okType = uploadLimits.accept.includes(f.type) || /\.(jpe?g|png|pdf)$/i.test(f.name)
  if (!okType) return `„${f.name}“: dozvoljeni su samo JPG, PNG i PDF.`
  if (f.size > uploadLimits.maxFileMB * 1024 * 1024) return `„${f.name}“ je veći od ${uploadLimits.maxFileMB} MB.`
  return null
}

function readAsBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result).split(',')[1] ?? '')
    r.onerror = () => reject(r.error)
    r.readAsDataURL(blob)
  })
}

/** Smanjuje sliku na najviše `max` px po dužoj strani (JPEG), da porudžbina stane u limit servera */
async function shrinkImage(f: File, max = 1800, quality = 0.82): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(f)
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height))
    if (k === 1 && f.size < 900 * 1024) return f
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bmp.width * k)
    canvas.height = Math.round(bmp.height * k)
    const ctx = canvas.getContext('2d')
    if (!ctx) return f
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', quality))
    return blob && blob.size < f.size ? blob : f
  } catch {
    return f
  }
}

export async function encodeFiles(files: File[]): Promise<EncodedFile[]> {
  const out: EncodedFile[] = []
  for (const f of files) {
    const isImg = f.type.startsWith('image/')
    const blob = isImg ? await shrinkImage(f) : f
    const name = isImg && blob !== f ? f.name.replace(/\.(png|jpe?g)$/i, '') + '.jpg' : f.name
    out.push({ name, type: isImg && blob !== f ? 'image/jpeg' : f.type || 'application/octet-stream', size: blob.size, data: await readAsBase64(blob) })
  }
  const total = out.reduce((s, f) => s + f.size, 0)
  if (total > uploadLimits.maxTotalUploadMB * 1024 * 1024) {
    throw new Error(
      `Fajlovi su zajedno preveliki za slanje preko sajta (najviše ${uploadLimits.maxTotalUploadMB} MB posle smanjivanja). Uklonite neki PDF ili ga pošaljite na email.`,
    )
  }
  return out
}
