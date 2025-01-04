import type { AnoModelo, CodigoTipoCombustivel, Marca, Modelo, Preco } from '@cmp/api/clients/fipe-api-client'
import type { AnuncioStatus } from '@cmp/shared/models/anuncio-status'
import type { AtualizaAnuncio } from '@cmp/shared/models/atualiza-anuncio'
import type { AtualizaUsuario } from '@cmp/shared/models/atualiza-usuario'
import type { Acessorio, Anuncio, Cor, InformacaoAdicional, PublicAd, Usuario } from '@cmp/shared/models/database/models'
import type { NovoUsuario } from '@cmp/shared/models/novo-usuario'
import type { OpenCEP } from '@cmp/shared/models/open-cep'
import type { UnauthenticatedMessageSender } from '@cmp/shared/models/unauthenticated-message-sender'
import { computeFileHash } from '@/helpers/computeFileSha256'
import { getImageStorageKey } from '@cmp/api/helpers/get-image-storage-key'
import axios, { type Axios, AxiosError, type AxiosProgressEvent } from 'axios'
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
  criaNovoUsuario: (cadastro: NovoUsuario) => Promise<void>
  fetchUsuario: () => Promise<Omit<Usuario, 'password' | 'confirmPassword'>>
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
    const exists = await this.axios.post<{ exists: boolean }>('/api/v1/login/check', { email })
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

  async criaNovoUsuario(cadastro: NovoUsuario) {
    const bearerToken = await this.axios.post<{ bearerToken: string }>('/api/v1/signup', cadastro)
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
    this._fetchToken()
    const usuario = await this.axios.get<Omit<Usuario, 'password'>>('/api/v1/users')
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

  async fetchCores(): Promise<Cor[]> {
    const cores = await this.axios.get<Cor[]>('/api/v1/cores')
      .then(({ data }) => data)
    return cores
  }

  async fetchAcessorios(): Promise<Acessorio[]> {
    const acessorios = await this.axios.get<Acessorio[]>('/api/v1/acessorios')
      .then(({ data }) => data)
    return acessorios
  }

  async fetchInformacoesAdicionais(): Promise<InformacaoAdicional[]> {
    const informacoesAdicionais = await this.axios.get<InformacaoAdicional[]>('/api/v1/informacoes-adicionais')
      .then(({ data }) => data)
    return informacoesAdicionais
  }

  async criaAnuncio(anuncio: AtualizaAnuncio) {
    const novoAnuncio = await this.axios.post<Anuncio>('/api/v1/ads', anuncio)
      .then(({ data }) => data)
    return novoAnuncio
  }

  async atualizaAnuncio(adId: number, anuncio: AtualizaAnuncio) {
    const anuncioAtualizado = await this.axios.put<Anuncio>(`/api/v1/ads/${adId}`, anuncio)
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

  async fetchAnuncios() {
    const pathname = '/api/v1/anuncios'
    const anuncios = await this.axios.get<PublicAd[]>(pathname)
      .then(({ data }) => data)
    return anuncios
  }

  async fetchAnuncio(id: number) {
    const pathname = `/api/v1/anuncios/${id}`
    const anuncio = await this.axios.get<PublicAd & { cor: Cor }>(pathname)
      .then(({ data }) => data)
    return anuncio
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

  async enviaMensagem(params: { adId: number, sender?: UnauthenticatedMessageSender, content: string }) {
    await this.axios.post('/api/v1/messages', params)
  }

  getImageUrl(params: { imageId: string, thumbnail?: boolean }) {
    const { imageId, thumbnail } = params
    const baseURL = this.axios.defaults.baseURL ?? ''
    const url = `${baseURL}/api/v1/images/${imageId}${thumbnail ? '/thumbnail' : ''}`
    return url
  }
}
