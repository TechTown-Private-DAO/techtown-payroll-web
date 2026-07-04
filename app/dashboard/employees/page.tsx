'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useEmployees, useAddEmployee, useFreezeEmployee, useActivateEmployee, useRemoveEmployee } from '@/lib/hooks'
import type { Employee } from '@/lib/api'
import { Users, Plus, UserX, UserCheck, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

function useCurrentDaoId() {
  const [id, setId] = useState<number | null>(null)
  useEffect(() => { setId(Number(localStorage.getItem('tt_dao_id') ?? '1')) }, [])
  return id
}

export default function EmployeesPage() {
  const { isConnected } = useWallet()
  const router = useRouter()
  const daoId = useCurrentDaoId()

  const employees = useEmployees(daoId)
  const addEmployee = useAddEmployee(daoId ?? 1)
  const freeze = useFreezeEmployee(daoId ?? 1)
  const activate = useActivateEmployee(daoId ?? 1)
  const remove = useRemoveEmployee(daoId ?? 1)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ wallet_address: '', department: '', salary: '' })
  const [formError, setFormError] = useState('')

  useEffect(() => { if (!isConnected) router.push('/') }, [isConnected, router])
  if (!isConnected) return null

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    if (form.wallet_address.length !== 56) { setFormError('Wallet must be a 56-char Stellar address'); return }
    try {
      await addEmployee.mutateAsync({ ...form, salary: Number(form.salary) })
      setForm({ wallet_address: '', department: '', salary: '' })
      setShowForm(false)
    } catch (err: any) { setFormError(err.message) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/dashboard"><ArrowLeft className="w-5 h-5" /></Link>
          <span className="text-xl font-bold">Employees</span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Team Members</h1>
            <p className="text-slate-500 text-sm">Manage contributors and their salary commitments</p>
          </div>
          <Button onClick={() => setShowForm(v => !v)} className="gap-2">
            <Plus className="w-4 h-4" />Add Employee
          </Button>
        </div>

        {/* Add Form */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader><CardTitle>New Employee</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Stellar Wallet Address</label>
                  <input
                    className="w-full border rounded-md px-3 py-2 text-sm font-mono"
                    placeholder="GABC…"
                    value={form.wallet_address}
                    onChange={e => setForm(f => ({ ...f, wallet_address: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Department</label>
                  <input
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    placeholder="Engineering"
                    value={form.department}
                    onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Monthly Salary (XLM stroops)</label>
                  <input
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    type="number"
                    placeholder="1000000000"
                    value={form.salary}
                    onChange={e => setForm(f => ({ ...f, salary: e.target.value }))}
                    required
                  />
                </div>
                {formError && <p className="text-red-500 text-sm">{formError}</p>}
                <div className="flex gap-3">
                  <Button type="submit" disabled={addEmployee.isPending}>
                    {addEmployee.isPending ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                    Add
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Employee List */}
        <Card>
          <CardContent className="pt-6">
            {employees.isLoading && <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>}
            {employees.isError && <p className="text-red-500 text-sm">Failed to load employees</p>}
            {!employees.isLoading && (employees.data?.length ?? 0) === 0 && (
              <p className="text-slate-500 text-sm text-center py-8">No employees yet. Add one above.</p>
            )}
            <div className="space-y-3">
              {(employees.data ?? []).map((emp: Employee) => (
                <div key={emp.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-lg gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                      {emp.department.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-mono text-xs">{emp.wallet_address.slice(0,8)}…{emp.wallet_address.slice(-6)}</p>
                      <p className="text-sm text-slate-500">{emp.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-12 sm:ml-0">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      emp.status === 'active' ? 'bg-green-100 text-green-700' :
                      emp.status === 'frozen' ? 'bg-slate-100 text-slate-600' :
                      'bg-red-100 text-red-700'
                    }`}>{emp.status}</span>
                    {emp.status === 'active' && (
                      <Button variant="ghost" size="sm" onClick={() => freeze.mutate(emp.id)}>
                        <UserX className="w-4 h-4" />
                      </Button>
                    )}
                    {emp.status === 'frozen' && (
                      <Button variant="ghost" size="sm" onClick={() => activate.mutate(emp.id)}>
                        <UserCheck className="w-4 h-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => {
                      if (confirm('Remove this employee?')) remove.mutate(emp.id)
                    }}>✕</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
