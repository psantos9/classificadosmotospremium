import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const cadastro = sqliteTable('cadastro', {
  id: text().primaryKey().$defaultFn(() => crypto.randomUUID()),
  createdAt: integer({ mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer({ mode: 'timestamp_ms' }).notNull(),
  cpfCnpj: text().notNull().unique(),
  nomeRazaoSocial: text().notNull(),
  nomeFantasia: text(),
  dataNascimento: text(),
  email: text().notNull().unique(),
  emailValidado: integer(({ mode: 'boolean' })).default(false),
  celular: text().notNull(),
  cep: text().notNull(),
  logradouro: text().notNull(),
  complemento: text().notNull(),
  numero: text(),
  bairro: text().notNull(),
  localidade: text().notNull(),
  uf: text({ length: 2 }).notNull(),
  superadmin: integer({ mode: 'boolean' }).default(false),
  password: text().notNull()
}, _t => [])

export type Cadastro = typeof cadastro.$inferSelect
export type NovoCadastro = typeof cadastro.$inferInsert

export const schema = { cadastro }
