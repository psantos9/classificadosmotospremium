import type { Env } from '@cmp/api/types'
import type { TAdsFilter } from '@cmp/shared/models/ads-filters-schema'
import type { Anuncio, Usuario } from '@cmp/shared/models/database/models'
import type { SearchParams } from 'typesense/lib/Typesense/Documents'
import { adsCollectionSchema, sellersCollectionSchema, type TAdDocument, type TSellerDocument, TypesenseCollection } from '@cmp/shared/models/typesense'
import { Client } from 'typesense'

export class TypesenseService {
  readonly client: Client
  constructor(env: Env) {
    const { TYPESENSE_API_KEY: apiKey, TYPESENSE_URL_ENDPOINT: typesenseUrl } = env
    this.client = new Client({
      numRetries: 1,
      retryIntervalSeconds: 1,
      nodes: [{ url: typesenseUrl }],
      apiKey,
      connectionTimeoutSeconds: 2
    })
  }

  mapUserToSeller(usuario: Usuario): TSellerDocument {
    const { id, createdAt, isCnpj, nomeFantasia, localidade, uf } = usuario
    const document: TSellerDocument = { id: id.toString(), createdAt: createdAt.getTime(), business: isCnpj, nomeFantasia: nomeFantasia || undefined, localidade, uf }
    return document
  }

  mapAdToDocument(ad: Anuncio): TAdDocument {
    const { id, userId, createdAt, publishedAt, updatedAt, expiresAt, placa, revision, atualizacao, reviewWorkflowId, status, ...adDocument } = ad
    const document: TAdDocument = { ...adDocument, id: id.toString(), publishedAt: (publishedAt || new Date()).getTime(), sellerId: userId.toString() }
    return document
  }

  async getCollections() {
    const collections = await this.client.collections().retrieve()
    return collections
  }

  async createSellersCollection() {
    const collection = await this.client.collections().create(sellersCollectionSchema)
    return collection
  }

  async upsertSeller(user: Usuario) {
    const update = this.mapUserToSeller(user)
    const document = await this.client.collections<TSellerDocument>(TypesenseCollection.SELLER).documents().upsert(update)
    return document
  }

  async createAdsCollection() {
    const collection = await this.client.collections().create(adsCollectionSchema)
    return collection
  }

  async searchAds(params: SearchParams) {
    const queryBy = params.query_by || ['marca', 'modelo', 'uf', 'descricao'].join(',')
    const facetBy = params.facet_by || ['marca', 'uf'].join(',')
    const result = await this.client.multiSearch.perform <[TAdDocument]>({
      searches: [
        { ...params, collection: TypesenseCollection.ADS, query_by: queryBy, facet_by: facetBy, include_fields: `$${TypesenseCollection.SELLER}(*)` }
      ]
    })
    return result.results[0]
  }

  async fetchAd(adId: string) {
    const result = await this.client.multiSearch.perform <[TAdDocument]>({
      searches: [
        { collection: TypesenseCollection.ADS, q: '', query_by: 'marca,modelo', filter_by: `id:=${adId}`, include_fields: `$${TypesenseCollection.SELLER}(*)` }
      ]
    })
    return result.results?.[0]?.hits?.[0]?.document ?? null
  }

  async fetchSeller(sellerId: string) {
    const document = await this.client.collections<TSellerDocument>(TypesenseCollection.SELLER).documents(sellerId).retrieve()
    return document
  }

  async upsertAd(ad: Anuncio) {
    const update = this.mapAdToDocument(ad)
    const document = await this.client.collections<TAdDocument>(TypesenseCollection.ADS).documents().upsert(update)
    return document
  }

  async deleteAdDocument(adId: number) {
    await this.client.collections<TAdDocument>(TypesenseCollection.ADS).documents(adId.toString()).delete()
  }

  static getFilterByQuery(filter: TAdsFilter) {
    const filters: string[] = []
    const { uf, marca, anoMinimo, anoMaximo, precoMinimo, precoMaximo, quilometragemMinima, quilometragemMaxima, advertiserType } = filter
    if (uf) {
      filters.push(`uf:=${uf}`)
    }
    if (marca) {
      filters.push(`marca:=${marca}`)
    }
    if (anoMinimo) {
      filters.push(`anoModelo:>=${anoMinimo}`)
    }
    if (anoMaximo) {
      filters.push(`anoModelo:<=${anoMaximo}`)
    }
    if (precoMinimo) {
      filters.push(`preco:>=${precoMinimo}`)
    }
    if (precoMaximo) {
      filters.push(`preco:<=${precoMaximo}`)
    }
    if (quilometragemMinima) {
      filters.push(`quilometragem:>=${quilometragemMinima}`)
    }
    if (quilometragemMaxima) {
      filters.push(`quilometragem:<=${quilometragemMaxima}`)
    }
    if (advertiserType !== null) {
      filters.push(`$seller(business:=${advertiserType === 'pj'})`)
    }
    const filterBy = filters.join(' && ')
    return filterBy
  }
}

export const useTypesense = async (env: Env) => {
  const instance = new TypesenseService(env)
  return instance
}
