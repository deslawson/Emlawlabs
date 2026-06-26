import './styles/main.css'
import type { AppState, Toast } from './types'
import {
  fetchAccountInfo,
  isValidPublicKey,
  shortenKey,
  formatAmount,
  formatDate,
  submitPayment,
} from './utils/stellar'

// ─── State ────────────────────────────────────────────────
const state: AppState = {
  view: 'connect',
  account: null,
  accountInfo: null,
  loading: false,
  error: null,
  network: 'testnet',
  sendForm: { destination: '', amount: '', asset: 'XLM', memo: '', submitting: false, error: null },
  toast: null,
}

let toastTimer: number | null = null

// ─── Render ───────────────────────────────────────────────
function render() {
  const app = document.getElementById('app')!
  app.innerHTML = `
    <canvas id="starfield"></canvas>
    <div class="app-shell">
      ${renderNav()}
      ${renderView()}
      ${state.toast ? renderToast(state.toast) : ''}
    </div>
  `
  initStarfield()
  bindEvents()
}

function renderNav(): string {
  if (state.view === 'connect') return ''
  return `
    <nav class="top-nav">
      <div class="nav-logo">
        <span class="logo-dot"></span>
        StellarDash
      </div>
      <div class="nav-spacer"></div>
      <div class="network-badge">
        <span class="dot ${state.network}"></span>
        ${state.network === 'testnet' ? 'Testnet' : 'Mainnet'}
      </div>
      <button class="btn-disconnect" data-action="disconnect">Disconnect</button>
    </nav>
  `
}

function renderView(): string {
  if (state.view === 'connect') return renderConnect()
  if (state.loading) return `<div class="loading-wrap"><div class="spinner"></div></div>`
  if (state.view === 'send') return renderSend()
  if (state.view === 'receive') return renderReceive()
  return renderDashboard()
}

// ─── Connect Screen ───────────────────────────────────────
function renderConnect(): string {
  return `
    <div class="connect-screen">
      <div class="connect-card">
        <div class="connect-hero">
          <span class="connect-icon">✦</span>
          <h1>Stellar Dashboard</h1>
          <p>Enter your Stellar public key to view your wallet.<br/>Your key never leaves your browser.</p>
        </div>

        <div class="network-toggle">
          <button class="network-btn ${state.network === 'testnet' ? 'active' : ''}" data-action="set-network" data-net="testnet">
            Testnet
          </button>
          <button class="network-btn ${state.network === 'mainnet' ? 'active' : ''}" data-action="set-network" data-net="mainnet">
            Mainnet
          </button>
        </div>

        ${state.error ? `<div class="error-msg">${escHtml(state.error)}</div>` : ''}

        <div class="form-group">
          <label class="form-label" for="public-key-input">Public Key (G…)</label>
          <input
            id="public-key-input"
            class="form-input"
            type="text"
            placeholder="GABC…XYZ"
            autocomplete="off"
            spellcheck="false"
            value="${escHtml(state.account?.publicKey ?? '')}"
          />
          <p class="form-hint">Your 56-character Stellar public key starting with G</p>
        </div>

        <button class="btn-primary" data-action="connect" ${state.loading ? 'disabled' : ''}>
          ${state.loading ? 'Connecting…' : 'View Wallet'}
        </button>

        <p class="connect-footer">
          Need test XLM? Use the
          <a href="https://laboratory.stellar.org/#account-creator?network=test" target="_blank" rel="noopener">Stellar Friendbot</a>
          to fund a testnet account.
        </p>
      </div>
    </div>
  `
}

// ─── Dashboard ────────────────────────────────────────────
function renderDashboard(): string {
  const info = state.accountInfo!
  const pk = info.publicKey

  const txIcons: Record<string, string> = {
    sent: '↑', received: '↓', swap: '⇄', other: '·'
  }

  return `
    <div class="dashboard">
      <div class="account-header">
        <div class="account-avatar">◈</div>
        <div class="account-info">
          <div class="account-address">
            <span>${shortenKey(pk, 8)}</span>
            <button class="btn-copy" data-action="copy-address" data-value="${escHtml(pk)}">Copy</button>
          </div>
          <div class="account-meta">
            ${info.subentryCount} trustline${info.subentryCount !== 1 ? 's' : ''}
            ${info.homeDomain ? ` · ${info.homeDomain}` : ''}
          </div>
        </div>
        <div class="account-actions">
          <button class="btn-action send" data-action="goto-send">↑ Send</button>
          <button class="btn-action receive" data-action="goto-receive">↓ Receive</button>
          <button class="btn-refresh" data-action="refresh">↺ Refresh</button>
        </div>
      </div>

      <div class="dashboard-grid">
        <!-- Balances -->
        <div class="card">
          <div class="card-title">Assets</div>
          <div class="balance-list">
            ${info.balances.map(b => `
              <div class="balance-item">
                <div class="asset-icon ${b.isNative ? 'xlm' : ''}">
                  ${b.assetCode.slice(0, 3)}
                </div>
                <div class="asset-details">
                  <div class="asset-code">${escHtml(b.assetCode)}</div>
                  ${b.assetIssuer ? `<div class="asset-issuer">${shortenKey(b.assetIssuer, 4)}</div>` : ''}
                </div>
                <div>
                  <div class="asset-balance">${formatAmount(b.balance)}</div>
                  ${b.isNative ? `<div class="available-label">${formatAmount(info.xlmAvailable)} avail.</div>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Stats -->
        <div class="card">
          <div class="card-title">Account Info</div>
          <div class="stat-grid">
            <div class="stat-item">
              <div class="stat-label">Network</div>
              <div class="stat-value">${state.network === 'testnet' ? 'Testnet' : 'Mainnet'}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Subentries</div>
              <div class="stat-value">${info.subentryCount}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">XLM Reserve</div>
              <div class="stat-value">${((2 + info.subentryCount) * 0.5).toFixed(1)} XLM</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Assets</div>
              <div class="stat-value">${info.balances.length}</div>
            </div>
          </div>
        </div>

        <!-- Transactions -->
        <div class="card tx-card">
          <div class="card-title">Recent Transactions</div>
          <div class="tx-list">
            ${info.transactions.length === 0
              ? `<div class="empty-tx">No recent transactions found</div>`
              : info.transactions.map(tx => `
                <div class="tx-item">
                  <div class="tx-icon ${tx.type}">${txIcons[tx.type] ?? '·'}</div>
                  <div class="tx-details">
                    <div class="tx-type">${tx.type}</div>
                    <div class="tx-address">${
                      tx.type === 'sent'
                        ? `To: ${shortenKey(tx.to || '?', 6)}`
                        : `From: ${shortenKey(tx.from || '?', 6)}`
                    }</div>
                  </div>
                  <div class="tx-right">
                    <div class="tx-amount ${tx.type}">
                      ${tx.type === 'sent' ? '−' : '+'}${formatAmount(tx.amount)} ${tx.asset}
                    </div>
                    <div class="tx-time">${formatDate(tx.createdAt)}</div>
                    <a class="tx-hash-link"
                      href="https://stellar.expert/explorer/${state.network === 'mainnet' ? 'public' : 'testnet'}/tx/${tx.hash}"
                      target="_blank" rel="noopener">
                      ${tx.hash.slice(0, 8)}…
                    </a>
                  </div>
                </div>
              `).join('')}
          </div>
        </div>
      </div>
    </div>
  `
}

// ─── Send Panel ───────────────────────────────────────────
function renderSend(): string {
  const info = state.accountInfo!
  const f = state.sendForm
  const selectedBalance = info.balances.find(
    b => (f.asset === 'XLM' && b.isNative) || b.assetCode === f.asset
  )
  const available = selectedBalance
    ? (selectedBalance.isNative ? info.xlmAvailable : selectedBalance.balance)
    : '0'

  return `
    <div class="panel">
      <div class="panel-card">
        <div class="panel-header">
          <button class="btn-back" data-action="goto-dashboard">← Back</button>
          <h2>Send Payment</h2>
        </div>

        ${f.error ? `<div class="error-msg">${escHtml(f.error)}</div>` : ''}

        <div class="form-group">
          <label class="form-label">Destination Address</label>
          <input class="form-input" id="send-destination" type="text"
            placeholder="G…" value="${escHtml(f.destination)}" spellcheck="false" autocomplete="off"/>
          <p class="form-hint">Stellar public key of the recipient</p>
        </div>

        <div class="form-group">
          <label class="form-label">Asset</label>
          <select class="asset-select" id="send-asset">
            ${info.balances.map(b => `
              <option value="${escHtml(b.assetCode)}" ${f.asset === b.assetCode ? 'selected' : ''}>
                ${escHtml(b.assetCode)} — ${formatAmount(b.balance)} available
              </option>
            `).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Amount</label>
          <input class="form-input" id="send-amount" type="number" step="0.0000001"
            placeholder="0.00" value="${escHtml(f.amount)}" min="0"/>
          <p class="available-hint">Available: ${formatAmount(available)} ${f.asset}</p>
        </div>

        <div class="form-group">
          <label class="form-label">Memo (optional)</label>
          <input class="form-input" id="send-memo" type="text"
            placeholder="Optional note" maxlength="28" value="${escHtml(f.memo)}"/>
          <p class="form-hint">Max 28 characters. Required by some exchanges.</p>
        </div>

        <div class="form-group">
          <label class="form-label">Secret Key (to sign)</label>
          <input class="form-input" id="send-secret" type="password"
            placeholder="S… (never stored or sent anywhere)" autocomplete="off" spellcheck="false"/>
          <p class="form-hint">Used only to sign the transaction locally in your browser.</p>
        </div>

        <button class="btn-primary" data-action="submit-send" ${f.submitting ? 'disabled' : ''}>
          ${f.submitting ? 'Sending…' : 'Send Payment'}
        </button>
      </div>
    </div>
  `
}

// ─── Receive Panel ────────────────────────────────────────
function renderReceive(): string {
  const pk = state.accountInfo!.publicKey
  return `
    <div class="panel">
      <div class="panel-card">
        <div class="panel-header">
          <button class="btn-back" data-action="goto-dashboard">← Back</button>
          <h2>Receive Payment</h2>
        </div>

        <div class="receive-address-box">
          <div class="address-full">${escHtml(pk)}</div>
        </div>

        <button class="btn-primary" data-action="copy-address" data-value="${escHtml(pk)}" style="margin-bottom:12px">
          Copy Address
        </button>
        <button class="btn-secondary" style="width:100%" data-action="open-stellar-lab" data-pk="${escHtml(pk)}">
          View on Stellar Expert ↗
        </button>

        <p class="receive-network-note">
          Only send assets on the <strong>${state.network === 'testnet' ? 'Stellar Testnet' : 'Stellar Mainnet'}</strong>.
          Sending from a different network will result in permanent loss.
        </p>
      </div>
    </div>
  `
}

function renderToast(toast: Toast): string {
  return `<div class="toast ${toast.type}">${escHtml(toast.message)}</div>`
}

// ─── Events ───────────────────────────────────────────────
function bindEvents() {
  document.addEventListener('click', handleClick)

  // Live form sync
  document.getElementById('send-destination')?.addEventListener('input', e => {
    state.sendForm.destination = (e.target as HTMLInputElement).value
  })
  document.getElementById('send-amount')?.addEventListener('input', e => {
    state.sendForm.amount = (e.target as HTMLInputElement).value
  })
  document.getElementById('send-memo')?.addEventListener('input', e => {
    state.sendForm.memo = (e.target as HTMLInputElement).value
  })
  document.getElementById('send-asset')?.addEventListener('change', e => {
    state.sendForm.asset = (e.target as HTMLSelectElement).value
    render()
  })
}

function handleClick(e: Event) {
  const target = (e.target as HTMLElement).closest('[data-action]') as HTMLElement | null
  if (!target) return
  const action = target.dataset['action']!

  switch (action) {
    case 'set-network':
      state.network = target.dataset['net'] as 'mainnet' | 'testnet'
      state.error = null
      render()
      break

    case 'connect':
      handleConnect()
      break

    case 'disconnect':
      Object.assign(state, {
        view: 'connect', account: null, accountInfo: null,
        loading: false, error: null,
        sendForm: { destination: '', amount: '', asset: 'XLM', memo: '', submitting: false, error: null }
      })
      render()
      break

    case 'goto-send':
      state.view = 'send'
      state.sendForm = { destination: '', amount: '', asset: 'XLM', memo: '', submitting: false, error: null }
      render()
      break

    case 'goto-receive':
      state.view = 'receive'
      render()
      break

    case 'goto-dashboard':
      state.view = 'dashboard'
      render()
      break

    case 'refresh':
      handleRefresh()
      break

    case 'copy-address': {
      const val = target.dataset['value']!
      navigator.clipboard.writeText(val).then(() => {
        target.textContent = 'Copied!'
        target.classList.add('copied')
        setTimeout(() => { target.textContent = 'Copy'; target.classList.remove('copied') }, 2000)
        showToast('Address copied to clipboard', 'success')
      })
      break
    }

    case 'submit-send':
      handleSend()
      break

    case 'open-stellar-lab': {
      const pk = target.dataset['pk']!
      const net = state.network === 'mainnet' ? 'public' : 'testnet'
      window.open(`https://stellar.expert/explorer/${net}/account/${pk}`, '_blank')
      break
    }
  }
}

// ─── Actions ──────────────────────────────────────────────
async function handleConnect() {
  const input = document.getElementById('public-key-input') as HTMLInputElement | null
  const pk = input?.value.trim() ?? ''

  if (!isValidPublicKey(pk)) {
    state.error = 'Invalid public key. It must start with G and be 56 characters long.'
    render()
    return
  }

  state.loading = true
  state.error = null
  state.account = { publicKey: pk, network: state.network }
  render()

  try {
    state.accountInfo = await fetchAccountInfo(pk, state.network)
    state.view = 'dashboard'
  } catch (err) {
    state.error = err instanceof Error ? err.message : 'Failed to load account.'
    state.view = 'connect'
    state.account = null
  } finally {
    state.loading = false
    render()
  }
}

async function handleRefresh() {
  if (!state.account) return
  state.loading = true
  render()
  try {
    state.accountInfo = await fetchAccountInfo(state.account.publicKey, state.network)
    showToast('Account refreshed', 'success')
  } catch {
    showToast('Failed to refresh', 'error')
  } finally {
    state.loading = false
    state.view = 'dashboard'
    render()
  }
}

async function handleSend() {
  const f = state.sendForm
  const secretInput = document.getElementById('send-secret') as HTMLInputElement | null
  const secret = secretInput?.value.trim() ?? ''

  // Validation
  if (!isValidPublicKey(f.destination)) {
    state.sendForm.error = 'Invalid destination address.'
    render()
    return
  }
  if (!f.amount || parseFloat(f.amount) <= 0) {
    state.sendForm.error = 'Enter a valid amount.'
    render()
    return
  }
  if (!secret.startsWith('S') || secret.length !== 56) {
    state.sendForm.error = 'Invalid secret key. It must start with S and be 56 characters.'
    render()
    return
  }

  const info = state.accountInfo!
  const balance = info.balances.find(b => b.isNative ? f.asset === 'XLM' : b.assetCode === f.asset)
  const assetIssuer = balance?.assetIssuer ?? null

  state.sendForm.submitting = true
  state.sendForm.error = null
  render()

  try {
    const hash = await submitPayment({
      secretKey: secret,
      destination: f.destination,
      amount: f.amount,
      assetCode: f.asset,
      assetIssuer,
      memo: f.memo,
      network: state.network,
    })

    showToast(`Payment sent! Tx: ${hash.slice(0, 8)}…`, 'success')
    state.view = 'dashboard'
    state.sendForm = { destination: '', amount: '', asset: 'XLM', memo: '', submitting: false, error: null }

    // Refresh account info
    state.accountInfo = await fetchAccountInfo(state.account!.publicKey, state.network)
    render()
  } catch (err) {
    state.sendForm.error = err instanceof Error ? err.message : 'Transaction failed.'
    state.sendForm.submitting = false
    render()
  }
}

// ─── Toast ────────────────────────────────────────────────
function showToast(message: string, type: Toast['type']) {
  if (toastTimer) clearTimeout(toastTimer)
  state.toast = { message, type }
  const toastEl = document.querySelector('.toast')
  if (toastEl) {
    toastEl.className = `toast ${type}`
    toastEl.textContent = message
  } else {
    render()
  }
  toastTimer = window.setTimeout(() => {
    state.toast = null
    const el = document.querySelector('.toast')
    if (el) el.remove()
  }, 4000)
}

// ─── Starfield ────────────────────────────────────────────
function initStarfield() {
  const canvas = document.getElementById('starfield') as HTMLCanvasElement | null
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const stars = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.2 + 0.2,
    o: Math.random() * 0.6 + 0.2,
    speed: Math.random() * 0.3 + 0.05,
  }))

  function draw() {
    if (!ctx || !canvas) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (const s of stars) {
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(200, 210, 255, ${s.o})`
      ctx.fill()
      s.o += (Math.random() - 0.5) * 0.02
      s.o = Math.max(0.1, Math.min(0.8, s.o))
    }
    requestAnimationFrame(draw)
  }

  draw()
}

// ─── Utils ────────────────────────────────────────────────
function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// ─── Boot ─────────────────────────────────────────────────
render()
