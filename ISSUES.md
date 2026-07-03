# 📋 TechTown Payroll Web — Open Issues

This document tracks open issues for the `techtown-payroll-web` repository.
Each issue includes its difficulty level, labels, and enough context so you can start contributing without deep prior knowledge of the codebase.

> **Want to contribute?** Read [CONTRIBUTING.md](CONTRIBUTING.md), pick an issue, comment on the corresponding GitHub issue to claim it, then open a PR. All skill levels are welcome!

---

## Table of Contents

- [Good First Issues](#good-first-issues)
- [Features](#features)
- [UX & Accessibility](#ux--accessibility)
- [Testing](#testing)
- [Documentation & DX](#documentation--dx)

---

## Good First Issues

---

### #1 — Add a loading spinner component
**Labels:** `good first issue` · `ui` · `component`
**Difficulty:** ⭐ Beginner

**Description:**
Several pages show a raw `"Loading..."` string while data is fetching. A proper spinner improves perceived performance.

**Task:**
Create `components/ui/Spinner.tsx`. Accept a `size` prop (`sm | md | lg`). Replace all `"Loading..."` strings in dashboard pages with `<Spinner />`.

**Acceptance Criteria:**
- [ ] Component renders an accessible `role="status"` element with a visible animation
- [ ] Three sizes work correctly
- [ ] All existing loading states replaced

---

### #2 — Add empty-state illustrations to list pages
**Labels:** `good first issue` · `ui`
**Difficulty:** ⭐ Beginner

**Description:**
When there are no employees, payrolls, or proposals, pages show nothing. An empty state with an icon and CTA is more helpful.

**Task:**
Create a reusable `components/ui/EmptyState.tsx` that accepts `title`, `description`, and an optional `action` button. Use it on the employees, payroll, and proposals pages when the list is empty.

**Acceptance Criteria:**
- [ ] Component accepts all three props
- [ ] All three list pages render the empty state when `data.length === 0`
- [ ] `action` renders a `<Button>` that navigates to the relevant creation flow

---

### #3 — Display wallet network in the navbar
**Labels:** `good first issue` · `ui` · `wallet`
**Difficulty:** ⭐ Beginner

**Description:**
Users can be on mainnet or testnet, but the current UI gives no indication of which network is active. Sending a mainnet transaction by accident is dangerous.

**Task:**
Read `network` from `useWallet()`. Display a coloured badge ("Mainnet 🔴" or "Testnet 🟡") next to the connected address in the top navbar.

**Acceptance Criteria:**
- [ ] Badge is always visible when the wallet is connected
- [ ] Mainnet badge is visually distinct (red/warning) from testnet

---

### #4 — Add a "Copy address" button next to the wallet address
**Labels:** `good first issue` · `ui` · `wallet`
**Difficulty:** ⭐ Beginner

**Description:**
The dashboard shows the Stellar address but there is no one-click copy. Users have to manually select the text.

**Task:**
Add a copy-to-clipboard icon button next to the wallet address. Show a brief "Copied!" tooltip on success.

**Acceptance Criteria:**
- [ ] Clicking the icon copies the full address to the clipboard using the Clipboard API
- [ ] Tooltip disappears after 2 seconds
- [ ] Button has an accessible `aria-label="Copy wallet address"`

---

### #5 — Add `CONTRIBUTING.md`
**Labels:** `documentation` · `good first issue`
**Difficulty:** ⭐ Beginner

**Description:**
There is no contribution guide for new contributors.

**Task:**
Create `CONTRIBUTING.md` covering:
- Local setup (Node, Freighter, backend URL)
- Running the dev server and building for production
- Environment variable reference
- Code style conventions (TypeScript strict, Tailwind class ordering)
- PR checklist

**Acceptance Criteria:**
- [ ] A developer with Next.js experience can follow the guide from scratch
- [ ] Every variable in `.env.example` is explained

---

## Features

---

### #6 — Add payroll history with status badges
**Labels:** `feature` · `dashboard`
**Difficulty:** ⭐⭐ Intermediate

**Description:**
The payroll page fetches a list of payrolls but does not visually differentiate statuses (`Pending`, `Approved`, `Executed`, `Cancelled`).

**Task:**
Add a `StatusBadge` component that maps each payroll status to a colour (`yellow`, `blue`, `green`, `red`). Display it in the payroll list table. Add a filter dropdown to show payrolls by status.

**Acceptance Criteria:**
- [ ] Each status has a unique colour
- [ ] Filter dropdown defaults to "All"
- [ ] Selecting a status filters the list without a page reload

---

### #7 — Add confirm dialog before destructive actions
**Labels:** `feature` · `ux` · `safety`
**Difficulty:** ⭐⭐ Intermediate

**Description:**
Actions like removing an employee, cancelling a payroll, or rejecting a proposal are destructive but execute immediately on click.

**Task:**
Create a `components/ui/ConfirmDialog.tsx` using a `<dialog>` element (or a Tailwind modal). Show it before any irreversible mutation. Accept `title`, `description`, and `onConfirm` props.

**Acceptance Criteria:**
- [ ] Confirm dialog appears for: remove employee, cancel payroll, reject proposal
- [ ] "Cancel" dismisses the dialog without side effects
- [ ] Dialog is keyboard-accessible (focus trapped, closeable with Escape)

---

### #8 — Add treasury deposit form with token selector
**Labels:** `feature` · `treasury`
**Difficulty:** ⭐⭐ Intermediate

**Description:**
The treasury page shows the balance but the deposit flow is incomplete — there is no token selector or amount validation.

**Task:**
Build a `DepositForm` component with:
- A dropdown of whitelisted tokens (fetched from the API)
- A numeric amount input with min/max validation
- Submission calls `useDeposit` and signs the XDR via `signTx`

**Acceptance Criteria:**
- [ ] Token list is fetched dynamically, not hardcoded
- [ ] Amount must be a positive number; form blocks submission otherwise
- [ ] After a successful deposit, the balance on the page updates without a full page reload

---

### #9 — Implement employee search and filter
**Labels:** `feature` · `employees`
**Difficulty:** ⭐⭐ Intermediate

**Description:**
The employee list has no search or filter. DAOs with many employees need to find people by name, department, or status.

**Task:**
Add a search bar and a status filter dropdown above the employee table. Filter client-side using the already-fetched data. Debounce the search input by 300 ms.

**Acceptance Criteria:**
- [ ] Search matches employee wallet address and department (case-insensitive)
- [ ] Status filter shows: All, Active, Frozen, Removed
- [ ] Both controls can be used simultaneously

---

### #10 — Add dark mode support
**Labels:** `feature` · `ui` · `accessibility`
**Difficulty:** ⭐⭐ Intermediate

**Description:**
The app only supports light mode. Many developers and DAO contributors prefer dark mode.

**Task:**
Configure Tailwind's `darkMode: 'class'` strategy. Add a toggle button (sun/moon icon) in the navbar that switches the `dark` class on `<html>`. Persist the preference in `localStorage`. Audit all components for legibility in dark mode.

**Acceptance Criteria:**
- [ ] Toggle switches between light and dark mode instantly
- [ ] Preference is restored on page reload
- [ ] All pages are legible in dark mode (no white text on white background etc.)

---

### #11 — Add proposal voting progress bar
**Labels:** `feature` · `proposals`
**Difficulty:** ⭐⭐ Intermediate

**Description:**
Proposals show a raw "X of Y approvals" text. A visual progress bar would communicate urgency more clearly.

**Task:**
Add a `VotingProgress` component that renders a horizontal bar showing `current_approvals / multisig_threshold`. Color it green when the threshold is met.

**Acceptance Criteria:**
- [ ] Progress bar fills proportionally to approvals received
- [ ] Turns green at 100% (threshold met)
- [ ] Accessible: has `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`

---

## UX & Accessibility

---

### #12 — Add error boundary to the dashboard layout
**Labels:** `ux` · `reliability`
**Difficulty:** ⭐⭐ Intermediate

**Description:**
An unhandled error in any dashboard page currently crashes the entire app with a white screen.

**Task:**
Wrap the dashboard layout in a React Error Boundary component. Show a friendly error message and a "Reload" button when a component throws.

**Acceptance Criteria:**
- [ ] Error Boundary is applied in `app/dashboard/layout.tsx` (or equivalent)
- [ ] Error message is user-friendly (not a stack trace)
- [ ] "Reload" button refreshes the page

---

### #13 — Fix form inputs for keyboard-only navigation
**Labels:** `accessibility` · `ux`
**Difficulty:** ⭐⭐ Intermediate

**Description:**
Several forms on the employee and payroll pages cannot be submitted using only the keyboard because custom button components swallow the `Enter` key event.

**Task:**
Audit all forms. Ensure every `<Button>` inside a `<form>` is a `type="submit"` button or has an explicit `onClick`. Remove any `e.preventDefault()` calls that are not intentional.

**Acceptance Criteria:**
- [ ] All forms can be submitted by pressing `Enter` when focus is on any field
- [ ] Tab order is logical on all pages
- [ ] No accessibility warnings in axe DevTools for these forms

---

### #14 — Show transaction hash after on-chain actions
**Labels:** `ux` · `transparency`
**Difficulty:** ⭐⭐ Intermediate

**Description:**
After executing a payroll or claiming a salary, the user has no confirmation of the on-chain transaction. They can't verify it on a block explorer.

**Task:**
After any action that returns an XDR or transaction hash, show a toast notification that includes a shortened hash and a link to `https://stellar.expert/explorer/<network>/tx/<hash>`.

**Acceptance Criteria:**
- [ ] Toast appears within 1 s of a successful on-chain action
- [ ] Link opens the correct explorer URL in a new tab
- [ ] Toast has a close button and auto-dismisses after 8 s

---

### #15 — Add skeleton loaders to the dashboard stats cards
**Labels:** `ux` · `ui`
**Difficulty:** ⭐ Beginner

**Description:**
Dashboard stat cards (employees count, treasury balance, etc.) flash empty/zero while data loads. Skeleton loaders prevent layout shift.

**Task:**
Create a `SkeletonCard` component using a Tailwind `animate-pulse` placeholder. Use it in the dashboard overview while stats are loading.

**Acceptance Criteria:**
- [ ] Skeleton matches the approximate dimensions of the real card
- [ ] Disappears and is replaced by real data once loaded
- [ ] No layout shift between skeleton and real content

---

## Testing

---

### #16 — Add unit tests for all API hooks in `lib/hooks.ts`
**Labels:** `testing`
**Difficulty:** ⭐⭐ Intermediate

**Description:**
`lib/hooks.ts` contains all TanStack Query hooks but has no tests. A regression in any hook would go undetected.

**Task:**
Using `@testing-library/react` and `msw` (Mock Service Worker), write unit tests for every hook. Test at least: loading state, success state with mock data, and error state.

**Acceptance Criteria:**
- [ ] All hooks have at least 3 tests each
- [ ] Tests run with `npm test`
- [ ] MSW handlers mock the same endpoints defined in `lib/api.ts`

---

### #17 — Add E2E tests for the connect-wallet flow
**Labels:** `testing` · `wallet`
**Difficulty:** ⭐⭐⭐ Advanced

**Description:**
The wallet connect flow is untested. A broken Freighter integration would silently block all DAO interactions.

**Task:**
Set up Playwright. Write an E2E test that mocks the `@stellar/freighter-api` module and tests:
1. Landing page shows "Connect Wallet" CTA
2. After mock connect, dashboard is accessible
3. Disconnect returns to landing page

**Acceptance Criteria:**
- [ ] Tests run with `npx playwright test`
- [ ] Freighter API is mocked (no real extension required)
- [ ] All three scenarios pass

---

### #18 — Add Storybook for all `components/ui` components
**Labels:** `testing` · `documentation` · `dx`
**Difficulty:** ⭐⭐ Intermediate

**Description:**
There is no component playground. Contributors can't visually verify `Button`, `Card`, `Badge`, etc. without running the full app.

**Task:**
Install and configure Storybook for Next.js. Add at least one story for each component in `components/ui/`, covering default, hover, disabled, and variant states.

**Acceptance Criteria:**
- [ ] `npm run storybook` starts the Storybook dev server
- [ ] Every component in `components/ui/` has a story file
- [ ] Stories render without errors

---

## Documentation & DX

---

### #19 — Add `lib/api.ts` JSDoc with request and response types
**Labels:** `documentation` · `dx` · `good first issue`
**Difficulty:** ⭐ Beginner

**Description:**
`lib/api.ts` is the source of truth for all backend calls but has minimal comments. Contributors need to infer parameter shapes from the call sites.

**Task:**
Add a JSDoc block (`/** ... */`) to every exported function in `lib/api.ts`. Include `@param` tags for each argument, a `@returns` description, and an `@throws` note for common failure modes.

**Acceptance Criteria:**
- [ ] Every exported function has a JSDoc block
- [ ] VS Code IntelliSense shows the doc on hover
- [ ] No TypeScript errors introduced

---

### #20 — Set up `lint-staged` and `husky` pre-commit hooks
**Labels:** `dx` · `ci` · `good first issue`
**Difficulty:** ⭐ Beginner

**Description:**
Developers can commit code that fails linting or type-checking, causing CI to fail after the fact.

**Task:**
Install `husky` and `lint-staged`. Configure a pre-commit hook that runs:
- `npx tsc --noEmit` on staged `.ts`/`.tsx` files
- `npm run lint` on staged files

**Acceptance Criteria:**
- [ ] `husky` hooks are installed as part of `npm install` (via `prepare` script)
- [ ] A commit with a type error is blocked
- [ ] `lint-staged` config is in `package.json` or `.lintstagedrc`

---

---

### #21 — Add a global toast notification system
**Labels:** `feature` · `ux` · `good first issue`
**Difficulty:** ⭐⭐ Intermediate

**Description:**
Success and error feedback after mutations (add employee, approve payroll, etc.) is currently inconsistent — some actions show nothing, others use `alert()`.

**Task:**
Create a `ToastContext` and a `<Toaster />` component placed in the root layout. Expose a `useToast()` hook with `toast.success(msg)` and `toast.error(msg)` helpers. Replace all `alert()` calls and silent mutations with toasts.

**Acceptance Criteria:**
- [ ] Toasts appear in a fixed corner, stacked if multiple are shown
- [ ] Success toasts are green, error toasts are red
- [ ] Each toast auto-dismisses after 5 s and has a manual close button
- [ ] All existing `alert()` calls removed

---

### #22 — Add mobile-responsive navigation drawer
**Labels:** `feature` · `ux` · `accessibility`
**Difficulty:** ⭐⭐ Intermediate

**Description:**
The dashboard sidebar is not responsive. On screens narrower than 768 px, navigation links overflow or disappear entirely.

**Task:**
Replace the static sidebar with a responsive layout:
- On desktop (≥768 px): sidebar visible as usual
- On mobile (<768 px): sidebar hidden behind a hamburger menu that opens a slide-in drawer

Use Tailwind breakpoint classes. Ensure the drawer closes when a link is clicked or the overlay is tapped.

**Acceptance Criteria:**
- [ ] All dashboard pages are usable on a 375 px viewport
- [ ] Drawer closes on navigation and on overlay click
- [ ] Hamburger button has `aria-expanded` and `aria-controls` attributes

---

### #23 — Persist active DAO selection across sessions
**Labels:** `feature` · `dx`
**Difficulty:** ⭐ Beginner

**Description:**
If a user refreshes the page, the `tt_dao_id` in `localStorage` is read correctly, but if the stored DAO no longer exists (e.g. stale test data), the app silently breaks with empty pages.

**Task:**
On app load, after reading `tt_dao_id` from `localStorage`, call `GET /api/daos/:id` to validate the DAO still exists. If the request returns `404`, clear `tt_dao_id` from storage and redirect to the landing page with a brief explanation toast.

**Acceptance Criteria:**
- [ ] Stale `tt_dao_id` causes a redirect to `/` with a toast message
- [ ] Valid `tt_dao_id` loads the dashboard normally
- [ ] Validation call happens once on mount, not on every render

---

### #24 — Add payroll claim flow for employees
**Labels:** `feature` · `payroll`
**Difficulty:** ⭐⭐ Intermediate

**Description:**
The payroll page allows Admins to create/approve/execute payrolls but there is no UI for an employee to claim their salary after a payroll is executed.

**Task:**
Add a "Claim Salary" section on the payroll page. Show it only when the connected wallet matches an active employee. List executed payrolls where the employee has not yet claimed. Each row should have a "Claim" button that calls `useClaimPayroll` (or the equivalent mutation hook) and signs the XDR.

**Acceptance Criteria:**
- [ ] Section only renders when `address` matches an employee wallet
- [ ] Already-claimed payrolls are shown as "Claimed" and the button is disabled
- [ ] Successful claim shows a toast with the transaction hash
- [ ] Payroll list refreshes automatically after a successful claim

---

### #25 — Add `next/bundle-analyzer` and document bundle size budget
**Labels:** `performance` · `dx`
**Difficulty:** ⭐⭐ Intermediate

**Description:**
There is no visibility into the JavaScript bundle size. A heavy dependency import can silently inflate the bundle and hurt Time-to-Interactive.

**Task:**
Install `@next/bundle-analyzer`. Add an `npm run analyze` script that builds with the analyzer enabled. Run it once, record the current baseline sizes, and document a size budget (e.g. First Load JS ≤ 250 KB) in `CONTRIBUTING.md`.

**Acceptance Criteria:**
- [ ] `npm run analyze` opens the bundle visualiser without errors
- [ ] Baseline bundle sizes are recorded in `CONTRIBUTING.md` with a date
- [ ] CI step (optional) warns if First Load JS exceeds the budget

---

*Last updated: 2026-07-03 · Maintainers: TechTown-Private-DAO*
