import type { schema } from './schema'

export type Usuario = typeof schema.usuario.$inferSelect
export type SelectUsuario = Omit<Usuario, 'password'>
export type NovoUsuario = typeof schema.usuario.$inferInsert

export type Cor = typeof schema.cor.$inferSelect
export type Acessorio = typeof schema.acessorio.$inferSelect
export type InformacaoAdicional = typeof schema.informacaoAdicional.$inferSelect

export type Anuncio = Omit<typeof schema.anuncio.$inferSelect, 'userId'>
export type NovoAnuncio = typeof schema.anuncio.$inferInsert

export type PublicAd = Omit<Anuncio, 'userId' | 'atualizacao' | 'reviewWorkflowId' | 'expiresAt' | 'publishedAd' | 'revision'> & { cor: Cor, usuario: { nomeRazaoSocial: string, nomeFantasia: string | null, cep: string, localidade: string, uf: string, createdAt: string } }
