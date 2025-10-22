import type { ChatApp } from '../chat-app';
import type {
  ChatAppClientProxyMessage,
  ChatAppClientProxyMessageSet,
  ChatAppProxyMessage,
} from './types';
import { nanoid } from 'nanoid';

export class ChatAppProxy {
  app: ChatApp;

  constructor(app: ChatApp) {
    this.app = app;

    const handler = this.messageHandler.bind(this);
    window.addEventListener('message', handler);
    onBeforeUnmount(() => {
      window.removeEventListener('message', handler);
    });

    // 发送初始化完成的信息
    this.postMessage({ type: 'ready' });
  }

  /** 向客户端外发通信数据 */
  postMessage(data: ChatAppClientProxyMessageSet) {
    window.parent.postMessage({
      ...data,
      from: window.location.origin,
    } satisfies ChatAppClientProxyMessage, '*');
  }

  /** 接收客户端的通信数据 */
  messageHandler(e: MessageEvent<ChatAppProxyMessage>) {
    const {
      action,
      params,
      url,
    } = e.data;

    const enableLog = /log=true/.test(window.location.search);

    try {
      const urlObj = new URL(url);

      if (urlObj.origin !== window.location.origin) {
        return;
      }

      if (enableLog) {
        this.app.logger.log('app', e.data);
      }

      const actionFunc: any = this.app.action[action].bind(this.app.action);
      actionFunc?.(...params);
    }
    catch (e) {
      if (enableLog) {
        this.app.logger.warn(e);
      }
    }
  }

  /** 向客户端请求数据，若超时，返回 undefined */
  getDataFromClient(key: string, timeout: number = 3000) {
    const getterId = nanoid(8);

    let timer: ReturnType<typeof setTimeout>;
    return new Promise<any>((resolve) => {
      const getterHandler = (id: string, value: any) => {
        if (id === getterId) {
          clearTimeout(timer);
          this.app.off('onReceived', getterHandler);
          resolve(value);
        }
      };

      timer = setTimeout(() => {
        clearTimeout(timer);
        this.app.off('onReceived', getterHandler);
        resolve(undefined);
      }, timeout);

      this.app.on('onReceived', getterHandler);

      this.postMessage({
        type: 'getter',
        getterId,
        getterKey: key,
      });
    });
  }
}
