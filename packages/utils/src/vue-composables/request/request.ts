import type {
  DataType,
  PartialWhenObj,
  UseRequestOptions,
} from './types';
import { reactive } from 'vue';
import { toPromise } from '../../es';

export class UseRequest<
  Data = any,
  Default extends PartialWhenObj<Data> = PartialWhenObj<Data>,
> {
  static defaultOptions<
    Data = any,
    Default extends PartialWhenObj<Data> = PartialWhenObj<Data>,
  >(
    options: UseRequestOptions<Data, Default>,
  ): Required<UseRequestOptions<Data, Default>> {
    return {
      resolved: res => res,
      force: false,
      loading: false,
      immediate: true,
      ...options,
    };
  }

  private _options: Required<UseRequestOptions<Data, Default>>;

  /** 异步请求缓存 */
  private _promise: Promise<Data> | null = null;

  /**
   * 正在加载中
   * @default false
   */
  loading: boolean;

  /** 数据 */
  data: DataType<Data, Default>;

  /** 最近一次请求是否成功 */
  success = false;

  /** 成功执行次数统计 */
  successCount = 0;

  /** 失败执行次数统计 */
  failedCount = 0;

  /** 执行次数总数 */
  get count() {
    return this.successCount + this.failedCount;
  }

  /** 是否完成初始化，即是否成功执行过一次请求，等效于 successCount >= 1 */
  get initiated() {
    return this.successCount >= 1;
  }

  constructor(options: UseRequestOptions<Data, Default>) {
    this._options = UseRequest.defaultOptions(options);

    this.loading = this._options.loading;
    this.data = this._options.default as DataType<Data, Default>;

    const instance = reactive(this);

    if (this._options.immediate)
      instance.init();

    return instance as any;
  }

  /**
   * 触发请求，更新数据的方法
   * @param force 当请求连续发生时，是否强制触发新请求。
   * - false，请求不会多次执行，返回当前执行中的请求。
   * - true，当前请求会立即执行，并使得未完成的前序请求被抛弃。
   */
  fetch(force?: boolean) {
    const forceSign = typeof force === 'undefined' ? this._options.force : force;

    // force 为 false 时，请求不会多次执行，连续执行时返回当前有效的请求
    if (this._promise && !forceSign)
      return this._promise;

    this.loading = true;
    const promise = toPromise(this._options.getter, [], false)
      .then(async (res) => {
        // 强制触发新请求时，之前丢弃的请求直接返回结果，不做后续处理
        if (promise !== this._promise)
          return res;

        const result = await toPromise(this._options.resolved, [res], false);
        this.success = true;
        this.successCount++;
        this.data = result as DataType<Data, Default>;

        this._promise = null;
        this.loading = false;
        return res;
      })
      .catch((err) => {
        if (promise !== this._promise)
          return Promise.reject(err);

        this.success = false;
        this.failedCount++;

        this._promise = null;
        this.loading = false;
        return Promise.reject(err);
      });

    this._promise = promise;
    return this._promise;
  }

  /** 只执行一次请求，当 initiated === true 后就不再执行请求过程 fetch */
  async init() {
    if (this.initiated)
      return;

    const promise = this._promise || this.fetch();
    await promise;
  }

  /**
   * 重置请求状态，会做以下行为：
   * - 将 data、loading 重置为默认值
   * - 清空请求执行次数与状态的统计
   */
  reload() {
    this.loading = this._options.loading;
    this.data = this._options.default as DataType<Data, Default>;
    this.success = false;
    this.successCount = 0;
    this.failedCount = 0;
    this._promise = null;
  }
}
