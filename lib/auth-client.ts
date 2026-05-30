'use client'

import { createAuthClient } from 'better-auth/react'

const betterAuthClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SITE_URL || '',
})

export const authClient = betterAuthClient

export { betterAuthClient }
