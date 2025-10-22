/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 是否为全量构建 */
  readonly IS_BUILD_ALL: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
declare module 'element-plus/dist/locale/zh-cn.mjs'
