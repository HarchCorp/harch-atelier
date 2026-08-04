import { prisma } from "../src/lib/db";
async function main() {
  await prisma.user.update({
    where: { email: "amine@harchcorp.com" },
    data: { isDemo: false },
  });
  console.log("✓ admin isDemo set to false");
  
  // Also create a proper test agency client for B2B2B chaos
  const agency = await prisma.agency.findFirst({ where: { slug: "omocto" } });
  if (agency) {
    console.log("✓ Omocto agency exists:", agency.id);
    
    // Count existing sub-clients
    const count = await prisma.agencyClient.count({ where: { agencyId: agency.id } });
    console.log("  existing sub-clients:", count);
  }
  
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
