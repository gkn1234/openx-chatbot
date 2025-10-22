import type { PluginOptions } from 'vite-plugin-dts';
import { cwd, env } from 'node:process';
import dts from 'vite-plugin-dts';

/**
 * 生成 .d.ts 的插件配置。
 *
 * 当环境变量 `DISABLE_DTS` 为 `true` 或 `BUILD_CHECK` 为 `true` 时，禁用 .d.ts 生成插件。
 * @param options
 * @returns 插件配置
 */
export function dtsPlugin(options?: PluginOptions) {
  const disabled = env.DISABLE_DTS === 'true' || env.BUILD_CHECK === 'true';
  return disabled ?
    null :
      dts({
        entryRoot: cwd(),
        pathsToAliases: false,
        include: ['src'],
        ...options,
      });
}
