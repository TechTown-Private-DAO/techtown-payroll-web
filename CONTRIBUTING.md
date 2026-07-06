# Contributing to TechTown Payroll Web

Thanks for helping build the confidential payroll dashboard for DAOs on Stellar. This guide takes a developer with **Next.js experience** from a clean machine to a running dev environment and a merged pull request.

---

## 1. Local Setup

### Prerequisites

| Tool | Version | Why |
|------|---------|-----|
| **Node.js** | 18+ | Runs Next.js 14 and the build tooling |
| **npm** | ships with Node | Package manager (this repo uses `package-lock.json`) |
| **Freighter** | latest | Stellar wallet browser extension used to connect and sign transactions |
| **Backend** | local or hosted | The TechTown Payroll API this frontend talks to |

### Install Node

If you don't have Node 18+, use `nvm`:

```bash
nvm install 18
nvm use 18
node -v   # should print v18.x or higher
```

### Install Freighter

1. Install the [Freighter browser extension](https://freighter.app/).
2. Create or import a Stellar account.
3. Switch to **Testnet** for local development (Settings → Network → Testnet). Local mode requires the Testnet passphrase for signing.

### Clone & install

```bash
git clone <your-fork-url> techtown-payroll-web
cd techtown-payroll-web
npm install
```

### Configure environment

Copy the example env file and edit it:

```bash
cp .env.example .env.local
```

The dev server reads `.env.local`. See the [Environment Variable Reference](#2-environment-variable-reference) for every variable.

### Point at a backend

You need a running backend. Options:

- **Local backend** (recommended for dev): `NEXT_PUBLIC_API_URL=http://localhost:3000`
- **Hosted backend**: `NEXT_PUBLIC_API_URL=https://your-api-domain.com`

If you don't run the backend yourself, ask a maintainer for a staging URL.

---

## 2. Environment Variable Reference

Every variable from `.env.example` is documented below.

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:3000` | Base URL of the TechTown Payroll backend API. All requests from `lib/api.ts` are prefixed with this value. Because it is prefixed with `NEXT_PUBLIC_`, it is inlined into the client bundle at build time and is therefore available in the browser. **Local dev:** `http://localhost:3000`. **Production:** `https://your-api-domain.com`. |

> Note: variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never put secrets (keys, JWTs, DB URLs) in a `NEXT_PUBLIC_` variable. The current app stores the auth token client-side in `localStorage` under `tt_token` (see README), not in env.

If you add a new env variable, document it here and add it to `.env.example` with a comment.

---

## 3. Running the Dev Server

```bash
npm run dev
```

The app starts at **http://localhost:3001** (Next.js default port for this project). Open it and connect Freighter.

Useful scripts:

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the dev server with hot reload (port 3001) |
| `npx tsc --noEmit` | Type-check without emitting output |
| `npm run lint` | Lint with ESLint (next config) |
| `npm run test` | Run the Vitest suite once |
| `npm run build` | Production build |
| `npm run start` | Serve the production build (requires `build` first) |

---

## 4. Building for Production

```bash
npm run build
npm start
```

`npm run build` runs `next build`, which type-checks, lints, and bundles the app. `npm start` serves it on the default port (3000).

### Docker

```bash
docker build -t techtown-payroll-web .
docker run -p 3001:3000 -e NEXT_PUBLIC_API_URL=http://localhost:3000 techtown-payroll-web
```

`NEXT_PUBLIC_API_URL` must be passed at **build time** because Next.js inlines `NEXT_PUBLIC_*` vars into the client bundle. Set it before `docker build`, or use a multi-stage build that injects it.

---

## 5. Code Style Conventions

These are enforced by ESLint/TypeScript where possible and expected in review.

### TypeScript — strict mode

- `tsconfig.json` has `"strict": true`. **No `any`.** No `ts-ignore` without a comment explaining why.
- All new code is TypeScript (`.ts`/`.tsx`). Prefer explicit return types on exported functions.
- API responses are typed. Extend the types in `lib/api.ts` rather than casting to `any`.
- Run `npx tsc --noEmit` before pushing; it must pass with zero errors.

### React & data fetching

- Use the typed **TanStack Query** hooks in `lib/hooks.ts` for all data. **No raw `fetch` calls in components.**
- New backend resources: add the typed call to `lib/api.ts` and a hook to `lib/hooks.ts`.
- Wallet access goes through `useWallet()` from `contexts/WalletContext.tsx`. Do not call `@stellar/freighter-api` directly in components.

### Tailwind class ordering

We follow a consistent, readable order for utility classes. Order classes as:

1. **Layout** — `block`, `flex`, `grid`, `hidden`, `relative`, `absolute`, `fixed`
2. **Sizing** — `w-*`, `h-*`, `min-*`, `max-*`, `aspect-*`
3. **Spacing** — `m-*`, `p-*`, `gap-*`, `space-*`
4. **Typography** — `text-*`, `font-*`, `leading-*`, `tracking-*`
5. **Color / background / border** — `bg-*`, `text-*`, `border-*`, `ring-*`
6. **Effects** — `shadow-*`, `opacity-*`, `blur-*`
7. **Transitions / animation** — `transition-*`, `duration-*`, `animate-*`
8. **States & variants** — `hover:*`, `focus:*`, `dark:*`, `md:*` last

Example:

```tsx
<button className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 md:w-auto">
  Connect Wallet
</button>
```

- Use the `cn()` helper from `lib/utils.ts` to merge conditional classes (`clsx` + `tailwind-merge`); don't hand-concatenate class strings.
- Prefer shared UI primitives in `components/ui/` (Button, Card, Badge) over ad-hoc markup.
- Use `class-variance-authority` variants when a component has multiple visual states.

### General

- Format with Prettier-style defaults; keep line length reasonable.
- No `console.log` left in committed code.
- Keep `app/`, `components/`, `contexts/`, `lib/` structure; co-locate feature files with their route.

---

## 6. Pull Request Checklist

Before opening a PR, confirm:

- [ ] I branched off the current `main` (`git checkout -b my-feature main`).
- [ ] `.env.local` is created and `NEXT_PUBLIC_API_URL` points at a reachable backend.
- [ ] `npm install` ran cleanly.
- [ ] `npx tsc --noEmit` passes with no errors.
- [ ] `npm run lint` passes with no errors or warnings.
- [ ] `npm run test` passes (or I added tests for new logic).
- [ ] `npm run build` succeeds.
- [ ] No new secrets committed; any new env var is in `.env.example` and documented in §2.
- [ ] New backend calls go through `lib/api.ts` + a `lib/hooks.ts` hook.
- [ ] Tailwind classes follow the ordering in §5.
- [ ] I tested the flow in the browser with Freighter connected (Testnet).
- [ ] PR description explains **what** changed and **why**, links the issue, and notes any UI changes.

---

## 7. Acceptance Criteria

A contribution is accepted when **all** of the following hold:

1. **Builds & type-checks:** `npm run build` and `npx tsc --noEmit` complete with no errors.
2. **Lints clean:** `npm run lint` reports no errors or warnings on changed files.
3. **Tests green:** `npm run test` passes; new non-trivial logic has matching tests.
4. **Runs in dev:** `npm run dev` serves the app at `http://localhost:3001` and the dashboard loads with a connected Freighter wallet on Testnet.
5. **API reachable:** The app successfully calls `NEXT_PUBLIC_API_URL`; data renders from the typed hooks with no raw `fetch` in components.
6. **Env documented:** Every variable in `.env.example` is explained in §2; no undocumented `NEXT_PUBLIC_*` vars are introduced.
7. **Style compliant:** TypeScript strict (no `any`, no unexplained `ts-ignore`) and Tailwind classes follow the §5 ordering via `cn()`.
8. **Review passed:** At least one maintainer approved; requested changes are resolved; branch is up to date with `main`.
9. **No secrets:** No tokens, keys, or credentials are committed; `localStorage` tokens (`tt_token`, `tt_dao_id`) are handled client-side only.

---

## Questions?

Open an issue or ask in the project's discussion channel. Thanks for contributing!
