import type { D1Database } from '@cloudflare/workers-types'
import { schema } from '@cmp/shared/models/database/schema'
import { drizzle } from 'drizzle-orm/d1'

export const getDb = (db: D1Database) => drizzle(db, { schema, casing: 'snake_case' })
export { schema }
