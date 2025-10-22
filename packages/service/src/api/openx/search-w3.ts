import type { AxiosRequestConfig } from 'axios';
import { request } from '../request/openx';

/** W3 搜索接口，入参 */
export interface ISearchFromW3 {
  /** 搜索文本 */
  searchTxt: string

  /** 当前页（灵犀固定页大小为10，只传当前页） */
  pageIndex: number
}

/** W3 搜索接口，出参 */
export interface ISearchFromW3Result {
  /** 当前页 */
  page: number

  /** 总页数 */
  pages: number

  /** 页大小 */
  size: number

  /** 总条数 */
  total: number

  /** w3返回状态 */
  status: any

  /** 搜索结果内容 */
  data: ISearchFromW3ResultItem[]
}

/** 搜索结果内容单条信息 */
export interface ISearchFromW3ResultItem {
  /** 评论数 */
  COMMENT_NUM: number

  /** 作者信息 */
  DOC_AUTHORS: string

  /** 文档 id */
  DOC_ID: string

  /** 唯一索引 id */
  INDEX_ID: string

  /** 修改时间，时间戳 */
  DOC_MODIFY_DATE: number

  /** 文档标题 */
  DOC_TITLE: string

  /** 跳转链接 */
  DOC_URL: string

  /** 下载量 */
  DOWNLOAD_NUM: number

  /** 匹配到的数据内容 */
  HIGHLIGHT: string[]

  /** 浏览量 */
  PAGEVIEW_NUM: number

  /** 创建时间，时间戳 */
  PUBLISH_TIME: number

  /** 自定义数据，与 OpenX 内容展示相关 */
  CUSTOM_TEXT_FIELD: {
    /**
     * 数据类型：
     * - 1:项目数据,
     * - 2:活动数据,
     * - 3:帖子数据,
     * - 4:项目pages,
     * - 5:社区pages
     */
    DATA_TYPE: 1 | 2 | 3 | 4 | 5

    /** 收藏量 */
    FAVORITE_NUM: number

    /** 项目的成熟度评分，字符串 */
    FINAL_SCORE?: string

    /** 标签信息，格式 [{name:'5G',type:'1'},{name:'技术',type:'2'}]，JSON 字符串，要手动转成对象 */
    LABEL: string

    /** 图片地址 */
    LOGO_URL: string

    /** 项目数据的owner跳转地址 */
    OWNER_JUMP_URL: string

    /** 分享量 */
    SHARE_NUM: number
  }
}

/** W3 搜索接口 */
export function searchFromW3(params: ISearchFromW3, options?: AxiosRequestConfig) {
  return request.get<any, ISearchFromW3Result>(`/w3Crud/queryW3Data`, {
    params,
    ...options,
  });
}
