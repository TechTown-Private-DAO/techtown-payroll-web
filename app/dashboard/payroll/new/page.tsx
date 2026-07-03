'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { useToast } from '@/contexts/ToastContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useEmployees, useCreatePayroll, usePayrolls, useApprovePayroll, useExecutePayroll } from '@/lib/hooks'
import { DollarSign, Loader2, ArrowLeft, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Payroll } from '@/lib/api'

function useCurrentDaoId() {
  const [id, setId] = useState<number | null>(null)
  useEffect(() => { setId(Number(localStorage.getItem('tt_dao_id') ?? '1')) }, [])
  return id
}

function statusColor(s: string) {
  if (s === 'executed') return 'bg-green-100 text-green-700'
  if (s === 'approved') return 'bg-blue-100 text-blue-700'
  if (s === 'pending') return 'bg-yellow-100 text-yellow-700'
  return 'bg-slate-100 text-slate-600'
}

export default function PayrollPage() {
  const { isConnected, address } = useWallet()
  const { toast } = useToast()
  const router = useRouter()
  const daoId = useCurrentDaoId()

  const employees    = useEmployees(daoId)
  const payrolls     = usePayrolls(daoId)
  const create       = useCreatePayroll(daoId ?? 1)
  const approve      = useApprovePayroll(daoId ?? 1)
  const execute      = useExecutePayroll(daoId ?? 1)

  const [step, setStep] = useState<'list' | 'new'>('list')
  const [selected, setSelected] = useState<number[]>([])
  const [period, setPeriod] = useState('')
  const [error, setError] = useState('')

  useEffect(() => { if (!isConnected) router.push('/') }, [isConnected, router])
  if (!isConnected) return null

  function toggleEmployee(id: number) {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (selected.length === 0) { setError('Select at least one employee'); return }
    try {
      await create.mutateAsync({ period: new Date(period).toISOString(), employee_ids: selected })
      setStep('list')
      setSelected([])
      setPeriod('')
      toast.success('Payroll created successfully')
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message ?? 'Failed to create payroll')
    }
  }

  const activeEmployees = employees.data?.filter(e => e.status === 'active') ?? []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/dashboard"><ArrowLeft className="w-5 h-5" /></Link>
          <span className="text-xl font-bold">Payroll</span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {step === 'list' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Payroll History</h1>
              <Button className="gap-2" onClick={() => setStep('new')}>
                <DollarSign className="w-4 h-4" />New Payroll
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6">
                {payrolls.isLoading && <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>}
                {!payrolls.isLoading && (payrolls.data?.length ?? 0) === 0 && (
                  <p className="text-slate-500 text-sm text-center py-8">No payrolls yet</p>
                )}
                <div className="space-y-3">
                  {(payrolls.data ?? []).map((p: Payroll) => (
                    <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-lg gap-3">
                      <div>
                        <p className="font-semibold">Payroll #{p.id}</p>
                        <p className="text-sm text-slate-500">
                          Period: {new Date(p.period).toLocaleDateString()} · {p.employee_count} employees
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm">{p.total_amount.toLocaleString()} XLM</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(p.status)}`}>
                          {p.status}
                        </span>
                        {p.status === 'pending' && address && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={approve.isPending}
                            onClick={() => approve.mutate(
                              { payrollId: p.id, approver_address: address },
                              {
                                onSuccess: () => toast.success('Payroll approved'),
                                onError: (err: any) => toast.error(err.message ?? 'Failed to approve payroll'),
                              },
                            )}
                          >
                            {approve.isPending ? <Loader2 className="animate-spin w-3 h-3" /> : 'Approve'}
                          </Button>
                        )}
                        {p.status === 'approved' && address && (
                          <Button
                            size="sm"
                            disabled={execute.isPending}
                            onClick={() => execute.mutate(
                              { payrollId: p.id, executor_address: address },
                              {
                                onSuccess: () => toast.success('Payroll executed successfully'),
                                onError: (err: any) => toast.error(err.message ?? 'Failed to execute payroll'),
                              },
                            )}
                          >
                            {execute.isPending ? <Loader2 className="animate-spin w-3 h-3" /> : 'Execute'}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {step === 'new' && (
          <>
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" onClick={() => setStep('list')}><ArrowLeft className="w-4 h-4" /></Button>
              <h1 className="text-2xl font-bold">New Payroll</h1>
            </div>

            <form onSubmit={handleCreate} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payroll Period</CardTitle>
                  <CardDescription>Select the period this payroll covers</CardDescription>
                </CardHeader>
                <CardContent>
                  <input
                    type="month"
                    className="border rounded-md px-3 py-2 text-sm"
                    value={period}
                    onChange={e => setPeriod(e.target.value + '-01')}
                    required
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Select Employees</CardTitle>
                  <CardDescription>Only active employees are shown</CardDescription>
                </CardHeader>
                <CardContent>
                  {employees.isLoading && <Loader2 className="animate-spin" />}
                  {activeEmployees.length === 0 && !employees.isLoading && (
                    <p className="text-slate-500 text-sm">No active employees. <Link href="/dashboard/employees" className="text-blue-600 underline">Add some first.</Link></p>
                  )}
                  <div className="space-y-2">
                    {activeEmployees.map(emp => (
                      <label
                        key={emp.id}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border ${
                          selected.includes(emp.id) ? 'border-blue-400 bg-blue-50' : 'border-transparent bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selected.includes(emp.id)}
                          onChange={() => toggleEmployee(emp.id)}
                          className="w-4 h-4"
                        />
                        <div>
                          <p className="font-mono text-xs">{emp.wallet_address.slice(0,8)}…{emp.wallet_address.slice(-6)}</p>
                          <p className="text-xs text-slate-500">{emp.department}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex gap-3">
                <Button type="submit" disabled={create.isPending}>
                  {create.isPending ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <DollarSign className="w-4 h-4 mr-2" />}
                  Create Payroll
                </Button>
                <Button type="button" variant="outline" onClick={() => setStep('list')}>Cancel</Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
