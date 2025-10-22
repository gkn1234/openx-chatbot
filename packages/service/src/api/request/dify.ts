import type { DatasetModuleApi } from '@openx/api-dify';
import { Agent } from 'node:https';
import { env } from 'node:process';
import { createPreset } from '@openx/fetch/preset';

export const difyDatasetRequest = createPreset<DatasetModuleApi>({
  timeout: 10000,
  httpsAgent: new Agent({
    rejectUnauthorized: false,
  }),
  onConfigSet: (config) => {
    config.baseURL = env.DIFY_URL;
    config.headers.Authorization = `Bearer ${env.DIFY_DATASET_KEY}`;
    return config;
  },
  onResponse: (res) => {
    if (res instanceof Error) {
      return Promise.reject(res);
    }

    return res.data;
  },
});
