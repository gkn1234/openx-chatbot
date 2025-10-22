import { homedir } from 'node:os';
import { join } from 'node:path';

export const OPENX_WEBSITE_URL = 'https://openx.huawei.com';
export const OPENX_WEBSITE_DOMAIN = 'openx.huawei.com';

export function workspace(...paths: string[]) {
  const workspace = join(homedir(), '.chatbot-openx');
  return join(workspace, ...paths);
}
