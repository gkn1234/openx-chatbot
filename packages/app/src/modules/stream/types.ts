export type StreamActionResolveFunc = (
  stream: ChatFlowActionOutputStream,
  done: () => void,
  error: (e: Error) => void,
) => void;

export type StreamActionReadyFunc = (
  done: () => void,
  error: (e: Error) => void,
) => void;

export type StreamActionErrorFunc = (e: Error) => void;

export type StreamActionTimeoutFunc = (
  /**
   * 超时类型
   * - waiting: 等待 LLM 输出发生超时
   * - all: 整个工作流执行过程发生超时
   */
  type: 'waiting' | 'all',
) => void;

export interface StreamActionOptions {
  url: string
  key: string
  params: ChatFlowStreamInput

  baseUrl?: string

  /** 等待 LLM 输出超时时间 */
  waitingTimeout?: number

  /** 整个工作超时时间设置 */
  timeout?: number

  /** 超时触发 */
  onTimeout?: StreamActionTimeoutFunc

  /** 连接建立时触发 */
  onReady?: StreamActionReadyFunc

  /** workflow 开始执行触发 */
  onWorkflowStarted?: StreamActionResolveFunc

  /** workflow 成功执行结束触发 */
  onWorkflowSuccess?: StreamActionResolveFunc

  /** workflow 失败触发 */
  onWorkflowFailed?: StreamActionResolveFunc

  /** 节点开始执行时触发 */
  onNodeStarted?: StreamActionResolveFunc

  /** 节点执行结束触发 */
  onNodeFinished?: StreamActionResolveFunc

  /** LLM 输出文本块触发 */
  onMessage?: StreamActionResolveFunc

  /** LLM 输出结束触发 */
  onMessageEnd?: StreamActionResolveFunc

  /** LLM 文本替换触发 */
  onMessageReplace?: StreamActionResolveFunc

  /** LLM workflow 输出文本块触发 */
  onTextChunk?: StreamActionResolveFunc

  /** 异常发生时触发 */
  onError?: StreamActionErrorFunc
}

export interface ChatFlowStreamInput {
  /** 智能体名称(适配 OpenX 接口) */
  name?: string

  /**
   * 允许传入 App 定义的各变量值。
   *
   * inputs 参数包含了多组键值对（Key/Value pairs），每组的键对应一个特定变量，每组的值则是该变量的具体值。
   */
  inputs: Record<string, any>

  /** 用户输入/提问内容 */
  query?: string

  /**
   * - streaming 流式模式（推荐）。基于 SSE（Server-Sent Events）实现类似打字机输出方式的流式返回。
   * - blocking 阻塞模式，等待执行完毕后返回结果。（请求若流程较长可能会被中断）。
   */
  response_mode: 'streaming' | 'blocking'

  /** 用户标识，用于定义终端用户的身份，方便检索、统计。 由开发者定义规则，需保证用户标识在应用内唯一。 */
  user: string

  /** 会话 ID，需要基于之前的聊天记录继续对话，必须传之前消息的 conversation_id。 */
  conversation_id?: string

  /** 上传的文件列表 */
  files?: {
    /** 上传文件支持类型，暂时只支持图片 */
    type: 'image'

    /**
     * 传递方式：
     * - remote_url 图片地址
     * - local_file 上传文件
     */
    transfer_method: 'remote_url' | 'local_file'

    /** 图片地址。（仅当传递方式为 remote_url 时）。 */
    url?: string

    /** 上传文件 ID。（仅当传递方式为 local_file 时）。 */
    upload_file_id?: string
  }[]
}

export interface ChatFlowActionOutputStream {
  /**
   * 流式块的类型：
   * - text_chunk: workflow 工作流，LLM 返回文本块
   * - message：LLM 返回文本块事件
   * - message_replace：LLM 文本块替换
   * - message_end：消息结束事件，收到此事件则代表流式返回结束
   * - workflow_started: workflow 开始执行
   * - workflow_finished: workflow 执行结束，成功失败同一事件中不同状态
   * - node_started: node 开始执行
   * - node_finished: node 执行结束
   * - error： 流式输出过程中出现的异常会以 stream event 形式输出，收到异常事件后即结束
   */
  event: 'text_chunk' | 'message' | 'message_end' | 'message_replace' | 'workflow_started' | 'workflow_finished' | 'node_started' | 'node_finished' | 'error'

  /** 会话 id */
  conversation_id?: string

  /** 任务 id，用于请求跟踪和下方的停止响应接口 */
  task_id?: string

  /** 消息 id */
  message_id?: string

  /** LLM 返回文本块内容 */
  answer?: string

  /** LLM 待替换文本 */
  answer_replace?: string

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
