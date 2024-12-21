export const printAppVersionConsoleBanner = () => {
  console.log(`Classificados Motos Premium ${__APP_RELEASE__} ${__COMMIT_HASH__} ${__API_BASE_URL} ${import.meta.env.MODE}`)
}
