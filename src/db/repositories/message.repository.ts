import type Database from 'better-sqlite3'
import type { Message } from '../../types/domain.js'

export class MessageRepository {
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

  add(conversationId: number, role: string, content: string): Message {
    return this.stmts.add.get(conversationId, role, content) as Message
  }
}
