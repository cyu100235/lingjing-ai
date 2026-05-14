import { createRouter, createWebHashHistory } from 'vue-router'

function isMobileDevice(): boolean {
  const ua = navigator.userAgent || navigator.vendor || window.opera || ''
  const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua)
  const narrowScreen = window.innerWidth <= 768
  const touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  return mobileUA || (narrowScreen && touchDevice) || narrowScreen
}

const APP_NAME = '侠人2D'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/mobile',
      name: 'mobile',
      component: () => import('@/views/MobilePage/index.vue'),
      meta: { skipMobileCheck: true, title: '移动端' },
    },
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomePage/index.vue'),
      meta: { title: '首页' },
    },
    {
      path: '/works',
      name: 'works',
      component: () => import('@/views/MyWorks/index.vue'),
      meta: { title: '我的作品' },
    },
    {
      path: '/works/:id/episodes/publish-success',
      name: 'publish-success',
      component: () => import('@/views/PublishSuccessPage/index.vue'),
      meta: { title: '发布成功' },
    },
    {
      path: '/works/:id/episodes',
      name: 'episodes',
      component: () => import('@/views/EpisodesPage/index.vue'),
      meta: { title: '剧集管理' },
    },
    {
      path: '/works/:id/editor',
      name: 'editor',
      component: () => import('@/views/EditorPage/index.vue'),
      meta: { title: '编辑器' },
    },
    {
      path: '/assets',
      name: 'assets',
      component: () => import('@/views/AssetsPage/index.vue'),
      meta: { title: '素材库' },
    },
    {
      path: '/marketplace',
      name: 'marketplace',
      component: () => import('@/views/MarketplacePage/index.vue'),
      meta: { title: '素材市场' },
    },
    {
      path: '/community',
      name: 'community',
      component: () => import('@/views/CommunityPage/index.vue'),
      meta: { title: '社区' },
    },
    {
      path: '/help',
      name: 'help',
      component: () => import('@/views/HelpCenterPage/index.vue'),
      meta: { title: '帮助中心' },
    },
  ],
})

router.beforeEach((to, _from, next) => {
  if (to.meta.skipMobileCheck) {
    next()
    return
  }
  if (isMobileDevice()) {
    next({ name: 'mobile' })
    return
  }
  next()
})

router.afterEach((to) => {
  const title = to.meta.title as string | undefined
  document.title = title ? `${title} - ${APP_NAME}` : APP_NAME
})

export default router
