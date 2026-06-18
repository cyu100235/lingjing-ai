import type { NavigationGuardNext } from 'vue-router'
import { useSiteConfigStore } from '@/stores/siteConfig'
import { useUserStore } from '@/stores/user'
import { appEventBus } from '@/events'
import type { Router } from 'vue-router'

function isMobileDevice(): boolean {
  const ua = navigator.userAgent || navigator.vendor || (window as Window & { opera?: string }).opera || ''
  const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua)
  const narrowScreen = window.innerWidth <= 768
  const touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  return mobileUA || (narrowScreen && touchDevice) || narrowScreen
}

/** 无需登录即可访问的路由白名单 */
const NO_AUTH_ROUTES = new Set(['help'])

// 路由前置拦截器
export default function setupBeforeEach(router: Router) {
  router.beforeEach(async (to, _from, next: NavigationGuardNext) => {
    if (to.meta.skipMobileCheck) {
      next()
      return
    }
    if (isMobileDevice()) {
      next({ name: 'mobile' })
      return
    }
    // 获取句柄
    const siteConfig = useSiteConfigStore()
    const userStore = useUserStore()
    // 初始站点配置
    await siteConfig.init()
    // 初始化用户信息
    await userStore.initUser()
    // 未登录时：白名单直接放行；首页弹出登录框并允许访问；其他页面跳转至首页并弹出登录框
    if (!userStore.isLoggedIn) {
      if (NO_AUTH_ROUTES.has(to.name as string)) {
        next()
        return
      }
      if (to.name === 'home') {
        appEventBus.emitShowLogin()
        next()
        return
      }
      appEventBus.emitShowLogin()
      next({ name: 'home' })
      return
    }
    next()
  })
}
