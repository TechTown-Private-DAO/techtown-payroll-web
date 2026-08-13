# TechTown Payroll Web — Next Steps

> Current state: dashboard covers DAO-admin workflows (employees, payroll creation, treasury, proposals). Found in codebase audit, 2026-08-12.

---

## Critical — the app doesn't actually authenticate or transact on-chain yet

- **Wallet connect never logs in. — ✅ Done (2026-08-13)** `WalletContext.connect()` now calls `authApi.challenge`/`authApi.login` after Freighter connects, signing the challenge with Freighter's `signBlob`, and stores the returned JWT as `tt_token` so `lib/api.ts`'s `request()` attaches it. Verified with `npx tsc --noEmit` (clean) after fixing an incorrect `signMessage` import — that export doesn't exist in the installed `@stellar/freighter-api@1.7.1`. See ISSUES.md #28.
- **No real on-chain transactions are ever built or signed.** `useWallet().signTx` exists but is dead code — no page constructs a Soroban invocation XDR. Every "write" (create payroll, approve, freeze employee, deposit, etc.) is a plain REST call to the backend with the wallet address passed as a string, not a signed transaction. See ISSUES.md #29.
- **DAO creation/selection is broken.** `tt_dao_id` is read from `localStorage` in 5 files but never written anywhere — it silently defaults to `'1'`. `useCreateDAO`/`daoApi.create` exist but nothing in the UI calls them. There is no onboarding flow to create or select a DAO. See ISSUES.md #27.
- **No employee-facing claim page exists.** The backend (as of 2026-08-12) has a working `GET /payroll/:id/claim-proof` endpoint that returns a verifiable merkle proof + commitment data for an employee's claim — there is no UI anywhere for an employee to see or use it. Every page in `app/dashboard/` is an admin/DAO-management surface. See ISSUES.md #26 (already tracked as #24 in the original list, elevated here given the backend work is now done).

## Also found in the audit

- Dashboard's payroll "View" links point to `/dashboard/payroll/:id`, which doesn't exist (no detail page, no `[id]` route). See ISSUES.md #30.
- Treasury page's "Withdraw" button is permanently disabled with no path to actually initiate one — consistent with the fact that multisig proposals don't execute on-chain yet (see techtown-payroll-contracts NEXT_STEPS.md). No deposit/withdrawal history view either. See ISSUES.md #31.
- Proposals page shows raw truncated JSON for `args`, no decoded target/function view, and no "execute" action once threshold is met (same underlying cause as the treasury gap). See ISSUES.md #32.
- The toast system (`components/ui/toast.tsx`, `Toaster` mounted in `app/providers.tsx`) is fully built but never invoked — errors show as inline text, wallet errors use `alert()`. See ISSUES.md #33 (extends the already-tracked #21).
- No testnet/mainnet mismatch warning despite `network` being available from `useWallet()`. See ISSUES.md #34.
- `/docs` is linked from the landing page but the route doesn't exist. See ISSUES.md #35.

---

## Suggested order

| Priority | Task |
|---|---|
| 1 | Wire wallet connect → `authApi.login` so requests carry a real token |
| 2 | Build a DAO creation/selection onboarding flow |
| 3 | Employee-facing claim page (unblocked by the backend's `claim-proof` endpoint) |
| 4 | Real Soroban transaction building + `signTx` usage, replacing plain REST writes |
| 5 | Payroll detail page, treasury/proposal history + execute UI |
| 6 | Toast wiring, network-mismatch warning, remaining polish items in ISSUES.md |
