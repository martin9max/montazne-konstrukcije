import type { VercelRequest, VercelResponse } from '@vercel/node'
import { processOrder } from './_lib/orderCore.js'

export const config = { maxDuration: 30 }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Dozvoljen je samo POST.' })
  }
  const ip = String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim() || 'nepoznato'
  try {
    const result = await processOrder(req.body, ip, {
      TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
      TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      ORDER_EMAIL_FROM: process.env.ORDER_EMAIL_FROM,
      ORDER_EMAIL_TO: process.env.ORDER_EMAIL_TO,
    })
    return res.status(result.status).json(result.body)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Greška na serveru.' })
  }
}
