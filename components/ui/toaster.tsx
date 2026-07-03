'use client'

import { X } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'
import type { ToastVariant } from '@/contexts/ToastContext'
import { ToastProvider, ToastViewport, Toast, ToastDescription } from '@/components/ui/toast'

function variantMap(v: ToastVariant): 'default' | 'destructive' | 'success' {
  if (v === 'success') return 'success'
  if (v === 'error') return 'destructive'
  return 'default'
}

export function Toaster() {
  const { toasts, exitingIds, dismiss } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, message, variant }) => (
        <Toast
          key={id}
          variant={variantMap(variant)}
          open
          className={exitingIds.has(id) ? 'toast-exit' : 'toast-enter'}
        >
          <ToastDescription className="flex-1">{message}</ToastDescription>
          <button
            aria-label="Close notification"
            onClick={() => dismiss(id)}
            className="ml-2 shrink-0 rounded-full p-1 opacity-70 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <X className="w-4 h-4" />
          </button>
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
