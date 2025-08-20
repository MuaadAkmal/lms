'use client'

import { useState } from 'react'
import { useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useToast } from '@/components/toast-provider'

export default function CustomSignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn()
  const [identifier, setIdentifier] = useState('') // Can be email or employee ID
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { showSuccess, showError } = useToast()

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-primary-950 text-lg">Loading...</div>
      </div>
    )
  }

  const getDetailedErrorMessage = (err: any) => {
    // Handle specific Clerk error codes
    if (err?.errors?.[0]?.code === 'form_identifier_not_found') {
      return 'Invalid email/employee ID or password. Please check your credentials.'
    }
    if (err?.errors?.[0]?.code === 'form_password_incorrect') {
      return 'Incorrect password. Please try again.'
    }
    if (err?.errors?.[0]?.code === 'session_exists') {
      return 'You are already signed in. Redirecting...'
    }
    if (err?.errors?.[0]?.code === 'identifier_already_signed_in') {
      return 'Already signed in with this account.'
    }

    // Return the error message from Clerk or a generic fallback
    return err?.errors?.[0]?.longMessage ||
      err?.errors?.[0]?.message ||
      err?.message ||
      'Sign in failed. Please check your credentials and try again.'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded) return

    // Basic validation
    if (!identifier.trim()) {
      showError('Please enter your email or employee ID.')
      setError('Please enter your email or employee ID.')
      return
    }
    if (!password.trim()) {
      showError('Please enter your password.')
      setError('Please enter your password.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Try to sign in with the identifier (email or employee ID)
      const result = await signIn.create({
        identifier: identifier.trim(),
        password,
      })

      if (result.status === 'complete') {
        // Verify the user exists in our database
        try {
          const response = await fetch('/api/auth/verify-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clerkId: result.createdSessionId })
          })

          if (!response.ok) {
            throw new Error('User verification failed')
          }

          await setActive({ session: result.createdSessionId })
          showSuccess('Sign in successful! Redirecting to dashboard...')
          router.push('/dashboard')
        } catch (verificationError) {
          console.error('User verification error:', verificationError)
          showError('Sign in successful, but there was an issue verifying your account. Please contact support if this continues.')
          // Still proceed to dashboard as Clerk auth was successful
          await setActive({ session: result.createdSessionId })
          router.push('/dashboard')
        }
      } else {
        console.error('Sign in not complete:', result)
        const errorMessage = 'Sign in incomplete. Please try again or contact support.'
        showError(errorMessage)
        setError(errorMessage)
      }
    } catch (err: any) {
      console.error('Sign in error:', err)
      const detailedError = getDetailedErrorMessage(err)
      showError(detailedError)
      setError(detailedError)
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
            Sign in to your account
          </h2>
          <p className="text-primary-600">
            Welcome back to Leave Management System
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
              <label htmlFor="identifier" className="block text-sm font-medium text-primary-700 mb-1">
                Email or Employee ID
              </label>
              <input
                type="text"
                id="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="input-field"
                placeholder="Enter your email or employee ID"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-primary-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-primary-600">
              Don&apos;t have an account?{' '}
              <Link href="/sign-up" className="font-medium text-primary-950 hover:text-primary-800">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
