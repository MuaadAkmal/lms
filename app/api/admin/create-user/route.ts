import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs"
import { clerkClient } from "@clerk/nextjs"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to continue." }, 
        { status: 401 }
      )
    }

    // Ensure requester is admin in our DB
    let admin
    try {
      admin = await prisma.user.findUnique({ 
        where: { clerkId: userId },
        select: { role: true, name: true }
      })
    } catch (dbError: any) {
      console.error("Database error during admin verification:", dbError)
      return NextResponse.json(
        { error: "Database connection failed. Please try again later." },
        { status: 503 }
      )
    }

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Only administrators can create users." }, 
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, employeeId, email, phone, password, role, supervisorId } = body

    // Validate required fields
    if (!name?.trim() || !employeeId?.trim() || !email?.trim() || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields. Please fill in name, employee ID, email, password, and role." },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      )
    }

    // Check if employee ID or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { employeeId: employeeId.trim() },
          { email: email.trim().toLowerCase() }
        ]
      }
    })

    if (existingUser) {
      if (existingUser.employeeId === employeeId.trim()) {
        return NextResponse.json(
          { error: "An account with this employee ID already exists." },
          { status: 409 }
        )
      } else {
        return NextResponse.json(
          { error: "An account with this email address already exists." },
          { status: 409 }
        )
      }
    }

    // Validate supervisor if provided
    if (supervisorId) {
      const supervisor = await prisma.user.findUnique({
        where: { id: supervisorId },
        select: { role: true }
      })

      if (!supervisor) {
        return NextResponse.json(
          { error: "Invalid supervisor selected. Please choose a valid supervisor." },
          { status: 400 }
        )
      }

      if (supervisor.role !== "SUPERVISOR" && supervisor.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Selected user is not authorized to be a supervisor." },
          { status: 400 }
        )
      }
    }

    // create clerk user
    const [firstName, ...rest] = name.trim().split(" ")
    const lastName = rest.join(" ")

    let clerkUser
    try {
      clerkUser = await clerkClient.users.createUser({
        emailAddress: email.trim().toLowerCase(),
        password,
        firstName: firstName || "User",
        lastName: lastName || "",
        username: employeeId.trim(),
      })
    } catch (clerkError: any) {
      console.error("Clerk user creation error:", clerkError)
      
      // Handle specific Clerk errors
      if (clerkError?.errors?.[0]?.code === 'form_identifier_exists') {
        return NextResponse.json(
          { error: "An account with this email or employee ID already exists in the authentication system." },
          { status: 409 }
        )
      }
      if (clerkError?.errors?.[0]?.code === 'form_password_pwned') {
        return NextResponse.json(
          { error: "This password has been found in a data breach. Please choose a different password." },
          { status: 400 }
        )
      }

      const errorMessage = clerkError?.errors?.[0]?.longMessage || 
                          clerkError?.errors?.[0]?.message || 
                          clerkError?.message || 
                          "Failed to create user account in authentication system."
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    // create prisma user
    try {
      await prisma.user.create({
        data: {
          clerkId: clerkUser.id,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          employeeId: employeeId.trim(),
          phone: phone?.trim() || null,
          role: role.toUpperCase(),
          supervisorId: supervisorId || null,
        },
      })
    } catch (prismaError: any) {
      console.error("Prisma error during user creation:", prismaError)
      
      // If Prisma fails, try to clean up Clerk user
      try {
        await clerkClient.users.deleteUser(clerkUser.id)
        console.log("Cleaned up Clerk user after Prisma error")
      } catch (cleanupError) {
        console.error("Failed to cleanup Clerk user:", cleanupError)
      }

      // Handle specific Prisma errors
      if (prismaError.code === 'P2002') {
        const target = prismaError.meta?.target
        if (Array.isArray(target) && target.includes('employeeId')) {
          return NextResponse.json(
            { error: "An account with this employee ID already exists." },
            { status: 409 }
          )
        } else if (Array.isArray(target) && target.includes('email')) {
          return NextResponse.json(
            { error: "An account with this email address already exists." },
            { status: 409 }
          )
        }
      }

      if (prismaError.code === 'P1001') {
        return NextResponse.json(
          { error: "Database connection failed. Please try again later." },
          { status: 503 }
        )
      }

      return NextResponse.json(
        { error: "Failed to save user data. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: `User ${name.trim()} (${employeeId.trim()}) created successfully.` 
    })
  } catch (error: any) {
    console.error("Error in /api/admin/create-user:", error)
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Invalid request format. Please try again." },
        { status: 400 }
      )
    }

    // Handle network/timeout errors
    if (error.name === 'AbortError' || error.code === 'ECONNRESET') {
      return NextResponse.json(
        { error: "Request timeout. Please try again." },
        { status: 408 }
      )
    }

    const message = error?.message || "An unexpected error occurred while creating the user."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
