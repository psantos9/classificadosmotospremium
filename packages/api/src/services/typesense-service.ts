import type { Env } from '@cmp/api/types'
import type { TAdsFilter } from '@cmp/shared/models/ads-filters-schema'
import type { Anuncio } from '@cmp/shared/models/database/models'
import type { SearchParams } from 'typesense/lib/Typesense/Documents'
import { adsCollectionSchema, type TAdDocument, TypesenseCollection } from '@cmp/shared/models/typesense'
import { Client } from 'typesense'

export class TypesenseService {
  readonly client: Client
  constructor(env: Env) {
    const { TYPESENSE_API_KEY: apiKey, TYPESENSE_URL_ENDPOINT: typesenseUrl } = env
    this.client = new Client({
      nodes: [{ url: typesenseUrl }],
      apiKey,
      connectionTimeoutSeconds: 2
    })
  }

  private _convertAdToDocument(ad: Anuncio): TAdDocument {
    const { id, userId, createdAt, publishedAt, updatedAt, expiresAt, placa, revision, atualizacao, reviewWorkflowId, status, ...adDocument } = ad
    const document: TAdDocument = { ...adDocument, id: id.toString(), publishedAt: (publishedAt || new Date()).getTime() }
    return document
  }

  async getCollections() {
    const collections = await this.client.collections().retrieve()
    return collections
  }

  async createAdsCollection() {
    const collection = await this.client.collections().create(adsCollectionSchema)
    return collection
  }

  async searchAds(params: SearchParams) {
    const queryBy: string[] = ['marca', 'modelo', 'uf', 'descricao', 'cor']
    const facetBy: string[] = ['marca', 'cor', 'uf']
    const result = await this.client.collections<TAdDocument>(TypesenseCollection.ADS).documents().search({ ...params, query_by: queryBy, facet_by: facetBy })
    return result
  }

  async fetchAd(adId: string) {
    const adDocument = await this.client.collections<TAdDocument>(TypesenseCollection.ADS).documents(adId).retrieve()
    return adDocument
  }

  async upsertAd(ad: Anuncio) {
    const update = this._convertAdToDocument(ad)
    const document = await this.client.collections(TypesenseCollection.ADS).documents().upsert(update)
    return document
  }

  async deleteAdDocument(adId: number) {
    await this.client.collections(TypesenseCollection.ADS).documents(adId.toString()).delete()
  }

  static getFilterByQuery(filter: TAdsFilter) {
    const filters: string[] = []
    const { uf, marca, anoMinimo, anoMaximo, precoMinimo, precoMaximo, quilometragemMinima, quilometragemMaxima, pf, pj } = filter
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
    if (pf === false) {
      filters.push(`pj:=true`)
    }
    else if (pj === false) {
      filters.push(`pj:=false`)
    }
    const filterBy = btoa(filters.join(' && '))
    return filterBy
  }
}

export const useTypesense = async (env: Env) => {
  const instance = new TypesenseService(env)
  return instance
}
