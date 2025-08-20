import { UserButton } from '@clerk/nextjs'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/sign-in')
  }

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', roles: ['employee', 'supervisor', 'admin'] },
    { name: 'My Requests', href: '/dashboard/requests', roles: ['employee', 'supervisor', 'admin'] },
    { name: 'Team Requests', href: '/dashboard/team', roles: ['supervisor', 'admin'] },
    { name: 'All Users', href: '/dashboard/users', roles: ['admin'] },
    { name: 'All Requests', href: '/dashboard/all-requests', roles: ['admin'] },
  ]

  const filteredNavItems = navigationItems.filter(item =>
    item.roles.includes(user.role)
  )

  return (
    <div className="min-h-screen bg-gray-200">
      {/* Header */}
      <header className="bg-white shadow-soft border-b border-primary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-primary-950">
                Leave Management
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="hidden sm:block text-sm text-primary-600">
                Welcome, {user.name} ({user.role})
              </span>
              <UserButton afterSignOutUrl="/" />
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
