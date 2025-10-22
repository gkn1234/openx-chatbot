import type {
  UserConfig,
} from '../../build/vite';
import { env } from 'node:process';
import {
  defineConfig,
  dtsPlugin,
  getExternalDependencies,
  tsconfigPath,
  unpluginAutoImport,
  vue,
} from '../../build/vite';

/**
 * // https://vitejs.dev/config/
 *
 * mode 取值：
 * - all，构建 index 全量 umd 产物
 * - proxy-all，构建代理全量 umd 产物
 * - 空值，构建 es 产物
 */
export default defineConfig(async ({ mode }) => {
  const isBuildAll = mode.includes('all');

  const entryMap: Record<string, string | Record<string, string>> = {
    'proxy-all': 'src/proxy-client',
    'all': 'src/index.full',
    'default': {
      'index': 'src/index',
      'proxy-client': 'src/proxy-client',
    },
  };

  const entry = entryMap[mode] || entryMap.default;

  let external: (string | RegExp)[] = [];

  if (!isBuildAll) {
    external = await getExternalDependencies();
  }

  return {
    plugins: [
      vue(),

      // 自动按需引入 API，无需写 import 语句
      unpluginAutoImport({
        dts: 'src/auto-import.d.ts',
        imports: [
          'vue',
        ],
      }),

      isBuildAll ?
        null :
          dtsPlugin({
            entryRoot: __dirname,
            pathsToAliases: false,
            include: ['src'],
          }),

      tsconfigPath(),
    ],
    define: {
      'import.meta.env.IS_BUILD_ALL': isBuildAll,
      'process.env.NODE_ENV': `'${env.NODE_ENV}'`,
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: isBuildAll ?
            '@use "src/styles/utils.scss" as *;' :
            '@use "element-plus/theme-chalk/src/mixins/mixins.scss" as *;',
        },
      },
    },
    build: {
      lib: {
        entry,
        name: 'Chatbot',
        formats: isBuildAll ? ['umd'] : ['es'],
      },
      cssCodeSplit: true,
      minify: isBuildAll ? 'esbuild' : false,
      sourcemap: isBuildAll,
      emptyOutDir: !isBuildAll,
      rollupOptions: {
        external,
        output: {
          // Put chunk files at <output>/chunks
          chunkFileNames: 'chunks/[name].[hash].js',
          // Put chunk styles at <output>/assets
          assetFileNames: 'assets/[name][extname]',
          entryFileNames: isBuildAll ? '[name].js' : '[name].[format].js',
        },
      },
    },
  } as UserConfig;
});
