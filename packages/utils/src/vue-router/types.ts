import type { RouteRecordRaw } from 'vue-router'

export interface Routes {}

export type RouteConfig = RouteRecordRaw & {
  name?: keyof Routes
  children?: RouteConfig[]
}

export interface RouteInfo<
  Query extends object = Record<string, never>,
  Params extends object = Record<string, never>,
  Hash extends `#${string}` | '' = `#${string}` | '',
> {
  query?: Query
  params?: Params
  hash?: Hash
}
