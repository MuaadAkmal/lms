import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, employeeId, email, phone, password, role } =
      await request.json()

    // Validation
    if (!firstName || !lastName || !employeeId || !email || !password) {
      return NextResponse.json(
        {
          error:
            "First name, last name, employee ID, email, and password are required",
        },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.toLowerCase() }, { employeeId: employeeId.trim() }],
      },
    })

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 409 }
        )
      }
      if (existingUser.employeeId === employeeId.trim()) {
        return NextResponse.json(
          { error: "An account with this employee ID already exists" },
          { status: 409 }
        )
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create the user
    const newUser = await prisma.user.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        employeeId: employeeId.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        password: hashedPassword,
        role: role || "EMPLOYEE",
      } as any,
    })

    // Return success response (excluding password)
    const { password: _, ...userWithoutPassword } = newUser as any

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        user: userWithoutPassword,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Registration error:", error)

    // Handle Prisma unique constraint errors
    if (error.code === "P2002") {
      const field = error.meta?.target?.[0]
      if (field === "email") {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 409 }
        )
      }
      if (field === "employeeId") {
        return NextResponse.json(
          { error: "An account with this employee ID already exists" },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: "An account with these details already exists" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
