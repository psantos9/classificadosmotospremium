import type { Env } from '@/types'
import { z, ZodError } from 'zod'

const getInvalidCepResponse = () => Response.json({ status: 400, error: 'invalid cep' }, { status: 400 })
const getExternalApiError = () => Response.json({ status: 500, error: 'error while fetching cep' }, { status: 500 })

const openCepResult = z.object({
  cep: z.string().length(9),
  logradouro: z.string(),
  complemento: z.string(),
  bairro: z.string(),
  localidade: z.string(),
  uf: z.string().length(2),
  ibge: z.string()
})

export type OpenCepResult = z.infer<typeof openCepResult>

const cepSchema = z.coerce.number().int().refine(val => val.toString().length === 8)

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const cep = cepSchema.parse(context.params.cep as string)
    const cached = await context.env.CEP.get<OpenCepResult>(cep.toString(), 'json')
    if (cached !== null) {
      return Response.json(cached)
    }
    const response = await fetch(`https://opencep.com/v1/${cep}`)
    if (response.status === 404) {
      return getInvalidCepResponse()
    }
    else if (!response.ok) {
      return getExternalApiError()
    }
    const cepResult = openCepResult.parse(await response.json())
    await context.env.CEP.put(cep.toString(), JSON.stringify(cepResult))
    return Response.json(cepResult)
  }
  catch (err) {
    if (err instanceof ZodError) {
      return getInvalidCepResponse()
    }
    else { throw err }
  }
}
