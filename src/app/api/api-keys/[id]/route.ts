import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { logAudit, extractIp, extractUserAgent } from "@/lib/harchiq/audit-log";

// ═══════════════════════════════════════════════════════════════
//  DELETE /api/api-keys/[id]
//
//  Soft-revokes an API key (sets revokedAt = now). The plaintext key
//  is never stored so we can't "delete" it cleanly — we mark the
//  hash as revoked so authenticateApiKey() rejects it on the next
//  call. The row is preserved so audit logs that reference the key
//  id stay meaningful.
//
//  Auth: the key must belong to the calling user. A company-admin
//  can revoke keys owned by users in their company (so they can
//  offboard a teammate cleanly). Super-admins can revoke any key.
//
//  Returns: { ok: true, revokedAt: <ISO> } on success.
//
//  Task: signal-enterprise-platform
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Fetch the key + its owner so we can authorise the caller.
  const apiKey = await prisma.apiKey.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      name: true,
      keyPrefix: true,
      revokedAt: true,
      user: {
        select: { id: true, companyId: true, role: true },
      },
    },
  });

  if (!apiKey) {
    return NextResponse.json({ error: "API key not found" }, { status: 404 });
  }

  // ─── Authorisation ────────────────────────────────────────────
  //  • key owner can revoke their own key
  //  • company-admin can revoke keys owned by users in their company
  //  • super-admin can revoke any key
  const caller = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, companyId: true, role: true },
  });
  if (!caller) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isOwner = apiKey.userId === caller.id;
  const isCompanyAdminForOwner =
    caller.role === "company-admin" &&
    caller.companyId !== null &&
    apiKey.user.companyId === caller.companyId;
  const isSuperAdmin = caller.role === "admin";

  if (!isOwner && !isCompanyAdminForOwner && !isSuperAdmin) {
    return NextResponse.json(
      { error: "Forbidden — you can only revoke your own API keys." },
      { status: 403 },
    );
  }

  if (apiKey.revokedAt) {
    // Idempotent — already revoked. Return the existing timestamp.
    return NextResponse.json({
      ok: true,
      id: apiKey.id,
      revokedAt: apiKey.revokedAt,
      alreadyRevoked: true,
    });
  }

  const revokedAt = new Date();
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { revokedAt },
  });

  await logAudit({
    userId: caller.id,
    action: "api_key.revoke" as never,
    resource: `apikey:${apiKey.id}`,
    result: "success",
    ipAddress: extractIp(req),
    userAgent: extractUserAgent(req),
    metadata: {
      name: apiKey.name,
      prefix: apiKey.keyPrefix,
      ownerId: apiKey.userId,
      selfRevoke: isOwner,
    },
  });

  return NextResponse.json({
    ok: true,
    id: apiKey.id,
    revokedAt,
  });
}
