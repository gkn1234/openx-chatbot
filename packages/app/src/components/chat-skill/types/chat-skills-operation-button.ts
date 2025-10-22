import type { PopoverProps } from 'element-plus'

export interface ChatSkillsOperationButtonProps {
  /** 是否为开关模式，开关模式的值通过 v-model 绑定 */
  isSwitch?: boolean

  /** 图标的 class */
  iconClass?: string

  /** 文字 */
  label?: string

  /** 提示说明文字，仅在 type=tooltip 时生效 */
  tip?: string

  /** 弹出层类型 */
  type?: 'popover' | 'tooltip' | 'both'

  popoverOptions?: Partial<PopoverProps>

  /** 按钮是否禁用 */
  disabled?: boolean
}
