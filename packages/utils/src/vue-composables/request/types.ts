import type { PartialDeep, Promisable, Simplify } from '../../es/types'

export type PartialWhenObj<Data = any> =
  Data extends [] ? Data :
    Data extends object ? PartialDeep<Data> : Data

export interface UseRequestOptions<
  Data = any,
  Default extends PartialWhenObj<Data> = PartialWhenObj<Data>,
> {
  /** 必传，未请求时的初始化数据 */
  default: Default

  /** 必传，获取请求数据的方法，支持异步。 */
  getter: () => Promisable<Data>

  /**
   * 是否立即执行
   * @default true
   */
  immediate?: boolean

  /**
   * 加载的初始状态
   * @default false
   */
  loading?: boolean

  /**
   * 默认情况下，当请求连续发生时，是否强制触发新请求
   * - false，请求不会多次执行，返回当前执行中的请求。
   * - true，当前请求会立即执行，并使得未完成的前序请求被抛弃。
   * @default false
   */
  force?: boolean

  /**
   * 当成功请求到数据时，对数据进行处理。支持异步函数
   * @param data
   * @returns 返回修改后的数据，会取代原数据作为结果
   */
  resolved?: (data: Data) => Promisable<Data>
}

export type DataType<
  Data = any,
  Default extends PartialWhenObj<Data> = PartialWhenObj<Data>,
> = Simplify<PartialDeep<Data> & Default>

export { PartialDeep }
