import type { AxiosRequestConfig } from 'axios';
import { request } from '../request/openx';

/** 查询活动详情 */
export function getActivityDetail(id: string, options?: AxiosRequestConfig) {
  return request.get<any, {
    details: string
    detailType: 1 | 2
  }>(`/activity/getInfo`, { params: { activityId: id, viewsBool: false }, ...options });
}
