// import type { Fetch } from '@app/api';
// import type { AiCommunityApi } from '@openx/api-openx';
import type { InjectionKey } from 'vue';
import type {
  ChatFlowInfo,
  ChatFlowOptions,
  ChatFlowOptionsPresetSet,
} from '../chat-flow';
import type { ChatAppEvents } from './types';
// import { useApi } from '@app/api';
import { useRoute, useRouter } from 'vue-router';
import { ChatFlow, defaultChatflowPreset } from '../chat-flow';
import { ChatAppInput } from '../input';
import { ChatAppProxy } from '../proxy';
import { EventEmitter } from '../utils';
import { ChatAppAction } from './action';
import { ChatAppConfig } from './config';
import { ChatNav } from './nav';
import { ChatAppStorage } from './storage';

const APP_PROVIDE = Symbol('app') as InjectionKey<ChatApp>;

/** 只能在 vue 上下文中初始化 */
export class ChatApp extends EventEmitter<ChatAppEvents> {
  static init() {
    const app = new ChatApp();
    provide(APP_PROVIDE, app);
    return app;
  }

  static use() {
    const res = inject(APP_PROVIDE);
    if (!res) {
      throw new Error('App has not initialized!');
    }
    return res;
  }

  static useModule<T = any>(provideKey: InjectionKey<T>) {
    const res = inject(provideKey);
    if (!res) {
      throw new Error('Module has not initialized!');
    }
    return res;
  }

  router: ReturnType<typeof useRouter>;

  route: ReturnType<typeof useRoute>;

  isHome = computed(() => this.route.name === 'home');

  isChat = computed(() => this.route.name === 'chat');

  logger = console;

  proxy: ChatAppProxy;

  action = new ChatAppAction(this);

  storage = new ChatAppStorage(this);

  config = new ChatAppConfig(this);

  nav: ChatNav;

  input = new ChatAppInput(this);

  /** 智能体预设列表 */
  chatFlowPresets = ref<ChatFlowInfo[]>(defaultChatflowPreset());

  /** ai 接口请求对象 */
  // aiReq: Fetch<AiCommunityApi>;

  constructor() {
    super();

    /*
    const { ai } = useApi();
    this.aiReq = ai;
    */

    this.router = useRouter();
    this.route = useRoute();
    this.proxy = new ChatAppProxy(this);
    this._setupUser();
    this.nav = new ChatNav(this);
  }

  /** 应用表示 */
  appid = 'openx';

  /** 用户唯一标识 */
  user = ref('');

  /** 用户头像，要在 UI 层面展示 */
  userAvatar = ref('');

  /** 用户名称 */
  userName = ref('');

  /** MLOPS user 标识必传，因此用此方法获取 user */
  getUser() {
    return this.user.value || 'guest';
  }

  private _setupUser() {
    watch(this.user, (user) => {
      this._userLogout();

      if (!user) {
        return;
      }

      this._userLogin();
    });
  }

  private _userLogout() {
    this.chatFlows.length = 0;
    this.activeChatFlow.value = null;
  }

  private _userLogin() {
    this.config.load();

    // 还原用户会话
    this.config.flows.value.forEach((options) => {
      this.createChatFlow(options, false);
    });
    const activeTarget = this.chatFlows.find(item => item.id === this.config.activeFlowId.value);
    if (activeTarget) {
      activeTarget.active();
    }
  }

  /** 对话列表 */
  chatFlows = shallowReactive<ChatFlow[]>([]);

  /** 展示在导航侧的对话列表 */
  navChatFlows = computed(() => this.chatFlows.filter(item => item.conversationId.value));

  /** 当前选中对话 */
  activeChatFlow = shallowRef<ChatFlow | null>(null);

  /** 当前选中对话对应的智能体 id */
  activeChatFlowId = computed(() => this.activeChatFlow.value ? this.activeChatFlow.value.id : '');

  /** 是否禁止发送消息 */
  editDisabled = computed(() => {
    if (!this.activeChatFlow.value) {
      return false;
    }

    return this.activeChatFlow.value.editState.value !== 'editable';
  });

  /**
   * 创建一个对话
   * @param options 对话配置
   * @param active 是否选中对话。默认 true
   */
  createChatFlow(options: Omit<ChatFlowOptions, 'app'>, active: boolean = true) {
    const flow = new ChatFlow({
      ...options,
      app: this,
    });

    this.chatFlows.unshift(flow);

    if (active) {
      flow.active();
    }

    return flow;
  }

  createChatFlowByPreset(options: ChatFlowOptionsPresetSet) {
    const target = this.chatFlowPresets.value.find(item => item.id === options.chatFlowId);
    if (!target) {
      return;
    }

    return this.createChatFlow({
      ...options,
      key: target.key,
      baseUrl: target.baseUrl,
    });
  }

  /** 取消对话选中 */
  cancelChatFlowSelect() {
    this.activeChatFlow.value = null;
    this.config.activeFlowId.value = '';
  }

  /** 返回首页 */
  toHome(type: 'push' | 'replace' = 'push') {
    if (this.isHome.value) {
      return;
    }

    this.cancelChatFlowSelect();
    this.router[type]('/');
  }

  /** 路由前往某个对话页面 */
  toChat(id: string) {
    const target = this.chatFlows.find(item => item.id === id);
    if (!target) {
      return;
    }

    target.active();
  }
}
