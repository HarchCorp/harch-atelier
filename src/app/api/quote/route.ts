import { NextRequest, NextResponse } from 'next/server';
import { quoteLimiter, getClientIp } from '@/lib/rate-limit';
import { z } from 'zod';
import { logInfo } from '@/lib/logger';

// ═══════════════════════════════════════════════════════════════
//  POST /api/quote
//
//  Public quote request form. Hardened with Zod validation:
//    • null / non-object body → 400 (no TypeError)
//    • string length caps (name 100, email 200, message 5000) →
//      prevents DB bloat + log spam on volume attacks
//    • vertical / projectType / budget / timeline whitelisted or
//      capped → prevents arbitrary enum injection
//
//  Mirrors the validation pattern from /api/access-request/route.ts.
//
//  Task ID: bugfix-qa-4b (crawler-technique objective: harden public
//  form APIs against null body + overflow + log injection)
// ═══════════════════════════════════════════════════════════════

const Schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(200),
  organization: z.string().max(200).optional(),
  vertical: z.string().max(100).optional(),
  projectType: z.string().max(100).optional(),
  budget: z.string().max(50).optional(),
  timeline: z.string().max(50).optional(),
  message: z.string().max(5000).optional(),
});

function generateReference(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let ref = '';
  for (let i = 0; i < 6; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `REF-${ref}`;
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed, resetAt } = quoteLimiter.check(ip);
  if (!allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many requests.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)) } }
    );
  }

  // 1. Parse + validate body with Zod. Handles null, non-object,
  //    wrong types, missing fields, and overflow in one shot.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON body.' },
      { status: 400 }
    );
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid input.', details: parsed.error.issues },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const reference = generateReference();

  const submission = {
    reference,
    timestamp: new Date().toISOString(),
    name: data.name,
    email: data.email,
    organization: data.organization ?? '',
    vertical: data.vertical ?? '',
    projectType: data.projectType ?? '',
    budget: data.budget ?? '',
    timeline: data.timeline ?? '',
    message: data.message ?? '',
  };

  // Structured log (replaces raw console.log of user payload —
  // defense-in-depth against log injection from user-controlled
  // strings).
  logInfo('quote.submission', `ref=${reference} vertical=${data.vertical ?? 'n/a'} email=${data.email}`);

  // 2. Send email via Resend if configured.
  if (process.env.RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'noreply@harchcorp.com',
          to: 'amine@harchcorp.com',
          subject: `[Quote] ${reference} — ${data.vertical ?? 'n/a'} — ${data.name}`,
          text: `New quote request:\n\nReference: ${reference}\nName: ${data.name}\nEmail: ${data.email}\nOrganization: ${data.organization || 'N/A'}\nVertical: ${data.vertical || 'N/A'}\nProject: ${data.projectType || 'N/A'}\nBudget: ${data.budget || 'N/A'}\nTimeline: ${data.timeline || 'N/A'}\nMessage: ${data.message || 'N/A'}\n\nSubmitted: ${submission.timestamp}`,
        }),
      });
    } catch (e) {
      logInfo('quote.email', `resend failed ref=${reference}: ${e instanceof Error ? e.message : 'unknown'}`);
    }
  }

  return NextResponse.json({ success: true, reference });
}
