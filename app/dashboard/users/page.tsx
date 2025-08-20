import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UsersTable } from '@/components/users-table'
import { UserStats } from '@/components/user-stats'

export default async function UsersPage() {
  await requireRole(['admin'])

  // Fetch all users with their supervisor information
  const users = await prisma.user.findMany({
    include: {
      supervisor: {
        select: {
          name: true,
          employeeId: true
        }
      },
      _count: {
        select: {
          leaveRequests: true,
          employees: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Calculate user stats
  const stats = {
    total: users.length,
    employees: users.filter(u => u.role === 'EMPLOYEE').length,
    supervisors: users.filter(u => u.role === 'SUPERVISOR').length,
    admins: users.filter(u => u.role === 'ADMIN').length
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary-950 mb-2">User Management</h1>
        <p className="text-primary-600">Manage all users and their roles</p>
      </div>

      {/* User Stats */}
      <UserStats stats={stats} />

      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-primary-950">All Users</h2>
          <button className="btn-primary">Add New User</button>
        </div>
        <UsersTable users={users} />
      </div>
    </div>
  )
}
