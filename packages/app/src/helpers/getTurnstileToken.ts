export const getTurnstileToken = async (params: { el: HTMLElement, siteKey: string }) => new Promise<string>((resolve) => {
  const { el, siteKey } = params
  turnstile.render(el, {
    sitekey: siteKey,
    appearance: 'interaction-only',
    callback: (token) => {
      resolve(token)
      turnstile.remove(el)
    }
  })
})
