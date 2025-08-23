import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { id } = params

    // Check if user exists
    const userToReset = await prisma.user.findUnique({
      where: { id },
    })

    if (!userToReset) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Generate a new temporary password
    const temporaryPassword = `temp${Math.random()
      .toString(36)
      .substring(2, 8)}`
    const hashedPassword = await bcrypt.hash(temporaryPassword, 12)

    // Update the user's password
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    })

    return NextResponse.json({
      success: true,
      temporaryPassword,
    })
  } catch (error) {
    console.error("Error resetting password:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
