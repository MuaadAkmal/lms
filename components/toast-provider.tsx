'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

interface ToastContextType {
  showToast: (message: string, type?: Toast['type'], duration?: number) => void
  showSuccess: (message: string, duration?: number) => void
  showError: (message: string, duration?: number) => void
  showWarning: (message: string, duration?: number) => void
  showInfo: (message: string, duration?: number) => void
}

const ToastContext = React.createContext<ToastContextType | null>(null)

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    // Fallback to browser alerts if toast context is not available
    return {
      showToast: (message: string, type?: Toast['type']) => {
        const prefix = type === 'success' ? 'Success: ' : type === 'error' ? 'Error: ' : ''
        alert(prefix + message)
      },
      showSuccess: (message: string) => alert('Success: ' + message),
      showError: (message: string) => alert('Error: ' + message),
      showWarning: (message: string) => alert('Warning: ' + message),
      showInfo: (message: string) => alert('Info: ' + message),
    }
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [isMounted, setIsMounted] = useState(false)

  // Ensure this only runs on the client side
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const showToast = (message: string, type: Toast['type'] = 'info', duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9)
    const toast: Toast = { id, message, type, duration }

    setToasts(prev => [...prev, toast])

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration)
    }
  }

  const showSuccess = (message: string, duration = 4000) => showToast(message, 'success', duration)
  const showError = (message: string, duration = 6000) => showToast(message, 'error', duration)
  const showWarning = (message: string, duration = 5000) => showToast(message, 'warning', duration)
  const showInfo = (message: string, duration = 4000) => showToast(message, 'info', duration)

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showWarning, showInfo }}>
      {children}
      {isMounted && createPortal(
        <ToastContainer toasts={toasts} onRemove={removeToast} />,
        document.body
      )}
    </ToastContext.Provider>
  )
}

function ToastContainer({
  toasts,
  onRemove
}: {
  toasts: Toast[]
  onRemove: (id: string) => void
}) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

function ToastItem({
  toast,
  onRemove
}: {
  toast: Toast
  onRemove: (id: string) => void
}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 10)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onRemove(toast.id), 300) // Wait for animation
  }

  const getToastStyles = () => {
    const baseStyles = "min-w-80 max-w-md p-4 rounded-lg shadow-strong border transform transition-all duration-300 ease-in-out"

    if (!isVisible) {
      return `${baseStyles} translate-x-full opacity-0`
    }

    switch (toast.type) {
      case 'success':
        return `${baseStyles} bg-green-50 border-green-200 text-green-800`
      case 'error':
        return `${baseStyles} bg-red-50 border-red-200 text-red-800`
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-200 text-yellow-800`
      default:
        return `${baseStyles} bg-blue-50 border-blue-200 text-blue-800`
    }
  }

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      default:
        return 'ℹ️'
    }
  }

  return (
    <div className={getToastStyles()}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-lg">{getIcon()}</span>
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
        <button
          onClick={handleClose}
          className="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
        >
          <span className="text-lg">×</span>
        </button>
      </div>
    </div>
  )
}
