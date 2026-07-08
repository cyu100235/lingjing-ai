import type { AxiosRequestConfig } from 'axios'

/** 请求环境配置 */
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/proxy'

/** 默认请求配置 */
export const defaultConfig: AxiosRequestConfig = {
  baseURL: BASE_URL,
  timeout: 30000,
}

import whiteData from './white.json'

/** 请求地址白名单（从 white.json 自动加载） */
export const requestWhitelist: string[] = whiteData

/**
 * 检查给定的请求地址是否在白名单中
 * @param url 请求地址（相对路径）
 * @returns 是否在白名单中
 */
export function isWhitelisted(url: string): boolean {
  if (!url) return false
  // 检测URL前面没有斜杠，自动添加
  if (!url.startsWith('/')) url = '/' + url
  // 遍历白名单列表
  return requestWhitelist.some((pattern) => {
    // 精确匹配，支持带参数的 URL，如 /user/123
    if (!pattern.includes('*')) {
      return url === pattern || url.startsWith(pattern + '?') || url.startsWith(pattern + '/')
    }

    // 通配符匹配：将 * 转为正则
    const regexStr = '^' + pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$'
    const regex = new RegExp(regexStr)
    return regex.test(url)
  })
}
