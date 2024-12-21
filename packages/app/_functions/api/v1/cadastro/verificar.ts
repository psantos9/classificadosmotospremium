import type { Env } from '@/types'
import { cadastro } from '@cmp/database/schema'
import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { z, ZodError } from 'zod'

const bodySchema = z.object({ email: z.string().email() })

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const db = drizzle(context.env.DB)
  try {
    if (context.request.headers.get('content-type') !== 'application/json') {
      return Response.json({ message: 'unsupported media type' }, { status: 415 })
    }
    const body = await context.request.json()
    const { email } = bodySchema.parse(body)
    const { isExist } = await db.get<{ isExist: number }>(sql`SELECT EXISTS (SELECT 1 from ${cadastro} where ${cadastro.email} = ${email}) as isExist`)
    return Response.json({ exists: isExist === 1 })
  }
  catch (err) {
    if (err instanceof ZodError) {
      return Response.json({ status: 400, error: err.issues }, { status: 400 })
    }
    else { throw err }
  }
}
