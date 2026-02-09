import { describe, it, expect } from 'vitest'
import { t } from './index.js'

describe('Backend i18n (Story 1.7)', () => {
  it('should resolve error translation keys', () => {
    expect(t('errors.unauthorized')).toBe('Session invalide ou expirée')
    expect(t('errors.forbidden')).toBe('Accès interdit')
    expect(t('errors.notFound')).toBe('Ressource introuvable')
  })

  it('should interpolate params in templates', () => {
    const result = t('emails.invitation.subject', 'fr', { orgName: 'Riad Marrakech' })
    expect(result).toBe('Vous êtes invité(e) à rejoindre Riad Marrakech sur Hoxtup')
  })

  it('should return key for missing translations', () => {
    expect(t('errors.nonExistent')).toBe('errors.nonExistent')
  })
})
