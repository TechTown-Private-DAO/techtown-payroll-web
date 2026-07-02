# TechTown Payroll Web

The frontend for **TechTown Private DAO** — a confidential payroll management system built on Stellar/Soroban. Connect your Freighter wallet to manage employees, run payroll, track treasury balances, and vote on governance proposals — all with zero-knowledge privacy.

## Overview

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Wallet:** Stellar Freighter
- **State Management:** TanStack Query (React Query)
- **Animations:** Framer Motion
- **UI Components:** Custom component library (Radix-based)

## Features

- **Wallet Connect** — Freighter wallet integration with automatic session restore, network switching (mainnet/testnet), and XDR transaction signing
- **Dashboard** — Live stats: active employees, treasury balance, pending payrolls, open proposals — all fetched in parallel with loading states
- **Employee Management** — Add employees (with ZK salary commitment), freeze/activate/remove, and browse by department
- **Payroll** — Create payroll runs by selecting employees and period, approve multi-sig payrolls, execute on-chain, and claim as an employee
- **Treasury** — Deposit tokens and track real-time balance
- **Proposals** — Create and approve multi-sig governance proposals

## Project Structure

```
app/
├── page.tsx                     # Landing page (hero, features, stats, CTA)
├── layout.tsx                   # Root layout with providers
├── globals.css                  # Global Tailwind styles
├── providers.tsx                # TanStack Query + Wallet provider wrapper
└── dashboard/
    ├── page.tsx                 # Main dashboard (stats + quick actions)
    ├── employees/page.tsx       # Employee list and management
    ├── payroll/
    │   └── new/page.tsx         # Create new payroll run
    ├── proposals/page.tsx       # Governance proposals
    └── treasury/page.tsx        # Treasury balance and deposits

components/
└── ui/
    ├── button.tsx
    ├── card.tsx
    ├── badge.tsx
    ├── tabs.tsx
    ├── toast.tsx
    ├── toaster.tsx
    └── use-toast.ts

contexts/
└── WalletContext.tsx             # Freighter wallet state and helpers

lib/
├── api.ts                       # Typed API client for all backend endpoints
├── hooks.ts                     # TanStack Query hooks for all API resources
└── utils.ts                     # Utility helpers (cn, etc.)
```

## Getting Started

### Prerequisites

- Node.js 18+
- [Freighter wallet extension](https://freighter.app/) installed in your browser
- The [backend](../techtown-payroll-backend) running locally or accessible via URL

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Running Locally

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3001` by default.

### Build for Production

```bash
npm run build
npm start
```

### Using Docker

```bash
docker build -t techtown-payroll-web .
docker run -p 3001:3000 -e NEXT_PUBLIC_API_URL=http://localhost:3000 techtown-payroll-web
```

### With Docker Compose

From the root `xiaxia/` directory:

```bash
docker compose up
```

## API Integration

All API calls are centralized in `lib/api.ts` and consumed through typed React Query hooks in `lib/hooks.ts`.

```ts
// Example: list employees for a DAO
const { data: employees, isLoading } = useEmployees(daoId)

// Example: add an employee
const addEmployee = useAddEmployee(daoId)
addEmployee.mutate({ wallet_address, department, salary })
```

Available hook groups:

| Hook | Description |
|------|-------------|
| `useDAO`, `useCreateDAO` | Fetch and create DAOs |
| `useEmployees`, `useAddEmployee`, `useFreezeEmployee`, `useActivateEmployee`, `useRemoveEmployee` | Employee management |
| `usePayrolls`, `useCreatePayroll`, `useApprovePayroll`, `useExecutePayroll` | Payroll lifecycle |
| `useTreasuryBalance`, `useDeposit` | Treasury operations |
| `useProposals`, `useCreateProposal`, `useApproveProposal` | Governance |

## Wallet Integration

The app uses the `@stellar/freighter-api` SDK. The `WalletContext` exposes:

```ts
const { isConnected, address, network, connect, disconnect, switchNetwork, signTx } = useWallet()
```

- `connect()` — Prompts Freighter and stores the public key
- `signTx(xdr)` — Signs a Stellar transaction XDR with the correct network passphrase
- `switchNetwork('mainnet' | 'testnet')` — Toggles the active Stellar network
- Session is automatically restored on page load if Freighter is already approved

## DAO Context

After creating a DAO, its ID is stored in `localStorage` under `tt_dao_id`. All dashboard pages read this value to scope their data fetching. The JWT auth token is stored under `tt_token`.

## Development

```bash
# Start dev server with hot reload
npm run dev

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

## License

MIT
