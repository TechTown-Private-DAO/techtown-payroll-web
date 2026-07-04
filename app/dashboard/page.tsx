'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import {
  Users, DollarSign, Clock, CheckCircle, AlertCircle,
  Plus, Wallet, TrendingUp, Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEmployees, usePayrolls, useTreasuryBalance, useProposals } from '@/lib/hooks'
import type { Employee, Payroll, Proposal } from '@/lib/api'

function useCurrentDaoId() {
  const [daoId, setDaoId] = useState<number | null>(null)
  useEffect(() => {
    const stored = localStorage.getItem('tt_dao_id')
    setDaoId(stored ? Number(stored) : 1)
  }, [])
  return daoId
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
    executed:  'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
    approved:  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    pending:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
    active:    'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
    frozen:    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    rejected:  'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] ?? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
      {status}
    </span>
  )
}

export default function DashboardPage() {
  const { isConnected, address, disconnect } = useWallet()
  const router = useRouter()
  const daoId = useCurrentDaoId()

  const employees  = useEmployees(daoId)
  const payrolls   = usePayrolls(daoId)
  const treasury   = useTreasuryBalance(daoId)
  const proposals  = useProposals(daoId)

  useEffect(() => {
    if (!isConnected) router.push('/')
  }, [isConnected, router])

  if (!isConnected) return null

  const activeEmployees = employees.data?.filter((e: Employee) => e.status === 'active').length ?? 0
  const pendingPayrolls = payrolls.data?.filter((p: Payroll) => p.status === 'pending') ?? []
  const latestPayrolls  = payrolls.data?.slice(0, 5) ?? []
  const pendingProps    = proposals.data?.filter((p: Proposal) => p.status === 'active').length ?? 0
  const balance         = treasury.data?.balance ?? 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-bold text-slate-800 dark:text-slate-100">TechTown</Link>
            <Badge variant="secondary">Private DAO</Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono text-slate-500 dark:text-slate-400">
              {address?.slice(0, 6)}…{address?.slice(-4)}
            </span>
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={disconnect}>Disconnect</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Active Employees</p>
                <p className="text-2xl font-bold">
                  {employees.isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : activeEmployees}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Treasury Balance</p>
                <p className="text-2xl font-bold">
                  {treasury.isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : `${balance.toLocaleString()} XLM`}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Pending Payrolls</p>
                <p className="text-2xl font-bold">
                  {payrolls.isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : pendingPayrolls.length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Open Proposals</p>
                <p className="text-2xl font-bold">
                  {proposals.isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : pendingProps}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Payrolls */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Payrolls</CardTitle>
                  <CardDescription>Last 5 payroll runs</CardDescription>
                </div>
                <Link href="/dashboard/payroll/new">
                  <Button size="sm" className="gap-1"><Plus className="w-4 h-4" />New</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {payrolls.isLoading && <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>}
                {payrolls.isError && <p className="text-red-500 text-sm">Failed to load payrolls</p>}
                {!payrolls.isLoading && latestPayrolls.length === 0 && (
                  <p className="text-slate-500 dark:text-slate-400 text-sm py-4 text-center">No payrolls yet</p>
                )}
                <div className="space-y-3">
                  {latestPayrolls.map((p: Payroll) => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">Payroll #{p.id}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(p.period).toLocaleDateString()} · {p.employee_count} employees
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-sm">{p.total_amount.toLocaleString()} XLM</span>
                        <StatusBadge status={p.status} />
                        <Link href={`/dashboard/payroll/${p.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Employees Preview */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Team</CardTitle>
                  <CardDescription>Recent employee activity</CardDescription>
                </div>
                <Link href="/dashboard/employees">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {employees.isLoading && <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>}
                <div className="space-y-3">
                  {(employees.data ?? []).slice(0, 4).map((emp: Employee) => (
                    <div key={emp.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <div>
                        <p className="font-mono text-xs">{emp.wallet_address.slice(0,8)}…{emp.wallet_address.slice(-6)}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{emp.department}</p>
                      </div>
                      <StatusBadge status={emp.status} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <Link href="/dashboard/payroll/new" className="block">
                  <Button className="w-full justify-start gap-2">
                    <DollarSign className="w-4 h-4" />Run Payroll
                  </Button>
                </Link>
                <Link href="/dashboard/employees" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Users className="w-4 h-4" />Manage Employees
                  </Button>
                </Link>
                <Link href="/dashboard/treasury" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Wallet className="w-4 h-4" />Treasury
                  </Button>
                </Link>
                <Link href="/dashboard/proposals" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <CheckCircle className="w-4 h-4" />Proposals
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Alerts */}
            <Card>
              <CardHeader><CardTitle>Alerts</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {pendingPayrolls.length > 0 && (
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-yellow-800 dark:text-yellow-300">
                        {pendingPayrolls.length} payroll(s) need approval
                      </p>
                    </div>
                  </div>
                )}
                {pendingProps > 0 && (
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-blue-800 dark:text-blue-300">
                        {pendingProps} proposal(s) awaiting vote
                      </p>
                    </div>
                  </div>
                )}
                {pendingPayrolls.length === 0 && pendingProps === 0 && (
                  <p className="text-slate-500 dark:text-slate-400 text-sm text-center py-2">No pending actions</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
