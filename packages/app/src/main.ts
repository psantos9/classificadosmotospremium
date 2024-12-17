import App from '@/App.vue'

import router from '@/router'
import { type Component, createApp } from 'vue'
import '@/assets/main.css'

const app = createApp(App as Component)
console.log('ok')
app.use(router)

app.mount('#app')
