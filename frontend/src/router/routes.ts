import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/mobile',
    name: 'mobile',
    component: () => import('@/views/MobilePage/index.vue'),
    meta: { skipMobileCheck: true, title: '移动端' },
  },
  {
    path: '/',
    component: () => import('@/layouts/AppLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/views/HomePage/index.vue'),
        meta: { title: '首页' },
      },
      {
        path: 'works',
        name: 'works',
        component: () => import('@/views/MyWorks/index.vue'),
        meta: { title: '我的作品' },
      },
      {
        path: 'works/episodes/publish-success',
        name: 'publish-success',
        component: () => import('@/views/PublishSuccessPage/index.vue'),
        meta: { title: '发布成功' },
      },
      {
        path: 'works/episodes',
        name: 'episodes',
        component: () => import('@/views/EpisodesPage/index.vue'),
        meta: { title: '剧集管理' },
      },
      {
        path: 'assets',
        name: 'assets',
        component: () => import('@/views/AssetsPage/index.vue'),
        meta: { title: '我的资产' },
      },
      {
        path: 'assets/generate',
        name: 'assets-generate',
        component: () => import('@/views/AssetsGeneratePage/index.vue'),
        meta: { title: '生成资产' },
      },
      {
        path: 'marketplace',
        name: 'marketplace',
        component: () => import('@/views/MarketplacePage/index.vue'),
        meta: { title: '素材市场' },
      },
      {
        path: 'community',
        name: 'community',
        component: () => import('@/views/CommunityPage/index.vue'),
        meta: { title: '社区' },
      },
      {
        path: 'help',
        name: 'help',
        component: () => import('@/views/HelpCenterPage/index.vue'),
        meta: { title: '帮助中心' },
      },
    ],
  },
  {
    path: '/works/episodes/create-layout',
    component: () => import('@/views/EpisodesPage/CreateLayout.vue'),
    meta: { hideNav: true },
    children: [
      {
        path: '/works/episodes/create',
        name: 'works-create',
        component: () => import('@/views/EpisodesPage/create.vue'),
        meta: { title: '创建剧集', currentStep: 1, pageTitle: '创建分集' },
      },
      {
        path: '/works/episodes/EntitiesManage',
        name: 'entities',
        component: () => import('@/views/EpisodesPage/EntitiesManage.vue'),
        meta: { title: '主体管理', currentStep: 2, pageTitle: '主体管理', backPath: '/works' },
      },
      {
        path: '/works/episodes/groupMultiEdit',
        name: 'group-multi-edit',
        component: () => import('@/views/EpisodesPage/groupMultiEdit.vue'),
        meta: { title: '分镜管理', currentStep: 3, pageTitle: '分镜管理', backPath: '/works' },
      },
      {
        path: '/works/episodes/generate',
        name: 'generate',
        component: () => import('@/views/EpisodesPage/generate.vue'),
        meta: { title: '视频生成', currentStep: 4, pageTitle: '视频生成', backPath: '/works' },
      },
      {
        path: '/works/episodes/preview',
        name: 'preview',
        component: () => import('@/views/EpisodesPage/preview.vue'),
        meta: { title: '成品预览', currentStep: 5, pageTitle: '成品预览', backPath: '/works' },
      },
    ],
  },
]

export default routes
