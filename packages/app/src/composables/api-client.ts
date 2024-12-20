import axios, { type Axios, type AxiosError } from 'axios'
import Emittery from 'emittery'
import { decodeJwt } from 'jose'

export const API_PERSISTENCE_KEY = 'CPM:SESSION'

export class UnauthorizedError extends Error {
  constructor() {
    super('401 - Unauthorized')
    Object.setPrototypeOf(this, UnauthorizedError.prototype)
  }
}

export enum APIClientEvent {
  SIGNED_IN = 'signedIn'
}

export interface APIClientEventMap {
  [APIClientEvent.SIGNED_IN]: boolean
}

export interface IAPIClient {
  signedIn: boolean
  login: (params: { email: string, password: string }) => Promise<void>
  logout: () => Promise<void>
  validateEmail: (email: string) => Promise<boolean>
}

const getAxiosInstance = (params: { baseURL: string, ctx: APIClient }) => {
  const { baseURL, ctx } = params
  const instance = axios.create({ baseURL, timeout: 5000 })
  instance.interceptors.response.use(res => res, async (error: AxiosError) => {
    if (error?.response?.status === 401) {
      await ctx.logout()
      throw new UnauthorizedError()
    }
  })
  return instance
}

export class APIClient extends Emittery<APIClientEventMap> implements IAPIClient {
  private axios: Axios
  private _signedIn: boolean = false

  constructor(params: { baseURL: string }) {
    super()
    const { baseURL } = params
    this.axios = getAxiosInstance({ baseURL, ctx: this })
    this.on(APIClientEvent.SIGNED_IN, (value) => {
      this._signedIn = value
    })
    this._fetchToken()
  }

  private _setAuthorizationHeader(bearerToken: string | null) {
    this.axios.interceptors.request.use((config) => {
      if (bearerToken === null) {
        delete config.headers.Authorization
      }
      else {
        config.headers.Authorization = `Bearer ${bearerToken}`
      }
      return config
    })
  }

  private _persistToken(bearerToken: string) {
    const claims = decodeJwt(bearerToken)
    const { exp = null } = claims
    if (exp !== null && exp > new Date().getTime()) {
      window.sessionStorage.setItem(API_PERSISTENCE_KEY, JSON.stringify({ bearerToken, exp }))
    }
  }

  private _fetchToken() {
    const bearerToken = window.sessionStorage.getItem(API_PERSISTENCE_KEY)
    if (bearerToken !== null) {
      const claims = decodeJwt(bearerToken)
      const now = new Date().getTime()
      const { exp = now } = claims
      const delta = exp - now
      if (delta > 10 * 60 * 1e3) {
        this._setAuthorizationHeader(bearerToken)
        void this.emit(APIClientEvent.SIGNED_IN, true)
      }
      else {
        window.sessionStorage.removeItem(API_PERSISTENCE_KEY)
        void this.emit(APIClientEvent.SIGNED_IN, false)
      }
    }
  }

  get signedIn() {
    return this._signedIn
  }

  async login(params: { email: string, password: string }) {
    const bearerToken = await this.axios.post<{ bearerToken: string }>('/api/v1/login', params)
      .then(({ data: { bearerToken } }) => bearerToken)
    this._setAuthorizationHeader(bearerToken)
    this._persistToken(bearerToken)
    await this.emit(APIClientEvent.SIGNED_IN, true)
  }

  async logout() {
    this._setAuthorizationHeader(null)
    window.sessionStorage.removeItem(API_PERSISTENCE_KEY)
    await this.emit(APIClientEvent.SIGNED_IN, false)
  }

  async validateEmail(email: string) {
    const exists = await this.axios.post<{ exists: boolean }>('/api/v1/cadastro/verificar', { email })
      .then(({ data: { exists } }) => exists)
    return exists
  }
}
