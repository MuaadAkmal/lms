'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/components/toast-provider'

export default function SignUpPage() {
  const [name, setName] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('EMPLOYEE')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { showSuccess, showError } = useToast()

  const validateForm = () => {
    if (!name.trim()) {
      showError('Please enter your full name.')
      setError('Please enter your full name.')
      return false
    }
    if (!employeeId.trim()) {
      showError('Please enter your employee ID.')
      setError('Please enter your employee ID.')
      return false
    }
    if (!email.trim()) {
      showError('Please enter your email address.')
      setError('Please enter your email address.')
      return false
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      showError('Please enter a valid email address.')
      setError('Please enter a valid email address.')
      return false
    }
    if (!password) {
      showError('Please enter a password.')
      setError('Please enter a password.')
      return false
    }
    if (password.length < 8) {
      showError('Password must be at least 8 characters long.')
      setError('Password must be at least 8 characters long.')
      return false
    }
    if (password !== confirmPassword) {
      showError('Passwords do not match.')
      setError('Passwords do not match.')
      return false
    }
    return true
  }

  const getDetailedErrorMessage = (error: any, data: any) => {
    // Handle specific error cases
    if (error?.details) {
      const details = error.details
      if (Array.isArray(details)) {
        const firstError = details[0]
        if (firstError?.code === 'form_identifier_exists') {
          return 'An account with this email or employee ID already exists.'
        }
        if (firstError?.code === 'form_password_pwned') {
          return 'This password has been found in a data breach. Please choose a different password.'
        }
        if (firstError?.code === 'form_param_format_invalid') {
          return 'Invalid format for one of the fields. Please check your input.'
        }
      }
    }

    // Handle server validation errors
    if (data?.error?.includes('unique constraint')) {
      if (data.error.includes('email')) {
        return 'An account with this email already exists.'
      }
      if (data.error.includes('employeeId')) {
        return 'An account with this employee ID already exists.'
      }
      return 'An account with these details already exists.'
    }

    // Return the error message or a generic fallback
    return data?.error || error?.message || 'Failed to create account. Please try again.'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          name: name.trim(), 
          employeeId: employeeId.trim(), 
          email: email.trim().toLowerCase(), 
          phone: phone.trim(), 
          password, 
          role 
        })
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        showSuccess('Account created successfully! Please sign in to continue.')
        // Small delay to let user read the success message
        setTimeout(() => {
          router.push('/sign-in')
        }, 1500)
      } else {
        const errorMessage = getDetailedErrorMessage(data, data)
        showError(errorMessage)
        setError(errorMessage)
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      
      let errorMessage = 'An unexpected error occurred. Please try again.'
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.'
      }
      
      showError(errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary-950 mb-2">
            Create your account
          </h2>
          <p className="text-primary-600">
            Join the Leave Management System
          </p>
        </div>
        
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-primary-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="Enter your full name"
                required
                disabled={isLoading}
              />
            </div>

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
                placeholder="Enter your employee ID"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="Enter your email address"
                required
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-primary-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter your password (min. 8 characters)"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-primary-700 mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="Confirm your password"
                required
                disabled={isLoading}
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
                disabled={isLoading}
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="SUPERVISOR">Supervisor</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-primary-600">
              Already have an account?{' '}
              <Link href="/sign-in" className="font-medium text-primary-950 hover:text-primary-800">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
