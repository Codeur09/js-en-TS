import type { LLMPort, LLMChunk } from '../../domain/ports/out/llm.port.js'
import type { ChatPort } from '../../domain/ports/in/conversation.use-case.port.js'

export class ChatUseCase implements ChatPort {
  constructor(private readonly llm: LLMPort) {}

  async executeOnce(message: string, signal?: AbortSignal): Promise<string> {
    return this.llm.chat([{ role: 'user', content: message }], signal)
  }

  async *execute(message: string, signal?: AbortSignal): AsyncGenerator<LLMChunk> {
    yield* this.llm.stream([{ role: 'user', content: message }], signal)
  }
}
