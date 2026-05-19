import type { ConversationRepositoryPort } from '../../domain/ports/out/conversation.repository.port.js'
import type { ListConversationsPort } from '../../domain/ports/in/conversation.use-case.port.js'
import type { ConversationSummary } from '../../domain/entities/conversation.entity.js'

export class ListConversationsUseCase implements ListConversationsPort {
  constructor(private readonly conversations: ConversationRepositoryPort) {}

  execute(): ConversationSummary[] {
    return this.conversations.findAll()
  }
}
