'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/toast-provider'

interface Employee {
  id: string
  firstName: string
  middleName?: string | null
  lastName: string
  employeeId: string
  email: string
  role: string
  supervisorId: string | null
  supervisor?: {
    firstName: string
    middleName?: string | null
    lastName: string
    employeeId: string
  } | null
  _count?: {
    leaveRequests: number
  }
  leaveRequests?: Array<{
    id: string
    status: string
    startDate: Date
    endDate: Date
    reason: string
    createdAt: Date
  }>
}

interface EmployeeSearchProps {
  employees: Employee[]
  supervisors: Employee[]
  userRole: 'ADMIN' | 'SUPERVISOR'
  currentUserId?: string
  onAssignSupervisor?: (employeeId: string, supervisorId: string | null) => void
  onApproveRequest?: (requestId: string) => void
  onRejectRequest?: (requestId: string) => void
}

export function EmployeeSearch({
  employees,
  supervisors,
  userRole,
  onAssignSupervisor,
  onApproveRequest,
  onRejectRequest
}: EmployeeSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [supervisorFilter, setSupervisorFilter] = useState('all')
  const [showLeaveRequests, setShowLeaveRequests] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { showSuccess, showError } = useToast()

  // Filter employees based on search criteria
  const filteredEmployees = employees.filter(employee => {
    // Don't show admin users in any employee table
    if (employee.role === 'ADMIN') return false

    const fullName = [employee.firstName, employee.middleName, employee.lastName].filter(Boolean).join(' ')
    const matchesSearch = searchTerm === '' ||
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === 'all' || employee.role === roleFilter

    const matchesSupervisor = supervisorFilter === 'all' ||
      (supervisorFilter === 'unassigned' && !employee.supervisorId) ||
      (supervisorFilter === 'assigned' && employee.supervisorId) ||
      employee.supervisorId === supervisorFilter

    return matchesSearch && matchesRole && matchesSupervisor
  })

  const handleSupervisorAssignment = async (employeeId: string, supervisorId: string) => {
    if (!onAssignSupervisor) return

    startTransition(async () => {
      try {
        await onAssignSupervisor(employeeId, supervisorId || null)
        showSuccess('Supervisor assigned successfully!')
        router.refresh()
      } catch (error) {
        console.error('Error assigning supervisor:', error)
        showError('Failed to assign supervisor. Please try again.')
      }
    })
  }

  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    const actionFn = action === 'approve' ? onApproveRequest : onRejectRequest
    if (!actionFn) return

    startTransition(async () => {
      try {
        await actionFn(requestId)
        showSuccess(`Request ${action}d successfully!`)
        router.refresh()
      } catch (error) {
        console.error(`Error ${action}ing request:`, error)
        showError(`Failed to ${action} request. Please try again.`)
      }
    })
  }

  const toggleLeaveRequests = (employeeId: string) => {
    setShowLeaveRequests(showLeaveRequests === employeeId ? null : employeeId)
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      APPROVED: 'bg-green-100 text-green-800 border-green-200',
      REJECTED: 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="card">
      <div className="flex items-center mb-6">
        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h2 className="text-lg font-semibold text-gray-900">
          {userRole === 'ADMIN' ? 'Employee Management & Search' : 'My Team Management'}
        </h2>
      </div>

      {/* Search and Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search Employees
          </label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Name, ID, or email..."
            className="input-field"
          />
        </div>

        {userRole === 'ADMIN' && (
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Role
            </label>
            <select
              id="role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Roles</option>
              <option value="EMPLOYEE">Employee</option>
              <option value="SUPERVISOR">Supervisor</option>
            </select>
          </div>
        )}

        <div>
          <label htmlFor="supervisor" className="block text-sm font-medium text-gray-700 mb-1">
            Supervisor Status
          </label>
          <select
            id="supervisor"
            value={supervisorFilter}
            onChange={(e) => setSupervisorFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All</option>
            <option value="assigned">Has Supervisor</option>
            <option value="unassigned">No Supervisor</option>
            {userRole === 'ADMIN' && supervisors.map(supervisor => (
              <option key={supervisor.id} value={supervisor.id}>
                {[supervisor.firstName, supervisor.middleName, supervisor.lastName].filter(Boolean).join(' ')} ({supervisor.employeeId})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setSearchTerm('')
              setRoleFilter('all')
              setSupervisorFilter('all')
            }}
            className="btn-secondary w-full"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Showing {filteredEmployees.length} of {employees.length} employees
          {searchTerm && ` matching "${searchTerm}"`}
        </p>
      </div>

      {/* Employee Table */}
      <div className="overflow-x-auto">
        <div className={`overflow-y-auto ${filteredEmployees.length > 4 ? 'max-h-80' : ''}`}>
          <table className="table">
            <thead className="table-header sticky top-0 bg-white z-10">
              <tr>
                <th className="table-header-cell">Employee</th>
                <th className="table-header-cell">Employee ID</th>
                <th className="table-header-cell">Email</th>
                <th className="table-header-cell">Role</th>
                <th className="table-header-cell">Supervisor</th>
                <th className="table-header-cell">Leave Requests</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredEmployees.map((employee) => (
                <React.Fragment key={employee.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="font-medium text-gray-900">{employee.firstName}</div>
                    </td>
                    <td className="table-cell">
                      <span className="font-mono text-sm">{employee.employeeId}</span>
                    </td>
                    <td className="table-cell">
                      <span className="text-sm text-gray-600">{employee.email}</span>
                    </td>
                    <td className="table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${employee.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                        employee.role === 'SUPERVISOR' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                        {employee.role}
                      </span>
                    </td>
                    <td className="table-cell">
                      {employee.supervisor ? (
                        <div className="text-sm">
                          <div className="font-medium">{[employee.supervisor?.firstName, employee.supervisor?.middleName, employee.supervisor?.lastName].filter(Boolean).join(' ')}</div>
                          <div className="text-gray-500">({employee.supervisor.employeeId})</div>
                        </div>
                      ) : (
                        <span className="text-red-500 italic text-sm">No supervisor assigned</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <button
                        onClick={() => toggleLeaveRequests(employee.id)}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <span>{employee._count?.leaveRequests || 0} requests</span>
                        <svg
                          className={`w-4 h-4 transform transition-transform ${showLeaveRequests === employee.id ? 'rotate-180' : ''
                            }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </td>
                    <td className="table-cell">
                      <div className="flex space-x-2">
                        {userRole === 'ADMIN' && employee.role === 'EMPLOYEE' && onAssignSupervisor && (
                          <select
                            className="text-xs border border-gray-300 rounded px-2 py-1 disabled:opacity-50"
                            defaultValue={employee.supervisorId || ''}
                            disabled={isPending}
                            onChange={(e) => handleSupervisorAssignment(employee.id, e.target.value)}
                          >
                            <option value="">Select Supervisor</option>
                            {supervisors.map((supervisor) => (
                              <option key={supervisor.id} value={supervisor.id}>
                                {[supervisor.firstName, supervisor.middleName, supervisor.lastName].filter(Boolean).join(' ')}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expandable Leave Requests */}
                  {showLeaveRequests === employee.id && employee.leaveRequests && (
                    <tr>
                      <td colSpan={7} className="table-cell bg-gray-50">
                        <div className="p-4">
                          <h4 className="font-medium text-gray-900 mb-3">Leave Requests</h4>
                          {employee.leaveRequests.length > 0 ? (
                            <div className="space-y-2">
                              {employee.leaveRequests.map((request) => (
                                <div key={request.id} className="bg-white p-3 rounded-lg border border-gray-200">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(request.status)}`}>
                                          {request.status}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                          {formatDate(request.startDate)} - {formatDate(request.endDate)}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                          Requested: {formatDate(request.createdAt)}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-700 mt-1">{request.reason}</p>
                                    </div>
                                    {(userRole === 'SUPERVISOR' || userRole === 'ADMIN') && request.status === 'PENDING' && (
                                      <div className="flex space-x-2 ml-4">
                                        <button
                                          onClick={() => handleRequestAction(request.id, 'approve')}
                                          disabled={isPending}
                                          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                                        >
                                          Approve
                                        </button>
                                        <button
                                          onClick={() => handleRequestAction(request.id, 'reject')}
                                          disabled={isPending}
                                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
                                        >
                                          Reject
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">No leave requests found.</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'No employees found matching your search criteria.' : 'No employees found.'}
        </div>
      )}
    </div>
  )
}
