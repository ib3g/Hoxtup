'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const FIXTURE_USERS = [
  { email: 'barry@hoxtup.com', name: 'Barry Owner', role: 'OWNER' },
  { email: 'admin@hoxtup.com', name: 'Alice Admin', role: 'ADMIN' },
  { email: 'manager@hoxtup.com', name: 'Marc Manager', role: 'MANAGER' },
  { email: 'staff.auto@hoxtup.com', name: 'Sophie Autonomous', role: 'STAFF_AUTONOMOUS' },
] as const

const DEMO_PASSWORD = 'Demo1234!'

export default function DevQuickLogin() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleClick(email: string) {
    setLoading(email)
    setError(null)
    const result = await authClient.signIn.email({
      email,
      password: DEMO_PASSWORD,
    })
    if (result.error) {
      setError(`Échec pour ${email}`)
      setLoading(null)
      return
    }
    router.push('/dashboard')
  }

  if (process.env.NODE_ENV !== 'development') return null

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <p className="text-caption font-medium text-muted-foreground text-center">
          Connexion rapide (dev)
        </p>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        {FIXTURE_USERS.map((user) => (
          <button
            key={user.email}
            type="button"
            disabled={loading !== null}
            onClick={() => handleClick(user.email)}
            className="flex flex-col items-start rounded-md border p-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
          >
            <span className="font-medium">{user.name}</span>
            <span className="text-xs text-muted-foreground">{user.role}</span>
            {loading === user.email && (
              <span className="text-xs text-primary mt-1">Connexion...</span>
            )}
          </button>
        ))}
        {error && (
          <p className="col-span-2 text-caption text-danger text-center">{error}</p>
        )}
      </CardContent>
    </Card>
  )
}
