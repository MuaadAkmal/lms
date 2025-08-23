import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const authConfig = {
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard")
      if (isOnDashboard) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl))
      }
      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.employeeId = (user as any).employeeId
      }
      return token
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        ;(session.user as any).role = token.role
        ;(session.user as any).employeeId = token.employeeId
      }
      return session
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.employeeId || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            employeeId: credentials.employeeId as string,
          },
        })

        if (!user) {
          return null
        }

        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!passwordsMatch) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          employeeId: user.employeeId,
        }
      },
    }),
  ],
} satisfies NextAuthConfig
