import 'dotenv/config'
import { prisma } from '../src/lib/db'

async function main() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL?.slice(0, 40) + '...')
  console.log('Trying prisma.user.findUnique...')
  try {
    const user = await prisma.user.findUnique({ where: { email: 'brand@harch.test' } })
    console.log('SUCCESS:', user?.email, user?.accountType)
  } catch (err: any) {
    console.log('ERROR:', err.message)
    console.log('FULL:', err)
  }
}
main().catch(console.error).finally(() => prisma.$disconnect())
