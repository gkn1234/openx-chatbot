import type { ChatInputMenuItemContext } from './menu-item';
import { throttle } from 'lodash-es';

const MENU_PROVIDE_KEY = Symbol('chat-input-menu') as InjectionKey<ChatInputMenuContext>;

export class ChatInputMenuContext {
  static use() {
    const res = inject(MENU_PROVIDE_KEY);
    if (!res) {
      throw new Error('Can not find parent menu!');
    }
    return res;
  }

  /** 间隙尺寸 */
  GAP_SIZE = 8;

  /** 折叠触发按钮尺寸 */
  COLLAPSE_BUTTON_SIZE = 42;

  /** 容器引用 */
  wrapperEl = ref<HTMLElement>();

  /** 菜单容器引用 */
  menuEl = ref<HTMLElement>();

  /** 容器宽度 */
  wrapperWidth: Ref<number>;

  /** 子组件列表 */
  children = shallowReactive<ChatInputMenuItemContext[]>([]);

  /** 临界索引 */
  cutIndex = ref<number>(0);

  /** 是否存在折叠 */
  isCollapse = computed(() => this.cutIndex.value < this.children.length);

  constructor() {
    provide(MENU_PROVIDE_KEY, this);

    const { width } = useElementSize(this.wrapperEl);
    this.wrapperWidth = width;
    watch(width, throttle(() => {
      this.updateMenuItem();
    }, 100));
  }

  updateCutIndex() {
    let widthCount = this.COLLAPSE_BUTTON_SIZE;
    let isUpdated = false;
    for (let i = 0; i < this.children.length; i++) {
      const item = this.children[i];
      widthCount += item.width;
      if (widthCount > this.wrapperWidth.value) {
        this.cutIndex.value = i;
        isUpdated = true;
        break;
      }
    }

    if (!isUpdated) {
      this.cutIndex.value = this.children.length;
    }
  }

  updateMenuItem() {
    this.updateCutIndex();

    this.children.slice(0, this.cutIndex.value).forEach((item) => {
      item.collapse.value = false;
    });

    this.children.slice(this.cutIndex.value).forEach((item) => {
      item.collapse.value = true;
    });
  }
}
