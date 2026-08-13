'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  isConnected as freighterIsConnected,
  getPublicKey,
  signTransaction,
  signMessage,
} from '@stellar/freighter-api'
import { authApi } from '@/lib/api'
import { toast } from '@/components/ui/use-toast'

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

function networkPassphrase(network: 'mainnet' | 'testnet') {
  return network === 'testnet'
    ? 'Test SDF Network ; September 2015'
    : 'Public Global Stellar Network ; September 2015'
}

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

  const connect = useCallback(async () => {
    try {
      const connected = await freighterIsConnected()
      if (!connected) {
        toast({
          title: 'Freighter not found',
          description: 'Install the Freighter wallet extension from freighter.app to continue.',
          variant: 'destructive',
        })
        return
      }
      const pk = await getPublicKey()

      // Prove key ownership: sign a one-time server-issued challenge, then
      // exchange the signature for a session token.
      const { message } = await authApi.challenge(pk)
      const signResult = await signMessage(message, { networkPassphrase: networkPassphrase(network) })
      // freighter-api's signMessage return shape has varied across versions
      // (a plain base64 string vs. an object) — handle both defensively.
      const signedMessage =
        typeof signResult === 'string' ? signResult : (signResult as { signedMessage: string }).signedMessage
      const auth = await authApi.login(pk, signedMessage, message)
      localStorage.setItem('tt_token', auth.token)

      setAddress(pk)
      setIsConnected(true)
    } catch (err: any) {
      console.error('Wallet connect failed:', err)
      toast({
        title: 'Connection failed',
        description: err?.message ?? 'Failed to connect wallet. Please try again.',
        variant: 'destructive',
      })
    }
  }, [network])

  const disconnect = useCallback(() => {
    localStorage.removeItem('tt_token')
    setAddress(null)
    setIsConnected(false)
  }, [])

  const switchNetwork = useCallback((n: 'mainnet' | 'testnet') => {
    setNetwork(n)
  }, [])

  const signTx = useCallback(
    async (xdr: string) => {
      const result = await signTransaction(xdr, { networkPassphrase: networkPassphrase(network) })
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
