import type { DefaultSession, DefaultUser } from "next-auth"
import type { JWT, DefaultJWT } from "next-auth/jwt"
import type { Role } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role
      employeeId: string
      supervisorId?: string | null
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: Role
    employeeId: string
    supervisorId?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: Role
    employeeId: string
    supervisorId?: string | null
  }
}
