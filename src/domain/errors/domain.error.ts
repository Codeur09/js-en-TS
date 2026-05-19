export class ConversationNotFoundError extends Error {
  constructor(id: number) {
    super(`Conversation ${id} not found`)
    this.name = 'ConversationNotFoundError'
  }
}
