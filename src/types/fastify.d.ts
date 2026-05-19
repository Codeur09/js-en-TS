import type Database from 'better-sqlite3'
import type { CreateConversationUseCase } from '../application/use-cases/create-conversation.use-case.js'
import type { ListConversationsUseCase } from '../application/use-cases/list-conversations.use-case.js'
import type { GetConversationUseCase } from '../application/use-cases/get-conversation.use-case.js'
import type { DeleteConversationUseCase } from '../application/use-cases/delete-conversation.use-case.js'
import type { SendMessageUseCase } from '../application/use-cases/send-message.use-case.js'
import type { ChatUseCase } from '../application/use-cases/chat.use-case.js'

declare module 'fastify' {
  interface FastifyInstance {
    db: Database.Database
    useCases: {
      createConversation: CreateConversationUseCase
      listConversations: ListConversationsUseCase
      getConversation: GetConversationUseCase
      deleteConversation: DeleteConversationUseCase
      sendMessage: SendMessageUseCase
      chat: ChatUseCase
    }
  }
}
