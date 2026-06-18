import type { Router } from 'vue-router'
import type { RequestEventDetail } from '@/utils/request/types'
import { RequestEvents } from '@/utils/request/types'

/**
 * 全局 HTTP 事件处理器配置
 */
export interface AppEventHandlerOptions {
  // Vue Router 实例，用于路由跳转
  router: Router
  // 弹出登录框的回调（由调用方注入，解耦登录 UI）
  onShowLogin?: () => void
  // 全局消息提示回调（可接入任意 Toast / Message 库）
  onMessage?: (message: string, type?: 'error' | 'warning' | 'info') => void
}

// 存储已注册的监听器引用，用于卸载时移除
const _handlers: Map<string, EventListener> = new Map()

/**
 * 注册全局 HTTP 状态码事件监听
 *
 * 事件说明：
 *  - 401 未登录    → 清除 token，弹出登录框
 *  - 403 权限不足  → 重定向至首页并提示
 *  - 301 永久重定向 → 跟随后端 Location 进行页面跳转
 *  - 302 临时重定向 → 跟随后端 Location 进行页面跳转
 *
 * @param options - 路由实例及可选回调
 */
export function registerAppEventHandlers(options: AppEventHandlerOptions): void {
  const { router, onShowLogin, onMessage } = options

  // --- 401 未登录 ---
  const handle401 = ((event: CustomEvent<RequestEventDetail>) => {
    const message = event.detail?.message || '登录已过期，请重新登录'
    localStorage.removeItem('token')
    onMessage?.(message, 'warning')
    // 优先使用注入的登录框，否则跳转登录页
    if (onShowLogin) {
      onShowLogin()
    }
  }) as EventListener

  // --- 403 权限不足 ---
  const handle403 = ((event: CustomEvent<RequestEventDetail>) => {
    const message = event.detail?.message || '权限不足，无法访问该资源'
    onMessage?.(message, 'error')
    router.push({ name: 'home' })
  }) as EventListener

  // --- 301 永久重定向 ---
  const handle301 = ((event: CustomEvent<RequestEventDetail>) => {
    const location = (event.detail?.response as { location?: string })?.location
    if (location) {
      // 若为站内路径则使用 router，否则直接跳转
      if (location.startsWith('/')) {
        router.push(location)
      } else {
        window.location.replace(location)
      }
    }
  }) as EventListener

  // --- 302 临时重定向 ---
  const handle302 = ((event: CustomEvent<RequestEventDetail>) => {
    const location = (event.detail?.response as { location?: string })?.location
    if (location) {
      if (location.startsWith('/')) {
        router.push(location)
      } else {
        window.location.href = location
      }
    }
  }) as EventListener

  // --- 业务错误（status 非 0）---
  const handleBusinessError = ((event: CustomEvent<RequestEventDetail>) => {
    const message = event.detail?.message || '请求失败，请稍后重试'
    onMessage?.(message, 'error')
  }) as EventListener

  // --- HTTP 错误（网络异常、超时等）---
  const handleHttpError = ((event: CustomEvent<RequestEventDetail>) => {
    const message = event.detail?.message || '网络异常，请检查网络连接'
    onMessage?.(message, 'error')
  }) as EventListener

  // 先移除旧的同名监听（防止重复注册）
  unregisterAppEventHandlers()

  window.addEventListener(RequestEvents.UNAUTHORIZED, handle401)
  window.addEventListener(RequestEvents.FORBIDDEN, handle403)
  window.addEventListener(RequestEvents.REDIRECT_PERMANENT, handle301)
  window.addEventListener(RequestEvents.REDIRECT_TEMPORARY, handle302)
  window.addEventListener(RequestEvents.BUSINESS_ERROR, handleBusinessError)
  window.addEventListener(RequestEvents.HTTP_ERROR, handleHttpError)

  _handlers.set(RequestEvents.UNAUTHORIZED, handle401)
  _handlers.set(RequestEvents.FORBIDDEN, handle403)
  _handlers.set(RequestEvents.REDIRECT_PERMANENT, handle301)
  _handlers.set(RequestEvents.REDIRECT_TEMPORARY, handle302)
  _handlers.set(RequestEvents.BUSINESS_ERROR, handleBusinessError)
  _handlers.set(RequestEvents.HTTP_ERROR, handleHttpError)
}

/**
 * 移除全局 HTTP 状态码事件监听（可用于应用卸载/测试清理）
 */
export function unregisterAppEventHandlers(): void {
  _handlers.forEach((handler, eventName) => {
    window.removeEventListener(eventName, handler)
  })
  _handlers.clear()
}

// 从独立文件中重新导出 AppEventBus 及单例实例
export { AppEventBus, appEventBus } from './AppEventBus'
