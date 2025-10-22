import type { PreviewOptions, ServerOptions } from 'vite';
import { cloneDeep } from '../../libs/utils/src/es';

export interface GetServerConfigOptions {
  devPort?: number
  previewPort?: number
  proxy?: ServerOptions['proxy']
}

export function getServerConfig(options: GetServerConfigOptions) {
  const {
    devPort = 3000,
    previewPort = 5000,
    proxy = {},
  } = options;

  const server: ServerOptions = {
    host: true,
    allowedHosts: true,
    port: devPort,
    proxy,
  };
  const preview: PreviewOptions = cloneDeep(server);
  preview.port = previewPort;

  return { preview, server };
}
