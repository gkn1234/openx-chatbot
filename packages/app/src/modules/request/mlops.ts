import axios from 'axios'

declare module 'axios' {
  interface AxiosRequestConfig {
    mlopsKey?: string
  }
}

export const mlopsReq = axios.create({
  timeout: 10000,
})

mlopsReq.interceptors.request.use((req) => {
  if (req.mlopsKey) {
    req.headers.Authorization = `Bearer ${req.mlopsKey}`
  }
  return req
})
