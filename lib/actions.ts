"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "./prisma"

interface CreateLeaveRequestData {
  userId: string
  startDate: Date
  endDate: Date
  reason: string
}

export async function createLeaveRequest(data: CreateLeaveRequestData) {
  try {
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        userId: data.userId,
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason,
        status: "PENDING",
      },
    })

    revalidatePath("/dashboard")
    return { success: true, data: leaveRequest }
  } catch (error) {
    console.error("Error creating leave request:", error)
    throw new Error("Failed to create leave request")
  }
}

export async function updateLeaveRequestStatus(
  requestId: string,
  status: "APPROVED" | "REJECTED"
) {
  try {
    const leaveRequest = await prisma.leaveRequest.update({
      where: { id: requestId },
      data: { status },
    })

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/team")
    revalidatePath("/dashboard/all-requests")
    return { success: true, data: leaveRequest }
  } catch (error) {
    console.error("Error updating leave request:", error)
    throw new Error("Failed to update leave request")
  }
}

export async function deleteLeaveRequest(requestId: string) {
  try {
    await prisma.leaveRequest.delete({
      where: { id: requestId },
    })

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/requests")
    return { success: true }
  } catch (error) {
    console.error("Error deleting leave request:", error)
    throw new Error("Failed to delete leave request")
  }
}

export async function assignSupervisor(
  employeeId: string,
  supervisorId: string | null
) {
  try {
    const user = await prisma.user.update({
      where: { id: employeeId },
      data: { supervisorId },
    })

    revalidatePath("/dashboard")
    return { success: true, data: user }
  } catch (error) {
    console.error("Error assigning supervisor:", error)
    throw new Error("Failed to assign supervisor")
  }
}
