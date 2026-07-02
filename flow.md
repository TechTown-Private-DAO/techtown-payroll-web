# techtown-payroll-web — Code Flow

This repo is the **Next.js 14 frontend**. It lets DAO admins and employees manage payroll through a browser UI, with all blockchain interactions handled via the Freighter Stellar wallet extension.

---

## Directory Map

```
app/
├── layout.tsx                  ← Root layout: wraps everything in <Providers>
├── providers.tsx               ← Mounts WalletProvider + React Query QueryClientProvider
├── page.tsx                    ← Landing / login page (connect wallet → register/login)
├── globals.css                 ← Tailwind base styles
└── dashboard/
    ├── page.tsx                ← Dashboard home: DAO overview + treasury balance
    ├── employees/              ← Employee list, add/freeze/remove
    ├── payroll/                ← Payroll list, create/approve/execute/claim
    ├── proposals/              ← Multisig proposals list + approve
    └── treasury/               ← Deposit form + balance display

lib/
├── api.ts                      ← All fetch calls to the backend REST API
├── hooks.ts                    ← React Query wrappers (useDAO, useEmployees, …)
└── utils.ts                    ← cn() class-name helper

contexts/
└── WalletContext.tsx           ← Freighter wallet state (address, connect, signTx)

components/
└── ui/                         ← Shared UI components (buttons, cards, …)
```

---

## Data Flow

### Authentication
```
page.tsx
  └─ useWallet().connect()          → WalletContext.tsx
       └─ freighterIsConnected()     Freighter browser extension
       └─ getPublicKey()             gets Stellar public key
  └─ authApi.login(address, sig, msg) → lib/api.ts → POST /api/auth/login
       └─ JWT stored in localStorage as "tt_token"
```

### Every API Call
```
Component
  └─ hook from lib/hooks.ts (e.g. useEmployees, usePayrolls)
       └─ React Query: useQuery / useMutation
            └─ lib/api.ts: request()
                 ├─ reads JWT from localStorage
                 ├─ sets Authorization: Bearer <token>
                 └─ fetch → NEXT_PUBLIC_API_URL (backend:3000)
                              └─ Axum REST API (techtown-payroll-backend)
```

### Wallet-Signed Transactions
```
Component
  └─ useWallet().signTx(xdr)        → WalletContext.tsx
       └─ Freighter::signTransaction(xdr, networkPassphrase)
            └─ signed XDR returned to component
                 └─ submitted via authApi / payrollApi to backend
                      └─ backend forwards to Stellar RPC
```

---

## Page-by-Page Breakdown

### `app/page.tsx` — Landing
- Renders connect-wallet button
- On connect: calls `authApi.register` or `authApi.login`
- On success: stores JWT, redirects to `/dashboard`

### `app/dashboard/page.tsx` — Overview
- `useDAO(daoId)` → shows DAO name, threshold, pause state
- `useTreasuryBalance(daoId)` → shows current balance
- Summary counts for employees, active payrolls, open proposals

### `app/dashboard/employees/`
- `useEmployees(daoId)` → lists employees with status badges
- `useAddEmployee(daoId)` → form: wallet address, department, salary
  - salary is sent to backend which computes `commitment_hash = H(salary‖randomness‖id)` (never stored plaintext in frontend)
- `useFreezeEmployee` / `useActivateEmployee` / `useRemoveEmployee` → PUT/DELETE

### `app/dashboard/payroll/`
- `usePayrolls(daoId)` → lists payrolls with status: pending → approved → executed
- `useCreatePayroll(daoId)` → picks period + employee IDs, backend builds Merkle tree + ZK proof
- `useApprovePayroll(daoId)` → admin signs approval
- `useExecutePayroll(daoId)` → triggers on-chain execution via backend → Stellar RPC
- Claim flow: employee calls `payrollApi.claim` with their Merkle proof

### `app/dashboard/proposals/`
- `useProposals(daoId)` → lists multisig proposals
- `useCreateProposal(daoId)` → target address + function + args
- `useApproveProposal(daoId)` → adds approver address; backend executes on-chain when threshold met

### `app/dashboard/treasury/`
- `useTreasuryBalance(daoId)` → live balance
- `useDeposit(daoId)` → token address + amount → backend calls Stellar token transfer

---

## State Management

```
WalletContext       → Freighter connection state (address, network, signTx)
React Query cache   → server state (DAOs, employees, payrolls, proposals, treasury)
localStorage        → JWT ("tt_token")
```

React Query automatically re-fetches and invalidates related queries after every mutation, so the UI stays in sync without manual refresh.

---

## Environment Variables

```
NEXT_PUBLIC_API_URL   → backend REST API base URL (default: http://localhost:3000)
```

---

## How this repo connects to the rest of the system

```
Freighter Wallet Extension (browser)
        │  getPublicKey(), signTransaction(xdr)
        ▼
techtown-payroll-web  ◄──── this repo
        │
        │  REST API  (JSON, JWT bearer token)
        ▼
techtown-payroll-backend
        │
        │  Stellar RPC calls
        ▼
techtown-payroll-contracts  (Soroban WASM on Stellar)
```

See `../flow.md` (root) for the full end-to-end picture.
