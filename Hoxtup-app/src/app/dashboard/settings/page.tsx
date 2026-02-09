'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { LogOut, User, Building2, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

interface SessionUser {
  id: string
  name: string
  email: string
  role: string
}

export default function SettingsPage() {
  const { t } = useTranslation('settings')
  const router = useRouter()
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/api/auth/get-session`, { credentials: 'include' })
      .then((r) => r.ok ? r.json() : null)
      .then((data: { user?: SessionUser } | null) => {
        if (data?.user) {
          setUser(data.user)
          setName(data.user.name)
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  async function handleSaveName() {
    setSaving(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/update-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        toast.success(t('saved'))
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    await fetch(`${API_URL}/api/auth/sign-out`, {
      method: 'POST',
      credentials: 'include',
    })
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-heading">{t('title')}</h2>

      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="size-4 text-muted-foreground" />
            <h3 className="text-label">{t('profile.title')}</h3>
          </div>

          <div className="space-y-1">
            <Label htmlFor="name">{t('profile.firstName')}</Label>
            <div className="flex gap-2">
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Button onClick={handleSaveName} disabled={saving || name === user?.name}>
                {saving ? t('saving') : t('save')}
              </Button>
            </div>
          </div>

          <div className="space-y-1">
            <Label>{t('profile.email')}</Label>
            <p className="text-body text-muted-foreground">{user?.email}</p>
          </div>

          <div className="space-y-1">
            <Label>{t('role')}</Label>
            <p className="text-body text-muted-foreground">{user?.role}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="size-4 text-muted-foreground" />
            <h3 className="text-label">{t('preferences.title')}</h3>
          </div>

          <div className="space-y-1">
            <Label>{t('preferences.language')}</Label>
            <p className="text-body">{t('language.fr')}</p>
          </div>

          <div className="space-y-1">
            <Label>{t('preferences.timezone')}</Label>
            <p className="text-body text-muted-foreground">{Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
          </div>
        </CardContent>
      </Card>

      <Button variant="destructive" className="w-full" onClick={() => setLogoutOpen(true)}>
        <LogOut className="size-4 mr-2" />
        {t('logout')}
      </Button>

      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('logout')}</DialogTitle>
            <DialogDescription>{t('logoutConfirm')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setLogoutOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              {t('logout')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
