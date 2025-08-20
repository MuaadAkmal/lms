import { getCurrentUser, requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { LeaveRequestsTable } from '@/components/leave-requests-table'
import { SearchAndFilter } from '@/components/search-and-filter'

interface TeamPageProps {
  searchParams: {
    search?: string
    status?: string
  }
}

export default async function TeamPage({ searchParams }: TeamPageProps) {
  const user = await requireRole(['supervisor', 'admin'])

  // Build where clause for filtering
  const whereClause: any = {
    user: {
      supervisorId: user.id
    }
  }

  // Add search filter
  if (searchParams.search) {
    whereClause.user.name = {
      contains: searchParams.search,
      mode: 'insensitive'
    }
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
          name: true,
          employeeId: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Get team members for stats
  const teamMembers = await prisma.user.findMany({
    where: { supervisorId: user.id },
    select: { id: true, name: true, employeeId: true }
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
