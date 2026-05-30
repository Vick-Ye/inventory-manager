import { auth } from '@/lib/auth'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  return auth.middleware({ loginUrl: '/auth/sign-in' })(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|auth/sign-in|auth/sign-up|api/auth).*)'],
}
