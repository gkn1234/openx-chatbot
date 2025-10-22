import type {
  ChatAppClientProxyOptions,
} from '../proxy';

export interface ChatClientOptions extends ChatAppClientProxyOptions {
  /**
   * 是否预加载内容
   * @default true
   */
  preload?: boolean

  /**
   * 触发按钮要等待多少毫秒出现
   * - 0: 立即出现
   * - 负数: 不出现。通过 client.showTip() 控制出现
   * @default 0
   */
  waiting?: number

  /** 弹窗打开时触发 */
  onOpen?: (times: number) => void
}
