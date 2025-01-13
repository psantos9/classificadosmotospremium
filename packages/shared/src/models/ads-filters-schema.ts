import { z } from 'zod'

const stringToNumberOrUndefined = z.preprocess((val) => {
  if (typeof val !== 'string') {
    return undefined
  }
  const numberPattern = /\d+/g
  const number = Number.parseInt(val.match(numberPattern)?.join('') ?? '')
  return Number.isNaN(number) ? undefined : number
}, z.number().optional())

export const adsFilterSchema = z.object({
  uf: z.string().nullable().optional().default(null),
  marca: z.string().nullable().optional().default(null),
  anoMinimo: stringToNumberOrUndefined,
  anoMaximo: stringToNumberOrUndefined,
  precoMinimo: stringToNumberOrUndefined,
  precoMaximo: stringToNumberOrUndefined,
  quilometragemMinima: stringToNumberOrUndefined,
  quilometragemMaxima: stringToNumberOrUndefined,
  advertiserType: z.enum(['pf', 'pj']).nullable()
})

export type TAdsFilter = z.infer<typeof adsFilterSchema>
