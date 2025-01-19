import type { SelectUsuario } from '@cmp/shared/models/database/models'
import type { TAdDocument } from '@cmp/shared/models/typesense'
import mixpanel from 'mixpanel-browser'

export enum MixpanelEvent {
  SIGN_IN = 'Sign In',
  SIGN_OUT = 'Sign Out',
  SIGN_UP = 'Sign Up',
  OPEN_LANDING_PAGE = 'Open Landing Page',
  OPEN_WHO_ARE_WE_PAGE = 'Open Who Are We Page',
  OPEN_FAQ_PAGE = 'Open Faq Page',
  BROWSE_ADS = 'Browse Ads',
  OPEN_AD = 'Open Ad',
  SEND_MESSAGE_TO_AD_PUBLISHER = 'Send Message To Ad Publisher',
  PAGE_LEAVE = 'Page Leave'
}

const userToMixpanelPeople = (user: SelectUsuario | null) => {
  const mapping: Record<string, keyof SelectUsuario | ((user: SelectUsuario | null) => string | undefined)> = {
    $id: 'id',
    $email: 'email',
    $cpfCnpj: 'cpfCnpj',
    $name: (user: SelectUsuario | null) => user?.nomeFantasia ?? user?.nomeRazaoSocial,
    $nomeRazaoSozial: 'nomeRazaoSocial',
    $nomeFantasia: 'nomeFantasia',
    $isCnpj: 'isCnpj',
    $localidade: 'localidade',
    $uf: 'uf'
  }
  const mapped = Object.entries(mapping)
    .reduce((accumulator: Record<string, any>, [key, value]) => {
      accumulator[key] = typeof value === 'function' ? value(user) : user?.[value]
      return accumulator
    }, {})
  return mapped
}

const initMixpanel = () => {
  mixpanel.init(import.meta.env.VITE_MIXPANEL_TOKEN, {
    track_pageview: false,
    persistence: 'localStorage'
  })
}

const setLoggedUser = (user: SelectUsuario | null) => {
  mixpanel.identify(user?.id.toString())
  mixpanel.people.set(userToMixpanelPeople(user))
}

const trackSignIn = () => mixpanel.track(MixpanelEvent.SIGN_IN)
const trackSignOut = () => mixpanel.track(MixpanelEvent.SIGN_OUT)
const trackSignUp = () => mixpanel.track(MixpanelEvent.SIGN_UP)
const trackOpenLandingPage = () => mixpanel.track(MixpanelEvent.OPEN_LANDING_PAGE)
const trackOpenWhoAreWePage = () => mixpanel.track(MixpanelEvent.OPEN_WHO_ARE_WE_PAGE)
const trackOpenFaqPage = () => mixpanel.track(MixpanelEvent.OPEN_FAQ_PAGE)
const trackBrowseAds = () => mixpanel.track(MixpanelEvent.BROWSE_ADS)
const trackOpenAd = (anuncio: TAdDocument) => mixpanel.track(MixpanelEvent.OPEN_AD, { anuncio })
const trackSendMessageToAdPublisher = (anuncio: TAdDocument) => mixpanel.track(MixpanelEvent.SEND_MESSAGE_TO_AD_PUBLISHER, { anuncio })
const trackPageLeave = () => mixpanel.track(MixpanelEvent.PAGE_LEAVE)

export const useMixpanel = () => {
  return {
    initMixpanel,
    setLoggedUser,
    trackSignIn,
    trackSignOut,
    trackSignUp,
    trackOpenLandingPage,
    trackOpenWhoAreWePage,
    trackOpenFaqPage,
    trackBrowseAds,
    trackOpenAd,
    trackSendMessageToAdPublisher,
    trackPageLeave
  }
}
