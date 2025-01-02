import { getTableColumns } from 'drizzle-orm'
import * as tables from './tables'

export const getPublicAdColumns = () => {
  const { userId, atualizacao, reviewWorkflowId, expiresAt, publishedAt, revision, ...anuncioColumns } = getTableColumns(tables.anuncio)
  return anuncioColumns
}
