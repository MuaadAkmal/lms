import { auth } from '@/auth'

export default auth((req) => {
  const { auth: session } = req
  const isLoggedIn = !!session?.user
  const isOnPublicPage = req.nextUrl.pathname === '/'
  const isOnSignIn = req.nextUrl.pathname === '/sign-in'

  if (isOnPublicPage && isLoggedIn) {
    return Response.redirect(new URL('/dashboard', req.nextUrl))
  }

  if (!isLoggedIn && !isOnPublicPage && !isOnSignIn) {
    return Response.redirect(new URL('/sign-in', req.nextUrl))
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|png|gif|svg|ico|webp)).*)'],
}
