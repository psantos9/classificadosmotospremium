import { z } from 'zod'

export const anuncioStatusSchema = z.enum(['draft', 'rejected', 'published', 'paused', 'expired', 'finished', 'archived'])
export type AnuncioStatus = z.infer<typeof anuncioStatusSchema>
