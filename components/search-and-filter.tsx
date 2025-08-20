'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'

export function SearchAndFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [status, setStatus] = useState(searchParams.get('status') || 'all')

  const handleSearch = () => {
    startTransition(() => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (status && status !== 'all') params.set('status', status)

      router.push(`?${params.toString()}`)
    })
  }

  const handleReset = () => {
    startTransition(() => {
      setSearch('')
      setStatus('all')
      router.push(window.location.pathname)
    })
  }

  return (
    <div className="card">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-primary-700 mb-1">
            Search by Employee Name
          </label>
          <input
            type="text"
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Enter employee name..."
            className="input-field"
            disabled={isPending}
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-primary-700 mb-1">
            Filter by Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input-field"
            disabled={isPending}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="flex items-end space-x-2">
          <button
            onClick={handleSearch}
            disabled={isPending}
            className="btn-primary flex-1"
          >
            {isPending ? 'Searching...' : 'Search'}
          </button>
          <button
            onClick={handleReset}
            disabled={isPending}
            className="btn-secondary"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}
