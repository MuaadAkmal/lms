'use client'

import { useState } from 'react'

interface User {
  id: string
  name: string
  employeeId: string
  email: string
  role: string
  supervisor?: {
    name: string
    employeeId: string
  } | null
  _count: {
    leaveRequests: number
    employees: number
  }
}

interface UsersTableProps {
  users: User[]
}

export function UsersTable({ users }: UsersTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  return (
    <div className="space-y-4">
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
                <td className="table-cell font-medium">{user.name}</td>
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
                      <div className="font-medium">{user.supervisor.name}</div>
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
                    <button className="btn-secondary text-xs py-1 px-2">
                      View
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
