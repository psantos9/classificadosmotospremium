export const verifyTurnstileToken = async (params: { token: string, secretKey: string, req: Request }): Promise<boolean> => {
  const { token, secretKey, req } = params
  const ip = req.headers.get('CF-Connecting-IP')
  const formData = new FormData()
  formData.append('secret', secretKey)
  formData.append('response', token)
  if (ip !== null) {
    formData.append('remoteip', ip)
  }
  const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
  const result = await fetch(url, {
    body: formData,
    method: 'POST'
  })
  const outcome = await result.json() as { success: boolean }
  if (!outcome.success) {
    console.error('error while validating turnstile token', JSON.stringify(outcome))
  }
  return outcome.success
}
