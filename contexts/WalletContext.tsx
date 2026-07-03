'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  isConnected as freighterIsConnected,
  getPublicKey,
  signTransaction,
} from '@stellar/freighter-api'
import { useToast } from '@/contexts/ToastContext'

interface WalletContextType {
  isConnected: boolean
  address: string | null
  network: 'mainnet' | 'testnet'
  connect: () => Promise<void>
  disconnect: () => void
  switchNetwork: (n: 'mainnet' | 'testnet') => void
  signTx: (xdr: string) => Promise<string>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [network, setNetwork] = useState<'mainnet' | 'testnet'>('testnet')

  // Re-hydrate on mount (user may have already approved Freighter)
  useEffect(() => {
    const restore = async () => {
      try {
        const connected = await freighterIsConnected()
        if (connected) {
          const pk = await getPublicKey()
          setAddress(pk)
          setIsConnected(true)
        }
      } catch {
        // Freighter not installed — silently ignore
      }
    }
    restore()
  }, [])

  const { toast } = useToast()

  const connect = useCallback(async () => {
    try {
      const connected = await freighterIsConnected()
      if (!connected) {
        toast.error('Please install the Freighter wallet extension from https://freighter.app/')
        return
      }
      const pk = await getPublicKey()
      setAddress(pk)
      setIsConnected(true)
    } catch (err: any) {
      console.error('Wallet connect failed:', err)
      toast.error('Failed to connect wallet. Please try again.')
    }
  }, [toast])

  const disconnect = useCallback(() => {
    setAddress(null)
    setIsConnected(false)
  }, [])

  const switchNetwork = useCallback((n: 'mainnet' | 'testnet') => {
    setNetwork(n)
  }, [])

  const signTx = useCallback(
    async (xdr: string) => {
      const networkPassphrase =
        network === 'testnet'
          ? 'Test SDF Network ; September 2015'
          : 'Public Global Stellar Network ; September 2015'
      const result = await signTransaction(xdr, { networkPassphrase })
      return result
    },
    [network],
  )

  return (
    <WalletContext.Provider
      value={{ isConnected, address, network, connect, disconnect, switchNetwork, signTx }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used within WalletProvider')
  return ctx
}
