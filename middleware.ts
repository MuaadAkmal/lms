import { authMiddleware } from "@clerk/nextjs"

export default authMiddleware({
  publicRoutes: ["/"],
  afterAuth(auth, req, evt) {
    // If user is signed in and trying to access onboarding, allow it
    if (auth.userId && req.nextUrl.pathname === "/onboarding") {
      return
    }

    // If user is signed in and trying to access public routes, redirect to dashboard
    if (auth.userId && req.nextUrl.pathname === "/") {
      return Response.redirect(new URL("/dashboard", req.url))
    }
  },
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
