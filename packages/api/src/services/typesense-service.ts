import type { Env } from '@/types'
import type { TAdsFilter } from '@cmp/shared/models/ads-filters-schema'
import type { Anuncio } from '@cmp/shared/models/database/models'
import type { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections'
import type { SearchParams, SearchResponse, SearchResponseFacetCountSchema } from 'typesense/lib/Typesense/Documents'
import { Client } from 'typesense'

export enum TypesenseCollection {
  ADS = 'ads'
}

export type TAdDocument = Omit<Anuncio, 'id' | 'userId' | 'createdAt' | 'publishedAt' | 'updatedAt' | 'expiresAt' | 'placa' | 'revision' | 'atualizacao' | 'reviewWorkflowId' | 'status'> & { id: string, publishedAt: number }

export type TAdsSearchResponse = SearchResponse<TAdDocument>
export type TAdsFacetCounts = SearchResponseFacetCountSchema<TAdDocument>[]

const adsSchema: CollectionCreateSchema = {
  name: TypesenseCollection.ADS,
  fields: [
    {
      name: 'publishedAt',
      type: 'int64'
    },
    {
      name: 'codigoFipe',
      type: 'string'
    },
    {
      name: 'marca',
      type: 'string',
      facet: true
    },
    {
      name: 'modelo',
      type: 'string'
    },
    {
      name: 'anoModelo',
      type: 'int32'
    },
    {
      name: 'ano',
      type: 'int32'
    },
    {
      name: 'quilometragem',
      type: 'int32'
    },
    {
      name: 'preco',
      type: 'int32'
    },
    {
      name: 'cor',
      type: 'string',
      facet: true
    },
    {
      name: 'descricao',
      type: 'string'
    },
    {
      name: 'uf',
      type: 'string',
      facet: true
    },
    {
      name: 'pj',
      type: 'bool'
    }
  ]
}

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
    const collection = await this.client.collections().create(adsSchema)
    return collection
  }

  async searchAds(params: SearchParams) {
    const queryBy: string[] = ['marca', 'modelo', 'uf', 'descricao', 'cor']
    const facetBy: string[] = ['marca', 'cor', 'uf']
    const result = await this.client.collections<TAdDocument>(TypesenseCollection.ADS).documents().search({ ...params, query_by: queryBy, facet_by: facetBy })
    return result
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
