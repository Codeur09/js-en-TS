import type Database from 'better-sqlite3'
import type { ConversationRepository } from '../db/repositories/conversation.repository.js'
import type { MessageRepository } from '../db/repositories/message.repository.js'

declare module 'fastify' {
  interface FastifyInstance {
    db: Database.Database
    repos: {
      conversations: ConversationRepository
      messages: MessageRepository
    }
  }
}
