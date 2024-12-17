import { computed, ref, unref } from 'vue'

const menuItems = [
  { to: { name: 'quem-somos' }, label: 'Quem Somos' },
  { to: { name: 'perguntas-frequentes' }, label: 'Dúvidas' },
  { to: { name: 'fale-conosco' }, label: 'Contato' }
]

const sidebarOpen = ref(false)

export const useApp = () => {
  return {
    menuItems: computed(() => menuItems),
    sidebarOpen: computed(() => unref(sidebarOpen)),
    openSidebar: (value: boolean) => {
      sidebarOpen.value = value
    }
  }
}
