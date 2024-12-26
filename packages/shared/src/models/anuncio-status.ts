import { z } from 'zod'

export const anuncioStatusSchema = z.enum(['draft', 'to_review', 'rejected', 'published', 'paused', 'expired'])
export type AnuncioStatus = z.infer<typeof anuncioStatusSchema>
