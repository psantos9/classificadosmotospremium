import type { Marca, Modelo } from '@cmp/api/clients/fipe-api-client'
import { firstDayOfNextMonth } from '@/helpers/first-day-of-next-month'
import { CodigoTipoVeiculo, FipeApiClient } from '@cmp/api/clients/fipe-api-client'
import { describe, it } from 'vitest'

describe('fipeClient', () => {
  const fipeClient = new FipeApiClient()
  it('fetches the list of tables', async () => {
    const codigoTipoVeiculo = CodigoTipoVeiculo.MOTO
    const tabelas = await fipeClient.getTables()
    const [{ codigoTabela: codigoTabelaReferencia }] = tabelas
    const marcas = await fipeClient.getMakes({ codigoTipoVeiculo, codigoTabelaReferencia })
    const { codigoMarca } = marcas.find(({ marca }) => marca === 'HARLEY-DAVIDSON') as Marca
    const { modelos } = await fipeClient.getModels({ codigoTabelaReferencia, codigoTipoVeiculo: CodigoTipoVeiculo.MOTO, codigoMarca })
    const { codigoModelo } = modelos.find(({ modelo }) => modelo === 'ROAD KING') as Modelo
    const [{ anoModelo, codigoTipoCombustivel }] = await fipeClient.getYearsModel({ codigoTabelaReferencia: 316, codigoTipoVeiculo: CodigoTipoVeiculo.MOTO, codigoMarca, codigoModelo })
    const valor = await fipeClient.getPriceForModel({ codigoTabelaReferencia, codigoMarca, codigoModelo, codigoTipoVeiculo, anoModelo, codigoTipoCombustivel })
    console.log('ok', valor)
  })
})
