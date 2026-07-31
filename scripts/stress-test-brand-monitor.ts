// ═══════════════════════════════════════════════════════════════
//  scripts/stress-test-brand-monitor.ts
//
//  Generates 10,000 synthetic alerts to test the Brand Monitor
//  Dashboard's resilience under a "Black Swan flood" scenario.
//
//  Run (insert 10k alerts):
//    bun --ts scripts/stress-test-brand-monitor.ts
//
//  Run (cleanup all stress-test data):
//    bun --ts scripts/stress-test-brand-monitor.ts --cleanup
//
//  What it does:
//    - Connects to Prisma via ../src/lib/db (which loads the
//      correct DATABASE_URL from .env manually — bypassing the
//      stale shell env var, see src/lib/db.ts for the pattern).
//    - Finds the primary company (first by createdAt asc, same as
//      the /api/console/alerts route).
//    - Inserts 10,000 Article rows with sentimentLabel = "negative"
//      so they all surface as alerts in the dashboard.
//    - Varied: sources (Moroccan media, intl media, financial,
//      social, AI), languages (Arabic, Darija, French, English),
//      sentiment scores (-0.95 to -0.40, all qualify as alerts),
//      timestamps (spread over 30 days), severity (< -0.6 →
//      critical in the API; -0.4 to -0.6 → high).
//    - Inserts in batches of 500 to avoid Neon statement timeout.
//    - Marks every inserted row with source starting with
//      "[STRESS]" so --cleanup can target only test data.
//    - Prints progress + final count.
// ═══════════════════════════════════════════════════════════════

import { prisma } from "../src/lib/db";

// ─── Constants ──────────────────────────────────────────────────

const TOTAL_ALERTS = 10_000;
const BATCH_SIZE = 500;
const DAYS_BACK = 30;
const STRESS_MARKER = "[STRESS]";

// ─── Source pool (matches SOURCE_INTEL_TABLE in BrandMonitorDashboard) ──
// Each source maps to a known sourceType / authority / geo so the
// dashboard can place every alert on the 3D map and in the matrix.

interface SourceTemplate {
  source: string;
  titlesByLang: {
    ar: string[];
    darija: string[];
    fr: string[];
    en: string[];
  };
}

const SOURCE_POOL: SourceTemplate[] = [
  {
    source: "Hespress",
    titlesByLang: {
      ar: [
        "تحقيق: شركة تتعرض لانتقادات واسعة بسبب سياساتها الجديدة",
        "تقرير: تراجع ثقة المستثمرين في القطاع البنكي المغربي",
        "جدل حول قرارات مجلس الإدارة الأخيرة",
      ],
      darija: [
        "واخا الشركة قالت ليهم بلي غادي يبدلو، ولكن ما شي مبيّن",
        "بزاف ديال الناس مستاغربين من القرار الجديد دالشركة",
        "دابا الشركات الكبار خاصهم يكونو أكثر شفافية مع الناس",
      ],
      fr: [
        "Enquete: la société sous le feu des critiques",
        "Maroc: les investisseurs inquiets pour le secteur bancaire",
      ],
      en: [
        "Investigation: company faces widespread criticism",
      ],
    },
  },
  {
    source: "Le360",
    titlesByLang: {
      ar: ["الشركة تعلن عن خطة إعادة هيكلة طموحة"],
      darija: ["الشركة بغات تبدل بزاف ديال الحوايج"],
      fr: [
        "L'entreprise annonce un plan de restructuration ambitieux",
        "Casablanca: les marchés réagissent à la nouvelle annonce",
        "Economie: la société renforce sa position au Maroc",
      ],
      en: ["Company announces ambitious restructuring plan"],
    },
  },
  {
    source: "TelQuel",
    titlesByLang: {
      fr: [
        "Enquete: les dessous d'une crise de reputation",
        "Maroc: comment la societe gere sa communication de crise",
        "Economie: le secteur face a de nouveaux defis",
      ],
      en: ["Investigation: behind a reputation crisis"],
      ar: ["تحقيق: خلفيات أزمة سمعة جديدة"],
      darija: ["تحقيق على أزمة السمعة ديال الشركة"],
    },
  },
  {
    source: "Medias24",
    titlesByLang: {
      fr: [
        "Marche: la societe sous pression apres les resultats",
        "Casablanca: les investisseurs suivent de pres la situation",
      ],
      en: ["Market: company under pressure after results"],
      ar: ["السوق: الشركة تحت الضغط بعد النتائج"],
      darija: ["السوق مضغوط على الشركة بعد النتائج"],
    },
  },
  {
    source: "L'Economiste",
    titlesByLang: {
      fr: [
        "Bourse: volatilite sur les valeurs bancaires",
        "Economie: les défis de la croissance au Maroc",
      ],
      en: ["Stock market: volatility on banking stocks"],
      ar: ["البورصة: تذبذب على القيم البنكية"],
      darija: ["البورصة فيها تذبذب على البنوك"],
    },
  },
  {
    source: "Reuters",
    titlesByLang: {
      en: [
        "UPDATE 1: Company faces regulatory probe over disclosures",
        "Morocco's financial sector under scrutiny after market turbulence",
        "EXCLUSIVE: internal memo reveals strategic overhaul",
        "Company shares plunge as sentiment sours",
      ],
      fr: ["MARCHE: la societe sous pression apres les resultats"],
      ar: ["تحديث: الشركة تواجه تحقيقا تنظيميا"],
      darija: ["الشركة تحت تحقيق من السلطات"],
    },
  },
  {
    source: "BBC",
    titlesByLang: {
      en: [
        "Business: company reputation takes a hit amid scandal",
        "Markets: nervousness over corporate governance",
      ],
      fr: ["Economie: la reputation de la societe ebranlee"],
      ar: ["أعمال: سمعة الشركة تتعرض لضربة"],
      darija: ["سمعة الشركة تطايحت بزاف"],
    },
  },
  {
    source: "Bloomberg",
    titlesByLang: {
      en: [
        "Company Bonds Slide as Sentiment Deteriorates, Traders Say",
        "Hedge Funds Boost Bearish Bets Amid Corporate Governance Concerns",
        "Stock Drops Most in Three Months on Risk Assessment Downgrade",
      ],
      fr: ["Bloomberg: les obligations de la societe reculent"],
      ar: ["بلومبرغ: سندات الشركة تنخفض"],
      darija: ["بلومبرغ: السندات ديال الشركة طاحو"],
    },
  },
  {
    source: "Al Jazeera",
    titlesByLang: {
      ar: [
        "تقرير: أزمة ثقة تهدد استقرار الشركة",
        "الشركة المغربية تحت مجهر الرأي العام",
      ],
      darija: ["تقرير: أزمة ثقة كتهدد الشركة"],
      fr: ["Reportage: une crise de confiance menace la societe"],
      en: ["Report: crisis of confidence threatens company stability"],
    },
  },
  {
    source: "Jeune Afrique",
    titlesByLang: {
      fr: [
        "Maroc: la societe face a la tempete",
        "Enquete: les coulisses d'une crise de communication",
        "Afrique: les defis de la gouvernance d'entreprise",
      ],
      en: ["Morocco: company weathers the storm"],
      ar: ["المغرب: الشركة تواجه العاصفة"],
      darija: ["المغرب: الشركة فالعاصفة"],
    },
  },
  {
    source: "Twitter",
    titlesByLang: {
      en: [
        "Viral thread: company response to crisis leaves users furious",
        "Trending: boycott hashtag gains traction overnight",
      ],
      fr: ["Thread viral: la reponse de la societe fait polémique"],
      ar: ["منشور viral: رد الشركة يثير غضب المتابعين"],
      darija: ["بوست viral: الرد ديال الشركة غضب بزاف ديال الناس"],
    },
  },
  {
    source: "Facebook",
    titlesByLang: {
      en: ["Community group: collective action against company grows"],
      fr: ["Groupe communautaire: l'action collective s'organise"],
      ar: ["مجموعة مجتمعية: حملة مقاطعة تتسع"],
      darija: ["گروپ: حملة المقاطعة كبرات"],
    },
  },
  {
    source: "LinkedIn",
    titlesByLang: {
      en: [
        "Industry analyst: company reputation risk underestimated",
        "Professional network: executive departures signal deeper issues",
      ],
      fr: ["Analyste: le risque de reputation sous-estime"],
      ar: ["محلل: مخاطر السمعة غير مقدرة بشكل صحيح"],
      darija: ["محلل: مخاطر السمعة ما مقدرينشها مزيان"],
    },
  },
  {
    source: "OpenAI",
    titlesByLang: {
      en: [
        "AI summary: aggregated coverage indicates negative sentiment trend",
        "ChatGPT retrieval: company mentioned in critical context across sources",
      ],
      fr: ["Synthese IA: tendance de sentiment negative"],
      ar: ["ملخص الذكاء الاصطناعي: اتجاه مشاعر سلبي"],
      darija: ["ملخص AI: توجه المشاعر سلبي"],
    },
  },
  {
    source: "Gemini",
    titlesByLang: {
      en: [
        "Gemini overview: company reputation facing significant headwinds",
        "AI snapshot: multiple sources report governance concerns",
      ],
      fr: ["Apercu Gemini: la reputation face a des vents contraires"],
      ar: ["نظرة عامة Gemini: السمعة تواجه تحديات"],
      darija: ["Gemini: السمعة كتواجه مشاكل"],
    },
  },
  {
    source: "Claude",
    titlesByLang: {
      en: [
        "Claude analysis: brand sentiment deteriorating across metrics",
        "AI synthesis: coverage pattern suggests escalating risk",
      ],
      fr: ["Analyse Claude: deterioration du sentiment de marque"],
      ar: ["تحليل Claude: تدهور مشاعر العلامة التجارية"],
      darija: ["Claude: المشاعر ديال الماركة كتدهور"],
    },
  },
  {
    source: "HarchIQ Risk Engine",
    titlesByLang: {
      en: [
        "Risk assessment: velocity × authority escalation to Crimson",
        "HarchIQ: 4x4 matrix shows elevated propagation across elite sources",
      ],
      fr: ["Evaluation du risque: escalation vers le niveau Crimson"],
      ar: ["تقييم المخاطر: تصعيد إلى المستوى القرمزي"],
      darija: ["تقييم المخاطر: تصعيد للمستوى القرمزي"],
    },
  },
];

// ─── Helpers ────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomSentimentScore(): number {
  // Uniform in [-0.95, -0.40] — all qualify as alerts (< -0.4).
  // Score < -0.6 → critical, else high (per /api/console/alerts).
  const v = -0.4 - Math.random() * 0.55;
  return Number(v.toFixed(4));
}

function randomTimestamp(): Date {
  // Spread over the last DAYS_BACK days, weighted toward recent
  // so the velocity sparkline shows a surge at the right edge.
  const now = Date.now();
  const offsetMs = Math.floor(Math.random() * DAYS_BACK * 24 * 3600 * 1000);
  // 60% of alerts in the last 7 days, 40% in days 8-30
  const inLast7 = Math.random() < 0.6;
  const cappedOffset = inLast7
    ? offsetMs % (7 * 24 * 3600 * 1000)
    : offsetMs;
  return new Date(now - cappedOffset);
}

function randomLanguageForSource(tpl: SourceTemplate): { lang: keyof SourceTemplate["titlesByLang"]; title: string } {
  // Weighted language pick: each source's language distribution is
  // driven by the size of its titlesByLang pool (sources with more
  // Arabic titles produce more Arabic alerts, etc.).
  const langs = Object.keys(tpl.titlesByLang) as Array<keyof SourceTemplate["titlesByLang"]>;
  // Build a weighted list — every language contributes one entry
  // per available title, so languages with more titles get picked
  // more often. This produces a realistic spread.
  const weighted: Array<keyof SourceTemplate["titlesByLang"]> = [];
  for (const l of langs) {
    for (let i = 0; i < tpl.titlesByLang[l].length; i++) weighted.push(l);
  }
  const lang = pick(weighted);
  return { lang, title: pick(tpl.titlesByLang[lang]) };
}

function makeUrl(idx: number): string {
  return `https://stress-test.local/alert/${idx}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function makeUrlHash(idx: number): string {
  return `stress-${idx}-${Math.random().toString(36).slice(2, 12)}`;
}

// ─── Cleanup ───────────────────────────────────────────────────

async function cleanup() {
  console.log("[stress-test] Cleaning up stress-test articles...");
  console.log(`[stress-test] Targeting source starting with "${STRESS_MARKER}"`);
  const before = await prisma.article.count({
    where: { source: { startsWith: STRESS_MARKER } },
  });
  console.log(`[stress-test] Found ${before} stress-test articles to delete.`);
  if (before === 0) {
    console.log("[stress-test] Nothing to clean. Done.");
    return;
  }
  // Delete in batches of 1000 to avoid long-running transactions
  // locking the table on Neon.
  let deletedTotal = 0;
  while (true) {
    const batch = await prisma.article.findMany({
      where: { source: { startsWith: STRESS_MARKER } },
      select: { id: true },
      take: 1000,
    });
    if (batch.length === 0) break;
    const ids = batch.map((b) => b.id);
    const result = await prisma.article.deleteMany({ where: { id: { in: ids } } });
    deletedTotal += result.count;
    console.log(`[stress-test] Deleted ${deletedTotal} / ${before} articles...`);
    if (batch.length < 1000) break;
  }
  console.log(`[stress-test] Cleanup complete. Deleted ${deletedTotal} stress-test articles.`);
}

// ─── Insert ────────────────────────────────────────────────────

async function insertStressData() {
  // Find primary company — same lookup as /api/console/alerts.
  const company = await prisma.company.findFirst({ orderBy: { createdAt: "asc" } });
  if (!company) {
    console.error("[stress-test] No company found in the database. Aborting.");
    process.exit(1);
  }
  console.log(`[stress-test] Target company: ${company.name} (${company.slug})`);
  console.log(`[stress-test] Generating ${TOTAL_ALERTS} synthetic alerts in batches of ${BATCH_SIZE}...`);

  const startTime = Date.now();
  let inserted = 0;

  for (let batchStart = 0; batchStart < TOTAL_ALERTS; batchStart += BATCH_SIZE) {
    const batchEnd = Math.min(batchStart + BATCH_SIZE, TOTAL_ALERTS);
    const batch: Array<{
      companyId: string;
      title: string;
      url: string;
      source: string;
      urlHash: string;
      publishedAt: Date;
      scrapedAt: Date;
      sentimentLabel: string;
      sentimentScore: number;
      language: string;
      processed: boolean;
    }> = [];

    for (let i = batchStart; i < batchEnd; i++) {
      const tpl = pick(SOURCE_POOL);
      const { lang, title } = randomLanguageForSource(tpl);
      // Append a unique suffix so titles can repeat without
      // colliding on the unique url constraint.
      const suffix = ` (#${i + 1})`;
      batch.push({
        companyId: company.id,
        title: title + suffix,
        url: makeUrl(i),
        source: `${STRESS_MARKER} ${tpl.source}`,
        urlHash: makeUrlHash(i),
        publishedAt: randomTimestamp(),
        scrapedAt: new Date(),
        sentimentLabel: "negative",
        sentimentScore: randomSentimentScore(),
        language: lang,
        processed: true,
      });
    }

    // Use createMany for batch insert — Neon handles 500 rows
    // comfortably within the 30s statement timeout.
    await prisma.article.createMany({ data: batch, skipDuplicates: true });
    inserted += batch.length;
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[stress-test] Inserted ${inserted} / ${TOTAL_ALERTS} alerts (${elapsed}s elapsed)`);

    // Tiny yield to keep the event loop responsive.
    await new Promise((r) => setTimeout(r, 10));
  }

  const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log("");
  console.log(`[stress-test] Done. Inserted ${inserted} alerts in ${totalElapsed}s.`);
  console.log(`[stress-test] All articles marked with source prefix "${STRESS_MARKER}" for cleanup.`);
  console.log("");
  console.log("Next steps:");
  console.log("  1. Open the Brand Monitor Dashboard in your browser.");
  console.log("  2. Click Refresh — the Multi-Source Feed, Geo Cartography,");
  console.log("     and Escalation Matrix should populate with the synthetic data.");
  console.log("  3. When done, clean up with:");
  console.log("     bun --ts scripts/stress-test-brand-monitor.ts --cleanup");
}

// ─── Main ──────────────────────────────────────────────────────

async function main() {
  const isCleanup = process.argv.includes("--cleanup");
  if (isCleanup) {
    await cleanup();
  } else {
    await insertStressData();
  }
}

main()
  .catch((e) => {
    console.error("[stress-test] FATAL:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
