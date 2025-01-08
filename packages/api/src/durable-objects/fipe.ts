import type { AnoModelo, CodigoTipoCombustivel, Marca, Modelo, Preco, Tabela } from '@cmp/api/clients/fipe-api-client'
import type { Env } from '@cmp/api/types'
import { CodigoTipoVeiculo, FipeApiClient } from '@cmp/api/clients/fipe-api-client'
import { firstDayOfNextMonth } from '@cmp/api/helpers/first-day-of-next-month'
import { getMonthCode } from '@cmp/api/helpers/get-month-code'
import { DurableObject } from 'cloudflare:workers'

export enum FIPE_CLIENT_STORAGE_PREFIX {
  TABLES = 'TABLES',
  MAKE_INDEX = 'MAKE_INDEX',
  MODEL_INDEX = 'MODEL_INDEX',
  MODEL_YEARS = 'MODEL_YEARS',
  MODEL_PRICE = 'MODEL_PRICE'
}

export type Tabelas = Array<Tabela>
export interface IndiceMarcas { [codigoTipoVeiculo: string]: Marca[] }
export interface IndiceModelosPorMarca {
  tabelaReferencia: number
  indiceModelos: { [codigoTipoVeiculo: string]: Modelo[] }
}
export interface AnosModelo {
  tabelaReferencia: number
  anosModelo: AnoModelo[]
}

export interface PrecoModelo {
  tabelaReferencia: number
  preco: Preco
}

export const getModelsStorageKey = (codigoMarca: number) => `${FIPE_CLIENT_STORAGE_PREFIX.MODEL_INDEX}:${codigoMarca}`
export const getModelYearsStorageKey = (params: { codigoMarca: number, codigoModelo: number, codigoTipoVeiculo: CodigoTipoVeiculo }) => `${FIPE_CLIENT_STORAGE_PREFIX.MODEL_YEARS}:${params.codigoMarca}:${params.codigoModelo}:${params.codigoTipoVeiculo}`
export const getModelPriceStorageKey = (params: { codigoMarca: number, codigoModelo: number, codigoTipoVeiculo: CodigoTipoVeiculo, anoModelo: number, codigoTipoCombustivel: CodigoTipoCombustivel }) => {
  const { codigoMarca, codigoModelo, codigoTipoVeiculo, anoModelo, codigoTipoCombustivel } = params
  return `${FIPE_CLIENT_STORAGE_PREFIX.MODEL_PRICE}:${codigoMarca}:${codigoModelo}:${codigoTipoVeiculo}:${anoModelo}:${codigoTipoCombustivel}`
}

export class FipeClient extends DurableObject<Env> {
  api: FipeApiClient = new FipeApiClient()
  private _tables: Tabelas = []
  private _makeIndex: IndiceMarcas = {}

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
    this.ctx.blockConcurrencyWhile(async () => {
      await this._loadState()
      await this._updateRemoteState()
      if (await this.ctx.storage.getAlarm() === null) {
        await this.ctx.storage.setAlarm(firstDayOfNextMonth())
      }
    })
  }

  async alarm() {
    await this._updateRemoteState(true)
    await this.ctx.storage.setAlarm(firstDayOfNextMonth())
  }

  get latestTable(): Tabela | null {
    return this._tables[0] ?? null
  }

  getTables() {
    return this._tables
  }

  getMakes(codigoTipoVeiculo: CodigoTipoVeiculo) {
    return this._makeIndex[codigoTipoVeiculo] ?? []
  }

  async getModelsByMake(codigoMarca: number, codigoTipoVeiculo: CodigoTipoVeiculo) {
    const codigoTabelaReferencia = this._tables[0].codigoTabela ?? null
    if (codigoTabelaReferencia === null) {
      throw new Error('codigo tabela referencia nulo')
    }
    const storageKey = getModelsStorageKey(codigoMarca)
    let index = await this.ctx.storage.get<IndiceModelosPorMarca>(storageKey) ?? null
    if (index === null || index.tabelaReferencia !== this._tables[0].codigoTabela || !index.indiceModelos[codigoTipoVeiculo]) {
      const { modelos } = await this.api.getModels({ codigoTipoVeiculo, codigoTabelaReferencia, codigoMarca })
      if (index?.tabelaReferencia !== this._tables[0].codigoTabela) {
        index = { tabelaReferencia: codigoTabelaReferencia, indiceModelos: {} }
      }
      index.indiceModelos[codigoTipoVeiculo] = modelos

      await this.ctx.storage.put(storageKey, index)
    }
    return index.indiceModelos[codigoTipoVeiculo]
  }

  async getModelYears(params: { codigoMarca: number, codigoModelo: number, codigoTipoVeiculo: CodigoTipoVeiculo }) {
    const { codigoMarca, codigoModelo, codigoTipoVeiculo } = params
    const codigoTabelaReferencia = this._tables[0].codigoTabela ?? null
    if (codigoTabelaReferencia === null) {
      throw new Error('codigo tabela referencia nulo')
    }
    const storageKey = getModelYearsStorageKey({ codigoMarca, codigoModelo, codigoTipoVeiculo })
    let entry = await this.ctx.storage.get<AnosModelo>(storageKey) ?? null
    if (entry === null || entry.tabelaReferencia !== this._tables[0].codigoTabela) {
      const anosModelo = await this.api.getYearsModel({ codigoTipoVeiculo, codigoTabelaReferencia, codigoMarca, codigoModelo })
      entry = { tabelaReferencia: codigoTabelaReferencia, anosModelo }
      await this.ctx.storage.put(storageKey, entry)
    }
    return entry.anosModelo
  }

  async getPriceForModel(params: { codigoMarca: number, codigoModelo: number, codigoTipoVeiculo: CodigoTipoVeiculo, anoModelo: number, codigoTipoCombustivel: CodigoTipoCombustivel }) {
    const { codigoMarca, codigoModelo, codigoTipoCombustivel, anoModelo, codigoTipoVeiculo } = params
    const codigoTabelaReferencia = this._tables[0].codigoTabela ?? null
    if (codigoTabelaReferencia === null) {
      throw new Error('codigo tabela referencia nulo')
    }
    const storageKey = getModelPriceStorageKey({ codigoMarca, codigoModelo, codigoTipoCombustivel, codigoTipoVeiculo, anoModelo })
    let precoModelo = await this.ctx.storage.get<PrecoModelo>(storageKey) ?? null
    if (precoModelo?.tabelaReferencia !== codigoTabelaReferencia) {
      const preco = await this.api.getPriceForModelYear({ codigoTipoVeiculo, codigoMarca, codigoModelo, anoModelo, codigoTabelaReferencia, codigoTipoCombustivel })
      if (preco === null) {
        return null
      }
      precoModelo = { tabelaReferencia: codigoTabelaReferencia, preco }
      await this.ctx.storage.put(storageKey, precoModelo)
    }

    return precoModelo.preco
  }

  private async _loadState() {
    const [tables = [], makeIndex = {}] = await Promise.all([
      this.ctx.storage.get<Tabelas>(FIPE_CLIENT_STORAGE_PREFIX.TABLES),
      this.ctx.storage.get<IndiceMarcas>(FIPE_CLIENT_STORAGE_PREFIX.MAKE_INDEX)
    ])
    this._tables = tables
    this._makeIndex = makeIndex
  }

  private async _fetchTables() {
    const sortingKey: keyof Tabela = 'mesReferencia'
    const tables = (await this.api.getTables())
      .sort(({ [sortingKey]: A }, { [sortingKey]: B }) => A > B ? -1 : A < B ? 1 : 0)
    return tables
  }

  private async _fetchMakes(codigoTabelaReferencia: number) {
    const makeIndex: { [codigoTipoVeiculo: string]: Marca[] } = {}

    for (const codigoTipoVeiculo in CodigoTipoVeiculo) {
      if (Number.isNaN(Number(codigoTipoVeiculo))) {
        continue
      }
      const marcas = await this.api.getMakes({ codigoTabelaReferencia, codigoTipoVeiculo: codigoTipoVeiculo as unknown as CodigoTipoVeiculo })
      makeIndex[codigoTipoVeiculo] = marcas
    }
    return makeIndex
  }

  private async _updateRemoteState(force?: boolean) {
    const currentMonthCode = getMonthCode()
    const tables = await this._fetchTables()
    const [latestTable] = tables
    if (this.latestTable === null || latestTable.mesReferencia !== currentMonthCode || force) {
      const makeIndex = await this._fetchMakes(latestTable.codigoTabela)
      await Promise.all([
        this.ctx.storage.put(FIPE_CLIENT_STORAGE_PREFIX.TABLES, tables),
        this.ctx.storage.put(FIPE_CLIENT_STORAGE_PREFIX.MAKE_INDEX, makeIndex)
      ])
      this._tables = tables
      this._makeIndex = makeIndex
    }
  }

  static getStub(env: Env) {
    const id = env.FIPE_DO.idFromName('fipe-client')
    const stub = env.FIPE_DO.get(id)
    return stub
  }
}
