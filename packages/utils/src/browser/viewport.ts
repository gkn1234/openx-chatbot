/** 判断一个 dom 元素是否在可视区域 */
export function isInViewport(el: HTMLElement) {
  const viewPortHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
  const { top } = el.getBoundingClientRect()
  return top <= viewPortHeight
}
