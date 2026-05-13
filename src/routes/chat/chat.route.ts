import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import type { FastifyPluginAsync } from 'fastify'
import { LLMService, LLMError } from '../../services/llm.service.js'
import { ChatBody, ChatResponse, ErrorResponse } from './chat.schema.js'

const llm = new LLMService()

export const chatRoute: FastifyPluginAsync = async (app) => {
  const f = app.withTypeProvider<TypeBoxTypeProvider>()

  f.post(
    '/chat',
    {
      schema: {
        body: ChatBody,
        response: { 200: ChatResponse, 502: ErrorResponse },
      },
    },
    async (request, reply) => {
      try {
        const content = await llm.chat([{ role: 'user', content: request.body.message }])
        return { response: content }
      } catch (err) {
        if (err instanceof LLMError) {
          request.log.error({ status: err.statusCode, body: err.body }, 'Ollama error')
          return reply.status(502).send({ error: 'Ollama request failed' })
        }
        throw err
      }
    }
  )

  f.post(
    '/chat/stream',
    { schema: { body: ChatBody } },
    async (request, reply) => {
      const controller = new AbortController()

      try {
        const generator = llm.stream(
          [{ role: 'user', content: request.body.message }],
          controller.signal
        )

        // Vérification que Ollama répond avant d'ouvrir le SSE
        const first = await generator.next()
        if (first.done) return

        request.raw.once('close', () => controller.abort())

        reply.raw.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no',
        })

        const sendEvent = (payload: object): void => {
          reply.raw.write(`data: ${JSON.stringify(payload)}\n\n`)
        }

        if (first.value.message?.content) {
          sendEvent({ type: 'token', value: first.value.message.content })
        }
        if (first.value.done) {
          sendEvent({ type: 'done' })
        }

        for await (const chunk of generator) {
          if (chunk.message?.content) {
            sendEvent({ type: 'token', value: chunk.message.content })
          }
          if (chunk.done) {
            sendEvent({ type: 'done' })
          }
        }
      } catch (err) {
        if (err instanceof LLMError) {
          request.log.error({ status: err.statusCode, body: err.body }, 'Ollama error')
          return reply.status(502).send({ error: 'Ollama request failed' })
        }
        if ((err as Error).name !== 'AbortError') {
          request.log.error(err, 'Streaming error')
          reply.raw.write(`data: ${JSON.stringify({ type: 'error', message: (err as Error).message })}\n\n`)
        }
      } finally {
        reply.raw.end()
      }
    }
  )
}
