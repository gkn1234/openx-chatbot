/** 延时方法 */
export function delay(wait: number): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      clearTimeout(timer)
      resolve()
    }, wait)
  })
}
