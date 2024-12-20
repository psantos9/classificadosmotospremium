import type { Env } from '@/types'
import { schema } from '@cmp/database/schema'
import bcrypt from 'bcryptjs'
import { drizzle } from 'drizzle-orm/d1'
import { SignJWT } from 'jose'
import { z, ZodError } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const db = drizzle(context.env.DB, { schema })
  try {
    if (context.request.headers.get('content-type') !== 'application/json') {
      return Response.json({ message: 'unsupported media type' }, { status: 415 })
    }

    const { email, password } = loginSchema.parse(await context.request.json())
    const cadastro = await db.query.cadastro.findFirst({ columns: { id: true, password: true }, where: (cadastro, { eq }) => eq(cadastro.email, email) }) ?? null
    if (cadastro === null || await bcrypt.compare(password, cadastro.password) === false) {
      return new Response(null, { status: 401 })
    }

    const iat = new Date().getTime()
    const expirationTime = iat + 3600 * 1e3

    const bearerToken = await new SignJWT()
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(iat)
      .setIssuer('classificados-motos-premium')
      .setSubject(cadastro.id)
      .setExpirationTime(expirationTime)
      .sign(new TextEncoder().encode(context.env.API_SECRET))
    return Response.json({ bearerToken })
  }
  catch (err) {
    if (err instanceof ZodError) {
      return Response.json({ status: 400, error: err.issues }, { status: 400 })
    }
    else { throw err }
  }
}
