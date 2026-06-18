import { useSiteConfigStore } from '@/stores/siteConfig'
import type { Router } from 'vue-router'

// 路由后置拦截器
export default function setupAfterEach(router: Router) {
  router.afterEach((to) => {
    const title = to.meta.title as string | undefined
    const siteConfig = useSiteConfigStore()
    const appName = siteConfig.config?.system?.web_name || ''
    const webTitle = siteConfig.config?.system?.web_title || ''
    const isHome = to.name === 'home'
    if (isHome) {
      document.title = appName && webTitle ? `${appName} - ${webTitle}` : (appName || webTitle)
    } else {
      document.title = title && appName ? `${title} - ${appName}` : (title || appName)
    }
  })
}
