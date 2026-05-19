import type { Message, MessageRole } from '../../entities/message.entity.js'

export interface MessageRepositoryPort {
  findByConversation(conversationId: number): Message[]
  add(conversationId: number, role: MessageRole, content: string): Message
}
