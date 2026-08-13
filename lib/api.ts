const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

// ── helpers ──────────────────────────────────────────────────────────────────

function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('tt_token')
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
  return data as T
}

const get = <T>(path: string) => request<T>(path)
const post = <T>(path: string, body: unknown) =>
  request<T>(path, { method: 'POST', body: JSON.stringify(body) })
const put = <T>(path: string, body: unknown) =>
  request<T>(path, { method: 'PUT', body: JSON.stringify(body) })
const del = <T>(path: string) => request<T>(path, { method: 'DELETE' })

// ── types ─────────────────────────────────────────────────────────────────────

export interface DAO {
  id: number
  name: string
  symbol: string
  admin_address: string
  multisig_threshold: number
  total_members: number
  paused: boolean
  contract_address: string
  created_at: string
  updated_at: string
}

export interface Employee {
  id: number
  dao_id: number
  wallet_address: string
  department: string
  status: 'active' | 'frozen' | 'removed'
  commitment_hash: string
  joined_at: string
  last_payroll_at: string | null
}

export interface Payroll {
  id: number
  dao_id: number
  period: string
  total_amount: number
  employee_count: number
  status: 'pending' | 'approved' | 'executed' | 'cancelled'
  merkle_root: string
  created_at: string
  approved_at: string | null
  executed_at: string | null
}

export interface Proposal {
  id: number
  dao_id: number
  proposer_address: string
  target_address: string
  function: string
  args: string
  status: 'active' | 'approved' | 'executed' | 'rejected'
  approvals: string[]
  created_at: string
  executed_at: string | null
}

export interface AuthResponse {
  token: string
  wallet_address: string
  expires_at: number
}

export interface ChallengeResponse {
  message: string
  expires_at: number
}

// ── auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  /**
   * Request a one-time message for `wallet_address` to sign, proving key
   * ownership before {@link authApi.login} will accept it.
   *
   * @param wallet_address - Stellar public key (G...) requesting a challenge.
   * @returns The exact {@link ChallengeResponse.message} to sign, and its expiry.
   * @throws {Error} If the wallet address is malformed or the request fails.
   */
  challenge: (wallet_address: string) =>
    post<ChallengeResponse>('/api/auth/challenge', { wallet_address }),
  /**
   * Authenticate a wallet by verifying a signature over a challenge message.
   *
   * @param wallet_address - Stellar public key (G...) of the connecting wallet.
   * @param signature - Base64 XDR signature produced by Freighter for `message`.
   * @param message - The exact challenge string that was signed.
   * @returns The {@link AuthResponse} containing the JWT, wallet address, and expiry.
   * @throws {Error} If the backend rejects the signature or returns a non-2xx status.
   */
  login: (wallet_address: string, signature: string, message: string) =>
    post<AuthResponse>('/api/auth/login', { wallet_address, signature, message }),
  /**
   * Register a new account for a wallet address.
   *
   * @param wallet_address - Stellar public key (G...) to register.
   * @param username - Display name for the account.
   * @param email - Optional contact email.
   * @returns The {@link AuthResponse} with the freshly issued JWT.
   * @throws {Error} If the wallet is already registered or the request fails.
   */
  register: (wallet_address: string, username: string, email?: string) =>
    post<AuthResponse>('/api/auth/register', { wallet_address, username, email }),
  /**
   * Exchange an existing JWT for a refreshed token before it expires.
   *
   * @param token - The current (not yet expired) JWT to refresh.
   * @returns A new {@link AuthResponse} with an updated token and expiry.
   * @throws {Error} If the token is invalid, expired, or the backend errors.
   */
  refresh: (token: string) =>
    post<AuthResponse>('/api/auth/refresh', { token }),
}

// ── DAO ───────────────────────────────────────────────────────────────────────

export const daoApi = {
  /**
   * Create a new DAO on the backend. The caller (from the bearer token)
   * becomes the DAO's admin.
   *
   * @param name - Human-readable DAO name.
   * @param symbol - Short ticker symbol for the DAO.
   * @param multisig_threshold - Number of approvals required for multi-sig actions.
   * @returns The created {@link DAO} record.
   * @throws {Error} If the request is malformed or the backend rejects it.
   */
  create: (name: string, symbol: string, multisig_threshold: number) =>
    post<DAO>('/api/daos', { name, symbol, multisig_threshold }),
  /**
   * Fetch a single DAO by its id.
   *
   * @param id - Numeric DAO identifier.
   * @returns The {@link DAO} record.
   * @throws {Error} If the DAO does not exist (404) or the request fails.
   */
  get: (id: number) => get<DAO>(`/api/daos/${id}`),
}

// ── Employees ─────────────────────────────────────────────────────────────────

export const employeeApi = {
  /**
   * List all employees belonging to a DAO.
   *
   * @param daoId - Numeric DAO identifier.
   * @returns An array of {@link Employee} records.
   * @throws {Error} If the DAO is not found or the request fails.
   */
  list: (daoId: number) => get<Employee[]>(`/api/daos/${daoId}/employees`),
  /**
   * Add an employee to a DAO with a ZK salary commitment.
   *
   * A 32-byte `randomness` nonce is generated client-side and sent with the
   * request so the backend can compute the salary commitment hash.
   *
   * @param daoId - Numeric DAO identifier.
   * @param wallet_address - Stellar public key (G...) of the employee.
   * @param department - Department or team name.
   * @param salary - Salary amount (integer) committed on-chain.
   * @returns The created {@link Employee} record.
   * @throws {Error} If validation fails or the backend rejects the addition.
   */
  add: (daoId: number, wallet_address: string, department: string, salary: number) =>
    post<Employee>(`/api/daos/${daoId}/employees`, {
      wallet_address,
      department,
      salary,
      randomness: Array.from({ length: 32 }, () => Math.floor(Math.random() * 256)),
    }),
  /**
   * Freeze an employee, preventing them from receiving payroll.
   *
   * @param daoId - Numeric DAO identifier.
   * @param employeeId - Numeric employee identifier.
   * @returns `{ success: true }` on success.
   * @throws {Error} If the employee/DAO is not found or the action is unauthorized.
   */
  freeze: (daoId: number, employeeId: number) =>
    put<{ success: boolean }>(`/api/daos/${daoId}/employees/${employeeId}`, { action: 'freeze' }),
  /**
   * Reactivate a previously frozen employee.
   *
   * @param daoId - Numeric DAO identifier.
   * @param employeeId - Numeric employee identifier.
   * @returns `{ success: true }` on success.
   * @throws {Error} If the employee/DAO is not found or the action is unauthorized.
   */
  activate: (daoId: number, employeeId: number) =>
    put<{ success: boolean }>(`/api/daos/${daoId}/employees/${employeeId}`, { action: 'activate' }),
  /**
   * Remove an employee from the DAO.
   *
   * @param daoId - Numeric DAO identifier.
   * @param employeeId - Numeric employee identifier.
   * @returns `{ success: true }` on success.
   * @throws {Error} If the employee/DAO is not found or the action is unauthorized.
   */
  remove: (daoId: number, employeeId: number) =>
    del<{ success: boolean }>(`/api/daos/${daoId}/employees/${employeeId}`),
}

// ── Payroll ───────────────────────────────────────────────────────────────────

export const payrollApi = {
  /**
   * List all payroll runs for a DAO.
   *
   * @param daoId - Numeric DAO identifier.
   * @returns An array of {@link Payroll} records.
   * @throws {Error} If the DAO is not found or the request fails.
   */
  list: (daoId: number) => get<Payroll[]>(`/api/daos/${daoId}/payroll`),
  /**
   * Create a new payroll run for a set of employees.
   *
   * @param daoId - Numeric DAO identifier.
   * @param period - Payroll period label (e.g. `"2026-07"`).
   * @param employee_ids - Numeric ids of the employees included in the run.
   * @returns The created {@link Payroll} record (status `pending`).
   * @throws {Error} If any employee id is invalid or the request fails.
   */
  create: (daoId: number, period: string, employee_ids: number[]) =>
    post<Payroll>(`/api/daos/${daoId}/payroll`, { period, employee_ids }),
  /**
   * Submit a multi-sig approval for a pending payroll run, as the DAO admin
   * identified by the bearer token.
   *
   * @param daoId - Numeric DAO identifier.
   * @param payrollId - Numeric payroll run identifier.
   * @returns The updated {@link Payroll} record.
   * @throws {Error} If the run is not pending, the caller is unauthorized, or the request fails.
   */
  approve: (daoId: number, payrollId: number) =>
    post<Payroll>(`/api/daos/${daoId}/payroll/${payrollId}/approve`, {}),
  /**
   * Execute an approved payroll run on-chain, as the DAO admin identified by
   * the bearer token.
   *
   * @param daoId - Numeric DAO identifier.
   * @param payrollId - Numeric payroll run identifier.
   * @returns The updated {@link Payroll} record (status `executed`).
   * @throws {Error} If the run is not approved, the threshold isn't met, or the request fails.
   */
  execute: (daoId: number, payrollId: number) =>
    post<Payroll>(`/api/daos/${daoId}/payroll/${payrollId}/execute`, {}),
  /**
   * Claim a payout from an executed payroll run, as the employee identified
   * by the bearer token.
   *
   * @param daoId - Numeric DAO identifier.
   * @param payrollId - Numeric payroll run identifier.
   * @param employee_id - Numeric id of the claiming employee.
   * @returns `{ success: true }` on success.
   * @throws {Error} If the run isn't executed, the caller isn't eligible, or the request fails.
   */
  claim: (daoId: number, payrollId: number, employee_id: number) =>
    post<{ success: boolean }>(`/api/daos/${daoId}/payroll/${payrollId}/claim`, {
      employee_id,
    }),
}

// ── Treasury ──────────────────────────────────────────────────────────────────

export const treasuryApi = {
  /**
   * Get the current treasury token balance for a DAO.
   *
   * @param daoId - Numeric DAO identifier.
   * @returns An object containing the numeric `balance`.
   * @throws {Error} If the DAO is not found or the request fails.
   */
  balance: (daoId: number) => get<{ balance: number }>(`/api/daos/${daoId}/treasury/balance`),
  /**
   * Deposit tokens into the DAO treasury, funded by the wallet identified by
   * the bearer token.
   *
   * @param daoId - Numeric DAO identifier.
   * @param token_address - Stellar asset/contract address being deposited.
   * @param amount - Amount of tokens to deposit (integer).
   * @returns `{ success: true }` on success.
   * @throws {Error} If the deposit is rejected or the request fails.
   */
  deposit: (daoId: number, token_address: string, amount: number) =>
    post<{ success: boolean }>(`/api/daos/${daoId}/treasury/deposit`, {
      token_address,
      amount,
    }),
}

// ── Proposals ─────────────────────────────────────────────────────────────────

export const proposalApi = {
  /**
   * List all governance proposals for a DAO.
   *
   * @param daoId - Numeric DAO identifier.
   * @returns An array of {@link Proposal} records.
   * @throws {Error} If the DAO is not found or the request fails.
   */
  list: (daoId: number) => get<Proposal[]>(`/api/daos/${daoId}/proposals`),
  /**
   * Create a new multi-sig governance proposal, proposed by the wallet
   * identified by the bearer token.
   *
   * @param daoId - Numeric DAO identifier.
   * @param target_address - Stellar address the proposal targets.
   * @param fn_name - Name of the contract function to invoke.
   * @param args - Stringified argument payload for the function.
   * @returns The created {@link Proposal} record.
   * @throws {Error} If validation fails or the backend rejects the proposal.
   */
  create: (daoId: number, target_address: string, fn_name: string, args: string) =>
    post<Proposal>(`/api/daos/${daoId}/proposals`, {
      target_address,
      function: fn_name,
      args,
    }),
  /**
   * Submit a multi-sig approval for a governance proposal, as the wallet
   * identified by the bearer token.
   *
   * @param daoId - Numeric DAO identifier.
   * @param proposalId - Numeric proposal identifier.
   * @returns `{ success: true }` on success.
   * @throws {Error} If the proposal isn't active, the caller is unauthorized, or the request fails.
   */
  approve: (daoId: number, proposalId: number) =>
    post<{ success: boolean }>(`/api/daos/${daoId}/proposals/${proposalId}/approve`, {}),
}
