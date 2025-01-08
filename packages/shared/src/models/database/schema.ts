import type { AtualizaAnuncio } from '@cmp/shared/models/atualiza-anuncio'
import type { UnauthenticatedMessageSender } from '../unauthenticated-message-sender'
import { anuncioStatusSchema } from '@cmp/shared/models/anuncio-status'
import { relations, sql } from 'drizzle-orm'
import { check, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { anuncioStatusType } from './custom-types'

export const usuario = sqliteTable('usuario', {
  id: integer().primaryKey({ autoIncrement: true }),
  createdAt: integer({ mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer({ mode: 'timestamp' }).notNull().$defaultFn(() => new Date()).$onUpdateFn(() => new Date()),
  locked: integer({ mode: 'boolean' }).$defaultFn(() => false),
  isCnpj: integer({ mode: 'boolean' }).notNull(),
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
  id: integer().primaryKey({ autoIncrement: true }),
  createdAt: integer({ mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer({ mode: 'timestamp' }).notNull().$defaultFn(() => new Date()).$onUpdateFn(() => new Date()),
  expiresAt: integer({ mode: 'timestamp' }),
  publishedAt: integer({ mode: 'timestamp' }),
  userId: integer().notNull().references(() => usuario.id, { onDelete: 'cascade' }),
  status: anuncioStatusType().notNull().default(anuncioStatusSchema.enum.draft),
  revision: integer({ mode: 'number' }).notNull().$defaultFn(() => 0),
  codigoFipe: text().notNull(),
  marca: text().notNull(),
  modelo: text().notNull(),
  anoModelo: integer().notNull(),
  ano: integer().notNull(),
  placa: text().notNull(),
  quilometragem: integer().notNull(),
  preco: integer().notNull(),
  cor: text().notNull(),
  descricao: text(),
  informacoesAdicionais: text({ mode: 'json' }).notNull().$type<string[]>().$defaultFn(() => []),
  acessorios: text({ mode: 'json' }).notNull().$type<string[]>().$defaultFn(() => []),
  fotos: text({ mode: 'json' }).notNull().$type<string[]>().$defaultFn(() => []),
  cep: text().notNull(),
  localidade: text().notNull(),
  uf: text({ length: 2 }).notNull(),
  location: text({ mode: 'json' }).$type<[number, number] | null>().$defaultFn(() => null), // location = [lat, long]
  pj: integer({ mode: 'boolean' }),
  atualizacao: text({ mode: 'json' }).$type<AtualizaAnuncio | null>().$defaultFn(() => null),
  reviewWorkflowId: text()
}), table => [
  check('anuncioStatus', sql.raw(`${table.status.name} IN (${Object.values(anuncioStatusSchema.enum).map(value => `'${value}'`).join(',')})`))
])

export const mensagem = sqliteTable('mensagem', () => ({
  id: integer().primaryKey({ autoIncrement: true }),
  createdAt: integer({ mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  isRead: integer({ mode: 'boolean' }).notNull().$defaultFn(() => false),
  adId: integer().notNull().references(() => anuncio.id, { onDelete: 'cascade' }),
  senderId: integer().references(() => usuario.id, { onDelete: 'cascade' }),
  sender: text({ mode: 'json' }).$type<UnauthenticatedMessageSender | null>().$defaultFn(() => null),
  recipientId: integer().notNull().references(() => usuario.id, { onDelete: 'cascade' }),
  content: text()
}), _table => [])

export const usuarioRelations = relations(usuario, ({ many }) => ({
  anuncios: many(anuncio)
}))

export const anuncioRelations = relations(anuncio, ({ one }) => ({
  cor: one(cor, {
    fields: [anuncio.cor],
    references: [cor.id]
  }),
  usuario: one(usuario, {
    fields: [anuncio.userId],
    references: [usuario.id]
  })
}))

export const schema = {
  usuario,
  cor,
  acessorio,
  informacaoAdicional,
  anuncio,
  mensagem,
  usuarioRelations,
  anuncioRelations
}
