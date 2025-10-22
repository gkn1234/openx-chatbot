import type {
  ChatFlowInfo,
  ChatFlowItemExtra,
  ChatFlowOptionsPresetSet,
  WorkflowOptions,
} from '../chat-flow';
import type { InputSkillOptions } from '../input/types';
import type { ChatApp } from './app';
import type { ChatAppConfigData } from './types';

export class ChatAppAction {
  app: ChatApp;

  constructor(app: ChatApp) {
    this.app = app;
  }

  setChatFlowPresets(presets: ChatFlowInfo[]) {
    this.app.chatFlowPresets.value = presets;
  }

  addChatFlowPresets(presets: ChatFlowInfo[]) {
    this.app.chatFlowPresets.value.push(...presets);
  }

  setAppid(id: string) {
    this.app.appid = id;
  }

  setTitle(title: string, logo: string, tag: string) {
    this.app.nav.titleText.value = title;
    this.app.nav.titleLogo.value = logo;
    this.app.nav.titleTag.value = tag;
  }

  setUser(id: string, name: string, avatar: string) {
    this.app.user.value = id;
    this.app.userName.value = name;
    this.app.userAvatar.value = avatar;
  }

  setConfig(options?: Partial<ChatAppConfigData>) {
    this.app.config.set(options);
  }

  createChatFlow(options: ChatFlowOptionsPresetSet) {
    this.app.createChatFlowByPreset(options);
  }

  /**
   * 给定参数，激活满足条件的对话。如果相关对话不存在，创建新对话
   */
  activateChatFlow(options: ChatFlowOptionsPresetSet) {
    const validate = (subset: Record<string, any>, superset: Record<string, any>) => {
      const superKeys = Object.keys(superset);
      const subKeys = Object.keys(subset);

      // 若目标对话有参数，而配置项没有，判定为不匹配
      if (superKeys.length && !subKeys.length) {
        return false;
      }

      // 配置项为目标对话参数的子集，视为匹配
      for (const key in subset) {
        if (
          Object.prototype.hasOwnProperty.call(subset, key) &&
          (
            !Object.prototype.hasOwnProperty.call(superset, key) ||
            String(subset[key]) !== String(superset[key])
          )
        ) {
          return false;
        }
      }
      return true;
    };

    const target = this.app.chatFlows.find((flow) => {
      return validate(options.inputs || {}, flow.inputs) && flow.chatFlowId === options.chatFlowId;
    });

    if (target) {
      target.active();
      return;
    }

    this.createChatFlow(options);
  }

  /** 将当前对话滚动到底部 */
  scrollToBottom(behavior: ScrollBehavior = 'smooth') {
    if (!this.app.activeChatFlow.value) {
      return;
    }

    this.app.nav.toBottom(behavior);
  }

  /** 当前对话进行一轮对话 */
  chat(query: string) {
    this.app.activeChatFlow.value?.chat(query);
  }

  /** 当前对话调用工作流 */
  workflow(options: WorkflowOptions) {
    this.app.activeChatFlow.value?.workflow(options);
  }

  /** 当前对话发送常规内容 */
  answer(content: string, extra?: ChatFlowItemExtra) {
    this.app.activeChatFlow.value?.answer(content, extra);
  }

  /** 将 AI 应用需要的数据回传 */
  sendGetterData(id: string, value: any) {
    this.app.emitSync('onReceived', id, value);
  }

  /** 取消当前选中的对话流，回到首页 */
  toHome(type: 'push' | 'replace' = 'push') {
    this.app.toHome(type);
  }

  /** 设置技能状态 */
  setSkill(key: string, options: Partial<Omit<InputSkillOptions, 'key'>>) {
    this.app.input.setSkill(key, options);
  }

  /**
   * 设置技能与技能参数
   *
   * 由于当前智能体限制，无法再对话中切换技能与设置参数，故只能在首页设置，需要配合 toHome 方法使用
   */
  triggerSkill(
    key: string,
    params?: Record<string, any> & { triggerSign?: 'home' | 'chat' },
    ...args: any[]
  ) {
    const { triggerSign, ...rest } = params || {};
    Object.assign(this.app.input.params.value, rest || {});
    this.app.input.triggerSkill(key, triggerSign, ...args);
  }

  /** 以当前的技能与输入状态，发送对话消息  */
  sendMessage(query: string) {
    this.app.input.query.value = query;
    this.app.input.sendChatMessage();
  }

  /** 获取当前所有对话流 */
  getChatFlows(dataKey: string) {
    this.app.proxy.postMessage({
      type: 'data',
      dataKey,
      dataValue: this.app.chatFlows.map(flow => flow.getOptions()),
    });
  }

  /** 根据 id 激活对话流 */
  activateChatFlowById(id: string) {
    this.app.chatFlows.find(flow => flow.id === id)?.active();
  }
}
