import type { Acessorio, Cor, InformacaoAdicional } from '@cmp/shared/models/database/models'
import { APIClient, APIClientEvent } from '@/services/api-client'
import { WebSocketMessageProcessor } from '@/services/websocket-message-processor'
import { WebSocketService, WebSocketServiceEvent } from '@/services/websocket-service'
import { computed, nextTick, ref, unref, watch } from 'vue'
import { useRouter } from 'vue-router'

const menuItems = [
  { to: { name: 'quem-somos' }, label: 'Quem Somos' },
  { to: { name: 'perguntas-frequentes' }, label: 'Dúvidas' },
  { to: { name: 'fale-conosco' }, label: 'Contato' }
]

const sidebarOpen = ref(false)
const signedIn = ref(false)

const cadastraEmail = ref<string | undefined>(undefined)

const acessorios = ref<Acessorio[]>([])
const informacoesAdicionais = ref<InformacaoAdicional[]>([])
const cores = ref<Cor[]>([])

let signedInWatcher: null | ReturnType<typeof watch> = null

const api = new APIClient({ baseURL: __API_BASE_URL__ })

const webSocketMessageProcessor = new WebSocketMessageProcessor({})
const websocketService = new WebSocketService({ api, webSocketMessageProcessor })

websocketService.on(WebSocketServiceEvent.STATE_UPDATE, (webSocketServiceState) => {
  console.log('GOT WEBSOCKET SERVICE', webSocketServiceState)
  /*
  state.webSocketServiceState = webSocketServiceState
  if (webSocketServiceState === WebSocketClientState.CONNECTED && geolocationService.lastReportedPosition !== null) {
    void websocketService.sendPosition(geolocationService.lastReportedPosition)
  }
    */
})

websocketService.on(WebSocketServiceEvent.RTT, (rtt) => {
  console.log('GOT SOCKET RTT', rtt)
})

api.on(APIClientEvent.SIGNED_IN, (_signedIn) => {
  signedIn.value = _signedIn
  if (_signedIn) {
    void websocketService.start()
  }
  else {
    void websocketService.stop()
  }
})

api.init()

const initApp = async () => {
  const [_acessorios, _informacoesAdicionais, _cores] = await Promise.all([api.fetchAcessorios(), api.fetchInformacoesAdicionais(), api.fetchCores()])
  acessorios.value = _acessorios
  informacoesAdicionais.value = _informacoesAdicionais
  cores.value = _cores
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
    menuItems: computed(() => menuItems),
    sidebarOpen: computed(() => unref(sidebarOpen)),
    openSidebar: (value: boolean) => {
      sidebarOpen.value = value
    },
    cores: computed(() => unref(cores)),
    acessorios: computed(() => unref(acessorios)),
    informacoesAdicionais: computed(() => unref(informacoesAdicionais))
  }
}
