'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Settings,
  History,
  Wallet,
  TrendingUp,
  BarChart,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { isConnected, address } = useWallet()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isConnected) {
      router.push('/')
    }
    setLoading(false)
  }, [isConnected, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isConnected) {
    return null
  }

  // Mock data - in production, fetch from API
  const daoStats = {
    totalEmployees: 12,
    totalPaid: '$45,230.00',
    pendingPayroll: '$12,500.00',
    upcomingPayroll: '3 days',
  }

  const recentPayrolls = [
    { id: 1, date: '2024-01-15', amount: '$12,450.00', status: 'completed' },
    { id: 2, date: '2024-01-01', amount: '$11,780.00', status: 'completed' },
    { id: 3, date: '2023-12-15', amount: '$10,000.00', status: 'pending' },
  ]

  const employees = [
    { id: 1, name: 'Alice Johnson', department: 'Engineering', status: 'active' },
    { id: 2, name: 'Bob Smith', department: 'Design', status: 'active' },
    { id: 3, name: 'Carol White', department: 'Marketing', status: 'frozen' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-xl font-bold text-slate-800">
                TechTown
              </Link>
              <Badge variant="secondary">Private DAO</Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Wallet className="w-4 h-4" />
                <span className="font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
              </div>
              <Button variant="outline" size="sm">Settings</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { icon: Users, label: 'Employees', value: daoStats.totalEmployees, color: 'text-blue-600' },
            { icon: DollarSign, label: 'Total Paid', value: daoStats.totalPaid, color: 'text-green-600' },
            { icon: Clock, label: 'Pending Payroll', value: daoStats.pendingPayroll, color: 'text-yellow-600' },
            { icon: TrendingUp, label: 'Next Payroll', value: daoStats.upcomingPayroll, color: 'text-purple-600' },
          ].map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="payroll">
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="payroll">Payroll</TabsTrigger>
                  <TabsTrigger value="employees">Employees</TabsTrigger>
                  <TabsTrigger value="treasury">Treasury</TabsTrigger>
                </TabsList>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  New Payroll
                </Button>
              </div>

              <TabsContent value="payroll">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Payrolls</CardTitle>
                    <CardDescription>View and manage your payroll history</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentPayrolls.map((payroll) => (
                        <div key={payroll.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                          <div>
                            <p className="font-medium">{payroll.date}</p>
                            <p className="text-sm text-slate-500">Payroll #{payroll.id}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <p className="font-semibold">{payroll.amount}</p>
                            <Badge 
                              variant={payroll.status === 'completed' ? 'success' : 'warning'}
                            >
                              {payroll.status}
                            </Badge>
                            <Button variant="ghost" size="sm">View</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="employees">
                <Card>
                  <CardHeader>
                    <CardTitle>Employees</CardTitle>
                    <CardDescription>Manage your team members</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {employees.map((employee) => (
                        <div key={employee.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                          <div>
                            <p className="font-medium">{employee.name}</p>
                            <p className="text-sm text-slate-500">{employee.department}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge 
                              variant={employee.status === 'active' ? 'success' : 'secondary'}
                            >
                              {employee.status}
                            </Badge>
                            <Button variant="ghost" size="sm">View</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="treasury">
                <Card>
                  <CardHeader>
                    <CardTitle>Treasury</CardTitle>
                    <CardDescription>Manage your DAO treasury</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <p className="text-sm text-slate-500">Total Balance</p>
                          <p className="text-2xl font-bold">$126,450.00</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <p className="text-sm text-slate-500">Locked</p>
                          <p className="text-2xl font-bold">$12,500.00</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <Button className="flex-1">Deposit</Button>
                        <Button variant="outline" className="flex-1">Withdraw</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start gap-2">
                  <DollarSign className="w-4 h-4" />
                  Run Payroll
                </Button>
                <Button className="w-full justify-start gap-2" variant="outline">
                  <Users className="w-4 h-4" />
                  Add Employee
                </Button>
                <Button className="w-full justify-start gap-2" variant="outline">
                  <Settings className="w-4 h-4" />
                  DAO Settings
                </Button>
                <Button className="w-full justify-start gap-2" variant="outline">
                  <BarChart className="w-4 h-4" />
                  Analytics
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-medium">Payroll in 3 days</p>
                      <p className="text-sm text-slate-500">12 employees</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Proposal to review</p>
                      <p className="text-sm text-slate-500">2 signatures needed</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}