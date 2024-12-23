export const getMonthCode = (): number => {
  const now = new Date()
  const ano = now.getFullYear()
  const mes = (now.getMonth() + 1).toLocaleString('pt-BR', { minimumIntegerDigits: 2 })
  const monthCode = Number.parseInt(`${ano}${mes}`)
  return monthCode
}
