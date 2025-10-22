import type { ChatApp } from '../chat-app';
import type {
  ChatFlowActionFeedbackInput,
} from './api';
import type { ChatFlow } from './chat-flow';

export interface ChatFlowOptions {
  /** 智能体 id */
  chatFlowId: number

  /** 会话 id */
  id?: string

  app: ChatApp

  /** API 调用凭证 */
  key: string

  /** API 调用基础 url */
  baseUrl?: string

  /**
   * 若非空，将手动设置对话标题。否则将自动生成标题
   * @default ''
   */
  title?: string

  /** 对话头像 */
  avatar?: string

  /** 对话参数 */
  inputs?: Record<string, any>

  /** 对话 id，若此参数非空，则优先初始化历史消息 */
  conversationId?: string
}

export type ChatFlowOptionsSet = Omit<ChatFlowOptions, 'app' | 'id'>;

export type ChatFlowOptionsPresetSet = Omit<ChatFlowOptionsSet, 'key' | 'baseUrl'>;

export type ChatFlowData = Required<Omit<ChatFlowOptions, 'app'>>;

export interface ChatFlowInfo {
  /** 智能体 id */
  id: number

  /** API 调用凭证 */
  key: string

  /** API 调用基础 url */
  baseUrl?: string

  /** 智能体名称 */
  name?: string

  /** 智能体描述 */
  description?: string

  /** 是否正在加载参数 */
  loading?: boolean
}

export type ChatFlowItemRole = 'user' | 'assistant';

export interface ChatFlowItemOptions {
  /**
   * 消息类型
   * - chat-flow: 智能体对话
   * - work-flow: 工作流对话
   * - common: 不通过 AI 接口的对话
   */
  type: 'chat-flow' | 'work-flow' | 'common'

  /** 消息所属的对话 */
  flow: ChatFlow

  /**
   * 消息角色
   * @default 'assistant'
   */
  role?: ChatFlowItemRole

  /**
   * 初始内容
   * @default ''
   */
  content?: string

  /** type=common 时有效，附加内容，可以进行系统交互 */
  extra?: ChatFlowItemExtra

  /** type=common 的历史消息，需要初始化点赞状态 */
  rating?: ChatFlowActionFeedbackInput['rating']

  /** type=common 的历史消息，需要初始化消息 id */
  messageId?: string

  /** type=workflow 时，workflow 的各项参数 */
  workflow?: WorkflowOptions
}

export interface ChatFlowItemExtra {
  /**
   * 附加内容类型
   * - questions: 展示提问列表
   * - custom: 展示一个按钮。点击触发自定义事件，发送消息给客户端，由客户端处理
   */
  type: 'questions' | 'custom'

  /** type=questions 时有效。提问列表 */
  questions?: string[]

  /** type=custom 时有效。自定义事件 */
  custom?: ChatFlowItemExtraCustom[]
}

export interface ChatFlowItemExtraCustom {
  /** 按钮文字 */
  label: string

  /** 触发自定义事件名称 */
  event: string

  /** 是否为主要按钮 */
  primary?: boolean
}

export interface ChatFlowNode {
  /** 节点 id */
  id: string

  /** 节点名称 */
  name: string

  /** 节点状态 */
  status: 'running' | 'succeeded' | 'failed' | 'stopped'

  /** 执行时间，单位秒 */
  duration: number
}

/** 通过工作流更新对话的选项 */
export interface WorkflowOptions {
  /** API 调用凭证 */
  key: string

  /** API 调用基础 url */
  baseUrl?: string

  /** 直接传入输入参数，若非空，则异步获取参数失效 */
  inputs?: Record<string, any>

  /** 异步获取输入参数 */
  asyncInputs?: () => Promise<Record<string, any>>
}
