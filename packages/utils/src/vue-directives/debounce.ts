import type { DirectiveBinding, ObjectDirective } from 'vue'
import { debounce } from 'lodash-es'
import type { Func } from '../es/types'

declare global {
  // v-debounce、v-throttle 指令需要在 HTMLElement 对象上扩展属性用于暂存事件回调
  interface HTMLElement {
    _debounceHandler?: Func
  }
}

export function resolveDebounceBinding(binding: DirectiveBinding) {
  // 不指定事件，则默认为点击事件
  const event = binding.arg || 'click'

  // 默认延迟 0s
  let time = 0

  // 建议使用数字来指定延迟时间，如：v-debounce.200
  const timeKey = Object.keys(binding.modifiers).find(k => !Number.isNaN(Number(k)))
  if (timeKey)
    time = Number(timeKey)

  return { event, time }
}

/**
 * @deprecated 建议直接使用 lodash.debounce
 *
 * 防抖，对于防抖方法，触发后延迟指定时间后执行
 *
 * 参考：https://www.lodashjs.com/docs/lodash.debounce
 *
 * binding.modifiers 说明如下：
 * - .300 代表防抖间隔为 300ms，其他数字同样有效
 *
 * binding.arg 为响应事件，默认为 click
 *
 * binding.value 为回调方法
 *
 * @example
 * <input v-debounce:input.300="inputHandler" />
 */
export const vDebounce: ObjectDirective<HTMLElement, Func> = {
  beforeMount(el, binding) {
    const callback = binding.value

    if (typeof callback === 'function') {
      const { event, time } = resolveDebounceBinding(binding)
      const handler = debounce(callback, time)
      el._debounceHandler = handler
      el.addEventListener(event, handler)
    }
  },
  beforeUnmount(el, binding) {
    const handler = el._debounceHandler
    if (handler) {
      const event = binding.arg || 'click'
      el.removeEventListener(event, handler)
    }
  },
}
