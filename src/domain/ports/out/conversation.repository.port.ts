import type { Conversation, ConversationSummary } from '../../entities/conversation.entity.js'

export interface ConversationRepositoryPort {
  create(title: string): Conversation
  findAll(): ConversationSummary[]
  findById(id: number): Conversation | undefined
  delete(id: number): boolean
  updateTitle(id: number, title: string): void
}
