import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { name, employeeId, email, role, supervisorId, temporaryPassword, customPassword } = await request.json()

    const password = customPassword || temporaryPassword

    if (!name || !employeeId || !email || !password) {
      return NextResponse.json(
        { error: 'Name, employee ID, email, and password are required' },
        { status: 400 }
      )
    }

    // Check if employee ID or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { employeeId },
          { email }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Employee ID or email already exists' },
        { status: 400 }
      )
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create the user
    const newUser = await prisma.user.create({
      data: {
        name,
        employeeId,
        email,
        password: hashedPassword,
        role: role as 'EMPLOYEE' | 'SUPERVISOR' | 'ADMIN',
        supervisorId: supervisorId || null,
      },
      include: {
        supervisor: {
          select: {
            name: true,
            employeeId: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        employeeId: newUser.employeeId,
        email: newUser.email,
        role: newUser.role,
        supervisor: newUser.supervisor
      }
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
