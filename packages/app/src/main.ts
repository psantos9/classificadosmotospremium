import App from '@/App.vue'
import { useMixpanel } from '@/composables/useMixpanel'
import Draggable from '@/directives/draggable'
import { printAppVersionConsoleBanner } from '@/helpers/printAppVersionConsoleBanner'
import router from '@/router'
import { type Component, createApp } from 'vue'
import ToastPlugin from 'vue-toast-notification'
import '@/assets/main.css'
import '@/assets/style/toast-theme/index.scss'

printAppVersionConsoleBanner()

const { initMixpanel } = useMixpanel()
initMixpanel()

const app = createApp(App as Component)

app
  .directive('draggable', Draggable)
  .use(router)
  .use(ToastPlugin)

app.mount('#app')
