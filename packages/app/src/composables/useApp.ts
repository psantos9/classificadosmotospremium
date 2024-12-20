import { APIClient, APIClientEvent } from '@/composables/api-client'
import { computed, nextTick, ref, unref, watch } from 'vue'
import { useRouter } from 'vue-router'

const menuItems = [
  { to: { name: 'quem-somos' }, label: 'Quem Somos' },
  { to: { name: 'perguntas-frequentes' }, label: 'Dúvidas' },
  { to: { name: 'fale-conosco' }, label: 'Contato' }
]

const sidebarOpen = ref(false)
const signedIn = ref(false)

let signedInWatcher: null | ReturnType<typeof watch> = null
const api = new APIClient({ baseURL: 'http://localhost:8788' })

api.on(APIClientEvent.SIGNED_IN, (_signedIn) => {
  signedIn.value = _signedIn
})

export const useApp = () => {
  if (signedInWatcher === null) {
    const router = useRouter()
    signedInWatcher = watch(signedIn, async () => {
      await router.push({ name: 'home' })
    })
    void nextTick(() => {
      signedIn.value = api.signedIn
    })
  }
  return {
    api,
    signedIn: computed(() => unref(signedIn)),
    menuItems: computed(() => menuItems),
    sidebarOpen: computed(() => unref(sidebarOpen)),
    openSidebar: (value: boolean) => {
      sidebarOpen.value = value
    }
  }
}
