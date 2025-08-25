import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPERVISOR")) {
      return NextResponse.json(
        {
          error:
            "Unauthorized. Only admins and supervisors can export reports.",
        },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "csv"
    const type = searchParams.get("type") || "leave-requests"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    let data: any[] = []
    let filename = ""

    if (type === "leave-requests") {
      // Build filter based on user role
      const whereClause: any =
        user.role === "ADMIN" ? {} : { user: { supervisorId: user.id } }

      // Add date filter if provided
      if (startDate || endDate) {
        whereClause.createdAt = {}
        if (startDate) whereClause.createdAt.gte = new Date(startDate)
        if (endDate) whereClause.createdAt.lte = new Date(endDate)
      }

      const leaveRequests = await prisma.leaveRequest.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              firstName: true,
              middleName: true,
              lastName: true,
              employeeId: true,
              email: true,
              role: true,
              supervisor: {
                select: {
                  firstName: true,
                  lastName: true,
                  employeeId: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })

      data = leaveRequests.map((request) => ({
        "Request ID": request.id,
        "Employee Name": `${request.user.firstName} ${request.user.middleName ? request.user.middleName + ' ' : ''}${request.user.lastName}`.trim(),
        "Employee ID": request.user.employeeId,
        Email: request.user.email,
        Role: request.user.role,
        Supervisor: request.user.supervisor ? `${request.user.supervisor.firstName} ${request.user.supervisor.lastName}`.trim() : "N/A",
        "Start Date": request.startDate.toISOString().split("T")[0],
        "End Date": request.endDate.toISOString().split("T")[0],
        Reason: request.reason,
        Status: request.status,
        "Created At": request.createdAt.toISOString().split("T")[0],
        "Days Requested":
          Math.ceil(
            (request.endDate.getTime() - request.startDate.getTime()) /
              (1000 * 60 * 60 * 24)
          ) + 1,
      }))

      filename = `leave-requests-${new Date().toISOString().split("T")[0]}`
    } else if (type === "users" && user.role === "ADMIN") {
      const users = await prisma.user.findMany({
        include: {
          supervisor: {
            select: {
              firstName: true,
              lastName: true,
              employeeId: true,
            },
          },
          _count: {
            select: {
              leaveRequests: true,
              employees: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })

      data = users.map((user) => ({
        "User ID": user.id,
        Name: `${user.firstName} ${user.middleName ? user.middleName + ' ' : ''}${user.lastName}`.trim(),
        "Employee ID": user.employeeId,
        Email: user.email,
        Phone: user.phone || "N/A",
        Role: user.role,
        Supervisor: user.supervisor ? `${user.supervisor.firstName} ${user.supervisor.lastName}`.trim() : "N/A",
        "Total Leave Requests": user._count.leaveRequests,
        "Employees Under Management": user._count.employees,
        "Created At": user.createdAt.toISOString().split("T")[0],
      }))

      filename = `users-report-${new Date().toISOString().split("T")[0]}`
    }

    if (format === "csv") {
      const csv = convertToCSV(data)

      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}.csv"`,
        },
      })
    } else if (format === "json") {
      return new NextResponse(JSON.stringify(data, null, 2), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${filename}.json"`,
        },
      })
    }

    return NextResponse.json(
      { error: "Invalid format. Use csv or json." },
      { status: 400 }
    )
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json(
      { error: "Failed to export report" },
      { status: 500 }
    )
  }
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return ""

  const headers = Object.keys(data[0])
  const csvRows = []

  // Add header row
  csvRows.push(headers.map((header) => `"${header}"`).join(","))

  // Add data rows
  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header]
      return `"${String(value).replace(/"/g, '""')}"`
    })
    csvRows.push(values.join(","))
  }

  return csvRows.join("\n")
}
