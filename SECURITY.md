# Security Policy

## Scope

This policy applies to the `techtown-payroll-web` repository and all code shipped in it, including:

- Next.js application (`app/`, `components/`, `contexts/`, `lib/`)
- Dockerfile and Docker-based deployments
- CI/CD workflows (`.github/workflows/`)

Out of scope: third-party dependencies, the public Stellar testnet, Freighter and other wallet extensions, and any other repositories in the TechTown monorepo unless explicitly stated.

If you discover a vulnerability that you believe affects multiple repos in the monorepo, please still report it here and we will coordinate.

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Please report security issues privately via one of the following methods:

### Preferred: GitHub Security Advisory

1. Go to the **Security** tab of this repository.
2. Click **"Private vulnerability reporting"**.
3. Fill in the report form and submit.

GitHub will handle the conversation privately between you and the maintainers until a fix is ready.

### Alternative: Email

Send a detailed report to **security@techtown.xyz**.

Include:
- A description of the vulnerability.
- Steps to reproduce, including any relevant code, payloads, or screenshots.
- The potential impact of the issue.
- Any suggested fixes or mitigations (optional but appreciated).

## Expected Response Time

We aim to respond to all valid security reports within **7 business days**. Once a report is validated, we will:

1. Acknowledge receipt and confirm the issue.
2. Provide an estimated timeline for a fix.
3. Coordinate disclosure once a patch is available.

If you do not receive a response within 7 business days, please follow up via the same channel. If there is still no response, you may escalate by opening a **minimal** public issue that does not disclose exploit details.

## Known Limitations

This software is a **prototype** and is not production-ready:

- On-chain transactions are currently signed by a backend-held relayer identity rather than each user's own wallet — see `techtown-payroll-backend` ISSUES.md #35 and this repo's ISSUES.md #29. Do not use this deployment path with real user funds.
- No formal security audit has been performed.
- DAO/employee/payroll actions depend on the companion backend's authorization; a compromised or misconfigured backend can affect this frontend's behavior.

We encourage researchers and contributors to review these areas for improvements.
