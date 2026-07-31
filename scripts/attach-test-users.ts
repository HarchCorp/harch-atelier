// One-off script: attach existing test users to the first company
// so they can access the dashboards without onboarding.
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const company = await prisma.company.findFirst({ orderBy: { createdAt: 'asc' } })
  if (!company) { console.log('No company found'); return }
  console.log(`Primary company: ${company.name} (${company.id})`)

  const testEmails = [
    'amine@harchcorp.com',
    'brand@harch.test',
    'competitor@harch.test',
    'investor@harch.test',
    'alpha@harch.test',
  ]

  for (const email of testEmails) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) { console.log(`  SKIP ${email} (not found)`); continue }
    if (user.companyId) { console.log(`  SKIP ${email} (already has company)`); continue }
    await prisma.user.update({
      where: { id: user.id },
      data: { companyId: company.id, onboardingCompleted: true },
    })
    console.log(`  ATTACHED ${email} → ${company.name}`)
  }
  console.log('Done')
}

main().catch(console.error).finally(() => prisma.$disconnect())
