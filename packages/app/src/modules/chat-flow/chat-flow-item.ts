import type {
  ChatFlowActionFeedbackInput,
  ChatFlowActionFeedbackOutput,
  ChatFlowActionStopInput,
  ChatFlowActionStopOutput,
  ChatFlowSuggestedQuestionsInput,
  ChatFlowSuggestedQuestionsOutput,
} from './api';
import type { ChatFlow } from './chat-flow';
import type {
  ChatFlowItemExtra,
  ChatFlowItemOptions,
  ChatFlowItemRole,
  ChatFlowNode,
  WorkflowOptions,
} from './types';
import { isObjectLike } from '@chatbot/utils';
import { mlopsReq } from '../request';
import { streamAction } from '../stream';

export class ChatFlowItem {
  /** 所属对话流 */
  flow: ChatFlow;

  get app() {
    return this.flow.app;
  }

  /** 类型 */
  type: ChatFlowItemOptions['type'];

  /** 对话角色 */
  role: ChatFlowItemRole;

  /** 当前对话内容 */
  content = ref('');

  /** 额外交互内容 */
  extra = ref<ChatFlowItemExtra>();

  /** 工作流类型时，记录工作流信息 */
  workflowOptions?: WorkflowOptions;

  /** 是否为最新的回复 */
  isLast = computed(() => this.flow.items.length - 1 === this.flow.items.indexOf(this));

  constructor(options: ChatFlowItemOptions) {
    this.flow = options.flow;
    this.type = options.type;
    this.role = options.role || 'assistant';
    this.content.value = options.content || '';
    this.extra.value = options.extra;
    this.rating.value = options.rating || null;
    this.messageId.value = options.messageId || '';
    this.workflowOptions = options.workflow;

    this.flow.items.push(this);
  }

  /** 添加内容 */
  append(string: string = '') {
    if (string.includes('</think>')) {
      // 兼容 qwq 模型，为开头补上 <think>
      if (!this.content.value.startsWith('<think>')) {
        this.content.value = `<think>${this.content.value}`;
      }
    }
    this.content.value += (string || '');
  }

  /** 内容替换 */
  textReplace(target: string = '', replace: string = '') {
    if (!target) {
      this.append(replace);
      return;
    }

    // 工具迭代结果返回，提交调用结果
    const lastTag = `</use-tool>`;
    const lastIndex = this.content.value.lastIndexOf(lastTag);
    const lastLength = lastTag.length;

    if (lastIndex >= 0) {
      this.content.value = `${this.content.value.slice(0, lastIndex)}${replace}
${lastTag}${this.content.value.slice(lastIndex + lastLength)}`;
    }
  }

  /** 如果当前对话由智能体回传时的消息 id */
  messageId = ref('');

  /** 如果当前对话由智能体回传时的任务 id，用于请求跟踪与中止 */
  taskId = ref('');

  /** 点赞 / 点踩状态 */
  rating = ref<ChatFlowActionFeedbackInput['rating']>(null);

  /** 对话头像 */
  avatar = computed(() => {
    return this.role === 'assistant' ? this.flow.avatar.value : this.app.userAvatar.value;
  });

  /** 是否正在运行 */
  isRunning = computed(() => {
    return this.flow.runningItem.value === this;
  });

  /**
   * 正在运行包括三个状态的检查：
   * - 工作流是否在运行
   * - 获取推荐问题
   * - (第一次运行)为对话命名
   *
   * 此变量只关心工作流是否正在运行。
   */
  isFlowRunning = ref(false);

  /** 通过对话流更新内容 */
  async chat(query: string) {
    if (this.role === 'user') {
      this.app.logger.warn('User chat item can not be updated by chatflow.');
      return;
    }

    if (this.type !== 'chat-flow') {
      this.app.logger.warn('Only chat-flow item can be updated by chatflow.');
      return;
    }

    if (this.flow.isBuzy.value) {
      this.app.emitSync('onBuzy');
      return;
    }

    if (this.taskId.value) {
      this.app.logger.warn('Chatflow has finished.');
      return;
    }

    const errors: any[] = [];

    let renamePromise: Promise<void> = Promise.resolve();
    let suggestedPromise: Promise<void> = Promise.resolve();

    this.flow.runningItem.value = this;
    this.isFlowRunning.value = true;
    await streamAction({
      url: '/chat-messages',
      baseUrl: this.flow.baseUrl,
      key: this.flow.key,
      waitingTimeout: 20000,
      params: {
        user: this.app.getUser(),
        response_mode: 'streaming',
        inputs: this.flow.inputs,
        conversation_id: this.flow.conversationId.value,
        query,
        name: this.flow.inputs.name,
      },
      onReady: (_done, error) => {
        this._triggerError = error;
      },
      onTimeout: (type) => {
        if (type === 'waiting') {
          this.app.emitSync('onWaitingTimeout', this.flow);
        }
      },
      onWorkflowStarted: (stream) => {
        this.messageId.value = stream.message_id || '';
        this.taskId.value = stream.task_id || '';

        // 第一次获取到会话 id，将之记录到缓存中
        this.flow.saveToCache();
        // 记录会话 id，确保之后能进行连续对话
        this.flow.setOptions({ conversationId: stream.conversation_id || '' });

        if (!this.flow.isNameConfirmed) {
          renamePromise = this.flow.rename().catch((e) => {
            errors.push(e);
          });
        }
      },
      onNodeStarted: (stream) => {
        const { data = {} } = stream;
        this.createNode(data.title || '', data.node_id || '');
      },
      onNodeFinished: (stream) => {
        const { data = {} } = stream;
        this.updateNodeStatus({
          status: data.status || 'succeeded',
          duration: data.elapsed_time || 0,
        }, data.node_id || '');
      },
      onMessage: (stream) => {
        this.append(stream.answer);
      },
      onMessageReplace: (stream) => {
        this.textReplace(stream.answer_replace || '', stream.answer);
      },
      onError: () => {
        this.nodes.value.forEach((node) => {
          if (node.status !== 'running') {
            return;
          }

          this.updateNodeStatus({
            status: 'stopped',
          }, node);
        });
      },
    }).catch((e) => {
      errors.push(e);
    }).finally(() => {
      this.isFlowRunning.value = false;
    });
    // 如果工作流没有指定推荐问题，则尝试自动获取
    suggestedPromise = this.suggested().catch((_e) => {});

    await Promise.allSettled([renamePromise, suggestedPromise]);
    this.flow.runningItem.value = null;

    if (errors.length > 0) {
      const err = errors[0];
      if (!err.isStreamStopped) {
        this.app.aiReq.post('/mlops/failNotice', err.message);
      }
      return Promise.reject(err);
    }
  }

  /** 通过工作流更新内容 */
  async workflow() {
    if (this.role === 'user') {
      this.app.logger.warn('User chat item can not be updated by workflow.');
      return;
    }

    if (this.type !== 'work-flow') {
      this.app.logger.warn('Only work-flow item can be updated by workflow.');
      return;
    }

    if (this.flow.isBuzy.value) {
      this.app.emitSync('onBuzy');
      return;
    }

    if (this.taskId.value) {
      this.app.logger.warn('Workflow has finished.');
      return;
    }

    if (!this.workflowOptions) {
      this.app.logger.warn('Workflow options is required!');
      return;
    }

    const options = this.workflowOptions;
    this.flow.runningItem.value = this;
    this.isFlowRunning.value = true;

    let inputs: Record<string, any> = {};
    if (options.inputs) {
      inputs = options.inputs;
    }
    else if (options.asyncInputs) {
      const res = await options.asyncInputs();
      inputs = isObjectLike(res) ? res : {};
    }

    await streamAction({
      url: '/workflows/run',
      baseUrl: options.baseUrl,
      key: options.key,
      waitingTimeout: 20000,
      params: {
        user: this.app.getUser(),
        response_mode: 'streaming',
        inputs,
      },
      onReady: (_done, error) => {
        this._triggerError = error;
      },
      onTimeout: (type) => {
        if (type === 'waiting') {
          this.app.emitSync('onWaitingTimeout', this.flow);
        }
      },
      onWorkflowStarted: (stream) => {
        this.messageId.value = stream.message_id || '';
        this.taskId.value = stream.task_id || '';
      },
      onNodeStarted: (stream) => {
        const { data = {} } = stream;
        this.createNode(data.title || '', data.node_id || '');
      },
      onNodeFinished: (stream) => {
        const { data = {} } = stream;
        this.updateNodeStatus({
          status: data.status || 'succeeded',
          duration: data.elapsed_time || 0,
        }, data.node_id || '');
      },
      onTextChunk: (stream) => {
        this.append(stream.data?.text);
      },
      onError: () => {
        this.nodes.value.forEach((node) => {
          if (node.status !== 'running') {
            return;
          }

          this.updateNodeStatus({
            status: 'stopped',
          }, node);
        });
      },
    }).finally(() => {
      this.isFlowRunning.value = false;
      this.flow.runningItem.value = null;
    });
  }

  /** 中止由按钮触发，注意避免重复请求 */
  private _isStopping = false;

  /** 终止流式请求的方法 */
  private _triggerError: ((e: Error) => void) | null = null;

  /** 手动中止流式请求 */
  async stop() {
    if (this.role === 'user') {
      this.app.logger.warn('User chat item can not stop chatflow or workflow.');
      return;
    }

    if (this.type === 'common') {
      this.app.logger.warn('Common chat item can not stop chatflow or workflow.');
      return;
    }

    if (!this.isRunning.value) {
      this.app.logger.warn('Chatflow or workflow is not running.');
      return;
    }

    if (!this.taskId.value) {
      this.app.logger.warn('No task id.');
      return;
    }

    if (this._isStopping) {
      return;
    }

    this._isStopping = true;
    try {
      const url = this.type === 'chat-flow' ?
        `/chat-messages/${this.taskId.value}/stop` :
        `/workflows/tasks/${this.taskId.value}/stop`;
      const key = this.type === 'chat-flow' ? this.flow.key : this.workflowOptions?.key || '';
      const baseUrl = this.type === 'chat-flow' ? this.flow.baseUrl : this.workflowOptions?.baseUrl || '';

      const res = await mlopsReq.post<ChatFlowActionStopOutput>(url, {
        user: this.app.getUser(),
      } satisfies Omit<ChatFlowActionStopInput, 'task_id'>, {
        mlopsKey: key,
        baseURL: baseUrl,
      });

      if (res.data.result !== 'success') {
        throw new Error('Stop chatflow or workflow failed!');
      }

      // 终止成功
      const err = new Error('Chatflow or workflow is stopped by user.');
      err.isStreamStopped = true;
      this._triggerError?.(err);
    }
    catch (e: any) {
      return await Promise.reject(e);
    }
    finally {
      this._isStopping = false;
    }
  }

  /**
   * 根据本条消息，获取下一轮建议问题列表
   *
   * type=chat-flow 或者 type=common(历史消息) 时可用
   */
  async suggested() {
    if (this.role === 'user') {
      this.app.logger.warn('User chat item can not get suggested questions.');
      return;
    }

    if (!this.messageId.value) {
      this.app.logger.warn('No message id.');
      return;
    }

    try {
      const res = await mlopsReq.get<ChatFlowSuggestedQuestionsOutput>(`/messages/${this.messageId.value}/suggested`, {
        params: {
          user: this.app.getUser(),
        } satisfies Omit<ChatFlowSuggestedQuestionsInput, 'message_id'>,
        mlopsKey: this.flow.key,
        baseURL: this.flow.baseUrl,
      });

      if (res.data.result !== 'success') {
        throw new Error('Get suggested questions failed!');
      }

      this.flow.suggestedQuestions.value = res.data.data;
    }
    catch (e: any) {
      return Promise.reject(e);
    }
  }

  /** 反馈由按钮触发，注意避免重复请求 */
  private _isFeedbacking = false;

  /**
   * 反馈，点赞或点踩
   *
   * type=chat-flow 或者 type=common(历史消息) 时可用
   */
  async feedback(rating: ChatFlowActionFeedbackInput['rating']) {
    if (this.role === 'user') {
      this.app.logger.warn('User chat item can not feedback.');
      return;
    }

    if (!this.messageId.value) {
      this.app.logger.warn('No message id.');
      return;
    }

    if (this._isFeedbacking) {
      return;
    }

    this._isFeedbacking = true;
    try {
      const res = await mlopsReq.post<ChatFlowActionFeedbackOutput>(`/messages/${this.messageId.value}/feedbacks`, {
        user: this.app.getUser(),
        rating,
      } satisfies Omit<ChatFlowActionFeedbackInput, 'message_id'>, {
        mlopsKey: this.flow.key,
        baseURL: this.flow.baseUrl,
      });

      if (res.data.result !== 'success') {
        throw new Error('Feedback failed!');
      }

      this.rating.value = rating;
    }
    catch (e: any) {
      return await Promise.reject(e);
    }
    finally {
      this._isFeedbacking = false;
    }
  }

  /** 节点列表 */
  nodes = ref<ChatFlowNode[]>([]);

  /** 新建节点 */
  createNode(name: string, id: string) {
    this.nodes.value.push({
      id,
      name,
      status: 'running',
      duration: 0,
    });
  }

  /**
   * 更新节点的状态
   * @param nodeData 节点更新数据
   * @param targetNode 目标节点。若不指定，更新最后的节点。若指定为字符串，将字符串作为 id 查找更新节点
   */
  updateNodeStatus(nodeData: Partial<ChatFlowNode>, targetNode?: ChatFlowNode | string) {
    const len = this.nodes.value.length;
    let node: ChatFlowNode | undefined;
    if (typeof targetNode === 'string') {
      node = this.nodes.value.find(n => n.id === targetNode);
    }
    else if (isObjectLike(targetNode)) {
      node = targetNode;
    }
    else {
      node = this.nodes.value[len - 1];
    }

    if (!node) {
      return;
    }

    Object.assign(node, nodeData);
  }
}
