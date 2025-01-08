import type { schema } from './schema'

export type Usuario = typeof schema.usuario.$inferSelect
export type SelectUsuario = Omit<Usuario, 'password'>
export type NovoUsuario = typeof schema.usuario.$inferInsert

export type Cor = typeof schema.cor.$inferSelect
export type Acessorio = typeof schema.acessorio.$inferSelect
export type InformacaoAdicional = typeof schema.informacaoAdicional.$inferSelect

export type Anuncio = typeof schema.anuncio.$inferSelect
export type NovoAnuncio = typeof schema.anuncio.$inferInsert

export type Mensagem = typeof schema.mensagem.$inferSelect
