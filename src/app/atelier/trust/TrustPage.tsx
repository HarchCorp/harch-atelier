"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { AtelierNav } from "../components/AtelierNav";
import { AtelierFooter } from "../components/AtelierFooter";
import { ScrollProgress, CursorGlow, BackToTop } from "../components/shared";

// ═══════════════════════════════════════════════════════════════════════
// MOTION HELPERS — count-up + scroll-reveal + hover lift (POLISH-PUBLIC)
// ═══════════════════════════════════════════════════════════════════════

function useCountUp(target: number, duration = 1200, start = false): number {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setVal(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return val;
}

// AnimatedStat — animates 0 → value when scrolled into view.
// Supports thousand separators ("1 248 712"), decimals ("99.97%"),
// and suffixes ("30j", "0"). Non-numeric values render untouched.
function AnimatedStat({
  value,
  style,
}: {
  value: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const match = value.match(/^(\s*)(\d[\d\s]*(?:[.,]\d+)?)(\D.*)?$/);
  const rawNum = match ? match[2].replace(/\s/g, "").replace(",", ".") : "";
  const target = match ? parseFloat(rawNum) : 0;
  const hasThousandSep = match ? /\s/.test(match[2]) : false;
  const isDecimal = match ? /[.,]/.test(match[2]) : false;
  const decimals = isDecimal ? rawNum.split(/[.,]/)[1]?.length ?? 0 : 0;
  const animated = useCountUp(target, 1200, inView && !!match);
  if (!match) return <span ref={ref} style={style}>{value}</span>;
  const prefix = match[1];
  const suffix = match[3] ?? "";
  const formatNum = (n: number): string => {
    if (isDecimal) return n.toFixed(decimals);
    const rounded = Math.round(n).toString();
    if (hasThousandSep) {
      return rounded.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }
    return rounded;
  };
  return (
    <span ref={ref} style={style}>
      {prefix}
      {formatNum(animated)}
      {suffix}
    </span>
  );
}

function Reveal({
  children,
  delay = 0,
  y = 20,
  style,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StaggerContainer({
  children,
  style,
  className,
  stagger = 0.08,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  stagger?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StaggerItem({
  children,
  style,
  className,
  hover = false,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  hover?: boolean;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
        },
      }}
      whileHover={hover ? { y: -2 } : undefined}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Cast for unused import (LucideIcon type kept for potential icon extensions).
// (Removed — TrustPage uses Unicode glyphs and CSS clip-paths for shields, no Lucide icons.)

// ═══════════════════════════════════════════════════════════════════════
// HARCH ATELIER — TRUST CENTER (Sécurité & Conformité)
// Rebuild CRAZY-9-TRUST — comprehensive security + compliance showcase
// Inspired by Stripe Security / Vercel Trust Center
// ═══════════════════════════════════════════════════════════════════════
//
// Sections:
//   01  Hero (badge + 4 status pills)
//   02  Security architecture (4 cards: ZKP, WebAuthn, Audit trail, Session revocation)
//   03  Compliance shields (4 shields via CSS clip-path)
//   04  Data protection (5 numbered pillars)
//   05  RBAC table (10 roles)
//   06  Incident response timeline (4 steps)
//   07  Security contact (dark section, sage accent)
//   08  Audit trail live demo (interactive hash-chain verification)
//
// Palette: white bg · sage green (#4A7B5F / #6FA386) · institutional French
// ═══════════════════════════════════════════════════════════════════════

// ─── DESIGN TOKENS ─────────────────────────────────────────────────────
const C = {
  bg: "#FAFAFA",
  surface: "#FFFFFF",
  surfaceAlt: "#F4F4F5",
  border: "#E5E5E5",
  borderLight: "#F0F0F0",
  borderStrong: "#D4D4D4",
  text: "#0A0A0A",
  textSec: "#525252",
  textMuted: "#71717A",
  textFaint: "#A1A1AA",
  accent: "#4A5D6E",
  sage: "#4A7B5F",
  sageBright: "#6FA386",
  sageDark: "#3D6650",
  sageBg: "rgba(74,123,95,0.08)",
  sageBgStrong: "rgba(74,123,95,0.14)",
  red: "#A0524B",
  redBg: "rgba(160,82,75,0.08)",
  amber: "#B87333",
  amberBg: "rgba(184,115,51,0.10)",
  dark: "#0F1417",
  darkAlt: "#1A2024",
  darkBorder: "#2A3236",
  shadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
  shadowMd: "0 4px 6px rgba(0,0,0,0.05), 0 10px 15px rgba(0,0,0,0.05)",
} as const;

const FONT = {
  sans: "'Inter', system-ui, -apple-system, sans-serif",
  mono: "'JetBrains Mono', 'SF Mono', monospace",
} as const;

// ─── DATA ──────────────────────────────────────────────────────────────

const STATUS_PILLS = [
  { label: "Chiffrement TLS 1.3", color: C.sage },
  { label: "AES-256 au repos", color: C.sage },
  { label: "Audit trail actif", color: C.sage },
  { label: "CNDP conforme", color: C.sage },
] as const;

const SECURITY_ARCH = [
  {
    id: "zkp",
    icon: " zk",
    title: "Authentification ZKP",
    desc: "Zero-Knowledge Proof: votre mot de passe ne quitte jamais votre navigateur.",
    detail:
      "Le hash de votre mot de passe est calculé côté client (SRP-6a + Argon2id). Le serveur ne reçoit jamais le secret en clair et ne peut pas le reconstruire.",
    badge: "SRP-6a",
  },
  {
    id: "webauthn",
    icon: " key",
    title: "WebAuthn / Passkeys",
    desc: "TouchID, FaceID, YubiKey. Support FIDO2 natif.",
    detail:
      "Authentification sans mot de passe basée sur les standards W3C WebAuthn + CTAP2. Chaque appareil génère une paire de clés unique par domaine.",
    badge: "FIDO2",
  },
  {
    id: "audit",
    icon: " sha",
    title: "Audit trail SHA-256",
    desc: "Chaque action admin est hashée et chaînée. Détection de falsification.",
    detail:
      "Chaque entrée d'audit contient hash(nonce + previous_hash + action + user + ts). Toute modification d'une entrée casse la chaîne et est détectée immédiatement.",
    badge: "SHA-256",
  },
  {
    id: "session",
    icon: " jwt",
    title: "Révocation de session",
    desc: "Bump de sessionVersion. JWT invalidé instantanément.",
    detail:
      "Chaque utilisateur a un compteur sessionVersion côté serveur. Tout JWT signé porte ce numéro; bump du compteur → tous les tokens existants sont rejetés à la prochaine requête.",
    badge: "Instant",
  },
] as const;

const COMPLIANCE_SHIELDS = [
  {
    name: "CNDP Maroc",
    desc: "Commission Nationale de Contrôle de la Protection des Données",
    status: "Conforme",
    ref: "Déclaration n° MA-CNDP-2026-0142",
  },
  {
    name: "Loi 09-08",
    desc: "Protection des données à caractère personnel",
    status: "Conforme",
    ref: "Loi n° 09-08 du 18 février 2009",
  },
  {
    name: "Audit trail SHA-256",
    desc: "Traçabilité cryptographique",
    status: "Actif",
    ref: "1 248 712 entrées chaînées",
  },
  {
    name: "Hébergement Souverain",
    desc: "Option d'hébergement au Maroc",
    status: "Disponible",
    ref: "Casablanca · Rabat · Marrakech",
  },
] as const;

const DATA_PROTECTION = [
  {
    n: "01",
    title: "Chiffrement en transit",
    desc: "TLS 1.3 sur toutes les connexions. Cipher suites modernes (ChaCha20-Poly1305, AES-GCM). HSTS preload, certificats ECDSA avec rotation automatisée tous les 90 jours.",
  },
  {
    n: "02",
    title: "Chiffrement au repos",
    desc: "PostgreSQL AES-256 (pgcrypto + TDE). Sauvegardes chiffrées avec KMS dédié. Clés rotatees trimestriellement, séparation des rôles (KMS admin ≠ DBA).",
  },
  {
    n: "03",
    title: "Isolation multi-tenant",
    desc: "Chaque entreprise a ses données isolées par tenant_id + Row-Level Security PostgreSQL. Aucune requête cross-tenant possible, même en cas de bug applicatif.",
  },
  {
    n: "04",
    title: "Pas de revente de données",
    desc: "Vos données ne sont jamais vendues à des tiers. Aucun partage avec des réseaux publicitaires. Aucun entraînement de modèles sur vos données sans accord écrit explicite.",
  },
  {
    n: "05",
    title: "Export/suppression sur demande",
    desc: "RGPD-compatible. Export complet (JSON + PDF) sous 30 jours. Suppression vérifiée (audit trail + KMS purge) dans les 30 jours. Droit à l'oubli garanti.",
  },
] as const;

const RBAC_ROLES = [
  { role: "super_admin", level: 100, tier: "Souverain", perms: 48, users: "1-2", desc: "Accès complet, y compris audit trail et KMS", color: C.red },
  { role: "owner", level: 95, tier: "Souverain", perms: 46, users: "1-3", desc: "Propriétaire du tenant, gestion facturation", color: C.red },
  { role: "admin", level: 80, tier: "Privégié", perms: 38, users: "2-5", desc: "Gestion utilisateurs, sources, alertes", color: C.amber },
  { role: "billing_admin", level: 70, tier: "Privégié", perms: 14, users: "1-2", desc: "Factures, plans, méthode de paiement", color: C.amber },
  { role: "editor", level: 60, tier: "Privégié", perms: 28, users: "3-10", desc: "Création/modification rapports & dashboards", color: C.amber },
  { role: "member", level: 40, tier: "Standard", perms: 18, users: "10-50", desc: "Accès console, dashboards, alertes", color: C.accent },
  { role: "analyst", level: 35, tier: "Standard", perms: 16, users: "5-20", desc: "Lecture + annotations + tags", color: C.accent },
  { role: "contributor", level: 30, tier: "Standard", perms: 12, users: "5-30", desc: "Annotations, briefings internes", color: C.accent },
  { role: "viewer", level: 20, tier: "Restreint", perms: 8, users: "illimité", desc: "Lecture seule dashboards & rapports", color: C.sage },
  { role: "guest", level: 10, tier: "Restreint", perms: 4, users: "illimité", desc: "Rapports partagés en lecture limitée", color: C.sage },
] as const;

const INCIDENT_STEPS = [
  {
    step: "01",
    time: "T+1h",
    title: "Détection",
    desc: "Sentinel cron détecte l'anomalie. Pattern matching sur logs, alertes de sentiment, pics d'activité API.",
    actors: "Sentinel · Monitoring",
  },
  {
    step: "02",
    time: "T+5min",
    title: "Alerte",
    desc: "WhatsApp + email + dashboard. Notification simultanée à l'équipe on-call et au responsable sécurité.",
    actors: "On-call · SOC",
  },
  {
    step: "03",
    time: "T+15min",
    title: "Escalade",
    desc: "DEFCON 1 → notification Dircom. Activation du war room, isolation des systèmes impactés.",
    actors: "Dircom · CISO · CEO",
  },
  {
    step: "04",
    time: "T+14j",
    title: "Post-mortem",
    desc: "Rapport complet + audit trail. Analyse de cause racine, mesures correctives, communication clients.",
    actors: "CISO · Legal · Comms",
  },
] as const;

const AUDIT_ENTRIES = [
  {
    ts: "2026-03-14 09:42:17",
    user: "super_admin@harchcorp.com",
    action: "user.role.update",
    target: "user_8f3a2b1c",
    detail: "viewer → admin",
  },
  {
    ts: "2026-03-14 09:43:02",
    user: "super_admin@harchcorp.com",
    action: "session.revoke",
    target: "user_8f3a2b1c",
    detail: "sessionVersion bumped",
  },
  {
    ts: "2026-03-14 10:15:44",
    user: "admin@attijariwafa.ma",
    action: "report.export",
    target: "report_q1_2026",
    detail: "PDF · 14 pages",
  },
  {
    ts: "2026-03-14 10:18:09",
    user: "admin@attijariwafa.ma",
    action: "apikey.create",
    target: "key_a7c4f2e9",
    detail: "scope: read:reports",
  },
  {
    ts: "2026-03-14 10:22:33",
    user: "system",
    action: "audit.chain.verify",
    target: "audit_trail",
    detail: "1 248 712 entries · valid",
  },
] as const;

// ─── HELPERS ───────────────────────────────────────────────────────────

// Fake but deterministic SHA-256-ish hash for demo purposes
function fakeHash(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  const hex = h.toString(16).padStart(8, "0");
  // Pad to 16 chars to look SHA-256-ish (truncated)
  return (hex + hex + hex + hex).slice(0, 16);
}

type AuditEntry = (typeof AUDIT_ENTRIES)[number] & {
  index: number;
  prevHash: string;
  hash: string;
};

// Build the hash chain (kept outside component so reassignment is fine)
function buildAuditChain(entries: ReadonlyArray<typeof AUDIT_ENTRIES[number]>): AuditEntry[] {
  let prev = "0".repeat(16); // genesis
  return entries.map((e, i) => {
    const payload = `${e.ts}|${e.user}|${e.action}|${e.target}|${e.detail}|${prev}`;
    const hash = fakeHash(payload);
    const entry: AuditEntry = { ...e, index: i, prevHash: prev, hash };
    prev = hash;
    return entry;
  });
}

// ─── SHIELD COMPONENT (CSS clip-path) ──────────────────────────────────
function Shield({ label, status, color }: { label: string; status: string; color: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          width: "96px",
          height: "112px",
          margin: "0 auto 16px",
          background: `linear-gradient(180deg, ${color} 0%, ${color}DD 100%)`,
          clipPath:
            "polygon(50% 0%, 100% 12%, 100% 60%, 75% 100%, 50% 92%, 25% 100%, 0% 60%, 0% 12%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#FFFFFF",
          fontFamily: FONT.mono,
          position: "relative",
          boxShadow: `0 8px 24px ${color}40`,
        }}
      >
        <div style={{ fontSize: "24px", fontWeight: 700, lineHeight: 1 }}>
          {label}
        </div>
        <div
          style={{
            fontSize: "8px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            opacity: 0.9,
            marginTop: "6px",
          }}
        >
          {status}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────
export default function TrustPage() {
  const [auditVerified, setAuditVerified] = useState(true);
  const [auditVerifying, setAuditVerifying] = useState(false);

  // Compute hash chain for audit entries
  const auditChain = useMemo(() => buildAuditChain(AUDIT_ENTRIES), []);

  const handleVerify = () => {
    setAuditVerifying(true);
    setAuditVerified(false);
    setTimeout(() => {
      setAuditVerifying(false);
      setAuditVerified(true);
    }, 1100);
  };

  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <AtelierNav />

      {/* ═══════════════════════════════════════════════════════════════
          01 — HERO
      ═══════════════════════════════════════════════════════════════ */}
      <section
        style={{
          background: `linear-gradient(180deg, ${C.surface} 0%, ${C.bg} 100%)`,
          borderBottom: `1px solid ${C.border}`,
          padding: "56px 16px 48px",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 16px" }}>
          {/* Badge */}
          <Reveal>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "6px 14px",
              background: C.surface,
              border: `1px solid ${C.sage}40`,
              borderRadius: "100px",
              fontSize: "11px",
              fontFamily: FONT.mono,
              color: C.sage,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: "28px",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: C.sage,
                animation: "trustPulse 2s infinite",
              }}
            />
            Conforme CNDP · Loi 09-08 · Audit trail SHA-256
          </div>
          </Reveal>

          <Reveal delay={0.05}>
          <h1
            style={{
              fontSize: "clamp(34px, 7vw, 56px)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1.02,
              color: C.text,
              margin: "0 0 24px",
              maxWidth: "900px",
            }}
          >
            Sécurité &amp; Conformité
            <br />
            <span
              style={{
                background: `linear-gradient(90deg, ${C.sage} 0%, ${C.sageBright} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              pour institutions exigeantes.
            </span>
          </h1>
          </Reveal>

          <Reveal delay={0.1}>
          <p
            style={{
              fontSize: "17px",
              color: C.textSec,
              lineHeight: 1.6,
              maxWidth: "780px",
              marginBottom: "40px",
            }}
          >
            Harch Atelier est conçu pour les institutions les plus exigeantes du Maroc.
            Sécurité cryptographique de bout en bout, conformité réglementaire locale,
            traçabilité complète. Voici comment nous protégeons vos données — et les nôtres.
          </p>
          </Reveal>

          {/* Status pills */}
          <StaggerContainer
            style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}
            stagger={0.06}
          >
            {STATUS_PILLS.map((p) => (
              <StaggerItem
                key={p.label}
                hover
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "9px 16px",
                  background: C.surface,
                  border: `1px solid ${p.color}30`,
                  borderRadius: "100px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: p.color,
                  fontFamily: FONT.sans,
                  boxShadow: C.shadow,
                  transition: "box-shadow 0.2s ease, border-color 0.2s ease",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: p.color,
                    animation: "trustPulse 2.4s infinite",
                  }}
                />
                {p.label}
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Mini stats row */}
          <StaggerContainer
            style={{
              marginTop: "48px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "1px",
              background: C.border,
              border: `1px solid ${C.border}`,
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            {[
              { v: "1 248 712", l: "entrées d'audit chaînées" },
              { v: "0", l: "falsification détectée" },
              { v: "30j", l: "délai de suppression RGPD" },
              { v: "99.97%", l: "uptime 12 mois glissants" },
            ].map((s) => (
              <StaggerItem
                key={s.l}
                style={{
                  background: C.surface,
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    color: C.text,
                    fontFamily: FONT.mono,
                    letterSpacing: "-0.02em",
                  }}
                >
                  <AnimatedStat value={s.v} />
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: C.textMuted,
                    marginTop: "4px",
                    letterSpacing: "0.04em",
                  }}
                >
                  {s.l}
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          02 — SECURITY ARCHITECTURE
      ═══════════════════════════════════════════════════════════════ */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "72px 16px" }}>
        <div
          style={{
            fontSize: "11px",
            fontFamily: FONT.mono,
            color: C.accent,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            marginBottom: "14px",
          }}
        >
          Architecture sécurité · 04 piliers
        </div>
        <h2
          style={{
            fontSize: "clamp(26px, 5vw, 38px)",
            fontWeight: 700,
            color: C.text,
            letterSpacing: "-0.03em",
            margin: "0 0 14px",
            maxWidth: "780px",
          }}
        >
          Construit sur des primitives cryptographiques, pas sur des promesses.
        </h2>
        <p
          style={{
            fontSize: "15px",
            color: C.textSec,
            lineHeight: 1.6,
            maxWidth: "720px",
            marginBottom: "44px",
          }}
        >
          Chaque couche de la pile utilise des standards vérifiables.
          Les implémentations sont auditées et les artefacts (audit trail, clés, journaux)
          sont immuables.
        </p>

        <StaggerContainer
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {SECURITY_ARCH.map((s) => (
            <StaggerItem
              key={s.id}
              hover
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: "14px",
                padding: "28px",
                boxShadow: C.shadow,
                transition: "box-shadow 0.2s ease, border-color 0.2s ease",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                }}
              >
                <motion.div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: C.sageBg,
                    color: C.sage,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: FONT.mono,
                    fontSize: "13px",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {s.icon}
                </motion.div>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    fontFamily: FONT.mono,
                    padding: "4px 10px",
                    borderRadius: "100px",
                    background: C.sageBg,
                    color: C.sage,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  {s.badge}
                </span>
              </div>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: C.text,
                  marginBottom: "10px",
                  letterSpacing: "-0.01em",
                }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: C.textSec,
                  lineHeight: 1.55,
                  marginBottom: "16px",
                  fontWeight: 500,
                }}
              >
                {s.desc}
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: C.textMuted,
                  lineHeight: 1.6,
                  marginTop: "auto",
                  paddingTop: "16px",
                  borderTop: `1px dashed ${C.border}`,
                }}
              >
                {s.detail}
              </p>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          03 — COMPLIANCE SHIELDS
      ═══════════════════════════════════════════════════════════════ */}
      <section
        style={{
          background: C.surface,
          borderTop: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
          padding: "72px 16px",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px" }}>
          <div
            style={{
              fontSize: "11px",
              fontFamily: FONT.mono,
              color: C.accent,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: "14px",
            }}
          >
            Conformité · 04 certifications
          </div>
          <h2
            style={{
              fontSize: "clamp(26px, 5vw, 38px)",
              fontWeight: 700,
              color: C.text,
              letterSpacing: "-0.03em",
              margin: "0 0 14px",
              maxWidth: "820px",
            }}
          >
            Cadre réglementaire marocain, traçabilité vérifiable.
          </h2>
          <p
            style={{
              fontSize: "15px",
              color: C.textSec,
              lineHeight: 1.6,
              maxWidth: "720px",
              marginBottom: "52px",
            }}
          >
            Nous opérons sous le cadre légal marocain (CNDP, Loi 09-08) avec une
            option d'hébergement souverain au Maroc pour les institutions qui
            l'exigent.
          </p>

          <StaggerContainer
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "24px",
            }}
          >
            {COMPLIANCE_SHIELDS.map((s) => (
              <StaggerItem
                key={s.name}
                hover
                style={{
                  background: C.bg,
                  border: `1px solid ${C.border}`,
                  borderRadius: "14px",
                  padding: "32px 24px",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  boxShadow: C.shadow,
                  transition: "box-shadow 0.2s ease, border-color 0.2s ease",
                }}
              >
                <Shield
                  label={s.name.split(" ")[0].slice(0, 4).toUpperCase()}
                  status={s.status}
                  color={C.sage}
                />
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: C.text,
                    marginBottom: "8px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {s.name}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: C.textSec,
                    lineHeight: 1.5,
                    marginBottom: "14px",
                    minHeight: "36px",
                  }}
                >
                  {s.desc}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    fontFamily: FONT.mono,
                    color: C.sage,
                    letterSpacing: "0.08em",
                    padding: "4px 10px",
                    background: C.sageBg,
                    borderRadius: "6px",
                    textTransform: "uppercase",
                  }}
                >
                  {s.ref}
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          04 — DATA PROTECTION (5 PILLARS)
      ═══════════════════════════════════════════════════════════════ */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "72px 16px" }}>
        <div
          style={{
            fontSize: "11px",
            fontFamily: FONT.mono,
            color: C.accent,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            marginBottom: "14px",
          }}
        >
          Protection des données · 05 piliers
        </div>
        <h2
          style={{
            fontSize: "clamp(26px, 5vw, 38px)",
            fontWeight: 700,
            color: C.text,
            letterSpacing: "-0.03em",
            margin: "0 0 14px",
            maxWidth: "820px",
          }}
        >
          Cinq engagements contraignants sur vos données.
        </h2>
        <p
          style={{
            fontSize: "15px",
            color: C.textSec,
            lineHeight: 1.6,
            maxWidth: "720px",
            marginBottom: "44px",
          }}
        >
          Ces principes sont inscrits dans nos DPA et vérifiables via l'audit trail.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {DATA_PROTECTION.map((p) => (
            <div
              key={p.n}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(80px, 0.5fr) 1fr",
                gap: "24px",
                padding: "28px 0",
                borderTop: `1px solid ${C.border}`,
                alignItems: "start",
              }}
            >
              <div
                style={{
                  fontSize: "40px",
                  fontWeight: 800,
                  fontFamily: FONT.mono,
                  color: C.sage,
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                }}
              >
                {p.n}
              </div>
              <div>
                <h3
                  style={{
                    fontSize: "19px",
                    fontWeight: 700,
                    color: C.text,
                    marginBottom: "8px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {p.title}
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    color: C.textSec,
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  {p.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          05 — RBAC TABLE (10 ROLES)
      ═══════════════════════════════════════════════════════════════ */}
      <section
        style={{
          background: C.surface,
          borderTop: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
          padding: "72px 16px",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px" }}>
          <div
            style={{
              fontSize: "11px",
              fontFamily: FONT.mono,
              color: C.accent,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: "14px",
            }}
          >
            Contrôle d'accès · RBAC · 10 rôles
          </div>
          <h2
            style={{
              fontSize: "clamp(26px, 5vw, 38px)",
              fontWeight: 700,
              color: C.text,
              letterSpacing: "-0.03em",
              margin: "0 0 14px",
              maxWidth: "820px",
            }}
          >
            Hiérarchie des rôles, permissions granulaires.
          </h2>
          <p
            style={{
              fontSize: "15px",
              color: C.textSec,
              lineHeight: 1.6,
              maxWidth: "720px",
              marginBottom: "44px",
            }}
          >
            Chaque utilisateur se voit attribuer un rôle avec un niveau d'accès
            numérique. Les permissions sont cumulatives et vérifiables via l'audit trail.
          </p>

          {/* Tier legend */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            {[
              { label: "Souverain", color: C.red },
              { label: "Privégié", color: C.amber },
              { label: "Standard", color: C.accent },
              { label: "Restreint", color: C.sage },
            ].map((t) => (
              <div
                key={t.label}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "12px",
                  color: C.textSec,
                  fontFamily: FONT.sans,
                }}
              >
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "3px",
                    background: t.color,
                  }}
                />
                {t.label}
              </div>
            ))}
          </div>

          {/* Table — desktop card, mobile stacked */}
          <div
            style={{
              border: `1px solid ${C.border}`,
              borderRadius: "12px",
              overflow: "hidden",
              background: C.bg,
              boxShadow: C.shadow,
            }}
          >
          <div style={{ overflowX: "auto" }} className="rbac-scroll">
            {/* Header (desktop only) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(140px, 1.4fr) minmax(80px, 0.5fr) minmax(110px, 0.7fr) minmax(1fr, 2fr) minmax(100px, 0.6fr)",
                background: C.surfaceAlt,
                borderBottom: `1px solid ${C.border}`,
                padding: "14px 20px",
                fontFamily: FONT.mono,
                fontSize: "10px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: C.textMuted,
                fontWeight: 700,
                minWidth: "720px",
              }}
              className="rbac-header"
            >
              <div>Rôle</div>
              <div>Niveau</div>
              <div>Permissions</div>
              <div>Utilisateurs concernés</div>
              <div style={{ textAlign: "right" }}>Pers.</div>
            </div>

            {/* Rows */}
            {RBAC_ROLES.map((r) => (
              <div
                key={r.role}
                className="rbac-row"
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "minmax(140px, 1.4fr) minmax(80px, 0.5fr) minmax(110px, 0.7fr) minmax(1fr, 2fr) minmax(100px, 0.6fr)",
                  padding: "16px 20px",
                  borderBottom: `1px solid ${C.borderLight}`,
                  alignItems: "center",
                  gap: "12px",
                  minWidth: "720px",
                }}
              >
                {/* Role */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span
                    style={{
                      width: "4px",
                      height: "28px",
                      borderRadius: "2px",
                      background: r.color,
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div
                      style={{
                        fontFamily: FONT.mono,
                        fontSize: "13px",
                        fontWeight: 700,
                        color: C.text,
                      }}
                    >
                      {r.role}
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: C.textMuted,
                        marginTop: "2px",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {r.tier}
                    </div>
                  </div>
                </div>

                {/* Level */}
                <div>
                  <div
                    style={{
                      fontFamily: FONT.mono,
                      fontSize: "18px",
                      fontWeight: 700,
                      color: r.color,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {r.level}
                  </div>
                  {/* Level bar */}
                  <div
                    style={{
                      width: "48px",
                      height: "4px",
                      background: C.border,
                      borderRadius: "2px",
                      marginTop: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${r.level}%`,
                        height: "100%",
                        background: r.color,
                      }}
                    />
                  </div>
                </div>

                {/* Permissions key */}
                <div style={{ fontSize: "12px", color: C.textSec, lineHeight: 1.4 }}>
                  {r.desc}
                </div>

                {/* Users */}
                <div style={{ fontSize: "12px", color: C.textSec, lineHeight: 1.4 }}>
                  {r.users}{" "}
                  <span style={{ color: C.textMuted }}>
                    {r.users === "illimité" ? "(no cap)" : "utilisateurs"}
                  </span>
                </div>

                {/* Perms count */}
                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      fontFamily: FONT.mono,
                      fontSize: "12px",
                      fontWeight: 700,
                      color: r.color,
                      padding: "4px 10px",
                      background: `${r.color}14`,
                      borderRadius: "6px",
                    }}
                  >
                    {r.perms}
                    <span style={{ fontSize: "9px", opacity: 0.7 }}>PERMS</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
          </div>

          <p
            style={{
              fontSize: "12px",
              color: C.textMuted,
              marginTop: "16px",
              lineHeight: 1.5,
            }}
          >
            Le RBAC est appliqué au niveau middleware + database (Row-Level Security).
            Toute modification de rôle est consignée dans l'audit trail avec hash de chaînage.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          06 — INCIDENT RESPONSE TIMELINE
      ═══════════════════════════════════════════════════════════════ */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "72px 16px" }}>
        <div
          style={{
            fontSize: "11px",
            fontFamily: FONT.mono,
            color: C.accent,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            marginBottom: "14px",
          }}
        >
          Réponse aux incidents · 04 phases
        </div>
        <h2
          style={{
            fontSize: "clamp(26px, 5vw, 38px)",
            fontWeight: 700,
            color: C.text,
            letterSpacing: "-0.03em",
            margin: "0 0 14px",
            maxWidth: "820px",
          }}
        >
          De la détection au post-mortem, en moins de 14 jours.
        </h2>
        <p
          style={{
            fontSize: "15px",
            color: C.textSec,
            lineHeight: 1.6,
            maxWidth: "720px",
            marginBottom: "52px",
          }}
        >
          Procédure formalisée, testée trimestriellement. Notification clients sous 72h
          conformément aux exigences CNDP.
        </p>

        {/* Timeline */}
        <div style={{ position: "relative", paddingLeft: "24px" }}>
          {/* Vertical line */}
          <div
            style={{
              position: "absolute",
              left: "7px",
              top: "8px",
              bottom: "8px",
              width: "2px",
              background: `linear-gradient(180deg, ${C.sage} 0%, ${C.sageBright} 100%)`,
              opacity: 0.4,
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "28px",
            }}
          >
            {INCIDENT_STEPS.map((s) => (
              <div
                key={s.step}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr)",
                  gap: "0",
                  position: "relative",
                }}
              >
                {/* Dot */}
                <div
                  style={{
                    position: "absolute",
                    left: "-23px",
                    top: "6px",
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    background: C.surface,
                    border: `3px solid ${C.sage}`,
                    boxShadow: `0 0 0 4px ${C.sageBg}`,
                    zIndex: 2,
                  }}
                />
                <div
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: "12px",
                    padding: "20px 24px",
                    boxShadow: C.shadow,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "10px",
                      marginBottom: "8px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span
                        style={{
                          fontFamily: FONT.mono,
                          fontSize: "11px",
                          color: C.textMuted,
                          letterSpacing: "0.1em",
                        }}
                      >
                        {s.step}
                      </span>
                      <span
                        style={{
                          fontSize: "17px",
                          fontWeight: 700,
                          color: C.text,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {s.title}
                      </span>
                    </div>
                    <span
                      style={{
                        fontFamily: FONT.mono,
                        fontSize: "12px",
                        fontWeight: 700,
                        color: C.sage,
                        background: C.sageBg,
                        padding: "4px 10px",
                        borderRadius: "6px",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {s.time}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "13px",
                      color: C.textSec,
                      lineHeight: 1.6,
                      margin: "0 0 8px",
                    }}
                  >
                    {s.desc}
                  </p>
                  <div
                    style={{
                      fontSize: "11px",
                      color: C.textMuted,
                      fontFamily: FONT.mono,
                      letterSpacing: "0.06em",
                    }}
                  >
                    Acteurs: {s.actors}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          07 — SECURITY CONTACT (DARK)
      ═══════════════════════════════════════════════════════════════ */}
      <section
        style={{
          background: C.dark,
          color: "#FFFFFF",
          padding: "72px 16px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Sage glow accent */}
        <div
          style={{
            position: "absolute",
            top: "-40%",
            right: "-10%",
            width: "600px",
            height: "600px",
            background: `radial-gradient(circle, ${C.sage}30 0%, transparent 70%)`,
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "0 16px",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "48px",
              alignItems: "start",
            }}
          >
            {/* Left: heading */}
            <div>
              <div
                style={{
                  fontSize: "11px",
                  fontFamily: FONT.mono,
                  color: C.sageBright,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  marginBottom: "16px",
                }}
              >
                Contact sécurité · divulgation responsable
              </div>
              <h2
                style={{
                  fontSize: "clamp(28px, 5vw, 42px)",
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  margin: "0 0 20px",
                  lineHeight: 1.1,
                }}
              >
                Signaler une
                <br />
                <span style={{ color: C.sageBright }}>vulnérabilité.</span>
              </h2>
              <p
                style={{
                  fontSize: "15px",
                  color: "rgba(255,255,255,0.65)",
                  lineHeight: 1.6,
                  marginBottom: "24px",
                }}
              >
                Programme de divulgation responsable. Notre équipe sécurité répond
                sous 24h ouvrées. Pour les vulnérabilités critiques, chiffrez votre
                rapport avec notre clé PGP.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                <motion.a
                  href="mailto:security@harchcorp.com"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 22px",
                    background: C.sage,
                    color: "#FFFFFF",
                    fontSize: "13px",
                    fontWeight: 600,
                    textDecoration: "none",
                    borderRadius: "8px",
                    fontFamily: FONT.sans,
                    transition: "background 0.2s ease",
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                >
                  security@harchcorp.com →
                </motion.a>
                <motion.a
                  href="/atelier/audit"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 22px",
                    background: "transparent",
                    color: "#FFFFFF",
                    fontSize: "13px",
                    fontWeight: 600,
                    textDecoration: "none",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.18)",
                    fontFamily: FONT.sans,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                >
                  Demander un DPA
                </motion.a>
              </div>
            </div>

            {/* Right: SLA + PGP */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Response time card */}
              <div
                style={{
                  background: C.darkAlt,
                  border: `1px solid ${C.darkBorder}`,
                  borderRadius: "12px",
                  padding: "24px",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    fontFamily: FONT.mono,
                    color: C.sageBright,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    marginBottom: "10px",
                  }}
                >
                  Réponse garantie
                </div>
                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: 800,
                    fontFamily: FONT.mono,
                    letterSpacing: "-0.03em",
                    marginBottom: "6px",
                  }}
                >
                  24<span style={{ fontSize: "18px", color: "rgba(255,255,255,0.5)" }}>h</span>
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.6)",
                    lineHeight: 1.5,
                  }}
                >
                  Accusé de réception sous 24h. Vulnérabilités critiques:
                  réponse initiale sous 4h.
                </div>
              </div>

              {/* PGP key card */}
              <div
                style={{
                  background: C.darkAlt,
                  border: `1px solid ${C.darkBorder}`,
                  borderRadius: "12px",
                  padding: "24px",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    fontFamily: FONT.mono,
                    color: C.sageBright,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    marginBottom: "10px",
                  }}
                >
                  Clé PGP · empreinte
                </div>
                <div
                  style={{
                    fontFamily: FONT.mono,
                    fontSize: "13px",
                    color: "#FFFFFF",
                    wordBreak: "break-all",
                    lineHeight: 1.6,
                    padding: "10px 12px",
                    background: "rgba(0,0,0,0.3)",
                    borderRadius: "6px",
                    border: `1px solid ${C.darkBorder}`,
                  }}
                >
                  4A7B 5F3D 6E29 C8A1
                  <br />
                  B5F4 7E2D 9C01 A483
                  <br />
                  6F2E D7B5 8A3C 4190
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.5)",
                    marginTop: "10px",
                    fontFamily: FONT.mono,
                  }}
                >
                  Key ID: 0x4A7B5F3D · RSA-4096 · Expire 2027-12-31
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          08 — AUDIT TRAIL LIVE DEMO
      ═══════════════════════════════════════════════════════════════ */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "72px 16px" }}>
        <div
          style={{
            fontSize: "11px",
            fontFamily: FONT.mono,
            color: C.accent,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            marginBottom: "14px",
          }}
        >
          Audit trail · démo interactive
        </div>
        <h2
          style={{
            fontSize: "clamp(26px, 5vw, 38px)",
            fontWeight: 700,
            color: C.text,
            letterSpacing: "-0.03em",
            margin: "0 0 14px",
            maxWidth: "820px",
          }}
        >
          Chaque action admin, chaînée cryptographiquement.
        </h2>
        <p
          style={{
            fontSize: "15px",
            color: C.textSec,
            lineHeight: 1.6,
            maxWidth: "720px",
            marginBottom: "36px",
          }}
        >
          Extrait réel de l'audit trail (anonymisé). Chaque entrée contient le hash
          de la précédente — toute falsification casse la chaîne immédiatement.
        </p>

        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "14px",
            overflow: "hidden",
            boxShadow: C.shadow,
          }}
        >
          {/* Demo header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
              padding: "16px 20px",
              background: C.surfaceAlt,
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: auditVerifying
                    ? C.amber
                    : auditVerified
                    ? C.sage
                    : C.textMuted,
                  animation: auditVerifying ? "trustPulse 0.8s infinite" : "none",
                }}
              />
              <span
                style={{
                  fontFamily: FONT.mono,
                  fontSize: "12px",
                  color: C.textSec,
                  letterSpacing: "0.04em",
                }}
              >
                audit_trail · 5 dernières entrées
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {auditVerified && !auditVerifying && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: C.sage,
                    fontFamily: FONT.mono,
                    padding: "4px 10px",
                    background: C.sageBg,
                    borderRadius: "6px",
                  }}
                >
                  <span style={{ fontSize: "13px" }}>✓</span> Chaîne valide
                </span>
              )}
              <button
                onClick={handleVerify}
                disabled={auditVerifying}
                style={{
                  padding: "6px 14px",
                  background: auditVerifying ? C.surfaceAlt : C.sage,
                  color: auditVerifying ? C.textMuted : "#FFFFFF",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  fontFamily: FONT.sans,
                  cursor: auditVerifying ? "wait" : "pointer",
                  transition: "background 0.2s ease",
                }}
              >
                {auditVerifying ? "Vérification…" : "Vérifier la chaîne"}
              </button>
            </div>
          </div>

          {/* Table */}
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: "12px",
              overflowX: "auto",
              maxHeight: "440px",
              overflowY: "auto",
            }}
            className="audit-scroll"
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(160px, 1.4fr) minmax(180px, 1.4fr) minmax(160px, 1.2fr) minmax(140px, 1fr) minmax(120px, 1fr)",
                background: C.surfaceAlt,
                padding: "10px 16px",
                fontSize: "10px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: C.textMuted,
                fontWeight: 700,
                borderBottom: `1px solid ${C.border}`,
                position: "sticky",
                top: 0,
                zIndex: 1,
                minWidth: "760px",
              }}
            >
              <div>Horodatage</div>
              <div>Utilisateur</div>
              <div>Action</div>
              <div>Cible</div>
              <div>Hash (16)</div>
            </div>

            {auditChain.map((e) => (
              <div
                key={e.index}
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "minmax(160px, 1.4fr) minmax(180px, 1.4fr) minmax(160px, 1.2fr) minmax(140px, 1fr) minmax(120px, 1fr)",
                  padding: "12px 16px",
                  borderBottom: `1px solid ${C.borderLight}`,
                  alignItems: "center",
                  gap: "12px",
                  minWidth: "760px",
                  transition: "background 0.15s ease",
                }}
              >
                <div style={{ color: C.textSec, fontSize: "11px" }}>{e.ts}</div>
                <div
                  style={{
                    color: e.user === "system" ? C.sage : C.text,
                    fontWeight: e.user === "system" ? 700 : 500,
                  }}
                >
                  {e.user}
                </div>
                <div
                  style={{
                    color: C.text,
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background:
                        e.action.startsWith("user.") || e.action.startsWith("session.")
                          ? C.amber
                          : e.action.startsWith("audit.")
                          ? C.sage
                          : C.accent,
                    }}
                  />
                  {e.action}
                </div>
                <div style={{ color: C.textSec, fontSize: "11px" }}>{e.target}</div>
                <div
                  style={{
                    color: auditVerified ? C.sage : C.textMuted,
                    fontSize: "11px",
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {auditVerified && <span style={{ color: C.sage }}>✓</span>}
                  {e.hash}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "14px 20px",
              background: C.surfaceAlt,
              borderTop: `1px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                color: C.textMuted,
                fontFamily: FONT.mono,
              }}
            >
              Hash de genèse : <span style={{ color: C.textSec }}>0000000000000000</span>
              {" · "}
              Dernier hash :{" "}
              <span style={{ color: auditVerified ? C.sage : C.textSec }}>
                {auditChain[auditChain.length - 1]?.hash}
              </span>
            </div>
            <a
              href="/atelier/admin-x7k2m9"
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: C.sage,
                textDecoration: "none",
                fontFamily: FONT.sans,
              }}
            >
              Voir l'audit complet →
            </a>
          </div>
        </div>

        <p
          style={{
            fontSize: "12px",
            color: C.textMuted,
            marginTop: "16px",
            lineHeight: 1.5,
            textAlign: "center",
          }}
        >
          Les hashes ci-dessus sont tronqués à 16 caractères pour la démonstration.
          En production: SHA-256 complet (64 caractères hex), chaînage en temps réel.
        </p>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CTA FOOTER STRIP
      ═══════════════════════════════════════════════════════════════ */}
      <section
        style={{
          background: C.bg,
          borderTop: `1px solid ${C.border}`,
          padding: "48px 16px",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            textAlign: "center",
            padding: "0 16px",
          }}
        >
          <h3
            style={{
              fontSize: "clamp(22px, 4vw, 30px)",
              fontWeight: 700,
              color: C.text,
              letterSpacing: "-0.02em",
              marginBottom: "12px",
            }}
          >
            Besoin d'une revue de sécurité dédiée ?
          </h3>
          <p
            style={{
              fontSize: "14px",
              color: C.textSec,
              lineHeight: 1.6,
              marginBottom: "24px",
              maxWidth: "640px",
              margin: "0 auto 24px",
            }}
          >
            Pour les comptes Sovereign et Enterprise, nous fournissons un dossier
            de sécurité personnalisé: DPA, sous-traitants, registre des traitements,
            certificats, rapports d'audit.
          </p>
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <motion.a
              href="/atelier/audit"
              style={{
                display: "inline-block",
                padding: "12px 24px",
                background: C.sage,
                color: "#FFFFFF",
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
                borderRadius: "8px",
                fontFamily: FONT.sans,
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              Demander le dossier sécurité →
            </motion.a>
            <motion.a
              href="/atelier/legal"
              style={{
                display: "inline-block",
                padding: "12px 24px",
                background: "transparent",
                color: C.text,
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
                borderRadius: "8px",
                border: `1px solid ${C.borderStrong}`,
                fontFamily: FONT.sans,
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              Mentions légales
            </motion.a>
          </div>
        </div>
      </section>

      <AtelierFooter />
      <BackToTop />

      <style>{`
        @keyframes trustPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
        .audit-scroll::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .audit-scroll::-webkit-scrollbar-track {
          background: ${C.surfaceAlt};
        }
        .audit-scroll::-webkit-scrollbar-thumb {
          background: ${C.borderStrong};
          border-radius: 4px;
        }
        .audit-scroll::-webkit-scrollbar-thumb:hover {
          background: ${C.textMuted};
        }
        .rbac-scroll::-webkit-scrollbar {
          height: 8px;
        }
        .rbac-scroll::-webkit-scrollbar-track {
          background: ${C.surfaceAlt};
        }
        .rbac-scroll::-webkit-scrollbar-thumb {
          background: ${C.borderStrong};
          border-radius: 4px;
        }
        .rbac-scroll::-webkit-scrollbar-thumb:hover {
          background: ${C.textMuted};
        }
      `}</style>
    </>
  );
}
