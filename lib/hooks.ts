import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  daoApi, employeeApi, payrollApi, treasuryApi, proposalApi, authApi,
  type DAO, type Employee, type Payroll, type Proposal,
} from '@/lib/api'

// ── DAO ───────────────────────────────────────────────────────────────────────

export function useDAO(id: number | null) {
  return useQuery({
    queryKey: ['dao', id],
    queryFn: () => daoApi.get(id!),
    enabled: id != null,
  })
}

export function useCreateDAO() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      name, symbol, multisig_threshold,
    }: { name: string; symbol: string; multisig_threshold: number }) =>
      daoApi.create(name, symbol, multisig_threshold),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['dao'] }),
  })
}

// ── Employees ─────────────────────────────────────────────────────────────────

export function useEmployees(daoId: number | null) {
  return useQuery({
    queryKey: ['employees', daoId],
    queryFn: () => employeeApi.list(daoId!),
    enabled: daoId != null,
  })
}

export function useAddEmployee(daoId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      wallet_address, department, salary,
    }: { wallet_address: string; department: string; salary: number }) =>
      employeeApi.add(daoId, wallet_address, department, salary),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees', daoId] }),
  })
}

export function useFreezeEmployee(daoId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (employeeId: number) => employeeApi.freeze(daoId, employeeId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees', daoId] }),
  })
}

export function useActivateEmployee(daoId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (employeeId: number) => employeeApi.activate(daoId, employeeId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees', daoId] }),
  })
}

export function useRemoveEmployee(daoId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (employeeId: number) => employeeApi.remove(daoId, employeeId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees', daoId] }),
  })
}

// ── Payroll ───────────────────────────────────────────────────────────────────

export function usePayrolls(daoId: number | null) {
  return useQuery({
    queryKey: ['payrolls', daoId],
    queryFn: () => payrollApi.list(daoId!),
    enabled: daoId != null,
  })
}

export function useCreatePayroll(daoId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ period, employee_ids }: { period: string; employee_ids: number[] }) =>
      payrollApi.create(daoId, period, employee_ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payrolls', daoId] }),
  })
}

export function useApprovePayroll(daoId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payrollId: number) => payrollApi.approve(daoId, payrollId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payrolls', daoId] }),
  })
}

export function useExecutePayroll(daoId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payrollId: number) => payrollApi.execute(daoId, payrollId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payrolls', daoId] }),
  })
}

// ── Treasury ──────────────────────────────────────────────────────────────────

export function useTreasuryBalance(daoId: number | null) {
  return useQuery({
    queryKey: ['treasury', daoId],
    queryFn: () => treasuryApi.balance(daoId!),
    enabled: daoId != null,
  })
}

export function useDeposit(daoId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      token_address, amount,
    }: { token_address: string; amount: number }) =>
      treasuryApi.deposit(daoId, token_address, amount),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['treasury', daoId] }),
  })
}

// ── Proposals ─────────────────────────────────────────────────────────────────

export function useProposals(daoId: number | null) {
  return useQuery({
    queryKey: ['proposals', daoId],
    queryFn: () => proposalApi.list(daoId!),
    enabled: daoId != null,
  })
}

export function useCreateProposal(daoId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      target_address, fn_name, args,
    }: { target_address: string; fn_name: string; args: string }) =>
      proposalApi.create(daoId, target_address, fn_name, args),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['proposals', daoId] }),
  })
}

export function useApproveProposal(daoId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (proposalId: number) => proposalApi.approve(daoId, proposalId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['proposals', daoId] }),
  })
}
