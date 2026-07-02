'use client'

import { useEffect } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, Lock, Zap, Users, DollarSign, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const { isConnected, connect } = useWallet()

  const features = [
    {
      icon: Shield,
      title: 'Zero-Knowledge Privacy',
      description: 'Keep salary amounts confidential while proving compliance on-chain',
    },
    {
      icon: Lock,
      title: 'Secure Payroll',
      description: 'Multi-signature approvals and treasury management built-in',
    },
    {
      icon: Zap,
      title: 'Decentralized',
      description: 'Fully on-chain with Stellar/Soroban smart contracts',
    },
    {
      icon: Users,
      title: 'DAO Ready',
      description: 'Built for DAOs, startups, and open-source organizations',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Navigation */}
      <nav className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-slate-800">TechTown</span>
            <span className="text-sm font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Private DAO</span>
          </div>
          <div className="flex items-center gap-4">
            {isConnected ? (
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <Button onClick={connect}>Connect Wallet</Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6">
              <Lock className="w-4 h-4" />
              Confidential Payroll on Stellar
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-slate-900 mb-6"
          >
            Private Payroll for
            <span className="text-blue-600"> DAOs</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto"
          >
            Pay your contributors on Stellar while keeping salary amounts confidential
            using Zero-Knowledge Proofs. Fully open-source and decentralized.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            {!isConnected && (
              <Button size="lg" onClick={connect} className="gap-2">
                Connect Wallet
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            <Link href="/docs">
              <Button size="lg" variant="outline">
                Documentation
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Why TechTown Private DAO?
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Everything you need for confidential payroll management on-chain
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Transactions Processed', value: '2.4K+' },
            { label: 'Active DAOs', value: '127' },
            { label: 'Contributors Paid', value: '1,853' },
            { label: 'Total Volume', value: '$4.2M' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                  <div className="text-sm text-slate-600">{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to get started?
            </h2>
            <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
              Join the future of confidential DAO payroll. Connect your wallet and
              start managing payroll with zero-knowledge privacy.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              {!isConnected && (
                <Button 
                  size="lg" 
                  variant="secondary" 
                  onClick={connect}
                  className="gap-2"
                >
                  Connect Wallet
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
              <Link href="/docs">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                  Read Docs
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold">TechTown Private DAO</span>
              <span className="text-sm text-slate-500">© 2024</span>
            </div>
            <div className="flex gap-6 text-sm text-slate-600">
              <a href="#" className="hover:text-slate-900">Terms</a>
              <a href="#" className="hover:text-slate-900">Privacy</a>
              <a href="#" className="hover:text-slate-900">GitHub</a>
              <a href="#" className="hover:text-slate-900">Twitter</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}