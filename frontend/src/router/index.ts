import { createRouter, createWebHashHistory } from 'vue-router'
import routes from './routes'
import setupBeforeEach from './guards/beforeEach'
import setupAfterEach from './guards/afterEach'

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

setupBeforeEach(router)
setupAfterEach(router)

export default router
