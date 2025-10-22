import type { AgentRequestContext } from '../modules';

export interface ToolOptions {
  /** 工具名称 */
  name: string

  /** 工具在 UI 界面展示名称，回复工具可不提供此字段 */
  label: string

  /** 工具描述 */
  description: string

  /** 参数列表 */
  parameters: ToolParameterOptions[]

  /**
   * 该工具调用结果是否记忆
   * @default true
   */
  memory?: boolean

  /**
   * 该工具记忆有效时间，单位：min
   * @default 60
   */
  memoryTtl?: number

  /** 执行方法，无论成功失败都输出结果 */
  handler: (params: Record<string, any>, context: AgentRequestContext) => Promise<ToolHandleResult>
}

export interface ToolParameterOptions {
  /** 参数名称 */
  name: string

  /** 参数描述 */
  description: string

  /** 简略参数描述 */
  briefDescription?: string

  /** 是否必填 */
  required?: boolean

  /** 参数类型 */
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'

  /** 默认值 */
  default?: any
}

export interface ToolHandleResult {
  /** 所执行的工具名称，当工具执行 XML 解析失败时，此值为空 */
  name?: string

  /** 所执行工具参数，当工具执行 XML 解析失败时，此值为空 */
  params?: Record<string, any>

  /** 执行结果 */
  state: 'success' | 'failed'

  /** 执行结果 */
  result: any

  /** 是否需要会话向用户输出文本，为 true 时，本轮向用户输出文字，迭代结束 */
  output: boolean
}
