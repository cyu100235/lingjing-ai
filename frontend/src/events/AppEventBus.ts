import type { RequestEventDetail } from '@/utils/request/types'
import { RequestEvents } from '@/utils/request/types'

/**
 * 应用级事件总线
 *
 * 支持程序化触发 window CustomEvent，与 HTTP 拦截器的事件体系互通。
 * 可在任意组件/模块中手动触发或监听全局事件。
 *
 * @example
 * ```ts
 * import { appEventBus } from '@/events'
 *
 * // 触发 401 事件
 * appEventBus.emitUnauthorized({
 *   type: 'unauthorized',
 *   message: '登录已过期',
 *   status: 401,
 * })
 *
 * // 通用触发任意事件
 * appEventBus.emit('my-custom-event', { foo: 'bar' })
 *
 * // 监听事件
 * appEventBus.on<RequestEventDetail>(RequestEvents.FORBIDDEN, (e) => {
 *   console.log(e.detail.message)
 * })
 * ```
 */
export class AppEventBus {
  /**
   * 触发自定义事件
   * @param eventName - 事件名称
   * @param detail - 事件负载（可选）
   */
  emit<T = unknown>(eventName: string, detail?: T): void {
    window.dispatchEvent(new CustomEvent(eventName, { detail }))
  }

  /**
   * 监听自定义事件
   * @param eventName - 事件名称
   * @param handler - 事件回调
   */
  on<T = unknown>(eventName: string, handler: (event: CustomEvent<T>) => void): void {
    window.addEventListener(eventName, handler as EventListener)
  }

  /**
   * 移除自定义事件监听
   * @param eventName - 事件名称
   * @param handler - 与注册时相同的回调引用
   */
  off<T = unknown>(eventName: string, handler: (event: CustomEvent<T>) => void): void {
    window.removeEventListener(eventName, handler as EventListener)
  }

  /**
   * 一次性监听：触发后自动移除
   * @param eventName - 事件名称
   * @param handler - 事件回调
   */
  once<T = unknown>(eventName: string, handler: (event: CustomEvent<T>) => void): void {
    const wrapper = (event: CustomEvent<T>) => {
      handler(event)
      this.off(eventName, wrapper)
    }
    this.on(eventName, wrapper)
  }

  // 快捷触发 401 未登录事件
  emitUnauthorized(detail: RequestEventDetail): void {
    this.emit(RequestEvents.UNAUTHORIZED, detail)
  }

  // 快捷触发 403 权限不足事件
  emitForbidden(detail: RequestEventDetail): void {
    this.emit(RequestEvents.FORBIDDEN, detail)
  }

  // 快捷触发 301 永久重定向事件
  emitRedirectPermanent(detail: RequestEventDetail): void {
    this.emit(RequestEvents.REDIRECT_PERMANENT, detail)
  }

  // 快捷触发 302 临时重定向事件
  emitRedirectTemporary(detail: RequestEventDetail): void {
    this.emit(RequestEvents.REDIRECT_TEMPORARY, detail)
  }

  /** 触发"显示登录弹窗"事件 */
  emitShowLogin(): void {
    this.emit('app:show-login')
  }

  /** 监听"显示登录弹窗"事件 */
  onShowLogin(handler: () => void): void {
    this.on('app:show-login', handler as (event: CustomEvent) => void)
  }

  /** 移除"显示登录弹窗"事件监听 */
  offShowLogin(handler: () => void): void {
    this.off('app:show-login', handler as (event: CustomEvent) => void)
  }
}

// 默认事件总线实例（单例）
export const appEventBus = new AppEventBus()
