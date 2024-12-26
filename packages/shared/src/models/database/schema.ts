import { relations, sql } from 'drizzle-orm'
import { check, customType, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export enum AnuncioStatus {
  DRAFT = 'draft',
  TO_REVIEW = 'to_review',
  REJECTED = 'rejected',
  PUBLISHED = 'published',
  PAUSED = 'paused',
  EXPIRED = 'expired'
}

export const anuncioStatus = customType<{ data: AnuncioStatus, notNull: true, default: true }>({
  dataType() {
    return 'text'
  },
  fromDriver(value) {
    if (typeof value === 'string' && Object.values(AnuncioStatus).includes(value as AnuncioStatus)) {
      return value as AnuncioStatus
    }
    throw new Error(`Invalid cadastro status value ${value}}`)
  }
})

export const cadastro = sqliteTable('cadastro', {
  id: text().primaryKey().$defaultFn(() => crypto.randomUUID()),
  createdAt: integer({ mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer({ mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`).$onUpdateFn(() => new Date()),
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

export const informacaoAdicional = sqliteTable('informacao_adicional', {
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  label: text().notNull()
}, _t => [])

export const anuncio = sqliteTable('anuncio', {
  id: text().primaryKey().$defaultFn(() => crypto.randomUUID()),
  createdAt: integer({ mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer({ mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`).$onUpdateFn(() => new Date()),
  publishedAt: integer({ mode: 'timestamp' }),
  userId: text().references(() => cadastro.id, { onDelete: 'cascade' }).notNull(),
  status: anuncioStatus().notNull().default(AnuncioStatus.DRAFT),
  codigoFipe: text().notNull(),
  anoModelo: integer().notNull(),
  ano: integer().notNull(),
  placa: text().notNull(),
  quilometragem: integer().notNull(),
  preco: integer().notNull(),
  cor: integer().notNull(),
  descricao: text(),
  acessorios: text({ mode: 'json' }).notNull().$type<number[]>(),
  fotos: text({ mode: 'json' }).notNull().$type<string[]>()
}, table => [
  check('anuncioStatus', sql.raw(`${table.status.name} IN (${Object.values(AnuncioStatus).map(value => `'${value}'`).join(',')})`))
])

// Relations
export const cadastroRelations = relations(cadastro, ({ many }) => ({
  anuncios: many(anuncio)
}))

export const anuncioRelations = relations(anuncio, ({ one }) => ({
  cadastro: one(cadastro)
}))

// Types
export type Cadastro = typeof cadastro.$inferSelect
export type SelectCadastro = Omit<Cadastro, 'password'>
export type NovoCadastro = typeof cadastro.$inferInsert

export type Cor = typeof cor.$inferSelect
export type Acessorio = typeof acessorio.$inferSelect
export type InformacaoAdicional = typeof informacaoAdicional.$inferSelect

export type Anuncio = typeof anuncio.$inferSelect
export type NovoAnuncio = typeof anuncio.$inferInsert

export const schema = { cadastro, cor, anuncio }
