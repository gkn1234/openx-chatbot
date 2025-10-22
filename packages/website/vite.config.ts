import {
  defineConfig,
  ElementPlusResolver,
  getServerConfig,
  loadEnv,
  tsconfigPath,
  unocss,
  unpluginAutoImport,
  unpluginComponents,
  vue,
} from '../../build/vite';

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  // 获取环境变量
  const env = loadEnv(mode, './');

  return {
    test: {
      globals: true,
      root: './',
    },
    plugins: [
      vue(),
      // 自动按需引入 API，无需写 import 语句
      unpluginAutoImport({
        dts: 'src/auto-import.d.ts',
        imports: [
          'vue',
          'vue-router',
          '@vueuse/core',
        ],
        resolvers: [
          ElementPlusResolver({
            importStyle: false,
          }),
        ],
      }),
      // 自动按需引入 Vue 组件，无需写 import 语句
      unpluginComponents({
        dts: 'src/components.d.ts',
        extensions: ['vue'],
        globs: [
          'src/components/**/*.vue',
          '!src/components/chat-skill/skills/**',
          '!src/components/chat-markdown/markdown/components/**',
        ],
        resolvers: [
          ElementPlusResolver({
            importStyle: false,
          }),
        ],
      }),
      // 原子 css 样式方案
      unocss(),
      tsconfigPath(),
    ],
    define: {
      __VUE_PROD_DEVTOOLS__: true,
    },
    css: {
      preprocessorOptions: {
        scss: {
          // 在源码中直接 import 引入的样式，以及 vue 的 <style> 才会被注入这个头部
          additionalData: '@use "src/styles/utils.scss" as *;',
        },
      },
    },
    build: {
      sourcemap: true,
      emptyOutDir: true,
    },
    ...getServerConfig({
      devPort: 3020,
      previewPort: 5020,
      proxy: {
        '/api': {
          target: env.VITE_API_REDIRECT_URL,
          ws: false,
          changeOrigin: true,
          secure: false,
        },
      },
    }),
  };
});
