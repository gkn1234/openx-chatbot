import type { Component } from 'vue';

export interface InputSkillOptions {
  /** 技能的唯一索引，不得重复 */
  key: string

  /** 技能名称 */
  name: string

  /** 技能图标 class */
  iconClass?: string

  /** 技能图标 url，只支持 svg 图标。优先级高于 class */
  iconUrl?: string

  /** 技能图标颜色 */
  iconColor?: string

  /** 技能描述 */
  description?: string

  /** 技能元数据，可自定义修改 */
  meta?: Record<string, any>

  /** 是否禁用 */
  disabled?: boolean

  /** 是否隐藏 */
  hidden?: boolean

  /** 技能左侧操作菜单内容 */
  leftOperations?: () => Promise<Component>

  /** 技能右侧操作菜单内容 */
  rightOperations?: () => Promise<Component>

  /** 新建对话时选中触发 */
  createTrigger?: (...args: any[]) => void

  /** 对话中选中触发 */
  chattingTrigger?: (...args: any[]) => void

  /** 新建对话时发送消息触发 */
  createSendMessage?: (query: string) => void

  /** 对话中发送消息触发 */
  chattingSendMessage?: (query: string) => void
}

export type ChatInputEvents = {
  onShowSkillSelection: () => void
};
