import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'

export const healthRoute: FastifyPluginAsync = async (app) => {
  const f = app.withTypeProvider<TypeBoxTypeProvider>()

  f.get(
    '/health',
    {
      schema: {
        response: {
          200: Type.Object({ status: Type.String() }),
        },
      },
    },
    async () => ({ status: 'ok' })
  )
}
