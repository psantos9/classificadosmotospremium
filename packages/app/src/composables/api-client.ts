import type { Cadastro } from '@cmp/database/schema'
import type { AtualizaCadastro } from '@cmp/shared/models/atualiza-cadastro'
import type { NovoCadastro } from '@cmp/shared/models/novo-cadastro'
import type { OpenCEP } from '@cmp/shared/models/open-cep'
import axios, { type Axios, AxiosError } from 'axios'
import Emittery from 'emittery'
import { decodeJwt } from 'jose'

export const API_PERSISTENCE_KEY = 'CPM:SESSION'

export class UnauthorizedError extends Error {
  constructor() {
    super('401 - Unauthorized')
    Object.setPrototypeOf(this, UnauthorizedError.prototype)
  }
}

export class CpfCnpjConflictError extends Error {
  constructor() {
    super()
    Object.setPrototypeOf(this, CpfCnpjConflictError.prototype)
  }
}

export class EmailConflictError extends Error {
  constructor() {
    super()
    Object.setPrototypeOf(this, EmailConflictError.prototype)
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
  validateCEP: (cep: string) => Promise<OpenCEP | null>
  criaNovoCadastro: (cadastro: NovoCadastro) => Promise<void>
  fetchCadastro: () => Promise<Omit<Cadastro, 'password' | 'confirmPassword'>>
}

const getAxiosInstance = (params: { baseURL: string, ctx: APIClient }) => {
  const { baseURL, ctx } = params
  const instance = axios.create({ baseURL, timeout: 5000 })
  instance.interceptors.response.use(res => res, async (error: AxiosError) => {
    if (error?.response?.status === 401) {
      await ctx.logout()
      throw new UnauthorizedError()
    }
    throw error
  })
  return instance
}

export class APIClient extends Emittery<APIClientEventMap> implements IAPIClient {
  private axios: Axios
  private _signedIn: boolean = false
  private _authInterceptor: number | null = null

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
    if (this._authInterceptor !== null) {
      this.axios.interceptors.request.eject(this._authInterceptor)
      this._authInterceptor = null
    }
    if (bearerToken !== null) {
      this._authInterceptor = this.axios.interceptors.request.use((config) => {
        config.headers.Authorization = `Bearer ${bearerToken}`
        return config
      })
    }
  }

  private getTokenExpirationDeltaSeconds(exp: null | number) {
    const delta = exp === null ? -1 : exp - (Math.round(new Date().getTime() / 1e3))
    return delta
  }

  private _persistToken(bearerToken: string) {
    const claims = decodeJwt(bearerToken)
    const { exp = null } = claims
    if (this.getTokenExpirationDeltaSeconds(exp) > 0) {
      window.sessionStorage.setItem(API_PERSISTENCE_KEY, bearerToken)
    }
  }

  private _deleteToken() {
    window.sessionStorage.removeItem(API_PERSISTENCE_KEY)
  }

  private _fetchToken() {
    const bearerToken = window.sessionStorage.getItem(API_PERSISTENCE_KEY)
    if (bearerToken !== null) {
      const claims = decodeJwt(bearerToken)
      const { exp = null } = claims
      if (this.getTokenExpirationDeltaSeconds(exp) > 10 * 60) {
        this._setAuthorizationHeader(bearerToken)
        void this.emit(APIClientEvent.SIGNED_IN, true)
      }
      else {
        this._setAuthorizationHeader(null)
        this._deleteToken()
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
    this._deleteToken()
    await this.emit(APIClientEvent.SIGNED_IN, false)
  }

  async validateEmail(email: string) {
    const exists = await this.axios.post<{ exists: boolean }>('/api/v1/cadastro/verificar', { email })
      .then(({ data: { exists } }) => exists)
    return exists
  }

  async validateCEP(cep: string) {
    const openCEP = await this.axios.get<OpenCEP>(`/api/v1/cadastro/cep/${cep}`)
      .then(({ data }) => data)
      .catch((err) => {
        if (err instanceof AxiosError && err.status === 404) {
          return null
        }
        else { throw err }
      })
    return openCEP
  }

  async criaNovoCadastro(cadastro: NovoCadastro) {
    const bearerToken = await this.axios.post<{ bearerToken: string }>('/api/v1/cadastro', cadastro)
      .then(({ data: { bearerToken } }) => bearerToken)
      .catch((err) => {
        if (err instanceof AxiosError && err.status === 409) {
          const errorMessage = (err?.response?.data as { error: string }).error ?? null
          if (errorMessage.includes('conflito:email')) {
            throw new EmailConflictError()
          }
          else if (errorMessage.includes('conflito:cpfCnpj')) {
            throw new CpfCnpjConflictError()
          }
        }
        throw err
      })
    this._setAuthorizationHeader(bearerToken)
    this._persistToken(bearerToken)
    await this.emit(APIClientEvent.SIGNED_IN, true)
  }

  async atualizaCadastro(params: { id: string, cadastro: AtualizaCadastro }) {
    const { id, cadastro } = params
    const cadastroAtualizado = await this.axios.put<Omit<Cadastro, 'password'>>(`/api/v1/cadastro/${btoa(id)}`, cadastro)
      .then(({ data }) => data)
      .catch((err) => {
        if (err instanceof AxiosError && err.status === 409) {
          const errorMessage = (err?.response?.data as { error: string }).error ?? null
          if (errorMessage.includes('conflito:email')) {
            throw new EmailConflictError()
          }
          else if (errorMessage.includes('conflito:cpfCnpj')) {
            throw new CpfCnpjConflictError()
          }
        }
        throw err
      })
    return cadastroAtualizado
  }

  async fetchCadastro() {
    this._fetchToken()
    const cadastro = await this.axios.get<Omit<Cadastro, 'password'>>(`/api/v1/cadastro/usuario`)
      .then(({ data }) => data)
    return cadastro
  }
}
