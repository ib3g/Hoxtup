import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { organization } from 'better-auth/plugins'
import { defaultAc, ownerAc, adminAc } from 'better-auth/plugins/organization/access'
import { prisma } from '../../config/database.js'
import { sendEmail, buildInvitationEmailHtml } from '../notifications/email.service.js'

const isProduction = process.env.NODE_ENV === 'production'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const managerAc = defaultAc.newRole({ member: ['create'], invitation: ['create', 'cancel'] }) as any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const noPermissions = defaultAc.newRole({}) as any

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:8000',

  database: prismaAdapter(prisma, { provider: 'postgresql' }),

  emailAndPassword: {
    enabled: true,
  },

  plugins: [
    organization({
      creatorRole: 'owner',
      roles: {
        owner: ownerAc,
        admin: adminAc,
        manager: managerAc,
        staff_autonomous: noPermissions,
        staff_managed: noPermissions,
      },
      sendInvitationEmail: async ({ id, email, role, organization: org, inviter }) => {
        const appUrl = process.env.APP_URL ?? 'http://localhost:3000'
        const acceptUrl = `${appUrl}/invite?id=${id}`
        const html = buildInvitationEmailHtml({
          inviterName: inviter.user.name,
          organizationName: org.name,
          role,
          acceptUrl,
        })
        await sendEmail({
          to: email,
          subject: `You're invited to join ${org.name} on Hoxtup`,
          html,
        })
      },
    }),
  ],

  trustedOrigins: [
    'https://app.hoxtup.com',
    'http://localhost:3000',
  ],

  session: {
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },

  advanced: {
    crossSubDomainCookies: isProduction
      ? { enabled: true, domain: '.hoxtup.com' }
      : { enabled: false },
  },
})
