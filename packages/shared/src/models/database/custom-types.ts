import { type AnuncioStatus, anuncioStatusSchema } from '@cmp/shared/models/anuncio-status'
import { customType } from 'drizzle-orm/sqlite-core'

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
