export interface WalletAccount {
  publicKey: string
  network: 'mainnet' | 'testnet'
}

export interface AssetBalance {
  asset: string
  assetCode: string
  assetIssuer: string | null
  balance: string
  isNative: boolean
}

export interface Transaction {
  id: string
  hash: string
  type: 'sent' | 'received' | 'swap' | 'other'
  asset: string
  amount: string
  from: string
  to: string
  memo: string
  createdAt: string
  successful: boolean
  fee: string
}

export interface AccountInfo {
  publicKey: string
  balances: AssetBalance[]
  transactions: Transaction[]
  sequence: string
  subentryCount: number
  homeDomain: string
  xlmAvailable: string
}

export type AppView = 'connect' | 'dashboard' | 'send' | 'receive'

export interface AppState {
  view: AppView
  account: WalletAccount | null
  accountInfo: AccountInfo | null
  loading: boolean
  error: string | null
  network: 'mainnet' | 'testnet'
  sendForm: SendForm
  toast: Toast | null
}

export interface SendForm {
  destination: string
  amount: string
  asset: string
  memo: string
  submitting: boolean
  error: string | null
}

export interface Toast {
  message: string
  type: 'success' | 'error' | 'info'
}
