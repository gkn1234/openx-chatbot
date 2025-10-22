import type { AgentService } from '../agent.service';
import type {
  MessageChunk,
  MessageChunkCheck,
} from '../types';
import type { AgentRequestContext } from './context';
import { AgentUtils } from './agent-utils';
import { ModelCompletions } from './completions';
import { AgentTools } from './tools';

export class AgentBase {
  /** Agent 名称，每个 Agent 都需要重写 */
  static agentName = '';

  /** 上层服务对象 */
  service: AgentService;

  /** 工具调用管理器 */
  tools: AgentTools;

  /** Agent 常用工具 */
  utils: AgentUtils;

  get logger() {
    return this.service.logger;
  }

  /** 数据库操作对象 */
  get db() {
    return this.service.db;
  }

  get name() {
    return (this.constructor as any).agentName as string;
  }

  id = 0;

  /** Agent 最大迭代次数 */
  maxRound = 5;

  constructor(service: AgentService) {
    this.service = service;
    this.tools = new AgentTools(this);
    this.utils = new AgentUtils(this);
  }

  private _model?: ModelCompletions;

  /** 对话主模型 */
  get model() {
    if (!this._model) {
      throw new Error('模型尚未完成初始化！');
    }
    return this._model;
  }

  async init(modelName: string = '') {
    const res = await this.db.t_chatbot_agent.findUniqueOrThrow({
      where: {
        name: this.name,
      },
    });
    this.id = res.id;
    this.maxRound = res.maxRound;

    let modelId = res.modelId;

    const [provider = '', modelKey = ''] = modelName.split('/');
    const modelRes = await this.db.t_chatbot_model.findUnique({
      select: { id: true },
      where: {
        provider_name: {
          provider,
          name: modelKey,
        },
      },
    });
    if (modelRes) {
      modelId = modelRes.id;
    }

    this._model = new ModelCompletions(this, modelId);
    await this._model.init();
  }

  /** 阻塞请求调用 */
  async blockRequest(context: AgentRequestContext) {
    const res = await this.process(context).catch((err) => {
      this.processError(context);
      return Promise.reject(err);
    }).finally(() => {
      context.cleanUpRequest();
    });

    return res;
  }

  /** 流式请求调用 */
  streamRequest(context: AgentRequestContext) {
    const {
      res,
      subject,
    } = context;

    if (!res || !subject) {
      throw new Error('流式请求对象错误！');
    }

    // 启动多轮循环
    this.process(context).catch((err) => {
      subject.error(`对话处理失败：${err.message}`);
    });

    const subscription = context.subscribe({
      next: data => res.write(data),
      error: (errMsg) => {
        // 向客户端发送信息
        res.write(this.toChunkText(context, {
          event: 'error',
          message: errMsg,
        }));

        // 处理错误结果
        this.processError(context);

        context.cleanUpRequest();
        res.end();
      },
      complete: () => {
        subject?.next(this.toChunkText(context, {
          event: 'workflow_finished',
          data: { status: 'succeeded' },
        }));

        context.cleanUpRequest();
        res.end();
      },
    });

    // 客户端断开连接时取消订阅
    res.on('close', () => {
      context.cleanUpRequest();
      res.end();
    });

    return subscription;
  }

  /**
   * 对话轮询
   * @param context 请求上下文
   */
  protected async process(context: AgentRequestContext) {
    context.round++;
    context.messageRound = '';

    await this.processConversationInit(context);
    await this.processMessageInit(context);
    await Promise.all([
      this.processSystemPrompt(context),
      this.processUserPrompt(context),
    ]);
    await this.processCompletions(context);
    await this.processResult(context);
  }

  /** 会话初始化，创建成功后会生成会话 id */
  protected async processConversationInit(context: AgentRequestContext) {
    // 多轮迭代场景，直接跳过
    if (!context.isFirstRound) {
      return;
    }

    context.checkStop();

    if (context.isFirstMessage) {
      // 首次对话，初始化会话
      const res = await this.db.t_chatbot_conversation.create({
        data: {
          userId: context.userId,
          title: context.title,
          type: context.type,
        },
      });
      context.conversationId = res.id;
    }

    // 设置会话忙碌，准备进行后续对话
    await this.db.t_chatbot_conversation.update({
      where: { id: context.conversationId },
      data: { status: 'buzy' },
    });
  }

  /** 对话初始化，创建成功后生成 message_id */
  protected async processMessageInit(context: AgentRequestContext) {
    // 多轮迭代场景，直接跳过
    if (!context.isFirstRound) {
      return;
    }

    context.checkStop();

    const res = await this.db.t_chatbot_message.findUnique({
      where: { id: context.messageId },
    });

    if (res) {
      // 若 messageId 非空并找到对应信息，则为重新生成对话场景，提取当时的用户输入
      context.inputs = res.inputs as any;
      context.query = res.query;
      context.messageCreateTime = res.createdAt;

      await this.db.t_chatbot_message.update({
        where: { id: context.messageId },
        data: { status: 'running' },
      });
    }
    else {
      // 生成新对话场景
      const newMessage = await this.db.t_chatbot_message.create({
        data: {
          conversationId: context.conversationId,
          agentId: this.id,
          inputs: context.inputs,
          query: context.query,
          processContent: '',
          answer: '',
          status: 'running',
        },
      });

      context.messageId = newMessage.id;
      context.messageCreateTime = newMessage.createdAt;
    }

    context.registerMessageRequest();

    context.subject?.next(this.toChunkText(context, {
      event: 'workflow_started',
    }));
  }

  /** 大模型请求 */
  protected async processCompletions(context: AgentRequestContext) {
    context.checkStop();

    context.controller = new AbortController();
    await context.savePrompt();
    await this.model.completions({
      system: context.system,
      user: context.user,
      controller: context.controller,
      onStreamChunk: (chunk) => {
        const text = chunk.content.toString();
        context.messageRound += text;
        // 推送 AI 生成的文本内容（SSE 格式）
        context.subject?.next(this.toChunkText(context, {
          event: 'message',
          answer: text,
        }));
      },
      onRequestStart: async () => {
      },
    }).finally(() => {
      context.controller = null;
    });
    await context.saveOutput();
  }

  /** 结果解析 */
  protected async processResult(context: AgentRequestContext) {
    context.checkStop();

    await this.tools.resolveToolCallFromMessage(context);

    if (!context.lastCall.output) {
      const lastTag = `</use-tool>`;
      const lastIndex = context.messageRound.lastIndexOf(lastTag);
      const lastLength = lastTag.length;
      // 工具迭代结果返回，提交调用结果
      const toolResult = `<result state="${context.lastCall.state}">
${context.lastCall.result}
</result>`;;

      // 补充工具调用结果
      if (lastIndex >= 0) {
        context.subject?.next(this.toChunkText(context, {
          event: 'message_replace',
          answer_replace: lastTag,
          answer: toolResult,
        }));

        context.messageRound = `${context.messageRound.slice(0, lastIndex)}${toolResult}
${lastTag}${context.messageRound.slice(lastIndex + lastLength)}`;
      }

      // 保存目前的迭代内容
      context.messageProcess += `\n${context.messageRound}`;
      await this.db.t_chatbot_message.update({
        where: { id: context.messageId },
        data: { processContent: context.messageProcess },
      });

      // 工具调用成功的结果进入数据库
      if (context.lastCall.state === 'success') {
        await this.tools.saveToolCallMemory(context);
      }

      await this.process(context);
      return;
    }

    // 最终结果保存
    await this.db.t_chatbot_message.update({
      where: { id: context.messageId },
      data: {
        answer: context.messageRound,
        status: 'success',
      },
    });

    context.state = 'success';
    context.subject?.complete();
    context.finalResult = context.messageRound;
  }

  /** 错误结果处理 */
  async processError(context: AgentRequestContext) {
    // 非手动终止场合下，设为失败。
    if (context.state !== 'stopped') {
      context.state = 'failed';
    }

    // 最终结果保存
    await this.db.t_chatbot_message.update({
      where: { id: context.messageId },
      data: {
        answer: context.messageRound,
        status: context.state,
      },
    });
    context.finalResult = context.messageRound;
  }

  /** 向客户端发送流式信息 */
  toChunkText(context: AgentRequestContext, data: MessageChunkCheck) {
    return `data: ${JSON.stringify({
      task_id: context.messageId || '',
      message_id: context.messageId || '',
      conversation_id: context.conversationId || '',
      ...data,
    } satisfies MessageChunk)}\n`;
  }

  /** 系统提示词构造，需要重写 */
  protected async processSystemPrompt(context: AgentRequestContext) {
    context.checkStop();

    context.system = '';
  }

  /** 用户提示词构造，需要重写 */
  protected async processUserPrompt(context: AgentRequestContext) {
    context.checkStop();

    const [messagePrompt, toolCallPrompt] = await Promise.all([
      this.toHistoryMessagePrompt(context),
      this.toHistoryToolCallPrompt(context),
    ]);
    context.user = `${messagePrompt}
${toolCallPrompt}
${this.toInputPrompt(context)}
${this.toUserQueryPrompt(context)}
${this.toToolCallPrompt(context)}`;
  }

  /** 生成历史对话提示词部分 */
  async toHistoryMessagePrompt(context: AgentRequestContext) {
    // 首次发起会话，没有历史提示词部分
    if (context.isFirstMessage) {
      return '';
    }

    const historyMessagePrompt = await this.utils.toHistoryMessagePrompt(
      context.conversationId,
      context.messageCreateTime,
    );

    if (historyMessagePrompt.length <= 0) {
      return '';
    }

    return `<history-chats>

历史对话记录如下：

${historyMessagePrompt}

</history-chats>`;
  }

  /** 生成历史工具调用的提示词部分 */
  protected async toHistoryToolCallPrompt(context: AgentRequestContext) {
    // 首次发起会话，没有历史工具调用部分
    if (context.isFirstMessage) {
      return '';
    }

    // 第一步：查找当前 message 的 createdAt
    const currentMessage = await this.db.t_chatbot_message.findUnique({
      where: { id: context.messageId },
      select: { createdAt: true },
    });

    if (!currentMessage) {
      return '';
    }

    // 第二步：查找同 conversation 下，早于当前 message 的所有 memory
    const memories = await this.db.t_chatbot_memory.findMany({
      where: {
        conversationId: context.conversationId,
        createdAt: { lt: currentMessage.createdAt },
        expiresAt: { gt: new Date() },
        type: 'toolcall',
      },
      orderBy: { createdAt: 'asc' }, // 可选，按时间升序
    });

    return `\n<history-tool-use>

历史工具调用结果如下：

${memories.map(m => m.content).join('\n')}

</history-tool-use>`;
  }

  /** 输入参数提示词部分 */
  protected toInputPrompt(context: AgentRequestContext) {
    return `\n<input>\n${JSON.stringify(context.inputs)}\n</input>`;
  }

  /** 用户问题提示词部分 */
  protected toUserQueryPrompt(context: AgentRequestContext) {
    return `\n当前用户输入：\n${context.query}\n`;
  }

  /** Agent 本轮工具迭代提示词部分 */
  protected toToolCallPrompt(context: AgentRequestContext) {
    const maxRoundPrompt = context.round >= this.maxRound ?
      '\n本次对话已经到达 Agent 迭代的最大轮数，请回复用户最终结果，禁止再调用其他工具进行迭代。' :
      '';

    const toolProcessPrompt = context.messageProcess ?
      `\n\n<current-tool-use>
    
本轮对话迭代工具调用结果如下
    
${context.messageProcess}

</current-tool-use>` :
      '';

    return `${toolProcessPrompt}${maxRoundPrompt}`;
  }
}
