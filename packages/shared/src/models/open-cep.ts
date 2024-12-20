import { z } from 'zod'

export const openCEPSchema = z.object({
  cep: z.string().length(9),
  logradouro: z.string(),
  complemento: z.string(),
  bairro: z.string(),
  localidade: z.string(),
  uf: z.string().length(2),
  ibge: z.string()
})

export type OpenCEP = z.infer<typeof openCEPSchema>
