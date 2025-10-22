import { Agent } from 'node:https';
import { env } from 'node:process';
import axios from 'axios';

let tokenCache: string | null = null;

export const request = axios.create({
  timeout: 10000,
  httpsAgent: new Agent({
    rejectUnauthorized: false,
  }),
});

request.interceptors.request.use(async (config) => {
  if (!tokenCache)
    tokenCache = await getToken();

  config.baseURL = env.OPENX_URL;
  config.headers.Authorization = `Bearer ${tokenCache}`;

  return config;
});

request.interceptors.response.use((res) => {
  const { data } = res;
  if (String(data?.code) === '0') {
    return data?.data;
  }
  else if (String(data?.code) === '401') {
    tokenCache = null;
    return request(res.config);
  }

  return Promise.reject(new axios.AxiosError(
    data.message || data.msg,
    data?.code || axios.AxiosError.ERR_BAD_RESPONSE,
    res.config,
    res.request,
    res,
  ));
});

async function getToken() {
  const res = await axios.get(
    `${env.OPENX_URL}/getToken/openx/specific`,
    {
      timeout: 10000,
      httpsAgent: new Agent({
        rejectUnauthorized: false,
      }),
      params: { userName: env.OPENX_USER },
    },
  );
  return res.data?.data?.token as string || null;
}
