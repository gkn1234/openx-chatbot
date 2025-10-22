export interface MessageChunk {
  /**
   * 流式块的类型：
   * - text_chunk: workflow 工作流，LLM 返回文本块
   * - message：LLM 返回文本块事件
   * - message_replace：LLM 文本块替换
   * - workflow_started: workflow 开始执行
   * - workflow_finished: workflow 执行结束，成功失败同一事件中不同状态
   * - node_started: node 开始执行
   * - node_finished: node 执行结束
   * - error： 流式输出过程中出现的异常会以 stream event 形式输出，收到异常事件后即结束
   */
  event: 'text_chunk' | 'message' | 'message_replace' | 'workflow_started' | 'workflow_finished' | 'node_started' | 'node_finished' | 'error'

  /** 会话 id */
  conversation_id: string

  /** 消息 id */
  message_id: string

  /** 任务 id，用于请求跟踪和下方的停止响应接口，一般同 message_id */
  task_id: string

  /** LLM 待替换文本 */
  answer_replace?: string

  /** LLM 返回文本块内容 */
  answer?: string

  /** 当 event=error 时，为错误消息 */
  message?: string

  /** 详细内容 */
  data?: {
    /** 节点 id */
    node_id?: string

    /** 节点名称 */
    title?: string

    /** 节点执行耗时，单位 s */
    elapsed_time?: number

    /** 节点 / 工作流执行状态 */
    status?: 'succeeded' | 'failed' | 'stopped' | 'running'

    /** 错误原因 */
    error?: string

    /** text_chunk 返回时的文本 */
    text?: string
  }
}

export type MessageChunkCheck = Omit<MessageChunk, 'conversation_id' | 'message_id' | 'task_id'>;
