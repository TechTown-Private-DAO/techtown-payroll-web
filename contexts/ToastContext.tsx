'use client'
import React, { createContext, useContext, useState, useCallback, useRef } from 'react'

export type ToastVariant = 'success' | 'error' | 'default'

export interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastContextType {
  toasts: ToastItem[]
  exitingIds: Set<string>
  dismiss: (id: string) => void
  toast: {
    success: (message: string) => void
    error: (message: string) => void
    show: (message: string, variant?: ToastVariant) => void
  }
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

const EXIT_DURATION_MS = 300

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [exitingIds, setExitingIds] = useState<Set<string>>(new Set())
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const startExit = useCallback((id: string) => {
    setExitingIds(prev => new Set(prev).add(id))
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
      setExitingIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }, EXIT_DURATION_MS)
  }, [])

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id)
    if (timer !== undefined) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
    startExit(id)
  }, [startExit])

  const show = useCallback(
    (message: string, variant: ToastVariant = 'default') => {
      const id = Math.random().toString(36).slice(2)
      setToasts(prev => [...prev, { id, message, variant }])

      const timer = setTimeout(() => {
        timers.current.delete(id)
        startExit(id)
      }, 5000)
      timers.current.set(id, timer)
    },
    [startExit],
  )

  const toast = {
    success: (message: string) => show(message, 'success'),
    error: (message: string) => show(message, 'error'),
    show,
  }

  return (
    <ToastContext.Provider value={{ toasts, exitingIds, dismiss, toast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
  return ctx
}
