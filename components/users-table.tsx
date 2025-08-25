'use client'

import { useState } from 'react'

interface User {
  id: string
  firstName: string
  middleName?: string | null
  lastName: string
  employeeId: string
  email: string
  role: string
  supervisor?: {
    firstName: string
    middleName?: string | null
    lastName: string
    employeeId: string
  } | null
  _count: {
    leaveRequests: number
    employees: number
  }
}

interface UsersTableProps {
  users: User[]
  onUserUpdate?: () => void
}

export function UsersTable({ users, onUserUpdate }: UsersTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [isResetting, setIsResetting] = useState<string | null>(null)
  const [resetResult, setResetResult] = useState<{ userId: string, password: string } | null>(null)

  const filteredUsers = users.filter(user => {
    const fullName = [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ');
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === 'all' || user.role.toLowerCase() === roleFilter

    return matchesSearch && matchesRole
  })

  const getRoleBadge = (role: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium'
    switch (role.toLowerCase()) {
      case 'admin':
        return `${baseClasses} bg-red-100 text-red-800`
      case 'supervisor':
        return `${baseClasses} bg-purple-100 text-purple-800`
      case 'employee':
        return `${baseClasses} bg-green-100 text-green-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const handleResetPassword = async (userId: string) => {
    setIsResetting(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setResetResult({ userId, password: data.temporaryPassword })
        if (onUserUpdate) onUserUpdate()
      } else {
        alert('Failed to reset password')
      }
    } catch (error) {
      console.error('Error resetting password:', error)
      alert('An error occurred while resetting password')
    } finally {
      setIsResetting(null)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Password copied to clipboard!')
  }

  return (
    <div className="space-y-4">
      {/* Password Reset Result Modal */}
      {resetResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Password Reset Successful</h3>
            <p className="mb-4">
              New temporary password for{' '}
              <strong>{[users.find(u => u.id === resetResult.userId)?.firstName, users.find(u => u.id === resetResult.userId)?.middleName, users.find(u => u.id === resetResult.userId)?.lastName].filter(Boolean).join(' ')}</strong>:
            </p>
            <div className="bg-gray-100 p-3 rounded border flex items-center justify-between">
              <code className="font-mono text-sm">{resetResult.password}</code>
              <button
                onClick={() => copyToClipboard(resetResult.password)}
                className="ml-2 btn-secondary text-xs py-1 px-2"
              >
                Copy
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Please share this password securely with the user. They can change it after signing in.
            </p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setResetResult(null)}
                className="btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Roles</option>
            <option value="employee">Employee</option>
            <option value="supervisor">Supervisor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">Name</th>
              <th className="table-header-cell">Employee ID</th>
              <th className="table-header-cell">Email</th>
              <th className="table-header-cell">Role</th>
              <th className="table-header-cell">Supervisor</th>
              <th className="table-header-cell">Leave Requests</th>
              <th className="table-header-cell">Team Size</th>
              <th className="table-header-cell">Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="table-cell font-medium">{[user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ')}</td>
                <td className="table-cell">{user.employeeId}</td>
                <td className="table-cell">{user.email}</td>
                <td className="table-cell">
                  <span className={getRoleBadge(user.role)}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </td>
                <td className="table-cell">
                  {user.supervisor ? (
                    <div>
                      <div className="font-medium">{[user.supervisor?.firstName, user.supervisor?.middleName, user.supervisor?.lastName].filter(Boolean).join(' ')}</div>
                      <div className="text-sm text-primary-500">{user.supervisor.employeeId}</div>
                    </div>
                  ) : (
                    <span className="text-primary-400">N/A</span>
                  )}
                </td>
                <td className="table-cell">{user._count.leaveRequests}</td>
                <td className="table-cell">
                  {user.role === 'supervisor' || user.role === 'admin' ? user._count.employees : 'N/A'}
                </td>
                <td className="table-cell">
                  <div className="flex space-x-2">
                    <button className="btn-secondary text-xs py-1 px-2">
                      Edit
                    </button>
                    <button
                      onClick={() => handleResetPassword(user.id)}
                      disabled={isResetting === user.id}
                      className="btn-danger text-xs py-1 px-2 disabled:opacity-50"
                    >
                      {isResetting === user.id ? 'Resetting...' : 'Reset Password'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-8 text-primary-600">
          No users found matching your criteria.
        </div>
      )}
    </div>
  )
}
