import type { Env } from '@/types'
import type { OpenCEP } from '@cmp/shared/models/open-cep'

export class OpencageError extends Error {
  constructor(m: string) {
    super(m)
    Object.setPrototypeOf(this, OpencageError.prototype)
  }
}

export interface IOpencageAnnotations {
  DMS: { lat: string, lng: string }
  MGRS: string
  Maidenhead: string
  Mercator: { x: number, y: number }
  OSM: { note_url: string }
  UN_M49: {
    regions: Record<string, string>
  }
  callingcode: number
  currency: {
    decimal_mark: string
    html_entity: string
    iso_code: string
  }
  flag: string
  geohash: string
  qibla: string
}

export interface IOpencageResult {
  confidence: number
  formatted: string
  geometry: { lat: number, lng: number }
  annotations: IOpencageAnnotations

}
export interface IOpencageResponse {
  results: Array<IOpencageResult>
}

export class OpencageService {
  private _apiKey: string
  constructor(apiKey: string) {
    this._apiKey = apiKey
  }

  async fetchCepCoordinates(cep: OpenCEP) {
    const { logradouro, localidade, uf } = cep
    const query = `${logradouro}, ${localidade} - ${uf}, ${cep.cep}, Brazil`
    const url = new URL('https://api.opencagedata.com/geocode/v1/json')
    url.searchParams.set('key', this._apiKey)
    url.searchParams.set('q', query)
    const response = await fetch(url)
    const data = await response.json()
    if (response.status !== 200 || !response.ok) {
      throw new OpencageError(`${response.status} ${JSON.stringify(data)}`)
    }
    const { results } = data as IOpencageResponse
    const result = results
      .find(result => result.formatted.includes(cep.cep))
    return result?.geometry ?? null
  }

  static getInstance(env: Env) {
    const instance = new OpencageService(env.OPENCAGE_API_KEY)
    return instance
  }
}
