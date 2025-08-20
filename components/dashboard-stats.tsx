interface DashboardStatsProps {
  stats: {
    pending: number
    approvedThisMonth: number
    rejected: number
    total: number
    employeesUnder?: number
    requestsToday?: number
    totalEmployees?: number
    unassignedEmployees?: number
  }
  userRole: 'EMPLOYEE' | 'SUPERVISOR' | 'ADMIN'
}

export function DashboardStats({ stats, userRole }: DashboardStatsProps) {
  // Different stat cards based on user role
  const getStatCards = () => {
    if (userRole === 'EMPLOYEE') {
      return [
        {
          title: 'My Pending',
          value: stats.pending,
          color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        },
        {
          title: 'Approved This Month',
          value: stats.approvedThisMonth,
          color: 'bg-green-50 border-green-200 text-green-800',
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        },
        {
          title: 'Rejected',
          value: stats.rejected,
          color: 'bg-red-50 border-red-200 text-red-800',
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        },
        {
          title: 'Total Requests',
          value: stats.total,
          color: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          )
        }
      ]
    }

    if (userRole === 'SUPERVISOR') {
      return [
        {
          title: 'Employees Under Me',
          value: stats.employeesUnder || 0,
          color: 'bg-purple-50 border-purple-200 text-purple-800',
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          )
        },
        {
          title: 'Requests Today',
          value: stats.requestsToday || 0,
          color: 'bg-orange-50 border-orange-200 text-orange-800',
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )
        },
        {
          title: 'Pending Approvals',
          value: stats.pending,
          color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        },
        {
          title: 'Approved This Month',
          value: stats.approvedThisMonth,
          color: 'bg-green-50 border-green-200 text-green-800',
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        }
      ]
    }

    // ADMIN stats
    return [
      {
        title: 'Total Employees',
        value: stats.totalEmployees || 0,
        color: 'bg-blue-50 border-blue-200 text-blue-800',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        )
      },
      {
        title: 'Unassigned Employees',
        value: stats.unassignedEmployees || 0,
        color: 'bg-red-50 border-red-200 text-red-800',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      },
      {
        title: 'All Pending Requests',
        value: stats.pending,
        color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      },
      {
        title: 'Total Leave Requests',
        value: stats.total,
        color: 'bg-green-50 border-green-200 text-green-800',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        )
      }
    ]
  }

  const statCards = getStatCards()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, index) => (
        <div key={index} className={`${card.color} rounded-xl shadow-lg border p-6 card-hover`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-75">{card.title}</p>
              <p className="text-3xl font-bold">{card.value}</p>
            </div>
            <div className="opacity-75">
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
