import { createNeonAuth } from '@neondatabase/auth/next/server'
import { NextResponse } from 'next/server'

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET!,
  },
})

export async function requireAuth() {
  const { data: session } = await auth.getSession()
  if (!session?.user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  return { session }
}
