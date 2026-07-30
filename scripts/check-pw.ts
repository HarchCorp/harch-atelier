import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient()
async function main() {
  const users = await prisma.user.findMany({ select: { email: true, passwordHash: true }, orderBy: { email: 'asc' } })
  const password = 'HarchTest2026!'
  for (const u of users) {
    const ok = await bcrypt.compare(password, u.passwordHash)
    console.log(`${u.email} | password matches: ${ok}`)
  }
}
main().catch(console.error).finally(() => prisma.$disconnect())
