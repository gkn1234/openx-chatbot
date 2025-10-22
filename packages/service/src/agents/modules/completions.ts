import type { BaseLanguageModelInput } from '@langchain/core/language_models/base';
import type { AIMessageChunk } from '@langchain/core/messages';
import type { ChatOpenAIFields } from '@langchain/openai';
import type { Tiktoken, TiktokenEncoding } from 'tiktoken';
import type { AgentBase } from './agent';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { get_encoding } from 'tiktoken';

export interface CompletionsOptions {
  /** 系统提示词 */
  system?: string

  /** 用户提示词 */
  user?: string

  /** 中断请求控制器 */
  controller?: AbortController

  /**
   * 流式输出每个文字片段时触发
   * @param chunk
   */
  onStreamChunk?: (chunk: AIMessageChunk) => void

  /** LLM 请求开始响应 */
  onRequestStart?: () => Promise<void>
}

export class ModelCompletions {
  private _agent: AgentBase;

  get db() {
    return this._agent.service.db;
  }

  id: number;

  constructor(agent: AgentBase, modelId: number) {
    this.id = modelId;
    this._agent = agent;
  }

  provider = '';

  name = '';

  baseUrl = '';

  apiKey = '';

  /** 最大上下文长度限制 */
  maxTokens = 0;

  /** 最大输出窗口限制 */
  outputTokens = 0;

  /** 用于计算 token */
  private _encoding?: Tiktoken;

  get encoding() {
    if (!this._encoding) {
      throw new Error('模型尚未完成初始化！');
    }
    return this._encoding;
  }

  /** 判断输入的上下文是否超过模型限制 */
  isPromptTokenLimit(inputs: CompletionsOptions = {}) {
    const {
      system = '',
      user = '',
    } = inputs;
    const systemLength = this.encoding.encode(system).length;
    const userLength = this.encoding.encode(user).length;
    return systemLength + userLength > this.maxTokens - this.outputTokens;
  }

  async init() {
    const res = await this.db.t_chatbot_model.findUniqueOrThrow({
      where: {
        id: this.id,
      },
    });
    this.provider = res.provider;
    this.name = res.name;
    this.baseUrl = res.baseUrl;
    this.apiKey = res.apiKey;
    this.maxTokens = res.maxTokens;
    this.outputTokens = res.outputTokens;
    this._encoding = get_encoding(res.tokenEncoding as TiktokenEncoding);
  }

  async completions(inputs: CompletionsOptions = {}, options: ChatOpenAIFields = {}) {
    if (!this.name) {
      throw new Error('大模型尚未初始化');
    }

    const {
      system = '',
      user = '',
      controller,
      onStreamChunk,
      onRequestStart,
    } = inputs;
    const { configuration, ...rests } = options;

    const llm = new ChatOpenAI({
      model: this.name,
      ...rests,
      configuration: {
        apiKey: this.apiKey,
        baseURL: this.baseUrl,
        ...configuration,
      },
    });

    const messages: BaseLanguageModelInput = [];
    if (system) {
      messages.push(new SystemMessage(system));
    }
    messages.push(new HumanMessage(user));

    const stream = await llm.stream(messages, { signal: controller?.signal });

    await onRequestStart?.();

    for await (const chunk of stream) {
      onStreamChunk?.(chunk);
    }
  }
}
