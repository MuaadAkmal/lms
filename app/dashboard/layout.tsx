import { getCurrentUser } from '@/lib/auth'
import { signOut } from '@/auth'
import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'

interface DashboardLayoutProps {
  children: React.ReactNode
}

async function SignOutButton() {
  return (
    <form
      action={async () => {
        'use server'
        await signOut({ redirectTo: '/sign-in' })
      }}
    >
      <button
        type="submit"
        className="inline-flex items-center px-3 py-2 text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition ease-in-out duration-150"
      >
        Sign Out
      </button>
    </form>
  )
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-gray-200">
      {/* Header */}
      <header className="bg-white shadow-soft border-b border-primary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center">
                <Image
                  src="/logo.jpg"
                  alt="Leave Management System"
                  width={40}
                  height={40}
                  className="rounded-lg mr-3"
                  priority
                />
                <span className="text-xl font-bold text-primary-950 hidden sm:block">
                  Leave Management
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="hidden sm:block text-sm text-primary-600">
                Welcome, {`${user.firstName}${user.middleName ? ` ${user.middleName}` : ''} ${user.lastName}`} ({user.role})
              </span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Full Width */}
      <main className="w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
