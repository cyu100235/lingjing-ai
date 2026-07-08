import { AxiosError } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { isWhitelisted } from './config'

// 获取 Token 的函数类型
type GetTokenFn = () => string | null

/**
 * 请求拦截器：自动附加 Token
 * 白名单中的接口无需登录即可访问，非白名单接口必须携带有效 Token
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
    const url = config.url || ''
    
    // 白名单内的接口无需验证 Token
    if (isWhitelisted(url)) {
      return config
    }

    // 非白名单接口必须登录，无 Token 则拒绝请求
    if (!token) {
      return Promise.reject('登录已过期，请重新登录')
    }

    config.headers.Authorization = `Bearer ${token}`
    return config
  }
}

/**
 * 请求错误拦截器
 */
export function requestErrorInterceptor(error: AxiosError) {
  return Promise.reject(error)
}
