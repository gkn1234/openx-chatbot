import type { ChatApp } from '../chat-app'

export class ChatAppStorage {
  app: ChatApp

  constructor(app: ChatApp) {
    this.app = app
  }

  private _storageKey(key: string) {
    return `__${this.app.appid}_${this.app.user.value}_${key}__`
  }

  save(key: string, value: any) {
    if (!this.app.user.value) {
      return
    }

    const storageKey = this._storageKey(key)
    try {
      localStorage.setItem(storageKey, JSON.stringify(value))
    }
    catch (e: any) {
      this.app.logger.error(e)
    }
  }

  load<T = any>(key: string, defaultValue: T) {
    if (!this.app.user.value) {
      return defaultValue
    }

    const storageKey = this._storageKey(key)
    try {
      const value = localStorage.getItem(storageKey)
      if (value) {
        return JSON.parse(value) as T
      }
      else {
        return defaultValue
      }
    }
    catch (e: any) {
      this.app.logger.error(e)
      return defaultValue
    }
  }
}
