import App from '@/App.vue'
import router from '@/router'
import { type Component, createApp } from 'vue'
import ToastPlugin from 'vue-toast-notification'
import '@/assets/main.css'
import '@/assets/style/toast-theme/index.scss'

const app = createApp(App as Component)

app
  .use(router)
  .use(ToastPlugin)

app.mount('#app')
