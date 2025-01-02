import type { schema } from './index'

export type Cadastro = typeof schema.cadastro.$inferSelect
export type SelectCadastro = Omit<Cadastro, 'password'>
export type NovoCadastro = typeof schema.cadastro.$inferInsert

export type Cor = typeof schema.cor.$inferSelect
export type Acessorio = typeof schema.acessorio.$inferSelect
export type InformacaoAdicional = typeof schema.informacaoAdicional.$inferSelect

export type Anuncio = Omit<typeof schema.anuncio.$inferSelect, 'userId'>
export type NovoAnuncio = typeof schema.anuncio.$inferInsert

export type PublicAd = Omit<Anuncio, 'userId' | 'atualizacao' | 'reviewWorkflowId' | 'expiresAt' | 'publishedAd' | 'revision'>
