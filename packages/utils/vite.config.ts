import type { UserConfig } from '../../build/vite';
import {
  defineConfig,
  dtsPlugin,
  getExternalDependencies,
  tsconfigPath,
} from '../../build/vite';

/**
 * // https://vitejs.dev/config/
 */
export default defineConfig(async () => {
  const externals = await getExternalDependencies();

  return {
    plugins: [
      dtsPlugin(),
      tsconfigPath(),
    ],
    build: {
      lib: {
        entry: {
          'index': 'src',
          'browser': 'src/browser',
          'vue': 'src/vue',
          'vue-router': 'src/vue-router',
          'vue-composables': 'src/vue-composables',
          'vue-directives': 'src/vue-directives',
        },
        formats: ['es'],
      },
      minify: false,
      sourcemap: false,
      emptyOutDir: true,
      rollupOptions: {
        external: externals,
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
