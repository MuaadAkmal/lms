'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { completeUserRegistration } from '@/lib/user-actions'
import { useToast } from '@/components/toast-provider'

export function CompleteRegistration() {
  const [employeeId, setEmployeeId] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('EMPLOYEE')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const router = useRouter()
  const { showSuccess, showError } = useToast()

  const validateForm = () => {
    if (!employeeId.trim()) {
      showError('Employee ID is required.')
      setError('Employee ID is required.')
      return false
    }
    
    // Basic employee ID format validation
    if (employeeId.trim().length < 3) {
      showError('Employee ID must be at least 3 characters long.')
      setError('Employee ID must be at least 3 characters long.')
      return false
    }

    // Phone number validation if provided
    if (phone.trim() && !/^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      showError('Please enter a valid phone number.')
      setError('Please enter a valid phone number.')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setError('')

    startTransition(async () => {
      try {
        const result = await completeUserRegistration({
          employeeId: employeeId.trim(),
          phone: phone.trim(),
          role
        })

        if (result.success) {
          showSuccess('Registration completed successfully! Redirecting to dashboard...')
          // Small delay to let user read the success message
          setTimeout(() => {
            router.refresh()
          }, 1500)
        } else {
          showError(result.error || 'Failed to complete registration. Please try again.')
          setError(result.error || 'Failed to complete registration. Please try again.')
        }
      } catch (error: any) {
        console.error('Registration error:', error)
        
        let errorMessage = 'Failed to complete registration. Please try again.'
        
        // Handle specific error types
        if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
          if (error.message?.includes('employeeId')) {
            errorMessage = 'This employee ID is already in use. Please choose a different one.'
          } else {
            errorMessage = 'This information is already in use. Please check your details.'
          }
        } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.'
        } else if (error.message?.includes('unauthorized') || error.message?.includes('authentication')) {
          errorMessage = 'Authentication error. Please sign out and sign in again.'
        }
        
        showError(errorMessage)
        setError(errorMessage)
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-strong p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-primary-950 mb-2">
            Complete Your Profile
          </h2>
          <p className="text-primary-600">
            Please provide additional information to set up your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="employeeId" className="block text-sm font-medium text-primary-700 mb-1">
              Employee ID *
            </label>
            <input
              type="text"
              id="employeeId"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="input-field"
              placeholder="e.g., EMP001"
              required
              disabled={isPending}
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-primary-700 mb-1">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-field"
              placeholder="+1 (555) 123-4567"
              disabled={isPending}
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-primary-700 mb-1">
              Role *
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input-field"
              required
              disabled={isPending}
            >
              <option value="EMPLOYEE">Employee</option>
              <option value="SUPERVISOR">Supervisor</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Completing Registration...' : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  )
}
