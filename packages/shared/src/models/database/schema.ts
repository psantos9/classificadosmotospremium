import type { AnuncioStatus } from '@cmp/shared/models/anuncio-status'
import { anuncioStatusSchema } from '@cmp/shared/models/anuncio-status'
import { relations, sql } from 'drizzle-orm'
import { check, customType, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const anuncioStatusType = customType<{ data: AnuncioStatus, notNull: true, default: true }>({
  dataType() {
    return 'text'
  },
  fromDriver(value) {
    if (typeof value === 'string' && Object.values(anuncioStatusSchema.enum).includes(value as AnuncioStatus)) {
      return value as AnuncioStatus
    }
    throw new Error(`Invalid cadastro status value ${value}}`)
  }
})

export const cadastro = sqliteTable('cadastro', {
  id: text().primaryKey().$defaultFn(() => crypto.randomUUID()),
  createdAt: integer({ mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer({ mode: 'timestamp' }).notNull().$defaultFn(() => new Date()).$onUpdateFn(() => new Date()),
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

export const cor = sqliteTable('cor', ({
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  label: text().notNull()
}), _t => [])

export const acessorio = sqliteTable('acessorio', () => ({
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  label: text().notNull()
}), _t => [])

export const informacaoAdicional = sqliteTable('informacao_adicional', () => ({
  id: integer({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  label: text().notNull()
}), _t => [])

export const anuncio = sqliteTable('anuncio', () => ({
  id: text().primaryKey().$defaultFn(() => crypto.randomUUID()),
  createdAt: integer({ mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer({ mode: 'timestamp' }).notNull().$defaultFn(() => new Date()).$onUpdateFn(() => new Date()),
  publishedAt: integer({ mode: 'timestamp' }),
  userId: text().references(() => cadastro.id, { onDelete: 'cascade' }).notNull(),
  status: anuncioStatusType().notNull().default(anuncioStatusSchema.enum.draft),
  codigoFipe: text().notNull(),
  marca: text().notNull(),
  modelo: text().notNull(),
  anoModelo: integer().notNull(),
  ano: integer().notNull(),
  placa: text().notNull(),
  quilometragem: integer().notNull(),
  preco: integer().notNull(),
  cor: integer().notNull(),
  descricao: text(),
  informacoesAdicionais: text({ mode: 'json' }).notNull().$type<number[]>().$defaultFn(() => []),
  acessorios: text({ mode: 'json' }).notNull().$type<number[]>().$defaultFn(() => []),
  fotos: text({ mode: 'json' }).notNull().$type<string[]>().$defaultFn(() => [])
}), table => [
  check('anuncioStatus', sql.raw(`${table.status.name} IN (${Object.values(anuncioStatusSchema.enum).map(value => `'${value}'`).join(',')})`))
])

// Relations
export const cadastroRelations = relations(cadastro, ({ many }) => ({
  anuncios: many(anuncio)
}))

export const anuncioRelations = relations(anuncio, ({ one }) => ({
  cadastro: one(cadastro)
}))

export const schema = { cadastro, cor, acessorio, informacaoAdicional, anuncio }

// Types
export type Cadastro = typeof schema.cadastro.$inferSelect
export type SelectCadastro = Omit<Cadastro, 'password'>
export type NovoCadastro = typeof schema.cadastro.$inferInsert

export type Cor = typeof schema.cor.$inferSelect
export type Acessorio = typeof schema.acessorio.$inferSelect
export type InformacaoAdicional = typeof schema.informacaoAdicional.$inferSelect

export type Anuncio = typeof schema.anuncio.$inferSelect
export type NovoAnuncio = typeof schema.anuncio.$inferInsert
