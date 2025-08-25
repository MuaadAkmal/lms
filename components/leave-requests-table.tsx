'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateLeaveRequestStatus, deleteLeaveRequest } from '@/lib/actions'
import { format } from 'date-fns'

interface LeaveRequest {
  id: string
  startDate: Date
  endDate: Date
  reason: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: Date
  user?: {
    firstName: string
    middleName?: string | null
    lastName: string
    employeeId: string
  }
}

interface LeaveRequestsTableProps {
  requests: LeaveRequest[]
  showActions: boolean
  currentUserId?: string
  showUserInfo?: boolean
  allowApproval?: boolean
}

export function LeaveRequestsTable({
  requests,
  showActions,
  currentUserId,
  showUserInfo = false,
  allowApproval = false
}: LeaveRequestsTableProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleStatusUpdate = (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    startTransition(async () => {
      try {
        await updateLeaveRequestStatus(requestId, status)
        router.refresh()
      } catch (error) {
        console.error('Error updating status:', error)
        alert('Failed to update request status')
      }
    })
  }

  const handleDelete = (requestId: string) => {
    if (confirm('Are you sure you want to delete this request?')) {
      startTransition(async () => {
        try {
          await deleteLeaveRequest(requestId)
          router.refresh()
        } catch (error) {
          console.error('Error deleting request:', error)
          alert('Failed to delete request')
        }
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium'
    switch (status) {
      case 'PENDING':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'APPROVED':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'REJECTED':
        return `${baseClasses} bg-red-100 text-red-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-primary-600">
        No leave requests found.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <div className={`overflow-y-auto ${requests.length > 4 ? 'max-h-80' : ''}`}>
        <table className="table">
          <thead className="table-header sticky top-0 bg-white z-10">
            <tr>
              {showUserInfo && (
                <>
                  <th className="table-header-cell">Employee</th>
                  <th className="table-header-cell">Employee ID</th>
                </>
              )}
              <th className="table-header-cell">Start Date</th>
              <th className="table-header-cell">End Date</th>
              <th className="table-header-cell">Reason</th>
              <th className="table-header-cell">Status</th>
              <th className="table-header-cell">Submitted</th>
              {showActions && <th className="table-header-cell">Actions</th>}
            </tr>
          </thead>
          <tbody className="table-body">
            {requests.map((request) => (
              <tr key={request.id}>
                {showUserInfo && request.user && (
                  <>
                    <td className="table-cell">{[request.user.firstName, request.user.middleName, request.user.lastName].filter(Boolean).join(' ')}</td>
                    <td className="table-cell">{request.user.employeeId}</td>
                  </>
                )}
                <td className="table-cell">
                  {format(new Date(request.startDate), 'MMM dd, yyyy HH:mm')}
                </td>
                <td className="table-cell">
                  {format(new Date(request.endDate), 'MMM dd, yyyy HH:mm')}
                </td>
                <td className="table-cell">
                  <div className="max-w-xs truncate" title={request.reason}>
                    {request.reason}
                  </div>
                </td>
                <td className="table-cell">
                  <span className={getStatusBadge(request.status)}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </td>
                <td className="table-cell">
                  {format(new Date(request.createdAt), 'MMM dd, yyyy')}
                </td>
                {showActions && (
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      {allowApproval && request.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(request.id, 'APPROVED')}
                            disabled={isPending}
                            className="btn-success text-xs py-1 px-2"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(request.id, 'REJECTED')}
                            disabled={isPending}
                            className="btn-danger text-xs py-1 px-2"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {currentUserId && request.status === 'PENDING' && (
                        <button
                          onClick={() => handleDelete(request.id)}
                          disabled={isPending}
                          className="btn-danger text-xs py-1 px-2"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
