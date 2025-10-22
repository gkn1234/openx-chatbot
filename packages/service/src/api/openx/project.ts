import type { AxiosRequestConfig } from 'axios';
import { request } from '../request/openx';

/** 获取项目信息 */
export function getProjectById(id: number, options?: AxiosRequestConfig) {
  return request.get<any, Record<string, any>>('/project/query/projectById', {
    params: { projectId: id },
    ...options,
  });
}

export function getProjectDetail(name: string, options?: AxiosRequestConfig) {
  return request.get<any, Record<string, any>>(`/project/query/project-name/${name}`, {
    params: { type: 0 },
    ...options,
  });
}

export interface IGetEspaceGroupList {
  /** 项目 id */
  projectId: string
}

/** 获取常规 espace 群组信息 */
export interface IEspaceGroupData {
  /** 群组人数是否已满，0=未满，1=已满 */
  is_full: 0 | 1 | false | true

  /** 是否已加入群组 */
  is_join?: boolean

  /** 群组名称 */
  group_name: string

  /** 群组id */
  group_id: string

  /** 创建群组方式，1=已有的群（不可一建加入），2=通过openx创建的群（可一建加入） */
  create_group_type: 1 | 2

  /** 群组类型，project_pmc=pmc成员群，project_chat=交流群，undefined=内源大使群 */
  use_type?: 'project_pmc' | 'project_chat'
}

export function getProjectEspaceGroups(id: number, options?: AxiosRequestConfig) {
  return request.get<any, IEspaceGroupData[]>(`/project/group/show/espace/lists1`, {
    params: { projectId: id },
    ...options,
  });
}

/** 项目的内源指数信息 */
export interface IProjectInnerSourceGrade {
  /** 项目id */
  projectId: number

  /** 更新时间 */
  date: string

  /** 内源指数五维：社区体验 */
  communityGrade: number

  /** 内源指数五维：社区体验，超越其他内源项目百分比 */
  communityExRatio: number

  /** 内源指数五维：发展趋势 */
  trendGrade: number

  /** 内源指数五维：发展趋势，超越其他内源项目百分比 */
  trendExRatio: number

  /** 内源指数五维：团队健康度 */
  healthGrade: number

  /** 内源指数五维：团队健康度，超越其他内源项目百分比  */
  healthExRatio: number

  /** 内源指数五维：影响力 */
  influenceGrade: number

  /** 内源指数五维：影响力，超越其他内源项目百分比  */
  influenceExRatio: number

  /** 内源指数五维：开发活跃度 */
  vitalityGrade: number

  /** 内源指数五维：开发活跃度，超越其他内源项目百分比  */
  vitalityExRatio: number

  /** 综合内源指数 */
  innerSourceGrade: number
}

/** 查询项目内源指数 */
export function getProjectInnerSourceGrade(id: number, options?: AxiosRequestConfig) {
  return request.get<any, IProjectInnerSourceGrade>(`/innerSourceGrade/queryProjectInnerSourceGrade`, {
    params: { projectId: id },
    ...options,
  });
}

export interface IProjectReadme {
  id: number
  readmeContent: string
}

export function getProjectReadme(id: string, options?: AxiosRequestConfig) {
  return request.get<any, IProjectReadme>('readMe/query', {
    params: { projectId: id },
    ...options,
  });
}

/** 获取项目动态详情 */
export function getDynamicDetail(id: string, options?: AxiosRequestConfig) {
  return request.get<any, {
    bulletinContent: string
    editorType: 1 | 2
  }>(`/community-bulletin/detail/${id}`, options);
}
