import { z } from 'zod'
import { placaSchema } from './placa'

const REQUIRED_ERROR = 'Obrigatório'

export const getAtualizaAnuncioSchema = () => z.object({
  codigoFipe: z.string({ required_error: REQUIRED_ERROR }),
  marca: z.string({ required_error: REQUIRED_ERROR }),
  modelo: z.string({ required_error: REQUIRED_ERROR }),
  anoModelo: z.number({ required_error: REQUIRED_ERROR }).int('Ano inválido').gt(1900).lte(new Date().getFullYear() + 1, `Menor ou igual a ${new Date().getFullYear() + 1}`),
  ano: z.number({ required_error: REQUIRED_ERROR }).int('Ano inválido').gt(1900, 'Maior do que 1900').lte(new Date().getFullYear() + 1, `Menor ou igual a ${new Date().getFullYear() + 1}`),
  quilometragem: z.number({ required_error: REQUIRED_ERROR, message: 'Quilometragem inválida' }).int('Quilometragem inválida').gte(0),
  placa: placaSchema,
  preco: z.number({ required_error: REQUIRED_ERROR }),
  aceitaTroca: z.boolean({ required_error: REQUIRED_ERROR }),
  cor: z.string({ required_error: REQUIRED_ERROR }),
  descricao: z.string({ required_error: REQUIRED_ERROR }),
  acessorios: z.array(z.string()),
  informacoesAdicionais: z.array(z.string()),
  fotos: z.array(z.string()),
  cep: z.string({ required_error: REQUIRED_ERROR }).transform(val => val.replace(/\D+/g, '')).refine(val => val.length === 8, { message: 'CEP inválido' }),
  localidade: z.string({ required_error: REQUIRED_ERROR }).nonempty(REQUIRED_ERROR),
  uf: z.string({ required_error: REQUIRED_ERROR }).length(2, '2 caracteres'),
  location: z.array(z.number()).optional().nullable(),
  celular: z.string().optional().refine(value => typeof value === 'string' && value ? /^\(\d{2}\) \d{5}-\d{4}$/.test(value ?? '') : true, 'Número inválido!')

})

export type AtualizaAnuncio = z.infer<ReturnType<typeof getAtualizaAnuncioSchema>>
