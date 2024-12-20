import axios, { type Axios, type AxiosError } from 'axios'
import { decodeJwt } from 'jose'

export interface IAPI {
  login: (params: { email: string, password: string }) => Promise<void>
  logout: () => Promise<void>
  validateEmail: (email: string) => Promise<boolean>
}

const getAxiosInstance = (params: { baseURL: string, ctx: API }) => {
  const { baseURL, ctx } = params
  const instance = axios.create({ baseURL, timeout: 5000 })
  instance.interceptors.response.use(res => res, async (error: AxiosError) => {
    if (error?.response?.status === 401) {
      await ctx.logout()
    }
  })
  return instance
}

export class API implements IAPI {
  private axios: Axios
  bearerTokenTimeout: ReturnType<typeof setTimeout> | null = null

  constructor(params: { baseURL: string }) {
    const { baseURL } = params
    this.axios = getAxiosInstance({ baseURL, ctx: this })
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

  async login(params: { email: string, password: string }) {
    const bearerToken = await this.axios.post<{ bearerToken: string }>('/api/v1/login', params)
      .then(({ data: { bearerToken } }) => bearerToken)
    this._setAuthorizationHeader(bearerToken)
    const claims = decodeJwt(bearerToken)
    const { exp = null } = claims
    if (exp !== null) {
      const delta = exp - new Date().getTime()
      if (delta > 0) {
        this.bearerTokenTimeout = setTimeout(async () => this.login(params), delta * 0.8)
      }
    }
  }

  async logout() {
    if (this.bearerTokenTimeout !== null) {
      clearTimeout(this.bearerTokenTimeout)
      this.bearerTokenTimeout = null
    }
    this._setAuthorizationHeader(null)
  }

  async validateEmail(email: string) {
    const exists = await this.axios.post<{ exists: boolean }>('/api/v1/cadastro/verificar', { email })
      .then(({ data: { exists } }) => exists)
    return exists
  }
}
