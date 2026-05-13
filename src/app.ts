import Fastify, { type FastifyInstance } from 'fastify'
import sensible from '@fastify/sensible'
import { config } from './config/env.js'
import dbPlugin from './plugins/db.plugin.js'
import { healthRoute } from './routes/health/health.route.js'
import { chatRoute } from './routes/chat/chat.route.js'
import { conversationsRoute } from './routes/conversations/conversations.route.js'

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: config.logLevel,
      transport:
        config.nodeEnv !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } }
          : undefined,
    },
  })

  await app.register(sensible)
  await app.register(dbPlugin)

  await app.register(healthRoute)
  await app.register(chatRoute)
  await app.register(conversationsRoute)

  return app
}
