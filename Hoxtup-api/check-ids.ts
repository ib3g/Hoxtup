import { prisma } from './src/config/database.js'

async function test() {
    try {
        const member = await prisma.member.findFirst()
        console.log('Member ID sample:', member?.id)
        const org = await prisma.organization.findFirst()
        console.log('Org ID sample:', org?.id)
        process.exit(0)
    } catch (err) {
        console.error('Test failed:', err)
        process.exit(1)
    }
}

test()
