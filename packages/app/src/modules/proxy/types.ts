import type { Func } from '@openx/utils';
import type {
  ChatAppAction,
  ChatAppActionKey,
  ChatAppConfigData,
} from '../chat-app';
import type { ChatFlowData } from '../chat-flow';

/** 客户端向 AI 应用发送通信数据 */
export interface ChatAppProxyMessage<T extends ChatAppActionKey = ChatAppActionKey> {
  /** 传递 AI 应用部署的 url，供应用验证消息来源的合法性 */
  url: string
  action: T
  params: Parameters<ChatAppAction[T] extends Func ? ChatAppAction[T] : Func>
}

export type ChatAppProxyMessageSet<T extends ChatAppActionKey = ChatAppActionKey> = Omit<ChatAppProxyMessage<T>, 'url'>;

/** AI 应用向客户端发送通信数据 */
export interface ChatAppClientProxyMessage {
  /**
   * 事件类型：
   * - ready：AI 应用已完成初始化
   * - close: 关闭事件
   * - config: 用户切换，配置发生更新
   * - flow-active: 对话切换完成时触发
   * - getter: 向客户端请求数据
   * - event: 自定义事件
   * - data: 向客户端发送数据
   */
  type: 'ready' | 'close' | 'config' | 'flow-active' | 'getter' | 'event' | 'data'

  /** 传递 AI 应用的 url，供客户端验证消息来源的合法性 */
  from: string

  /** type=config 事件特有，配置对象 */
  config?: ChatAppConfigData

  /** 用户 id */
  user?: string

  /** 对话信息 */
  flow?: ChatFlowData

  /** type=flow-active 事件特有，对话切换激活的次数 */
  activeTimes?: number

  /** type=getter 事件特有，请求 id，用与匹配请求与回传 */
  getterId?: string

  /** type=getter 事件特有，请求的数据的 key，用于和其他不同类型请求数据进行区分 */
  getterKey?: string

  /** type=custom 事件特有，事件名称，用于和其他不同类型的事件进行区分 */
  eventName?: string

  /** type=data 事件特有，数据流名称 */
  dataKey?: string

  /** type=data 事件特有，数据流内容 */
  dataValue?: any
}

export type ChatAppClientProxyMessageSet = Omit<ChatAppClientProxyMessage, 'from'>;

export interface ChatAppClientProxyOptions {
  /** 聊天助手部署地址 */
  url: string

  /** 是否打印通信消息 */
  log?: boolean

  /** AI 应用已完成初始化 */
  onReady?: () => void

  /** 处理 AI 应用返回的配置更新信息 */
  onConfig?: (data: ChatAppConfigData, user: string) => void

  /** 处理 AI 应用关闭事件 */
  onClose?: () => void

  /** 处理 AI 应用传送的消息 */
  onMessage?: (data: ChatAppClientProxyMessage) => void

  /** 处理 AI 应用选中对话 */
  onFlowActive?: (flow: ChatFlowData, activeTimes: number) => void

  /** 处理 AI 应用请求数据 */
  onGetter?: (getterId: string, getterKey: string) => void

  /** 处理 AI 应用自定义事件 */
  onEvent?: (eventName: string) => void

  /** 处理 AI 应用传递数据事件 */
  onData?: (dataKey: string, dataValue: any) => void
}
