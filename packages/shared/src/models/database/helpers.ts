import { getTableColumns } from 'drizzle-orm'
import { anuncio } from './schema'

export const getPublicAdColumns = () => {
  const { userId, atualizacao, reviewWorkflowId, expiresAt, publishedAt, revision, ...anuncioColumns } = getTableColumns(anuncio)
  return anuncioColumns
}
