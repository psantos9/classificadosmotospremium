import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const cadastro = sqliteTable('cadastro', {
  id: text().primaryKey().$defaultFn(() => crypto.randomUUID()),
  createdAt: integer({ mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer({ mode: 'timestamp_ms' }).notNull(),
  cpfCnpj: text().notNull(),
  nomeRazaoSocial: text().notNull(),
  email: text().notNull().unique(),
  celular: text().notNull(),
  cep: text().notNull(),
  logradouro: text().notNull(),
  complemento: text().notNull(),
  numero: text(),
  bairro: text().notNull(),
  cidade: text().notNull(),
  estado: text().notNull(),
  superadmin: integer({ mode: 'boolean' }).default(false),
  password: text().notNull()
}, _t => [])

export type Cadastro = typeof cadastro.$inferSelect
export type NovoCadastro = typeof cadastro.$inferInsert

export const schema = { cadastro }
