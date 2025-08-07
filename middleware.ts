import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default async function middleware(req: NextRequest) {
  const token = await getToken({ req })
  const isAuthenticated = !!token

  // Redirect authenticated users away from /
  if (req.nextUrl.pathname === '/' && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Only admin can access /users & /report
  const protectedPaths = ['/users', '/report']
  const isProtected = protectedPaths.some(path =>
    req.nextUrl.pathname.startsWith(path)
  )
  if (isProtected && (!token || token.role !== 'admin')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Jika butuh proteksi login di semua halaman lain:
  if (!isAuthenticated && req.nextUrl.pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|code|scan|logout|blocked|_next/static|_next/image|favicon.ico|assets).*)',
  ],
}