import { z } from 'zod'

export const placaSchema = z.string({ required_error: 'Obrigatório' }).refine(val => val.replace(/ /g, '').toUpperCase().match(/[A-Z]{3}\d[0-9A-Z]\d{2}/) !== null, 'Placa inválida').transform(val => val.replace(/ /g, '').toUpperCase().toUpperCase())
