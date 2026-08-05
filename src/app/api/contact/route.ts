import { NextRequest, NextResponse } from 'next/server';
import { contactLimiter, getClientIp } from '@/lib/rate-limit';
import { z } from 'zod';
import { logInfo } from '@/lib/logger';

// ═══════════════════════════════════════════════════════════════
//  POST /api/contact
//
//  Public contact form. Hardened with Zod validation:
//    • null / non-object body → 400 (no TypeError)
//    • string length caps (name 100, email 200, message 5000) →
//      prevents DB bloat + log spam on volume attacks
//    • consultationType whitelist → prevents arbitrary enum injection
//
//  Mirrors the validation pattern from /api/access-request/route.ts.
//
//  Task ID: bugfix-qa-4b (crawler-technique objective: harden public
//  form APIs against null body + overflow + log injection)
// ═══════════════════════════════════════════════════════════════

const Schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(200),
  message: z.string().min(1).max(5000),
  consultationType: z.enum([
    'general',
    'demo',
    'enterprise',
    'agency',
    'investor',
    'press',
    'partnership',
    'support',
  ]),
  organization: z.string().max(200).optional(),
  designation: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  nda: z.boolean().optional(),
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
  const { allowed, resetAt } = contactLimiter.check(ip);
  if (!allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
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
    consultationType: data.consultationType,
    name: data.name,
    email: data.email,
    organization: data.organization ?? '',
    designation: data.designation ?? '',
    country: data.country ?? '',
    message: data.message,
    nda: data.nda === true,
  };

  // Structured log (replaces raw console.log of user payload —
  // defense-in-depth against log injection from user-controlled
  // strings).
  logInfo('contact.submission', `ref=${reference} type=${data.consultationType} email=${data.email}`);

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
          subject: `[Contact] ${reference} — ${data.consultationType} — ${data.name}`,
          text: `New contact submission:\n\nReference: ${reference}\nName: ${data.name}\nEmail: ${data.email}\nOrganization: ${data.organization || 'N/A'}\nType: ${data.consultationType}\nMessage: ${data.message}\n\nSubmitted: ${submission.timestamp}`,
        }),
      });
    } catch (e) {
      logInfo('contact.email', `resend failed ref=${reference}: ${e instanceof Error ? e.message : 'unknown'}`);
    }
  }

  return NextResponse.json({ success: true, reference });
}
