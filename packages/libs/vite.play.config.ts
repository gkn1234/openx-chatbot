import { resolve } from 'node:path';
import {
  defineConfig,
  getServerConfig,
  tsconfigPath,
  unpluginAutoImport,
  vue,
} from '../../build/vite';

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    root: 'play',
    publicDir: resolve(__dirname, 'public'),
    plugins: [
      // 自动按需引入 API，无需写 import 语句
      unpluginAutoImport({
        dts: '../src/auto-import.d.ts',
        imports: [
          'vue',
        ],
      }),
      vue(),
      tsconfigPath(),
    ],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "play/utils.scss" as *;',
        },
      },
    },
    ...getServerConfig({
      devPort: 3023,
      previewPort: 5023,
    }),
  };
});
