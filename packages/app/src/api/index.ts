/**
import type {
  AiCommunityApi,
  EspaceApi,
  MainApi,
  OpenApi,
} from '@openx/api-openx';
import type { App, Plugin } from 'vue';
import {
  clientLoginConfig,
  resultConfig,
} from '@openx/api-openx';
import { createPreset } from '@openx/fetch/preset';
 */

/** 所有不进行消息提示的状态码 */
/**
const NO_ALERT_CODES = [
  '401',
  'ERR_CANCELED',
];

const TOKEN_STORAGE_KEY = 'token';
const PROVIDE_KEY = '__api__';

export const api: Plugin = { install };

function install(app: App) {
  const { $router } = app.config.globalProperties;

  if (!$router)
    throw new Error('vue-router must use before!');

  const main = createPreset<MainApi>({
    timeout: 10000,
    ...clientLoginConfig({
      baseUrl: import.meta.env.VITE_MAIN_URL,
      tokenKey: TOKEN_STORAGE_KEY,
    }),
    ...resultConfig({
      onErrorCode: (res) => {
        const { code, message } = res;

        if (!NO_ALERT_CODES.includes(code)) {
          ElMessage.closeAll();
          ElMessage.error(message);
        }
      },
    }),
  });

  const ai = main.clone<AiCommunityApi>({
    baseURL: import.meta.env.VITE_AI_URL,
  });

  const espace = main.clone<EspaceApi>({
    baseURL: import.meta.env.VITE_ESPACE_URL,
  });

  const open = main.clone<OpenApi>({
    baseURL: import.meta.env.VITE_OPENAPI_URL,
  });

  const request = {
    main,
    ai,
    espace,
    open,
  };

  app.provide(PROVIDE_KEY, request);

  return request;
}

type ApiProvide = ReturnType<typeof install>;

export function useApi(app?: App) {
  const result = app ? app._context.provides[PROVIDE_KEY] as ApiProvide : inject(PROVIDE_KEY) as ApiProvide;
  if (!result)
    throw new Error('No api provided!');

  return result;
}

export function clearToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export type { Fetch } from '@openx/fetch';
 */
