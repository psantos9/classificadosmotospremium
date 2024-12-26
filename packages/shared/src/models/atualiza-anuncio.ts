import { z } from 'zod'
import { placaSchema } from './placa'

export const getAtualizaAnuncioSchema = () => z.object({
  codigoFipe: z.string(),
  anoModelo: z.number({ required_error: 'Obrigatório' }).int('Ano inválido').gt(1900).lte(new Date().getFullYear() + 1, `Menor ou igual a ${new Date().getFullYear() + 1}`),
  ano: z.coerce.number({ required_error: 'Obrigatório' }).int('Ano inválido').gt(1900, 'Maior do que 1900').lte(new Date().getFullYear() + 1, `Menor ou igual a ${new Date().getFullYear() + 1}`),
  quilometragem: z.number({ required_error: 'Obrigatório', message: 'Quilometragem inválida' }).int('Quilometragem inválida').gte(0),
  placa: placaSchema,
  preco: z.number(),
  cor: z.number(),
  descricao: z.string(),
  acessorios: z.array(z.number()),
  informacoesAdicionais: z.array(z.number()),
  fotos: z.array(z.string())
})

export type AtualizaAnuncio = z.infer<ReturnType<typeof getAtualizaAnuncioSchema>>
