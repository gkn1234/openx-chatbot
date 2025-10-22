import dotenv from 'dotenv';

export function readEnv() {
  // 先加载入仓的配置文件，再加载本地的配置文件
  dotenv.config({ path: '.env' });
  dotenv.config({ path: '.env.local', override: true });
}
