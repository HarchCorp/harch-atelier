import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { dispatchWebhook } from "@/lib/harchiq/webhook-dispatcher";

// ═══════════════════════════════════════════════════════════════
//  POST /api/webhooks/[id]/test
//
//  Sends a `webhook.test` event to the webhook URL with a synthetic
//  payload so the user can verify their receiver is wired up
//  correctly. The test event bypasses the event-subscription filter
//  (it's not in the events array — it's an out-of-band ping) but
//  still goes through dispatchWebhook so retries / signing / logging
//  behave identically to a real delivery.
//
//  Returns: { ok: true, delivery: {...} } on success, or
//           { ok: false, delivery: {...} } on failure (the test
//           "succeeded" in dispatching; the receiver returned an
//           error or didn't respond).
//
//  Auth: webhook owner | company-admin | super-admin.
//
//  Task: signal-enterprise-platform
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const webhook = await prisma.webhook.findUnique({
    where: { id },
    select: {
      id: true,
      url: true,
      events: true,
      secret: true,
      isActive: true,
      userId: true,
      companyId: true,
    },
  });

  if (!webhook) {
    return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
  }

  const caller = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, companyId: true, role: true },
  });
  if (!caller) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isOwner = webhook.userId === caller.id;
  const isCompanyAdmin =
    caller.role === "company-admin" && webhook.companyId === caller.companyId;
  const isSuperAdmin = caller.role === "admin";
  if (!isOwner && !isCompanyAdmin && !isSuperAdmin) {
    return NextResponse.json(
      { error: "Forbidden — you can only test your own webhooks." },
      { status: 403 },
    );
  }

  // ─── Build the synthetic test payload ──────────────────────────
  //
  //  Same envelope as a real event but with event=webhook.test and
  //  a small data object the receiver can recognise.
  const testPayload = {
    event: "webhook.test",
    deliveredAt: new Date().toISOString(),
    data: {
      webhookId: webhook.id,
      message:
        "This is a test delivery from Harch Atelier. Your webhook receiver is correctly reachable.",
      company: { id: webhook.companyId },
    },
  };

  const result = await dispatchWebhook({
    webhook: {
      id: webhook.id,
      url: webhook.url,
      secret: webhook.secret ?? null,
      isActive: webhook.isActive,
    },
    event: "webhook.test",
    payload: testPayload,
    // Test pings only retry once — don't burn 3 retries on a typo'd URL.
    maxRetries: 1,
  });

  return NextResponse.json({
    ok: result.status === "success",
    delivery: result,
  });
}
