import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { organization } from 'better-auth/plugins'
import nodemailer from 'nodemailer'
import { prisma } from './database.js'
import { config } from './index.js'
import { logger } from './logger.js'

const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  ...(config.SMTP_USER ? { auth: { user: config.SMTP_USER, pass: config.SMTP_PASS } } : {}),
})

const FRONTEND_URL = config.CORS_ORIGINS.split(',')[0].trim()

export const auth = betterAuth({
  baseURL: config.BETTER_AUTH_URL,
  secret: config.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  trustedOrigins: config.CORS_ORIGINS.split(',').map((o) => o.trim()),
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      async sendInvitationEmail({ email, organization: org, inviter, id }) {
        const acceptUrl = `${FRONTEND_URL}/invite/accept?id=${id}&email=${encodeURIComponent(email)}`
        const inviterName = inviter.user.name || inviter.user.email
        try {
          await transporter.sendMail({
            from: config.SMTP_FROM,
            to: email,
            subject: `Invitation à rejoindre ${org.name} sur Hoxtup`,
            html: `
              <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                <h2>Vous êtes invité(e) !</h2>
                <p><strong>${inviterName}</strong> vous invite à rejoindre l'organisation <strong>${org.name}</strong> sur Hoxtup.</p>
                <p style="margin: 24px 0;">
                  <a href="${acceptUrl}" style="background: #d28370; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
                    Accepter l'invitation
                  </a>
                </p>
                <p style="color: #666; font-size: 14px;">Si le bouton ne fonctionne pas, copiez ce lien : <br/>${acceptUrl}</p>
              </div>
            `,
          })
          logger.info({ email, orgId: org.id }, 'Invitation email sent')
        } catch (err) {
          logger.error({ err, email, orgId: org.id }, 'Failed to send invitation email')
        }
      },
    }),
  ],
  user: {
    modelName: 'User',
    additionalFields: {
      firstName: { type: 'string', required: false, fieldName: 'firstName' },
      lastName: { type: 'string', required: false, fieldName: 'lastName' },
      role: { type: 'string', required: false, defaultValue: 'STAFF_MANAGED', fieldName: 'role' },
      preferredLanguage: { type: 'string', required: false, defaultValue: 'fr', fieldName: 'preferredLanguage' },
    },
  },
})

export type Auth = typeof auth
