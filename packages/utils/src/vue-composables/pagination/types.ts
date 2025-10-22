import type { DebounceSettings, ThrottleSettings } from 'lodash-es'
import type { UseRequestOptions } from '../request'
import type { UsePagination } from './pagination'

/** 分页配置选项 */
export interface UsePaginationOptions<
  ListItem = any,
  Filters extends UsePaginationBasicFilters = UsePaginationBasicFilters,
> extends Omit<UseRequestOptions, 'getter' | 'default'> {
  /** 是否为瀑布流加载 */
  scroll?: boolean

  /**
   * 瀑布流加载时，什么情况下重置加载状态
   *
   * 默认情况下，当页号为 1 时的请求会使加载状态重置
   * @param filters 过滤条件
   * @returns 返回 true 则重置瀑布流加载状态
   *
   * @default filters => filters.current === 1
   */
  scrollReload?: (filters: MergeFilter<Filters>) => boolean

  /**
   * 获取分页数据的方法，必传，需要一个异步方法
   *
   * 在前端分页中，此方法获取的数据视作全部数据，在此基础上进行分页
   */
  getter: (filters: MergeFilter<Filters>) => Promise<UsePaginationGetterResult<ListItem>>

  /** 列表初始数据 */
  list?: ListItem[]

  /** 分页过滤配置初始化配置 */
  filters?: Filters

  /** 分页过滤选项 */
  filtersOptions?: UsePaginationFiltersOptionsMap<ListItem, Filters>
}

/** 分页获取数据的标准格式 */
export interface UsePaginationGetterResult<ListItem = any> {
  /** 数据列表 */
  records: ListItem[]

  /** 数据总数，一般为所有数据数，如果取不到将以 records.length 为准 */
  total?: number
}

/** 分页过滤条件基本接口 */
export interface UsePaginationBasicFilters {
  /** 页号 */
  current?: number

  /** 页大小 */
  size?: number

  /** 排序属性，字符串对应列表对象相应的 key */
  sortProp?: string | null

  /**
   * 排序方式
   * - asc 升序
   * - desc 降序
   * - null / undefined 原始序
   */
  sortType?: 'asc' | 'desc' | null

  /** 过滤关键字 */
  keywords?: string

  /** 起始时间，支持字符串，null 代表不设起始时间 */
  startDate?: string | null

  /** 终止时间，支持字符串，null 代表不设终止时间 */
  endDate?: string | null
}

/** 合并过滤器的类型 */
export type MergeFilter<
  Filters extends UsePaginationBasicFilters = UsePaginationBasicFilters,
> = {
  [K in keyof Required<UsePaginationBasicFilters & Filters>]:
  (K extends keyof Filters ? Required<Filters>[K] : never) |
  (K extends keyof UsePaginationBasicFilters ? Required<UsePaginationBasicFilters>[K] : never);
}

export interface UsePaginationFiltersChain<
  ListItem = any,
  Filters extends UsePaginationBasicFilters = UsePaginationBasicFilters,
  K extends keyof MergeFilter<Filters> = keyof MergeFilter<Filters>,
> {
  (
    pagination: UsePagination<ListItem, Filters>,
    value: MergeFilter<Filters>[K],
    oldValue: MergeFilter<Filters>[K],
    force?: boolean
  ): void
}

export interface UsePaginationFiltersHandler<
  Filters extends UsePaginationBasicFilters = UsePaginationBasicFilters,
  K extends keyof MergeFilter<Filters> = keyof MergeFilter<Filters>,
> {
  (
    force: boolean,
    value: MergeFilter<Filters>[K],
    oldValue: MergeFilter<Filters>[K],
  ): void
}

export type UsePaginationFiltersHandlerMap<
  Filters extends UsePaginationBasicFilters = UsePaginationBasicFilters,
> = {
  [K in keyof MergeFilter<Filters>]?: UsePaginationFiltersHandler<Filters, K>
}

export interface UsePaginationFiltersOptions<
  ListItem = any,
  Filters extends UsePaginationBasicFilters = UsePaginationBasicFilters,
  K extends keyof MergeFilter<Filters> = keyof MergeFilter<Filters>,
> {
  /** 分页过滤联动配置 */
  chain?: UsePaginationFiltersChain<ListItem, Filters, K>

  /** 防抖延迟时间。设置之后，该字段过滤器的值的变化将会应用防抖 */
  debounce?: number

  /** 节流延迟时间。设置之后，该字段过滤器的值的变化将会应用节流。优先级高于防抖 */
  throttle?: number

  /** 防抖选项 */
  debounceOptions?: DebounceSettings

  /** 节流选项 */
  throttleOptions?: ThrottleSettings
}

export type UsePaginationFiltersOptionsMap<
  ListItem = any,
  Filters extends UsePaginationBasicFilters = UsePaginationBasicFilters,
> = {
  [K in keyof MergeFilter<Filters>]?: UsePaginationFiltersOptions<ListItem, Filters, K>;
}
