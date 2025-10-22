// 注意！本模块单独打包，不在 index 中导出

import type { ObjectDirective } from 'vue';
import Sortable from 'sortablejs';
import { toPromise } from '../es';

declare global {
  // v-sortable 指令需要在 HTMLElement 对象上扩展一个属性用于暂存 sortable 对象
  interface HTMLElement {
    _sortableInstance?: Sortable
  }
}

/** v-sortable 回调对象 */
export interface VSortableUtils {
  /** 原始 sortable 对象 */
  sortable: Sortable

  /** sortable 事件对象 */
  event: Sortable.SortableEvent

  /**
   * 处理数据列表的排序
   * @param from 处理拖拽源列表
   * @param to 处理拖拽目标列表。若不设置，则为单列表拖拽场景。
   */
  handler: <T>(from: T[], to?: T[]) => void
}

export type VSortableCallback = (sort: VSortableUtils) => Promise<any> | boolean | void;

type VSortableTuple = [VSortableCallback, Sortable.Options];

type VSortableValue = boolean | undefined | null | VSortableCallback | VSortableTuple;

/** 用 data-sortable-selector="xxx" 指定选择器，将在根元素上通过选择器选定子元素进行绑定 */
const V_SORTABLE_DATA_SELECTOR_KEY = 'sortableSelector';

/** 获取目标元素 */
function getTargetElement(el: HTMLElement): HTMLElement {
  const sortableSelector = el.dataset[V_SORTABLE_DATA_SELECTOR_KEY];
  if (sortableSelector) {
    const queryEl = el.querySelector<HTMLElement>(sortableSelector);
    if (queryEl)
      return queryEl;
  }
  return el;
}

/**
 * 自定义指令 v-sortable，元素挂载的瞬间触发。
 *
 * @alert 指令不支持动态响应，效果以初次绑定的内容为准
 *
 * `binding.arg` 作为排序列表的分组
 *
 * `binding.value` 可以为异步请求方法，每次排序结束时触发此方法，具有以下特点：
 * - 返回 Promise.reject 或 false 时，视为排序失败，还原排序。
 * - 返回 Promise.resolve 或 true、undefined 时，视为排序成功。
 *
 * 当 `binding.value` 为数组时，第一个成员为异步请求方法，第二个成员为 sortablejs 的选项
 *
 * data-sortable-selector 属性可以使 v-sortable 继续向下探查，例如 el-table 组件实际的行元素在组件深层子元素中。
 *
 * @example
 * <el-table
 *   v-sortable="fetch"
 *   data-sortable-selector=".el-table__body-wrapper > table > tbody">
 * </el-table>
 *
 * <ul v-sortable="[fetch, options]">
 *   <li>1</li>
 *   <li>2</li>
 *   <li>3</li>
 *   <li>4</li>
 * </ul>
 */
export const vSortable: ObjectDirective<HTMLElement, VSortableValue> = {
  beforeMount(el, binding) {
    // 先确定目标元素
    const target = getTargetElement(el);

    let callback: Exclude<VSortableValue, VSortableTuple>;
    let options: Sortable.Options | undefined;
    const { value } = binding;
    if (typeof value === 'function') {
      callback = value;
    }
    else if (Array.isArray(value)) {
      callback = value[0];
      options = value[1];
    }
    else {
      callback = value;
    }

    const sortable = Sortable.create(target, {
      onEnd: (event) => {
        const { newIndex, oldIndex } = event;

        const sort: VSortableUtils = {
          event,
          sortable,
          handler<T>(from: T[], to?: T[]) {
            const fromList = from;
            const toList = to || from;
            if (typeof oldIndex === 'number' && typeof newIndex === 'number') {
              const [obj] = fromList.splice(oldIndex, 1);
              toList.splice(newIndex, 0, obj);
            }
          },
        };

        toPromise(callback, [sort]).catch(() => {
          // 回调出错，恢复原序
          recover(event);
        });
      },

      ...options,
    });

    if (binding.arg)
      sortable.option('group', binding.arg);
  },
  beforeUnmount(el) {
    const sortable = el._sortableInstance;
    if (sortable)
      sortable.destroy();
  },
};

/** 当拖拽出错时，进行复原 */
function recover(event: Sortable.SortableEvent) {
  const {
    newIndex,
    oldIndex,
    from,
    to,
  } = event;
  if (typeof oldIndex === 'number' && typeof newIndex === 'number') {
    const target = to.children[newIndex];
    to.removeChild(target);
    from.insertBefore(target, from.children[oldIndex]);
  }
}
