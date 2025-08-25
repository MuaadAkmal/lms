import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const authConfig = {
  pages: {
    signIn: "/sign-in",
  },
  trustHost: true,
  callbacks: {
    jwt({ token, user }: any) {
      if (user) {
        token.role = user.role
        token.employeeId = user.employeeId
        token.supervisorId = user.supervisorId || null
      }
      return token
    },
    session({ session, token }: any) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role
        session.user.employeeId = token.employeeId
        session.user.supervisorId = token.supervisorId
      }
      return session
    },
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        employeeId: { label: "Employee ID", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.employeeId || !credentials?.password) {
            console.log("Missing credentials")
            return null
          }

          const user = await prisma.user.findUnique({
            where: {
              employeeId: credentials.employeeId as string,
            },
          })

          if (!user) {
            console.log("User not found")
            return null
          }

          // Type assertion for password field
          const userWithPassword = user as any

          const passwordsMatch = await bcrypt.compare(
            credentials.password as string,
            userWithPassword.password
          )

          if (!passwordsMatch) {
            console.log("Password mismatch")
            return null
          }

          console.log("User authenticated successfully:", user.employeeId)

          // Return user object that matches NextAuth User type
          return {
            id: user.id,
            name: `${(user as any).firstName} ${(user as any).lastName}`,
            email: user.email,
            role: user.role,
            employeeId: user.employeeId,
            supervisorId: user.supervisorId ?? undefined,
          } as any
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
} satisfies NextAuthConfig
