import type { Conversation, ConversationSummary, ConversationDetail } from '../../entities/conversation.entity.js'
import type { LLMChunk } from '../out/llm.port.js'

export interface CreateConversationPort {
  execute(): Conversation
}

export interface ListConversationsPort {
  execute(): ConversationSummary[]
}

export interface GetConversationPort {
  execute(id: number): ConversationDetail
}

export interface DeleteConversationPort {
  execute(id: number): void
}

export interface SendMessagePort {
  execute(conversationId: number, content: string, signal?: AbortSignal): AsyncGenerator<LLMChunk>
}

export interface ChatPort {
  execute(message: string, signal?: AbortSignal): AsyncGenerator<LLMChunk>
  executeOnce(message: string, signal?: AbortSignal): Promise<string>
}
