import fp from 'fastify-plugin'
import Database from 'better-sqlite3'
import type { FastifyPluginAsync } from 'fastify'
import { config } from '../../../config/env.js'
import { CREATE_TABLES } from '../../db/schema.js'

const dbPlugin: FastifyPluginAsync = async (app) => {
  const db = new Database(config.dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  db.exec(CREATE_TABLES)

  app.decorate('db', db)
  app.addHook('onClose', () => db.close())
}

export default fp(dbPlugin, { name: 'db' })
