import router from './router'
import App from './App.vue'
import xbUi from './xbUi'
import { registerAppEventHandlers } from './events'
import { appEventBus } from './events'
import './index.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(xbUi)

// 注册全局 HTTP 状态码事件处理（401/403/301/302）
registerAppEventHandlers({
  router,
  onShowLogin: () => appEventBus.emitShowLogin(),
  // onMessage: (msg, type) => { /* TODO: 接入全局 Toast */ },
})

app.mount('#app')
