import type { OllamaMessage } from '../../entities/message.entity.js'

export interface LLMChunk {
  content?: string
  done: boolean
}

export interface LLMPort {
  chat(messages: OllamaMessage[], signal?: AbortSignal): Promise<string>
  stream(messages: OllamaMessage[], signal?: AbortSignal): AsyncGenerator<LLMChunk>
}
