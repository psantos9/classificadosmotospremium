import { FipeClient } from '@cmp/api/clients/fipe-client'
import { describe, it } from 'vitest'

describe('fipeClient', () => {
  const fipeClient = new FipeClient()
  it('fetches the list of tables', async () => {
    // fipeClient.emiteErro()
    const a = await fipeClient.getTables()
    console.log(a)
  })
})
