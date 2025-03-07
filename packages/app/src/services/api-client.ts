import type { AnoModelo, CodigoTipoCombustivel, Marca, Modelo, Preco } from '@cmp/api/clients/fipe-api-client'
import type { GetMessageQueryParams } from '@cmp/api/routes/api/v1/messages'
import type { AnuncioStatus } from '@cmp/shared/models/anuncio-status'
import type { AtualizaAnuncio } from '@cmp/shared/models/atualiza-anuncio'
import type { AtualizaUsuario } from '@cmp/shared/models/atualiza-usuario'
import type { Anuncio, Mensagem, SelectUsuario, Usuario } from '@cmp/shared/models/database/models'
import type { NovoUsuario } from '@cmp/shared/models/novo-usuario'
import type { OpenCEP } from '@cmp/shared/models/open-cep'
import type { IThread } from '@cmp/shared/models/thread'
import type { IThreadMessage } from '@cmp/shared/models/thread-message'
import type { TAdDocument, TAdsSearchResponse, TSellerDocument } from '@cmp/shared/models/typesense'
import type { UnauthenticatedMessageSender } from '@cmp/shared/models/unauthenticated-message-sender'
import type { SearchParams } from 'typesense/lib/Typesense/Documents'
import { useMixpanel } from '@/composables/useMixpanel'
import { computeFileHash } from '@/helpers/computeFileSha256'
import axios, { type Axios, AxiosError, type AxiosProgressEvent } from 'axios'
import Emittery from 'emittery'
import { decodeJwt } from 'jose'
import { attach as retryAttach } from 'retry-axios'

const { trackSignUp, trackSendMessageToAdPublisher } = useMixpanel()

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
  login: (params: { email: string, password: string, token: string }) => Promise<void>
  logout: () => Promise<void>
  validateEmail: (params: { email: string, token: string }) => Promise<boolean>
  validateCEP: (cep: string) => Promise<OpenCEP | null>
  criaNovoUsuario: (params: { usuario: NovoUsuario, token: string }) => Promise<void>
  fetchUsuario: () => Promise<SelectUsuario>
}

const getAxiosInstance = (params: { baseURL: string, ctx: APIClient }) => {
  const { baseURL, ctx } = params
  const instance = axios.create({ baseURL, timeout: 30000 })
  instance.interceptors.response.use(res => res, async (error: AxiosError) => {
    if (error?.response?.status === 401) {
      await ctx.logout()
      throw new UnauthorizedError()
    }
    throw error
  })

  instance.defaults.raxConfig = {
    instance,
    retry: 8,
    backoffType: 'exponential'
  }

  retryAttach(instance)
  return instance
}

export class APIClient extends Emittery<APIClientEventMap> implements IAPIClient {
  readonly axios: Axios
  private _userId: string | null = null
  private _signedIn: boolean = false
  private _authInterceptor: number | null = null
  private _bearerToken: string | null = null
  readonly baseURL: string

  constructor(params: { baseURL: string }) {
    super()
    const { baseURL } = params
    this.baseURL = baseURL
    this.axios = getAxiosInstance({ baseURL, ctx: this })
    this.on(APIClientEvent.SIGNED_IN, (value) => {
      this._signedIn = value
    })
  }

  private _setAuthorizationHeader(bearerToken: string | null) {
    this._bearerToken = bearerToken
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

  get bearerToken() {
    return this._bearerToken
  }

  get userId() {
    return this._userId
  }

  private getTokenExpirationDeltaSeconds(exp: null | number) {
    const delta = exp === null ? -1 : exp - (Math.round(new Date().getTime() / 1e3))
    return delta
  }

  private _persistToken(bearerToken: string) {
    const claims = decodeJwt(bearerToken)
    const { exp = null, sub } = claims
    if (typeof sub === 'string') {
      this._userId = sub
    }
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
      const { exp = null, sub } = claims
      if (typeof sub === 'string') {
        this._userId = sub
      }
      if (this.getTokenExpirationDeltaSeconds(exp) > 10 * 60) {
        this._setAuthorizationHeader(bearerToken)
        void this.emit(APIClientEvent.SIGNED_IN, true)
      }
      else {
        this._userId = null
        this._setAuthorizationHeader(null)
        this._deleteToken()
        void this.emit(APIClientEvent.SIGNED_IN, false)
      }
    }
  }

  get signedIn() {
    return this._signedIn
  }

  init() {
    this._fetchToken()
  }

  async login(params: { email: string, password: string, token: string }) {
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

  async validateEmail(params: { email: string, token: string }) {
    const { email, token } = params
    const exists = await this.axios.post<{ exists: boolean }>('/api/v1/login/check', { email, token })
      .then(({ data: { exists } }) => exists)
    return exists
  }

  async validateCEP(cep: string) {
    const openCEP = await this.axios.get<OpenCEP>(`/api/v1/cep/${cep}`)
      .then(({ data }) => data)
      .catch((err) => {
        if (err instanceof AxiosError && err.status === 404) {
          return null
        }
        else { throw err }
      })
    return openCEP
  }

  async criaNovoUsuario(params: { usuario: NovoUsuario, token: string }) {
    const { usuario, token } = params
    const bearerToken = await this.axios.post<{ bearerToken: string }>('/api/v1/signup', { usuario, token })
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
    trackSignUp()
  }

  async atualizaUsuario(params: { id: number, usuario: AtualizaUsuario }) {
    const { id, usuario } = params
    const usuarioAtualizado = await this.axios.put<Omit<Usuario, 'password'>>(`/api/v1/users/${id}`, usuario)
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
    return usuarioAtualizado
  }

  async atualizaSenha(params: { currentPassword: string, password: string }) {
    try {
      await this.axios.put<void>('/api/v1/users/password', params)
    }
    catch (err) {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          throw new UnauthorizedError()
        }
      }
      throw err
    }
  }

  async fetchUsuario() {
    const usuario = await this.axios.get<SelectUsuario>('/api/v1/users')
      .then(({ data }) => data)
    return usuario
  }

  async fetchMarcas() {
    const marcas = await this.axios.get<Marca[]>(`/api/v1/fipe/marcas`)
      .then(({ data }) => data)
    return marcas
  }

  async fetchModelos(codigoMarca: number) {
    const modelos = await this.axios.get<Modelo[]>(`/api/v1/fipe/marcas/${codigoMarca}/modelos`)
      .then(({ data }) => data)
    return modelos
  }

  async fetchAnosModelos(params: { codigoMarca: number, codigoModelo: number }) {
    const { codigoMarca, codigoModelo } = params
    const anosModelo = await this.axios.get<AnoModelo[]>(`/api/v1/fipe/marcas/${codigoMarca}/modelos/${codigoModelo}/anos`)
      .then(({ data }) => data)
    return anosModelo
  }

  async fetchPreco(params: { codigoMarca: number, codigoModelo: number, anoModelo: number }) {
    const { codigoMarca, codigoModelo, anoModelo } = params
    const preco = await this.axios.get<Preco>(`/api/v1/fipe/marcas/${codigoMarca}/modelos/${codigoModelo}/1/${anoModelo}/preco`)
      .then(({ data }) => data)
    return preco
  }

  async fetchCores(): Promise<string[]> {
    const cores = await this.axios.get<string[]>('/api/v1/cores')
      .then(({ data }) => data)
    return cores
  }

  async fetchAcessorios(): Promise<string[]> {
    const acessorios = await this.axios.get<string[]>('/api/v1/acessorios')
      .then(({ data }) => data)
    return acessorios
  }

  async fetchInformacoesAdicionais(): Promise<string[]> {
    const informacoesAdicionais = await this.axios.get<string[]>('/api/v1/informacoes-adicionais')
      .then(({ data }) => data)
    return informacoesAdicionais
  }

  async criaAnuncio(params: { anuncio: AtualizaAnuncio }) {
    const novoAnuncio = await this.axios.post<Anuncio>('/api/v1/ads', params)
      .then(({ data }) => data)
    return novoAnuncio
  }

  async atualizaAnuncio(params: { adId: number, anuncio: AtualizaAnuncio }) {
    const { adId, anuncio } = params
    const anuncioAtualizado = await this.axios.put<Anuncio>(`/api/v1/ads/${adId}`, { anuncio })
      .then(({ data }) => data)
    return anuncioAtualizado
  }

  async submeteAnuncioParaRevisao(adId: number) {
    const anuncioAtualizado = await this.axios.put<Anuncio>(`/api/v1/ads/${adId}/review`)
      .then(({ data }) => data)
    return anuncioAtualizado
  }

  async cancelaAlteracoesAnuncio(adId: number) {
    const anuncioAtualizado = await this.axios.delete<Anuncio>(`/api/v1/ads/${adId}/changes`)
      .then(({ data }) => data)
    return anuncioAtualizado
  }

  async removeAnuncio(adId: number) {
    await this.axios.delete(`/api/v1/ads/${adId}`)
  }

  async fetchMeuAnuncio(adId: number) {
    const anuncio = await this.axios.get<Anuncio | null>(`/api/v1/ads/${adId}`)
      .then(({ data }) => data)
    return anuncio
  }

  async fetchMeusAnuncios(params?: { status?: AnuncioStatus }) {
    let pathname = '/api/v1/ads'
    if (params?.status) {
      pathname += `?status=${params.status}`
    }
    const anuncios = await this.axios.get<Anuncio[]>(pathname)
      .then(({ data }) => data)
    return anuncios
  }

  async fetchAnuncios(params: SearchParams) {
    const pathname = `/api/v1/anuncios`
    const anuncios = await this.axios.get<TAdsSearchResponse >(pathname, { params })
      .then(({ data }) => data)
    return anuncios
  }

  async fetchAnuncio(id: number) {
    const anuncio = await this.axios.get<TAdDocument>(`/api/v1/anuncios/${id}`)
      .then(({ data }) => data)
    return anuncio
  }

  async fetchSeller(id: string) {
    const dealer = await this.axios.get<TSellerDocument>(`/api/v1/anunciantes/${id}`)
      .then(({ data }) => data)
    return dealer
  }

  getAdImageUploadURL(adId: number) {
    return `${this.baseURL}/api/v1/ads/${adId}/images`
  }

  async uploadImages(params: { adId: number, files: FileList, adImageKeys?: string[], onUploadProgress?: (event: AxiosProgressEvent) => void, onPreviewIndex?: (index: { [imageKey: string]: string }) => void }): Promise<Anuncio> {
    const { adId, files, adImageKeys = [], onUploadProgress, onPreviewIndex } = params
    const previewIndex: { [imageKey: string ]: string } = {}
    const formData = new FormData()
    let i = 0

    for (const file of files) {
      const sha256 = await computeFileHash(file)
      const url = URL.createObjectURL(file)
      if (!adImageKeys.includes(sha256)) {
        formData.append(`file[${i}]`, file)
        previewIndex[sha256] = url
      }
      i++
    }
    if (Array.from(formData.keys()).length === 0) {
      const anuncio = await this.fetchMeuAnuncio(adId)
      if (anuncio === null) {
        throw new Error('nao foi possivel encontrar o anuncio')
      }
      return anuncio
    }
    onPreviewIndex?.(previewIndex)
    try {
      const anuncio = await this.axios.post<Anuncio>(
        `/api/v1/ads/${adId}/images`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: event => onUploadProgress?.(event)
        }
      ).then(({ data }) => data)
      return anuncio
    }
    finally {
      onPreviewIndex?.({})
    }
  }

  async removeImagem(params: { adId: number, imageKey: string }) {
    const { adId, imageKey } = params
    const anuncio = await this.axios.delete<Anuncio>(`/api/v1/ads/${adId}/images/${btoa(imageKey)}`)
      .then(({ data }) => data)
    return anuncio
  }

  async removeImagens(params: { adId: number, imageKeys: string[] }) {
    const { adId, imageKeys } = params
    const anuncio = await this.axios.put<Anuncio>(`/api/v1/ads/${adId}/images/delete`, imageKeys)
      .then(({ data }) => data)
    return anuncio
  }

  async enviaMensagem(anuncio: TAdDocument, params: { adId: number, unauthenticatedSender?: UnauthenticatedMessageSender, content: string, token: string }) {
    trackSendMessageToAdPublisher(anuncio)
    await this.axios.post('/api/v1/messages', params)
  }

  async fetchMensagens(params?: GetMessageQueryParams) {
    const dealer = await this.axios.get<Mensagem[]>('/api/v1/messages', { params })
      .then(({ data }) => data)
    return dealer
  }

  async fetchThreads() {
    const threads = await this.axios.get<IThread[]>('/api/v1/messages/threads')
      .then(({ data }) => data)
    return threads
  }

  async fetchThread(id: string) {
    const messages = await this.axios.get<IThreadMessage[]>(`/api/v1/messages/threads/${id}`)
      .then(({ data }) => data)
    return messages
  }

  getImageUrl(params: { imageId: string, thumbnail?: boolean }) {
    const { imageId, thumbnail } = params
    const baseURL = this.axios.defaults.baseURL ?? ''
    const url = `${baseURL}/api/v1/images/${imageId}${thumbnail ? '/thumbnail' : ''}`
    return url
  }
}
