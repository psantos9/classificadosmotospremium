import type { ContextData, Env } from '@/types'
import type { NovoCadastro } from '@cmp/database/schema'
import { cadastro, schema } from '@cmp/database/schema'
import bcrypt from 'bcryptjs'
import { cnpj, cpf } from 'cpf-cnpj-validator'
import { drizzle } from 'drizzle-orm/d1'
import { z, ZodError } from 'zod'

const novoCadastroSchema = z.object({
  cpfCnpj: z.string().transform(val => val.replace(/\D+/g, '')).refine(val => cpf.isValid(val, true) || cnpj.isValid(val, true), { message: 'invalid cpf or cnpj' }),
  nomeRazaoSocial: z.string(),
  email: z.string().email(),
  celular: z.string(),
  cep: z.string().transform(val => val.replace(/\D+/g, '')).refine(val => val.length === 8, { message: 'cep inválido' }),
  logradouro: z.string(),
  complemento: z.string(),
  numero: z.string().optional(),
  bairro: z.string(),
  cidade: z.string(),
  estado: z.string().length(2),
  password: z.string().superRefine((val, ctx) => {
    const minLength = 10
    const containsUppercase = (val: string) => /[A-Z]/.test(val)
    const containsLowercase = (val: string) => /[a-z]/.test(val)
    const containsNumber = (val: string) => /\d/.test(val)
    const containsSpecialChar = (val: string) =>
      /[`!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?~ ]/.test(val)

    if (val.length < minLength) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `a password deve ter pelo menos ${minLength} caracteres`
      })
    }
    if (!containsUppercase(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `a password deve conter caracteres maísculos`
      })
    }
    if (!containsLowercase(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `a password deve conter caracteres minúsculos`
      })
    }
    if (!containsNumber(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `a password deve conter números`
      })
    }
    if (!containsSpecialChar(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `a password deve conter caracteres especiais \`!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?~`
      })
    }
  })
})

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const db = drizzle(context.env.DB)
  try {
    if (context.request.headers.get('content-type') !== 'application/json') {
      return Response.json({ message: 'unsupported media type' }, { status: 415 })
    }

    const body = await context.request.json()
    const novoCadastro = novoCadastroSchema.parse(body)

    const password: string = bcrypt.hashSync(novoCadastro.password, 10)

    const _cadastro: NovoCadastro = {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...novoCadastro,
      password
    }
    await db.insert(cadastro).values(_cadastro)

    return new Response(null, { status: 200 })
  }
  catch (err) {
    if (err instanceof ZodError) {
      return Response.json({ status: 400, error: err.issues }, { status: 400 })
    }
    else if (err instanceof Error && err.message.includes('D1_ERROR')) {
      if (err.message.includes('UNIQUE constraint failed: cadastro.email')) {
        return Response.json({ status: 409, error: 'já existe uma conta com este email' }, { status: 409 })
      }
      throw err
    }
    else { throw err }
  }
}

export const onRequestGet: PagesFunction<Env, any, ContextData> = async (context) => {
  const db = drizzle(context.env.DB, { schema })
  const cadastros = await db.query.cadastro.findMany()
  return Response.json(cadastros)
}
