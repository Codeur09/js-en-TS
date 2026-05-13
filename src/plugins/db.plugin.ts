import fp from 'fastify-plugin'
import Database from 'better-sqlite3'
import { config } from '../config/env.js'
import { CREATE_TABLES } from '../db/schema.js'
import { ConversationRepository } from '../db/repositories/conversation.repository.js'
import { MessageRepository } from '../db/repositories/message.repository.js'
import type { FastifyPluginAsync } from 'fastify'

const dbPlugin: FastifyPluginAsync = async (app) => {
  const db = new Database(config.dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  db.exec(CREATE_TABLES)

  app.decorate('db', db)
  app.decorate('repos', {
    conversations: new ConversationRepository(db),
    messages: new MessageRepository(db),
  })

  app.addHook('onClose', () => db.close())
}

export default fp(dbPlugin, { name: 'db' })
