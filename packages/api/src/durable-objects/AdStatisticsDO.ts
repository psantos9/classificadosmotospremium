import type { Env } from '@/types'
import { DurableObject } from 'cloudflare:workers'

export class AdStatisticsDO extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
    this.ctx.blockConcurrencyWhile(async () => {
      await this._load()
    })
  }

  private async _load() {
    // this._onlineUsersIndex = await this.ctx.storage.get<TOnlineUsersIndex>(STORAGE_KEY_PREFIX.ONLINE_USERS_INDEX) ?? {}
  }
}
