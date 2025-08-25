import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Only administrators can create users." },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      firstName,
      middleName,
      lastName,
      employeeId,
      email,
      phone,
      password,
      role,
      supervisorId,
      customPassword,
      temporaryPassword,
      iqamaNo,
      storeCode,
      nationality,
      gosiType,
      jobTitle,
    } = body

    // Support both customPassword and temporaryPassword parameters for backward compatibility
    const userPassword = customPassword || temporaryPassword || password

    // Validate required fields
    if (
      !firstName?.trim() ||
      !lastName?.trim() ||
      !employeeId?.trim() ||
      !email?.trim() ||
      !userPassword?.trim() ||
      !role?.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "First Name, Last Name, Employee ID, Email, Password, and Role are required.",
        },
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
    if (userPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      )
    }

    // Check if employee ID or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { employeeId: employeeId.trim() },
          { email: email.trim().toLowerCase() },
        ],
      },
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
        select: { role: true },
      })

      if (!supervisor) {
        return NextResponse.json(
          {
            error:
              "Invalid supervisor selected. Please choose a valid supervisor.",
          },
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

    // Hash the password
    const hashedPassword = await bcrypt.hash(userPassword, 12)

    // Create user in database
    try {
      const newUser = await prisma.user.create({
        data: {
          firstName: firstName.trim(),
          middleName: middleName?.trim() || null,
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          employeeId: employeeId.trim(),
          phone: phone?.trim() || null,
          password: hashedPassword,
          role: role.toUpperCase() as any,
          supervisorId: supervisorId || null,
          iqamaNo: iqamaNo?.trim() || null,
          storeCode: storeCode?.trim() || null,
          nationality: nationality?.trim() || null,
          gosiType: gosiType || null,
          jobTitle: jobTitle?.trim() || null,
        } as any,
      })

      return NextResponse.json({
        success: true,
        message: `User ${firstName.trim()} ${lastName.trim()} (${employeeId.trim()}) created successfully.`,
        user: {
          id: newUser.id,
          firstName: (newUser as any).firstName,
          lastName: (newUser as any).lastName,
          employeeId: newUser.employeeId,
          email: newUser.email,
          role: newUser.role,
        },
      })
    } catch (prismaError: any) {
      console.error("Prisma error during user creation:", prismaError)

      // Handle specific Prisma errors
      if (prismaError.code === "P2002") {
        const target = prismaError.meta?.target
        if (Array.isArray(target) && target.includes("employeeId")) {
          return NextResponse.json(
            { error: "An account with this employee ID already exists." },
            { status: 409 }
          )
        } else if (Array.isArray(target) && target.includes("email")) {
          return NextResponse.json(
            { error: "An account with this email address already exists." },
            { status: 409 }
          )
        }
      }

      if (prismaError.code === "P1001") {
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
    if (error.name === "AbortError" || error.code === "ECONNRESET") {
      return NextResponse.json(
        { error: "Request timeout. Please try again." },
        { status: 408 }
      )
    }

    const message =
      error?.message || "An unexpected error occurred while creating the user."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
