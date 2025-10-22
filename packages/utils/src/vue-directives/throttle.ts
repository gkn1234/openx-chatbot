import type { ObjectDirective } from 'vue'
import { throttle } from 'lodash-es'
import type { Func } from '../es/types'
import { resolveDebounceBinding } from './debounce'

/**
 * @deprecated 建议直接使用 lodash.throttle
 *
 * 节流，对于节流方法，两次执行间隔必须为指定时间
 *
 * 参考：https://www.lodashjs.com/docs/lodash.throttle
 *
 * binding.modifiers 说明如下：
 * - .300 代表节流间隔为 300ms，其他数字同样有效
 *
 * binding.arg 为响应事件，默认为 click
 *
 * binding.value 为回调方法
 *
 * @example
 * <input v-throttle:input.300="inputHandler" />
 */
export const vThrottle: ObjectDirective<HTMLElement, Func> = {
  beforeMount(el, binding) {
    const callback = binding.value

    if (typeof callback === 'function') {
      const { event, time } = resolveDebounceBinding(binding)
      const handler = throttle(callback, time)
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
