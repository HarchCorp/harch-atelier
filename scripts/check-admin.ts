import { prisma } from "../src/lib/db";
async function main() {
  const admin = await prisma.user.findFirst({
    where: { role: "admin" },
    select: { id: true, email: true, role: true, name: true, status: true, isDemo: true }
  });
  console.log("admin user:", admin);
  
  const requests = await prisma.accessRequest.count();
  console.log("access requests:", requests);
  
  const sampleRequests = await prisma.accessRequest.findMany({
    take: 3,
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, name: true, company: true, status: true, createdAt: true }
  });
  console.log("sample requests:", sampleRequests);
  
  const invitations = await prisma.invitation.count();
  console.log("invitations:", invitations);
  
  const auditLogs = await prisma.auditLog.count();
  console.log("audit logs:", auditLogs);
  
  const systemLogs = await prisma.systemLog.count();
  console.log("system logs:", systemLogs);
  
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
