import App from '@/App.vue'
import { type Component, createApp } from 'vue'
import '@/assets/style/main.css'

console.log('ok')
createApp(App as Component).mount('#app')
