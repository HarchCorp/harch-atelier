import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/harchiq/audit-log";

// ═══════════════════════════════════════════════════════════════
//  POST /api/agency/whatsapp-import
//
//  AGENCY VERSION of the killer feature:
//    An agency admin (Omocto, PRESMA, etc.) pastes a WhatsApp
//    conversation with their client prospect → GLM-4 extracts
//    structured data → agency reviews → one click creates the
//    sub-client workspace.
//
//  This is the B2B2B self-service onboarding that makes the
//  agency channel scalable without Harch's direct involvement.
//
//  Auth: agency-admin only.
// ═══════════════════════════════════════════════════════════════

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ExtractedData {
  company_name: string | null;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  plan_tier: "emergence" | "corporate" | "sovereign" | "custom" | null;
  pricing_mad: number | null;
  topics: string[];
  competitors: string[];
  use_case: string | null;
  notes: string | null;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "agency-admin" && session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden — agency-admin role required" }, { status: 403 });
  }

  const agencyId = session.user.agencyId;
  if (!agencyId && session.user.role !== "admin") {
    return NextResponse.json({ error: "No agency linked to your account" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { conversation, createAccount } = body as {
    conversation?: string;
    createAccount?: boolean;
  };

  if (!conversation || typeof conversation !== "string" || conversation.trim().length < 10) {
    return NextResponse.json({ error: "Conversation text is required (min 10 chars)" }, { status: 400 });
  }

  // ─── STEP 1: GLM-4 extraction ──────────────────────────────
  let extracted: ExtractedData;

  try {
    const ZAI = (await import("z-ai-web-dev-sdk")).default;
    const zai = await ZAI.create();

    const systemPrompt = `You are an assistant that extracts structured information from WhatsApp conversations between a PR/communications agency and their potential client (a Moroccan company). The agency is selling reputation intelligence services.

Extract:
- company_name: The client company name
- contact_name: The main contact person name at the client
- email: Their email address if mentioned
- phone: Their phone number if mentioned
- plan_tier: "emergence" (15K MAD/mo), "corporate" (40K MAD/mo), "sovereign" (75K MAD/mo), or "custom"
- pricing_mad: The monthly price discussed in MAD (number only)
- topics: Array of topics/keywords they want monitored
- competitors: Array of competitor names they want tracked
- use_case: One-line summary of their use case
- notes: Any other relevant information

Return ONLY valid JSON. No markdown, no explanation.`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: conversation },
      ],
      thinking: { type: "disabled" },
    });

    const rawContent = completion.choices?.[0]?.message?.content || "";
    let jsonStr = rawContent.trim();
    jsonStr = jsonStr.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");
    const firstBrace = jsonStr.indexOf("{");
    const lastBrace = jsonStr.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonStr = jsonStr.slice(firstBrace, lastBrace + 1);
    }
    extracted = JSON.parse(jsonStr);
  } catch (e) {
    console.error("[agency/whatsapp-import] GLM-4 error:", e);
    return NextResponse.json(
      { error: "AI extraction failed", detail: e instanceof Error ? e.message : String(e) },
      { status: 502 },
    );
  }

  // ─── STEP 2: If createAccount=true, create the sub-client ──
  if (createAccount && extracted.company_name && agencyId) {
    try {
      const slug = extracted.company_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      let company = await prisma.company.findFirst({
        where: {
          OR: [
            { slug },
            { name: { equals: extracted.company_name, mode: "insensitive" } },
          ],
        },
      });

      if (!company) {
        company = await prisma.company.create({
          data: {
            name: extracted.company_name,
            slug: slug + "-" + Date.now().toString(36).slice(-4),
            sector: "unknown",
            aliases: [],
            isDemo: false,
          },
        });
      }

      const existingClient = await prisma.agencyClient.findFirst({
        where: { agencyId, companyId: company.id },
      });
      if (existingClient) {
        return NextResponse.json({
          extracted,
          error: "This company is already a sub-client of your agency",
          existingClientId: existingClient.id,
        });
      }

      const planTier = extracted.plan_tier || "emergence";
      const monthlyPrice = extracted.pricing_mad || (planTier === "sovereign" ? 75000 : planTier === "corporate" ? 40000 : 15000);

      const agencyClient = await prisma.agencyClient.create({
        data: {
          agencyId,
          companyId: company.id,
          displayName: extracted.company_name,
          subdomain: slug,
          status: "active",
        },
      });

      await prisma.agencyBranding.create({
        data: {
          agencyClientId: agencyClient.id,
          primaryColor: "#0A0A0A",
          accentColor: "#10b981",
          loginTitle: `${extracted.company_name} Intelligence`,
        },
      });

      const quotaDefaults: Record<string, { maxApi: number; maxWA: number; maxKw: number; maxSrc: number; maxUsr: number; price: number }> = {
        emergence: { maxApi: 10000, maxWA: 100, maxKw: 50, maxSrc: 30, maxUsr: 5, price: 15000 },
        corporate: { maxApi: 50000, maxWA: 500, maxKw: 200, maxSrc: 100, maxUsr: 15, price: 40000 },
        sovereign: { maxApi: 250000, maxWA: 2000, maxKw: 1000, maxSrc: 500, maxUsr: 50, price: 75000 },
      };
      const qd = quotaDefaults[planTier] || quotaDefaults.emergence;

      await prisma.agencyQuota.create({
        data: {
          agencyClientId: agencyClient.id,
          maxApiRequests: qd.maxApi,
          maxWhatsAppAlerts: qd.maxWA,
          maxKeywords: qd.maxKw,
          maxSources: qd.maxSrc,
          maxUsers: qd.maxUsr,
          planTier,
          monthlyPriceMAD: monthlyPrice,
        },
      });

      if (extracted.email) {
        const bcrypt = await import("bcryptjs");
        const tempPassword = Math.random().toString(36).slice(2, 14);
        const existingUser = await prisma.user.findUnique({ where: { email: extracted.email } });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: extracted.email,
              name: extracted.contact_name || extracted.company_name,
              passwordHash: await bcrypt.hash(tempPassword, 10),
              role: "user",
              accountType: "brand-monitor",
              companyId: company.id,
              status: "invited",
              onboardingCompleted: false,
              isDemo: false,
            },
          });
        }
      }

      await logAudit({
        userId: session.user.id,
        action: "agency_subclient_created",
        resource: `agency:${agencyId}:client:${agencyClient.id}`,
        result: "success",
        metadata: {
          company: extracted.company_name,
          planTier,
          monthlyPriceMAD: monthlyPrice,
          source: "whatsapp_import",
        },
      });

      return NextResponse.json({
        extracted,
        created: true,
        agencyClientId: agencyClient.id,
        displayName: agencyClient.displayName,
        monthlyPriceMAD: monthlyPrice,
        planTier,
        message: `Sub-client "${extracted.company_name}" created. Plan: ${planTier} (${monthlyPrice} MAD/mo).`,
      });
    } catch (e) {
      console.error("[agency/whatsapp-import] create error:", e);
      return NextResponse.json({
        extracted,
        created: false,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return NextResponse.json({ extracted, created: false });
}
