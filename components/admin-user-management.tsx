'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
}

interface AdminUserManagementProps {
  users: User[]
  supervisors: User[]
}

export function AdminUserManagement({ users, supervisors }: AdminUserManagementProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const [newUser, setNewUser] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    employeeId: '',
    email: '',
    role: 'EMPLOYEE',
    supervisorId: '',
    customPassword: '',
    iqamaNo: '',
    nationality: '',
    storeCode: '',
    gosiType: '',
    jobTitle: ''
  })

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      })

      if (response.ok) {
        setSuccess('User created successfully!')
        setNewUser({
          firstName: '',
          middleName: '',
          lastName: '',
          employeeId: '',
          email: '',
          role: 'EMPLOYEE',
          supervisorId: '',
          customPassword: '',
          iqamaNo: '',
          nationality: '',
          storeCode: '',
          gosiType: '',
          jobTitle: ''
        })
        setIsAddModalOpen(false)
        router.refresh()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to create user')
      }
    } catch (error) {
      setError('An error occurred while creating user')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user: ${userName}?`)) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSuccess('User deleted successfully!')
        router.refresh()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete user')
      }
    } catch (error) {
      setError('An error occurred while deleting user')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (userId: string, userName: string) => {
    if (!confirm(`Reset password for user: ${userName}?`)) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Password reset successfully! New temporary password: ${data.temporaryPassword}`)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to reset password')
      }
    } catch (error) {
      setError('An error occurred while resetting password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn-primary"
        >
          Add New User
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="overflow-x-auto">
        <div className={`overflow-y-auto ${users.length > 4 ? 'max-h-80' : ''}`}>
          <table className="table">
            <thead className="table-header sticky top-0 bg-white z-10">
              <tr>
                <th className="table-header-cell">Employee</th>
                <th className="table-header-cell">Employee ID</th>
                <th className="table-header-cell">Email</th>
                <th className="table-header-cell">Role</th>
                <th className="table-header-cell">Supervisor</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="table-cell">{[user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ')}</td>
                  <td className="table-cell">{user.employeeId}</td>
                  <td className="table-cell">{user.email}</td>
                  <td className="table-cell">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'SUPERVISOR' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="table-cell">
                    {user.supervisor ? (
                      <span className="text-gray-900">
                        {[user.supervisor?.firstName, user.supervisor?.middleName, user.supervisor?.lastName].filter(Boolean).join(' ')} ({user.supervisor?.employeeId})
                      </span>
                    ) : (
                      <span className="text-red-500 italic">No supervisor assigned</span>
                    )}
                  </td>
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleResetPassword(user.id, [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' '))}
                        disabled={isLoading}
                        className="text-sm bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700 disabled:opacity-50"
                      >
                        Reset Password
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' '))}
                        disabled={isLoading}
                        className="text-sm bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New User</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                  className="input-field"
                  placeholder="First Name"
                  required
                />
                <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name *</label>
                <input
                  type="text"
                  value={newUser.middleName}
                  onChange={(e) => setNewUser({ ...newUser, middleName: e.target.value })}
                  className="input-field"
                  placeholder="Middle Name"
                  required
                />
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                  className="input-field"
                  placeholder="Last Name"
                  required
                />

                <label className="block text-sm font-medium text-gray-700 mb-1">Iqama No</label>
                <input
                  type="text"
                  value={newUser.iqamaNo || ''}
                  onChange={(e) => setNewUser({ ...newUser, iqamaNo: e.target.value })}
                  className="input-field"
                  placeholder="Iqama No"
                />

                <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                <input
                  type="text"
                  value={newUser.nationality || ''}
                  onChange={(e) => setNewUser({ ...newUser, nationality: e.target.value })}
                  className="input-field"
                  placeholder="Nationality"
                />

                <label className="block text-sm font-medium text-gray-700 mb-1">Store Code</label>
                <input
                  type="text"
                  value={newUser.storeCode || ''}
                  onChange={(e) => setNewUser({ ...newUser, storeCode: e.target.value })}
                  className="input-field"
                  placeholder="Store Code"
                />

                <label className="block text-sm font-medium text-gray-700 mb-1">GOSI Type</label>
                <input
                  type="text"
                  value={newUser.gosiType || ''}
                  onChange={(e) => setNewUser({ ...newUser, gosiType: e.target.value })}
                  className="input-field"
                  placeholder="GOSI Type"
                />

                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <input
                  type="text"
                  value={newUser.jobTitle || ''}
                  onChange={(e) => setNewUser({ ...newUser, jobTitle: e.target.value })}
                  className="input-field"
                  placeholder="Job Title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee ID
                </label>
                <input
                  type="text"
                  value={newUser.employeeId}
                  onChange={(e) => setNewUser({ ...newUser, employeeId: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="input-field"
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="SUPERVISOR">Supervisor</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              {newUser.role === 'EMPLOYEE' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supervisor
                  </label>
                  <select
                    value={newUser.supervisorId}
                    onChange={(e) => setNewUser({ ...newUser, supervisorId: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select Supervisor</option>
                    {supervisors.map((supervisor) => (
                      <option key={supervisor.id} value={supervisor.id}>
                        {[supervisor.firstName, supervisor.middleName, supervisor.lastName].filter(Boolean).join(' ')} ({supervisor.employeeId})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Password
                </label>
                <input
                  type="password"
                  value={newUser.customPassword}
                  onChange={(e) => setNewUser({ ...newUser, customPassword: e.target.value })}
                  className="input-field"
                  placeholder="Enter password for user"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">This password will be used by the user to log in</p>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {isLoading ? 'Creating...' : 'Create User'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
