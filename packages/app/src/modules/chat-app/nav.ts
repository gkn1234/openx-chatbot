import type { ComputedRef, Ref } from 'vue';
import type { ChatApp } from './app';

export class ChatNav {
  app: ChatApp;

  /** 移动端视图大小 */
  smSize = 800;

  /** 移动端试图大小 CSS 属性 */
  get smSizeCss() {
    return `${this.smSize}px`;
  }

  /** 视图区域宽度是否大于移动端 */
  isAboveSm: Ref<boolean>;

  /** 导航区域的模式，菜单menu / 抽屉drawer */
  navMode: ComputedRef<'menu' | 'drawer'>;

  /** 在抽屉模式下，是否折叠抽屉导航 */
  collapseDrawer: Ref<boolean>;

  /** 在任意模式下，抽屉导航是否折叠 */
  isDrawerNavCollapsed: ComputedRef<boolean>;

  /** 标题 LOGO url */
  titleLogo = ref('');

  /** 标题 LOGO 文字 */
  titleText = ref('内源问答助手');

  /** 标题 Logo 文字后方的 TAG，可以显示 “BETA” 等版本信息 */
  titleTag = ref('');

  constructor(app: ChatApp) {
    this.app = app;

    const chatNav = this._setupChatNav();
    this.isAboveSm = chatNav.isAboveSm;
    this.navMode = chatNav.navMode;
    this.collapseDrawer = chatNav.collapseDrawer;
    this.isDrawerNavCollapsed = chatNav.isDrawerNavCollapsed;

    const chatPage = this._setupChatPageLayout();
    this.isWrapperFitContent = chatPage.isFitContent;

    const chatContentScroller = this._setupChatContentScroller();
    this.isScrollerNearBottom = chatContentScroller.isScrollerNearBottom;
    this.scrollToBottomEnabled = chatContentScroller.scrollToBottomEnabled;
  }

  private _setupChatNav() {
    const { navCollapsed } = this.app.config;
    const isAboveSm = useMediaQuery(`(min-width: ${this.smSize}px)`);

    const navMode = computed(() => {
      if (isAboveSm.value && !navCollapsed.value) {
        return 'menu';
      }
      return 'drawer';
    });

    const collapseDrawer = ref(true);

    watch(navMode, (mode) => {
      if (mode === 'menu') {
        collapseDrawer.value = true;
      }
    }, { immediate: true });

    const isDrawerNavCollapsed = computed(() => {
      if (navMode.value === 'menu') {
        return true;
      }

      return collapseDrawer.value;
    });

    return {
      isAboveSm,
      navMode,
      collapseDrawer,
      isDrawerNavCollapsed,
    };
  }

  /** 聊天主区域外部容器 */
  wrapperEl = ref<HTMLElement>();

  /** 聊天内容宽度是否自适应外部容器宽度 */
  isWrapperFitContent: ComputedRef<boolean>;

  /** 初始化聊天主区域的数据 */
  private _setupChatPageLayout() {
    const { width } = useElementSize(this.wrapperEl);
    const { elementX, isOutside } = useMouseInElement(this.wrapperEl);

    watch(elementX, (x) => {
      if (
        isOutside.value ||
        !this.isAboveSm.value ||
        this.navMode.value === 'menu' ||
        !this.isDrawerNavCollapsed.value
      ) {
        return;
      }

      const minX = Math.min(100, width.value * 0.5);
      if (x < minX) {
        this.collapseDrawer.value = false;
      }
    }, { immediate: true });

    const isFitContent = computed(() => width.value < this.smSize);

    return {
      isFitContent,
    };
  }

  /** 聊天区域滚动容器 */
  scrollerEl = ref<HTMLElement>();

  /** 聊天区域滚动是否接近底部 */
  isScrollerNearBottom: ComputedRef<boolean>;

  /** 聊天区域是否可以展示滚动到底部的按钮 */
  scrollToBottomEnabled: ComputedRef<boolean>;

  /** 聊天主区域容器 */
  contentEl = ref<HTMLElement>();

  /** 聊天底部区域容器 */
  bottomEl = ref<HTMLElement>();

  private _setupChatContentScroller() {
    const threshold = 300;

    const { height } = useElementSize(
      this.contentEl,
      { width: 0, height: 0 },
      { box: 'border-box' },
    );

    const { y } = useScroll(this.scrollerEl);

    const scrollToBottomEnabled = computed(() => {
      if (!this.app.isChat.value) {
        return false;
      }

      const container = this.scrollerEl.value;
      if (!container) {
        return false;
      }

      return height.value > container.clientHeight;
    });

    const isScrollerNearBottom = computed(() => {
      const container = this.scrollerEl.value;
      if (!container) {
        return false;
      }

      if (!scrollToBottomEnabled.value) {
        return false;
      }

      return height.value - y.value - container.clientHeight <= threshold;
    });

    watch(height, () => {
      if (!isScrollerNearBottom.value) {
        return;
      }

      this.toBottom();
    });

    return {
      scrollToBottomEnabled,
      isScrollerNearBottom,
    };
  }

  toBottom(behavior: ScrollBehavior = 'smooth') {
    this.bottomEl.value?.scrollIntoView({ behavior });
  }

  /** 每次组件加载时调用，初始化状态 */
  reset(options?: ChatNavResetOptions) {
    this.collapseDrawer.value = true;
    if (!this.titleLogo.value) {
      this.titleLogo.value = options?.defaultTitleLogo || '';
    }
  }
}

export interface ChatNavResetOptions {
  /** 缺省标题 logo url */
  defaultTitleLogo?: string
}
