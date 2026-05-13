import type Database from 'better-sqlite3'
import type { Conversation, ConversationSummary } from '../../types/domain.js'

export class ConversationRepository {
  private readonly stmts: {
    create: Database.Statement<[string], Conversation>
    list: Database.Statement<[], ConversationSummary>
    findById: Database.Statement<[number], Conversation>
    delete: Database.Statement<[number]>
    updateTitle: Database.Statement<[string, number]>
  }

  constructor(db: Database.Database) {
    this.stmts = {
      create: db.prepare<[string], Conversation>(
        'INSERT INTO conversations (title) VALUES (?) RETURNING *'
      ),
      list: db.prepare<[], ConversationSummary>(`
        SELECT c.id, c.title, c.createdAt,
               COUNT(m.id) AS messageCount
        FROM conversations c
        LEFT JOIN messages m ON m.conversationId = c.id
        GROUP BY c.id ORDER BY c.createdAt DESC
      `),
      findById: db.prepare<[number], Conversation>(
        'SELECT * FROM conversations WHERE id = ?'
      ),
      delete: db.prepare<[number]>(
        'DELETE FROM conversations WHERE id = ?'
      ),
      updateTitle: db.prepare<[string, number]>(
        'UPDATE conversations SET title = ? WHERE id = ?'
      ),
    }
  }

  create(title: string): Conversation {
    return this.stmts.create.get(title) as Conversation
  }

  findAll(): ConversationSummary[] {
    return this.stmts.list.all()
  }

  findById(id: number): Conversation | undefined {
    return this.stmts.findById.get(id)
  }

  delete(id: number): boolean {
    return this.stmts.delete.run(id).changes > 0
  }

  updateTitle(id: number, title: string): void {
    this.stmts.updateTitle.run(title, id)
  }
}
