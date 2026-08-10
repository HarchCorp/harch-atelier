// ═══════════════════════════════════════════════════════════════
//  GET /api/console/team-activity
//
//  Pro Dashboard — "Activité de l'équipe" feed.
//
//  Returns the last 10 audit-log entries for users in the caller's
//  company. Each entry is enriched with the user's display name and
//  translated to a human-readable French action label.
//
//  Shape:
//    {
//      activities: [{
//        id, userId, userName, action, actionLabel,
//        resource, createdAt, result
//      }],
//      total, source
//    }
//
//  Auth: requires session (brand-monitor | market-competitor |
//  investment-bank | admin). Demo users get a deterministic feed
//  built from the demo team roster.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { isDemoEmail, getDemoTeam } from "@/lib/demo-session";
import { prisma } from "@/lib/db";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

interface TeamActivityRow {
  id: string;
  userId: string | null;
  userName: string;
  action: string;
  actionLabel: string;
  resource: string;
  createdAt: string;
  result: string;
}

// Map raw AuditLog.action codes → French human-readable labels.
// Returns null for actions we don't surface in the team feed.
function labelFor(action: string): string | null {
  const map: Record<string, string> = {
    report_export: "a généré un rapport",
    data_export_csv: "a exporté des données",
    sanctions_screen: "a effectué un screening sanctions",
    entity_graph_view: "a consulté le graphe d'entités",
    dossier_view: "a consulté un dossier",
    company_settings_update: "a modifié les paramètres",
    user_invite: "a invité un membre",
    user_suspend: "a suspendu un utilisateur",
    ai_probe: "a interrogé l'IA",
    briefing_generate: "a généré un briefing",
    insights_generate: "a généré des insights",
    whatsapp_import: "a importé un message WhatsApp",
    master_code_generate: "a généré un code maître",
    session_revoked: "a révoqué une session",
    invitation_accepted: "a rejoint l'équipe",
    role_changed: "a modifié un rôle",
    login: "s'est connecté(e)",
    onboarding_complete: "a terminé l'onboarding",
    agency_subclient_created: "a créé un sous-client agence",
    surgical_email_sent: "a envoyé un email chirurgical",
  };
  return map[action] ?? null;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.isDemo || isDemoEmail(session.user.email)) {
    return NextResponse.json(buildDemo());
  }

  try {
    const companyId = session.user.companyId;
    if (!companyId) return NextResponse.json(buildDemo());

    // All users in the company — used to filter AuditLog entries to
    // this tenant only (AuditLog doesn't carry companyId directly).
    const users = await prisma.user.findMany({
      where: { companyId },
      select: { id: true, name: true, email: true },
    });
    const userIds = users.map((u) => u.id);
    const nameById = new Map(users.map((u) => [u.id, u.name || u.email]));

    const logs = await prisma.auditLog.findMany({
      where: { userId: { in: userIds } },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        userId: true,
        action: true,
        resource: true,
        result: true,
        createdAt: true,
      },
    });

    const activities: TeamActivityRow[] = [];
    for (const l of logs) {
      const label = labelFor(l.action);
      if (!label) continue; // skip unmapped actions
      const userName = (l.userId && nameById.get(l.userId)) || "Membre";
      activities.push({
        id: l.id,
        userId: l.userId,
        userName,
        action: l.action,
        actionLabel: label,
        resource: l.resource,
        createdAt: l.createdAt.toISOString(),
        result: l.result,
      });
      if (activities.length >= 10) break;
    }

    return NextResponse.json({
      activities,
      total: activities.length,
      source: "neon",
    });
  } catch (err) {
    logError("console.team-activity", `[team-activity] error: ${err}`);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

function buildDemo() {
  const team = getDemoTeam("disabled");
  const now = Date.now();
  const at = (msAgo: number) => new Date(now - msAgo).toISOString();

  // Deterministic demo feed built from the real team roster.
  const seed: Array<{ user: string; action: string; label: string; resource: string; msAgo: number }> = [
    { user: team[0]?.name ?? "Salma Bennani", action: "report_export", label: "a généré un rapport", resource: "report:monthly-2026-07", msAgo: 2 * 3600_000 },
    { user: team[1]?.name ?? "Karim El Idrissi", action: "data_export_csv", label: "a exporté 50 articles", resource: "export:brand-monitor-signals", msAgo: 5 * 3600_000 },
    { user: team[2]?.name ?? "Nadia Tazi", action: "company_settings_update", label: "a créé une alerte", resource: "alert-config:custom-3", msAgo: 26 * 3600_000 },
    { user: team[0]?.name ?? "Salma Bennani", action: "briefing_generate", label: "a généré un briefing", resource: "briefing:daily-2026-07-15", msAgo: 30 * 3600_000 },
    { user: team[1]?.name ?? "Karim El Idrissi", action: "ai_probe", label: "a interrogé l'IA", resource: "ask-harchiq:session-7891", msAgo: 36 * 3600_000 },
    { user: team[2]?.name ?? "Nadia Tazi", action: "insights_generate", label: "a généré des insights", resource: "insights:persona-brand-monitor", msAgo: 48 * 3600_000 },
    { user: team[0]?.name ?? "Salma Bennani", action: "user_invite", label: "a invité un membre", resource: "invite:omar.fassi@attijariwafa.com", msAgo: 60 * 3600_000 },
    { user: team[1]?.name ?? "Karim El Idrissi", action: "data_export_csv", label: "a exporté des données", resource: "export:competitor-landscape", msAgo: 72 * 3600_000 },
    { user: team[2]?.name ?? "Nadia Tazi", action: "entity_graph_view", label: "a consulté le graphe d'entités", resource: "entity-graph:OCP", msAgo: 84 * 3600_000 },
    { user: team[0]?.name ?? "Salma Bennani", action: "company_settings_update", label: "a modifié les paramètres", resource: "settings:topics", msAgo: 96 * 3600_000 },
  ];

  const activities: TeamActivityRow[] = seed.map((s, i) => ({
    id: `demo-act-${i + 1}`,
    userId: null,
    userName: s.user,
    action: s.action,
    actionLabel: s.label,
    resource: s.resource,
    createdAt: at(s.msAgo),
    result: "success",
  }));

  return { activities, total: activities.length, source: "demo" };
}
