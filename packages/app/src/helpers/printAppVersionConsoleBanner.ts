export const printAppVersionConsoleBanner = () => {
  console.log(`Classificados Motos Premium (${__GIT_COMMIT_BRANCH__} #${__GIT_COMMIT_HASH__}) mode:${import.meta.env.MODE}`)
}
