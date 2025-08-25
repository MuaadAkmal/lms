'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function SignInPage() {
  const [employeeId, setEmployeeId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isChangePasswordMode, setIsChangePasswordMode] = useState(false)
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!employeeId.trim() || !password.trim()) {
      setError('Please enter both employee ID and password.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        employeeId: employeeId.trim(),
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid employee ID or password. Please try again.')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!employeeId || !password || !newPassword || !confirmPassword) {
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

    if (password === newPassword) {
      setError('New password must be different from current password.')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: employeeId.trim(),
          oldPassword: password,
          newPassword
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Password changed successfully! You can now sign in with your new password.')
        // Clear form and switch back to sign-in mode
        setPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setIsChangePasswordMode(false)
      } else {
        setError(data.error || 'Failed to change password.')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const switchMode = () => {
    setIsChangePasswordMode(!isChangePasswordMode)
    setError('')
    setSuccess('')
    setPassword('')
    setNewPassword('')
    setConfirmPassword('')
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
            {isChangePasswordMode ? 'Change your password' : 'Sign in to your account'}
          </h2>
          <p className="text-primary-600">
            {isChangePasswordMode
              ? 'Enter your current password and set a new one'
              : 'Welcome back to Leave Management System'
            }
          </p>
        </div>
        <div className="card">
          <form onSubmit={isChangePasswordMode ? handleChangePassword : handleSignIn} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                {success}
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
              <label htmlFor="password" className="block text-sm font-medium text-primary-700 mb-1">
                {isChangePasswordMode ? 'Current Password' : 'Password'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder={isChangePasswordMode ? 'Enter your current password' : 'Enter your password'}
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.96 9.96 0 012.928-7.072M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.072-2.928A9.96 9.96 0 0122 9c0 5.523-4.477 10-10 10a10.05 10.05 0 01-1.875-.175" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm2.828-2.828A9.96 9.96 0 0122 9c0 5.523-4.477 10-10 10S2 14.523 2 9a9.96 9.96 0 012.828-2.828" /></svg>
                  )}
                </button>
              </div>
            </div>

            {isChangePasswordMode && (
              <>
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
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {isLoading
                ? (isChangePasswordMode ? 'Changing Password...' : 'Signing in...')
                : (isChangePasswordMode ? 'Change Password' : 'Sign In')
              }
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={switchMode}
              className="text-sm text-primary-600 hover:text-primary-800 underline"
            >
              {isChangePasswordMode ? 'Back to sign in' : 'Forgot your password?'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}