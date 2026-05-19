import type { ConversationRepositoryPort } from '../../domain/ports/out/conversation.repository.port.js'
import type { DeleteConversationPort } from '../../domain/ports/in/conversation.use-case.port.js'
import { ConversationNotFoundError } from '../../domain/errors/domain.error.js'

export class DeleteConversationUseCase implements DeleteConversationPort {
  constructor(private readonly conversations: ConversationRepositoryPort) {}

  execute(id: number): void {
    const deleted = this.conversations.delete(id)
    if (!deleted) throw new ConversationNotFoundError(id)
  }
}
