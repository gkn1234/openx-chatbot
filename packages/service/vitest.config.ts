import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

/**
 * 想要用 Vitest 执行测试，必须要执行
 * ```bash
 * pnpm -F @openx/chatbot-server i @swc/core-win32-x64-msvc@1.7.42
 * ```
 *
 * 安装对应平台的二进制文件，注意安装的版本与 `@swc/core` 相同。
 *
 * 这里不用 `-D` 记录到 packages.json 中，是防止在不同平台安装时出现错误
 *
 * 仅在执行测试前，临时安装对应平台的依赖
 */
export default defineConfig({
  test: {
    globals: true,
    root: './',
  },
  plugins: [
    swc.vite(),
  ],
});
