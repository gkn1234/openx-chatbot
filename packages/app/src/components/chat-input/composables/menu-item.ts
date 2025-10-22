import { ChatInputMenuContext } from './menu'

interface MenuItemElement extends HTMLElement {
  _chatInputMenuItemContext: ChatInputMenuItemContext
}

export class ChatInputMenuItemContext {
  menu: ChatInputMenuContext

  /** 唯一标识，必传 */
  id: any

  /** 子组件在列表中的索引 */
  index = -1

  /** 子组件元素引用 */
  itemEl = ref<MenuItemElement>()

  /** 子组件元素的宽度 */
  width = 0

  /** 是否折叠 */
  collapse = ref(false)

  constructor(id: any) {
    this.id = id
    this.menu = ChatInputMenuContext.use()

    onMounted(() => {
      this.mount()
    })

    onBeforeUnmount(() => {
      this.unmount()
    })
  }

  mount() {
    if (!this.itemEl.value) {
      return
    }

    const el = this.itemEl.value
    el._chatInputMenuItemContext = this
    this.width = el.offsetWidth + this.menu.GAP_SIZE
    const prevItem = this.findPrevItem()
    const index = prevItem ? prevItem._chatInputMenuItemContext.index + 1 : 0
    this.menu.children.splice(index, 0, this)
    this.index = index

    for (let i = index + 1; i < this.menu.children.length; i++) {
      this.menu.children[i].index = i
    }

    this.menu.updateMenuItem()
  }

  unmount() {
    this.menu.children.splice(this.index, 1)

    for (let i = this.index; i < this.menu.children.length; i++) {
      this.menu.children[i].index = i
    }
  }

  findPrevItem() {
    if (!this.itemEl.value) {
      return null
    }

    let cur = this.itemEl.value.previousSibling
    while (cur) {
      if ((cur as any)?.dataset?.chatInputMenuItemId) {
        return cur as MenuItemElement
      }
      cur = cur.previousSibling
    }
    return null
  }
}
