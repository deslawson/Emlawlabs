var e=Object.create,t=Object.defineProperty,n=Object.getOwnPropertyDescriptor,r=Object.getOwnPropertyNames,i=Object.getPrototypeOf,a=Object.prototype.hasOwnProperty,o=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t),e=null),t.exports),s=(e,i,o,s)=>{if(i&&typeof i==`object`||typeof i==`function`)for(var c=r(i),l=0,u=c.length,d;l<u;l++)d=c[l],!a.call(e,d)&&d!==o&&t(e,d,{get:(e=>i[e]).bind(null,d),enumerable:!(s=n(i,d))||s.enumerable});return e},c=(n,r,a)=>(a=n==null?{}:e(i(n)),s(r||!n||!n.__esModule?t(a,`default`,{value:n,enumerable:!0}):a,n));(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var l=`modulepreload`,u=function(e,t){return new URL(e,t).href},d={},f=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?import.meta.resolve(e):new URL(e,new URL(`../../../src/node/plugins/importAnalysisBuild.ts`,import.meta.url)).href}r=o(t.map(t=>{if(t=u(t,n),t=s(t),t in d)return;d[t]=!0;let r=t.endsWith(`.css`);for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}let i=document.createElement(`link`);if(i.rel=r?`stylesheet`:l,r||(i.as=`script`),i.crossOrigin=``,i.href=t,a&&i.setAttribute(`nonce`,a),document.head.appendChild(i),r)return new Promise((e,n)=>{i.addEventListener(`load`,e),i.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},p=`https://horizon.stellar.org`,m=`https://horizon-testnet.stellar.org`;function h(e){return e===`mainnet`?p:m}function g(e){return/^G[A-Z2-7]{55}$/.test(e.trim())}function _(e,t=6){return`${e.slice(0,t)}…${e.slice(-t)}`}function v(e,t=7){let n=parseFloat(e);return isNaN(n)||n===0?`0`:n<1e-4?n.toFixed(t):n<1?n.toFixed(4):n<1e3?n.toFixed(2):n.toLocaleString(`en-US`,{maximumFractionDigits:2})}function y(e){let t=new Date(e),n=new Date().getTime()-t.getTime(),r=Math.floor(n/6e4),i=Math.floor(n/36e5),a=Math.floor(n/864e5);return r<1?`Just now`:r<60?`${r}m ago`:i<24?`${i}h ago`:a<7?`${a}d ago`:t.toLocaleDateString(`en-US`,{month:`short`,day:`numeric`,year:`numeric`})}function b(e){return e.map(e=>{let t=e.asset_type===`native`;return{asset:t?`XLM`:`${e.asset_code}:${e.asset_issuer}`,assetCode:t?`XLM`:e.asset_code,assetIssuer:t?null:e.asset_issuer,balance:e.balance,isNative:t}})}function x(e,t){let n=e.from===t||e.source_account===t||e.funder===t,r=e.asset_type===`native`?`XLM`:e.asset_code??e.selling_asset_code??`Unknown`,i=`other`;return e.type===`payment`||e.type===`create_account`?i=n?`sent`:`received`:(e.type===`path_payment_strict_send`||e.type===`path_payment_strict_receive`)&&(i=`swap`),{id:e.id,hash:e.transaction_hash,type:i,asset:r,amount:e.amount??e.starting_balance??`0`,from:e.from??e.funder??e.source_account??``,to:e.to??e.account??``,memo:``,createdAt:e.created_at,successful:e.transaction_successful??!0,fee:`0`}}async function S(e,t){let n=h(t),r=await fetch(`${n}/accounts/${e}`);if(!r.ok)throw r.status===404?Error(`Account not found on the Stellar network. Make sure it is funded.`):Error(`Failed to load account: ${r.statusText}`);let i=await r.json(),a=b(i.balances),o=a.find(e=>e.isNative),s=(2+(i.subentry_count??0))*.5,c=o?Math.max(0,parseFloat(o.balance)-s).toFixed(7):`0`,l=await fetch(`${n}/accounts/${e}/operations?limit=20&order=desc&include_failed=false`);return{publicKey:e,balances:a,transactions:((l.ok?await l.json():{_embedded:{records:[]}})._embedded?.records??[]).filter(e=>[`payment`,`create_account`,`path_payment_strict_send`,`path_payment_strict_receive`].includes(e.type)).map(t=>x(t,e)),sequence:i.sequence,subentryCount:i.subentry_count??0,homeDomain:i.home_domain??``,xlmAvailable:c}}async function C(e){let{Keypair:t,Networks:n,TransactionBuilder:r,BASE_FEE:i,Asset:a,Operation:o,Memo:s,Horizon:l}=await f(async()=>{let{Keypair:e,Networks:t,TransactionBuilder:n,BASE_FEE:r,Asset:i,Operation:a,Memo:o,Horizon:s}=await import(`./stellar-sdk.min-Bb0v4lUU.js`).then(e=>c(e.default,1));return{Keypair:e,Networks:t,TransactionBuilder:n,BASE_FEE:r,Asset:i,Operation:a,Memo:o,Horizon:s}},[],import.meta.url),u=new l.Server(h(e.network)),d=t.fromSecret(e.secretKey),p=await u.loadAccount(d.publicKey()),m=e.assetCode===`XLM`?a.native():new a(e.assetCode,e.assetIssuer),g=new r(p,{fee:i,networkPassphrase:e.network===`mainnet`?n.PUBLIC:n.TESTNET}).addOperation(o.payment({destination:e.destination,asset:m,amount:e.amount})).setTimeout(30);e.memo.trim()&&g.addMemo(s.text(e.memo.trim()));let _=g.build();return _.sign(d),(await u.submitTransaction(_)).hash}var w={view:`connect`,account:null,accountInfo:null,loading:!1,error:null,network:`testnet`,sendForm:{destination:``,amount:``,asset:`XLM`,memo:``,submitting:!1,error:null},toast:null},T=null;function E(){let e=document.getElementById(`app`);e.innerHTML=`
    <canvas id="starfield"></canvas>
    <div class="app-shell">
      ${D()}
      ${O()}
      ${w.toast?N(w.toast):``}
    </div>
  `,B(),P()}function D(){return w.view===`connect`?``:`
    <nav class="top-nav">
      <div class="nav-logo">
        <span class="logo-dot"></span>
        StellarDash
      </div>
      <div class="nav-spacer"></div>
      <div class="network-badge">
        <span class="dot ${w.network}"></span>
        ${w.network===`testnet`?`Testnet`:`Mainnet`}
      </div>
      <button class="btn-disconnect" data-action="disconnect">Disconnect</button>
    </nav>
  `}function O(){return w.view===`connect`?k():w.loading?`<div class="loading-wrap"><div class="spinner"></div></div>`:w.view===`send`?j():w.view===`receive`?M():A()}function k(){return`
    <div class="connect-screen">
      <div class="connect-card">
        <div class="connect-hero">
          <span class="connect-icon">✦</span>
          <h1>Stellar Dashboard</h1>
          <p>Enter your Stellar public key to view your wallet.<br/>Your key never leaves your browser.</p>
        </div>

        <div class="network-toggle">
          <button class="network-btn ${w.network===`testnet`?`active`:``}" data-action="set-network" data-net="testnet">
            Testnet
          </button>
          <button class="network-btn ${w.network===`mainnet`?`active`:``}" data-action="set-network" data-net="mainnet">
            Mainnet
          </button>
        </div>

        ${w.error?`<div class="error-msg">${V(w.error)}</div>`:``}

        <div class="form-group">
          <label class="form-label" for="public-key-input">Public Key (G…)</label>
          <input
            id="public-key-input"
            class="form-input"
            type="text"
            placeholder="GABC…XYZ"
            autocomplete="off"
            spellcheck="false"
            value="${V(w.account?.publicKey??``)}"
          />
          <p class="form-hint">Your 56-character Stellar public key starting with G</p>
        </div>

        <button class="btn-primary" data-action="connect" ${w.loading?`disabled`:``}>
          ${w.loading?`Connecting…`:`View Wallet`}
        </button>

        <p class="connect-footer">
          Need test XLM? Use the
          <a href="https://laboratory.stellar.org/#account-creator?network=test" target="_blank" rel="noopener">Stellar Friendbot</a>
          to fund a testnet account.
        </p>
      </div>
    </div>
  `}function A(){let e=w.accountInfo,t=e.publicKey,n={sent:`↑`,received:`↓`,swap:`⇄`,other:`·`};return`
    <div class="dashboard">
      <div class="account-header">
        <div class="account-avatar">◈</div>
        <div class="account-info">
          <div class="account-address">
            <span>${_(t,8)}</span>
            <button class="btn-copy" data-action="copy-address" data-value="${V(t)}">Copy</button>
          </div>
          <div class="account-meta">
            ${e.subentryCount} trustline${e.subentryCount===1?``:`s`}
            ${e.homeDomain?` · ${e.homeDomain}`:``}
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
            ${e.balances.map(t=>`
              <div class="balance-item">
                <div class="asset-icon ${t.isNative?`xlm`:``}">
                  ${t.assetCode.slice(0,3)}
                </div>
                <div class="asset-details">
                  <div class="asset-code">${V(t.assetCode)}</div>
                  ${t.assetIssuer?`<div class="asset-issuer">${_(t.assetIssuer,4)}</div>`:``}
                </div>
                <div>
                  <div class="asset-balance">${v(t.balance)}</div>
                  ${t.isNative?`<div class="available-label">${v(e.xlmAvailable)} avail.</div>`:``}
                </div>
              </div>
            `).join(``)}
          </div>
        </div>

        <!-- Stats -->
        <div class="card">
          <div class="card-title">Account Info</div>
          <div class="stat-grid">
            <div class="stat-item">
              <div class="stat-label">Network</div>
              <div class="stat-value">${w.network===`testnet`?`Testnet`:`Mainnet`}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Subentries</div>
              <div class="stat-value">${e.subentryCount}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">XLM Reserve</div>
              <div class="stat-value">${((2+e.subentryCount)*.5).toFixed(1)} XLM</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Assets</div>
              <div class="stat-value">${e.balances.length}</div>
            </div>
          </div>
        </div>

        <!-- Transactions -->
        <div class="card tx-card">
          <div class="card-title">Recent Transactions</div>
          <div class="tx-list">
            ${e.transactions.length===0?`<div class="empty-tx">No recent transactions found</div>`:e.transactions.map(e=>`
                <div class="tx-item">
                  <div class="tx-icon ${e.type}">${n[e.type]??`·`}</div>
                  <div class="tx-details">
                    <div class="tx-type">${e.type}</div>
                    <div class="tx-address">${e.type===`sent`?`To: ${_(e.to||`?`,6)}`:`From: ${_(e.from||`?`,6)}`}</div>
                  </div>
                  <div class="tx-right">
                    <div class="tx-amount ${e.type}">
                      ${e.type===`sent`?`−`:`+`}${v(e.amount)} ${e.asset}
                    </div>
                    <div class="tx-time">${y(e.createdAt)}</div>
                    <a class="tx-hash-link"
                      href="https://stellar.expert/explorer/${w.network===`mainnet`?`public`:`testnet`}/tx/${e.hash}"
                      target="_blank" rel="noopener">
                      ${e.hash.slice(0,8)}…
                    </a>
                  </div>
                </div>
              `).join(``)}
          </div>
        </div>
      </div>
    </div>
  `}function j(){let e=w.accountInfo,t=w.sendForm,n=e.balances.find(e=>t.asset===`XLM`&&e.isNative||e.assetCode===t.asset),r=n?n.isNative?e.xlmAvailable:n.balance:`0`;return`
    <div class="panel">
      <div class="panel-card">
        <div class="panel-header">
          <button class="btn-back" data-action="goto-dashboard">← Back</button>
          <h2>Send Payment</h2>
        </div>

        ${t.error?`<div class="error-msg">${V(t.error)}</div>`:``}

        <div class="form-group">
          <label class="form-label">Destination Address</label>
          <input class="form-input" id="send-destination" type="text"
            placeholder="G…" value="${V(t.destination)}" spellcheck="false" autocomplete="off"/>
          <p class="form-hint">Stellar public key of the recipient</p>
        </div>

        <div class="form-group">
          <label class="form-label">Asset</label>
          <select class="asset-select" id="send-asset">
            ${e.balances.map(e=>`
              <option value="${V(e.assetCode)}" ${t.asset===e.assetCode?`selected`:``}>
                ${V(e.assetCode)} — ${v(e.balance)} available
              </option>
            `).join(``)}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Amount</label>
          <input class="form-input" id="send-amount" type="number" step="0.0000001"
            placeholder="0.00" value="${V(t.amount)}" min="0"/>
          <p class="available-hint">Available: ${v(r)} ${t.asset}</p>
        </div>

        <div class="form-group">
          <label class="form-label">Memo (optional)</label>
          <input class="form-input" id="send-memo" type="text"
            placeholder="Optional note" maxlength="28" value="${V(t.memo)}"/>
          <p class="form-hint">Max 28 characters. Required by some exchanges.</p>
        </div>

        <div class="form-group">
          <label class="form-label">Secret Key (to sign)</label>
          <input class="form-input" id="send-secret" type="password"
            placeholder="S… (never stored or sent anywhere)" autocomplete="off" spellcheck="false"/>
          <p class="form-hint">Used only to sign the transaction locally in your browser.</p>
        </div>

        <button class="btn-primary" data-action="submit-send" ${t.submitting?`disabled`:``}>
          ${t.submitting?`Sending…`:`Send Payment`}
        </button>
      </div>
    </div>
  `}function M(){let e=w.accountInfo.publicKey;return`
    <div class="panel">
      <div class="panel-card">
        <div class="panel-header">
          <button class="btn-back" data-action="goto-dashboard">← Back</button>
          <h2>Receive Payment</h2>
        </div>

        <div class="receive-address-box">
          <div class="address-full">${V(e)}</div>
        </div>

        <button class="btn-primary" data-action="copy-address" data-value="${V(e)}" style="margin-bottom:12px">
          Copy Address
        </button>
        <button class="btn-secondary" style="width:100%" data-action="open-stellar-lab" data-pk="${V(e)}">
          View on Stellar Expert ↗
        </button>

        <p class="receive-network-note">
          Only send assets on the <strong>${w.network===`testnet`?`Stellar Testnet`:`Stellar Mainnet`}</strong>.
          Sending from a different network will result in permanent loss.
        </p>
      </div>
    </div>
  `}function N(e){return`<div class="toast ${e.type}">${V(e.message)}</div>`}function P(){document.addEventListener(`click`,F),document.getElementById(`send-destination`)?.addEventListener(`input`,e=>{w.sendForm.destination=e.target.value}),document.getElementById(`send-amount`)?.addEventListener(`input`,e=>{w.sendForm.amount=e.target.value}),document.getElementById(`send-memo`)?.addEventListener(`input`,e=>{w.sendForm.memo=e.target.value}),document.getElementById(`send-asset`)?.addEventListener(`change`,e=>{w.sendForm.asset=e.target.value,E()})}function F(e){let t=e.target.closest(`[data-action]`);if(t)switch(t.dataset.action){case`set-network`:w.network=t.dataset.net,w.error=null,E();break;case`connect`:I();break;case`disconnect`:Object.assign(w,{view:`connect`,account:null,accountInfo:null,loading:!1,error:null,sendForm:{destination:``,amount:``,asset:`XLM`,memo:``,submitting:!1,error:null}}),E();break;case`goto-send`:w.view=`send`,w.sendForm={destination:``,amount:``,asset:`XLM`,memo:``,submitting:!1,error:null},E();break;case`goto-receive`:w.view=`receive`,E();break;case`goto-dashboard`:w.view=`dashboard`,E();break;case`refresh`:L();break;case`copy-address`:{let e=t.dataset.value;navigator.clipboard.writeText(e).then(()=>{t.textContent=`Copied!`,t.classList.add(`copied`),setTimeout(()=>{t.textContent=`Copy`,t.classList.remove(`copied`)},2e3),z(`Address copied to clipboard`,`success`)});break}case`submit-send`:R();break;case`open-stellar-lab`:{let e=t.dataset.pk,n=w.network===`mainnet`?`public`:`testnet`;window.open(`https://stellar.expert/explorer/${n}/account/${e}`,`_blank`);break}}}async function I(){let e=document.getElementById(`public-key-input`)?.value.trim()??``;if(!g(e)){w.error=`Invalid public key. It must start with G and be 56 characters long.`,E();return}w.loading=!0,w.error=null,w.account={publicKey:e,network:w.network},E();try{w.accountInfo=await S(e,w.network),w.view=`dashboard`}catch(e){w.error=e instanceof Error?e.message:`Failed to load account.`,w.view=`connect`,w.account=null}finally{w.loading=!1,E()}}async function L(){if(w.account){w.loading=!0,E();try{w.accountInfo=await S(w.account.publicKey,w.network),z(`Account refreshed`,`success`)}catch{z(`Failed to refresh`,`error`)}finally{w.loading=!1,w.view=`dashboard`,E()}}}async function R(){let e=w.sendForm,t=document.getElementById(`send-secret`)?.value.trim()??``;if(!g(e.destination)){w.sendForm.error=`Invalid destination address.`,E();return}if(!e.amount||parseFloat(e.amount)<=0){w.sendForm.error=`Enter a valid amount.`,E();return}if(!t.startsWith(`S`)||t.length!==56){w.sendForm.error=`Invalid secret key. It must start with S and be 56 characters.`,E();return}let n=w.accountInfo.balances.find(t=>t.isNative?e.asset===`XLM`:t.assetCode===e.asset)?.assetIssuer??null;w.sendForm.submitting=!0,w.sendForm.error=null,E();try{z(`Payment sent! Tx: ${(await C({secretKey:t,destination:e.destination,amount:e.amount,assetCode:e.asset,assetIssuer:n,memo:e.memo,network:w.network})).slice(0,8)}…`,`success`),w.view=`dashboard`,w.sendForm={destination:``,amount:``,asset:`XLM`,memo:``,submitting:!1,error:null},w.accountInfo=await S(w.account.publicKey,w.network),E()}catch(e){w.sendForm.error=e instanceof Error?e.message:`Transaction failed.`,w.sendForm.submitting=!1,E()}}function z(e,t){T&&clearTimeout(T),w.toast={message:e,type:t};let n=document.querySelector(`.toast`);n?(n.className=`toast ${t}`,n.textContent=e):E(),T=window.setTimeout(()=>{w.toast=null;let e=document.querySelector(`.toast`);e&&e.remove()},4e3)}function B(){let e=document.getElementById(`starfield`);if(!e)return;let t=e.getContext(`2d`);if(!t)return;e.width=window.innerWidth,e.height=window.innerHeight;let n=Array.from({length:120},()=>({x:Math.random()*e.width,y:Math.random()*e.height,r:Math.random()*1.2+.2,o:Math.random()*.6+.2,speed:Math.random()*.3+.05}));function r(){if(!(!t||!e)){t.clearRect(0,0,e.width,e.height);for(let e of n)t.beginPath(),t.arc(e.x,e.y,e.r,0,Math.PI*2),t.fillStyle=`rgba(200, 210, 255, ${e.o})`,t.fill(),e.o+=(Math.random()-.5)*.02,e.o=Math.max(.1,Math.min(.8,e.o));requestAnimationFrame(r)}}r()}function V(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`)}E();export{o as t};
//# sourceMappingURL=index-DOQCjocW.js.map