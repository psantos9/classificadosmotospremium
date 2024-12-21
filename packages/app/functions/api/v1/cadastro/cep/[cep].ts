import type { Env } from '@/types'
import { type OpenCEP, openCEPSchema } from '@cmp/shared/models/open-cep'
import { z, ZodError } from 'zod'

const getInvalidCepResponse = () => Response.json({ status: 404, error: 'invalid cep' }, { status: 404 })
const getExternalApiError = () => Response.json({ status: 500, error: 'error while fetching cep' }, { status: 500 })

const cepSchema = z.string().transform(val => Number.parseInt(val.replace(/\D+/g, ''))).refine(val => val.toString().length === 8)

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const cep = cepSchema.parse(context.params.cep as string)
    const cached = await context.env.CEP.get<OpenCEP>(cep.toString(), 'json')
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
    const cepResult = openCEPSchema.parse(await response.json())
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
