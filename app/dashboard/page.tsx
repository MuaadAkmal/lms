import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { LeaveRequestForm } from '@/components/leave-request-form'
import { LeaveRequestsTable } from '@/components/leave-requests-table'
import { DashboardStats } from '@/components/dashboard-stats'
import { EmployeeManagement } from '@/components/employee-management'
import { EmployeeSearch } from '@/components/employee-search'
import { AdminCreateUser } from '@/components/admin-create-user'
import { ExportReports } from '@/components/export-reports'
import { assignSupervisor, updateLeaveRequestStatus } from '@/lib/actions'

async function approveRequest(requestId: string) {
  'use server'
  return updateLeaveRequestStatus(requestId, 'APPROVED')
}

async function rejectRequest(requestId: string) {
  'use server'
  return updateLeaveRequestStatus(requestId, 'REJECTED')
}

export default async function DashboardPage() {
  const user = await getCurrentUser()
  // ...existing code...

  // Get today's date for filtering
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Fetch user's leave requests with user info for admin/supervisor views
  const leaveRequests = await prisma.leaveRequest.findMany({
    where: user.role === 'ADMIN' ? {} :
      user.role === 'SUPERVISOR' ? {
        user: { supervisorId: user.id }
      } : { userId: user.id },
    include: {
      user: {
        select: {
          firstName: true,
          middleName: true,
          lastName: true,
          employeeId: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // For employees, get only their requests for stats
  const userRequests = user.role === 'EMPLOYEE' ? leaveRequests :
    await prisma.leaveRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

  // Calculate stats (for employees use their requests, for others use all visible requests)
  const statsRequests = user.role === 'EMPLOYEE' ? userRequests : leaveRequests
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  // Enhanced stats based on user role
  let stats: {
    pending: number
    approvedThisMonth: number
    rejected: number
    total: number
    employeesUnder?: number
    requestsToday?: number
    totalEmployees?: number
    unassignedEmployees?: number
  } = {
    pending: statsRequests.filter((req: any) => req.status === 'PENDING').length,
    approvedThisMonth: statsRequests.filter((req: any) =>
      req.status === 'APPROVED' &&
      req.createdAt.getMonth() === currentMonth &&
      req.createdAt.getFullYear() === currentYear
    ).length,
    rejected: statsRequests.filter((req: any) => req.status === 'REJECTED').length,
    total: statsRequests.length
  }

  // Additional stats for supervisors and admins
  if (user.role === 'SUPERVISOR') {
    const employeesUnder = await prisma.user.count({
      where: { supervisorId: user.id }
    })

    const requestsToday = await prisma.leaveRequest.count({
      where: {
        user: { supervisorId: user.id },
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    stats = {
      ...stats,
      employeesUnder,
      requestsToday
    }
  }

  if (user.role === 'ADMIN') {
    const totalEmployees = await prisma.user.count({
      where: { role: { not: 'ADMIN' } }
    })

    const unassignedEmployees = await prisma.user.count({
      where: {
        role: 'EMPLOYEE',
        supervisorId: null
      }
    })

    stats = {
      ...stats,
      totalEmployees,
      unassignedEmployees
    }
  }

  // For admin and supervisor, fetch detailed employee data with leave requests
  const employeesWithDetails = (user.role === 'ADMIN' || user.role === 'SUPERVISOR') ?
    (await prisma.user.findMany({
      where: user.role === 'ADMIN' ? { role: { not: 'ADMIN' } } : { supervisorId: user.id },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        employeeId: true,
        email: true,
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
            leaveRequests: true
          }
        },
        leaveRequests: {
          orderBy: { createdAt: 'desc' },
          take: 5, // Show only recent 5 requests
          select: {
            id: true,
            status: true,
            startDate: true,
            endDate: true,
            reason: true,
            createdAt: true
          }
        }
      },
      orderBy: { firstName: 'asc' }
    })) : []

  // For admin, fetch all users and supervisors for employee assignment
  const allUsers = user.role === 'ADMIN' ? await prisma.user.findMany({
    where: { role: { not: 'ADMIN' } },
    select: {
      id: true,
      firstName: true,
      middleName: true,
      lastName: true,
      employeeId: true,
      email: true,
      role: true,
      supervisorId: true,
      supervisor: {
        select: {
          firstName: true,
          middleName: true,
          lastName: true,
          employeeId: true
        }
      }
    },
    orderBy: { firstName: 'asc' }
  }) : []

  const supervisors = user.role === 'ADMIN' ? allUsers.filter((u: any) => u.role === 'SUPERVISOR') :
    user.role === 'SUPERVISOR' ? [] :
      await prisma.user.findMany({
        where: { role: 'SUPERVISOR' },
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          employeeId: true,
          email: true,
          role: true,
          supervisorId: true
        }
      })

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {[user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ')}! ({user.role})</p>
      </div>

      {/* Stats Cards */}
      <DashboardStats stats={stats} userRole={user.role} />

      {/* Employee Search for Admin and Supervisor */}
      {(user.role === 'ADMIN' || user.role === 'SUPERVISOR') && (
        <EmployeeSearch
          employees={employeesWithDetails}
          supervisors={supervisors}
          userRole={user.role}
          currentUserId={user.id}
          onAssignSupervisor={assignSupervisor}
          onApproveRequest={approveRequest}
          onRejectRequest={rejectRequest}
        />
      )}

      {/* Leave Request Form - Full Width */}
      {user.role === 'EMPLOYEE' && (
        <div className="card">
          <div className="flex items-center mb-6">
            <svg className="w-5 h-5 mr-2 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <h2 className="text-lg font-semibold text-gray-900">Request Leave</h2>
          </div>
          <LeaveRequestForm userId={user.id} />
        </div>
      )}

      {/* Leave Requests Table */}
      <div className="card">
        <div className="flex items-center mb-6">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-900">
            {user.role === 'EMPLOYEE' ? 'My Leave Requests' :
              user.role === 'SUPERVISOR' ? 'Team Leave Requests' :
                'All Leave Requests'}
          </h2>
        </div>
        <LeaveRequestsTable
          requests={leaveRequests}
          showActions={true}
          currentUserId={user.role === 'EMPLOYEE' ? user.id : undefined}
          showUserInfo={user.role !== 'EMPLOYEE'}
          allowApproval={user.role === 'SUPERVISOR' || user.role === 'ADMIN'}
        />
      </div>

      {/* Admin Section - Employee-Supervisor Assignment (Legacy) */}
      {user.role === 'ADMIN' && (
        <>
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <h2 className="text-lg font-semibold text-gray-900">Admin Quick Actions</h2>
              </div>
              <AdminCreateUser supervisors={supervisors} />
            </div>
            <p className="text-gray-600 mb-4">
              Manage users, assign supervisors, and perform administrative tasks.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-800 mb-2">User Management</h3>
                <p className="text-sm text-blue-600 mb-3">Create and manage user accounts</p>
                <a href="/dashboard/users" className="text-blue-700 hover:text-blue-900 text-sm font-medium">
                  Go to Users →
                </a>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-medium text-green-800 mb-2">All Requests</h3>
                <p className="text-sm text-green-600 mb-3">View and manage all leave requests</p>
                <a href="/dashboard/all-requests" className="text-green-700 hover:text-green-900 text-sm font-medium">
                  View All Requests →
                </a>
              </div>
            </div>
          </div>
          <EmployeeManagement
            employees={allUsers.filter((u: any) => u.role === 'EMPLOYEE')}
            supervisors={supervisors}
          />
        </>
      )}

      {/* Additional sections for Supervisors and Admins */}
      {(user.role === 'SUPERVISOR' || user.role === 'ADMIN') && (
        <div className="card">
          <div className="flex items-center mb-6">
            <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">
              <div className="font-medium text-green-800">Approve All Pending</div>
              <div className="text-sm text-green-600">Bulk approve selected requests</div>
            </button>
            <ExportReports userRole={user.role} />
            {user.role === 'ADMIN' && (
              <div className="flex items-center px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors">
                <div className="flex-1">
                  <div className="font-medium text-purple-800">Create New User</div>
                  <div className="text-sm text-purple-600">Add employees, supervisors, or admins</div>
                </div>
                <AdminCreateUser supervisors={supervisors} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
