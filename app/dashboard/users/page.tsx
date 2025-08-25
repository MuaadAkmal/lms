import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AdminUserManagement } from '@/components/admin-user-management'
import { UserStats } from '@/components/user-stats'
import { ExportReports } from '@/components/export-reports'
import { AdminCreateUser } from '@/components/admin-create-user'

export default async function UsersPage() {
  await requireRole(['ADMIN'])

  // Fetch all users with their supervisor information
  const users = await prisma.user.findMany({
    select: {
      id: true,
      employeeId: true,
      firstName: true,
      middleName: true,
      lastName: true,
      iqamaNo: true,
      storeCode: true,
      nationality: true,
      gosiType: true,
      jobTitle: true,
      email: true,
      phone: true,
      password: false,
      createdAt: true,
      updatedAt: true,
      role: true,
      supervisorId: true,
      supervisor: {
        select: {
          firstName: true,
          middleName: true,
          lastName: true,
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
    employees: users.filter((u: any) => u.role === 'EMPLOYEE').length,
    supervisors: users.filter((u: any) => u.role === 'SUPERVISOR').length,
    admins: users.filter((u: any) => u.role === 'ADMIN').length
  }

  // Get supervisors for user assignment
  const supervisors = users.filter((u: any) => u.role === 'SUPERVISOR')

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary-950 mb-2">User Management</h1>
          <p className="text-primary-600">Manage all users and their roles</p>
        </div>
        <AdminCreateUser supervisors={supervisors} />
      </div>

      {/* User Stats */}
      <UserStats stats={stats} />

      {/* Export Reports */}
      <div className="card">
        <div className="flex items-center mb-4">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-900">Export Reports</h2>
        </div>
        <ExportReports userRole="ADMIN" />
      </div>

      {/* Admin User Management */}
      <AdminUserManagement users={users} supervisors={supervisors} />
    </div>
  )
}
