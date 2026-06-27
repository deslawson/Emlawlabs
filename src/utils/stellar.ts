import type { AccountInfo, AssetBalance, Transaction } from '../types'

const HORIZON_MAINNET = 'https://horizon.stellar.org'
const HORIZON_TESTNET = 'https://horizon-testnet.stellar.org'

export function getHorizonUrl(network: 'mainnet' | 'testnet'): string {
  return network === 'mainnet' ? HORIZON_MAINNET : HORIZON_TESTNET
}

export function isValidPublicKey(key: string): boolean {
  return /^G[A-Z2-7]{55}$/.test(key.trim())
}

export function shortenKey(key: string, chars = 6): string {
  return `${key.slice(0, chars)}…${key.slice(-chars)}`
}

export function formatAmount(amount: string, decimals = 7): string {
  const num = parseFloat(amount)
  if (isNaN(num)) return '0'
  if (num === 0) return '0'
  if (num < 0.0001) return num.toFixed(decimals)
  if (num < 1) return num.toFixed(4)
  if (num < 1000) return num.toFixed(2)
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseBalances(rawBalances: any[]): AssetBalance[] {
  return rawBalances.map((b) => {
    const isNative = b.asset_type === 'native'
    return {
      asset: isNative ? 'XLM' : `${b.asset_code}:${b.asset_issuer}`,
      assetCode: isNative ? 'XLM' : b.asset_code,
      assetIssuer: isNative ? null : b.asset_issuer,
      balance: b.balance,
      isNative,
    }
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseTransaction(op: any, accountId: string): Transaction {
  const isSent =
    op.from === accountId ||
    op.source_account === accountId ||
    op.funder === accountId

  const assetCode =
    op.asset_type === 'native'
      ? 'XLM'
      : op.asset_code ?? op.selling_asset_code ?? 'Unknown'

  let type: Transaction['type'] = 'other'
  if (op.type === 'payment') {
    type = isSent ? 'sent' : 'received'
  } else if (op.type === 'create_account') {
    type = isSent ? 'sent' : 'received'
  } else if (op.type === 'path_payment_strict_send' || op.type === 'path_payment_strict_receive') {
    type = 'swap'
  }

  return {
    id: op.id,
    hash: op.transaction_hash,
    type,
    asset: assetCode,
    amount: op.amount ?? op.starting_balance ?? '0',
    from: op.from ?? op.funder ?? op.source_account ?? '',
    to: op.to ?? op.account ?? '',
    memo: '',
    createdAt: op.created_at,
    successful: op.transaction_successful ?? true,
    fee: '0',
  }
}

export async function fetchAccountInfo(
  publicKey: string,
  network: 'mainnet' | 'testnet'
): Promise<AccountInfo> {
  const base = getHorizonUrl(network)

  // Fetch account details
  const accountRes = await fetch(`${base}/accounts/${publicKey}`)
  if (!accountRes.ok) {
    if (accountRes.status === 404) {
      throw new Error('Account not found on the Stellar network. Make sure it is funded.')
    }
    throw new Error(`Failed to load account: ${accountRes.statusText}`)
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const accountData: any = await accountRes.json()
  const balances = parseBalances(accountData.balances)

  // Compute available XLM (reserve = (2 + subentry_count) * 0.5 XLM)
  const xlmBalance = balances.find(b => b.isNative)
  const reserve = (2 + (accountData.subentry_count ?? 0)) * 0.5
  const xlmAvailable = xlmBalance
    ? Math.max(0, parseFloat(xlmBalance.balance) - reserve).toFixed(7)
    : '0'

  // Fetch recent operations
  const opsRes = await fetch(
    `${base}/accounts/${publicKey}/operations?limit=20&order=desc&include_failed=false`
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const opsData: any = opsRes.ok ? await opsRes.json() : { _embedded: { records: [] } }
  const transactions: Transaction[] = (opsData._embedded?.records ?? [])
    .filter((op: { type: string }) =>
      ['payment', 'create_account', 'path_payment_strict_send', 'path_payment_strict_receive'].includes(op.type)
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((op: any) => parseTransaction(op, publicKey))

  return {
    publicKey,
    balances,
    transactions,
    sequence: accountData.sequence,
    subentryCount: accountData.subentry_count ?? 0,
    homeDomain: accountData.home_domain ?? '',
    xlmAvailable,
  }
}

export async function submitPayment(params: {
  secretKey: string
  destination: string
  amount: string
  assetCode: string
  assetIssuer: string | null
  memo: string
  network: 'mainnet' | 'testnet'
}): Promise<string> {
  // Dynamically import Stellar SDK to keep initial bundle light

  const { Keypair, Networks, TransactionBuilder, BASE_FEE, Asset, Operation, Memo, Horizon } =
    await import('@stellar/stellar-sdk')

  const server = new Horizon.Server(getHorizonUrl(params.network))
  const keypair = Keypair.fromSecret(params.secretKey)
  const account = await server.loadAccount(keypair.publicKey())

  const asset = params.assetCode === 'XLM'
    ? Asset.native()
    : new Asset(params.assetCode, params.assetIssuer!)

  const networkPassphrase =
    params.network === 'mainnet' ? Networks.PUBLIC : Networks.TESTNET

  const builder = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase,
  })
    .addOperation(
      Operation.payment({
        destination: params.destination,
        asset,
        amount: params.amount,
      })
    )
    .setTimeout(30)

  if (params.memo.trim()) {
    builder.addMemo(Memo.text(params.memo.trim()))
  }

  const tx = builder.build()
  tx.sign(keypair)

  const result = await server.submitTransaction(tx)
  return result.hash
}
