import type { Ref } from 'vue'
import { computed, ref } from 'vue'
import type {
  UsePaginationBasicFilters,
  UsePaginationGetterResult,
} from '../pagination'
import { UsePagination } from '../pagination'
import type { UsePaginationFrontOptions } from './types'
import {
  filterPageFrontHandler,
  slicePageFrontHandler,
  sortPageFrontHandler,
} from './utils'

export class UsePaginationFront<
  ListItem = any,
  Filters extends UsePaginationBasicFilters = UsePaginationBasicFilters,
> extends UsePagination<ListItem, Filters> {
  static defaultOptions<
    ListItem = any,
    Filters extends UsePaginationBasicFilters = UsePaginationBasicFilters,
  >(
    options: UsePaginationFrontOptions<ListItem, Filters>,
  ): Required<UsePaginationFrontOptions<ListItem, Filters>> {
    return {
      ...UsePagination.defaultOptions(options),
      onListFilter: filterPageFrontHandler as any,
      onSlice: slicePageFrontHandler as any,
      onSort: sortPageFrontHandler as any,
      ...options,
    }
  }

  protected _options: Required<UsePaginationFrontOptions<ListItem, Filters>>

  /** 前端分页原始数据列表 */
  private _origin: Ref<ListItem[]> = ref([])

  /** 按照过滤条件，对原始数据处理后的列表 */
  private _resolvedList = computed(() => {
    let result = this._origin.value
    result = this._options.onListFilter(result, this.filters)
    result = this._options.onSort(result, this.filters)
    return result
  })

  total = computed(() => this._resolvedList.value.length)

  /** 过滤后的全部列表数据 */
  resolvedList = computed(() => this._resolvedList.value)

  /** 统计前端分页执行次数 */
  count = 0

  constructor(options: UsePaginationFrontOptions<ListItem, Filters>) {
    super({
      ...options,
      immediate: false,
    })

    this._options = UsePaginationFront.defaultOptions<ListItem, Filters>(options)

    if (this._options.immediate)
      this.fetchData()
  }

  protected onResolved(res: UsePaginationGetterResult<ListItem>) {
    this._origin.value = res.records
    this.fetch()
    return res
  }

  fetchData(force?: boolean) {
    return super.fetch(force)
  }

  fetch() {
    const res = this._options.onSlice(this._resolvedList.value, this.filters)

    if (this._options.scroll) {
      // 处理瀑布流的连续加载分页

      if (this._options.scrollReload(this.filters)) {
        // 满足条件的数据重置列表，重置瀑布流状态
        this.noMore.value = false
        this.list.length = 0
      }

      this.list.push(...res)

      if (!res?.length)
        this.noMore.value = true
    }
    else {
      // 处理常规分页
      this.list.length = 0
      this.list.push(...res)
    }

    return Promise.resolve(res)
  }
}
