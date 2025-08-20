"use server"

import { prisma } from "@/lib/prisma"
import { auth, clerkClient } from "@clerk/nextjs"

export async function completeUserRegistration(userData: {
  employeeId: string
  phone: string
  role: string
}) {
  try {
    const { userId } = auth()

    if (!userId) {
      return { 
        success: false, 
        error: "User not authenticated. Please sign in again." 
      }
    }

    // Validate input
    if (!userData.employeeId?.trim()) {
      return { 
        success: false, 
        error: "Employee ID is required." 
      }
    }

    if (userData.employeeId.trim().length < 3) {
      return { 
        success: false, 
        error: "Employee ID must be at least 3 characters long." 
      }
    }

    // Check if employeeId is already taken by another user
    const existingUserWithEmployeeId = await prisma.user.findFirst({
      where: { 
        employeeId: userData.employeeId.trim(),
        clerkId: { not: userId } // Exclude current user
      }
    })

    if (existingUserWithEmployeeId) {
      return { 
        success: false, 
        error: "This employee ID is already in use. Please choose a different one." 
      }
    }

    // Get current user from Clerk
    let clerkUser
    try {
      clerkUser = await clerkClient.users.getUser(userId)
    } catch (clerkError: any) {
      console.error("Error fetching user from Clerk:", clerkError)
      return { 
        success: false, 
        error: "Failed to verify user identity. Please try again." 
      }
    }

    // Check if user already exists in our database
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    try {
      if (existingUser) {
        // User already exists, just update their information
        await prisma.user.update({
          where: { clerkId: userId },
          data: {
            employeeId: userData.employeeId.trim(),
            phone: userData.phone?.trim() || null,
            role: userData.role as any,
          },
        })
      } else {
        // Create new user in our database
        await prisma.user.create({
          data: {
            clerkId: userId,
            name:
              `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
              "Unknown",
            email: clerkUser.emailAddresses[0]?.emailAddress || "",
            employeeId: userData.employeeId.trim(),
            phone: userData.phone?.trim() || null,
            role: userData.role as any,
          },
        })
      }
    } catch (prismaError: any) {
      console.error("Prisma error during user registration:", prismaError)
      
      // Handle specific Prisma errors
      if (prismaError.code === 'P2002') {
        const target = prismaError.meta?.target
        if (Array.isArray(target) && target.includes('employeeId')) {
          return { 
            success: false, 
            error: "This employee ID is already in use. Please choose a different one." 
          }
        } else if (Array.isArray(target) && target.includes('email')) {
          return { 
            success: false, 
            error: "This email address is already registered." 
          }
        } else {
          return { 
            success: false, 
            error: "This information is already in use. Please check your details." 
          }
        }
      }

      if (prismaError.code === 'P1001') {
        return { 
          success: false, 
          error: "Database connection failed. Please try again later." 
        }
      }

      if (prismaError.code === 'P2025') {
        return { 
          success: false, 
          error: "User record not found. Please contact support." 
        }
      }

      return { 
        success: false, 
        error: "Failed to save user information. Please try again." 
      }
    }

    // Update Clerk user with metadata
    try {
      await clerkClient.users.updateUserMetadata(userId, {
        unsafeMetadata: {
          employeeId: userData.employeeId.trim(),
          phone: userData.phone?.trim(),
          role: userData.role,
        },
      })
    } catch (clerkMetadataError: any) {
      console.error("Error updating Clerk user metadata:", clerkMetadataError)
      // Don't fail the entire process for metadata update errors
      // The user is still successfully registered in our database
    }

    console.log("User registration completed successfully")
    return { success: true }
  } catch (error: any) {
    console.error("Error completing user registration:", error)
    
    // Handle different types of errors
    if (error.name === 'AbortError' || error.code === 'ECONNRESET') {
      return { 
        success: false, 
        error: "Request timeout. Please try again." 
      }
    }

    if (error.message?.includes('fetch') || error.message?.includes('network')) {
      return { 
        success: false, 
        error: "Network error. Please check your connection and try again." 
      }
    }

    return { 
      success: false, 
      error: "An unexpected error occurred. Please try again." 
    }
  }
}
