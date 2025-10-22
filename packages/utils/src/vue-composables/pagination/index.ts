import { UsePagination } from './pagination'
import type {
  UsePaginationBasicFilters,
  UsePaginationOptions,
} from './types'

/**
 * 创建分页列表对象
 * @typeParam ListItem 第一个泛型参数代表列表元素的类型，若不传，则无法推断 pagination.list 的类型
 * @param options
 * @returns 分页列表对象
 */
export function usePagination<
  ListItem = any,
  Filters extends UsePaginationBasicFilters = UsePaginationBasicFilters,
>(options: UsePaginationOptions<ListItem, Filters>) {
  return new UsePagination<ListItem, Filters>(options)
}

export { UsePagination }
export * from './types'
export * from './utils'

// function b(): Promise<{
//   records: {
//     a: number
//     b: string
//   }[]
// }>

// const a = usePagination({
//   getter: f => b(),
//   filters: {
//     current: 1,
//     a: 1,
//   },
// })
