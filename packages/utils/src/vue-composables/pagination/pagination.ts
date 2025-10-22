import type {
  MergeFilter,
  UsePaginationBasicFilters,
  UsePaginationFiltersHandlerMap,
  UsePaginationFiltersOptionsMap,
  UsePaginationGetterResult,
  UsePaginationOptions,
} from './types';
import { debounce, throttle } from 'lodash-es';
import {
  computed,
  reactive,
  ref,
  watch,
} from 'vue';
import { isNum, mergeDeep } from '../../es';
import { UseRequest } from '../request';
import {
  basicChain,
  defaultPaginationFilters,
  defaultPaginationFiltersOptions,
} from './utils';

export class UsePagination<
  ListItem = any,
  Filters extends UsePaginationBasicFilters = UsePaginationBasicFilters,
> {
  static defaultOptions<
    ListItem = any,
    Filters extends UsePaginationBasicFilters = UsePaginationBasicFilters,
  >(
    options: UsePaginationOptions<ListItem, Filters>,
  ): Required<UsePaginationOptions<ListItem, Filters>> {
    return {
      resolved: res => res,
      force: false,
      loading: false,
      immediate: true,
      scroll: false,
      scrollReload: f => f.current === 1,
      list: [],
      filters: {} as Filters,
      filtersOptions: {},
      ...options,
    };
  }

  protected _options: Required<UsePaginationOptions<ListItem, Filters>>;

  /** 分页请求发送对象 */
  request: UseRequest<UsePaginationGetterResult<ListItem>>;

  /**
   * 所有过滤条件，响应式
   *
   * 修改过滤条件的值，会触发新的请求响应
   */
  filters: MergeFilter<Filters>;

  /** 记录所有过滤选项 */
  private _filtersOptions: UsePaginationFiltersOptionsMap<ListItem, Filters>;

  private _filtersHandler: UsePaginationFiltersHandlerMap<Filters>;

  /** 当前展示的列表，响应式对象 */
  list: ListItem[];

  /** 瀑布流加载时会改变，用于标记列表中是否还有更多内容 */
  noMore = ref(false);

  /** 当前数据条目总数 */
  total = ref(0);

  /** 请求加载状态 */
  loading = computed(() => this.request.loading);

  constructor(options: UsePaginationOptions<ListItem, Filters>) {
    this._options = UsePagination.defaultOptions<ListItem, Filters>(options);

    this.filters = reactive({
      ...defaultPaginationFilters(),
      ...this._options.filters,
    }) as MergeFilter<Filters>;

    this._filtersOptions = mergeDeep(
      { concatArray: false },
      defaultPaginationFiltersOptions(),
      this._options.filtersOptions,
    );

    this._filtersHandler = this._initFiltersHandler();

    this.list = reactive(this._options.list) as ListItem[];

    this.request = new UseRequest({
      getter: () => this._options.getter(this.filters),
      default: {
        records: <ListItem[]>[],
        total: 0,
      },
      force: this._options.force,
      loading: this._options.loading,
      immediate: false,
      resolved: this.onResolved.bind(this),
    });

    this._initFiltersChain();

    if (this._options.immediate)
      this.fetch();
  }

  private _initFiltersChain() {
    Object.keys(this.filters).forEach((key) => {
      const k = key as keyof typeof this.filters;

      const handler = this._filtersHandler[k];
      if (!handler)
        return;

      watch(
        () => this.filters[k],
        (handler as any).bind(null, this._options.force),
        { flush: 'post', deep: true },
      );
    });
  }

  private _initFiltersHandler() {
    const result: UsePaginationFiltersHandlerMap<Filters> = {};
    Object.keys(this.filters).forEach((key) => {
      const k = key as keyof MergeFilter<Filters>;

      const {
        chain = basicChain,
        debounce: debounceTime,
        debounceOptions,
        throttle: throttleTime,
        throttleOptions,
      } = this._filtersOptions[k] || {};

      const handler = <K extends keyof MergeFilter<Filters> = keyof MergeFilter<Filters>>(
        force: boolean,
        val: MergeFilter<Filters>[K],
        oldVal: MergeFilter<Filters>[K],
      ) => {
        (chain as any)(this, val, oldVal, force);
      };

      if (isNum(throttleTime) && throttleTime > 0) {
        result[k] = throttle(handler, throttleTime, throttleOptions) as any;
        return;
      }

      if (isNum(debounceTime) && debounceTime > 0) {
        result[k] = debounce(handler, debounceTime, debounceOptions) as any;
        return;
      }

      result[k] = handler;
    });

    return result;
  }

  /** 改变滚动选项配置 */
  setScroll(options?: Pick<UsePaginationOptions<ListItem, Filters>, 'scroll' | 'scrollReload'>) {
    const {
      scroll,
      scrollReload,
    } = options || {};

    if (scroll !== undefined && scroll !== this._options.scroll) {
      this._options.scroll = scroll;
      this.noMore.value = false;
    }

    if (scrollReload)
      this._options.scrollReload = scrollReload;
  }

  protected onResolved(res: UsePaginationGetterResult<ListItem>) {
    if (this._options.scroll) {
      if (this._options.scrollReload(this.filters)) {
        // 瀑布流加载时满足重置条件时，清空数据列表
        this.list.length = 0;
      }

      // 处理瀑布流的连续加载分页
      this.list.push(...res.records);

      if (!res.records?.length)
        this.noMore.value = true;
    }
    else {
      // 处理常规分页
      this.list.length = 0;
      this.list.push(...res.records);
    }

    this.total.value = res.total || this.list.length;
    return res;
  }

  /**
   * 供手动调用的请求方法。
   *
   * 一般用于 options.immediate = false 时择机调用。
   *
   * 当 fillters 中的过滤条件改变时，会自动调用方法进行请求
   * @param force 当请求连续发生时，是否强制触发新请求。
   * - false，请求不会多次执行，返回当前执行中的请求。
   * - true，当前请求会立即执行，并使得未完成的前序请求被抛弃。
   */
  fetch(force?: boolean) {
    if (this._options.scroll && this._options.scrollReload(this.filters)) {
      // 瀑布流加载时满足重置条件时，将 noMore 标记重置，使请求可以被发送出来
      this.noMore.value = false;
    }

    if (this._options.scroll && this.noMore.value)
      return Promise.resolve<ListItem[]>([]);

    return this.request.fetch(force).then(res => res.records);
  }

  /**
   * 修改过滤条件触发请求
   * @param key
   * @param value
   */
  set<K extends keyof MergeFilter<Filters>>(
    key: K,
    value: MergeFilter<Filters>[K],
    force?: boolean,
  ) {
    const oldValue = this.filters[key];
    if (value === oldValue) {
      const handler = this._filtersHandler[key];
      const forceSign = typeof force === 'undefined' ? this._options.force : force;
      handler?.(forceSign, value, oldValue);
    }
    else {
      this.filters[key] = value;
    }
  }
}
