import type { Env } from '@cmp/api/types'
import { DurableObject } from 'cloudflare:workers'

export enum STORAGE_KEY_PREFIX {
  ONLINE_USERS_INDEX = 'ONLINE_USERS_INDEX',
  LAST_SEEN_USERS_INDEX = 'LAST_SEEN_USERS_INDEX',
  LAST_USER_EMAIL_SENT_INDEX = 'LAST_USER_EMAIL_SENT_INDEX'
}

export type TOnlineUsersIndex = Record<string, { userId: number, cf?: CfProperties }>
export type TLastSeenUsersIndex = Record<string, { userId: number, lastSeen: Date | null }>
export type TLastUserEmailSentIndex = Record<string, { userId: number, lastEmail: Date | null }>

export class UsersDO extends DurableObject<Env> {
  private _onlineUsersIndex: TOnlineUsersIndex = {}
  private _lastSeenUsersIndex: TLastSeenUsersIndex = {}
  private _lastUserEmailSentIndex: TLastUserEmailSentIndex = {}
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
    this.ctx.blockConcurrencyWhile(async () => await this._load())
  }

  private async _load() {
    this._onlineUsersIndex = await this.ctx.storage.get<TOnlineUsersIndex>(STORAGE_KEY_PREFIX.ONLINE_USERS_INDEX) ?? {}
    this._lastSeenUsersIndex = await this.ctx.storage.get<TLastSeenUsersIndex>(STORAGE_KEY_PREFIX.LAST_SEEN_USERS_INDEX) ?? {}
    this._lastUserEmailSentIndex = await this.ctx.storage.get<TLastUserEmailSentIndex>(STORAGE_KEY_PREFIX.LAST_USER_EMAIL_SENT_INDEX) ?? {}
  }

  get onlineUsersIndex() {
    return this._onlineUsersIndex
  }

  private async _setUserLastSeen(userId: number, lastSeen: Date) {
    this._lastSeenUsersIndex[userId] = { userId, lastSeen }
    await this.ctx.storage.put<TLastSeenUsersIndex>(STORAGE_KEY_PREFIX.LAST_SEEN_USERS_INDEX, this._lastSeenUsersIndex)
  }

  async setLastUserEmailSent(userId: number, lastEmail: Date) {
    this._lastUserEmailSentIndex[userId] = { userId, lastEmail }
    await this.ctx.storage.put<TLastUserEmailSentIndex>(STORAGE_KEY_PREFIX.LAST_USER_EMAIL_SENT_INDEX, this._lastUserEmailSentIndex)
  }

  async getLastUserEmailSent(userId: number) {
    const lastEmail = this._lastUserEmailSentIndex[userId]?.lastEmail ?? null
    return lastEmail
  }

  async setUserOnline(userId: number, cf?: CfProperties) {
    this._onlineUsersIndex[userId] = { userId, cf }
    await this.ctx.storage.put(STORAGE_KEY_PREFIX.ONLINE_USERS_INDEX, this._onlineUsersIndex)
  }

  async setUserOffline(userId: number) {
    delete this._onlineUsersIndex[userId]
    await this.ctx.storage.put(STORAGE_KEY_PREFIX.ONLINE_USERS_INDEX, this._onlineUsersIndex)
    await this._setUserLastSeen(userId, new Date())
  }

  async getUserOnlineStatus(userId: number) {
    const onlineStatus = !!this._onlineUsersIndex[userId]
    return onlineStatus
  }

  async getUserLastSeen(userId: number) {
    const lastSeen = this._lastSeenUsersIndex[userId]?.lastSeen ?? null
    return lastSeen
  }
}

export const getUsersDO = (env: Env) => {
  const id: DurableObjectId = env.USERS_DO.idFromName(env.ENVIRONMENT)
  const stub = env.USERS_DO.get(id)
  return stub
}
