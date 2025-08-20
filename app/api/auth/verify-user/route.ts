import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    // Check if user exists in our database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        employeeId: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found in system. Please complete registration." },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
    
  } catch (error: any) {
    console.error("Error verifying user:", error)
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Database constraint violation" },
        { status: 400 }
      )
    }
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "User record not found" },
        { status: 404 }
      )
    }

    // Handle database connection errors
    if (error.code === 'P1001') {
      return NextResponse.json(
        { error: "Database connection failed. Please try again later." },
        { status: 503 }
      )
    }

    const message = error?.message || "Internal server error during user verification"
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
