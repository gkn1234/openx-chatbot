import type { AxiosRequestConfig } from 'axios'
import type { IEspaceGroupData } from './project'
import { request } from '../request/openx'

/** 获取社区信息 */
export function getCommunityById(id: number, options?: AxiosRequestConfig) {
  return request.get<any, Record<string, any>>(`/communityLatest/query/${id}`, options)
}

export function getCommunityEspaceGroups(id: number, options?: AxiosRequestConfig) {
  return request.get<any, IEspaceGroupData[]>(`/community/chat_group/home/list`, {
    params: { communityId: id },
    ...options,
  })
}

/** 查询帖子详情，入参 */
export interface IGetCommunityPostDetail {
  /** 帖子id */
  id: string

  /** 社区id */
  communityId: string
}

/** 查询帖子详情 */
export function getCommunityPostDetail(params: IGetCommunityPostDetail, options?: AxiosRequestConfig) {
  return request.get<any, {
    bulletinContent: string
    editorType: 1 | 2
  }>(`/communityLatestBulletin/detail/${params.id}`, { params, ...options })
}
