"use client";

// ═══════════════════════════════════════════════════════════════════════
//  HARCH ATELIER — ONBOARDING WIZARD
//
//  The FIRST thing every new client sees after activating their account.
//  4 steps: Bienvenue → Votre entreprise → Vos sujets → C'est prêt!
//
//  Design system (per task spec, ONBOARDING-WIZARD):
//    • Backgrounds  → #FFFFFF / #FAFAFA
//    • Text         → #0A0A0A (charcoal) / #525252 (body) / #71737A (muted)
//    • Border       → 1px #F0F0F0
//    • Radius       → 12px
//    • Padding      → 20px
//    • Accent       → sage #4A7B5F (pulse on active progress dot)
//    • Fonts        → Space Mono headers (10px uppercase, 0.08em)
//                     Inter body (13px)
//    • Icons        → Lucide 16px — NO emojis
//    • Language     → French
//
//  Persistence:
//    • onboarding:company  → localStorage (Step 2 autosave)
//    • onboarding:topics   → localStorage (Step 3 autosave)
//    • POST /api/user/onboard → sets onboardingCompleted=true (Step 4)
//
//  Task: ONBOARDING-WIZARD
// ═══════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  X,
  CheckCircle2,
  Loader2,
  Activity,
  MessageSquare,
  FileText,
  Sparkles,
  Building2,
  Globe,
  Tag,
  ShieldCheck,
  Radar,
} from "lucide-react";
import { toast } from "sonner";

// ─── DESIGN TOKENS (task-spec DS) ────────────────────────────────────
const C = {
  white: "#FFFFFF",
  bg: "#FFFFFF",
  bgSubtle: "#FAFAFA",
  sage: "#4A7B5F",
  sageBright: "#6FA386",
  sageDark: "#3D6650",
  sageBg: "rgba(74,123,95,0.08)",
  sageBgSoft: "rgba(74,123,95,0.04)",
  charcoal: "#0A0A0A",
  text: "#0A0A0A",
  textBody: "#525252",
  textMuted: "#71737A",
  border: "#F0F0F0",
  borderStrong: "#E5E5E5",
  danger: "#A0524B",
} as const;

const FONT = {
  sans: "'Inter', system-ui, -apple-system, sans-serif",
  mono: "'Space Mono', monospace",
} as const;

const RADIUS = "12px";
const PAD = "20px";

// ─── STATIC DATA ─────────────────────────────────────────────────────
const SECTORS = [
  { value: "banking", label: "Banque" },
  { value: "telecom", label: "Télécom" },
  { value: "energy", label: "Énergie" },
  { value: "aviation", label: "Aviation" },
  { value: "fmcg", label: "Biens de consommation" },
  { value: "retail", label: "Distribution" },
  { value: "other", label: "Autre" },
];

// Suggested topics per sector — pre-curated by the analyst team.
// Click to add (skips if already present).
const SECTOR_SUGGESTIONS: Record<string, string[]> = {
  banking: [
    "frais bancaires", "inclusion financière", "gouvernance",
    "cybersécurité", "digitalisation", "ESG", "service client",
  ],
  telecom: [
    "qualité du réseau", "facturation", "service client", "5G",
    "couverture rurale", "ESG", "tarifs",
  ],
  energy: [
    "transition énergétique", "tarifs", "renouvelables",
    "sécurité d'approvisionnement", "ESG", "gouvernance",
  ],
  aviation: [
    "ponctualité", "sécurité", "service client", "bagages",
    "réseau de routes", "ESG", "flotte",
  ],
  fmcg: [
    "qualité produit", "prix", "boycott", "emballage",
    "innovation", "ESG", "distribution",
  ],
  retail: [
    "boycott", "prix", "expérience magasin", "service client",
    "livraison", "ESG", "assortiment",
  ],
  other: [
    "ESG", "crise", "service client", "qualité",
    "innovation", "gouvernance", "prix",
  ],
};

// Display labels for the 4 canonical account types.
const PLAN_LABELS: Record<string, string> = {
  essential: "Essentiel",
  pro: "Pro",
  enterprise: "Enterprise",
  agency: "Agency",
};

// Per-plan topic ceilings. Enterprise + Agency are unlimited (sentinel = 9999).
const PLAN_TOPIC_LIMITS: Record<string, number> = {
  essential: 20,
  pro: 50,
  enterprise: 9999,
  agency: 9999,
};

// "What you get" cards on Step 1 — kept in French, Lucide icons, no emojis.
const WHAT_YOU_GET = [
  { icon: Activity, label: "Score de réputation" },
  { icon: MessageSquare, label: "Alertes WhatsApp" },
  { icon: FileText, label: "Rapports PDF" },
  { icon: Sparkles, label: "HarchIQ AI" },
];

// ─── ANIMATION VARIANTS ──────────────────────────────────────────────
// Slide x 24→0 between steps. Direction-aware: forward = +24 enter / -24 exit.
const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 24 : -24, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -24 : 24, opacity: 0 }),
};
const stepTransition = { duration: 0.28, ease: "easeOut" as const };

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────

// Eyebrow — Space Mono micro-label above section titles.
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: FONT.mono,
        fontSize: "10px",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: C.sage,
        fontWeight: 500,
      }}
    >
      {children}
    </div>
  );
}

// StepHeader — mono step counter + headline + subhead.
function StepHeader({
  index,
  total,
  title,
  sub,
}: {
  index: number;
  total: number;
  title: string;
  sub?: string;
}) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <Eyebrow>
        Étape {index} / {total}
      </Eyebrow>
      <h2
        style={{
          fontFamily: FONT.sans,
          fontSize: "26px",
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
          fontWeight: 600,
          color: C.text,
          margin: "8px 0 8px",
        }}
      >
        {title}
      </h2>
      {sub && (
        <p
          style={{
            fontFamily: FONT.sans,
            fontSize: "13px",
            lineHeight: 1.55,
            color: C.textBody,
            margin: 0,
            maxWidth: "560px",
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

// Field label — mono micro-label above an input.
function FieldLabel({
  children,
  required = false,
  hint,
}: {
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        marginBottom: "6px",
      }}
    >
      <label
        style={{
          fontFamily: FONT.mono,
          fontSize: "10px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: C.textBody,
          fontWeight: 500,
        }}
      >
        {children}
        {required && <span style={{ color: C.sage, marginLeft: "4px" }}>*</span>}
      </label>
      {hint && (
        <span
          style={{
            fontFamily: FONT.sans,
            fontSize: "11px",
            color: C.textMuted,
          }}
        >
          {hint}
        </span>
      )}
    </div>
  );
}

// ProgressDots — 4 dots; active = sage pulse, completed = sage fill,
// upcoming = neutral outline.
function ProgressDots({
  step,
  total,
}: {
  step: number;
  total: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
      aria-label={`Étape ${step} sur ${total}`}
    >
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1;
        const isActive = n === step;
        const isDone = n < step;
        return (
          <div
            key={n}
            className={isActive ? "harch-onboard-dot-active" : undefined}
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: isActive || isDone ? C.sage : C.white,
              border: `1px solid ${isActive || isDone ? C.sage : C.borderStrong}`,
              transition: "all 0.2s ease-out",
            }}
          />
        );
      })}
    </div>
  );
}

// SageIllustration — CSS-only abstract radar composition for Step 1.
// Concentric sage rings + a sweeping conic-gradient beam + a core dot.
function SageIllustration() {
  return (
    <div
      aria-hidden
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "320px",
        aspectRatio: "1 / 1",
        margin: "0 auto",
      }}
    >
      {/* Concentric rings */}
      {[100, 75, 50, 25].map((sz) => (
        <div
          key={sz}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: `${sz}%`,
            height: `${sz}%`,
            borderRadius: "50%",
            border: `1px solid ${C.sageBg}`,
            opacity: 0.7,
          }}
        />
      ))}
      {/* Radar sweep — conic gradient rotating */}
      <div
        className="harch-onboard-radar-sweep"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          background: `conic-gradient(from 0deg, ${C.sage} 0deg, ${C.sageBg} 60deg, transparent 90deg, transparent 360deg)`,
          opacity: 0.35,
          maskImage: "radial-gradient(circle, black 50%, transparent 50%)",
          WebkitMaskImage: "radial-gradient(circle, black 50%, transparent 50%)",
        }}
      />
      {/* Core dot */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "12px",
          height: "12px",
          borderRadius: "50%",
          background: C.sage,
          boxShadow: `0 0 0 4px ${C.sageBg}`,
        }}
      />
      {/* Four blips on the outer ring — staggered */}
      {[
        { top: "20%", left: "60%", delay: "0s" },
        { top: "70%", left: "30%", delay: "0.6s" },
        { top: "40%", left: "85%", delay: "1.2s" },
        { top: "80%", left: "70%", delay: "1.8s" },
      ].map((blip, i) => (
        <div
          key={i}
          className="harch-onboard-blip"
          style={{
            position: "absolute",
            top: blip.top,
            left: blip.left,
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: C.sageBright,
            opacity: 0,
            animation: `harch-onboard-blip 2.4s ${blip.delay} ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

// SageConfetti — CSS-only sage celebration burst for the success state.
// 24 particles, sage palette, falling from top with rotation. Rendered
// once on mount; particles fade out at end. Pattern reused from AuditPage.
function SageConfetti() {
  const particles = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => {
        const seed = (i * 73) % 100;
        const left = (seed * 1.0 + (i * 13) % 7) % 100;
        const delay = (i % 6) * 0.08;
        const duration = 2.2 + (i % 5) * 0.3;
        const size = 6 + (i % 4) * 2;
        const palette = [C.sage, C.sageBright, C.sageDark];
        const color = palette[i % palette.length];
        return { left, delay, duration, size, color, i };
      }),
    [],
  );
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      {particles.map((p) => (
        <span
          key={p.i}
          style={{
            position: "absolute",
            top: "-20px",
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            borderRadius: "2px",
            opacity: 0,
            animation: `harch-onboard-confetti ${p.duration}s ${p.delay}s ease-out forwards`,
          }}
        />
      ))}
    </div>
  );
}

// ─── MAIN WIZARD ─────────────────────────────────────────────────────

export function OnboardingWizard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // ─── Step state (1-indexed) ────────────────────────────────────────
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // +1 forward, -1 back
  const TOTAL_STEPS = 4;

  // ─── Step 2 — company state ────────────────────────────────────────
  const [companyName, setCompanyName] = useState("");
  const [sector, setSector] = useState("");
  const [website, setWebsite] = useState("");
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [competitorInput, setCompetitorInput] = useState("");
  // Pre-fetched company id (if the admin provisioned one before login).
  const [existingCompanyId, setExistingCompanyId] = useState<string | null>(null);

  // ─── Step 3 — topics state ─────────────────────────────────────────
  const [topics, setTopics] = useState<string[]>([]);
  const [topicInput, setTopicInput] = useState("");

  // ─── Step 4 — completion state ─────────────────────────────────────
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const didPostRef = useRef(false);

  // ─── Derived session data ──────────────────────────────────────────
  const userName = session?.user?.name ?? "Client";
  const firstName = userName.split(" ")[0];
  const accountType = session?.user?.accountType ?? "essential";
  const planLabel = PLAN_LABELS[accountType] ?? PLAN_LABELS.essential;
  const topicLimit = PLAN_TOPIC_LIMITS[accountType] ?? 20;
  const topicLimitLabel =
    topicLimit >= 9999 ? "illimité" : `${topicLimit}`;

  // ─── Pre-fill from /api/user/onboard (if admin provisioned a company)
  // Best-effort: silently swallow errors — the wizard still works with
  // empty fields if the fetch fails.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/user/onboard", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as {
          user?: {
            company?: {
              id: string;
              name: string;
              sector?: string;
              website?: string;
            } | null;
          };
        };
        const company = json?.user?.company;
        if (cancelled) return;
        if (company?.id) {
          setExistingCompanyId(company.id);
          if (company.name) setCompanyName(company.name);
          if (company.sector) {
            // Normalise sector label → value (case-insensitive).
            const match = SECTORS.find(
              (s) =>
                s.value === company.sector?.toLowerCase() ||
                s.label.toLowerCase() === company.sector?.toLowerCase(),
            );
            if (match) setSector(match.value);
          }
          if (company.website) setWebsite(company.website);
        }
      } catch {
        /* swallow — non-critical pre-fill */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ─── Restore from localStorage on mount (resume in-progress onboarding)
  useEffect(() => {
    try {
      const savedCompany = localStorage.getItem("onboarding:company");
      if (savedCompany) {
        const parsed = JSON.parse(savedCompany) as {
          name?: string;
          sector?: string;
          website?: string;
          competitors?: string[];
        };
        if (parsed.name) setCompanyName(parsed.name);
        if (parsed.sector) setSector(parsed.sector);
        if (parsed.website) setWebsite(parsed.website);
        if (Array.isArray(parsed.competitors)) setCompetitors(parsed.competitors);
      }
      const savedTopics = localStorage.getItem("onboarding:topics");
      if (savedTopics) {
        const parsed = JSON.parse(savedTopics) as string[];
        if (Array.isArray(parsed)) setTopics(parsed);
      }
    } catch {
      /* swallow — corrupted localStorage is non-fatal */
    }
  }, []);

  // ─── Step 2 autosave to localStorage ───────────────────────────────
  useEffect(() => {
    if (step < 2) return;
    try {
      localStorage.setItem(
        "onboarding:company",
        JSON.stringify({
          name: companyName,
          sector,
          website,
          competitors,
        }),
      );
    } catch {
      /* swallow — quota / private mode */
    }
  }, [step, companyName, sector, website, competitors]);

  // ─── Step 3 autosave to localStorage ───────────────────────────────
  useEffect(() => {
    if (step < 3) return;
    try {
      localStorage.setItem("onboarding:topics", JSON.stringify(topics));
    } catch {
      /* swallow */
    }
  }, [step, topics]);

  // ─── Step navigation ───────────────────────────────────────────────
  const goNext = useCallback(() => {
    setDirection(1);
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  }, []);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(1, s - 1));
  }, []);

  const goToStep = useCallback(
    (n: number) => {
      setDirection(n > step ? 1 : -1);
      setStep(n);
    },
    [step],
  );

  // ─── Skip to step 4 with defaults ──────────────────────────────────
  const handleSkip = useCallback(() => {
    if (sector === "") setSector("other");
    setDirection(1);
    setStep(4);
  }, [sector]);

  // ─── Competitor add / remove (max 5) ───────────────────────────────
  const addCompetitor = useCallback(() => {
    const trimmed = competitorInput.trim();
    if (!trimmed) return;
    if (competitors.length >= 5) {
      toast.error("Maximum 5 concurrents.");
      return;
    }
    if (competitors.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("Ce concurrent est déjà dans la liste.");
      return;
    }
    setCompetitors((prev) => [...prev, trimmed]);
    setCompetitorInput("");
  }, [competitorInput, competitors.length]);

  const removeCompetitor = useCallback((idx: number) => {
    setCompetitors((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  // ─── Topic add / remove ────────────────────────────────────────────
  const addTopic = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;
      if (topics.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
        return; // silent dedupe for suggested-click adds
      }
      if (topics.length >= topicLimit) {
        toast.error(`Limite atteinte — ${topicLimitLabel} mots-clés maximum.`);
        return;
      }
      setTopics((prev) => [...prev, trimmed]);
    },
    [topics.length, topicLimit, topicLimitLabel],
  );

  const submitTopicInput = useCallback(() => {
    const trimmed = topicInput.trim();
    if (!trimmed) return;
    if (topics.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setTopicInput("");
      return;
    }
    if (topics.length >= topicLimit) {
      toast.error(`Limite atteinte — ${topicLimitLabel} mots-clés maximum.`);
      return;
    }
    setTopics((prev) => [...prev, trimmed]);
    setTopicInput("");
  }, [topicInput, topics, topicLimit, topicLimitLabel]);

  const removeTopic = useCallback((idx: number) => {
    setTopics((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  // ─── Step 2 validation gate ────────────────────────────────────────
  const step2Valid = companyName.trim().length > 0 && sector.length > 0;

  // ─── POST completion to /api/user/onboard ──────────────────────────
  // Fires once when the user reaches step 4. Builds the body from current
  // state; respects existingCompanyId (skip company creation if the admin
  // already provisioned one) and the skip=true shortcut.
  const persistOnboarding = useCallback(
    async (opts: { skip: boolean }) => {
      if (didPostRef.current) return;
      didPostRef.current = true;
      setPosting(true);
      setPostError(null);
      try {
        const body: Record<string, unknown> = {
          skip: opts.skip,
          topics,
          competitors,
        };
        if (opts.skip) {
          // skip mode — let the API attach a fallback company.
        } else if (existingCompanyId) {
          body.companyId = existingCompanyId;
        } else {
          body.newCompany = {
            name: companyName.trim(),
            sector,
            website: website.trim() || undefined,
          };
        }
        const res = await fetch("/api/user/onboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const j = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(j?.error ?? `Erreur ${res.status}`);
        }
        setPosted(true);
        // Clear onboarding localStorage — the source of truth is now DB.
        try {
          localStorage.removeItem("onboarding:company");
          localStorage.removeItem("onboarding:topics");
        } catch {
          /* swallow */
        }
      } catch (err) {
        setPostError(
          err instanceof Error ? err.message : "Échec de l'enregistrement.",
        );
        didPostRef.current = false; // allow retry
      } finally {
        setPosting(false);
      }
    },
    [competitors, existingCompanyId, sector, topics, companyName, website],
  );

  // Auto-fire the POST when step 4 mounts.
  useEffect(() => {
    if (step !== 4) return;
    if (didPostRef.current || posted) return;
    void persistOnboarding({ skip: false });
  }, [step, persistOnboarding, posted]);

  // ─── Final CTA → console ───────────────────────────────────────────
  const goToConsole = useCallback(() => {
    router.push("/atelier/console");
  }, [router]);

  // ─── Suggested topics for the current sector ───────────────────────
  const suggestions = useMemo(
    () => SECTOR_SUGGESTIONS[sector] ?? SECTOR_SUGGESTIONS.other,
    [sector],
  );

  // ─── Render gate: session loading ──────────────────────────────────
  if (status === "loading") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: C.bg,
        }}
      >
        <Loader2 size={20} style={{ color: C.sage, animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily: FONT.sans,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ─── Top bar: progress + skip ────────────────────────────── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: C.bg,
          borderBottom: `1px solid ${C.border}`,
          padding: "16px 20px",
        }}
      >
        <div
          style={{
            maxWidth: "720px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontFamily: FONT.mono,
                fontSize: "10px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: C.text,
                fontWeight: 500,
              }}
            >
              <Radar size={14} style={{ color: C.sage }} />
              Harch Atelier
            </div>
            <div
              style={{ width: "1px", height: "16px", background: C.border }}
              aria-hidden
            />
            <ProgressDots step={step} total={TOTAL_STEPS} />
          </div>
          {step < 4 && (
            <button
              type="button"
              onClick={handleSkip}
              style={{
                background: "transparent",
                border: "none",
                padding: "4px 0",
                cursor: "pointer",
                fontFamily: FONT.sans,
                fontSize: "13px",
                color: C.textMuted,
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              }}
            >
              Passer
            </button>
          )}
        </div>
      </header>

      {/* ─── Step content ────────────────────────────────────────── */}
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 20px 48px",
        }}
      >
        <div style={{ width: "100%", maxWidth: "720px" }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={stepTransition}
            >
              {/* ════════════════════════════════════════════════════
                  STEP 1 — Bienvenue
                  ════════════════════════════════════════════════════ */}
              {step === 1 && (
                <Card
                  style={{
                    borderRadius: RADIUS,
                    border: `1px solid ${C.border}`,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.03), 0 8px 24px rgba(0,0,0,0.03)",
                    padding: 0,
                  }}
                >
                  <CardContent style={{ padding: PAD }}>
                    <StepHeader
                      index={1}
                      total={TOTAL_STEPS}
                      title={`Bonjour ${firstName}, bienvenue chez Harch Atelier`}
                      sub="En 2 minutes, configurez votre espace de veille réputationnelle."
                    />

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr",
                        gap: "20px",
                        alignItems: "center",
                      }}
                      className="harch-onboard-welcome-grid"
                    >
                      <div>
                        {/* Plan badge */}
                        <div style={{ marginBottom: "20px" }}>
                          <Eyebrow>Votre formule</Eyebrow>
                          <div style={{ marginTop: "8px" }}>
                            <Badge
                              style={{
                                background: C.sageBg,
                                color: C.sageDark,
                                border: `1px solid ${C.sage}`,
                                fontFamily: FONT.mono,
                                fontSize: "11px",
                                letterSpacing: "0.06em",
                                textTransform: "uppercase",
                                padding: "6px 12px",
                                borderRadius: "6px",
                              }}
                            >
                              <ShieldCheck size={14} style={{ marginRight: "6px" }} />
                              {planLabel}
                            </Badge>
                          </div>
                        </div>

                        {/* What you get */}
                        <div>
                          <Eyebrow>Ce que vous obtenez</Eyebrow>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: "10px",
                              marginTop: "12px",
                            }}
                            className="harch-onboard-features"
                          >
                            {WHAT_YOU_GET.map((item) => {
                              const Icon = item.icon;
                              return (
                                <div
                                  key={item.label}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    padding: "12px",
                                    borderRadius: RADIUS,
                                    border: `1px solid ${C.border}`,
                                    background: C.bgSubtle,
                                  }}
                                >
                                  <Icon size={16} style={{ color: C.sage, flexShrink: 0 }} />
                                  <span
                                    style={{
                                      fontSize: "13px",
                                      color: C.text,
                                      fontWeight: 500,
                                    }}
                                  >
                                    {item.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <SageIllustration />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ════════════════════════════════════════════════════
                  STEP 2 — Votre entreprise
                  ════════════════════════════════════════════════════ */}
              {step === 2 && (
                <Card
                  style={{
                    borderRadius: RADIUS,
                    border: `1px solid ${C.border}`,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.03), 0 8px 24px rgba(0,0,0,0.03)",
                    padding: 0,
                  }}
                >
                  <CardContent style={{ padding: PAD }}>
                    <StepHeader
                      index={2}
                      total={TOTAL_STEPS}
                      title="Votre entreprise"
                      sub="Renseignez l'identité de votre organisation pour calibrer la veille."
                    />

                    {/* Company name */}
                    <div style={{ marginBottom: "18px" }}>
                      <FieldLabel required hint={existingCompanyId ? "Pré-rempli par votre admin" : undefined}>
                        Nom de l'entreprise
                      </FieldLabel>
                      <div style={{ position: "relative" }}>
                        <Building2
                          size={16}
                          style={{
                            position: "absolute",
                            left: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: C.textMuted,
                            pointerEvents: "none",
                          }}
                        />
                        <Input
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Ex. Attijariwafa Bank"
                          style={{
                            paddingLeft: "36px",
                            height: "40px",
                            borderRadius: "8px",
                            borderColor: C.borderStrong,
                            fontFamily: FONT.sans,
                            fontSize: "13px",
                          }}
                        />
                      </div>
                    </div>

                    {/* Sector */}
                    <div style={{ marginBottom: "18px" }}>
                      <FieldLabel required>Secteur d'activité</FieldLabel>
                      <Select value={sector} onValueChange={setSector}>
                        <SelectTrigger
                          style={{
                            width: "100%",
                            height: "40px",
                            borderRadius: "8px",
                            borderColor: C.borderStrong,
                            fontFamily: FONT.sans,
                            fontSize: "13px",
                            background: C.white,
                          }}
                        >
                          <SelectValue placeholder="Sélectionnez un secteur" />
                        </SelectTrigger>
                        <SelectContent>
                          {SECTORS.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Website */}
                    <div style={{ marginBottom: "18px" }}>
                      <FieldLabel hint="optionnel">Site web</FieldLabel>
                      <div style={{ position: "relative" }}>
                        <Globe
                          size={16}
                          style={{
                            position: "absolute",
                            left: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: C.textMuted,
                            pointerEvents: "none",
                          }}
                        />
                        <Input
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="https://votre-entreprise.ma"
                          style={{
                            paddingLeft: "36px",
                            height: "40px",
                            borderRadius: "8px",
                            borderColor: C.borderStrong,
                            fontFamily: FONT.sans,
                            fontSize: "13px",
                          }}
                        />
                      </div>
                    </div>

                    {/* Competitors */}
                    <div>
                      <FieldLabel hint={`${competitors.length}/5`}>
                        Concurrents principaux
                      </FieldLabel>
                      <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                        <div style={{ position: "relative", flex: 1 }}>
                          <Input
                            value={competitorInput}
                            onChange={(e) => setCompetitorInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addCompetitor();
                              }
                            }}
                            placeholder="Ajouter un concurrent"
                            disabled={competitors.length >= 5}
                            style={{
                              paddingLeft: "12px",
                              height: "40px",
                              borderRadius: "8px",
                              borderColor: C.borderStrong,
                              fontFamily: FONT.sans,
                              fontSize: "13px",
                            }}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addCompetitor}
                          disabled={
                            !competitorInput.trim() || competitors.length >= 5
                          }
                          style={{
                            height: "40px",
                            borderRadius: "8px",
                            borderColor: C.borderStrong,
                            fontFamily: FONT.sans,
                            fontSize: "13px",
                            color: C.text,
                            background: C.white,
                          }}
                        >
                          <Plus size={16} />
                          Ajouter
                        </Button>
                      </div>
                      {competitors.length > 0 && (
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px",
                          }}
                        >
                          {competitors.map((c, idx) => (
                            <span
                              key={`${c}-${idx}`}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "6px 10px",
                                borderRadius: "6px",
                                background: C.sageBg,
                                border: `1px solid ${C.sage}`,
                                color: C.sageDark,
                                fontFamily: FONT.sans,
                                fontSize: "12px",
                                fontWeight: 500,
                              }}
                            >
                              {c}
                              <button
                                type="button"
                                onClick={() => removeCompetitor(idx)}
                                aria-label={`Retirer ${c}`}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  padding: 0,
                                  cursor: "pointer",
                                  display: "flex",
                                  color: C.sageDark,
                                }}
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ════════════════════════════════════════════════════
                  STEP 3 — Vos sujets
                  ════════════════════════════════════════════════════ */}
              {step === 3 && (
                <Card
                  style={{
                    borderRadius: RADIUS,
                    border: `1px solid ${C.border}`,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.03), 0 8px 24px rgba(0,0,0,0.03)",
                    padding: 0,
                  }}
                >
                  <CardContent style={{ padding: PAD }}>
                    <StepHeader
                      index={3}
                      total={TOTAL_STEPS}
                      title="Vos sujets"
                      sub="Quels sujets surveillons-nous pour vous ? Ajoutez vos mots-clés ou choisissez parmi les suggestions sectorielles."
                    />

                    {/* Topic input */}
                    <div style={{ marginBottom: "18px" }}>
                      <FieldLabel hint={`${topics.length} / ${topicLimitLabel}`}>
                        Mots-clés surveillés
                      </FieldLabel>
                      <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                        <div style={{ position: "relative", flex: 1 }}>
                          <Tag
                            size={16}
                            style={{
                              position: "absolute",
                              left: "12px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              color: C.textMuted,
                              pointerEvents: "none",
                            }}
                          />
                          <Input
                            value={topicInput}
                            onChange={(e) => setTopicInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                submitTopicInput();
                              }
                            }}
                            placeholder="Ex. boycott, ESG, frais bancaires"
                            disabled={topics.length >= topicLimit}
                            style={{
                              paddingLeft: "36px",
                              height: "40px",
                              borderRadius: "8px",
                              borderColor: C.borderStrong,
                              fontFamily: FONT.sans,
                              fontSize: "13px",
                            }}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={submitTopicInput}
                          disabled={
                            !topicInput.trim() || topics.length >= topicLimit
                          }
                          style={{
                            height: "40px",
                            borderRadius: "8px",
                            borderColor: C.borderStrong,
                            fontFamily: FONT.sans,
                            fontSize: "13px",
                            color: C.text,
                            background: C.white,
                          }}
                        >
                          <Plus size={16} />
                          Ajouter
                        </Button>
                      </div>

                      {/* Selected topics */}
                      {topics.length > 0 && (
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px",
                            marginBottom: "18px",
                          }}
                        >
                          {topics.map((t, idx) => (
                            <span
                              key={`${t}-${idx}`}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "6px 10px",
                                borderRadius: "6px",
                                background: C.sageBg,
                                border: `1px solid ${C.sage}`,
                                color: C.sageDark,
                                fontFamily: FONT.sans,
                                fontSize: "12px",
                                fontWeight: 500,
                              }}
                            >
                              {t}
                              <button
                                type="button"
                                onClick={() => removeTopic(idx)}
                                aria-label={`Retirer ${t}`}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  padding: 0,
                                  cursor: "pointer",
                                  display: "flex",
                                  color: C.sageDark,
                                }}
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Sector-based suggestions */}
                    <div>
                      <Eyebrow>Suggestions pour votre secteur</Eyebrow>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                          marginTop: "12px",
                        }}
                      >
                        {suggestions.map((s) => {
                          const alreadyAdded = topics.some(
                            (t) => t.toLowerCase() === s.toLowerCase(),
                          );
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => addTopic(s)}
                              disabled={alreadyAdded || topics.length >= topicLimit}
                              style={{
                                padding: "6px 12px",
                                borderRadius: "6px",
                                border: `1px solid ${alreadyAdded ? C.sage : C.borderStrong}`,
                                background: alreadyAdded ? C.sageBg : C.white,
                                color: alreadyAdded ? C.sageDark : C.textBody,
                                fontFamily: FONT.sans,
                                fontSize: "12px",
                                fontWeight: 500,
                                cursor: alreadyAdded ? "default" : "pointer",
                                transition: "all 0.15s ease-out",
                                opacity: alreadyAdded ? 0.6 : 1,
                              }}
                            >
                              {alreadyAdded ? <CheckCircle2 size={12} style={{ display: "inline", marginRight: "4px", verticalAlign: "middle" }} /> : (
                                <Plus size={12} style={{ display: "inline", marginRight: "4px", verticalAlign: "middle" }} />
                              )}
                              {s}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ════════════════════════════════════════════════════
                  STEP 4 — C'est prêt!
                  ════════════════════════════════════════════════════ */}
              {step === 4 && (
                <Card
                  style={{
                    borderRadius: RADIUS,
                    border: `1px solid ${C.border}`,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.03), 0 8px 24px rgba(0,0,0,0.03)",
                    padding: 0,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {posted && <SageConfetti />}
                  <CardContent
                    style={{
                      padding: PAD,
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    <StepHeader
                      index={4}
                      total={TOTAL_STEPS}
                      title="C'est prêt !"
                      sub="Votre premier audit est lancé. HarchIQ commence la collecte sur vos sources."
                    />

                    {/* Summary */}
                    <div
                      style={{
                        border: `1px solid ${C.border}`,
                        borderRadius: RADIUS,
                        padding: PAD,
                        background: C.bgSubtle,
                        marginBottom: "20px",
                      }}
                    >
                      <Eyebrow>Récapitulatif</Eyebrow>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "12px",
                          marginTop: "12px",
                        }}
                        className="harch-onboard-summary-grid"
                      >
                        <SummaryRow label="Entreprise" value={companyName.trim() || "—"} />
                        <SummaryRow
                          label="Secteur"
                          value={
                            SECTORS.find((s) => s.value === sector)?.label ?? "—"
                          }
                        />
                        <SummaryRow
                          label="Concurrents"
                          value={`${competitors.length}`}
                        />
                        <SummaryRow label="Mots-clés" value={`${topics.length}`} />
                      </div>
                    </div>

                    {/* Audit loading / ready state */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        padding: "16px",
                        borderRadius: RADIUS,
                        border: `1px solid ${posted ? C.sage : C.borderStrong}`,
                        background: posted ? C.sageBg : C.white,
                        marginBottom: "20px",
                        transition: "all 0.3s ease-out",
                      }}
                    >
                      {posting || (!posted && !postError) ? (
                        <>
                          <Loader2
                            size={20}
                            style={{
                              color: C.sage,
                              animation: "spin 1s linear infinite",
                              flexShrink: 0,
                            }}
                          />
                          <div>
                            <div
                              style={{
                                fontSize: "13px",
                                fontWeight: 600,
                                color: C.text,
                              }}
                            >
                              Votre premier audit est lancé
                            </div>
                            <div
                              style={{
                                fontSize: "12px",
                                color: C.textMuted,
                                marginTop: "2px",
                              }}
                            >
                              HarchIQ collecte vos premières données…
                            </div>
                          </div>
                        </>
                      ) : postError ? (
                        <>
                          <X size={20} style={{ color: C.danger, flexShrink: 0 }} />
                          <div>
                            <div
                              style={{
                                fontSize: "13px",
                                fontWeight: 600,
                                color: C.text,
                              }}
                            >
                              Échec de l'enregistrement
                            </div>
                            <div
                              style={{
                                fontSize: "12px",
                                color: C.textMuted,
                                marginTop: "2px",
                              }}
                            >
                              {postError}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <CheckCircle2
                            size={20}
                            style={{ color: C.sage, flexShrink: 0 }}
                          />
                          <div>
                            <div
                              style={{
                                fontSize: "13px",
                                fontWeight: 600,
                                color: C.sageDark,
                              }}
                            >
                              Audit lancé avec succès
                            </div>
                            <div
                              style={{
                                fontSize: "12px",
                                color: C.textMuted,
                                marginTop: "2px",
                              }}
                            >
                              Vos premières données arrivent dans quelques minutes.
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>

          {/* ─── Footer: Back + primary CTA ──────────────────────── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              marginTop: "24px",
            }}
          >
            <div style={{ flex: 1 }}>
              {step > 1 && step < 4 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={goBack}
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: "13px",
                    color: C.textBody,
                    padding: "8px 12px",
                  }}
                >
                  <ArrowLeft size={16} />
                  Retour
                </Button>
              )}
            </div>

            {step === 1 && (
              <Button
                type="button"
                onClick={goNext}
                style={{
                  background: C.sage,
                  color: C.white,
                  fontFamily: FONT.sans,
                  fontSize: "13px",
                  fontWeight: 500,
                  height: "40px",
                  padding: "0 20px",
                  borderRadius: "8px",
                  border: "none",
                }}
              >
                Commencer
                <ArrowRight size={16} />
              </Button>
            )}

            {step === 2 && (
              <Button
                type="button"
                onClick={goNext}
                disabled={!step2Valid}
                style={{
                  background: step2Valid ? C.sage : C.borderStrong,
                  color: C.white,
                  fontFamily: FONT.sans,
                  fontSize: "13px",
                  fontWeight: 500,
                  height: "40px",
                  padding: "0 20px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: step2Valid ? "pointer" : "not-allowed",
                }}
              >
                Continuer
                <ArrowRight size={16} />
              </Button>
            )}

            {step === 3 && (
              <Button
                type="button"
                onClick={goNext}
                style={{
                  background: C.sage,
                  color: C.white,
                  fontFamily: FONT.sans,
                  fontSize: "13px",
                  fontWeight: 500,
                  height: "40px",
                  padding: "0 20px",
                  borderRadius: "8px",
                  border: "none",
                }}
              >
                Continuer
                <ArrowRight size={16} />
              </Button>
            )}

            {step === 4 && (
              <Button
                type="button"
                onClick={goToConsole}
                disabled={posting || (!posted && !postError)}
                style={{
                  background: posting || (!posted && !postError) ? C.borderStrong : C.sage,
                  color: C.white,
                  fontFamily: FONT.sans,
                  fontSize: "13px",
                  fontWeight: 500,
                  height: "40px",
                  padding: "0 20px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: posting || (!posted && !postError) ? "wait" : "pointer",
                }}
              >
                Accéder à mon tableau de bord
                <ArrowRight size={16} />
              </Button>
            )}
          </div>

          {/* Step 2 helper: hint when disabled */}
          {step === 2 && !step2Valid && (
            <p
              style={{
                fontFamily: FONT.sans,
                fontSize: "11px",
                color: C.textMuted,
                textAlign: "right",
                marginTop: "8px",
              }}
            >
              Renseignez le nom de l'entreprise et le secteur pour continuer.
            </p>
          )}
        </div>
      </main>

      {/* ─── Local CSS (keyframes + responsive) ─────────────────── */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Active progress dot — sage pulse */
        @keyframes harch-onboard-dot-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(74,123,95,0.40); }
          50%      { box-shadow: 0 0 0 5px rgba(74,123,95,0); }
        }
        .harch-onboard-dot-active {
          animation: harch-onboard-dot-pulse 1.8s ease-in-out infinite;
        }

        /* Radar sweep rotation for Step 1 illustration */
        @keyframes harch-onboard-radar-spin {
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .harch-onboard-radar-sweep {
          animation: harch-onboard-radar-spin 6s linear infinite;
        }

        /* Blip fade-in on the radar */
        @keyframes harch-onboard-blip {
          0%   { opacity: 0; transform: scale(0.5); }
          40%  { opacity: 1; transform: scale(1); }
          80%  { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.5); }
        }

        /* Sage confetti fall — reused from AuditPage pattern */
        @keyframes harch-onboard-confetti {
          0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(70vh) rotate(720deg); opacity: 0; }
        }

        /* ─── Responsive: single-column on mobile ─────────────── */
        @media (max-width: 640px) {
          .harch-onboard-welcome-grid {
            grid-template-columns: 1fr !important;
          }
          .harch-onboard-welcome-grid > div:last-child {
            order: -1; /* illustration on top */
            max-width: 220px;
          }
          .harch-onboard-features {
            grid-template-columns: 1fr !important;
          }
          .harch-onboard-summary-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

// ─── SummaryRow — small label/value pair used in the Step 4 recap ────
function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: "10px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: C.textMuted,
          marginBottom: "4px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: FONT.sans,
          fontSize: "14px",
          color: C.text,
          fontWeight: 500,
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default OnboardingWizard;
