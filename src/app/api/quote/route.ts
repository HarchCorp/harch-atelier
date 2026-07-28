import { NextRequest, NextResponse } from 'next/server';
import { quoteLimiter, getClientIp } from '@/lib/rate-limit';

function generateReference(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let ref = '';
  for (let i = 0; i < 6; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `REF-${ref}`;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed, remaining, resetAt } = quoteLimiter.check(ip);
  if (!allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many requests.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    const body = await request.json();
    const { name, email, organization, message, vertical, projectType, budget, timeline } = body;

    if (!name?.trim()) return NextResponse.json({ success: false, error: 'Name is required.' }, { status: 400 });
    if (!email?.trim() || !EMAIL_REGEX.test(email)) return NextResponse.json({ success: false, error: 'Valid email required.' }, { status: 400 });

    const reference = generateReference();

    const submission = {
      reference,
      timestamp: new Date().toISOString(),
      name: name.trim(),
      email: email.trim(),
      organization: organization?.trim() || '',
      vertical: vertical || '',
      projectType: projectType || '',
      budget: budget || '',
      timeline: timeline || '',
      message: message?.trim() || '',
    };

    console.log('[QUOTE SUBMISSION]', JSON.stringify(submission));

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
            subject: `[Quote] ${reference} — ${vertical} — ${name}`,
            text: `New quote request:\n\nReference: ${reference}\nName: ${name}\nEmail: ${email}\nOrganization: ${organization || 'N/A'}\nVertical: ${vertical}\nProject: ${projectType}\nBudget: ${budget}\nTimeline: ${timeline}\nMessage: ${message || 'N/A'}\n\nSubmitted: ${submission.timestamp}`,
          }),
        });
      } catch (e) {
        console.error('[Email send failed]', e);
      }
    }

    return NextResponse.json({ success: true, reference });
  } catch (error) {
    console.error('[Quote API Error]', error);
    return NextResponse.json({ success: false, error: 'Invalid request.' }, { status: 400 });
  }
}
