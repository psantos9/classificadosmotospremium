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

export const cor = sqliteTable('cor', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  label: text().notNull()
}, _t => [])

export const acessorio = sqliteTable('acessorio', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  label: text().notNull()
}, _t => [])

export const informacaoAdicional = sqliteTable('informacaoAdicional', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  label: text().notNull()
}, _t => [])

export const anuncio = sqliteTable('anuncio', {
  id: text().primaryKey().$defaultFn(() => crypto.randomUUID()),
  createdAt: integer({ mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer({ mode: 'timestamp_ms' }).notNull(),
  codigoFipe: text().notNull(),
  anoModelo: integer().notNull(),
  ano: integer().notNull(),
  quilometragem: integer().notNull(),
  preco: integer().notNull(),
  cor: text().notNull(),
  descricao: text(),
  acessorios: text({ mode: 'json' }).notNull().$type<string[]>(),
  fotos: text({ mode: 'json' }).notNull().$type<string[]>()
}, _t => [])

export type Cadastro = typeof cadastro.$inferSelect
export type SelectCadastro = Omit<Cadastro, 'password'>
export type NovoCadastro = typeof cadastro.$inferInsert

export type Cor = typeof cor.$inferSelect
export type Acessorio = typeof acessorio.$inferSelect
export type InformacaoAdicional = typeof informacaoAdicional.$inferSelect

export type Anuncio = typeof anuncio.$inferSelect
export type NovoAnuncio = Omit<typeof anuncio.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>

export const schema = { cadastro, cor, anuncio }
