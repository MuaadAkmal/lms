'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function AdminCreateUser({ supervisors }: { supervisors: any[] }) {
  const [name, setName] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('EMPLOYEE')
  const [supervisorId, setSupervisorId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, employeeId, email, phone, password, role, supervisorId: supervisorId || null })
      })
      const data = await res.json()
      if (res.ok) {
        alert('User created')
        router.refresh()
        // clear form
        setName('')
        setEmployeeId('')
        setEmail('')
        setPhone('')
        setPassword('')
        setRole('EMPLOYEE')
        setSupervisorId('')
      } else {
        alert(data?.error || 'Failed to create user')
      }
    } catch (err) {
      console.error(err)
      alert('Failed to create user')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="flex items-center mb-4">
        <h3 className="text-lg font-semibold">Create User (Admin)</h3>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="input-field" required />
        <input value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="Employee ID" className="input-field" required />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="input-field" required />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)" className="input-field" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="input-field" required />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="input-field">
            <option value="EMPLOYEE">Employee</option>
            <option value="SUPERVISOR">Supervisor</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assign Supervisor (optional)</label>
          <select value={supervisorId} onChange={(e) => setSupervisorId(e.target.value)} className="input-field">
            <option value="">None</option>
            {supervisors.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.employeeId})</option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={isLoading} className="btn-primary w-full">
          {isLoading ? 'Creating...' : 'Create User'}
        </button>
      </form>
    </div>
  )
}
