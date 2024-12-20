import type { user } from '@cmp/database/schema'

export type User = typeof user.$inferSelect
export type NewUser = typeof user.$inferInsert
