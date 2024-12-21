export const printAppVersionConsoleBanner = () => {
  console.log(`Vontage Player ${__APP_RELEASE__} v${__APP_VERSION__} ${import.meta.env.MODE}`)
}
