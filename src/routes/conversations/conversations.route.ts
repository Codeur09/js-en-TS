import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import type { FastifyPluginAsync } from 'fastify'
import { LLMService, LLMError } from '../../services/llm.service.js'
import {
  IdParam,
  SendMessageBody,
  ConversationSchema,
  ConversationDetailSchema,
} from './conversations.schema.js'
import { Type } from '@sinclair/typebox'

const llm = new LLMService()

export const conversationsRoute: FastifyPluginAsync = async (app) => {
  const f = app.withTypeProvider<TypeBoxTypeProvider>()

  f.post(
    '/conversations',
    { schema: { response: { 201: ConversationSchema } } },
    async (_, reply) => {
      const conv = app.repos.conversations.create('Nouvelle conversation')
      return reply.status(201).send({ ...conv, messageCount: 0 })
    }
  )

  f.get(
    '/conversations',
    { schema: { response: { 200: Type.Array(ConversationSchema) } } },
    async () => app.repos.conversations.findAll()
  )

  f.get(
    '/conversations/:id',
    {
      schema: {
        params: IdParam,
        response: { 200: ConversationDetailSchema },
      },
    },
    async (request, reply) => {
      const conv = app.repos.conversations.findById(request.params.id)
      if (!conv) return reply.notFound(`Conversation ${request.params.id} introuvable`)
      const messages = app.repos.messages.findByConversation(conv.id)
      return { ...conv, messages }
    }
  )

  f.delete(
    '/conversations/:id',
    { schema: { params: IdParam } },
    async (request, reply) => {
      const deleted = app.repos.conversations.delete(request.params.id)
      if (!deleted) return reply.notFound(`Conversation ${request.params.id} introuvable`)
      return reply.status(204).send()
    }
  )

  f.post(
    '/conversations/:id/messages',
    {
      schema: {
        params: IdParam,
        body: SendMessageBody,
      },
    },
    async (request, reply) => {
      const { id: convId } = request.params
      const conv = app.repos.conversations.findById(convId)
      if (!conv) return reply.notFound(`Conversation ${convId} introuvable`)

      const { message } = request.body

      const history = app.repos.messages.findByConversation(convId)
      if (history.length === 0) {
        app.repos.conversations.updateTitle(convId, message.slice(0, 60))
      }

      app.repos.messages.add(convId, 'user', message)

      const ollamaMessages = app.repos.messages
        .findByConversation(convId)
        .map(({ role, content }) => ({ role, content }))

      const controller = new AbortController()

      try {
        const generator = llm.stream(ollamaMessages, controller.signal)
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

        let fullResponse = ''

        const processChunk = (chunk: { message?: { content: string }; done: boolean }): void => {
          if (chunk.message?.content) {
            fullResponse += chunk.message.content
            sendEvent({ type: 'token', value: chunk.message.content })
          }
          if (chunk.done) {
            app.repos.messages.add(convId, 'assistant', fullResponse)
            sendEvent({ type: 'done' })
          }
        }

        processChunk(first.value)

        for await (const chunk of generator) {
          processChunk(chunk)
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
