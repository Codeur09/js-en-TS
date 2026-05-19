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

import type { Message } from './message.entity.js'
