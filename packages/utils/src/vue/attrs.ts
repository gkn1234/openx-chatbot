/**
 * 获取 vue 组件的 $listeners，函数会从 $attrs 中排除非事件属性
 * @param attrs vue 组件的 $attrs 对象
 */
export function listeners(attrs: Record<string, any>) {
  const result: Record<string, any> = {}
  Object.keys(attrs).forEach((key) => {
    if (key.startsWith('on'))
      result[key] = attrs[key]
  })
  return result
}

/**
 * 获取 vue 组件除 $listeners 之外所有的属性，函数会从 $attrs 中排除事件属性
 * @param attrs vue 组件的 $attrs 对象
 */
export function attributes(attrs: Record<string, any>) {
  const result: Record<string, any> = {}
  Object.keys(attrs).forEach((key) => {
    if (!key.startsWith('on'))
      result[key] = attrs[key]
  })
  return result
}

/**
 * 获取 vue 组件的 $props + $listeners
 * @param props vue 组件的 $props 对象
 * @param attrs vue 组件的 $attrs 对象
 */
export function propsWithListenters(props: Record<string, any>, attrs: Record<string, any>) {
  return { ...props, ...listeners(attrs) }
}

/**
 * 获取 vue 组件的 $props + 非事件属性
 * @param props vue 组件的 $props 对象
 * @param attrs vue 组件的 $attrs 对象
 */
export function propsWithAttributes(props: Record<string, any>, attrs: Record<string, any>) {
  return { ...props, ...attributes(attrs) }
}

/**
 * $props + $attrs
 * @param props vue 组件的 $props 对象
 * @param attrs vue 组件的 $attrs 对象
 */
export function propsWithAll(props: Record<string, any>, attrs: Record<string, any>) {
  return { ...props, ...attrs }
}
