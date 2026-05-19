import type { ConversationRepositoryPort } from '../../domain/ports/out/conversation.repository.port.js'
import type { MessageRepositoryPort } from '../../domain/ports/out/message.repository.port.js'
import type { GetConversationPort } from '../../domain/ports/in/conversation.use-case.port.js'
import type { ConversationDetail } from '../../domain/entities/conversation.entity.js'
import { ConversationNotFoundError } from '../../domain/errors/domain.error.js'

export class GetConversationUseCase implements GetConversationPort {
  constructor(
    private readonly conversations: ConversationRepositoryPort,
    private readonly messages: MessageRepositoryPort
  ) {}

  execute(id: number): ConversationDetail {
    const conv = this.conversations.findById(id)
    if (!conv) throw new ConversationNotFoundError(id)
    return { ...conv, messages: this.messages.findByConversation(id) }
  }
}
