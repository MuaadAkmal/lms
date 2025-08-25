'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createLeaveRequest } from '@/lib/actions'

interface LeaveRequestFormProps {
  userId: string
}

export function LeaveRequestForm({ userId }: LeaveRequestFormProps) {
  const [startDateTime, setStartDateTime] = useState('')
  const [endDateTime, setEndDateTime] = useState('')
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Calculate total duration between start and end datetime
  const calculateTotalDuration = () => {
    if (!startDateTime || !endDateTime) return ''

    const start = new Date(startDateTime)
    const end = new Date(endDateTime)

    if (start >= end) return 'Invalid: End must be after start'

    const diffMs = end.getTime() - start.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    const remainingHours = diffHours % 24
    const remainingMinutes = diffMinutes % 60

    if (diffDays > 0) {
      if (remainingHours > 0 || remainingMinutes > 0) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''}, ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}, ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`
      }
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`
    } else if (diffHours > 0) {
      if (remainingMinutes > 0) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''}, ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`
      }
      return `${diffHours} hour${diffHours > 1 ? 's' : ''}`
    } else {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`
    }
  }

  // Check if there's an error with the dates
  const hasDateError = () => {
    if (!startDateTime || !endDateTime) return false
    return new Date(startDateTime) >= new Date(endDateTime)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!startDateTime || !endDateTime || !reason.trim()) {
      alert('Please fill in all fields')
      return
    }

    if (hasDateError()) {
      alert('End date/time must be after start date/time')
      return
    }

    // Merge reason and description
    const mergedReason = description.trim()
      ? `${reason.trim()}${reason.trim() ? ': ' : ''}${description.trim()}`
      : reason.trim()

    startTransition(async () => {
      try {
        await createLeaveRequest({
          userId,
          startDate: new Date(startDateTime),
          endDate: new Date(endDateTime),
          reason: mergedReason
        })

        // Reset form
        setStartDateTime('')
        setEndDateTime('')
        setReason('')
        setDescription('')

        router.refresh()
      } catch (error) {
        console.error('Error creating leave request:', error)
        alert('Failed to create leave request')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* DateTime Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDateTime" className="block text-sm font-medium text-gray-700 mb-2">
            Start Date & Time *
          </label>
          <input
            type="datetime-local"
            id="startDateTime"
            value={startDateTime}
            onChange={(e) => setStartDateTime(e.target.value)}
            className="input-field"
            required
            disabled={isPending}
          />
        </div>

        <div>
          <label htmlFor="endDateTime" className="block text-sm font-medium text-gray-700 mb-2">
            End Date & Time *
          </label>
          <input
            type="datetime-local"
            id="endDateTime"
            value={endDateTime}
            onChange={(e) => setEndDateTime(e.target.value)}
            className="input-field"
            required
            disabled={isPending}
          />
        </div>
      </div>

      {/* Error Display */}
      {hasDateError() && (
        <div className="flex items-center justify-center">
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            <span className="text-sm font-medium text-red-800">
              ❌ Error: End date/time must be after start date/time
            </span>
          </div>
        </div>
      )}

      {/* Total Duration Display */}
      {startDateTime && endDateTime && !hasDateError() && (
        <div className="flex items-center justify-center">
          <div className="bg-purple-50 border border-purple-200 rounded-lg px-6 py-3">
            <span className="text-lg font-semibold text-purple-800">
              🎯 Total Leave Duration: {calculateTotalDuration()}
            </span>
          </div>
        </div>
      )}

      {/* Reason */}
      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
          Reason for Leave *
        </label>
        <select
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="input-field"
          required
          disabled={isPending}
        >
          <option value="">Select a reason</option>
          <option value="Hospital case">Hospital case</option>
          <option value="Doctor Appointment">Doctor Appointment</option>
          <option value="Personal Emergency">Personal Emergency</option>
          <option value="Vacation">Vacation</option>
          <option value="Family Commitment">Family Commitment</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description (optional)
        </label>
        <input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-field"
          placeholder="Add more details if needed"
          disabled={isPending}
        />
      </div>

      <button
        type="submit"
        disabled={isPending || hasDateError()}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Submitting Request...' : '✅ Submit Leave Request'}
      </button>
    </form>
  )
}
