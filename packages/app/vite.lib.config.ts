import type { UserConfig } from 'vite';
import {
  defineConfig,
  dtsPlugin,
  getExternalDependencies,
  tsconfigPath,
  unpluginAutoImport,
} from '../../build/vite';

export default defineConfig(async () => {
  const external = await getExternalDependencies();

  return {
    plugins: [
      // 自动按需引入 API，无需写 import 语句
      unpluginAutoImport({
        dts: 'src/auto-import.d.ts',
        imports: [
          'vue',
          'vue-router',
          '@vueuse/core',
        ],
      }),
      dtsPlugin({
        entryRoot: __dirname,
        pathsToAliases: false,
        include: ['src'],
      }),
      tsconfigPath(),
    ],
    build: {
      lib: {
        entry: {
          'index': 'src/index',
          'client': 'src/client',
          'proxy-client': 'src/proxy-client',
        },
        formats: ['es'],
      },
      cssCodeSplit: true,
      minify: false,
      rollupOptions: {
        external,
        output: {
          // Put chunk files at <output>/chunks
          chunkFileNames: 'chunks/[name].[hash].js',
          // Put chunk styles at <output>/assets
          assetFileNames: 'assets/[name][extname]',
          entryFileNames: '[name].js',
        },
      },
    },
  } as UserConfig;
});
