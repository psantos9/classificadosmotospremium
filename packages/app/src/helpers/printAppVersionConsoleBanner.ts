export const printAppVersionConsoleBanner = () => {
  console.log(`Classificados Motos Premium ${__APP_RELEASE__} ${__COMMIT_HASH__} ${import.meta.env.MODE}`)
}
