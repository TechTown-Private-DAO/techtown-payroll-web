'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { useToast } from '@/contexts/ToastContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useTreasuryBalance, useDeposit } from '@/lib/hooks'
import { Loader2, ArrowLeft, Wallet, ArrowDownCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// USDC on Stellar testnet
const USDC_TESTNET = 'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA'

function useCurrentDaoId() {
  const [id, setId] = useState<number | null>(null)
  useEffect(() => { setId(Number(localStorage.getItem('tt_dao_id') ?? '1')) }, [])
  return id
}

export default function TreasuryPage() {
  const { isConnected, address } = useWallet()
  const { toast } = useToast()
  const router = useRouter()
  const daoId = useCurrentDaoId()

  const balance = useTreasuryBalance(daoId)
  const deposit = useDeposit(daoId ?? 1)

  const [showDeposit, setShowDeposit] = useState(false)
  const [amount, setAmount] = useState('')
  const [tokenAddress, setTokenAddress] = useState(USDC_TESTNET)
  const [error, setError] = useState('')

  useEffect(() => { if (!isConnected) router.push('/') }, [isConnected, router])
  if (!isConnected || !address) return null

  async function handleDeposit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await deposit.mutateAsync({
        token_address: tokenAddress,
        from_address: address!,
        amount: Number(amount),
      })
      setAmount('')
      setShowDeposit(false)
      balance.refetch()
      toast.success('Deposit recorded successfully')
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message ?? 'Failed to process deposit')
    }
  }

  const bal = balance.data?.balance ?? 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/dashboard"><ArrowLeft className="w-5 h-5" /></Link>
          <span className="text-xl font-bold">Treasury</span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Balance Card */}
        <Card className="mb-6">
          <CardContent className="pt-8 pb-8 text-center">
            <Wallet className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <p className="text-sm text-slate-500 mb-1">Total Balance</p>
            {balance.isLoading ? (
              <Loader2 className="animate-spin w-6 h-6 mx-auto" />
            ) : (
              <p className="text-4xl font-bold">{bal.toLocaleString()} <span className="text-slate-400 text-2xl">stroops</span></p>
            )}
            <p className="text-sm text-slate-400 mt-1">≈ {(bal / 10_000_000).toFixed(2)} XLM</p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 mb-6">
          <Button className="flex-1 gap-2" onClick={() => setShowDeposit(v => !v)}>
            <ArrowDownCircle className="w-4 h-4" />Deposit
          </Button>
          <Button variant="outline" className="flex-1" disabled>
            Withdraw (multisig required)
          </Button>
        </div>

        {/* Deposit Form */}
        {showDeposit && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Deposit Funds</CardTitle>
              <CardDescription>
                Record a deposit to the DAO treasury. In production this triggers a Stellar token transfer.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDeposit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Token Address</label>
                  <input
                    className="w-full border rounded-md px-3 py-2 text-sm font-mono"
                    value={tokenAddress}
                    onChange={e => setTokenAddress(e.target.value)}
                  />
                  <p className="text-xs text-slate-400 mt-1">Default: USDC testnet</p>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Amount (stroops)</label>
                  <input
                    type="number"
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    placeholder="10000000 (= 1 XLM)"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    required
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="flex gap-3">
                  <Button type="submit" disabled={deposit.isPending}>
                    {deposit.isPending ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                    Confirm Deposit
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowDeposit(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Info */}
        <Card>
          <CardHeader><CardTitle>About Treasury</CardTitle></CardHeader>
          <CardContent className="text-sm text-slate-600 space-y-2">
            <p>The treasury holds USDC and XLM on Stellar. Funds are locked per payroll run and released to employees on claim.</p>
            <p>Withdrawals require multisig approval matching the DAO threshold. Create a proposal on the <Link href="/dashboard/proposals" className="text-blue-600 underline">Proposals</Link> page.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
