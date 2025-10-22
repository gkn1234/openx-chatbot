import type { ChatFlow, ChatFlowData } from '../chat-flow';
import type { ChatAppAction } from './action';

export type ChatAppEvents = {
  /** 会话忙碌时触发 */
  onBuzy: () => void

  /** 会话等待 LLM 输出超时触发 */
  onWaitingTimeout: (activeFlow: ChatFlow) => void

  /** 滚动更新，发生在对话内容发生更新时 */
  onScrollUpdate: (activeFlow: ChatFlow) => void

  /** 收到客户端的消息时触发 */
  onReceived: (id: string, value: any) => void
};

/** AI 应用的配置对象 */
export interface ChatAppConfigData {
  /** 是否折叠左侧的会话导航 */
  navCollapsed: boolean

  /** 窗口界面的宽度 */
  width: number

  /** 用户会话缓存 */
  flows: ChatFlowData[]

  /** 用户选中的会话 id */
  activeFlowId: string

  /** 创建会话时默认智能体 id */
  defaultChatFlowId: number
}

export type ChatAppActionKey = Exclude<keyof ChatAppAction, 'app'>;
