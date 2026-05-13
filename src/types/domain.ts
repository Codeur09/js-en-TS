export type MessageRole = 'user' | 'assistant' | 'system'

export interface Conversation {
  id: number
  title: string
  createdAt: string
}

export interface ConversationSummary extends Conversation {
  messageCount: number
}

export interface ConversationDetail extends Conversation {
  messages: Message[]
}

export interface Message {
  id: number
  conversationId: number
  role: MessageRole
  content: string
  createdAt: string
}

export type OllamaMessage = Pick<Message, 'role' | 'content'>
