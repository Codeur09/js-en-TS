import type { ConversationRepositoryPort } from '../../domain/ports/out/conversation.repository.port.js'
import type { CreateConversationPort } from '../../domain/ports/in/conversation.use-case.port.js'
import type { Conversation } from '../../domain/entities/conversation.entity.js'

export class CreateConversationUseCase implements CreateConversationPort {
  constructor(private readonly conversations: ConversationRepositoryPort) {}

  execute(): Conversation {
    return this.conversations.create('Nouvelle conversation')
  }
}
