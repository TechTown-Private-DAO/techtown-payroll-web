'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { useToast } from '@/contexts/ToastContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useProposals, useCreateProposal, useApproveProposal } from '@/lib/hooks'
import { Loader2, ArrowLeft, Plus, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Proposal } from '@/lib/api'

function useCurrentDaoId() {
  const [id, setId] = useState<number | null>(null)
  useEffect(() => { setId(Number(localStorage.getItem('tt_dao_id') ?? '1')) }, [])
  return id
}

export default function ProposalsPage() {
  const { isConnected, address } = useWallet()
  const { toast } = useToast()
  const router = useRouter()
  const daoId = useCurrentDaoId()

  const proposals = useProposals(daoId)
  const create = useCreateProposal(daoId ?? 1)
  const approveProposal = useApproveProposal(daoId ?? 1)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ target_address: '', fn_name: '', args: '' })
  const [formError, setFormError] = useState('')

  useEffect(() => { if (!isConnected) router.push('/') }, [isConnected, router])
  if (!isConnected || !address) return null

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    try {
      await create.mutateAsync({
        proposer_address: address!,
        target_address: form.target_address,
        fn_name: form.fn_name,
        args: form.args,
      })
      setForm({ target_address: '', fn_name: '', args: '' })
      setShowForm(false)
      toast.success('Proposal submitted successfully')
    } catch (err: any) {
      setFormError(err.message)
      toast.error(err.message ?? 'Failed to create proposal')
    }
  }

  function statusColor(s: string) {
    if (s === 'executed' || s === 'approved') return 'bg-green-100 text-green-700'
    if (s === 'active') return 'bg-blue-100 text-blue-700'
    return 'bg-slate-100 text-slate-600'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/dashboard"><ArrowLeft className="w-5 h-5" /></Link>
          <span className="text-xl font-bold">Governance</span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Proposals</h1>
            <p className="text-slate-500 text-sm">Multisig governance for DAO decisions</p>
          </div>
          <Button onClick={() => setShowForm(v => !v)} className="gap-2">
            <Plus className="w-4 h-4" />New Proposal
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader><CardTitle>Create Proposal</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Target Contract Address</label>
                  <input
                    className="w-full border rounded-md px-3 py-2 text-sm font-mono"
                    placeholder="CABC…"
                    value={form.target_address}
                    onChange={e => setForm(f => ({ ...f, target_address: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Function Name</label>
                  <input
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    placeholder="execute_payroll"
                    value={form.fn_name}
                    onChange={e => setForm(f => ({ ...f, fn_name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Arguments (JSON)</label>
                  <textarea
                    className="w-full border rounded-md px-3 py-2 text-sm font-mono"
                    rows={3}
                    placeholder='{"payroll_id": 1}'
                    value={form.args}
                    onChange={e => setForm(f => ({ ...f, args: e.target.value }))}
                  />
                </div>
                {formError && <p className="text-red-500 text-sm">{formError}</p>}
                <div className="flex gap-3">
                  <Button type="submit" disabled={create.isPending}>
                    {create.isPending ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                    Submit
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-6">
            {proposals.isLoading && <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>}
            {!proposals.isLoading && (proposals.data?.length ?? 0) === 0 && (
              <p className="text-slate-500 text-sm text-center py-8">No proposals yet</p>
            )}
            <div className="space-y-4">
              {(proposals.data ?? []).map((p: Proposal) => (
                <div key={p.id} className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">Proposal #{p.id} — {p.function || '(no function)'}</p>
                      <p className="text-xs font-mono text-slate-500 mt-1">
                        Target: {p.target_address ? `${p.target_address.slice(0,10)}…` : 'n/a'}
                      </p>
                      {p.args && <p className="text-xs text-slate-400 mt-1 font-mono">{p.args}</p>}
                      <p className="text-xs text-slate-400 mt-2">
                        {p.approvals.length} approval(s) · {new Date(p.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(p.status)}`}>
                        {p.status}
                      </span>
                      {p.status === 'active' && !p.approvals.includes(address) && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={approveProposal.isPending}
                          onClick={() => approveProposal.mutate(
                            { proposalId: p.id, approver_address: address },
                            {
                              onSuccess: () => toast.success('Vote recorded'),
                              onError: (err: any) => toast.error(err.message ?? 'Failed to record vote'),
                            },
                          )}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />Vote
                        </Button>
                      )}
                      {p.status === 'active' && p.approvals.includes(address) && (
                        <span className="text-xs text-green-600">✓ Voted</span>
                      )}
                    </div>
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
