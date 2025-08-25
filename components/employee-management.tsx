'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { assignSupervisor } from '@/lib/actions'

interface User {
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
}

interface EmployeeManagementProps {
  employees: User[]
  supervisors: User[]
}

export function EmployeeManagement({ employees, supervisors }: EmployeeManagementProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSupervisorAssignment = (employeeId: string, supervisorId: string) => {
    startTransition(async () => {
      try {
        await assignSupervisor(employeeId, supervisorId || null)
        router.refresh()
      } catch (error) {
        console.error('Error assigning supervisor:', error)
        alert('Failed to assign supervisor')
      }
    })
  }

  return (
    <div className="card">
      <div className="flex items-center mb-6">
        <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h2 className="text-lg font-semibold text-gray-900">Employee Management</h2>
      </div>

      <div className="overflow-x-auto">
        <div className={`overflow-y-auto ${employees.length > 4 ? 'max-h-80' : ''}`}>
          <table className="table">
            <thead className="table-header sticky top-0 bg-white z-10">
              <tr>
                <th className="table-header-cell">Employee</th>
                <th className="table-header-cell">Employee ID</th>
                <th className="table-header-cell">Role</th>
                <th className="table-header-cell">Current Supervisor</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td className="table-cell">{[employee.firstName, employee.middleName, employee.lastName].filter(Boolean).join(' ')}</td>
                  <td className="table-cell">{employee.employeeId}</td>
                  <td className="table-cell">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {employee.role}
                    </span>
                  </td>
                  <td className="table-cell">
                    {employee.supervisor ? (
                      <span className="text-gray-900">
                        {[employee.supervisor?.firstName, employee.supervisor?.middleName, employee.supervisor?.lastName].filter(Boolean).join(' ')} ({employee.supervisor?.employeeId})
                      </span>
                    ) : (
                      <span className="text-red-500 italic">No supervisor assigned</span>
                    )}
                  </td>
                  <td className="table-cell">
                    <select
                      className="text-sm border border-gray-300 rounded px-2 py-1 disabled:opacity-50"
                      defaultValue={employee.supervisorId || ''}
                      disabled={isPending}
                      onChange={(e) => handleSupervisorAssignment(employee.id, e.target.value)}
                    >
                      <option value="">Select Supervisor</option>
                      {supervisors.map((supervisor) => (
                        <option key={supervisor.id} value={supervisor.id}>
                          {[supervisor.firstName, supervisor.middleName, supervisor.lastName].filter(Boolean).join(' ')} ({supervisor.employeeId})
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {employees.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No employees found.
        </div>
      )}
    </div>
  )
}
