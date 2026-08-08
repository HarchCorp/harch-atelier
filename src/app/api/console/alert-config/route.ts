import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { isDemoEmail } from "@/lib/demo-session";
import { prisma } from "@/lib/db";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.isDemo || isDemoEmail(session.user.email)) {
    return NextResponse.json(buildDemo());
  }

  try {
    const companyId = session.user.companyId;
    if (!companyId) return NextResponse.json(buildDemo());

    const settings = await prisma.companySettings.findUnique({ where: { companyId } });
    if (!settings) return NextResponse.json(buildDemo());

    const thresholds = settings.alertThresholds ? JSON.parse(settings.alertThresholds) : {};
    return NextResponse.json({
      sentimentThreshold: thresholds.sentimentDrop ?? -0.3,
      velocityThreshold: thresholds.minMentions ?? 15,
      crisisScoreThreshold: thresholds.crisisThreshold ?? 50,
      channels: { whatsapp: true, email: true, dashboard: true, comexEscalation: false },
      severityFilter: { critical: true, warning: true, watch: false, info: false },
      quietHours: { enabled: true, start: "22:00", end: "07:00" },
      whatsappNumber: JSON.parse(settings.alertThresholds || "{}").whatsappNumber || "" || "",
      email: session.user.email || "",
      source: "neon",
    });
  } catch {
    return NextResponse.json(buildDemo());
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const companyId = session.user.companyId;
    if (!companyId) return NextResponse.json({ ok: true, demo: true });

    const settings = await prisma.companySettings.upsert({
      where: { companyId },
      update: {
        alertThresholds: JSON.stringify({
          sentimentDrop: body.sentimentThreshold,
          minMentions: body.velocityThreshold,
          crisisThreshold: body.crisisScoreThreshold,
        }),
      },
      create: {
        companyId,
        alertThresholds: JSON.stringify({
          sentimentDrop: body.sentimentThreshold,
          minMentions: body.velocityThreshold,
          crisisThreshold: body.crisisScoreThreshold,
        }),
      },
    });

    return NextResponse.json({ ok: true, source: "neon" });
  } catch (err) {
    logError("console.alert-config", `[alert-config] error: ${err}`);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

function buildDemo() {
  return {
    sentimentThreshold: -0.3,
    velocityThreshold: 15,
    crisisScoreThreshold: 50,
    channels: { whatsapp: true, email: true, dashboard: true, comexEscalation: false },
    severityFilter: { critical: true, warning: true, watch: false, info: false },
    quietHours: { enabled: true, start: "22:00", end: "07:00" },
    whatsappNumber: "+212600000000",
    email: "dircom@company.ma",
    source: "demo",
  };
}
