import type { Mensagem, SelectUsuario } from '@cmp/shared/models/database/models'
import type { IThread } from '@cmp/shared/models/thread'
import { APIClient, APIClientEvent } from '@/services/api-client'
import { WebSocketMessageProcessor } from '@/services/websocket-message-processor'
import { WebSocketService, WebSocketServiceEvent } from '@/services/websocket-service'
import { computed, nextTick, ref, unref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMixpanel } from './useMixpanel'

const { setLoggedUser, trackSignIn, trackSignOut, trackPageLeave } = useMixpanel()

const menuItems = [
  { to: { name: 'quem-somos' }, label: 'Quem Somos' },
  { to: { name: 'perguntas-frequentes' }, label: 'Dúvidas' },
  { to: { name: 'fale-conosco' }, label: 'Contato' }
]

const sidebarOpen = ref(false)
const signedIn = ref(false)

const unreadMessages = ref<Mensagem[]>([])
const threads = ref<IThread[]>([])
const usuario = ref<SelectUsuario | null>(null)

const cadastraEmail = ref<string | undefined>(undefined)

const acessorios = ref<string[]>([])
const informacoesAdicionais = ref<string[]>([])
const cores = ref<string[]>([])

const sortingOptions = [
  { key: '_text_match:desc', label: 'Mais relevantes' },
  { key: 'publishedAt:desc', label: 'Mais recentes' },
  { key: 'preco:asc', label: 'Menor preço' },
  { key: 'quilometragem:asc', label: 'Menor quilometragem' }
]

const sortingOption = ref<{ key: string, label: string }>(sortingOptions[0])

let signedInWatcher: null | ReturnType<typeof watch> = null

const api = new APIClient({ baseURL: __API_BASE_URL__ })

const webSocketMessageProcessor = new WebSocketMessageProcessor({
  onUnreadMessages: (messages) => {
    unreadMessages.value = messages
  }
})
const websocketService = new WebSocketService({ api, webSocketMessageProcessor })

websocketService.on(WebSocketServiceEvent.STATE_UPDATE, (webSocketServiceState) => {
  console.log('GOT WEBSOCKET SERVICE', webSocketServiceState)
})

websocketService.on(WebSocketServiceEvent.RTT, (rtt) => {
  console.log('GOT SOCKET RTT', rtt)
})

api.on(APIClientEvent.SIGNED_IN, async (_signedIn) => {
  signedIn.value = _signedIn
  if (_signedIn) {
    void websocketService.start()
    const [_usuario, _unreadMessages, _threads] = await Promise.all([api.fetchUsuario(), api.fetchMensagens({ unread: true }), api.fetchThreads()])
    usuario.value = _usuario
    unreadMessages.value = _unreadMessages
    threads.value = _threads
  }
  else {
    void websocketService.stop()
    unreadMessages.value = []
    usuario.value = null
    threads.value = []
  }
  setLoggedUser(unref(usuario))
  if (_signedIn) {
    trackSignIn()
  }
  else {
    trackSignOut()
  }
})

window.onbeforeunload = () => {
  trackPageLeave()
  return undefined
}

const initApp = async () => {
  api.init()
  const [_acessorios, _informacoesAdicionais, _cores] = await Promise.all([api.fetchAcessorios(), api.fetchInformacoesAdicionais(), api.fetchCores()])
  acessorios.value = _acessorios
  informacoesAdicionais.value = _informacoesAdicionais
  cores.value = _cores
  if (api.userId !== null) {
    const _usuario = await api.fetchUsuario()
    usuario.value = _usuario
  }
}

void initApp()

const scrollToTop = () => {
  const el = document.querySelector('.scroll-container')
  el?.scrollTo({ top: 0, behavior: 'smooth' })
}

export const useApp = () => {
  if (signedInWatcher === null) {
    const router = useRouter()
    signedInWatcher = watch(signedIn, async (signedIn) => {
      if (!signedIn) {
        await router.push({ name: 'identificacao' })
      }
      else {
        await router.push({ name: 'home' })
      }
    })
    void nextTick(() => {
      signedIn.value = api.signedIn
    })
  }
  return {
    api,
    cadastraEmail,
    scrollToTop,
    signedIn: computed(() => unref(signedIn)),
    unreadMessages: computed(() => unref(unreadMessages)),
    threads: computed(() => unref(threads)),
    menuItems: computed(() => menuItems),
    sidebarOpen: computed(() => unref(sidebarOpen)),
    sortingOptions: computed(() => sortingOptions),
    sortingOption: computed({
      get: () => unref(sortingOption),
      set: (val: { key: string, label: string }) => {
        sortingOption.value = val
      }
    }),
    openSidebar: (value: boolean) => {
      sidebarOpen.value = value
    },
    cores: computed(() => unref(cores)),
    acessorios: computed(() => unref(acessorios)),
    informacoesAdicionais: computed(() => unref(informacoesAdicionais))
  }
}
