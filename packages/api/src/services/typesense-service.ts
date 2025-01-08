import type { Env } from '@/types'
import type { Anuncio } from '@cmp/shared/models/database/models'
import type { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections'
import { Client } from 'typesense'

const adsSchema: CollectionCreateSchema = {
  name: 'ads',
  fields: [
    {
      name: 'publishedAt',
      type: 'int64'
    },
    {
      name: 'codigoFipe',
      type: 'string',
      facet: true
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

  async getCollections() {
    const collections = await this.client.collections().retrieve()
    return collections
  }

  async createAdsCollection() {
    const collection = await this.client.collections().create(adsSchema)
    return collection
  }

  async upsertAd(ad: Anuncio | { id: string } | { cor: string } | { publishedAt: number }) {
    const document = await this.client.collections('ads').documents().upsert(ad)
    return document
  }
}
