import type { AnoModelo, CodigoTipoCombustivel, Marca, Modelo, Preco } from '@cmp/api/clients/fipe-api-client'
import type { AnuncioStatus } from '@cmp/shared/models/anuncio-status'
import type { AtualizaAnuncio } from '@cmp/shared/models/atualiza-anuncio'
import type { AtualizaCadastro } from '@cmp/shared/models/atualiza-cadastro'
import type { Acessorio, Anuncio, Cadastro, Cor, InformacaoAdicional } from '@cmp/shared/models/database/schema'
import type { NovoCadastro } from '@cmp/shared/models/novo-cadastro'
import type { OpenCEP } from '@cmp/shared/models/open-cep'
import { computeFileHash } from '@/helpers/computeFileSha256'
import { getImageStorageKey } from '@cmp/api/helpers/get-image-storage-key'
import axios, { type Axios, AxiosError, type AxiosProgressEvent } from 'axios'
import Emittery from 'emittery'
import { decodeJwt } from 'jose'
import mimeDB from 'mime-db'

export const API_PERSISTENCE_KEY = 'CPM:SESSION'

export interface IImageUploadEvent {
  imageKey: string
  url: string
  sha256: string
  ext: string
  file: File
  progress: AxiosProgressEvent
}

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

  async criaNovoCadastro(cadastro: NovoCadastro) {
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

  async atualizaCadastro(params: { id: number, cadastro: AtualizaCadastro }) {
    const { id, cadastro } = params
    const cadastroAtualizado = await this.axios.put<Omit<Cadastro, 'password'>>(`/api/v1/users/${id}`, cadastro)
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

  async fetchCadastro() {
    this._fetchToken()
    const cadastro = await this.axios.get<Omit<Cadastro, 'password'>>('/api/v1/users')
      .then(({ data }) => data)
    return cadastro
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
    const cores: Cor[] = [
      { id: 1, label: 'Amarelo' },
      { id: 2, label: 'Azul' },
      { id: 3, label: 'Branco' },
      { id: 4, label: 'Cinza' },
      { id: 5, label: 'Laranja' },
      { id: 6, label: 'Outra' },
      { id: 7, label: 'Prata' },
      { id: 8, label: 'Preto' },
      { id: 9, label: 'Verde' }
    ]
    return cores
  }

  async fetchAcessorios(): Promise<Acessorio[]> {
    const acessorios: Acessorio[] = [
      { id: 1, label: 'ABS' },
      { id: 2, label: 'Amortecedor de direção' },
      { id: 3, label: 'Bolsa / Baú / Bauleto' },
      { id: 4, label: 'Computador de bordo' },
      { id: 5, label: 'Contrapeso no guidon' },
      { id: 6, label: 'Escapamento esportivo' },
      { id: 7, label: 'Faróis de neblina' },
      { id: 8, label: 'GPS' },
      { id: 9, label: 'Som' }
    ]
    return acessorios
  }

  async fetchInformacoesAdicionais(): Promise<InformacaoAdicional[]> {
    const informacaoAdicional: InformacaoAdicional[] = [
      { id: 1, label: 'Com multas' },
      { id: 2, label: 'De leilão' },
      { id: 3, label: 'IPVA pago' },
      { id: 4, label: 'Único dono' },
      { id: 5, label: 'Veículo em financiamento' },
      { id: 6, label: 'Veículo quitado' }
    ]
    return informacaoAdicional
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

  async fetchAnuncio(adId: number) {
    const anuncio = await this.axios.get<Anuncio | null>(`/api/v1/ads/${adId}`)
      .then(({ data }) => data)
    return anuncio
  }

  async removeAnuncio(adId: number) {
    await this.axios.delete(`/api/v1/ads/${adId}`)
  }

  async fetchAnuncios(params?: { status?: AnuncioStatus }) {
    let pathname = '/api/v1/ads'
    if (params?.status) {
      pathname += `?status=${params.status}`
    }
    const anuncios = await this.axios.get<Anuncio[]>(pathname)
      .then(({ data }) => data)
    return anuncios
  }

  async uploadImages(params: { adId: number, files: FileList, onUploadProgress?: (event: AxiosProgressEvent) => void, onPreviewIndex?: (index: { [imageKey: string]: string }) => void }): Promise<Anuncio> {
    const { adId, files, onUploadProgress, onPreviewIndex } = params
    const previewIndex: { [imageKey: string ]: string } = {}
    const formData = new FormData()
    let i = 0

    for (const file of files) {
      formData.append(`file[${i}]`, file)
      const ext = mimeDB[file.type]?.extensions?.[0] ?? ''
      const sha256 = await computeFileHash(file)
      const url = URL.createObjectURL(file)
      const imageKey = getImageStorageKey({ adId, file: { sha256, ext } })
      previewIndex[imageKey] = url
      i++
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

  getImageUrl(imageKey: string) {
    let baseURL = ''
    switch (import.meta.env.MODE) {
      case 'preview':
        baseURL = 'https://cdn.preview.classificadosmotospremium.com.br'
        break
      case 'production':
        baseURL = 'https://cdn.classificadosmotospremium.com.br'
        break
      default:
        baseURL = `${this.axios.defaults.baseURL ?? ''}/api/v1/images`
        imageKey = btoa(imageKey)
    }
    return `${baseURL}/${imageKey}`
  }
}
