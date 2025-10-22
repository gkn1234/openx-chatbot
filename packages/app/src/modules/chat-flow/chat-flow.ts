import type { ChatApp } from '../chat-app';
import type {
  ChatFlowActionDeleteInput,
  ChatFlowActionDeleteOutput,
  ChatFlowActionHistoryInput,
  ChatFlowActionHistoryOutput,
  ChatFlowActionRenameInput,
  ChatFlowActionRenameOutput,
} from './api';
import type {
  ChatFlowData,
  ChatFlowItemExtra,
  ChatFlowItemOptions,
  ChatFlowOptions,
  ChatFlowOptionsSet,
  WorkflowOptions,
} from './types';
import { nanoid } from 'nanoid';
import { mlopsReq } from '../request';
import { ChatFlowItem } from './chat-flow-item';

export class ChatFlow {
  app: ChatApp;

  /** 智能体 id */
  chatFlowId: number = -1;

  /** 对话 id */
  id = '';

  /** 智能体唯一标识，也是 API 调用凭证 */
  key = '';

  /** API 基础 url */
  baseUrl = '';

  /** 记录滚动值，用于切换对话时还原滚动状态 */
  scrollTop: number = 0;

  /** 在缓存中的索引值 */
  cacheIndex = computed(() => {
    return this.app.config.flows.value.findIndex(item => item.id === this.id);
  });

  /** 将对话流记录记录到缓存中 */
  saveToCache() {
    // 更新缓存
    if (this.cacheIndex.value >= 0) {
      return;
    }

    const { config } = this.app;
    config.flows.value.push(this.getOptions());
    config.flows_storage();

    if (this.isActive.value) {
      this.app.config.activeFlowId.value = this.id;
    }
  }

  /** 智能体信息 */
  flowInfo = computed(() => {
    const info = this.app.chatFlowPresets.value.find(item => item.id === this.chatFlowId);
    return info || null;
  });

  constructor(options: ChatFlowOptions) {
    this.app = options.app;
    // id 只能初始化时指定，后续不可更改
    this.id = options.id || nanoid(10);
    this.resetOptions(options);
  }

  /** 标题是否自动生成 */
  isTitleAuto = false;

  /** 本轮对话的标题 */
  title = ref('');

  /** 展示的标题，在标题为空时会显示默认值 */
  titleDisplay = computed(() => this.title.value || '新对话');

  /** 本轮对话的 assistant 头像 */
  avatar = ref('');

  /** 本轮对话的参数 */
  inputs: Record<string, any> = {};

  /** 是否被激活选中 */
  isActive = computed(() => this.app.activeChatFlow.value === this);

  /** 当前会话 id */
  conversationId = ref('');

  resetOptions(options: ChatFlowOptionsSet) {
    this.chatFlowId = options.chatFlowId;
    this.key = options.key;
    this.baseUrl = options.baseUrl || '';
    this.isTitleAuto = !options.title;
    this.title.value = options.title || '';
    this.avatar.value = options.avatar || '';
    this.inputs = options.inputs || {};
    this.conversationId.value = options.conversationId || '';

    // 更新缓存
    const targetCacheIndex = this.app.config.flows.value.findIndex(item => item.id === this.id);
    if (targetCacheIndex >= 0) {
      this.app.config.flows.value[targetCacheIndex] = this.getOptions();
      this.app.config.flows_storage();
    }
  }

  setOptions(options: Partial<ChatFlowOptionsSet>) {
    this.resetOptions({
      ...this.getOptions(),
      ...options,
    });
  }

  getOptions(): ChatFlowData {
    return {
      id: this.id,
      chatFlowId: this.chatFlowId,
      key: this.key,
      baseUrl: this.baseUrl,
      title: this.title.value,
      avatar: this.avatar.value,
      inputs: toRaw(this.inputs),
      conversationId: this.conversationId.value,
    };
  }

  /** 重置对话 */
  reset(options: ChatFlowOptionsSet) {
    this.items.length = 0;
    this.suggestedQuestions.value = [];
    this.historyEndIndex.value = 0;
    this._activeTimes = 0;
    this.isNameConfirmed = false;

    const oldConversationId = this.conversationId.value;
    this.resetOptions({
      ...options,
      avatar: this.avatar.value,
    });

    this.delete(oldConversationId);

    this.active();
  }

  private _loadPromise: Promise<void> | null = null;

  /** 等待初始化加载 */
  async load() {
    if (!this._loadPromise) {
      return;
    }
    return this._loadPromise;
  }

  /** 是否正在执行初始化请求 */
  isLoading = ref(false);

  /** 历史记录结束位置的索引 */
  historyEndIndex = ref(0);

  /** 加载历史记录 */
  async history() {
    // 初始化时带有会话 id 才进行加载
    if (!this.conversationId.value) {
      return;
    }

    this.isLoading.value = true;
    try {
      const res = await mlopsReq.get<ChatFlowActionHistoryOutput>(`/messages`, {
        params: {
          user: this.app.getUser(),
          conversation_id: this.conversationId.value,
          limit: 100,
        } satisfies ChatFlowActionHistoryInput,
        mlopsKey: this.key,
        baseURL: this.baseUrl,
      });

      const list = res.data.data;
      list.forEach((item) => {
        // 用户问
        this.createItem({
          type: 'common',
          role: 'user',
          content: item.query,
        });

        // 智能体答
        this.createItem({
          type: 'common',
          role: 'assistant',
          content: item.answer,
          rating: item.feedback?.rating || null,
          messageId: item.id,
        });
      });

      this.historyEndIndex.value = list.length * 2;
    }
    catch (e) {
      return await Promise.reject(e);
    }
    finally {
      this.isLoading.value = false;
    }
  }

  /**
   * 删除会话
   * @param conversationId 删除对话的 id，默认为本对话的 id
   */
  async delete(conversationId?: string) {
    const conversationIdToDelete = conversationId || this.conversationId.value;

    if (!conversationIdToDelete) {
      // 还没有获取对话 id，无需调用会话删除接口
      return;
    }

    const res = await mlopsReq.delete<ChatFlowActionDeleteOutput>(`/conversations/${conversationIdToDelete}`, {
      data: {
        user: this.app.getUser(),
      } satisfies Omit<ChatFlowActionDeleteInput, 'conversation_id'>,
      mlopsKey: this.key,
      baseURL: this.baseUrl,
    });

    if (res.data.result !== 'success') {
      throw new Error('Delete failed!');
    }
  }

  /** 编辑状态 */
  editState = computed(() => {
    if (this.isFlowRunning.value) {
      // 流式请求运行过程中，展示终止按钮
      return 'stop';
    }

    if (this.isLoading.value) {
      // 初始化请求加载中，展示 loading
      return 'loading';
    }

    if (this.isRunning.value) {
      // 非流式请求（流式请求完成后续）运行过程中，展示 loading
      return 'loading';
    }

    // 无请求，可编辑
    return 'editable';
  });

  /** 是否处于忙碌状态 */
  isBuzy = computed(() => this.editState.value !== 'editable');

  /** 统计切换次数 */
  private _activeTimes: number = 0;

  /** 选中本对话流 */
  active() {
    this.app.activeChatFlow.value = this;

    // 确保获取到 conversation_id 后，再更新缓存
    if (this.conversationId.value) {
      this.app.config.activeFlowId.value = this.id;
    }

    this.app.router.push(`/chat/${this.id}`);

    if (!this._loadPromise) {
      this._loadPromise = this.history();
    }

    this._loadPromise.finally(() => {
      this._activeTimes++;
      this.app.proxy.postMessage({
        type: 'flow-active',
        flow: this.getOptions(),
        activeTimes: this._activeTimes,
      });
    });
  }

  /** 删除本对话流 */
  remove() {
    const index = this.app.chatFlows.indexOf(this);
    if (index < 0) {
      return;
    }

    const cacheIndex = this.cacheIndex.value;
    this.app.chatFlows.splice(index, 1);

    // 同步删除缓存
    this.app.config.flows.value.splice(cacheIndex, 1);
    this.app.config.flows_storage();

    // 若选中的会话被删除，删除后，自动选中上一个对话
    if (this.app.activeChatFlow.value === this) {
      if (this.app.chatFlows.length <= 0) {
        this.app.toHome();
        return;
      }

      const newIndex = index === this.app.chatFlows.length ? index - 1 : index;
      const newChatFlow = this.app.chatFlows[newIndex];
      newChatFlow.active();
    }
  }

  /** 会话列表 */
  items = shallowReactive<ChatFlowItem[]>([]);

  /** 历史会话列表 */
  historyItems = computed(() => this.items.slice(0, this.historyEndIndex.value));

  /** 本次连接会话列表 */
  currentItems = computed(() => this.items.slice(this.historyEndIndex.value));

  /** 正在运行中的会话 */
  runningItem = shallowRef<ChatFlowItem | null>(null);

  /** 是否有 问答/工作流 请求正在执行 */
  isRunning = computed(() => this.runningItem.value !== null);

  /** 是否有工作流(Stream 请求) 正在运行 */
  isFlowRunning = computed(() => this.runningItem.value ? this.runningItem.value.isFlowRunning.value : false);

  /** 创建一个对话项 */
  createItem(options: Omit<ChatFlowItemOptions, 'flow'>) {
    const item = new ChatFlowItem({
      ...options,
      flow: this,
    });

    return item;
  }

  /** 一轮用户 -> LLM 问答 */
  async chat(query: string) {
    if (this.isBuzy.value) {
      this.app.emitSync('onBuzy');
      return;
    }

    this.createItem({
      type: 'common',
      role: 'user',
      content: query,
    });

    const assistant = this.createItem({ type: 'chat-flow' });
    await assistant.chat(query);
  }

  /** 调用工作流回答 */
  async workflow(options: WorkflowOptions) {
    if (this.isBuzy.value) {
      this.app.emitSync('onBuzy');
      return;
    }

    const assistant = this.createItem({
      type: 'work-flow',
      role: 'assistant',
      workflow: options,
    });
    await assistant.workflow();
  }

  /** 固定内容回答 */
  async answer(content: string, extra?: ChatFlowItemExtra) {
    if (this.isBuzy.value) {
      this.app.emitSync('onBuzy');
      return;
    }

    this.createItem({
      type: 'common',
      role: 'assistant',
      content,
      extra,
    });
  }

  /** 问题建议列表 */
  suggestedQuestions = ref<string[]>([]);

  /** 该对话是否在后台确认设定了名称。未确认名称的对话，在第一次 chat-flow 请求中将调用重命名请求 */
  isNameConfirmed = false;

  /** 重命名会话 */
  async rename() {
    if (!this.conversationId.value) {
      this.app.logger.warn('No conversation id.');
      return;
    }

    try {
      const res = await mlopsReq.post<ChatFlowActionRenameOutput>(`/conversations/${this.conversationId.value}/name`, {
        user: this.app.getUser(),
        auto_generate: this.isTitleAuto,
        name: this.isTitleAuto ? undefined : this.title.value,
      } satisfies Omit<ChatFlowActionRenameInput, 'conversation_id'>, {
        mlopsKey: this.key,
        baseURL: this.baseUrl,
        timeout: 30000,
      });

      this.setOptions({ title: res.data.name });
      this.isNameConfirmed = true;
    }
    catch (e) {
      return Promise.reject(e);
    }
  }
}
