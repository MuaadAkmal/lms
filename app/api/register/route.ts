import { NextRequest, NextResponse } from "next/server"
import { clerkClient } from "@clerk/nextjs"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, employeeId, email, phone, password, role } = body

    // Validate required fields
    if (!employeeId?.trim() || !email?.trim() || !password || !name?.trim() || !role) {
      return NextResponse.json(
        { error: "Missing required fields. Please fill in all required information." },
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

    // Check if employee ID or email already exists in our database
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

    const [firstName, ...rest] = name.trim().split(" ")
    const lastName = rest.join(" ")

    // Log payload to help debug Clerk request_body_invalid errors
    console.log("Register payload:", { name, employeeId, email, phone, role })

    // Try multiple Clerk createUser payload shapes to handle SDK/version differences
    let clerkUser: any = null
    const payloads = [
      {
        emailAddress: email.trim().toLowerCase(),
        password,
        firstName: firstName || "User",
        lastName: lastName || "",
        username: employeeId.trim(),
      },
      {
        emailAddresses: [{ emailAddress: email.trim().toLowerCase() }],
        password,
        firstName: firstName || "User",
        lastName: lastName || "",
        username: employeeId.trim(),
      },
      {
        email: email.trim().toLowerCase(),
        password,
        firstName: firstName || "User",
        lastName: lastName || "",
        username: employeeId.trim(),
      },
    ]

    let lastErr: any = null
    for (const p of payloads) {
      try {
        console.log(
          "Attempting clerk.createUser with payload keys:",
          Object.keys(p)
        )
        clerkUser = await (clerkClient.users as any).createUser(p)
        console.log(
          "Clerk createUser succeeded with payload keys:",
          Object.keys(p)
        )
        break
      } catch (err: any) {
        lastErr = err
        console.error(
          "Clerk createUser attempt failed for payload keys",
          Object.keys(p),
          err?.message || err
        )
        
        // Check for specific Clerk errors
        if (err?.errors?.[0]?.code === 'form_identifier_exists') {
          return NextResponse.json(
            { error: "An account with this email or employee ID already exists in the authentication system." },
            { status: 409 }
          )
        }
        if (err?.errors?.[0]?.code === 'form_password_pwned') {
          return NextResponse.json(
            { error: "This password has been found in a data breach. Please choose a different password." },
            { status: 400 }
          )
        }
        // continue to next payload
      }
    }

    if (!clerkUser) {
      const errorMessage = lastErr?.errors?.[0]?.longMessage || 
                          lastErr?.errors?.[0]?.message || 
                          lastErr?.message || 
                          "Failed to create user account. Please try again."
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    // Create Prisma user with error handling
    try {
      await prisma.user.create({
        data: {
          clerkId: clerkUser.id,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          employeeId: employeeId.trim(),
          phone: phone?.trim() || null,
          role: role.toUpperCase(),
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
        } else {
          return NextResponse.json(
            { error: "An account with these details already exists." },
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

    return NextResponse.json({ success: true })
  } catch (error: any) {
    // Log Clerk error details (including meta) to identify invalid fields
    console.error("Error in /api/register:", error)
    if (error?.errors) {
      console.error(
        "Clerk errors array:",
        JSON.stringify(error.errors, null, 2)
      )
      console.error(
        "Clerk error meta:",
        JSON.stringify(error.errors[0]?.meta || {}, null, 2)
      )
    }

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

    const message =
      error?.errors?.[0]?.longMessage ||
      error?.message ||
      "An unexpected error occurred. Please try again."
    
    return NextResponse.json(
      { error: message, details: error?.errors || null },
      { status: 500 }
    )
  }
}
