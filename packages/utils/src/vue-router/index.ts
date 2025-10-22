import type {
  NavigationFailure,
  RouteLocationRaw,
  Router,
} from 'vue-router'
import type { Routes } from './types'

/**
 * 规范的路由跳转方法
 * @param router
 * @param name 路由名称，注意只能用名称跳转
 * @param location 路由参数
 * @param type 跳转方法，push / replace / open
 * @returns 参考：https://router.vuejs.org/zh/guide/advanced/navigation-failures.html
 */
export function nav<T extends keyof Routes>(
  router: Router,
  name: T,
  location?: Exclude<RouteLocationRaw, string> & Routes[T],
  type: 'push' | 'replace' | 'open' = 'push',
): Promise<NavigationFailure | void | undefined> {
  const locationResolved = Object.assign(
    location || {},
    { name },
  )
  if (type === 'open') {
    const target = router.resolve(locationResolved)
    window.open(target.href, '_blank')
    return Promise.resolve()
  }
  return router[type](locationResolved)
}

export * from './types'
