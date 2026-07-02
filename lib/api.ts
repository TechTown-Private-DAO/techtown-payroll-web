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

// ── auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (wallet_address: string, signature: string, message: string) =>
    post<AuthResponse>('/api/auth/login', { wallet_address, signature, message }),
  register: (wallet_address: string, username: string, email?: string) =>
    post<AuthResponse>('/api/auth/register', { wallet_address, username, email }),
  refresh: (token: string) =>
    post<AuthResponse>('/api/auth/refresh', { token }),
}

// ── DAO ───────────────────────────────────────────────────────────────────────

export const daoApi = {
  create: (name: string, symbol: string, admin_address: string, multisig_threshold: number) =>
    post<DAO>('/api/daos', { name, symbol, admin_address, multisig_threshold }),
  get: (id: number) => get<DAO>(`/api/daos/${id}`),
}

// ── Employees ─────────────────────────────────────────────────────────────────

export const employeeApi = {
  list: (daoId: number) => get<Employee[]>(`/api/daos/${daoId}/employees`),
  add: (daoId: number, wallet_address: string, department: string, salary: number) =>
    post<Employee>(`/api/daos/${daoId}/employees`, {
      wallet_address,
      department,
      salary,
      randomness: Array.from({ length: 32 }, () => Math.floor(Math.random() * 256)),
    }),
  freeze: (daoId: number, employeeId: number) =>
    put<{ success: boolean }>(`/api/daos/${daoId}/employees/${employeeId}`, { action: 'freeze' }),
  activate: (daoId: number, employeeId: number) =>
    put<{ success: boolean }>(`/api/daos/${daoId}/employees/${employeeId}`, { action: 'activate' }),
  remove: (daoId: number, employeeId: number) =>
    del<{ success: boolean }>(`/api/daos/${daoId}/employees/${employeeId}`),
}

// ── Payroll ───────────────────────────────────────────────────────────────────

export const payrollApi = {
  list: (daoId: number) => get<Payroll[]>(`/api/daos/${daoId}/payroll`),
  create: (daoId: number, period: string, employee_ids: number[]) =>
    post<Payroll>(`/api/daos/${daoId}/payroll`, { period, employee_ids }),
  approve: (daoId: number, payrollId: number, approver_address: string) =>
    post<Payroll>(`/api/daos/${daoId}/payroll/${payrollId}/approve`, { approver_address }),
  execute: (daoId: number, payrollId: number, executor_address: string) =>
    post<Payroll>(`/api/daos/${daoId}/payroll/${payrollId}/execute`, { executor_address }),
  claim: (daoId: number, payrollId: number, employee_id: number, employee_address: string) =>
    post<{ success: boolean }>(`/api/daos/${daoId}/payroll/${payrollId}/claim`, {
      employee_id,
      employee_address,
    }),
}

// ── Treasury ──────────────────────────────────────────────────────────────────

export const treasuryApi = {
  balance: (daoId: number) => get<{ balance: number }>(`/api/daos/${daoId}/treasury/balance`),
  deposit: (daoId: number, token_address: string, from_address: string, amount: number) =>
    post<{ success: boolean }>(`/api/daos/${daoId}/treasury/deposit`, {
      token_address,
      from_address,
      amount,
    }),
}

// ── Proposals ─────────────────────────────────────────────────────────────────

export const proposalApi = {
  list: (daoId: number) => get<Proposal[]>(`/api/daos/${daoId}/proposals`),
  create: (daoId: number, proposer_address: string, target_address: string, fn_name: string, args: string) =>
    post<Proposal>(`/api/daos/${daoId}/proposals`, {
      proposer_address,
      target_address,
      function: fn_name,
      args,
    }),
  approve: (daoId: number, proposalId: number, approver_address: string) =>
    post<{ success: boolean }>(`/api/daos/${daoId}/proposals/${proposalId}/approve`, { approver_address }),
}
