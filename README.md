# ✦ StellarDash

A local-first Stellar wallet dashboard built with TypeScript and Vite. View your balances, transaction history, and send payments — all from the browser with no server or signup required.

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript&logoColor=white)
![Stellar](https://img.shields.io/badge/Stellar-SDK%2012-7B68EE?style=flat&logo=stellar&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green?style=flat)

## Features

- **View Balances** — See all your XLM and custom asset balances with available amounts
- **Transaction History** — View your recent payments, receives, and swaps with links to Stellar Expert
- **Send Payments** — Sign and submit payments directly in the browser using your secret key
- **Receive** — Show your address for others to send to
- **Testnet & Mainnet** — Switch between networks easily
- **No backend** — Talks directly to Horizon API, nothing is stored or sent to any server
- **Animated starfield** — Because space

## Getting Started

### Prerequisites

- Node.js v18+
- npm v9+

### Installation

```bash
git clone https://github.com/your-username/stellar-dashboard.git
cd stellar-dashboard
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Try it on Testnet

1. Go to [Stellar Friendbot](https://laboratory.stellar.org/#account-creator?network=test) to generate and fund a testnet account
2. Copy the public key (starts with `G`)
3. Paste it into StellarDash on Testnet mode
4. Explore your account!

## Sending Payments

To send a payment, you'll need your **secret key** (starts with `S`). It is used only to sign the transaction locally in your browser — it is never sent to any server.

> ⚠️ Never share your secret key with anyone. Only use this on trusted devices.

## Project Structure

```
stellar-dashboard/
├── index.html
├── src/
│   ├── main.ts             # App entry, render loop, event handling
│   ├── types/
│   │   └── index.ts        # TypeScript interfaces
│   ├── utils/
│   │   └── stellar.ts      # Horizon API, tx building, helpers
│   └── styles/
│       └── main.css        # Design system + all styles
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Tech Stack

| Tool | Purpose |
|---|---|
| **TypeScript** | Strictly typed app logic |
| **Vite** | Dev server and bundler |
| **@stellar/stellar-sdk** | Transaction building and signing |
| **Stellar Horizon API** | Account data and transaction submission |

## Deploying to GitHub Pages

```bash
npm run build
npm install --save-dev gh-pages
```

Add to `package.json` scripts:
```json
"deploy": "gh-pages -d dist"
```

Update `vite.config.ts`:
```ts
base: '/stellar-dashboard/',
```

Then deploy:
```bash
npm run deploy
```

## Contributing

This project is part of the [Stellar Wave Program](https://www.drips.network/wave/stellar). Contributions are welcome — please open an issue before submitting a PR.

## Security

- Secret keys are used only in-memory for transaction signing and are never logged, stored, or transmitted
- All Horizon requests go directly to `horizon.stellar.org` or `horizon-testnet.stellar.org`

## License

[MIT](LICENSE)
