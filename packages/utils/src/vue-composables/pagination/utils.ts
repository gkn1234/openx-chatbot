import { nextTick } from 'vue'
import type {
  UsePaginationBasicFilters,
  UsePaginationFiltersChain,
  UsePaginationFiltersOptionsMap,
} from './types'

/** 默认过滤参数 */
export function defaultPaginationFilters(): Required<UsePaginationBasicFilters> {
  return {
    current: 1,
    size: 10,
    sortProp: null,
    sortType: null,
    keywords: '',
    startDate: null,
    endDate: null,
  }
}

export const fetchChain: UsePaginationFiltersChain = (pagination, _val, _oldVal, force) => {
  nextTick(() => {
    pagination.fetch(force)
  })
}

export const basicChain: UsePaginationFiltersChain = (pagination, _val, _oldVal, force) => {
  // console.log(111111111)
  pagination.set('current', 1, force)
}

export const pageSizeChain: UsePaginationFiltersChain<any, UsePaginationBasicFilters, 'size'> =
  (pagination, val, oldVal, force) => {
    const startIndex = (pagination.filters.current - 1) * oldVal
    pagination.set('current', Math.floor(startIndex / val) + 1, force)
  }

/** 默认过滤参数联动 */
export function defaultPaginationFiltersOptions(): Required<UsePaginationFiltersOptionsMap> {
  return {
    current: { chain: fetchChain },
    size: { chain: pageSizeChain },
    sortProp: { chain: basicChain },
    sortType: { chain: basicChain },
    keywords: { chain: basicChain },
    startDate: { chain: basicChain },
    endDate: { chain: basicChain },
  }
}
