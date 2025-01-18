import type { schema } from './schema'

export type Usuario = typeof schema.usuario.$inferSelect
export type SelectUsuario = Omit<Usuario, 'password'>
export type NovoUsuario = typeof schema.usuario.$inferInsert

export type Anuncio = typeof schema.anuncio.$inferSelect
export type NovoAnuncio = typeof schema.anuncio.$inferInsert

export type Mensagem = typeof schema.mensagem.$inferSelect
