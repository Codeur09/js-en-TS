import { join } from 'node:path'

export const config = {
  port: Number(process.env['PORT'] ?? 3000),
  logLevel: process.env['LOG_LEVEL'] ?? 'info',
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  ollamaUrl: process.env['OLLAMA_URL'] ?? 'http://localhost:11434',
  ollamaModel: process.env['OLLAMA_MODEL'] ?? 'llama3.2',
  dbPath: process.env['DB_PATH'] ?? join(process.cwd(), 'data.db'),
} as const

export type Config = typeof config
