export interface IAuthenticatedMessageSender {
  id: number
  nomeRazaoSocial: string
  nomeFantasia: string | null
  isCnpj: boolean
  email: string
  celular: string
}
