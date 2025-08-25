import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { LeaveRequestsTable } from '@/components/leave-requests-table'
import { SearchAndFilter } from '@/components/search-and-filter'
import { ExportReports } from '@/components/export-reports'

interface AllRequestsPageProps {
  searchParams: {
    search?: string
    status?: string
  }
}

export default async function AllRequestsPage({ searchParams }: AllRequestsPageProps) {
  await requireRole(['ADMIN'])

  // Build where clause for filtering
  const whereClause: any = {}

  // Add search filter
  if (searchParams.search) {
    whereClause.user = {
      OR: [
        { firstName: { contains: searchParams.search, mode: 'insensitive' } },
        { middleName: { contains: searchParams.search, mode: 'insensitive' } },
        { lastName: { contains: searchParams.search, mode: 'insensitive' } }
      ]
    }
  }

  // Add status filter
  if (searchParams.status && searchParams.status !== 'all') {
    whereClause.status = searchParams.status.toUpperCase()
  }

  // Fetch all leave requests
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

  // Get total stats
  const totalRequests = await prisma.leaveRequest.count()
  const pendingRequests = await prisma.leaveRequest.count({
    where: { status: 'PENDING' }
  })
  const approvedRequests = await prisma.leaveRequest.count({
    where: { status: 'APPROVED' }
  })
  const rejectedRequests = await prisma.leaveRequest.count({
    where: { status: 'REJECTED' }
  })

  // Map leaveRequests to add a name property to user
  const leaveRequestsWithName = leaveRequests.map((req) => ({
    ...req,
    user: {
      ...req.user,
      name: [req.user.firstName, req.user.middleName, req.user.lastName].filter(Boolean).join(' ').trim(),
    },
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary-950 mb-2">All Leave Requests</h1>
        <p className="text-primary-600">
          Manage all leave requests across the organization
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-blue-50 border-blue-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-800">{totalRequests}</p>
            <p className="text-sm text-blue-600">Total Requests</p>
          </div>
        </div>
        <div className="card bg-yellow-50 border-yellow-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-800">{pendingRequests}</p>
            <p className="text-sm text-yellow-600">Pending</p>
          </div>
        </div>
        <div className="card bg-green-50 border-green-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-800">{approvedRequests}</p>
            <p className="text-sm text-green-600">Approved</p>
          </div>
        </div>
        <div className="card bg-red-50 border-red-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-800">{rejectedRequests}</p>
            <p className="text-sm text-red-600">Rejected</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <SearchAndFilter />

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

      <div className="card">
        <LeaveRequestsTable
          requests={leaveRequestsWithName}
          showActions={true}
          showUserInfo={true}
          allowApproval={true}
        />
      </div>
    </div>
  )
}
