'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { isConnected, setAllowed } from '@stellar/freighter-api'
import { toast } from '@/components/ui/use-toast'

interface WalletContextType {
  isConnected: boolean
  address: string | null
  connect: () => Promise<void>
  disconnect: () => void
  network: 'mainnet' | 'testnet'
  switchNetwork: (network: 'mainnet' | 'testnet') => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [network, setNetwork] = useState<'mainnet' | 'testnet'>('testnet')

  const connect = async () => {
    try {
      // Check if Freighter is installed
      if (typeof window === 'undefined' || !window.freighter) {
        toast({
          title: 'Freighter not found',
          description: 'Please install the Freighter wallet extension.',
          variant: 'destructive',
        })
        return
      }

      const response = await window.freighter.getPublicKey()
      setAddress(response)
      setIsConnected(true)
      
      toast({
        title: 'Wallet Connected',
        description: `Connected to ${response.slice(0, 8)}...${response.slice(-8)}`,
      })
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect wallet. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const disconnect = () => {
    setIsConnected(false)
    setAddress(null)
    toast({
      title: 'Wallet Disconnected',
      description: 'Your wallet has been disconnected.',
    })
  }

  const switchNetwork = (newNetwork: 'mainnet' | 'testnet') => {
    setNetwork(newNetwork)
    toast({
      title: 'Network Switched',
      description: `Switched to ${newNetwork}`,
    })
  }

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address,
        connect,
        disconnect,
        network,
        switchNetwork,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

// Add Freighter type declarations
declare global {
  interface Window {
    freighter: {
      getPublicKey: () => Promise<string>
      isConnected: () => Promise<boolean>
      signTransaction: (tx: any, network: string) => Promise<any>
      signMessage: (message: string, network: string) => Promise<string>
    }
  }
}