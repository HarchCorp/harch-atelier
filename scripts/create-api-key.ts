import { prisma } from "../src/lib/db";
import crypto from "crypto";

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "dircom@centraledanone.ma" },
    select: { id: true, companyId: true },
  });
  
  if (!user || !user.companyId) {
    console.log("User not found or no company");
    process.exit(1);
  }

  const rawKey = "harch_" + crypto.randomBytes(24).toString("hex");
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");
  const keyPrefix = rawKey.slice(0, 12);

  const apiKey = await prisma.apiKey.create({
    data: {
      userId: user.id,
      keyHash,
      keyPrefix,
      name: "Production API Key",
      tier: "enterprise",
    },
  });

  console.log("✓ API key created");
  console.log(`  Raw key (save this): ${rawKey}`);
  console.log(`  Prefix: ${keyPrefix}`);

  const webhook = await prisma.webhook.create({
    data: {
      userId: user.id,
      companyId: user.companyId,
      url: "https://example.com/webhook/harch",
      secret: crypto.randomBytes(32).toString("hex"),
      events: JSON.stringify(["alert.critical", "alert.warning", "report.ready"]),
      isActive: true,
    },
  });

  console.log(`\n✓ Webhook created`);
  console.log(`  URL: ${webhook.url}`);
  console.log(`  Events: ${webhook.events}`);

  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
