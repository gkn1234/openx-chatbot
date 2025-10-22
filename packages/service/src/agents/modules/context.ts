import type { ChatConversationType, ChatMessageState } from '@openx/db-ai';
import type { Response } from 'express';
import type { Observer, Subscription } from 'rxjs';
import type { BaseChatDto } from '../dto';
import type { ToolHandleResult } from '../types';
import type { AgentBase } from './agent';
import { appendFile, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import dayjs from 'dayjs';
import { Subject } from 'rxjs';
import { workspace } from '../../utils';

export class AgentRequestContext {
  /** 智能体对象 */
  agent: AgentBase;

  /** 数据库对象 */
  get db() {
    return this.agent.db;
  }

  /** 服务对象 */
  get service() {
    return this.agent.service;
  }

  /** 响应对象 */
  res?: Response;

  /** 请求中断控制器 */
  controller?: AbortController | null;

  /** 流式推送对象 */
  subject?: Subject<string>;

  /** 流式请求订阅 */
  subscription?: Subscription;

  /** 是否为阻塞请求 */
  get isBlock() {
    return !this.res;
  }

  /** 是否为会话的第一次对话 */
  isFirstMessage = false;

  /** 是否为本次对话的首轮迭代 */
  get isFirstRound() {
    return this.round === 1;
  }

  /** 请求状态 */
  state: ChatMessageState = 'running';

  checkStop() {
    if (this.state !== 'running') {
      throw new Error('对话请求已终止');
    }
  }

  /** 请求最终结果（LLM 完整输出） */
  finalResult = '';

  constructor(agent: AgentBase, body: BaseChatDto, res?: Response) {
    this.agent = agent;
    this.res = res;

    this.conversationId = body.conversation_id || '';
    if (!this.conversationId) {
      this.isFirstMessage = true;
    }
    this.query = body.query;
    this.inputs = body.inputs || {};
    this.userId = body.user;
    this.title = body.title || '';
    this.type = body.type || 'main';

    if (res) {
      this.subject = new Subject<string>();
    }
  }

  /** 建立 stream 长连接 */
  subscribe(options: Observer<string>) {
    if (!this.subject) {
      return;
    }

    const stream = this.subject.asObservable();
    const subscription = stream.subscribe(options);
    this.subscription = subscription;
    return subscription;
  }

  /** 父 Agent 调用上下文 */
  parentContext: AgentRequestContext | null = null;

  /** 子 Agent 调用上下文 */
  subContexts = new Set<AgentRequestContext>();

  /** 注册子 Agent 调用上下文 */
  registerSubContext(context: AgentRequestContext) {
    this.subContexts.add(context);
    context.parentContext = this;
  }

  /** 停止子 Agent 调用上下文 */
  removeSubContext(context: AgentRequestContext) {
    this.subContexts.delete(context);
    context.parentContext = null;
  }

  /** 停止对话请求 */
  async stopRequest() {
    this.state = 'stopped';
    // 中断当前可能存在的大模型请求
    this.controller?.abort();
    // 终止所有子 Agent
    this.subContexts.forEach(subContext => subContext.stopRequest());
  }

  /** 清理一次对话所占用的连接资源 */
  async cleanUpRequest() {
    this.parentContext?.removeSubContext(this);
    this.subContexts.forEach(context => this.removeSubContext(context));

    this.subscription?.unsubscribe();
    this.service.messageControllerMap.delete(this.messageId);

    // 解除会话忙碌状态
    await this.db.t_chatbot_conversation.update({
      where: { id: this.conversationId },
      data: { status: 'normal' },
    });
  }

  /** 会话 id */
  conversationId = '';

  /** 用户 id */
  userId = '';

  /** 用户提问 */
  query = '';

  /** 初始标题 */
  title = '';

  /** 用户输入 */
  inputs: Record<string, any> = {};

  /** 对话类型 */
  type: ChatConversationType = 'main';

  /** 对话 id */
  messageId = '';

  /** 注册对话 */
  registerMessageRequest() {
    if (!this.messageId) {
      throw new Error('消息 ID 为空，无法注册对话');
    }
    this.service.messageControllerMap.set(this.messageId, this);
  }

  /** 工具迭代记录 */
  toolCalls: ToolHandleResult[] = [];

  /** 最后一轮迭代记录 */
  get lastCall() {
    const len = this.toolCalls.length;
    if (len <= 0) {
      throw new Error('工具迭代记录为空，禁止访问');
    }

    return this.toolCalls[len - 1];
  }

  /** 对话单轮迭代内容 */
  messageRound = '';

  /** 对话多轮迭代记录 */
  messageProcess = '';

  /** 对话发生时间，用于筛选出在此之前的历史对话 */
  messageCreateTime = new Date();

  /** 迭代轮数 */
  round = 0;

  /** 本轮迭代 system 提示词 */
  system = '';

  /** 本轮迭代 user 提示词 */
  user = '';

  /**
   * 输出本轮对话 Prompt 到文件
   *
   * @param system 系统提示词，默认为本上下文对象中获取
   * @param user 用户提示词，默认从本上下文对象中获取
   * @param suffix 文件名称后缀，默认为当前迭代轮数
   */
  async savePrompt(
    system: string = '',
    user: string = '',
    suffix: number | string = '',
  ) {
    const dir = workspace('prompt', dayjs().format('YYYYMMDD'));
    await mkdir(dir, { recursive: true });

    const content = `============================== SYSTEM ==============================

${system || this.system}

============================== USER ==============================

${user || this.user}

`;
    await writeFile(
      join(dir, `${dayjs(this.messageCreateTime).format('YYYYMMDDHHmmss')}-${this.conversationId}-${this.messageId}-${suffix || this.round}.md`),
      content,
      'utf-8',
    );
  }

  /**
   * 输出本轮对话的 LLM 输出到文件
   * @param output LLM 输出内容
   * @param suffix 文件名称后缀，默认为当前迭代轮数
   */
  async saveOutput(
    output: string = '',
    suffix: number | string = '',
  ) {
    const dir = workspace('prompt', dayjs().format('YYYYMMDD'));
    await mkdir(dir, { recursive: true });

    const content = `============================== OUTPUT ==============================

${output || this.messageRound}
`;

    await appendFile(
      join(dir, `${dayjs(this.messageCreateTime).format('YYYYMMDDHHmmss')}-${this.conversationId}-${this.messageId}-${suffix || this.round}.md`),
      content,
      'utf-8',
    );
  }
}
