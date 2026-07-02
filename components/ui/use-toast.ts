import { useState, useCallback } from 'react'

type ToastVariant = 'default' | 'destructive'

interface ToastData {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
}

let toastHandlers: ((t: ToastData) => void)[] = []

export function toast(data: Omit<ToastData, 'id'>) {
  const id = Math.random().toString(36).slice(2)
  toastHandlers.forEach(h => h({ ...data, id }))
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const addToast = useCallback((t: ToastData) => {
    setToasts(prev => [...prev, t])
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), 4000)
  }, [])

  // Register handler once
  if (!toastHandlers.includes(addToast)) {
    toastHandlers.push(addToast)
  }

  return { toasts, toast }
}
