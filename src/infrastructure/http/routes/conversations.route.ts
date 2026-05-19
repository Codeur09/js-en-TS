import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import type { FastifyPluginAsync } from 'fastify'
import { ConversationNotFoundError } from '../../../domain/errors/domain.error.js'
import {
  IdParam,
  SendMessageBody,
  ConversationSchema,
  ConversationDetailSchema,
} from '../schemas/conversations.schema.js'

const sendEvent = (raw: NodeJS.WritableStream, payload: object): void => {
  raw.write(`data: ${JSON.stringify(payload)}\n\n`)
}

export const conversationsRoute: FastifyPluginAsync = async (app) => {
  const f = app.withTypeProvider<TypeBoxTypeProvider>()

  f.post(
    '/conversations',
    { schema: { response: { 201: ConversationSchema } } },
    async (_, reply) => {
      const conv = app.useCases.createConversation.execute()
      return reply.status(201).send({ ...conv, messageCount: 0 })
    }
  )

  f.get(
    '/conversations',
    { schema: { response: { 200: Type.Array(ConversationSchema) } } },
    async () => app.useCases.listConversations.execute()
  )

  f.get(
    '/conversations/:id',
    { schema: { params: IdParam, response: { 200: ConversationDetailSchema } } },
    async (request, reply) => {
      try {
        return app.useCases.getConversation.execute(request.params.id)
      } catch (err) {
        if (err instanceof ConversationNotFoundError) return reply.notFound(err.message)
        throw err
      }
    }
  )

  f.delete(
    '/conversations/:id',
    { schema: { params: IdParam } },
    async (request, reply) => {
      try {
        app.useCases.deleteConversation.execute(request.params.id)
        return reply.status(204).send()
      } catch (err) {
        if (err instanceof ConversationNotFoundError) return reply.notFound(err.message)
        throw err
      }
    }
  )

  f.post(
    '/conversations/:id/messages',
    { schema: { params: IdParam, body: SendMessageBody } },
    async (request, reply) => {
      const controller = new AbortController()

      reply.hijack()
      reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      })
      reply.raw.once('close', () => controller.abort())

      try {
        for await (const chunk of app.useCases.sendMessage.execute(
          request.params.id,
          request.body.message,
          controller.signal
        )) {
          if (chunk.content) sendEvent(reply.raw, { type: 'token', value: chunk.content })
          if (chunk.done) sendEvent(reply.raw, { type: 'done' })
        }
      } catch (err) {
        if (err instanceof ConversationNotFoundError) {
          sendEvent(reply.raw, { type: 'error', message: err.message })
        } else if ((err as Error).name !== 'AbortError') {
          request.log.error(err, 'Streaming error')
          sendEvent(reply.raw, { type: 'error', message: (err as Error).message })
        }
      } finally {
        reply.raw.end()
      }
    }
  )
}
