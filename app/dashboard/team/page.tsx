import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { LeaveRequestsTable } from '@/components/leave-requests-table'
import { SearchAndFilter } from '@/components/search-and-filter'
import { ExportReports } from '@/components/export-reports'

interface TeamPageProps {
  searchParams: {
    search?: string
    status?: string
  }
}

export default async function TeamPage({ searchParams }: TeamPageProps) {
  const user = await requireRole(['SUPERVISOR', 'ADMIN'])

  // Build where clause for filtering
  const whereClause: any = {
    user: {
      supervisorId: user.id
    }
  }

  // Add search filter
  if (searchParams.search) {
    whereClause.user.OR = [
      { firstName: { contains: searchParams.search, mode: 'insensitive' } },
      { middleName: { contains: searchParams.search, mode: 'insensitive' } },
      { lastName: { contains: searchParams.search, mode: 'insensitive' } }
    ]
  }

  // Add status filter
  if (searchParams.status && searchParams.status !== 'all') {
    whereClause.status = searchParams.status.toUpperCase()
  }

  // Fetch team's leave requests
  const leaveRequests = await prisma.leaveRequest.findMany({
    where: whereClause,
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

  // Get team members for stats
  const teamMembers = await prisma.user.findMany({
    where: { supervisorId: user.id },
    select: { id: true, firstName: true, middleName: true, lastName: true, employeeId: true }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary-950 mb-2">Team Requests</h1>
        <p className="text-primary-600">
          Manage leave requests for your team ({teamMembers.length} members)
        </p>
      </div>

      {/* Search and Filter */}
      <SearchAndFilter />

      {/* Export Reports */}
      <div className="card">
        <div className="flex items-center mb-4">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-900">Export Team Reports</h2>
        </div>
        <ExportReports userRole="SUPERVISOR" />
      </div>

      <div className="card">
        <LeaveRequestsTable
          requests={leaveRequests}
          showActions={true}
          showUserInfo={true}
          allowApproval={true}
        />
      </div>
    </div>
  )
}
