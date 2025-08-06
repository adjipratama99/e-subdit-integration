import { getToken } from 'next-auth/jwt'
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequestWithAuth } from 'next-auth/middleware'

export default async function middleware(req: NextRequestWithAuth, event: any) {
    const token = await getToken({ req })
    const isAuthenticated = !!token

    // Redirect authenticated users away from /login pages
    if (
        req.nextUrl.pathname === '/' && isAuthenticated
    ) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    

    const protectedPaths = ['/users', '/report']
    const isProtected = protectedPaths.some(path =>
        req.nextUrl.pathname.startsWith(path)
    )

    // Role-based redirect: Only admins can access /users
    if (isProtected) {
        if (!token || token.role !== 'admin') {
            return NextResponse.redirect(new URL('/dashboard', req.url))
        }
    }

    const authMiddleware = withAuth({
        pages: {
            signIn: '/login',
            error: '/login',
        }
    })

    return authMiddleware(req, event)
}

export const config = {
    matcher: [
        '/((?!api|code|scan|logout|blocked|_next/static|_next/image|favicon.ico|assets).*)',
    ],
}
