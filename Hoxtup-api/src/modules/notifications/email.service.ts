import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

let transporter: Transporter | null = null

function getTransporter(): Transporter {
  if (!transporter) {
    const host = process.env.SMTP_HOST
    const port = Number(process.env.SMTP_PORT ?? 587)
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS

    if (!host) {
      transporter = nodemailer.createTransport({ jsonTransport: true })
      return transporter
    }

    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      ...(user && pass ? { auth: { user, pass } } : {}),
    })
  }
  return transporter
}

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const transport = getTransporter()
  const from = options.from ?? process.env.SMTP_FROM ?? 'Hoxtup <noreply@hoxtup.com>'

  await transport.sendMail({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
  })
}

export function buildInvitationEmailHtml(params: {
  inviterName: string
  organizationName: string
  role: string
  acceptUrl: string
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
  <div style="background: white; border-radius: 8px; padding: 32px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h1 style="color: #264653; margin-top: 0;">You're invited to join Hoxtup</h1>
    <p style="color: #333; font-size: 16px; line-height: 1.5;">
      <strong>${params.inviterName}</strong> has invited you to join
      <strong>${params.organizationName}</strong> as a <strong>${params.role}</strong>.
    </p>
    <a href="${params.acceptUrl}"
       style="display: inline-block; background: #264653; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin: 16px 0;">
      Accept Invitation
    </a>
    <p style="color: #666; font-size: 14px;">This invitation expires in 48 hours.</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
    <p style="color: #999; font-size: 12px;">If you didn't expect this invitation, you can safely ignore this email.</p>
  </div>
</body>
</html>`
}
