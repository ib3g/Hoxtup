import { resolveTemplate } from './notification-triggers.config.js'

const BASE_TEMPLATE = `<!DOCTYPE html>
<html>
<body style="font-family: Inter, sans-serif; margin: 0; padding: 0; background: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 24px;">
    <div style="background: white; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div style="margin-bottom: 24px;">
        <span style="font-size: 20px; font-weight: 700; color: #264653;">Hoxtup</span><span style="color: #d28370;">.</span>
      </div>
      <h2 style="color: #2c4f5c; margin: 0 0 12px 0; font-size: 18px;">{title}</h2>
      <p style="color: #4a5568; line-height: 1.6; margin: 0 0 24px 0;">{body}</p>
      <a href="{actionUrl}" style="display: inline-block; background: #a06050; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
        {actionLabel}
      </a>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0 16px 0;" />
      <small style="color: #a0aec0;">
        <a href="{unsubscribeUrl}" style="color: #a0aec0;">Se désabonner de ce type de notification</a>
      </small>
    </div>
  </div>
</body>
</html>`

interface EmailContent {
  subject: string
  html: string
}

export function renderEmail(
  title: string,
  body: string,
  vars: Record<string, string> = {},
): EmailContent {
  const actionUrl = vars.actionUrl ?? 'https://app.hoxtup.com'
  const actionLabel = vars.actionLabel ?? 'Voir dans Hoxtup'
  const unsubscribeUrl = vars.unsubscribeUrl ?? 'https://app.hoxtup.com/settings/notifications'

  const html = resolveTemplate(BASE_TEMPLATE, {
    title,
    body,
    actionUrl,
    actionLabel,
    unsubscribeUrl,
    ...vars,
  })

  return { subject: title, html }
}
