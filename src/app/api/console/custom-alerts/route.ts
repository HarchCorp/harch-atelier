// ═══════════════════════════════════════════════════════════════
//  GET  /api/console/custom-alerts
//  PATCH /api/console/custom-alerts
//
//  Pro Dashboard — "Mes alertes personnalisées".
//
//  Stores user-defined alert configurations in CompanySettings
//  .alertThresholds (JSON) under the `customAlerts` key. Each alert:
//    {
//      id: string,
//      name: string,         // human label
//      description: string,  // rule summary (French)
//      type: "crisis" | "spike" | "sentiment_drop" | "custom",
//      threshold: { ... },   // rule params (window hours, %, count)
//      channels: { whatsapp, email, dashboard },
//      active: boolean,
//      createdAt: string (ISO),
//      updatedAt: string (ISO)
//    }
//
//  GET  → returns { alerts: CustomAlert[], source }
//  PATCH → body: { id, active?, name?, description?, channels? }
//         returns { ok, alert } — only fields present are updated.
//         (Adding/deleting alerts is out of scope for this Pro
//         surface — full CRUD lives in EnterpriseAdminPanel.)
//
//  Demo users receive 3 deterministic alerts matching the spec:
//    "Crise médiatique: >5 articles négatifs en 2h"
//    "Pic d'activité: +100% mentions en 24h"
//    "Sentiment négatif: <30% positif sur 7 jours"
//
//  Auth: requires session (brand-monitor | market-competitor |
//  investment-bank | admin).
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { isDemoEmail } from "@/lib/demo-session";
import { prisma } from "@/lib/db";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

export interface CustomAlert {
  id: string;
  name: string;
  description: string;
  type: "crisis" | "spike" | "sentiment_drop" | "custom";
  threshold: {
    windowHours?: number;
    negativeCount?: number;
    spikePct?: number;
    positivePctFloor?: number;
    days?: number;
  };
  channels: { whatsapp: boolean; email: boolean; dashboard: boolean };
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

function defaultAlerts(): CustomAlert[] {
  const now = new Date().toISOString();
  return [
    {
      id: "alert-crisis-default",
      name: "Crise médiatique",
      description: ">5 articles négatifs en 2h",
      type: "crisis",
      threshold: { windowHours: 2, negativeCount: 5 },
      channels: { whatsapp: true, email: true, dashboard: true },
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "alert-spike-default",
      name: "Pic d'activité",
      description: "+100% mentions en 24h",
      type: "spike",
      threshold: { windowHours: 24, spikePct: 100 },
      channels: { whatsapp: false, email: true, dashboard: true },
      active: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "alert-sentiment-default",
      name: "Sentiment négatif",
      description: "<30% positif sur 7 jours",
      type: "sentiment_drop",
      threshold: { days: 7, positivePctFloor: 30 },
      channels: { whatsapp: false, email: true, dashboard: true },
      active: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

interface StoredShape {
  customAlerts?: CustomAlert[];
  sentimentDrop?: number;
  minMentions?: number;
  crisisThreshold?: number;
}

function parseStored(raw: string | null | undefined): StoredShape {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as StoredShape;
  } catch {
    /* fall through */
  }
  return {};
}

function serializeStored(s: StoredShape): string {
  return JSON.stringify(s);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.isDemo || isDemoEmail(session.user.email)) {
    return NextResponse.json({ alerts: defaultAlerts(), source: "demo" });
  }

  try {
    const companyId = session.user.companyId;
    if (!companyId) return NextResponse.json({ alerts: defaultAlerts(), source: "demo" });

    const settings = await prisma.companySettings.findUnique({ where: { companyId } });
    if (!settings) return NextResponse.json({ alerts: defaultAlerts(), source: "demo" });

    const stored = parseStored(settings.alertThresholds);
    if (!stored.customAlerts || stored.customAlerts.length === 0) {
      return NextResponse.json({ alerts: defaultAlerts(), source: "neon-seeded" });
    }
    return NextResponse.json({ alerts: stored.customAlerts, source: "neon" });
  } catch (err) {
    logError("console.custom-alerts", `[custom-alerts GET] error: ${err}`);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.isDemo || isDemoEmail(session.user.email)) {
    // Demo: echo back the change without persisting
    const body = await req.json().catch(() => ({}));
    const id = typeof body?.id === "string" ? body.id : "unknown";
    const demoAlerts = defaultAlerts();
    const target = demoAlerts.find((a) => a.id === id) ?? demoAlerts[0];
    const updated: CustomAlert = {
      ...target,
      active: typeof body?.active === "boolean" ? body.active : target.active,
      updatedAt: new Date().toISOString(),
    };
    return NextResponse.json({ ok: true, alert: updated, source: "demo" });
  }

  try {
    const companyId = session.user.companyId;
    if (!companyId) {
      return NextResponse.json({ ok: true, demo: true });
    }

    const body = await req.json().catch(() => ({}));
    const id = typeof body?.id === "string" ? body.id : null;
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const settings = await prisma.companySettings.findUnique({ where: { companyId } });
    const stored = parseStored(settings?.alertThresholds);
    const alerts = stored.customAlerts && stored.customAlerts.length > 0
      ? stored.customAlerts
      : defaultAlerts();

    const idx = alerts.findIndex((a) => a.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    const target = alerts[idx];
    const updated: CustomAlert = {
      ...target,
      active: typeof body?.active === "boolean" ? body.active : target.active,
      name: typeof body?.name === "string" && body.name.trim() ? body.name.trim() : target.name,
      description: typeof body?.description === "string" && body.description.trim()
        ? body.description.trim()
        : target.description,
      channels: body?.channels && typeof body.channels === "object"
        ? {
            whatsapp: typeof body.channels.whatsapp === "boolean" ? body.channels.whatsapp : target.channels.whatsapp,
            email: typeof body.channels.email === "boolean" ? body.channels.email : target.channels.email,
            dashboard: typeof body.channels.dashboard === "boolean" ? body.channels.dashboard : target.channels.dashboard,
          }
        : target.channels,
      updatedAt: new Date().toISOString(),
    };
    alerts[idx] = updated;

    const nextStored: StoredShape = { ...stored, customAlerts: alerts };
    await prisma.companySettings.upsert({
      where: { companyId },
      update: { alertThresholds: serializeStored(nextStored) },
      create: {
        companyId,
        alertThresholds: serializeStored(nextStored),
      },
    });

    return NextResponse.json({ ok: true, alert: updated, source: "neon" });
  } catch (err) {
    logError("console.custom-alerts", `[custom-alerts PATCH] error: ${err}`);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
