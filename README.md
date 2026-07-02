<div align="center">

# 🌐 TechTown Payroll — Web

**The confidential payroll dashboard for DAOs on Stellar**

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38BDF8?logo=tailwindcss&logoColor=white)
![Stellar](https://img.shields.io/badge/Stellar-Freighter-7B61FF?logo=stellar&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack-Query-FF4154?logo=reactquery&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

</div>

---

## What is this?

TechTown Payroll Web is the frontend for the TechTown Private DAO platform. Connect your **Freighter** wallet to manage employees, run payroll, track your treasury, and vote on governance proposals — all with zero-knowledge privacy on Stellar/Soroban.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔌 **Wallet Connect** | Freighter integration with auto session restore, network switching, and XDR signing |
| 📊 **Dashboard** | Live stats — employees, treasury balance, pending payrolls, open proposals |
| 👥 **Employee Management** | Add employees with ZK salary commitment, freeze/activate/remove |
| 💸 **Payroll** | Create, approve (multi-sig), execute on-chain, and claim as an employee |
| 🏦 **Treasury** | Deposit tokens and track real-time balance |
| 🗳️ **Proposals** | Create and approve multi-sig governance proposals |

---

## 🗂️ Project Structure

```
techtown-payroll-web/
├── app/
│   ├── page.tsx                  # Landing page (hero, features, stats, CTA)
│   ├── layout.tsx                # Root layout with providers
│   ├── globals.css               # Global Tailwind styles
│   ├── providers.tsx             # TanStack Query + Wallet provider wrapper
│   └── dashboard/
│       ├── page.tsx              # Main dashboard overview
│       ├── employees/page.tsx    # Employee list and management
│       ├── payroll/new/page.tsx  # Create a new payroll run
│       ├── proposals/page.tsx    # Governance proposals
│       └── treasury/page.tsx    # Treasury balance and deposits
│
├── components/
│   └── ui/                       # Shared UI components (Button, Card, Badge…)
│
├── contexts/
│   └── WalletContext.tsx         # Freighter wallet state and helpers
│
└── lib/
    ├── api.ts                    # Typed API client for all backend endpoints
    ├── hooks.ts                  # TanStack Query hooks for all resources
    └── utils.ts                  # Utility helpers (cn, etc.)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **[Freighter](https://freighter.app/)** browser extension installed
- The **[backend](../techtown-payroll-backend)** running locally or at a known URL

### 1. Configure Environment

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 2. Install & Run

```bash
npm install
npm run dev
```

> App runs at **http://localhost:3001**

---

## 🐳 Docker

**Standalone:**
```bash
docker build -t techtown-payroll-web .
docker run -p 3001:3000 -e NEXT_PUBLIC_API_URL=http://localhost:3000 techtown-payroll-web
```

**With Docker Compose** (from the root `xiaxia/` directory):
```bash
docker compose up
```

**Build for production:**
```bash
npm run build
npm start
```

---

## 🔗 API Integration

All API calls live in `lib/api.ts` and are consumed via typed **TanStack Query** hooks from `lib/hooks.ts`. No raw `fetch` calls in components.

```ts
// Fetch employees for the current DAO
const { data: employees, isLoading } = useEmployees(daoId)

// Add a new employee
const addEmployee = useAddEmployee(daoId)
addEmployee.mutate({ wallet_address, department, salary })
```

### Available Hooks

| Group | Hooks |
|-------|-------|
| **DAO** | `useDAO`, `useCreateDAO` |
| **Employees** | `useEmployees`, `useAddEmployee`, `useFreezeEmployee`, `useActivateEmployee`, `useRemoveEmployee` |
| **Payroll** | `usePayrolls`, `useCreatePayroll`, `useApprovePayroll`, `useExecutePayroll` |
| **Treasury** | `useTreasuryBalance`, `useDeposit` |
| **Proposals** | `useProposals`, `useCreateProposal`, `useApproveProposal` |

---

## 🔌 Wallet Integration

The app uses `@stellar/freighter-api`. The `WalletContext` exposes everything you need:

```ts
const {
  isConnected,   // boolean
  address,       // Stellar public key or null
  network,       // 'mainnet' | 'testnet'
  connect,       // () => Promise<void>
  disconnect,    // () => void
  switchNetwork, // (n: 'mainnet' | 'testnet') => void
  signTx,        // (xdr: string) => Promise<string>
} = useWallet()
```

- Session is **automatically restored** on page load if Freighter is already approved
- `signTx` picks the correct network passphrase based on the current network

---

## 💾 Local Storage Keys

| Key | Value |
|-----|-------|
| `tt_dao_id` | Active DAO ID (set after DAO creation, used to scope all data fetching) |
| `tt_token` | JWT auth token |

---

## 🛠️ Development Commands

```bash
npm run dev          # Start dev server with hot reload
npx tsc --noEmit     # Type check
npm run lint         # Lint with ESLint
npm run build        # Production build
```

---

## 📄 License

[MIT](./LICENSE)
