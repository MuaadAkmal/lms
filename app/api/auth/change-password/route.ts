import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { employeeId, oldPassword, newPassword } = await request.json()

    if (!employeeId || !oldPassword || !newPassword) {
      return NextResponse.json(
        { error: "Employee ID, old password, and new password are required" },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters long" },
        { status: 400 }
      )
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { employeeId: employeeId.trim() },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Employee ID not found" },
        { status: 404 }
      )
    }

    // Type assertion for password field
    const userWithPassword = user as any

    // Verify the old password
    const isOldPasswordValid = await bcrypt.compare(
      oldPassword,
      userWithPassword.password
    )

    if (!isOldPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      )
    }

    // Check if new password is different from old password
    const isSamePassword = await bcrypt.compare(
      newPassword,
      userWithPassword.password
    )

    if (isSamePassword) {
      return NextResponse.json(
        { error: "New password must be different from current password" },
        { status: 400 }
      )
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // Update the user's password
    await prisma.user.update({
      where: { employeeId: employeeId.trim() },
      data: { password: hashedNewPassword } as any,
    })

    return NextResponse.json({
      success: true,
      message:
        "Password changed successfully. You can now sign in with your new password.",
    })
  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
