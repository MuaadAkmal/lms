'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { completeUserRegistration } from '@/lib/user-actions'

export default function OnboardingPage() {
  const { user, isLoaded } = useUser()
  const [employeeId, setEmployeeId] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('EMPLOYEE')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const router = useRouter()

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  if (!user) {
    router.push('/sign-in')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!employeeId.trim()) {
      setError('Employee ID is required')
      return
    }

    setError('')
    startTransition(async () => {
      try {
        await completeUserRegistration({
          employeeId: employeeId.trim(),
          phone: phone.trim(),
          role
        })

        router.push('/dashboard')
      } catch (error) {
        console.error('Error completing registration:', error)
        setError('Failed to complete registration. Please try again.')
      }
    })
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary-950 mb-2">
            Complete Your Profile
          </h2>
          <p className="text-primary-600">
            Welcome {user.firstName}! Please provide some additional information.
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
              {isPending ? 'Completing Profile...' : 'Complete Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
