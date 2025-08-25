import { auth } from "@/auth"

export default auth((req) => {
  const { auth: session } = req
  const isLoggedIn = !!session?.user
  const isOnPublicPage = req.nextUrl.pathname === "/"
  const isOnSignIn = req.nextUrl.pathname === "/sign-in"
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard")

  // Allow access to public pages and sign-in page
  if (isOnPublicPage || isOnSignIn) {
    return
  }

  // Redirect unauthenticated users trying to access protected pages
  if (!isLoggedIn && isOnDashboard) {
    return Response.redirect(new URL("/sign-in", req.nextUrl))
  }

  // Allow authenticated users to access dashboard
  if (isLoggedIn && isOnDashboard) {
    return
  }

  // Redirect authenticated users from root to dashboard
  if (isLoggedIn && isOnPublicPage) {
    return Response.redirect(new URL("/dashboard", req.nextUrl))
  }
})

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|png|gif|svg|ico|webp)).*)",
  ],
}
