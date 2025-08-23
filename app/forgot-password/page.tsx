'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function ForgotPasswordPage() {
  const [employeeId, setEmployeeId] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!employeeId || !oldPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.')
      return
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.')
      return
    }

    if (oldPassword === newPassword) {
      setError('New password must be different from old password.')
      return
    }

    setIsLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: employeeId.trim(),
          oldPassword,
          newPassword
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message)
        // Clear form
        setEmployeeId('')
        setOldPassword('')
        setNewPassword('')
        setConfirmPassword('')
        // Redirect to sign in after 3 seconds
        setTimeout(() => {
          window.location.href = '/sign-in'
        }, 3000)
      } else {
        setError(data.error || 'Failed to change password.')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo.jpg"
              alt="Leave Management System"
              width={80}
              height={80}
              className="rounded-lg shadow-md"
              priority
            />
          </div>
          <h2 className="text-3xl font-bold text-primary-950 mb-2">
            Change your password
          </h2>
          <p className="text-primary-600">
            Enter your employee ID, current password, and new password
          </p>
        </div>
        <div className="card">
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                {message}
                <br />
                <small>Redirecting to sign in page...</small>
              </div>
            )}

            <div>
              <label htmlFor="employeeId" className="block text-sm font-medium text-primary-700 mb-1">
                Employee ID
              </label>
              <input
                type="text"
                id="employeeId"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="input-field"
                placeholder="Enter your employee ID"
                required
              />
            </div>

            <div>
              <label htmlFor="oldPassword" className="block text-sm font-medium text-primary-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                id="oldPassword"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="input-field"
                placeholder="Enter your current password"
                required
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-primary-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field"
                placeholder="Enter new password (min 6 characters)"
                required
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-primary-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="Confirm new password"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {isLoading ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/sign-in" className="text-sm text-primary-600 hover:text-primary-800">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
