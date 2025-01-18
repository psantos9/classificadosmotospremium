const buf2hex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map(x => x.toString(16).padStart(2, '0'))
    .join('')

export const sha256 = async (data: File | Blob) => {
  const fileData = await data.arrayBuffer()
  const digest = await crypto.subtle.digest({ name: 'SHA-256' }, fileData)
  const hash = buf2hex(new Uint8Array(digest))
  return hash
}
