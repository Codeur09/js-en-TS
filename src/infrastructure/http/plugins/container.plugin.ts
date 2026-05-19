import fp from 'fastify-plugin'
import type { FastifyPluginAsync } from 'fastify'
import { SqliteConversationRepository } from '../../db/sqlite-conversation.repository.js'
import { SqliteMessageRepository } from '../../db/sqlite-message.repository.js'
import { OllamaAdapter } from '../../llm/ollama.adapter.js'
import { CreateConversationUseCase } from '../../../application/use-cases/create-conversation.use-case.js'
import { ListConversationsUseCase } from '../../../application/use-cases/list-conversations.use-case.js'
import { GetConversationUseCase } from '../../../application/use-cases/get-conversation.use-case.js'
import { DeleteConversationUseCase } from '../../../application/use-cases/delete-conversation.use-case.js'
import { SendMessageUseCase } from '../../../application/use-cases/send-message.use-case.js'
import { ChatUseCase } from '../../../application/use-cases/chat.use-case.js'

const containerPlugin: FastifyPluginAsync = async (app) => {
  const conversationRepo = new SqliteConversationRepository(app.db)
  const messageRepo = new SqliteMessageRepository(app.db)
  const llm = new OllamaAdapter()

  app.decorate('useCases', {
    createConversation: new CreateConversationUseCase(conversationRepo),
    listConversations: new ListConversationsUseCase(conversationRepo),
    getConversation: new GetConversationUseCase(conversationRepo, messageRepo),
    deleteConversation: new DeleteConversationUseCase(conversationRepo),
    sendMessage: new SendMessageUseCase(conversationRepo, messageRepo, llm),
    chat: new ChatUseCase(llm),
  })
}

export default fp(containerPlugin, { name: 'container', dependencies: ['db'] })
