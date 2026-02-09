'use client'

import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { UserPlus, Users, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

interface Member {
  id: string
  userId: string
  role: string
  createdAt: string
  user: { id: string; name: string; email: string }
}

const ROLES = ['owner', 'admin', 'manager', 'member', 'staff_autonomous', 'staff_managed'] as const

export default function TeamPage() {
  const { t } = useTranslation('team')
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [removeTarget, setRemoveTarget] = useState<Member | null>(null)

  const fetchMembers = useCallback(() => {
    setLoading(true)
    fetch(`${API_URL}/team`, { credentials: 'include' })
      .then((r) => r.ok ? r.json() : [])
      .then((data: Member[]) => setMembers(data))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchMembers() }, [fetchMembers])

  async function handleRoleChange(memberId: string, newRole: string) {
    const res = await fetch(`${API_URL}/team/${memberId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ role: newRole }),
    })
    if (res.ok) {
      fetchMembers()
      toast.success(t('roleChanged'))
    }
  }

  async function handleRemove() {
    if (!removeTarget) return
    const res = await fetch(`${API_URL}/team/${removeTarget.id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (res.ok || res.status === 204) {
      setRemoveTarget(null)
      fetchMembers()
      toast.success(t('memberRemoved'))
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2 flex-wrap">
        <Button disabled size="sm">
          <UserPlus className="size-4 mr-1" />
          <span className="hidden sm:inline">{t('invite')}</span>
          <span className="sm:hidden">{t('invite')}</span>
        </Button>
      </div>

      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
            <Users className="size-6 text-muted-foreground" />
          </div>
          <p className="text-label mb-1">{t('empty.title')}</p>
          <p className="text-body text-muted-foreground">{t('empty.description')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {members.map((m) => (
            <Card key={m.id}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary font-medium">
                  {m.user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-label truncate">{m.user.name}</p>
                  <p className="text-micro text-muted-foreground truncate">{m.user.email}</p>
                </div>
                <Select value={m.role} onValueChange={(val) => handleRoleChange(m.id, val)}>
                  <SelectTrigger className="w-28 sm:w-40 shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        <Badge variant="secondary">{t(`roles.${r}`)}</Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="sm" onClick={() => setRemoveTarget(m)}>
                  <Trash2 className="size-4 text-muted-foreground" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!removeTarget} onOpenChange={() => setRemoveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('actions.remove')}</DialogTitle>
            <DialogDescription>{t('actions.removeConfirm')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRemoveTarget(null)}>
              {t('actions.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleRemove}>
              {t('actions.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
