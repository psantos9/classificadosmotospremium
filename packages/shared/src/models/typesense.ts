import type { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections'
import type { SearchResponse, SearchResponseFacetCountSchema } from 'typesense/lib/Typesense/Documents'
import type { Anuncio } from './database/models'

export enum TypesenseCollection {
  ADS = 'ad',
  SELLER = 'seller'
}

export interface TSellerDocument { id: string, createdAt: number, business: boolean, nomeFantasia?: string, localidade: string, uf: string }
export type TAdDocument = Omit<Anuncio, 'id' | 'userId' | 'createdAt' | 'publishedAt' | 'updatedAt' | 'expiresAt' | 'placa' | 'revision' | 'atualizacao' | 'reviewWorkflowId' | 'status'> & { id: string, publishedAt: number, sellerId: string, seller?: TSellerDocument }

export type TAdsSearchResponse = SearchResponse<TAdDocument>
export type TAdsFacetCounts = SearchResponseFacetCountSchema<TAdDocument>[]

export const adsCollectionSchema: CollectionCreateSchema = {
  name: TypesenseCollection.ADS,
  enable_nested_fields: true,
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
      type: 'string',
      facet: true
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
      name: 'location',
      type: 'geopoint',
      optional: true
    },
    {
      name: 'sellerId',
      type: 'string',
      optional: true,
      reference: `${TypesenseCollection.SELLER}.id`
    }
  ]
}

export const sellersCollectionSchema: CollectionCreateSchema = {
  name: TypesenseCollection.SELLER,
  enable_nested_fields: true,
  fields: [
    {
      name: 'nomeFantasia',
      type: 'string',
      optional: true
    },
    {
      name: 'business',
      type: 'bool'
    },
    {
      name: 'createdAt',
      type: 'int64'
    },
    {
      name: 'localidade',
      type: 'string',
      facet: true
    },
    {
      name: 'uf',
      type: 'string',
      facet: true
    }

  ]
}
