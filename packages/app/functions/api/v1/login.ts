import type { Env } from '@/types'
import { getBearerToken } from '@/helpers/getBearerToken'
import { z, ZodError } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    if (context.request.headers.get('content-type') !== 'application/json') {
      return Response.json({ message: 'unsupported media type' }, { status: 415 })
    }
    const { email, password } = loginSchema.parse(await context.request.json())
    const bearerToken = await getBearerToken({ email, password, db: context.env.DB, apiSecret: context.env.API_SECRET })
    if (bearerToken === null) {
      return new Response(null, { status: 401 })
    }
    else {
      return Response.json({ bearerToken })
    }
  }
  catch (err) {
    if (err instanceof ZodError) {
      return Response.json({ status: 400, error: err.issues }, { status: 400 })
    }
    else { throw err }
  }
}
