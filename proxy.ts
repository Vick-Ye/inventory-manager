import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const allowSignup = process.env.ALLOW_SIGNUP === 'true'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/api/auth/')) {
    if (pathname === '/api/auth/sign-up/email' && !allowSignup) {
      return NextResponse.json({ error: 'Sign-ups are disabled' }, { status: 403 })
    }
    return NextResponse.next()
  }

  if (pathname === '/auth/sign-up') {
    if (!allowSignup) {
      return NextResponse.redirect(new URL('/auth/sign-in', request.url))
    }
    return NextResponse.next()
  }

  if (pathname.startsWith('/auth/')) {
    return NextResponse.next()
  }

  const hasSession = request.cookies.has('__Secure-neon-auth.session_token')

  if (pathname.startsWith('/api/')) {
    if (!hasSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.next()
  }

  if (!hasSession) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
