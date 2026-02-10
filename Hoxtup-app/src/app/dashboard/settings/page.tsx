'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { LogOut, User, Globe, Pencil, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL ?? 'http://localhost:8000'
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

interface OrgInfo {
  id: string
  name: string
  currencyCode: string
  timezone: string
  createdAt: string
}

export default function SettingsPage() {
  const { t } = useTranslation('settings')
  const router = useRouter()
  const { user, activeOrg, signOut } = useAuth()
  const memberRole = activeOrg?.members?.[0]?.role ?? 'member'
  const isAdmin = ['owner', 'admin'].includes(memberRole)

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.name ?? '')
  const [saving, setSaving] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)

  const [org, setOrg] = useState<OrgInfo | null>(null)
  const [editingOrg, setEditingOrg] = useState(false)
  const [orgName, setOrgName] = useState('')
  const [orgCurrency, setOrgCurrency] = useState('EUR')
  const [savingOrg, setSavingOrg] = useState(false)

  const fetchOrg = useCallback(() => {
    fetch(`${API_URL}/billing`, { credentials: 'include' })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.organization) {
          setOrg(data.organization)
          setOrgName(data.organization.name)
          setOrgCurrency(data.organization.currencyCode ?? 'EUR')
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => { fetchOrg() }, [fetchOrg])

  async function handleSaveName() {
    setSaving(true)
    try {
      const res = await fetch(`${AUTH_URL}/api/auth/update-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        setEditing(false)
        toast.success(t('saved'))
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveOrg() {
    setSavingOrg(true)
    try {
      const res = await fetch(`${API_URL}/team/organization`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: orgName.trim(), currencyCode: orgCurrency }),
      })
      if (res.ok) {
        setEditingOrg(false)
        fetchOrg()
        toast.success(t('saved'))
      }
    } finally {
      setSavingOrg(false)
    }
  }

  async function handleLogout() {
    await signOut()
    router.push('/login')
  }

  const initials = user?.name
    ?.split(' ')
    .map((n: string) => n.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('') ?? '?'

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="size-4 text-muted-foreground" />
                <h3 className="text-label">{t('profile.title')}</h3>
              </div>
              {!editing && (
                <Button variant="ghost" size="xs" onClick={() => setEditing(true)}>
                  <Pencil className="size-3.5 mr-1" />
                  {t('edit')}
                </Button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary text-lg font-semibold shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-heading truncate">{user?.name}</p>
                <p className="text-caption text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            {editing ? (
              <div className="space-y-3 pt-2 border-t">
                <div className="space-y-1">
                  <Label htmlFor="name">{t('profile.fullName')}</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveName} disabled={saving || name === user?.name}>
                    {saving ? t('saving') : t('save')}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { setEditing(false); setName(user?.name ?? '') }}>
                    {t('cancel')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <p className="text-micro text-muted-foreground">{t('profile.email')}</p>
                  <p className="text-caption">{user?.email}</p>
                </div>
                <div>
                  <p className="text-micro text-muted-foreground">{t('role')}</p>
                  <Badge variant="secondary">{memberRole}</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {isAdmin && org && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="size-4 text-muted-foreground" />
                    <h3 className="text-label">{t('organization.title')}</h3>
                  </div>
                  {!editingOrg && (
                    <Button variant="ghost" size="xs" onClick={() => setEditingOrg(true)}>
                      <Pencil className="size-3.5 mr-1" />
                      {t('edit')}
                    </Button>
                  )}
                </div>

                {editingOrg ? (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label>{t('organization.name')}</Label>
                      <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label>{t('organization.currency')}</Label>
                      <Select value={orgCurrency} onValueChange={setOrgCurrency}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="MAD">MAD (د.م.)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveOrg} disabled={savingOrg || (!orgName.trim())}>
                        {savingOrg ? t('saving') : t('save')}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { setEditingOrg(false); setOrgName(org.name); setOrgCurrency(org.currencyCode ?? 'EUR') }}>
                        {t('cancel')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-micro text-muted-foreground">{t('organization.name')}</p>
                      <p className="text-caption">{org.name}</p>
                    </div>
                    <div>
                      <p className="text-micro text-muted-foreground">{t('organization.currency')}</p>
                      <p className="text-caption">{org.currencyCode === 'MAD' ? 'MAD (د.م.)' : 'EUR (€)'}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="size-4 text-muted-foreground" />
                <h3 className="text-label">{t('preferences.title')}</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-micro text-muted-foreground">{t('preferences.language')}</p>
                  <p className="text-caption">{t('language.fr')}</p>
                </div>
                <div>
                  <p className="text-micro text-muted-foreground">{t('preferences.timezone')}</p>
                  <p className="text-caption">{Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button variant="destructive" className="w-full" onClick={() => setLogoutOpen(true)}>
            <LogOut className="size-4 mr-2" />
            {t('logout')}
          </Button>
        </div>
      </div>

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
