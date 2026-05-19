import type { ConversationRepositoryPort } from '../../domain/ports/out/conversation.repository.port.js'
import type { MessageRepositoryPort } from '../../domain/ports/out/message.repository.port.js'
import type { LLMPort, LLMChunk } from '../../domain/ports/out/llm.port.js'
import type { SendMessagePort } from '../../domain/ports/in/conversation.use-case.port.js'
import { ConversationNotFoundError } from '../../domain/errors/domain.error.js'

export class SendMessageUseCase implements SendMessagePort {
  constructor(
    private readonly conversations: ConversationRepositoryPort,
    private readonly messages: MessageRepositoryPort,
    private readonly llm: LLMPort
  ) {}

  async *execute(
    conversationId: number,
    content: string,
    signal?: AbortSignal
  ): AsyncGenerator<LLMChunk> {
    const conv = this.conversations.findById(conversationId)
    if (!conv) throw new ConversationNotFoundError(conversationId)

    const history = this.messages.findByConversation(conversationId)
    if (history.length === 0) {
      this.conversations.updateTitle(conversationId, content.slice(0, 60))
    }

    this.messages.add(conversationId, 'user', content)

    const ollamaMessages = this.messages
      .findByConversation(conversationId)
      .map(({ role, content: c }) => ({ role, content: c }))

    let fullResponse = ''
    for await (const chunk of this.llm.stream(ollamaMessages, signal)) {
      if (chunk.content) fullResponse += chunk.content
      if (chunk.done && fullResponse) {
        this.messages.add(conversationId, 'assistant', fullResponse)
      }
      yield chunk
    }
  }
}
