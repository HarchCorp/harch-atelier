"use client";

// ════════════════════════════════════════════════════════════════════
//  ContactPage — Minimalist institutional contact page
//
//  Same design language as /atelier/login and /atelier/request-access:
//   • WHITE / #FAFAFA background, sage green (#4A7B5F) accents,
//     charcoal (#0A0A0A) text and primary action.
//   • NO emojis — Lucide icons only (Mail, Headphones, ShieldCheck,
//     Newspaper, Handshake, Briefcase, ArrowRight, CheckCircle,
//     AlertCircle).
//   • NO dark mode — institutional, minimalist, Bloomberg-clean.
//   • shadcn Card (12px radius), Tailwind CSS classes,
//     framer-motion for subtle entrance.
//   • Headers: 10px uppercase, JetBrains Mono, #9CA3AF.
//   • French throughout, mobile-first responsive.
//
//  Submits to POST /api/access-request with source: "contact-page".
//   - 200 → success state (CheckCircle, sage green)
//   - 409 → "Un compte existe déjà avec cet email. Connectez-vous."
//   - other → red banner (AlertCircle, role=alert)
//
//  Task ID: FINAL-CONTACT
// ════════════════════════════════════════════════════════════════════

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Headphones,
  ShieldCheck,
  Newspaper,
  Handshake,
  Briefcase,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { AtelierNav } from "../components/AtelierNav";
import { AtelierFooter } from "../components/AtelierFooter";
import { ScrollProgress, CursorGlow, BackToTop } from "../components/shared";

// ─── Design tokens (local — same as login & request-access) ─────────
const SAGE = "#4A7B5F";
const CHARCOAL = "#0A0A0A";
const TEXT_BODY = "#525252";
const TEXT_MUTED = "#71717A";
const TEXT_HEADER = "#9CA3AF";
const BORDER = "#E5E5E5";
const BORDER_LIGHT = "#F0F0F0";
const BG_SUBTLE = "#FAFAFA";

const FONT_SANS =
  "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
const FONT_MONO = "'JetBrains Mono', 'Space Mono', monospace";

// ─── Contact methods data ───────────────────────────────────────────
type ContactMethod = {
  icon: LucideIcon;
  title: string;
  email: string;
  response: string;
};

const CONTACT_METHODS: ContactMethod[] = [
  {
    icon: Mail,
    title: "Ventes",
    email: "sales@harchcorp.com",
    response: "Réponse sous 4 heures ouvrées",
  },
  {
    icon: Headphones,
    title: "Support",
    email: "support@harchcorp.com",
    response: "Réponse sous 2 heures (Corporate)",
  },
  {
    icon: ShieldCheck,
    title: "Sécurité",
    email: "security@harchcorp.com",
    response: "Réponse sous 24 heures",
  },
  {
    icon: Newspaper,
    title: "Presse",
    email: "press@harchcorp.com",
    response: "Réponse sous 1 jour ouvré",
  },
  {
    icon: Handshake,
    title: "Partenariats",
    email: "partners@harchcorp.com",
    response: "Réponse sous 2 jours ouvrés",
  },
  {
    icon: Briefcase,
    title: "Carrières",
    email: "careers@harchcorp.com",
    response: "Réponse sous 5 jours ouvrés",
  },
];

// ─── Offices data ───────────────────────────────────────────────────
type Office = {
  city: string;
  address: string;
  type: string;
};

const OFFICES: Office[] = [
  {
    city: "Casablanca",
    address: "Casablanca Finance City, Casa-Anfa",
    type: "Siège social",
  },
  {
    city: "Rabat",
    address: "Hay Riad Business District",
    type: "Secteur public",
  },
  {
    city: "Paris",
    address: "Station F (remote-first)",
    type: "Développement Europe",
  },
];

// ─── Shared card className (shadcn Card with overrides) ─────────────
// Override shadcn Card defaults: kill gap-6 and py-6 so we control
// internal spacing via padding + inner flex.
const CARD_CLASS =
  "bg-white rounded-xl border border-[#F0F0F0] shadow-sm gap-0 py-0";

// ════════════════════════════════════════════════════════════════════
//  ContactForm
// ════════════════════════════════════════════════════════════════════
type FormStatus = "idle" | "submitting" | "success" | "error";

function ContactForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const submittingRef = useRef(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setStatus("submitting");
    setErrorMsg("");

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      company: String(fd.get("company") || "") || undefined,
      message: String(fd.get("message") || ""),
      accountType: "brand-monitor" as const,
      source: "contact-page",
      referralSource: "contact-page",
    };

    try {
      const res = await fetch("/api/access-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStatus("success");
        return;
      }

      if (res.status === 409) {
        setErrorMsg(
          "Un compte existe déjà avec cet email. Connectez-vous."
        );
        setStatus("error");
        return;
      }

      const data = await res.json().catch(() => null);
      setErrorMsg(
        (data?.error as string) ||
          "Échec de l'envoi du message. Veuillez réessayer."
      );
      setStatus("error");
    } catch {
      setErrorMsg("Erreur réseau. Vérifiez votre connexion.");
      setStatus("error");
    } finally {
      submittingRef.current = false;
    }
  }

  // ─── Success state ─────────────────────────────────────────────
  if (status === "success") {
    return (
      <Card
        className={CARD_CLASS}
        style={{ padding: 32, textAlign: "center" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <CheckCircle
            size={24}
            strokeWidth={2}
            style={{ color: SAGE }}
          />
        </div>
        <p
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: CHARCOAL,
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Message envoyé. Nous vous répondrons sous 4h.
        </p>
        <p
          style={{
            fontSize: 13,
            color: TEXT_MUTED,
            margin: "8px 0 0",
            lineHeight: 1.55,
          }}
        >
          Merci de votre message. Un membre de l&rsquo;équipe Harch Atelier
          vous recontactera très vite.
        </p>
      </Card>
    );
  }

  // ─── Form ──────────────────────────────────────────────────────
  return (
    <Card className={CARD_CLASS} style={{ padding: 24 }}>
      <form onSubmit={handleSubmit}>
        {/* Error banner */}
        {status === "error" && errorMsg && (
          <div role="alert" className="harch-contact-error">
            <AlertCircle
              size={14}
              strokeWidth={2}
              style={{ marginRight: 6, flexShrink: 0 }}
            />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Nom complet */}
        <div className="harch-contact-field">
          <label className="harch-contact-label" htmlFor="contact-name">
            Nom complet <span style={{ color: SAGE }}>*</span>
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            maxLength={100}
            placeholder="Sara Benani"
            autoComplete="name"
            className="harch-contact-input"
          />
        </div>

        {/* Email professionnel */}
        <div className="harch-contact-field">
          <label className="harch-contact-label" htmlFor="contact-email">
            Email professionnel <span style={{ color: SAGE }}>*</span>
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            maxLength={200}
            placeholder="sara@entreprise.com"
            autoComplete="email"
            className="harch-contact-input"
          />
        </div>

        {/* Entreprise (optional) */}
        <div className="harch-contact-field">
          <label className="harch-contact-label" htmlFor="contact-company">
            Entreprise{" "}
            <span style={{ color: TEXT_MUTED, fontWeight: 400 }}>
              (optionnel)
            </span>
          </label>
          <input
            id="contact-company"
            name="company"
            type="text"
            maxLength={200}
            placeholder="Acme Communications"
            autoComplete="organization"
            className="harch-contact-input"
          />
        </div>

        {/* Message */}
        <div className="harch-contact-field">
          <label className="harch-contact-label" htmlFor="contact-message">
            Message <span style={{ color: SAGE }}>*</span>
          </label>
          <textarea
            id="contact-message"
            name="message"
            required
            maxLength={2000}
            rows={5}
            placeholder="Comment pouvons-nous vous aider ?"
            className="harch-contact-input harch-contact-textarea"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={status === "submitting"}
          className="harch-contact-submit"
          style={{ opacity: status === "submitting" ? 0.6 : 1 }}
        >
          <span>
            {status === "submitting" ? "Envoi…" : "Envoyer le message"}
          </span>
          {status !== "submitting" && (
            <ArrowRight size={14} strokeWidth={2} style={{ marginLeft: 6 }} />
          )}
        </button>
      </form>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════════════
//  ContactMethodCard
// ════════════════════════════════════════════════════════════════════
function ContactMethodCard({ method }: { method: ContactMethod }) {
  const Icon = method.icon;
  return (
    <Card className={CARD_CLASS} style={{ padding: 16 }}>
      <div className="flex items-start gap-3">
        <div
          style={{
            flexShrink: 0,
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "rgba(74,123,95,0.10)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={20} strokeWidth={2} style={{ color: SAGE }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: CHARCOAL,
              marginBottom: 2,
            }}
          >
            {method.title}
          </div>
          <a
            href={`mailto:${method.email}`}
            style={{
              display: "block",
              fontSize: 13,
              color: SAGE,
              textDecoration: "none",
              fontWeight: 500,
              fontFamily: FONT_MONO,
            }}
            className="harch-contact-mailto"
          >
            {method.email}
          </a>
          <div
            style={{
              fontSize: 11,
              color: TEXT_HEADER,
              marginTop: 4,
              fontFamily: FONT_MONO,
            }}
          >
            {method.response}
          </div>
        </div>
      </div>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════════════
//  OfficeCard
// ════════════════════════════════════════════════════════════════════
function OfficeCard({ office }: { office: Office }) {
  return (
    <Card className={CARD_CLASS} style={{ padding: 16 }}>
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: CHARCOAL,
          letterSpacing: "-0.02em",
          marginBottom: 6,
        }}
      >
        {office.city}
      </div>
      <div
        style={{
          fontSize: 13,
          color: TEXT_BODY,
          lineHeight: 1.5,
          marginBottom: 10,
        }}
      >
        {office.address}
      </div>
      <span
        style={{
          display: "inline-block",
          fontSize: 11,
          fontWeight: 600,
          color: SAGE,
          background: "rgba(74,123,95,0.10)",
          padding: "4px 10px",
          borderRadius: 100,
          fontFamily: FONT_MONO,
          letterSpacing: "0.04em",
        }}
      >
        {office.type}
      </span>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════════════
//  ContactPage (default export)
// ════════════════════════════════════════════════════════════════════
export default function ContactPage() {
  return (
    <>
      <style>{contactFormCss}</style>
      <ScrollProgress />
      <CursorGlow />
      <AtelierNav />

      {/* MAIN */}
      <main
        style={{
          background: BG_SUBTLE,
          minHeight: "100vh",
          fontFamily: FONT_SANS,
          color: CHARCOAL,
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            padding: "48px 24px",
          }}
        >
          {/* ─── Section 1: Hero ───────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{
              textAlign: "center",
              marginBottom: 40,
            }}
          >
            <h1
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: CHARCOAL,
                letterSpacing: "-0.03em",
                margin: "0 0 12px",
              }}
            >
              Contact
            </h1>
            <p
              style={{
                fontSize: 16,
                color: TEXT_MUTED,
                lineHeight: 1.55,
                margin: 0,
                maxWidth: 640,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              Notre équipe vous répond sous 4 heures ouvrées.
            </p>
          </motion.div>

          {/* ─── Section 2: Form + Contact methods ──────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
            className="grid gap-8 harch-contact-grid"
            style={{
              gridTemplateColumns: "1fr 1fr",
            }}
          >
            {/* Left: form (first on mobile via DOM order) */}
            <ContactForm />

            {/* Right: contact methods */}
            <div className="flex flex-col gap-3">
              {CONTACT_METHODS.map((m) => (
                <ContactMethodCard key={m.email} method={m} />
              ))}
            </div>
          </motion.div>

          {/* ─── Section 3: Offices ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
            style={{ marginTop: 64 }}
          >
            <div
              style={{
                fontSize: 10,
                fontFamily: FONT_MONO,
                color: TEXT_HEADER,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontWeight: 700,
                marginBottom: 16,
              }}
            >
              Bureaux
            </div>
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(240px, 1fr))",
              }}
            >
              {OFFICES.map((o) => (
                <OfficeCard key={o.city} office={o} />
              ))}
            </div>
          </motion.div>
        </div>

        {/* ─── Section 4: CTA ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.15 }}
          style={{
            background: CHARCOAL,
            padding: "48px 24px",
            textAlign: "center",
            marginTop: 64,
          }}
        >
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "#FFFFFF",
                letterSpacing: "-0.02em",
                margin: "0 0 12px",
              }}
            >
              Préférez parler à un humain ?
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.7)",
                lineHeight: 1.6,
                margin: "0 0 28px",
              }}
            >
              Réservez un appel de 30 minutes avec notre équipe.
            </p>
            <a
              href="mailto:sales@harchcorp.com?subject=Demande d'appel — Harch Atelier"
              className="harch-contact-cta"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                background: SAGE,
                color: "#FFFFFF",
                fontSize: 14,
                fontWeight: 600,
                padding: "12px 24px",
                borderRadius: 10,
                textDecoration: "none",
                fontFamily: FONT_SANS,
                height: 42,
              }}
            >
              <span>Réserver un appel</span>
              <ArrowRight size={14} strokeWidth={2} />
            </a>
          </div>
        </motion.div>
      </main>

      <AtelierFooter />
      <BackToTop />
    </>
  );
}

// ─── Scoped CSS (inputs, focus, hover, mobile responsive) ───────────
const contactFormCss = `
  .harch-contact-field {
    display: flex;
    flex-direction: column;
    margin-bottom: 14px;
  }
  .harch-contact-label {
    font-size: 12px;
    font-weight: 600;
    color: ${CHARCOAL};
    margin-bottom: 4px;
    font-family: ${FONT_SANS};
  }
  .harch-contact-input {
    width: 100%;
    height: 42px;
    border: 1px solid ${BORDER};
    border-radius: 10px;
    padding: 0 14px;
    font-size: 14px;
    background: ${BG_SUBTLE};
    color: ${CHARCOAL};
    box-sizing: border-box;
    outline: none;
    font-family: ${FONT_SANS};
    transition: border-color 150ms ease, background 150ms ease, box-shadow 150ms ease;
  }
  .harch-contact-input::placeholder {
    color: ${TEXT_HEADER};
  }
  .harch-contact-input:focus {
    border-color: ${SAGE};
    background: #FFFFFF;
    box-shadow: 0 0 0 3px rgba(74,123,95,0.08);
  }
  .harch-contact-textarea {
    height: 120px;
    padding: 12px 14px;
    resize: vertical;
    line-height: 1.5;
  }
  .harch-contact-submit {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 42px;
    background: ${CHARCOAL};
    color: #FFFFFF;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    font-family: ${FONT_SANS};
    cursor: pointer;
    margin-top: 6px;
    transition: background 150ms ease, box-shadow 150ms ease, opacity 150ms ease;
  }
  .harch-contact-submit:not(:disabled):hover {
    background: #1A1A1A;
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  }
  .harch-contact-submit:disabled {
    cursor: not-allowed;
  }
  .harch-contact-error {
    display: flex;
    align-items: center;
    padding: 10px 14px;
    background: #FEF2F2;
    border: 1px solid #FECACA;
    border-radius: 8px;
    font-size: 13px;
    color: #991B1B;
    margin-bottom: 16px;
    font-family: ${FONT_SANS};
  }
  .harch-contact-mailto:hover {
    text-decoration: underline;
  }
  .harch-contact-cta:hover {
    background: #3D6B51 !important;
  }
  @media (max-width: 768px) {
    .harch-contact-grid {
      grid-template-columns: 1fr !important;
    }
  }
`;
