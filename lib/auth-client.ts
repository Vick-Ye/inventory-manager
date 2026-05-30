'use client'

import { createAuthClient } from 'better-auth/react'

const betterAuthClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3456',
})

export const authClient = betterAuthClient

export { betterAuthClient }
