import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import xbUi from './xbUi'
import './index.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(xbUi)
app.mount('#app')
