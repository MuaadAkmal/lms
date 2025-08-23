'use client'

import { useState } from 'react'

interface ExportReportsProps {
  userRole: string
}

export function ExportReports({ userRole }: ExportReportsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportOptions, setExportOptions] = useState({
    type: 'leave-requests',
    format: 'csv',
    startDate: '',
    endDate: ''
  })

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const params = new URLSearchParams({
        type: exportOptions.type,
        format: exportOptions.format,
        ...(exportOptions.startDate && { startDate: exportOptions.startDate }),
        ...(exportOptions.endDate && { endDate: exportOptions.endDate })
      })

      const response = await fetch(`/api/reports/export?${params}`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Export failed')
      }

      // Get filename from response headers or create default
      const contentDisposition = response.headers.get('content-disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `report.${exportOptions.format}`

      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      setIsModalOpen(false)
      alert('Report exported successfully!')
    } catch (error) {
      console.error('Export error:', error)
      alert(error instanceof Error ? error.message : 'Failed to export report')
    } finally {
      setIsExporting(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
      >
        <div className="font-medium text-blue-800">Export Reports</div>
        <div className="text-sm text-blue-600">Download leave reports</div>
      </button>

      {/* Export Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Export Reports</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Type
                </label>
                <select
                  value={exportOptions.type}
                  onChange={(e) => setExportOptions({ ...exportOptions, type: e.target.value })}
                  className="input-field"
                >
                  <option value="leave-requests">Leave Requests</option>
                  {userRole === 'ADMIN' && (
                    <option value="users">Users Report</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Format
                </label>
                <select
                  value={exportOptions.format}
                  onChange={(e) => setExportOptions({ ...exportOptions, format: e.target.value })}
                  className="input-field"
                >
                  <option value="csv">CSV (Excel)</option>
                  <option value="json">JSON</option>
                </select>
              </div>

              {exportOptions.type === 'leave-requests' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={exportOptions.startDate}
                      onChange={(e) => setExportOptions({ ...exportOptions, startDate: e.target.value })}
                      className="input-field"
                      max={today}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={exportOptions.endDate}
                      onChange={(e) => setExportOptions({ ...exportOptions, endDate: e.target.value })}
                      className="input-field"
                      max={today}
                      min={exportOptions.startDate || undefined}
                    />
                  </div>

                  <div className="text-xs text-gray-500">
                    <p>Quick options:</p>
                    <div className="flex space-x-2 mt-1">
                      <button
                        type="button"
                        onClick={() => setExportOptions({
                          ...exportOptions,
                          startDate: thirtyDaysAgo,
                          endDate: today
                        })}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Last 30 days
                      </button>
                      <button
                        type="button"
                        onClick={() => setExportOptions({
                          ...exportOptions,
                          startDate: '',
                          endDate: ''
                        })}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        All time
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {isExporting ? 'Exporting...' : 'Export'}
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isExporting}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
