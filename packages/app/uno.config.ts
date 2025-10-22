import transformerDirectives from '@unocss/transformer-directives';
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
} from 'unocss';

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify({
      ignoreAttributes: [
        ':size',
        'color',
      ],
    }),
    presetIcons({
      collections: {
        // element-plus 图标库
        ep: () => import('@iconify-json/ep/icons.json').then(i => i.default),
        // Material Design Icons
        mdi: () => import('@iconify-json/mdi/icons.json').then(i => i.default),
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
  ],
  theme: {
    // 必须与 @/styles/theme.scss 中定义的 element 主题色保持一致。
    colors: {
      'primary': '#c7000b',
      'success': '#67C23A',
      'warning': '#E6A23C',
      'danger': '#F56C6C',
      'info': '#526ecc',

      // 文字色相关
      'header': '#303133',
      'regular': '#606266',
      'secondary': '#909399',
      'placeholder': '#A8ABB2',
      'disabled': '#C0C4CC',
      'reverse': '#ffffff',

      // 背景色
      'bg_base': '#fff',
      'page': '#F2F3F5',
      'card': '#ffffff',

      // 边框色
      'base': '#DCDFE6',
      'light': '#E4E7ED',
      'lighter': '#ebeef5',
      'extra-light': '#f2f6fc',
      'dark': '#d4d7de',
      'darker': '#cdd0d6',
    },
    boxShadow: {
      base: 'var(--un-shadow-inset) 0 3px 6px 0 rgb(0 0 0 / 16%)',
      reverse: 'var(--un-shadow-inset) 0 -3px 6px 0 rgb(0 0 0 / 16%)',
      dark: ['var(--un-shadow-inset) 0 2px 4px rgb(0 0 0 / 12%)', 'var(--un-shadow-inset) 0 0 6px rgb(0 0 0 / 12%)'],
      light: 'var(--un-shadow-inset) 0 2px 12px 0 rgb(0 0 0 / 10%)',
    },
  },
});
