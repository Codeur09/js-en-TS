import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import type { FastifyPluginAsync } from 'fastify'
import { ConversationNotFoundError } from '../../../domain/errors/domain.error.js'
import { ChatBody, ChatResponse, ErrorResponse } from '../schemas/chat.schema.js'

const sendEvent = (raw: NodeJS.WritableStream, payload: object): void => {
  raw.write(`data: ${JSON.stringify(payload)}\n\n`)
}

export const chatRoute: FastifyPluginAsync = async (app) => {
  const f = app.withTypeProvider<TypeBoxTypeProvider>()

  f.post(
    '/chat',
    { schema: { body: ChatBody, response: { 200: ChatResponse, 502: ErrorResponse } } },
    async (request, reply) => {
      try {
        const response = await app.useCases.chat.executeOnce(request.body.message)
        return { response }
      } catch (err) {
        if (err instanceof ConversationNotFoundError) return reply.notFound(err.message)
        request.log.error(err, 'LLM error')
        return reply.status(502).send({ error: 'LLM request failed' })
      }
    }
  )

  f.post(
    '/chat/stream',
    { schema: { body: ChatBody } },
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
        for await (const chunk of app.useCases.chat.execute(request.body.message, controller.signal)) {
          if (chunk.content) sendEvent(reply.raw, { type: 'token', value: chunk.content })
          if (chunk.done) sendEvent(reply.raw, { type: 'done' })
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          request.log.error(err, 'Streaming error')
          sendEvent(reply.raw, { type: 'error', message: (err as Error).message })
        }
      } finally {
        reply.raw.end()
      }
    }
  )
}
