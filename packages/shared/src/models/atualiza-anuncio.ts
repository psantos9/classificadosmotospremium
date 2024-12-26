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
  cor: z.number({ required_error: REQUIRED_ERROR }),
  descricao: z.string({ required_error: REQUIRED_ERROR }),
  acessorios: z.array(z.number()),
  informacoesAdicionais: z.array(z.number()),
  fotos: z.array(z.string())
})

export type AtualizaAnuncio = z.infer<ReturnType<typeof getAtualizaAnuncioSchema>>
