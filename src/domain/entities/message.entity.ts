export type MessageRole = 'user' | 'assistant' | 'system'

export interface Message {
  id: number
  conversationId: number
  role: MessageRole
  content: string
  createdAt: string
}

export type OllamaMessage = Pick<Message, 'role' | 'content'>
