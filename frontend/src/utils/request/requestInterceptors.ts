import type { AxiosError, InternalAxiosRequestConfig } from 'axios'

// 获取 Token 的函数类型
type GetTokenFn = () => string | null

/**
 * 请求拦截器：自动附加 Token
 */
export function requestInterceptor(getToken: GetTokenFn) {
  return (config: InternalAxiosRequestConfig) => {
    // 标识 AJAX 请求，确保每次请求都携带
    config.headers.set('accept', 'application/json')
    config.headers.set('X-Requested-With', 'XMLHttpRequest')

    // FormData 不手动设置 Content-Type，让浏览器自动生成（含 boundary）
    if (!(config.data instanceof FormData)) {
      config.headers.set('Content-Type', 'application/json')
    }

    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  }
}

/**
 * 请求错误拦截器
 */
export function requestErrorInterceptor(error: AxiosError) {
  return Promise.reject(error)
}
