export const computeFileHash = async (file: File, algorithm: AlgorithmIdentifier = 'SHA-256') => {
  const hashBuffer = await crypto.subtle.digest(algorithm, new Uint8Array(await file.arrayBuffer()))
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hash = hashArray.map(h => h.toString(16).padStart(2, '0')).join('')
  return hash
}
