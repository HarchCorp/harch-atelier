import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const users = await prisma.user.findMany({ select: { email: true, accountType: true, role: true, passwordHash: true }, orderBy: { email: 'asc' } })
  for (const u of users) {
    console.log(`${u.email} | ${u.accountType} | ${u.role} | ${u.passwordHash ? 'has_pw(' + u.passwordHash.length + ' chars)' : 'NO_PW'}`)
  }
  console.log(`--- TOTAL: ${users.length} users ---`)
}
main().catch(console.error).finally(() => prisma.$disconnect())
