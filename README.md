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

A real transfer executed through KeeperHub on Sepolia testnet:

[0x6fd69682cbd3d46ed37ca7c4a8ee5cd7b3dce9f9e76fc9724e3d64ec43d26592](https://sepolia.etherscan.io/tx/0x6fd69682cbd3d46ed37ca7c4a8ee5cd7b3dce9f9e76fc9724e3d64ec43d26592)

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
KEEPERHUB_API_KEY=your_keeperhub_api_key
KEEPERHUB_WALLET_ID=your_wallet_id
KEEPERHUB_CHAIN_ID=11155111
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
PORT=3000

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

Built for the [KeeperHub Agents Onchain Hackathon](https://dorahacks.io/hackathon/agents-onchain) · July 2026