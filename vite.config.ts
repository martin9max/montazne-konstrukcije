import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** U lokalnom razvoju /api/order poziva istu logiku kao Vercel funkcija */
function devApi(): Plugin {
  return {
    name: 'dev-api',
    apply: 'serve',
    configureServer(server) {
      const env = loadEnv('development', process.cwd(), '')
      server.middlewares.use('/api/order', async (req, res) => {
        const send = (status: number, body: unknown) => {
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(body))
        }
        if (req.method !== 'POST') return send(405, { error: 'Dozvoljen je samo POST.' })
        let raw = ''
        for await (const chunk of req) raw += chunk
        try {
          const { processOrder } = await server.ssrLoadModule('/api/_lib/orderCore.ts')
          const r = await processOrder(JSON.parse(raw || '{}'), req.socket.remoteAddress ?? 'dev', {
            ...env,
            DEV_MOCK: env.DEV_FAIL_ORDERS !== '1',
          })
          send(r.status, r.body)
        } catch (e) {
          console.error(e)
          send(500, { error: 'Greška na serveru.' })
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), devApi()],
  build: { chunkSizeWarningLimit: 600 },
})
