import type {
  MergeFilter,
  UsePaginationBasicFilters,
  UsePaginationOptions,
} from '../pagination'

/** 前端分页配置选项 */
export interface UsePaginationFrontOptions<
  ListItem = any,
  Filters extends UsePaginationBasicFilters = UsePaginationBasicFilters,
> extends UsePaginationOptions<ListItem, Filters> {
  /** 用户自定义列表过滤，覆盖默认的列表过滤 */
  onListFilter?: (list: ListItem[], filters: MergeFilter<Filters>) => ListItem[]

  /** 用户自定义列表排序，覆盖默认的列表排序 */
  onSort?: (list: ListItem[], filters: MergeFilter<Filters>) => ListItem[]

  /** 用户自定义分页切割，覆盖默认的列表切割 */
  onSlice?: (list: ListItem[], fillters: MergeFilter<Filters>) => ListItem[]
}
