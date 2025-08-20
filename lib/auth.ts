import { auth, currentUser } from "@clerk/nextjs"
import { prisma } from "./prisma"
import { redirect } from "next/navigation"

export async function getCurrentUser() {
  const { userId } = auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const clerkUser = await currentUser()

  if (!clerkUser) {
    redirect("/sign-in")
  }

  // Find user in database or create if doesn't exist
  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user) {
    // Create user if doesn't exist - get metadata from Clerk
    const metadata = clerkUser.unsafeMetadata || {}

    user = await prisma.user.create({
      data: {
        clerkId: userId,
        name:
          `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
          "Unknown",
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        employeeId: (metadata.employeeId as string) || `EMP${Date.now()}`,
        phone: (metadata.phone as string) || null,
        role: ((metadata.role as string) || "EMPLOYEE") as
          | "EMPLOYEE"
          | "SUPERVISOR"
          | "ADMIN",
      },
    })

    console.log("Created new user in database:", user)
  }

  return user
}

export async function getUserWithRole() {
  const user = await getCurrentUser()
  return user
}

export async function requireRole(allowedRoles: string[]) {
  const user = await getCurrentUser()

  if (allowedRoles.indexOf(user.role.toLowerCase()) === -1) {
    redirect("/dashboard")
  }

  return user
}
