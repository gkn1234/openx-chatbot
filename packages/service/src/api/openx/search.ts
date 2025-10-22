import type { AxiosRequestConfig } from 'axios';
import { request } from '../request/openx';

/**
 * 搜索类型
 * project - 项目;
 * community - 社区;
 */
type SearchType = 'project' | 'community';

/** 全站搜索，入参 */
export interface ISearchFromWebsite {
  /** 当前页号 */
  pageNum: number

  /** 单页尺寸 */
  pageSize: number

  /** 搜索类型 */
  type: SearchType

  /** 搜索关键字 */
  words: string

  /** 筛选类型 */
  sortType?: string
}

/** 全站搜索，出参 */
export interface ISearchResult {
  /**
   * 搜索结果。
   *
   * 由于历史原因，当没有搜到任何数据时，内部字段为空，返回空对象
   */
  result: {
    /** 结果条数 */
    count?: number

    /** 结果内容 */
    info?: Record<string, any>[]
  }

  /** 搜索关键字 */
  words: string[]
}

/** 全站搜索 */
export async function searchFromWebsite(params: ISearchFromWebsite, options?: AxiosRequestConfig) {
  return request.post<any, ISearchResult>(`/search/fuzzySearch`, params, options);
}
