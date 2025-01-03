import type { Acessorio, Cor, InformacaoAdicional } from '@cmp/shared/models/database/models'
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

const cadastraEmail = ref<string | undefined>(undefined)

const acessorios = ref<Acessorio[]>([])
const informacoesAdicionais = ref<InformacaoAdicional[]>([])
const cores = ref<Cor[]>([])

let signedInWatcher: null | ReturnType<typeof watch> = null
const api = new APIClient({ baseURL: __API_BASE_URL__ })

api.on(APIClientEvent.SIGNED_IN, (_signedIn) => {
  signedIn.value = _signedIn
})

const initApp = async () => {
  const [_acessorios, _informacoesAdicionais, _cores] = await Promise.all([api.fetchAcessorios(), api.fetchInformacoesAdicionais(), api.fetchCores()])
  acessorios.value = _acessorios
  informacoesAdicionais.value = _informacoesAdicionais
  cores.value = _cores
}

void initApp()

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
