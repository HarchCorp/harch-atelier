import { NextRequest, NextResponse } from 'next/server';
import { contactLimiter, getClientIp } from '@/lib/rate-limit';

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
  const { allowed, remaining, resetAt } = contactLimiter.check(ip);
  if (!allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    const body = await request.json();
    const { name, email, message, consultationType, organization, designation, country, nda } = body;

    if (!name?.trim()) return NextResponse.json({ success: false, error: 'Name is required.' }, { status: 400 });
    if (!email?.trim() || !EMAIL_REGEX.test(email)) return NextResponse.json({ success: false, error: 'Valid email required.' }, { status: 400 });
    if (!message?.trim()) return NextResponse.json({ success: false, error: 'Message is required.' }, { status: 400 });
    if (!consultationType) return NextResponse.json({ success: false, error: 'Consultation type is required.' }, { status: 400 });

    const reference = generateReference();

    // Store submission
    const submission = {
      reference,
      timestamp: new Date().toISOString(),
      consultationType,
      name: name.trim(),
      email: email.trim(),
      organization: organization?.trim() || '',
      designation: designation?.trim() || '',
      country: country?.trim() || '',
      message: message.trim(),
      nda: !!nda,
    };

    // Log for Vercel (visible in Vercel dashboard > Functions > Logs)
    console.log('[CONTACT SUBMISSION]', JSON.stringify(submission));

    // Try to send email via Resend if API key is available
    if (process.env.RESEND_API_KEY) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'noreply@harchcorp.com',
            to: 'amine@harchcorp.com',
            subject: `[Contact] ${reference} — ${consultationType} — ${name}`,
            text: `New contact submission:\n\nReference: ${reference}\nName: ${name}\nEmail: ${email}\nOrganization: ${organization || 'N/A'}\nType: ${consultationType}\nMessage: ${message}\n\nSubmitted: ${submission.timestamp}`,
          }),
        });
      } catch (e) {
        console.error('[Email send failed]', e);
      }
    }

    return NextResponse.json({ success: true, reference });
  } catch (error) {
    console.error('[Contact API Error]', error);
    return NextResponse.json({ success: false, error: 'Invalid request.' }, { status: 400 });
  }
}
