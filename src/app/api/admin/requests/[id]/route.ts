// ═══════════════════════════════════════════════════════════════
//  PATCH /api/admin/requests/[id]
//
//  Updates the status of an AccessRequest.
//
//  Body: { status: "pending" | "interested" | "not_interested"
//                | "recontact_later" | "converted" }
//
//  Returns: { success: true, request: { id, status, updatedAt } }
//
//  Auth: admin only (role === "admin").
//
//  Task ID: ADMIN-1
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { logAudit, extractIp, extractUserAgent } from "@/lib/harchiq/audit-log";
import { logInfo, logError } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ─── TYPES ────────────────────────────────────────────────────────

type RequestStatus =
  | "pending"
  | "interested"
  | "not_interested"
  | "recontact_later"
  | "converted";

const VALID_STATUSES = new Set<RequestStatus>([
  "pending",
  "interested",
  "not_interested",
  "recontact_later",
  "converted",
]);

interface UpdateBody {
  status: string;
  note?: string;
}

interface UpdateResponse {
  success: true;
  request: {
    id: string;
    status: RequestStatus;
    email: string;
    name: string;
    updatedAt: string;
  };
}

// ─── ROUTE HANDLER ────────────────────────────────────────────────

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // 1. AUTH — admin only.
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin" && session.user?.role !== "super_admin") {
    return NextResponse.json(
      { error: "Forbidden — admin only" },
      { status: 403 },
    );
  }
  const adminId = session.user?.id;

  // 2. PARSE ID
  const { id } = await params;
  if (!id || id.length < 8) {
    return NextResponse.json(
      { error: "Invalid request id" },
      { status: 400 },
    );
  }

  // 3. PARSE BODY
  let body: UpdateBody;
  try {
    body = (await req.json()) as UpdateBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const newStatus = body.status?.trim() as RequestStatus;
  if (!VALID_STATUSES.has(newStatus)) {
    return NextResponse.json(
      {
        error:
          "Invalid status. Must be one of: pending, interested, not_interested, recontact_later, converted.",
      },
      { status: 400 },
    );
  }

  // 4. FETCH + UPDATE
  try {
    const existing = await prisma.accessRequest.findUnique({
      where: { id },
      select: { id: true, status: true, email: true, name: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "AccessRequest not found" },
        { status: 404 },
      );
    }

    const updated = await prisma.accessRequest.update({
      where: { id },
      data: { status: newStatus },
      select: {
        id: true,
        status: true,
        email: true,
        name: true,
        updatedAt: true,
      },
    });

    // 5. AUDIT LOG
    await logAudit({
      userId: adminId,
      action: "company_settings_update",
      resource: `access-request:${id}`,
      result: "success",
      ipAddress: extractIp(req),
      userAgent: extractUserAgent(req),
      metadata: {
        previousStatus: existing.status,
        newStatus,
        requestEmail: existing.email,
        requestName: existing.name,
        note: body.note ?? null,
      },
    });

    logInfo(
      "admin.requests.update",
      `Status of ${existing.email}: ${existing.status} → ${newStatus}`,
    );

    const response: UpdateResponse = {
      success: true,
      request: {
        id: updated.id,
        status: updated.status as RequestStatus,
        email: updated.email,
        name: updated.name,
        updatedAt: updated.updatedAt.toISOString(),
      },
    };

    return NextResponse.json(response);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError("admin.requests.update", `PATCH failed for ${id}: ${msg}`);
    return NextResponse.json(
      { error: "Failed to update request", detail: msg },
      { status: 500 },
    );
  }
}

// ─── GET single request (for the detail drawer) ──────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin" && session.user?.role !== "super_admin") {
    return NextResponse.json(
      { error: "Forbidden — admin only" },
      { status: 403 },
    );
  }

  const { id } = await params;
  if (!id || id.length < 8) {
    return NextResponse.json({ error: "Invalid request id" }, { status: 400 });
  }

  try {
    const request = await prisma.accessRequest.findUnique({
      where: { id },
      include: {
        invitation: {
          select: {
            id: true,
            token: true,
            usedAt: true,
            expiresAt: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!request) {
      return NextResponse.json(
        { error: "AccessRequest not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ request });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError("admin.requests.get", `GET failed for ${id}: ${msg}`);
    return NextResponse.json(
      { error: "Failed to fetch request", detail: msg },
      { status: 500 },
    );
  }
}
