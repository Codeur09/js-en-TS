import Fastify, { type FastifyInstance } from 'fastify'
import sensible from '@fastify/sensible'
import { config } from './config/env.js'
import dbPlugin from './infrastructure/http/plugins/db.plugin.js'
import containerPlugin from './infrastructure/http/plugins/container.plugin.js'
import { healthRoute } from './infrastructure/http/routes/health.route.js'
import { chatRoute } from './infrastructure/http/routes/chat.route.js'
import { conversationsRoute } from './infrastructure/http/routes/conversations.route.js'

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
  await app.register(containerPlugin)

  await app.register(healthRoute)
  await app.register(chatRoute)
  await app.register(conversationsRoute)

  return app
}
