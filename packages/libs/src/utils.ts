import type { InferVueDefaults } from '@openx/utils/vue'

export interface ChatTipsProps {
  /** 用户信息 */
  userInfo?: {
    /** 工号 */
    name: string

    /** 头像 */
    avatar: string

    /** 姓名 */
    nickName: string
  }

  /** 当前项目信息 */
  projectInfo?: Record<string, any>

  /** 当前社区信息 */
  communityInfo?: Record<string, any>

  /** 页面内容准备时间 */
  contentPrepareTime?: number

  /** 获取页面主内容时间 */
  pageContent?: () => string

  /** 聊天助手部署地址 */
  chatUrl?: string
}

export function defaultChatTipsProps() {
  return {
    userInfo: () => ({
      name: '',
      avatar: '',
      nickName: '',
    }),
    projectInfo: () => ({}),
    communityInfo: () => ({}),
    contentPrepareTime: 3000,
    pageContent: () => document.body.textContent || '',
    chatUrl: '',
  } satisfies Required<InferVueDefaults<ChatTipsProps>>
}

export function defaultChatTipsOptions(): Required<ChatTipsProps> {
  return {
    userInfo: {
      name: '',
      avatar: '',
      nickName: '',
    },
    projectInfo: {},
    communityInfo: {},
    contentPrepareTime: 3000,
    pageContent: () => document.body.textContent || '',
    chatUrl: '',
  }
}
