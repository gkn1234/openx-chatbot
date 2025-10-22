import type { ChatApp } from './app';
import type { ChatAppConfigData } from './types';

export class ChatAppConfig {
  app: ChatApp;

  constructor(app: ChatApp) {
    this.app = app;
  }

  private _options: ChatAppConfigData = reactive({
    navCollapsed: false,
    width: 1000,
    flows: [],
    activeFlowId: '',
    defaultChatFlowId: 1,
  });

  /** 是否折叠左侧的会话导航 */
  navCollapsed = computed({
    get: () => this._options.navCollapsed,
    set: (val) => {
      if (val === this._options.navCollapsed) {
        return;
      }
      this._options.navCollapsed = val;
      this.app.storage.save('navCollapsed', val);
    },
  });

  /** 窗口界面的宽度 */
  width = computed({
    get: () => this._options.width,
    set: (val) => {
      if (val === this._options.width) {
        return;
      }
      this._options.width = val;
      this.app.storage.save('width', val);
    },
  });

  /** 用户会话缓存 */
  flows = computed({
    get: () => this._options.flows,
    set: (val) => {
      this._options.flows = val;
    },
  });

  /** 列表类型的 WritableComputed 的 set 无法触发，因此需要设置更新缓存方法 */
  flows_storage() {
    this.app.storage.save('flows', this._options.flows);
  }

  /** 用户选中的会话 id */
  activeFlowId = computed({
    get: () => this._options.activeFlowId,
    set: (val) => {
      if (val === this._options.activeFlowId) {
        return;
      }
      this._options.activeFlowId = val;
      this.app.storage.save('activeFlowId', val);
    },
  });

  /** 创建会话时默认智能体 id */
  defaultChatFlowId = computed({
    get: () => this._options.defaultChatFlowId,
    set: (val) => {
      if (val === this._options.defaultChatFlowId) {
        return;
      }
      this._options.defaultChatFlowId = val;
    },
  });

  /** 从本地缓存加载所有的配置项 */
  load() {
    this._options.navCollapsed = this.app.storage.load('navCollapsed', false);
    this._options.width = this.app.storage.load('width', 1000);
    this._options.flows = this.app.storage.load('flows', []);
    this._options.activeFlowId = this.app.storage.load('activeFlowId', '');
    this._options.defaultChatFlowId = this.app.storage.load('defaultChatFlowId', 1);

    this.app.proxy.postMessage({
      type: 'config',
      config: toRaw(this._options),
      user: this.app.user.value,
    });
  }

  set(options?: Partial<ChatAppConfigData>) {
    for (const key in options) {
      const k = key as keyof ChatAppConfigData;
      const getter = this[k];
      if (isRef(getter) && options[k] !== undefined) {
        getter.value = options[k];
      }

      const storageSetter = this[`${k}_storage` as keyof ChatAppConfig];
      if (typeof storageSetter === 'function') {
        storageSetter();
      }
    }
  }
}
