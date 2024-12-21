import { cnpj, cpf } from 'cpf-cnpj-validator'
import { z } from 'zod'

const requiredError = 'Obrigatório'

export const atualizaCadastroSchema = z.object({
  cpfCnpj: z.string({ required_error: requiredError }).transform(val => val.replace(/\D+/g, '')).refine(val => cpf.isValid(val, true) || cnpj.isValid(val, true), { message: 'CPF ou CNPJ inválido' }),
  nomeRazaoSocial: z.string({ required_error: requiredError }).nonempty(requiredError),
  dataNascimento: z.string({ required_error: requiredError }).date('Data inválida').optional(),
  nomeFantasia: z.string({ required_error: requiredError }).optional(),
  email: z.string({ required_error: requiredError }).email('E-mail inválido'),
  celular: z.string({ required_error: requiredError }).nonempty(requiredError).transform(val => val.replace(/\D+/g, '')),
  cep: z.string({ required_error: requiredError }).transform(val => val.replace(/\D+/g, '')).refine(val => val.length === 8, { message: 'CEP inválido' }),
  logradouro: z.string({ required_error: requiredError }).nonempty(requiredError),
  complemento: z.string({ required_error: requiredError }),
  numero: z.string().optional(),
  bairro: z.string({ required_error: requiredError }).nonempty(requiredError),
  localidade: z.string({ required_error: requiredError }).nonempty(requiredError),
  uf: z.string({ required_error: requiredError }).length(2, '2 caracteres')
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
  return !hasIssues
})

export type AtualizaCadastro = z.infer<typeof atualizaCadastroSchema>
