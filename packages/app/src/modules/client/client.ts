import type { ChatAppClientProxyOptions } from '../proxy';
import type {
  ChatClientOptions,
} from './types';
import { ChatClientProxy } from '../proxy/proxy-client';

const CLIENT_PROVIDE = Symbol('client') as InjectionKey<ChatClient>;

export class ChatClient {
  static use() {
    const res = inject(CLIENT_PROVIDE);
    if (!res) {
      throw new Error('Chat client has not initialized!');
    }
    return res;
  }

  options: ChatClientOptions;

  proxy: ChatClientProxy;

  constructor(options: ChatClientOptions) {
    this.options = {
      preload: true,
      waiting: 0,
      ...options,
    };
    this.proxy = new ChatClientProxy(this._proxyOptions());
  }

  private _proxyOptions(): Required<ChatAppClientProxyOptions> {
    return {
      url: this.options.url,
      log: this.options.log || false,
      onReady: () => {
        this.loading.value = false;
        this.options.onReady?.();
      },
      onConfig: (config, user) => {
        this.size.value = config.width;
        this.options.onConfig?.(config, user);
      },
      onClose: () => {
        this.visible.value = false;
        this.options.onClose?.();
      },
      onMessage: (data) => {
        this.options.onMessage?.(data);
      },
      onFlowActive: (flow, times) => {
        this.options.onFlowActive?.(flow, times);
      },
      onGetter: (id, key) => {
        this.options.onGetter?.(id, key);
      },
      onEvent: (event) => {
        this.options.onEvent?.(event);
      },
      onData: (key, val) => {
        this.options.onData?.(key, val);
      },
    };
  }

  provide() {
    provide(CLIENT_PROVIDE, this);
  }

  /** 标签是否展示 */
  tipVisible = ref(false);

  /** 手动展示标签 */
  showTip() {
    this.tipVisible.value = true;
  }

  /** 抽屉是否展开 */
  visible = ref(false);

  /** 抽屉展开次数 */
  openTimes = 0;

  /** AI 应用是否正在加载 */
  loading = ref(true);

  /** 抽屉尺寸 */
  size = ref(1000);
}
