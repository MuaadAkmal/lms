import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { employeeId, action, newPassword } = await request.json()

    if (!employeeId) {
      return NextResponse.json(
        { error: "Employee ID is required" },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { employeeId: employeeId.trim() },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Employee ID not found" },
        { status: 404 }
      )
    }

    // If this is a password reset action with a new password
    if (action === "reset" && newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters long" },
          { status: 400 }
        )
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12)

      await prisma.user.update({
        where: { employeeId: employeeId.trim() },
        data: { password: hashedPassword },
      })

      return NextResponse.json({
        success: true,
        message:
          "Password has been reset successfully. You can now sign in with your new password.",
      })
    }

    // Default action - just acknowledge the request
    return NextResponse.json({
      success: true,
      message:
        "Password reset request submitted. Please contact your administrator for further assistance.",
      userInfo: {
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        email: user.email,
        employeeId: user.employeeId,
      },
    })
  } catch (error) {
    console.error("Error in forgot password:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
