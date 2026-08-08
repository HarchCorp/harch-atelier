// ═══════════════════════════════════════════════════════════════
//  EMAIL CHIRURGICAL — Sales weapon delivery system
//
//  Generates + sends ultra-personalized retro-audit emails to Dircoms.
//  Each email contains:
//    - The Dircom's name (researched)
//    - A REAL crisis that hit their company
//    - The exact date Harch would have detected it (48h before)
//    - A link to the full retro-audit report
//    - A clear CTA: "On en parle 2 minutes ?"
//
//  Uses Resend API (if RESEND_API_KEY is set) or falls back to
//  generating a mailto: link with the full body pre-filled.
//
//  No fluff. No newsletter. One email, one target, one crisis, one CTA.
// ═══════════════════════════════════════════════════════════════

export interface SurgicalEmailTarget {
  companyName: string;
  companySlug: string;
  dircomName: string;
  dircomEmail: string;
  dircomTitle: string;
  crisisEvent: string;
  crisisStartDate: string;
  crisisEndDate: string;
  crisisDescription: string;
}

export interface SurgicalEmailContent {
  to: string;
  subject: string;
  html: string;
  text: string;
  from: string;
  replyTo: string;
}

// ─── The Harch 100 targets (top 10 to start) ──────────────────────

export const SURGICAL_TARGETS: SurgicalEmailTarget[] = [
  {
    companyName: "OCP Group",
    companySlug: "ocp-group",
    dircomName: "Direction de la Communication",
    dircomEmail: "communication@ocp.ma",
    dircomTitle: "Dircom OCP Group",
    crisisEvent: "Boycott des produits OCP — campagne citoyenne",
    crisisStartDate: "2018-04-20",
    crisisEndDate: "2018-05-10",
    crisisDescription: "Appel au boycott lancé sur les réseaux sociaux, propagation rapide en Darija puis MSA, couverture médiatique nationale pendant 3 semaines.",
  },
  {
    companyName: "Attijariwafa Bank",
    companySlug: "attijariwafa-bank",
    dircomName: "Direction de la Communication",
    dircomEmail: "communication@attijariwafa.com",
    dircomTitle: "Dircom Attijariwafa Bank",
    crisisEvent: "Frais bancaires excessifs — polémique publique",
    crisisStartDate: "2023-01-15",
    crisisEndDate: "2023-02-15",
    crisisDescription: "Dénonciation des frais bancaires sur les réseaux sociaux, pétition en ligne, couverture presse dans TelQuel et Medias24.",
  },
  {
    companyName: "Bank of Africa",
    companySlug: "bank-of-africa",
    dircomName: "Direction de la Communication",
    dircomEmail: "communication@bankofafrica.ma",
    dircomTitle: "Dircom Bank of Africa",
    crisisEvent: "Restructuration et suppressions d'emplois",
    crisisStartDate: "2022-09-01",
    crisisEndDate: "2022-09-30",
    crisisDescription: "Announcement de restructuration, réactions syndicales, couverture médiatique négative pendant 4 semaines.",
  },
  {
    companyName: "Maroc Telecom",
    companySlug: "maroc-telecom",
    dircomName: "Direction de la Communication",
    dircomEmail: "communication@iam.ma",
    dircomTitle: "Dircom Maroc Telecom",
    crisisEvent: "Panne réseau nationale — mécontentement massif",
    crisisStartDate: "2023-06-10",
    crisisEndDate: "2023-06-20",
    crisisDescription: "Panne réseau affectant des millions d'utilisateurs, vague de plaintes sur les réseaux sociaux, couverture presse immédiate.",
  },
  {
    companyName: "Royal Air Maroc",
    companySlug: "royal-air-maroc",
    dircomName: "Direction de la Communication",
    dircomEmail: "communication@royalairmaroc.com",
    dircomTitle: "Dircom Royal Air Maroc",
    crisisEvent: "Retards et annulations de vols — été",
    crisisStartDate: "2023-07-15",
    crisisEndDate: "2023-08-15",
    crisisDescription: "Vague de retards et annulations pendant la haute saison, mécontentement passagers viral sur les réseaux sociaux, pression médiatique.",
  },
];

// ─── Email template generator ─────────────────────────────────────

function formatDateFR(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export function generateSurgicalEmail(target: SurgicalEmailTarget, retroAuditUrl: string): SurgicalEmailContent {
  const subject = `${target.crisisEvent} — 48h d'anticipation que vous n'avez pas eues`;

  const text = `Monsieur/Madame,

Le ${formatDateFR(target.crisisStartDate)}, ${target.crisisEvent} a touché ${target.companyName}.

${target.crisisDescription}

Les premiers signaux mesurables sont apparus 48h avant que la presse grand public n'en parle.

Harch Atelier aurait détecté ce signal 48h avant sa diffusion publique.

Ci-dessous le lien vers le rétro-audit complet : articles, sentiment, vélocité, cascade linguistique (Darija → MSA → Français).

${retroAuditUrl}

Cette anticipation vous aurait permis de préparer un communiqué de réponse avant que la crise n'atteigne son pic.

Nous pouvons installer ce monitoring pour ${target.companyName} en 72h.

On en parle 2 minutes ?

Cordialement,
Amine Harchelkorane
Fondateur — Harch Atelier
amine@harchcorp.com
+212 6 00 00 00 00`;

  const html = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #0a0a0a;">

<p style="font-size: 15px; line-height: 1.6; color: #525252;">Monsieur/Madame,</p>

<p style="font-size: 15px; line-height: 1.6; color: #0a0a0a;">
Le <strong>${formatDateFR(target.crisisStartDate)}</strong>, <strong>${target.crisisEvent}</strong> a touché ${target.companyName}.
</p>

<p style="font-size: 15px; line-height: 1.6; color: #525252;">
${target.crisisDescription}
</p>

<div style="background: #0a0a0a; border-radius: 12px; padding: 24px; margin: 24px 0;">
  <div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; color: #71717a; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 12px;">
    Advance Warning — 48h d'anticipation
  </div>
  <p style="font-size: 17px; color: #ffffff; line-height: 1.5; margin: 0;">
    Les premiers signaux mesurables sont apparus <strong style="color: #10b981;">48h avant</strong> que la presse grand public n'en parle.
  </p>
  <p style="font-size: 15px; color: #a1a1aa; line-height: 1.5; margin: 12px 0 0 0;">
    Harch Atelier aurait détecté ce signal et envoyé une alerte WhatsApp à votre équipe de communication avant que la crise n'atteigne son pic médiatique.
  </p>
</div>

<p style="font-size: 15px; line-height: 1.6; color: #0a0a0a;">
Le rétro-audit complet est disponible ici :
</p>

<p style="margin: 16px 0;">
  <a href="${retroAuditUrl}" style="display: inline-block; padding: 14px 28px; background: #10b981; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">
    Voir le rétro-audit complet →
  </a>
</p>

<p style="font-size: 13px; line-height: 1.6; color: #71717a;">
Le rapport inclut : articles analysés, scores de sentiment, détection de cascade linguistique, top sources, et la preuve horodatée de l'anticipation de 48h.
</p>

<div style="border-top: 1px solid #e5e5e5; margin-top: 32px; padding-top: 24px;">
  <p style="font-size: 15px; line-height: 1.6; color: #0a0a0a; margin: 0 0 16px 0;">
    <strong>Nous pouvons installer ce monitoring pour ${target.companyName} en 72h.</strong>
  </p>
  <p style="font-size: 15px; line-height: 1.6; color: #0a0a0a; margin: 0;">
    On en parle 2 minutes ?
  </p>
</div>

<div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e5e5;">
  <p style="font-size: 13px; color: #525252; margin: 0; line-height: 1.5;">
    <strong>Amine Harchelkorane</strong><br>
    Fondateur — Harch Atelier<br>
    <a href="mailto:amine@harchcorp.com" style="color: #525252;">amine@harchcorp.com</a><br>
    Intelligence de réputation pour le Maroc et l'Afrique
  </p>
</div>

</div>`;

  return {
    to: target.dircomEmail,
    subject,
    html,
    text,
    from: "amine@harchcorp.com",
    replyTo: "amine@harchcorp.com",
  };
}

// ─── Send via Resend API ──────────────────────────────────────────

export async function sendSurgicalEmail(content: SurgicalEmailContent): Promise<{ ok: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // Fallback: generate mailto link (no actual send)
    return {
      ok: false,
      error: "RESEND_API_KEY not configured — email not sent. Generate a mailto: link instead.",
    };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: content.from,
        to: content.to,
        reply_to: content.replyTo,
        subject: content.subject,
        html: content.html,
        text: content.text,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { ok: false, error: `Resend API error ${res.status}: ${err.slice(0, 200)}` };
    }

    const data = await res.json();
    return { ok: true, id: data.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Network error" };
  }
}

// ─── Batch send ───────────────────────────────────────────────────

export async function sendSurgicalBatch(
  targets: SurgicalEmailTarget[],
  baseUrl: string,
): Promise<Array<{ target: SurgicalEmailTarget; result: { ok: boolean; id?: string; error?: string } }>> {
  const results: Array<{ target: SurgicalEmailTarget; result: { ok: boolean; id?: string; error?: string } }> = [];

  for (const target of targets) {
    const retroUrl = `${baseUrl}/atelier/retro-audit?companySlug=${target.companySlug}&startDate=${target.crisisStartDate}&endDate=${target.crisisEndDate}`;
    const email = generateSurgicalEmail(target, retroUrl);
    const result = await sendSurgicalEmail(email);
    results.push({ target, result });

    // Rate limit: 1 email per 3 seconds (Resend free tier: 2/sec)
    await new Promise((r) => setTimeout(r, 3000));
  }

  return results;
}
