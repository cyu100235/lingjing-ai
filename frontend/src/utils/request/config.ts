import type { AxiosRequestConfig } from 'axios'

/** 请求环境配置 */
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/app'

/** 默认请求配置 */
export const defaultConfig: AxiosRequestConfig = {
  baseURL: BASE_URL,
  timeout: 30000,
}
