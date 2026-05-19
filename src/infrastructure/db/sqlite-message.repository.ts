import type Database from 'better-sqlite3'
import type { MessageRepositoryPort } from '../../domain/ports/out/message.repository.port.js'
import type { Message, MessageRole } from '../../domain/entities/message.entity.js'

export class SqliteMessageRepository implements MessageRepositoryPort {
  private readonly stmts: {
    findByConversation: Database.Statement<[number], Message>
    add: Database.Statement<[number, string, string], Message>
  }

  constructor(db: Database.Database) {
    this.stmts = {
      findByConversation: db.prepare<[number], Message>(
        'SELECT * FROM messages WHERE conversationId = ? ORDER BY id'
      ),
      add: db.prepare<[number, string, string], Message>(
        'INSERT INTO messages (conversationId, role, content) VALUES (?, ?, ?) RETURNING *'
      ),
    }
  }

  findByConversation(conversationId: number): Message[] {
    return this.stmts.findByConversation.all(conversationId)
  }

  add(conversationId: number, role: MessageRole, content: string): Message {
    return this.stmts.add.get(conversationId, role, content) as Message
  }
}
