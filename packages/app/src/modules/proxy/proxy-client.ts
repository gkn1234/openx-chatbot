import type { ChatAppActionKey } from '../chat-app';
import type {
  ChatAppClientProxyMessage,
  ChatAppClientProxyOptions,
  ChatAppProxyMessage,
  ChatAppProxyMessageSet,
} from './types';

/** 客户端的通信对象，不要与 vue、element-plus、客户端上下文耦合 */
export class ChatClientProxy {
  private _iframe: HTMLIFrameElement | null = null;

  options: ChatAppClientProxyOptions;

  private _messageHandler: (e: MessageEvent<ChatAppClientProxyMessage>) => void;

  constructor(options: ChatAppClientProxyOptions) {
    this.options = options;
    this._messageHandler = this.messageHandler.bind(this);
  }

  get iframe(): HTMLIFrameElement {
    if (!this._iframe) {
      throw new Error('iframe is not set!');
    }
    return this._iframe;
  }

  setup(iframe: HTMLIFrameElement) {
    this._iframe = iframe;
    window.addEventListener('message', this._messageHandler);
  }

  destroy() {
    window.removeEventListener('message', this._messageHandler);
  }

  /** 接收 AI 应用的通信数据 */
  messageHandler(e: MessageEvent<ChatAppClientProxyMessage>) {
    const { from, type } = e.data;

    try {
      const urlObj = new URL(this.options.url);
      if (from !== urlObj.origin) {
        return;
      }

      if (this.options.log) {
        // eslint-disable-next-line no-console
        console.log('client', e.data);
      }

      if (type === 'ready') {
        this.options.onReady?.();
      }
      if (type === 'config' && e.data.config && e.data.user) {
        this.options.onConfig?.(e.data.config, e.data.user);
      }
      if (type === 'close') {
        this.options.onClose?.();
      }
      if (type === 'flow-active' && e.data.flow && e.data.activeTimes) {
        this.options.onFlowActive?.(e.data.flow, e.data.activeTimes);
      }
      if (type === 'getter' && e.data.getterId && e.data.getterKey) {
        this.options.onGetter?.(e.data.getterId, e.data.getterKey);
      }
      if (type === 'event' && e.data.eventName) {
        this.options.onEvent?.(e.data.eventName);
      }
      if (type === 'data' && e.data.dataKey && e.data.dataValue) {
        this.options.onData?.(e.data.dataKey, e.data.dataValue);
      }
      this.options.onMessage?.(e.data);
    }
    catch (e) {
      if (this.options.log) {
        console.warn(e);
      }
    }
  }

  /** 向 AI 应用发送通信数据 */
  postMessage<T extends ChatAppActionKey = ChatAppActionKey>(data: ChatAppProxyMessageSet<T>) {
    if (!this._iframe) {
      return;
    }

    const targetWindow = this.iframe.contentWindow;

    if (!targetWindow) {
      return;
    }

    targetWindow.postMessage({
      ...data,
      url: this.options.url,
    } satisfies ChatAppProxyMessage<T>, '*');
  }
}
