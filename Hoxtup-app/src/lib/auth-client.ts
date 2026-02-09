import { createAuthClient } from 'better-auth/react'
import { organizationClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL ?? 'http://localhost:8000',
  plugins: [organizationClient()],
})

export const { useSession, signUp, signIn, signOut } = authClient
