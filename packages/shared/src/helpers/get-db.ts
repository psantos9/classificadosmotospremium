import { schema } from '@cmp/shared/models/database/index'
import { drizzle } from 'drizzle-orm/d1'

export const getDb = (db: D1Database) => drizzle(db, { schema, casing: 'snake_case' })
