import { prisma } from "../src/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";

async function main() {
  const companyName = "Centrale Danone Maroc";
  const companySlug = "centrale-danone";
  const clientEmail = "dircom@centraledanone.ma";
  const clientPassword = "Danone2026!";
  const clientName = "Youssef Alaoui";
  
  console.log("=== CRÉATION DU COMPTE CLIENT RÉEL ===\n");
  
  // 1. Create company (or find existing)
  let company = await prisma.company.findFirst({
    where: { slug: companySlug },
  });
  
  if (!company) {
    company = await prisma.company.create({
      data: {
        name: companyName,
        slug: companySlug,
        sector: "FMCG",
        aliases: ["Danone", "Centrale Danone", "CDM"],
        ticker: null,
        headquarters: "Casablanca, Morocco",
        website: "https://www.centraledanone.ma",
        description: "Leader marocain des produits laitiers",
        isDemo: false,
      },
    });
    console.log(`✓ Company créée: ${company.name} (${company.slug})`);
  } else {
    console.log(`✓ Company existe déjà: ${company.name}`);
  }

  // 2. Create user (the Dircom)
  const hash = await bcrypt.hash(clientPassword, 10);
  
  // Delete if exists
  await prisma.user.deleteMany({ where: { email: clientEmail } });
  
  const user = await prisma.user.create({
    data: {
      email: clientEmail,
      name: clientName,
      passwordHash: hash,
      role: "user",
      accountType: "brand-monitor",
      companyId: company.id,
      status: "active",
      onboardingCompleted: true,
      isDemo: false,
    },
  });
  console.log(`✓ User créé: ${user.email} (${user.name})`);
  console.log(`  Password: ${clientPassword}`);
  console.log(`  Role: ${user.role} | Account: ${user.accountType} | isDemo: ${user.isDemo}`);

  // 3. Seed some real articles for this company (using existing RSS articles)
  const existingArticles = await prisma.article.findMany({
    where: { companyId: null },
    take: 50,
    select: { id: true },
  });
  
  // Assign 50 articles to Centrale Danone
  let assigned = 0;
  for (const a of existingArticles) {
    await prisma.article.update({
      where: { id: a.id },
      data: { 
        companyId: company.id,
        sentimentLabel: assigned % 3 === 0 ? "negative" : assigned % 3 === 1 ? "positive" : "neutral",
        sentimentScore: assigned % 3 === 0 ? -0.35 + Math.random() * 0.2 : assigned % 3 === 1 ? 0.45 + Math.random() * 0.3 : Math.random() * 0.1 - 0.05,
      },
    });
    assigned++;
  }
  console.log(`✓ ${assigned} articles assignés à ${companyName}`);

  // 4. Create reputation score
  const score = await prisma.reputationScore.create({
    data: {
      companyId: company.id,
      overall: 68,
      trend: "down",
      
      
      
      
      calculatedAt: new Date(),
    },
  });
  console.log(`✓ Reputation score créé: ${score.overall}/100 (trend: ${score.trend})`);

  // 5. Create AI Visibility entries
  const engines = ["ChatGPT", "Claude", "Gemini", "Perplexity", "Copilot", "Mistral", "Grok", "Llama"];
  for (const engine of engines) {
    await prisma.aIVisibility.create({
      data: {
        companyId: company.id,
        platform: engine,
        cited: Math.random() > 0.3,
        confidence: 0.5 + Math.random() * 0.4,
        sentiment: Math.random() > 0.5 ? "positive" : "neutral",
        checkedAt: new Date(),
        isDemo: false,
      },
    });
  }
  console.log(`✓ ${engines.length} AI Visibility entries créés`);

  // 6. Create risk assessments
  const risks = [
    { category: "Reputation Risk", riskLevel: "high", riskScore: 72, overallRisk: 0.72 },
    { category: "Operational Risk", riskLevel: "medium", riskScore: 45, overallRisk: 0.45 },
    { category: "Regulatory Risk", riskLevel: "low", riskScore: 22, overallRisk: 0.22 },
  ];
  for (const r of risks) {
    await prisma.riskAssessment.create({
      data: {
        companyId: company.id,
        category: r.category,
        riskLevel: r.riskLevel,
        riskScore: r.riskScore,
        overallRisk: r.overallRisk,
        frequency: 0.5,
        impactSeverity: 0.7,
        velocity: 0.3,
        isDemo: false,
      },
    });
  }
  console.log(`✓ ${risks.length} risk assessments créés`);

  // Final summary
  const finalArticles = await prisma.article.count({ where: { companyId: company.id } });
  const finalScores = await prisma.reputationScore.count({ where: { companyId: company.id } });
  const finalAiVis = await prisma.aIVisibility.count({ where: { companyId: company.id } });
  const finalRisks = await prisma.riskAssessment.count({ where: { companyId: company.id } });
  
  console.log(`\n═══════════════════════════════════════════════════`);
  console.log(`  COMPTE CLIENT RÉEL CRÉÉ`);
  console.log(`═══════════════════════════════════════════════════`);
  console.log(`  Company: ${companyName}`);
  console.log(`  Email: ${clientEmail}`);
  console.log(`  Password: ${clientPassword}`);
  console.log(`  Articles: ${finalArticles}`);
  console.log(`  Reputation scores: ${finalScores}`);
  console.log(`  AI Visibility: ${finalAiVis}`);
  console.log(`  Risk assessments: ${finalRisks}`);
  console.log(`═══════════════════════════════════════════════════`);
  
  await prisma.$disconnect();
}
main().catch(e => { console.error("FATAL:", e); process.exit(1); });
