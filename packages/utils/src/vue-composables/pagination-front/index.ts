import type { UsePaginationBasicFilters } from '../pagination'
import { UsePaginationFront } from './pagination-front'
import type { UsePaginationFrontOptions } from './types'

export function usePaginationFront<
  ListItem = any,
  Filters extends UsePaginationBasicFilters = UsePaginationBasicFilters,
>(options: UsePaginationFrontOptions<ListItem, Filters>) {
  return new UsePaginationFront<ListItem, Filters>(options)
}

export { UsePaginationFront }
export * from './types'
export * from './utils'

// function b(): Promise<{
//   records: {
//     a: number
//     b: string
//   }[]
// }>

// const a = usePaginationFront({
//   getter: f => b(),
//   filters: {
//     current: 1,
//     a: 1,
//   },
// })
