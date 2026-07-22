# AfterKey

**Your onchain dead man's switch.**

AfterKey is an AI-powered agent that monitors wallet inactivity and automatically transfers assets to a designated beneficiary address if the owner stops checking in. Built on top of KeeperHub's execution and reliability layer.

---

## The Problem

Billions in crypto assets are lost every year because owners die or become incapacitated with no way to pass them on. Traditional wills don't work for self-custodied assets. AfterKey solves this with a simple, trustless onchain mechanism — no lawyers, no intermediaries.

---

## How It Works

1. **Connect your wallet** — MetaMask or any injected provider
2. **Set your switch** — choose a beneficiary address, check-in interval, and amount
3. **Check in regularly** — hit "I'm alive" before your deadline
4. **Miss a check-in** — AfterKey's agent automatically executes the transfer onchain via KeeperHub

---

## KeeperHub Integration

AfterKey uses KeeperHub as its onchain execution and reliability layer:

- **Direct Execution API** — transfers are executed via KeeperHub's `/execute/transfer` endpoint with smart gas estimation and MEV protection
- **Gas Sponsorship** — transactions are sponsored by KeeperHub on Sepolia testnet (`"sponsored": true`)
- **Audit Trail** — every execution is logged with trigger time, gas used, retry count, transaction hash, and Etherscan link
- **Execution Status Polling** — AfterKey polls KeeperHub's status endpoint after every transfer to update the audit trail in real time

### Verified Transaction

Real transfers executed through KeeperHub on Sepolia testnet:

[0x6fd69682cbd3d46ed37ca7c4a8ee5cd7b3dce9f9e76fc9724e3d64ec43d26592](https://sepolia.etherscan.io/tx/0x6fd69682cbd3d46ed37ca7c4a8ee5cd7b3dce9f9e76fc9724e3d64ec43d26592)

[0x6b6146156d07ca1d3b33ac715ed60f76de7aa01e046b084296ed5be0098d6bd4](https://sepolia.etherscan.io/tx/0x6b6146156d07ca1d3b33ac715ed60f76de7aa01e046b084296ed5be0098d6bd4)

[0xfbda979b1bbb051d4ccf97639e070b26bd1bc24d2ee6c50566fbeebc54be2720](https://sepolia.etherscan.io/tx/0xfbda979b1bbb051d4ccf97639e070b26bd1bc24d2ee6c50566fbeebc54be2720)

---

## Tech Stack

- **Frontend** — React + Vite, deployed on Vercel
- **Backend** — Node.js + Express, deployed on Railway
- **Database** — Supabase (PostgreSQL)
- **Agent** — node-cron scheduler with KeeperHub execution
- **Chain** — Ethereum Sepolia testnet

---

## Live Demo

- **App** — https://afterkey-ten.vercel.app
- **API** — https://afterkey-production.up.railway.app

---

## Running Locally

### Prerequisites
- Node.js v20+
- MetaMask browser extension
- KeeperHub API key
- Supabase project

### Setup

1. Clone the repo:
```bash
git clone https://github.com/TheKingCartello/Afterkey.git
cd Afterkey
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
cd ..
```

4. Create a `.env` file in the root:
```
KEEPERHUB_API_KEY=your_keeperhub_api_key
KEEPERHUB_WALLET_ID=your_wallet_id
KEEPERHUB_CHAIN_ID=11155111
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
PORT=3000
```

5. Run the backend:
```bash
npm start
```

6. Run the frontend:
```bash
cd frontend
npm run dev
```

7. Open `http://localhost:5173`

---

## Project Structure

afterkey/
├── backend/
│   ├── agent/
│   │   └── monitor.js      # Inactivity monitor + KeeperHub execution
│   ├── routes/
│   │   ├── switch.js       # Switch CRUD routes
│   │   └── checkin.js      # Check-in route
│   ├── db.js               # Supabase client
│   └── server.js           # Express server
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Setup.jsx       # Onboarding form
│       │   ├── Dashboard.jsx   # Live dashboard + audit trail
│       │   └── HowItWorks.jsx  # Animated onboarding steps
│       ├── App.jsx
│       └── index.css
└── README.md

---

## Reliability & Observability

AfterKey is built to understand and handle failure modes:

- **Execution status polling** — checks KeeperHub every 30 seconds until resolved
- **Gas handling** — delegated entirely to KeeperHub's smart gas estimation
- **Audit trail** — every transfer logged with full execution details
- **Persistent storage** — switch state stored in Supabase, survives server restarts

---

---

## Roadmap

### V2 — Non-Custodial Smart Contract (Next 3 months)
The current version uses KeeperHub's managed wallet as a custody layer. V2 removes this entirely.

- **Escrow smart contract** — users approve the AfterKey contract once via MetaMask. Funds stay in their own wallet until the switch triggers. No custody risk, no trust required.
- **Per-user balance tracking** — the contract tracks each user's allocated amount independently. Multiple users can run switches simultaneously without shared custody.
- **On-chain check-ins** — instead of a backend API call, check-ins become signed transactions stored onchain. Fully trustless and verifiable.
- **Timelock mechanism** — a configurable grace period after the deadline before funds move, giving beneficiaries time to contest.

### V3 — Multi-Asset & Multi-Chain (3–6 months)
AfterKey becomes an agent that knows where your assets live across the entire onchain ecosystem.

- **DeFi position tracking** — users register their positions: "I have 2 ETH in Aave on Base, 500 USDC in a Uniswap LP on Arbitrum." AfterKey stores these locations.
- **KeeperHub workflow orchestration** — when a switch triggers, AfterKey uses KeeperHub's multi-chain workflow builder to: withdraw from Aave → bridge to destination chain → transfer to beneficiary. All automated, all logged.
- **ERC-20 support** — switch any token, not just ETH. USDC, WBTC, DAI, or any ERC-20.
- **NFT inclusion** — optionally include NFTs in the switch, transferred to the beneficiary address.
- **Multi-beneficiary** — split assets across multiple addresses with configurable percentages.

### V4 — Advanced Agent Intelligence (6–12 months)
The switch evolves from time-based to condition-based with full AI reasoning.

- **AI-powered trigger conditions** — instead of just "X days of inactivity," the agent monitors multiple signals: no onchain activity, no social media posts, no email responses. Claude evaluates all signals before triggering.
- **Social recovery** — designate trusted contacts who must confirm inactivity before the switch fires. Prevents false triggers.
- **Beneficiary notification system** — when a switch triggers, automatically notify the beneficiary via email, Telegram, and Discord with full instructions on how to access the transferred funds.
- **Legal integration** — generate a PDF document summarizing the switch configuration, transaction history, and transfer proof. Admissible as supporting evidence in estate proceedings.
- **DAO treasury support** — organizations can configure switches for multi-sig wallets. If key signers go inactive, treasury assets route to a backup address.

---

## Commercialization Model

### Target Users
- **Individuals** — crypto holders who want peace of mind for their family
- **DAOs** — organizations that need treasury continuity planning
- **Funds & protocols** — teams with significant onchain assets and key-person risk

### Revenue Model
- **Freemium** — one active switch, Sepolia testnet only, free forever
- **Pro ($9/month)** — mainnet support, multiple switches, ERC-20 support, email notifications
- **Enterprise ($99/month)** — multi-sig support, DAO treasury management, audit exports, SLA guarantees, custom check-in intervals

### Why KeeperHub is Central to This
Every version of AfterKey — from V1 to V4 — relies on KeeperHub as the execution and reliability layer. As AfterKey scales to multi-chain, multi-asset, and AI-driven triggers, KeeperHub's infrastructure handles the hard parts: gas estimation, MEV protection, retries, and audit trails. AfterKey is the product layer. KeeperHub is the engine underneath.

---

Built for the [KeeperHub Agents Onchain Hackathon](https://dorahacks.io/hackathon/agents-onchain) · July 2026