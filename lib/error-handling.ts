// Utility functions for consistent error handling across the application

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ErrorDetails {
  code?: string
  field?: string
  meta?: any
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  error: string,
  status: number = 500,
  details?: ErrorDetails
): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error,
      details: details || null,
    }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    }
  )
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(
  data?: T,
  message?: string,
  status: number = 200
): Response {
  return new Response(
    JSON.stringify({
      success: true,
      data: data || null,
      message: message || null,
    }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    }
  )
}

/**
 * Handle Prisma errors and return user-friendly messages
 */
export function handlePrismaError(error: any): {
  message: string
  status: number
} {
  console.error("Prisma error:", error)

  // Unique constraint violation
  if (error.code === "P2002") {
    const target = error.meta?.target
    if (Array.isArray(target)) {
      if (target.includes("employeeId")) {
        return {
          message: "An account with this employee ID already exists.",
          status: 409,
        }
      }
      if (target.includes("email")) {
        return {
          message: "An account with this email address already exists.",
          status: 409,
        }
      }
      if (target.includes("clerkId")) {
        return {
          message: "This user account already exists in the system.",
          status: 409,
        }
      }
    }
    return {
      message: "This information is already in use. Please check your details.",
      status: 409,
    }
  }

  // Record not found
  if (error.code === "P2025") {
    return {
      message: "The requested record was not found.",
      status: 404,
    }
  }

  // Database connection issues
  if (error.code === "P1001") {
    return {
      message: "Database connection failed. Please try again later.",
      status: 503,
    }
  }

  // Authentication failed
  if (error.code === "P1002") {
    return {
      message: "Database authentication failed. Please contact support.",
      status: 503,
    }
  }

  // Foreign key constraint failed
  if (error.code === "P2003") {
    return {
      message: "Invalid reference. Please check the selected values.",
      status: 400,
    }
  }

  // Required field missing
  if (error.code === "P2011") {
    return {
      message: "Required field is missing. Please check your input.",
      status: 400,
    }
  }

  // Default fallback
  return {
    message: "A database error occurred. Please try again.",
    status: 500,
  }
}

/**
 * Handle Clerk authentication errors
 */
export function handleClerkError(error: any): {
  message: string
  status: number
} {
  console.error("Clerk error:", error)

  if (error?.errors?.[0]) {
    const clerkError = error.errors[0]

    switch (clerkError.code) {
      case "form_identifier_exists":
        return {
          message: "An account with this email or username already exists.",
          status: 409,
        }

      case "form_identifier_not_found":
        return {
          message:
            "Invalid email/username or password. Please check your credentials.",
          status: 401,
        }

      case "form_password_incorrect":
        return {
          message: "Incorrect password. Please try again.",
          status: 401,
        }

      case "form_password_pwned":
        return {
          message:
            "This password has been found in a data breach. Please choose a different password.",
          status: 400,
        }

      case "form_param_format_invalid":
        return {
          message:
            "Invalid format for one of the fields. Please check your input.",
          status: 400,
        }

      case "session_exists":
        return {
          message: "You are already signed in.",
          status: 400,
        }

      case "identifier_already_signed_in":
        return {
          message: "Already signed in with this account.",
          status: 400,
        }

      default:
        return {
          message:
            clerkError.longMessage ||
            clerkError.message ||
            "Authentication error occurred.",
          status: 400,
        }
    }
  }

  return {
    message:
      error?.message || "Authentication service error. Please try again.",
    status: 500,
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): {
  valid: boolean
  message?: string
} {
  if (!password) {
    return { valid: false, message: "Password is required." }
  }

  if (password.length < 8) {
    return {
      valid: false,
      message: "Password must be at least 8 characters long.",
    }
  }

  if (!/(?=.*[a-z])/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one lowercase letter.",
    }
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one uppercase letter.",
    }
  }

  if (!/(?=.*\d)/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one number.",
    }
  }

  return { valid: true }
}

/**
 * Validate phone number format
 */
export function isValidPhone(phone: string): boolean {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, "")
  // Basic international phone number validation
  const phoneRegex = /^[\+]?[1-9][\d]{7,14}$/
  return phoneRegex.test(cleaned)
}

/**
 * Show user-friendly error alerts
 */
export function showErrorAlert(message: string) {
  if (typeof window !== "undefined") {
    alert(`Error: ${message}`)
  }
}

/**
 * Show user-friendly success alerts
 */
export function showSuccessAlert(message: string) {
  if (typeof window !== "undefined") {
    alert(`Success: ${message}`)
  }
}
