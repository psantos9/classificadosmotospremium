import { cnpj, cpf } from 'cpf-cnpj-validator'
import { format, parse } from 'date-fns'
import { z } from 'zod'

const requiredError = 'Obrigatório'

export const passwordSchema = z.string({ required_error: requiredError }).superRefine((val, ctx) => {
  const minLength = 10
  const containsUppercase = (val: string) => /[A-Z]/.test(val)
  const containsLowercase = (val: string) => /[a-z]/.test(val)
  const containsNumber = (val: string) => /\d/.test(val)
  const containsSpecialChar = (val: string) =>
    /[`!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?~ ]/.test(val)

  let hasIssues = false
  if (val.length < minLength) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['password'],
      message: `A password deve ter pelo menos ${minLength} caracteres`
    })
    hasIssues = true
  }
  if (!containsUppercase(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['password'],
      message: `A password deve conter caracteres maísculos`
    })
    hasIssues = true
  }
  if (!containsLowercase(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['password'],
      message: `A password deve conter caracteres minúsculos`
    })
    hasIssues = true
  }
  if (!containsNumber(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['password'],
      message: `A password deve conter números`
    })
    hasIssues = true
  }
  if (!containsSpecialChar(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['password'],
      message: `A password deve conter 1 símbolo \`!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?~`
    })
    hasIssues = true
  }
  return !hasIssues
})

export const confirmPasswordSchema = z.string({ required_error: requiredError })

export const novoCadastroSchema = z.object({
  cpfCnpj: z.string({ required_error: requiredError }).transform(val => val.replace(/\D+/g, '')).refine(val => cpf.isValid(val, true) || cnpj.isValid(val, true), { message: 'CPF ou CNPJ inválido' }),
  nomeRazaoSocial: z.string({ required_error: requiredError }).nonempty(requiredError),
  dataNascimento: z.string({ required_error: requiredError }).refine((value) => {
    let timestamp = parse(value, 'dd/MM/yyyy', new Date()).getTime()
    if (Number.isNaN(timestamp)) {
      timestamp = parse(value, 'yyyy-MM-dd', new Date()).getTime()
      if (Number.isNaN(timestamp)) {
        return false
      }
    }
    return timestamp < new Date().getTime()
  }, 'Data inválida').optional().transform((value) => {
    if (typeof value === 'string') {
      let date = parse(value, 'yyyy-MM-dd', new Date())
      if (!Number.isNaN(date.getTime())) {
        date = parse(value, 'dd/MM/yyyy', new Date())
        value = format(date, 'yyyy-MM-dd')
      }
    }
    return value
  }),
  nomeFantasia: z.string({ required_error: requiredError }).optional(),
  email: z.string({ required_error: requiredError }).email('E-mail inválido').transform(value => value.toLowerCase()),
  celular: z.string({ required_error: requiredError }).nonempty(requiredError).transform(val => val.replace(/\D+/g, '')),
  cep: z.string({ required_error: requiredError }).transform(val => val.replace(/\D+/g, '')).refine(val => val.length === 8, { message: 'CEP inválido' }),
  logradouro: z.string({ required_error: requiredError }).nonempty(requiredError),
  complemento: z.string({ required_error: requiredError }),
  numero: z.string().optional(),
  bairro: z.string({ required_error: requiredError }).nonempty(requiredError),
  localidade: z.string({ required_error: requiredError }).nonempty(requiredError),
  uf: z.string({ required_error: requiredError }).length(2),
  password: passwordSchema,
  confirmPassword: confirmPasswordSchema
}).superRefine((val, ctx) => {
  const pf = cpf.isValid(val.cpfCnpj)
  const pj = cnpj.isValid(val.cpfCnpj)
  let hasIssues = false
  if (pf && !val.dataNascimento) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['dataNascimento'], message: 'Data de Nascimento inválida' })
    hasIssues = true
  }
  else if (pj && !val.nomeFantasia) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['nomeFantasia'], message: 'Obrigatório' })
    hasIssues = true
  }

  if (val.password !== val.confirmPassword) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['password', 'confirmPassword'], message: 'As senhas são diferentes' })
    hasIssues = true
  }
  return !hasIssues
})

export type NovoCadastro = z.infer<typeof novoCadastroSchema>
