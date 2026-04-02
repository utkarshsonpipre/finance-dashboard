// server.ts
// Custom Next.js server with Express — single process, single port.
// Run with: ts-node --transpile-only -r tsconfig-paths/register server.ts

/* eslint-disable @typescript-eslint/no-require-imports */
import { createServer, IncomingMessage, ServerResponse } from 'http'
import { parse } from 'url'
import 'dotenv/config'
import { connectDB } from '@/utils/db'
import { createExpressApp } from '@/app'

const port = parseInt(process.env.PORT ?? '3000', 10)
const dev = process.env.NODE_ENV !== 'production'

async function main() {
  // 1. Connect to MongoDB
  await connectDB()

  // 2. Prepare Next.js (require() avoids ESM/CJS default-export mismatch)
  const nextFactory = require('next')
  const nextApp = nextFactory({ dev, port })
  const handle = nextApp.getRequestHandler()
  await nextApp.prepare()

  // 3. Create a single HTTP server bypassing Express to match Vercel exactly
  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    const parsedUrl = parse(req.url ?? '/', true)
    handle(req, res, parsedUrl)
  })

  server.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port} [${dev ? 'development' : 'production'}]`)
  })
}

main().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
