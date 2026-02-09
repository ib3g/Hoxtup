'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { authClient } from '@/lib/auth-client'

interface TeamMember {
  id: string
  userId: string
  role: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    image?: string
  }
}

export default function StaffPage() {
  const { t } = useTranslation()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'member' | 'admin' | 'owner'>('member')
  const [inviting, setInviting] = useState(false)

  const loadMembers = useCallback(async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'}/team`,
        { credentials: 'include' },
      )
      if (res.ok) {
        const data = await res.json()
        setMembers(data.members ?? [])
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMembers()
  }, [loadMembers])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviting(true)
    try {
      await authClient.organization.inviteMember({
        email: inviteEmail,
        role: inviteRole,
      })
      setInviteOpen(false)
      setInviteEmail('')
      await loadMembers()
    } catch {
      alert(t('settings:team.inviteFailed'))
    } finally {
      setInviting(false)
    }
  }

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'}/team/${memberId}/role`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ role: newRole }),
        },
      )
      await loadMembers()
    } catch {
      alert(t('settings:team.updateFailed'))
    }
  }

  const handleRemove = async (memberId: string, name: string) => {
    if (!confirm(t('settings:team.confirmRemove', { name }))) return
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'}/team/${memberId}`,
        { method: 'DELETE', credentials: 'include' },
      )
      await loadMembers()
    } catch {
      alert(t('settings:team.removeFailed'))
    }
  }

  const roleLabel: Record<string, string> = {
    owner: t('settings:team.roles.owner'),
    admin: t('settings:team.roles.admin'),
    manager: t('settings:team.roles.manager'),
    staff_autonomous: t('settings:team.roles.staff_autonomous'),
    staff_managed: t('settings:team.roles.staff_managed'),
  }

  const roleBadgeColor: Record<string, string> = {
    owner: 'bg-purple-100 text-purple-800',
    admin: 'bg-blue-100 text-blue-800',
    manager: 'bg-green-100 text-green-800',
    staff_autonomous: 'bg-yellow-100 text-yellow-800',
    staff_managed: 'bg-gray-100 text-gray-800',
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t('settings:team.title')}</h1>
        <button
          onClick={() => setInviteOpen(true)}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90"
        >
          {t('settings:team.invite')}
        </button>
      </div>

      {inviteOpen && (
        <div className="mb-6 rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="mb-3 font-semibold">{t('settings:team.invite')}</h2>
          <form onSubmit={handleInvite} className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label htmlFor="invite-email" className="mb-1 block text-sm font-medium text-foreground">{t('settings:team.email')}</label>
                <input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="invite-role" className="mb-1 block text-sm font-medium text-foreground">{t('settings:team.role')}</label>
                <select
                  id="invite-role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'member' | 'admin' | 'owner')}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="admin">{t('settings:team.roles.admin')}</option>
                  <option value="manager">{t('settings:team.roles.manager')}</option>
                  <option value="staff_autonomous">{t('settings:team.roles.staff_autonomous')}</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={inviting}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
              >
                {inviting ? t('settings:team.sending') : t('settings:team.send')}
              </button>
              <button
                type="button"
                onClick={() => setInviteOpen(false)}
                className="rounded-lg border px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
              >
                {t('common:cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">{t('settings:team.name')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">{t('settings:team.email')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">{t('settings:team.role')}</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase text-muted-foreground">{t('common:actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {members.map((m) => (
              <tr key={m.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {m.user.name}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{m.user.email}</td>
                <td className="whitespace-nowrap px-6 py-4">
                  {m.role === 'owner' ? (
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${roleBadgeColor[m.role] ?? ''}`}>
                      {roleLabel[m.role] ?? m.role}
                    </span>
                  ) : (
                    <select
                      value={m.role}
                      onChange={(e) => handleRoleChange(m.id, e.target.value)}
                      aria-label={t('settings:team.roleOf', { name: m.user.name })}
                      className="rounded border px-2 py-1 text-xs"
                    >
                      <option value="admin">{t('settings:team.roles.admin')}</option>
                      <option value="manager">{t('settings:team.roles.manager')}</option>
                      <option value="staff_autonomous">{t('settings:team.roles.staff_autonomous')}</option>
                      <option value="staff_managed">{t('settings:team.roles.staff_managed')}</option>
                    </select>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                  {m.role !== 'owner' && (
                    <button
                      onClick={() => handleRemove(m.id, m.user.name)}
                      className="text-danger hover:text-danger/80"
                    >
                      {t('settings:team.remove')}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm text-muted-foreground">
                  {t('settings:team.empty')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
