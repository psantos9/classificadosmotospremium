import type { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections'
import type { SearchParams, SearchResponse, SearchResponseFacetCountSchema } from 'typesense/lib/Typesense/Documents'
import type { Anuncio } from './database/models'

export enum TypesenseCollection {
  ADS = 'ads'
}

export type TAdDocument = Omit<Anuncio, 'id' | 'userId' | 'createdAt' | 'publishedAt' | 'updatedAt' | 'expiresAt' | 'placa' | 'revision' | 'atualizacao' | 'reviewWorkflowId' | 'status'> & { id: string, publishedAt: number }

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
