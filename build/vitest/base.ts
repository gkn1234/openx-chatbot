import type { UserWorkspaceConfig } from 'vitest/config';
import { mergeConfig } from 'vitest/config';

export type ProjectTestConfig = Exclude<UserWorkspaceConfig['test'], undefined>;

export function vitestBaseConfig(config: UserWorkspaceConfig['test']) {
  return mergeConfig(
    {
      environment: 'jsdom',
    } as ProjectTestConfig,
    config || {},
  ) as ProjectTestConfig;
}
