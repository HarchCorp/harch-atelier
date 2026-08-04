import { prisma } from "../src/lib/db";
async function main() {
  const user = await prisma.user.findUnique({ 
    where: { email: "agency@omocto.ma" },
    select: { id: true, email: true, role: true, accountType: true, agencyId: true, isDemo: true, status: true, passwordHash: true }
  });
  console.log("agency user:", user ? {
    id: user.id, email: user.email, role: user.role, accountType: user.accountType,
    agencyId: user.agencyId, isDemo: user.isDemo, status: user.status,
    hasPassword: !!user.passwordHash
  } : "NOT FOUND");
  
  const agency = await prisma.agency.findFirst({ include: { clients: true, admins: true } });
  console.log("agency:", agency ? {
    id: agency.id, name: agency.name, slug: agency.slug,
    clientsCount: agency.clients.length, adminsCount: agency.admins.length
  } : "NOT FOUND");
  
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
