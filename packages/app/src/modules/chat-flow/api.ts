export interface ChatFlowActionDeleteInput extends ChatFlowParametersInput {
  /** 会话 id */
  conversation_id: string
}

export interface ChatFlowActionDeleteOutput extends ChatFlowActionStopOutput {}

export interface ChatFlowActionHistoryInput extends ChatFlowParametersInput {
  /** 会话 id */
  conversation_id: string

  /** 当前页第一条聊天记录的 ID，默认 null */
  first_id?: string

  /** 一次请求返回多少条聊天记录，默认 20 条。 */
  limit?: number
}

export interface ChatFlowActionHistoryOutput {
  limit: number
  has_more: boolean
  data: ChatFlowActionHistoryOutputItem[]
}

export interface ChatFlowActionHistoryOutputItem {
  /** 消息 message_id */
  id: string
  conversation_id: string
  inputs: Record<string, any>
  query: string
  answer: string
  created_at: number

  /** 反馈信息 */
  feedback?: {
    rating: 'like' | 'dislike' | null
  }

  /** 引用和归属分段列表 */
  retriever_resources: any[]

  /** 消息文件 */
  message_files: {
    id: string

    /** 文件类型，image 图片 */
    type: string

    /** 预览图片地址 */
    url: string

    /** 文件归属方，user 或 assistant */
    belongs_to: 'user' | 'assistant'
  }[]
}

export interface ChatFlowActionFeedbackInput extends ChatFlowSuggestedQuestionsInput {
  /** 点赞类型 */
  rating: 'like' | 'dislike' | null
}

export interface ChatFlowActionFeedbackOutput extends ChatFlowActionStopOutput {}

export interface ChatFlowActionRenameInput extends ChatFlowParametersInput {
  /** 会话 id */
  conversation_id: string

  /** 名称，若 auto_generate 为 true 时，该参数可不传。 */
  name?: string

  /** 自动生成标题，默认 false */
  auto_generate?: boolean
}

export interface ChatFlowActionRenameOutput {
  /** 会话名称 */
  name: string
}

export interface ChatFlowActionStopInput extends ChatFlowParametersInput {
  /** 任务 id */
  task_id: string
}

export interface ChatFlowActionStopOutput {
  /** 结果，success 时成功 */
  result: string
}

export interface ChatFlowSuggestedQuestionsInput extends ChatFlowParametersInput {
  /** 消息 id */
  message_id: string
}

export interface ChatFlowSuggestedQuestionsOutput extends ChatFlowActionStopOutput {
  /** 问题列表 */
  data: string[]
}

export interface ChatFlowParametersInput {
  /** 用户标识 */
  user: string
}
