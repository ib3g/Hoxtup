'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'

type InviteRole = 'admin' | 'member'
const INVITE_ROLES: InviteRole[] = ['admin', 'member']

interface InviteMemberSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  organizationId: string
}

export function InviteMemberSheet({ open, onOpenChange, onSuccess, organizationId }: InviteMemberSheetProps) {
  const { t } = useTranslation('team')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<InviteRole>('member')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    if (!email.trim()) return
    setSubmitting(true)
    try {
      const res = await authClient.organization.inviteMember({
        email: email.trim(),
        role,
        organizationId,
      })
      if (res.error) {
        toast.error(res.error.message ?? t('inviteForm.error'))
      } else {
        toast.success(t('inviteForm.success'))
        setEmail('')
        setRole('member')
        onOpenChange(false)
        onSuccess()
      }
    } catch {
      toast.error(t('inviteForm.error'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{t('invite')}</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="invite-email">{t('inviteForm.email')}</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="nom@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>{t('inviteForm.role')}</Label>
            <Select value={role} onValueChange={(v) => setRole(v as InviteRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INVITE_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {t(`roles.${r}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            className="w-full mt-4"
            onClick={handleSubmit}
            disabled={submitting || !email.trim()}
          >
            {submitting ? t('inviteForm.sending') : t('inviteForm.submit')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
