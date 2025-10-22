import type { ObjectDirective } from 'vue'

declare global {
  // v-hover 指令需要在 HTMLElement 对象上扩展属性用于暂存事件回调
  interface HTMLElement {
    _mouseenterHandler?: (e: MouseEvent) => void
    _mouseleaveHandler?: (e: MouseEvent) => void
  }
}

export type HoverFunction = (hover: boolean, e: MouseEvent) => void

/** 自定义指令 v-hover，元素在鼠标移入或移出时触发 */
export const vHover: ObjectDirective<HTMLElement, HoverFunction> = {
  beforeMount(el, binding) {
    const callback = binding.value

    if (typeof callback === 'function') {
      const enterHandler = callback.bind(el, true)
      el._mouseenterHandler = enterHandler
      el.addEventListener('mouseenter', enterHandler)

      const leaveHandler = callback.bind(el, false)
      el._mouseleaveHandler = leaveHandler
      el.addEventListener('mouseleave', leaveHandler)
    }
  },
  beforeUnmount(el) {
    if (el._mouseenterHandler)
      el.removeEventListener('mouseenter', el._mouseenterHandler)

    if (el._mouseleaveHandler)
      el.removeEventListener('mouseleave', el._mouseleaveHandler)
  },
}
