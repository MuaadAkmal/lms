import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import type { Role } from "@prisma/client"

export async function getCurrentUser() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/sign-in")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      employeeId: true,
      email: true,
      firstName: true,
      middleName: true,
      lastName: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
      role: true,
      supervisorId: true,
    },
  })

  if (!user) {
    redirect("/sign-in")
  }

  return user
}

export async function getUserWithRole() {
  const user = await getCurrentUser()
  return user
}

export async function requireRole(allowedRoles: Role[]) {
  const user = await getCurrentUser()

  if (!allowedRoles.includes(user.role)) {
    redirect("/dashboard")
  }

  return user
}
