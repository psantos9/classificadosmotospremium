import { ErrorHandler } from '@cmp/api/helpers/error-handler'
import { parse } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { z, ZodError } from 'zod'

export enum CodigoTipoVeiculo {
  CARRO = 1,
  MOTO = 2,
  CAMINHAO = 3
}

export enum CodigoTipoCombustivel {
  GASOLINA = 1,
  DIESEL = 3
}

export interface IFipeClient {}

const tabelaSchema = z.object({ Codigo: z.coerce.number(), Mes: z.string() })
  .transform(({ Codigo: codigoTabela, Mes: mesTabela }) => {
    const dataReferencia = parse(mesTabela.trim(), 'LLLL\'/\'yyyy', new Date(), { locale: ptBR })
    const ano = dataReferencia.getFullYear()
    const mes = (dataReferencia.getMonth() + 1).toLocaleString('pt-BR', { minimumIntegerDigits: 2 })
    const mesReferencia = Number.parseInt(`${ano}${mes}`)
    return {
      codigoTabela,
      mesReferencia
    }
  })
export type Tabela = z.infer<typeof tabelaSchema>

const marcaSchema = z.object({ Label: z.string(), Value: z.coerce.number() }).transform(({ Label: marca, Value: codigoMarca }) => ({ codigoMarca, marca: marca.toUpperCase() }))
export type Marca = z.infer<typeof marcaSchema>

const modeloSchema = z.object({ Label: z.string(), Value: z.coerce.number() }).transform(({ Label: modelo, Value: codigoModelo }) => ({ modelo, codigoModelo }))
export type Modelo = z.infer<typeof modeloSchema>

const anoSchema = z.object({ Label: z.coerce.number(), Value: z.string() }).transform(({ Label }) => Label)
export type Ano = z.infer<typeof anoSchema>

const modelsPayloadSchema = z.object({
  Modelos: z.array(modeloSchema),
  Anos: z.array(anoSchema)
}).transform(({ Modelos: modelos, Anos: anos }) => ({ modelos, anos }))

const anoModeloRegex = /(\d{4})-(\d)/
const anoModeloSchema = z.object({ Label: z.string(), Value: z.string().refine(value => anoModeloRegex.test(value), 'ano modelo inválido') })
  .transform(({ Value: anoModelo }) => {
    const match = anoModeloRegex.exec(anoModelo)
    if (match === null) {
      throw new Error('ano modelo invalido')
    }
    const [, ano, tipoCombustivel] = match
    return { anoModelo: Number.parseInt(ano), codigoTipoCombustivel: Number.parseInt(tipoCombustivel) as CodigoTipoCombustivel }
  })
export type AnoModelo = z.infer<typeof anoModeloSchema>

export const precoSchema = z.object({
  AnoModelo: z.number(),
  Autenticacao: z.string(),
  CodigoFipe: z.string(),
  Combustivel: z.string(),
  DataConsulta: z.string(),
  Marca: z.string(),
  MesReferencia: z.string().transform((value) => {
    const dataReferencia = parse(value.trim(), 'LLLL \'de\' yyyy', new Date(), { locale: ptBR })
    const ano = dataReferencia.getFullYear()
    const mes = (dataReferencia.getMonth() + 1).toLocaleString('pt-BR', { minimumIntegerDigits: 2 })
    const mesReferencia = Number.parseInt(`${ano}${mes}`)
    return mesReferencia
  }),
  Modelo: z.string(),
  SiglaCombustivel: z.string(),
  TipoVeiculo: z.number(),
  Valor: z.string().transform(value => Number.parseInt(value.replace(/R\$ /g, '').replace(/\./g, '')))
}).transform(({ AnoModelo, Autenticacao, CodigoFipe, Combustivel, DataConsulta, Marca, MesReferencia, Modelo, SiglaCombustivel, TipoVeiculo, Valor }) => {
  return {
    anoModelo: AnoModelo,
    autenticacao: Autenticacao,
    codigoFipe: CodigoFipe,
    combustivel: Combustivel,
    codigoTipoCombustível: FipeApiClient.getCodigoTipoCombustivel(SiglaCombustivel),
    dataConsulta: DataConsulta,
    tipoVeiculo: TipoVeiculo,
    marca: Marca,
    modelo: Modelo,
    mesReferencia: MesReferencia,
    precoBRL: Valor
  }
})
export type Preco = z.infer<typeof precoSchema>

const errorPayloadSchema = z.object({ codigo: z.string(), erro: z.string() })

export class FipeClientError extends Error {
  code?: number
  constructor(message: string, code?: number) {
    super(message)
    this.name = 'FipeClientError'
    this.code = code
  }
}

export class FipeApiClient extends ErrorHandler implements IFipeClient {
  private _baseURL = 'https://veiculos.fipe.org.br'

  constructor() {
    super()
  }

  private _buildURL(pathname: string) {
    const url = new URL(this._baseURL)
    url.pathname = `/api/veiculos/${pathname}`
    return url
  }

  defaultErrorHandler(err: unknown, fn: typeof Function) {
    if (err instanceof FipeClientError) {
      throw err
    }
    let errorMessage = 'something went wrong'
    if (err instanceof Error) {
      errorMessage = `${fn.name}: ${err.message}`
    }
    throw new FipeClientError(errorMessage)
  }

  static getTipoVeiculo(codigoTipoVeiculo: CodigoTipoVeiculo) {
    switch (codigoTipoVeiculo) {
      case CodigoTipoVeiculo.CARRO:
        return 'carro'
      case CodigoTipoVeiculo.MOTO:
        return 'moto'
      case CodigoTipoVeiculo.CAMINHAO:
        return 'caminhao'
    }
  }

  static getCodigoTipoCombustivel(codigoTipoCombustivel: string) {
    switch (codigoTipoCombustivel) {
      case 'G':
        return CodigoTipoCombustivel.GASOLINA
      case 'D':
        return CodigoTipoCombustivel.DIESEL
      default:
        return '?'
    }
  }

  async getTables() {
    const pathname = 'ConsultarTabelaDeReferencia'
    const url = this._buildURL(pathname)

    const response = await fetch(url, { method: 'post' })

    if (!response.ok) {
      throw new FipeClientError(await response.text(), response.status)
    }
    else {
      const payload = JSON.parse(await response.text())
      try {
        const tables = z.array(tabelaSchema).parse(payload)
        return tables
      }
      catch (err) {
        if (err instanceof ZodError) {
          const { erro, codigo } = errorPayloadSchema.parse(payload)
          throw new Error(`codigo=${codigo} erro=${erro}`)
        }
        else { throw err }
      }
    }
  }

  async getMakes(params: { codigoTabelaReferencia: number, codigoTipoVeiculo: CodigoTipoVeiculo }) {
    const pathname = 'ConsultarMarcas'
    const url = this._buildURL(pathname)
    const response = await fetch(url, {
      method: 'post',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json'
      },
      body: JSON.stringify(params)
    })
    if (!response.ok) {
      throw new FipeClientError(await response.text(), response.status)
    }
    else {
      const payload = JSON.parse(await response.text())
      try {
        const marcas = z.array(marcaSchema).parse(payload)
        return marcas
      }
      catch (err) {
        if (err instanceof ZodError) {
          const { erro, codigo } = errorPayloadSchema.parse(payload)
          throw new Error(`codigo=${codigo} erro=${erro}`)
        }
        else { throw err }
      }
    }
  }

  async getModels(params: { codigoTipoVeiculo: CodigoTipoVeiculo, codigoTabelaReferencia: number, codigoMarca: number }) {
    const pathname = 'ConsultarModelos'
    const url = this._buildURL(pathname)
    const response = await fetch(url, {
      method: 'post',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json'
      },
      body: JSON.stringify(params)
    })
    if (!response.ok) {
      throw new FipeClientError(await response.text(), response.status)
    }
    else {
      const payload = JSON.parse(await response.text())
      try {
        const models = modelsPayloadSchema.parse(payload)
        return models
      }
      catch (err) {
        if (err instanceof ZodError) {
          const { erro, codigo } = errorPayloadSchema.parse(payload)
          throw new Error(`codigo=${codigo} erro=${erro}`)
        }
        else { throw err }
      }
    }
  }

  async getYearsModel(params: { codigoTipoVeiculo: CodigoTipoVeiculo, codigoTabelaReferencia: number, codigoMarca: number, codigoModelo: number }) {
    const pathname = 'ConsultarAnoModelo'
    const url = this._buildURL(pathname)
    const response = await fetch(url, {
      method: 'post',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json'
      },
      body: JSON.stringify(params)
    })
    if (!response.ok) {
      throw new FipeClientError(await response.text(), response.status)
    }
    else {
      const payload = JSON.parse(await response.text())
      try {
        const years = z.array(anoModeloSchema).parse(payload)
        return years
      }
      catch (err) {
        if (err instanceof ZodError) {
          const { erro, codigo } = errorPayloadSchema.parse(payload)
          throw new Error(`codigo=${codigo} erro=${erro}`)
        }
        else { throw err }
      }
    }
  }

  async getPriceForModelYear(params: { codigoTipoVeiculo: CodigoTipoVeiculo, codigoTabelaReferencia: number, codigoMarca: number, codigoModelo: number, anoModelo: number, codigoTipoCombustivel: CodigoTipoCombustivel }) {
    const pathname = 'ConsultarValorComTodosParametros'
    const url = this._buildURL(pathname)
    const tipoVeiculo = FipeApiClient.getTipoVeiculo(params.codigoTipoVeiculo)
    const tipoConsulta = 'tradicional'
    const response = await fetch(url, {
      method: 'post',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json'
      },
      body: JSON.stringify({ ...params, tipoVeiculo, tipoConsulta })
    })
    if (!response.ok) {
      throw new FipeClientError(await response.text(), response.status)
    }
    else {
      const payload = JSON.parse(await response.text())
      try {
        const years = precoSchema.parse(payload)
        return years
      }
      catch (err) {
        if (err instanceof ZodError) {
          const { erro, codigo } = errorPayloadSchema.parse(payload)
          if (erro === 'nadaencontrado') {
            return null
          }
          throw new Error(`codigo=${codigo} erro=${erro}`)
        }
        else {
          throw err
        }
      }
    }
  }
}
