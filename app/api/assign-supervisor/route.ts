import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    // Only admins can assign supervisors
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const formData = await request.formData()
    const employeeId = formData.get("employeeId") as string
    const supervisorId = formData.get("supervisorId") as string

    if (!employeeId) {
      return NextResponse.json(
        { error: "Employee ID is required" },
        { status: 400 }
      )
    }

    // Update the employee's supervisor
    await prisma.user.update({
      where: { id: employeeId },
      data: {
        supervisorId: supervisorId || null,
      },
    })

    // Redirect back to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url))
  } catch (error) {
    console.error("Error assigning supervisor:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
