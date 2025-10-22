import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { visualizer } from 'rollup-plugin-visualizer';
import unocss from 'unocss/vite';
import unpluginAutoImport from 'unplugin-auto-import/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import unpluginComponents from 'unplugin-vue-components/vite';
import inspect from 'vite-plugin-inspect';
import tsconfigPath from 'vite-tsconfig-paths';

export * from './dts-plugin';
export * from './external';
export * from './server';

export type { UserConfig } from 'vite';
export { defineConfig, loadEnv } from 'vite';
export type { PluginOptions as TsconfigPathsOptions } from 'vite-tsconfig-paths';
export {
  ElementPlusResolver,
  inspect,
  tsconfigPath,
  unocss,
  unpluginAutoImport,
  unpluginComponents,
  visualizer,
  vue,
  vueJsx,
};
