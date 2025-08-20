import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { LeaveRequestsTable } from '@/components/leave-requests-table'

export default async function RequestsPage() {
  const user = await getCurrentUser()

  // Fetch all user's leave requests
  const leaveRequests = await prisma.leaveRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary-950 mb-2">My Leave Requests</h1>
        <p className="text-primary-600">View and manage all your leave requests</p>
      </div>

      <div className="card">
        <LeaveRequestsTable
          requests={leaveRequests}
          showActions={true}
          currentUserId={user.id}
          showUserInfo={false}
          allowApproval={false}
        />
      </div>
    </div>
  )
}
