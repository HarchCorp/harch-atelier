// ═══════════════════════════════════════════════════════════════
//  EMAIL SYSTEM — Transactional emails via Resend
//
//  Required env var: RESEND_API_KEY
//  Free tier: 100 emails/day, 3000/month
//
//  Templates:
//    1. welcome — after account activation
//    2. invitation — when boss provisions a client
//    3. reset-password — when user forgets password
//    4. invoice — when payment is due (future)
// ═══════════════════════════════════════════════════════════════

import { Resend } from "resend";
import { logInfo, logError } from "@/lib/logger";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = "Harch Atelier <atelier@harchcorp.com>";
const REPLY_TO = "atelier@harchcorp.com";

// ─── Check if email is configured ──────────────────────────────
export function isEmailConfigured(): boolean {
  return !!resend;
}

// ─── Send email (fire-and-forget, never throws) ────────────────
async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  if (!resend) {
    logInfo("email", `[EMAIL SKIP] No RESEND_API_KEY — would send to ${to}: ${subject}`);
    return;
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      replyTo: REPLY_TO,
      subject,
      html,
    });

    if (error) {
      logError("email", `[EMAIL ERROR] ${to}: ${error.message}`);
    } else {
      logInfo("email", `[EMAIL SENT] ${to}: ${subject}`);
    }
  } catch (err) {
    logError("email", `[EMAIL FAIL] ${to}: ${err}`);
  }
}

// ═══════════════════════════════════════════════════════════════
//  TEMPLATE 1: Welcome email (after account activation)
// ═══════════════════════════════════════════════════════════════

export async function sendWelcomeEmail(params: {
  email: string;
  name: string;
  planLabel: string;
  loginUrl: string;
}): Promise<void> {
  const { email, name, planLabel, loginUrl } = params;

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#FAFAFA;font-family:'Inter',system-ui,-apple-system,sans-serif;color:#0A0A0A;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

    <!-- Logo -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;padding:8px 16px;background:#4A7B5F;color:#FFFFFF;font-family:'Space Mono',monospace;font-size:14px;font-weight:700;letter-spacing:0.04em;border-radius:4px;">
        HARCH ATELIER
      </div>
    </div>

    <!-- Content -->
    <div style="background:#FFFFFF;border:1px solid #F0F0F0;border-radius:12px;padding:40px;">

      <h1 style="font-size:24px;font-weight:700;margin:0 0 16px;color:#0A0A0A;">
        Bienvenue, ${name}.
      </h1>

      <p style="font-size:15px;line-height:1.6;color:#525252;margin:0 0 16px;">
        Votre compte <strong>${planLabel}</strong> est activé. Vous avez désormais accès à
        votre tableau de bord de veille réputationnelle.
      </p>

      <div style="background:rgba(74,123,95,0.06);border:1px solid rgba(74,123,95,0.2);border-radius:8px;padding:16px;margin:24px 0;">
        <p style="font-size:13px;font-weight:600;color:#4A7B5F;margin:0 0 8px;font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:0.08em;">
          Pour commencer
        </p>
        <ol style="font-size:14px;color:#525252;margin:0;padding-left:20px;line-height:1.8;">
          <li>Connectez-vous à votre tableau de bord</li>
          <li>Complétez l'onboarding (2 minutes)</li>
          <li>Découvrez votre score de réputation</li>
          <li>Posez votre première question à HarchIQ AI</li>
        </ol>
      </div>

      <a href="${loginUrl}"
         style="display:inline-block;padding:14px 28px;background:#0A0A0A;color:#FFFFFF;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;margin-top:16px;">
        Accéder à mon tableau de bord →
      </a>

      <p style="font-size:13px;color:#71717A;margin:32px 0 0;line-height:1.5;">
        Une question ? Répondez à cet email ou écrivez à
        <a href="mailto:atelier@harchcorp.com" style="color:#4A7B5F;">atelier@harchcorp.com</a>.
      </p>

    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:24px;">
      <p style="font-size:11px;color:#9CA3AF;font-family:'Space Mono',monospace;">
        Harch Corp · Casablanca, Maroc · Conforme CNDP · Loi 09-08
      </p>
    </div>

  </div>
</body>
</html>
  `.trim();

  void sendEmail(email, `Bienvenue chez Harch Atelier — ${planLabel}`, html);
}

// ═══════════════════════════════════════════════════════════════
//  TEMPLATE 2: Invitation email (when boss provisions a client)
// ═══════════════════════════════════════════════════════════════

export async function sendInvitationEmail(params: {
  email: string;
  name: string;
  planLabel: string;
  companyName: string;
  activationUrl: string;
  bossName?: string;
}): Promise<void> {
  const { email, name, planLabel, companyName, activationUrl, bossName } = params;

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#FAFAFA;font-family:'Inter',system-ui,-apple-system,sans-serif;color:#0A0A0A;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;padding:8px 16px;background:#4A7B5F;color:#FFFFFF;font-family:'Space Mono',monospace;font-size:14px;font-weight:700;letter-spacing:0.04em;border-radius:4px;">
        HARCH ATELIER
      </div>
    </div>

    <div style="background:#FFFFFF;border:1px solid #F0F0F0;border-radius:12px;padding:40px;">

      <h1 style="font-size:24px;font-weight:700;margin:0 0 16px;color:#0A0A0A;">
        ${name}, votre accès est prêt.
      </h1>

      <p style="font-size:15px;line-height:1.6;color:#525252;margin:0 0 16px;">
        ${bossName ? `<strong>${bossName}</strong> de l'équipe Harch Atelier` : "L'équipe Harch Atelier"}
        a configuré votre accès <strong>${planLabel}</strong> pour
        <strong>${companyName}</strong>.
      </p>

      <p style="font-size:15px;line-height:1.6;color:#525252;margin:0 0 24px;">
        Cliquez sur le lien ci-dessous pour activer votre compte et créer votre mot de passe.
        Ce lien expire dans 7 jours.
      </p>

      <a href="${activationUrl}"
         style="display:inline-block;padding:14px 28px;background:#4A7B5F;color:#FFFFFF;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;">
        Activer mon compte →
      </a>

      <p style="font-size:13px;color:#71717A;margin:32px 0 0;line-height:1.5;">
        Si vous n'attendiez pas cet email, vous pouvez l'ignorer.
        Pour toute question : <a href="mailto:atelier@harchcorp.com" style="color:#4A7B5F;">atelier@harchcorp.com</a>
      </p>

    </div>

    <div style="text-align:center;margin-top:24px;">
      <p style="font-size:11px;color:#9CA3AF;font-family:'Space Mono',monospace;">
        Harch Corp · Casablanca, Maroc · Conforme CNDP · Loi 09-08
      </p>
    </div>

  </div>
</body>
</html>
  `.trim();

  void sendEmail(email, `Votre accès Harch Atelier — ${companyName}`, html);
}

// ═══════════════════════════════════════════════════════════════
//  TEMPLATE 3: Password reset email
// ═══════════════════════════════════════════════════════════════

export async function sendPasswordResetEmail(params: {
  email: string;
  name: string;
  resetUrl: string;
}): Promise<void> {
  const { email, name, resetUrl } = params;

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#FAFAFA;font-family:'Inter',system-ui,-apple-system,sans-serif;color:#0A0A0A;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;padding:8px 16px;background:#4A7B5F;color:#FFFFFF;font-family:'Space Mono',monospace;font-size:14px;font-weight:700;letter-spacing:0.04em;border-radius:4px;">
        HARCH ATELIER
      </div>
    </div>

    <div style="background:#FFFFFF;border:1px solid #F0F0F0;border-radius:12px;padding:40px;">

      <h1 style="font-size:24px;font-weight:700;margin:0 0 16px;color:#0A0A0A;">
        Réinitialisez votre mot de passe
      </h1>

      <p style="font-size:15px;line-height:1.6;color:#525252;margin:0 0 24px;">
        ${name}, nous avons reçu une demande de réinitialisation pour votre compte.
        Cliquez sur le lien ci-dessous pour choisir un nouveau mot de passe.
        Ce lien expire dans 1 heure.
      </p>

      <a href="${resetUrl}"
         style="display:inline-block;padding:14px 28px;background:#0A0A0A;color:#FFFFFF;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;">
        Réinitialiser mon mot de passe →
      </a>

      <p style="font-size:13px;color:#71717A;margin:32px 0 0;line-height:1.5;">
        Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
        Votre mot de passe ne sera pas modifié.
      </p>

    </div>

    <div style="text-align:center;margin-top:24px;">
      <p style="font-size:11px;color:#9CA3AF;font-family:'Space Mono',monospace;">
        Harch Corp · Casablanca, Maroc · Conforme CNDP · Loi 09-08
      </p>
    </div>

  </div>
</body>
</html>
  `.trim();

  void sendEmail(email, `Réinitialisez votre mot de passe — Harch Atelier`, html);
}

// ═══════════════════════════════════════════════════════════════
//  TEMPLATE 4: Invoice email (future — stub for now)
// ═══════════════════════════════════════════════════════════════

export async function sendInvoiceEmail(params: {
  email: string;
  name: string;
  invoicePdfUrl: string;
  amountMAD: number;
  period: string;
}): Promise<void> {
  const { email, name, invoicePdfUrl, amountMAD, period } = params;

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#FAFAFA;font-family:'Inter',system-ui,sans-serif;color:#0A0A0A;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;padding:8px 16px;background:#4A7B5F;color:#FFFFFF;font-family:'Space Mono',monospace;font-size:14px;font-weight:700;border-radius:4px;">HARCH ATELIER</div>
    </div>
    <div style="background:#FFFFFF;border:1px solid #F0F0F0;border-radius:12px;padding:40px;">
      <h1 style="font-size:24px;font-weight:700;margin:0 0 16px;">Facture — ${period}</h1>
      <p style="font-size:15px;color:#525252;line-height:1.6;margin:0 0 24px;">
        ${name}, veuillez trouver ci-joint votre facture de <strong>${amountMAD.toLocaleString("fr-FR")} MAD</strong>
        pour la période ${period}. Le paiement est attendu par virement bancaire dans les 30 jours.
      </p>
      <a href="${invoicePdfUrl}" style="display:inline-block;padding:14px 28px;background:#0A0A0A;color:#FFFFFF;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;">Télécharger la facture PDF →</a>
      <p style="font-size:13px;color:#71717A;margin:32px 0 0;">Coordonnées bancaires (RIB/IBAN) incluses dans la facture. Pour toute question : atelier@harchcorp.com</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  void sendEmail(email, `Facture Harch Atelier — ${period}`, html);
}
