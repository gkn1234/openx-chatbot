import type { Func } from '@chatbot/utils'
import { toPromise } from '@chatbot/utils'

export class EventEmitter<EventsMap extends Record<string, Func> = Record<string, Func>> {
  private _eventsMap = new Map<keyof EventsMap, Func[]>()

  /**
   * 事件监听
   * @param event 事件名称
   * @param handler 触发器
   * @param insertIndex 触发器插入位置。若不填则默认插入到末尾
   */
  on<T extends keyof EventsMap>(
    event: T,
    handler: EventsMap[T],
    insertIndex: number = -1,
  ) {
    const events = this._eventsMap.get(event)
    if (!events) {
      this._eventsMap.set(event, [handler])
    }
    else if (insertIndex < 0 || insertIndex >= events.length) {
      events.push(handler)
    }
    else {
      events.splice(insertIndex, 0, handler)
    }
  }

  /**
   * 触发事件
   * @param event 事件名称
   * @param args 传递给触发器的参数
   */
  async emit<T extends keyof EventsMap>(event: T, ...args: Parameters<EventsMap[T]>) {
    const events = this._eventsMap.get(event)
    if (!events) {
      return
    }

    for (const handler of events) {
      await toPromise(handler, args)
    }
  }

  /** 同步触发事件 */
  emitSync<T extends keyof EventsMap>(event: T, ...args: Parameters<EventsMap[T]>) {
    const events = this._eventsMap.get(event)
    if (!events) {
      return
    }

    for (const handler of events) {
      handler(...args)
    }
  }

  /**
   * 移除事件监听器
   * @param event
   * @param handler
   */
  off<T extends keyof EventsMap>(event: T, handler: EventsMap[T]) {
    const events = this._eventsMap.get(event)
    if (!events) {
      return
    }

    const index = events.indexOf(handler)
    if (index >= 0) {
      events.splice(index, 1)
    }
  }

  /**
   * 获取指定事件的监听器索引
   * @param event
   * @param handler
   * @return 监听器索引，若不存在则返回 -1
   */
  eventIndex<T extends keyof EventsMap>(event: T, handler: EventsMap[T]) {
    const events = this._eventsMap.get(event)
    if (!events) {
      return -1
    }

    return events.indexOf(handler)
  }

  /**
   * 移除指定事件的所有监听器
   * @param event
   */
  clearEvent(event: keyof EventsMap) {
    this._eventsMap.delete(event)
  }

  /** 移除所有事件监听器 */
  clearAllEvents() {
    this._eventsMap.clear()
  }
}
