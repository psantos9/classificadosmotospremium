import type { Env } from '@/types'
import { DurableObject } from 'cloudflare:workers'

export enum STORAGE_KEY_PREFIX {
  ONLINE_USERS_INDEX = 'ONLINE_USERS_INDEX'
}

export type TOnlineUsersIndex = Record<string, { userId: number, cf?: CfProperties }>

export class UsersDO extends DurableObject<Env> {
  private _onlineUsersIndex: TOnlineUsersIndex = {}
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
    this.ctx.blockConcurrencyWhile(async () => {
      await this._load()
    })
  }

  private async _load() {
    this._onlineUsersIndex = await this.ctx.storage.get<TOnlineUsersIndex>(STORAGE_KEY_PREFIX.ONLINE_USERS_INDEX) ?? {}
  }

  get onlineUsersIndex() {
    return this._onlineUsersIndex
  }

  async setUserOnline(userId: number, cf?: CfProperties) {
    this._onlineUsersIndex[userId] = { userId, cf }
    await this.ctx.storage.put(STORAGE_KEY_PREFIX.ONLINE_USERS_INDEX, this._onlineUsersIndex)
  }

  async setUserOffline(userId: number) {
    delete this._onlineUsersIndex[userId]
    await this.ctx.storage.put(STORAGE_KEY_PREFIX.ONLINE_USERS_INDEX, this._onlineUsersIndex)
  }
}

export const getUsersDO = (env: Env) => {
  const id: DurableObjectId = env.USERS_DO.idFromName(env.ENVIRONMENT)
  const stub = env.USERS_DO.get(id)
  return stub
}
