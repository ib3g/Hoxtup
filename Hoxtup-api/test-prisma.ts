import { prisma } from './src/config/database.js'

async function test() {
    try {
        const count = await prisma.notification.count()
        console.log('Notification count:', count)
        process.exit(0)
    } catch (err) {
        console.error('Prisma test failed:', err)
        process.exit(1)
    }
}

test()
