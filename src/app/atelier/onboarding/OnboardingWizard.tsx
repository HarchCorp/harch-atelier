"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Plus, X, Check, Loader2 } from "lucide-react";

const SAGE = "#4A7B5F";
const SAGE_HOVER = "#3E6A50";
const CHARCOAL = "#0A0A0A";
const CHARCOAL_HOVER = "#1A1A1A";
const TEXT_BODY = "#525252";
const TEXT_MUTED = "#71717A";
const BORDER = "#F0F0F0";
const INPUT_BORDER = "#E5E5E5";
const INPUT_BORDER_FOCUS = SAGE;
const SAGE_TINT_STRONG = "rgba(74,123,95,0.12)";
const BG = "#FAFAFA";
const FONT_MONO = "'Space Mono', ui-monospace, monospace";
const FONT_SANS = "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif";

const SECTORS = [
  { value: "banking", label: "Banque" },
  { value: "telecom", label: "Télécom" },
  { value: "energy", label: "Énergie" },
  { value: "aviation", label: "Aviation" },
  { value: "fmcg", label: "Biens de consommation" },
  { value: "retail", label: "Distribution" },
  { value: "tech", label: "Tech / Startup" },
  { value: "other", label: "Autre" },
];

const PLAN_LABELS: Record<string, string> = {
  essential: "Essentiel",
  pro: "Pro",
  enterprise: "Grandes Entreprises",
  agency: "Agences",
};

export function OnboardingWizard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);
  const didPostRef = useRef(false);

  // Form state
  const [companyName, setCompanyName] = useState("");
  const [sector, setSector] = useState("");
  const [website, setWebsite] = useState("");
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [competitorInput, setCompetitorInput] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [topicInput, setTopicInput] = useState("");

  // Pre-fill from API
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/user/onboard", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        if (data.companyName) setCompanyName(data.companyName);
        if (data.sector) setSector(data.sector);
        if (data.website) setWebsite(data.website);
      })
      .catch(() => {});
  }, [status]);

  // Submit onboarding
  useEffect(() => {
    if (step !== 4 || posted || didPostRef.current) return;
    if (status !== "authenticated") return;
    didPostRef.current = true;

    setPosting(true);
    fetch("/api/user/onboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        newCompany: companyName
          ? { name: companyName, sector: sector || "other", website: website || undefined }
          : null,
        topics,
        competitors,
        skip: !companyName,
      }),
    })
      .then((r) => r.json())
      .then(() => {
        setPosted(true);
        setPosting(false);
      })
      .catch(() => {
        setPosted(true);
        setPosting(false);
      });
  }, [step, posted, status, companyName, sector, website, topics, competitors]);

  // NOTE: We intentionally do NOT early-return on status === "loading".
  // useSession() always returns "loading" during SSR (SessionProvider has
  // not hydrated yet), so gating content on it would make the server-rendered
  // HTML empty — breaking crawls, link previews, and curl-based smoke tests.
  // The page.tsx already server-gates via getServerSession(), so by the time
  // we reach here the user is authenticated. We render the welcome content
  // immediately; userName / planLabel fall back to safe defaults ("") and
  // hydrate to the real values on the client without a mismatch.

  const userName = session?.user?.name?.split(" ")[0] ?? "";
  const planLabel = PLAN_LABELS[session?.user?.accountType ?? "essential"] ?? "Essentiel";

  const goNext = () => { setDirection(1); setStep((s) => Math.min(4, s + 1)); };
  const goBack = () => { setDirection(-1); setStep((s) => Math.max(1, s - 1)); };

  const addCompetitor = () => {
    const v = competitorInput.trim();
    if (!v || competitors.length >= 5) return;
    if (!competitors.includes(v)) setCompetitors([...competitors, v]);
    setCompetitorInput("");
  };

  const addTopic = () => {
    const v = topicInput.trim();
    if (!v) return;
    if (!topics.includes(v)) setTopics([...topics, v]);
    setTopicInput("");
  };

  const canProceed = () => {
    if (step === 1) return true;
    if (step === 2) return companyName.trim() !== "" && sector !== "";
    if (step === 3) return true;
    return true;
  };

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: FONT_SANS, color: CHARCOAL, display: "flex", flexDirection: "column", alignItems: "center", overflowX: "hidden" }}>
      <style>{onbCss}</style>
      {/* Progress bar */}
      <div style={{ width: "100%", maxWidth: 560, padding: "24px 20px 0" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: s <= step ? SAGE : BORDER,
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Étape {step} / 4
          </span>
          {step < 4 && (
            <button
              onClick={() => { setDirection(1); setStep(4); }}
              className="onb-link-skip"
              style={{ background: "none", border: "none", fontSize: 11, color: TEXT_MUTED, cursor: "pointer", fontFamily: FONT_MONO, textTransform: "uppercase", letterSpacing: "0.06em", padding: 0, transition: "color 180ms ease" }}
            >
              Passer →
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, width: "100%", maxWidth: 560, padding: "32px 20px 48px", display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -20 : 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{ width: "100%", background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 12, padding: 32, boxSizing: "border-box" }}
            className="onb-card"
          >
            {/* STEP 1: Welcome */}
            {step === 1 && (
              <div>
                <div style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: SAGE, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                  Bienvenue
                </div>
                <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 12px", color: CHARCOAL, letterSpacing: "-0.02em" }}>
                  Bonjour{userName ? `, ${userName}` : ""}.
                </h1>
                <p style={{ fontSize: 15, color: TEXT_BODY, lineHeight: 1.6, margin: "0 0 24px" }}>
                  En 2 minutes, configurez votre espace de veille réputationnelle.
                </p>

                {/* Plan badge */}
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", background: "rgba(74,123,95,0.08)", borderRadius: 6, marginBottom: 24 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: SAGE }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: SAGE, fontFamily: "'Space Mono', monospace" }}>
                    Plan {planLabel}
                  </span>
                </div>

                {/* What you get */}
                <div style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
                  Ce que vous obtenez
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {["Score de réputation", "Alertes WhatsApp", "Rapports PDF", "HarchIQ AI"].map((item) => (
                    <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                      <Check size={14} style={{ color: SAGE, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: CHARCOAL, fontWeight: 500 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: Company */}
            {step === 2 && (
              <div>
                <div style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: SAGE, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                  Votre entreprise
                </div>
                <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 24px", color: CHARCOAL, letterSpacing: "-0.02em" }}>
                  Parlons de votre société.
                </h1>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: TEXT_MUTED, fontFamily: "'Space Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                    Nom de l'entreprise *
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ex: Chari"
                    className="onb-input"
                    style={{ width: "100%", height: 42, border: `1px solid ${INPUT_BORDER}`, borderRadius: 8, padding: "0 14px", fontSize: 14, background: "#FFFFFF", color: CHARCOAL, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                  />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: TEXT_MUTED, fontFamily: "'Space Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                    Secteur *
                  </label>
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="onb-input"
                    style={{ width: "100%", height: 42, border: `1px solid ${INPUT_BORDER}`, borderRadius: 8, padding: "0 14px", fontSize: 14, background: "#FFFFFF", color: CHARCOAL, outline: "none", boxSizing: "border-box", fontFamily: "inherit", cursor: "pointer", appearance: "none", WebkitAppearance: "none", MozAppearance: "none", backgroundImage: "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371717A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", paddingRight: 36 }}
                  >
                    <option value="">Choisir...</option>
                    {SECTORS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: TEXT_MUTED, fontFamily: "'Space Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                    Site web
                  </label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="exemple.ma"
                    className="onb-input"
                    style={{ width: "100%", height: 42, border: `1px solid ${INPUT_BORDER}`, borderRadius: 8, padding: "0 14px", fontSize: 14, background: "#FFFFFF", color: CHARCOAL, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: TEXT_MUTED, fontFamily: "'Space Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                    Concurrents (max 5)
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="text"
                      value={competitorInput}
                      onChange={(e) => setCompetitorInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCompetitor(); } }}
                      placeholder="Ajouter un concurrent"
                      disabled={competitors.length >= 5}
                      className="onb-input"
                      style={{ flex: 1, height: 42, border: `1px solid ${INPUT_BORDER}`, borderRadius: 8, padding: "0 14px", fontSize: 14, background: "#FFFFFF", color: CHARCOAL, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                    />
                    <button
                      onClick={addCompetitor}
                      disabled={!competitorInput.trim() || competitors.length >= 5}
                      className="onb-btn-plus"
                      style={{ width: 42, height: 42, border: `1px solid ${INPUT_BORDER}`, borderRadius: 8, background: "#FFFFFF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: SAGE, flexShrink: 0, transition: "border-color 180ms ease, background 180ms ease" }}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  {competitors.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                      {competitors.map((c, i) => (
                        <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", background: "rgba(74,123,95,0.08)", borderRadius: 4, fontSize: 13, color: SAGE }}>
                          {c}
                          <button onClick={() => setCompetitors(competitors.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: SAGE, padding: 0, display: "flex" }}>
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: Topics */}
            {step === 3 && (
              <div>
                <div style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: SAGE, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                  Vos sujets
                </div>
                <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px", color: CHARCOAL, letterSpacing: "-0.02em" }}>
                  Que surveillons-nous pour vous?
                </h1>
                <p style={{ fontSize: 14, color: TEXT_BODY, margin: "0 0 24px", lineHeight: 1.5 }}>
                  Ajoutez les mots-clés qui vous intéressent. Vous pourrez les modifier plus tard.
                </p>

                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  <input
                    type="text"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTopic(); } }}
                    placeholder="Ex: boycott, frais bancaires, ESG"
                    className="onb-input"
                    style={{ flex: 1, height: 42, border: `1px solid ${INPUT_BORDER}`, borderRadius: 8, padding: "0 14px", fontSize: 14, background: "#FFFFFF", color: CHARCOAL, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                  />
                  <button
                    onClick={addTopic}
                    disabled={!topicInput.trim()}
                    className="onb-btn-plus"
                    style={{ width: 42, height: 42, border: `1px solid ${INPUT_BORDER}`, borderRadius: 8, background: "#FFFFFF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: SAGE, flexShrink: 0, transition: "border-color 180ms ease, background 180ms ease" }}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {topics.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                    {topics.map((t, i) => (
                      <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 12px", background: "rgba(74,123,95,0.08)", borderRadius: 6, fontSize: 13, color: SAGE }}>
                        {t}
                        <button onClick={() => setTopics(topics.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: SAGE, padding: 0, display: "flex" }}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Sector suggestions */}
                {sector && (
                  <div>
                    <div style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                      Suggestions
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {["boycott", "prix", "ESG", "service client", "crise", "qualité", "innovation"].map((s) => (
                        <button
                          key={s}
                          onClick={() => { if (!topics.includes(s)) setTopics([...topics, s]); }}
                          disabled={topics.includes(s)}
                          style={{ padding: "4px 10px", background: topics.includes(s) ? BORDER : "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 4, fontSize: 12, color: topics.includes(s) ? TEXT_MUTED : CHARCOAL, cursor: topics.includes(s) ? "default" : "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 4 }}
                        >
                          {topics.includes(s) ? <Check size={12} color={SAGE} /> : <Plus size={12} color={TEXT_MUTED} />}{s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: Ready */}
            {step === 4 && (
              <div style={{ textAlign: "center" }}>
                {posting ? (
                  <>
                    <div style={{ marginBottom: 24 }}>
                      <Loader2 size={48} style={{ color: SAGE, animation: "spin 1s linear infinite" }} />
                    </div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px", color: CHARCOAL }}>
                      Configuration en cours...
                    </h1>
                    <p style={{ fontSize: 14, color: TEXT_BODY, lineHeight: 1.6 }}>
                      Nous préparons votre tableau de bord.
                    </p>
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                      style={{ width: 64, height: 64, margin: "0 auto 24px", background: "rgba(74,123,95,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <Check size={32} style={{ color: SAGE }} />
                    </motion.div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px", color: CHARCOAL }}>
                      C'est prêt!
                    </h1>
                    <p style={{ fontSize: 14, color: TEXT_BODY, margin: "0 0 24px", lineHeight: 1.6 }}>
                      Votre tableau de bord est configuré. Nous collectons déjà des articles sur <strong>{companyName || "votre entreprise"}</strong>.
                    </p>

                    {/* Summary */}
                    <div style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: 16, marginBottom: 24, textAlign: "left" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Entreprise</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: CHARCOAL }}>{companyName || "—"}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Secteur</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: CHARCOAL }}>{SECTORS.find((s) => s.value === sector)?.label ?? "—"}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Concurrents</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: CHARCOAL }}>{competitors.length || "—"}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Mots-clés</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: CHARCOAL }}>{topics.length || "—"}</div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => router.push("/atelier/console")}
                      className="onb-btn-charcoal"
                      style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 32px", background: CHARCOAL, color: "#FFFFFF", fontSize: 15, fontWeight: 600, border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", transition: "background 180ms ease, box-shadow 180ms ease, transform 180ms ease" }}
                    >
                      Accéder à mon tableau de bord
                      <ArrowRight size={16} />
                    </button>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      {step < 4 && (
        <div style={{ width: "100%", maxWidth: 560, padding: "0 20px 32px", display: "flex", justifyContent: "space-between" }}>
          {step > 1 ? (
            <button
              onClick={goBack}
              className="onb-btn-ghost"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 16px", background: "transparent", border: `1px solid ${INPUT_BORDER}`, color: TEXT_BODY, fontSize: 13, fontWeight: 600, borderRadius: 8, cursor: "pointer", fontFamily: "inherit", transition: "border-color 180ms ease, color 180ms ease" }}
            >
              <ArrowLeft size={14} /> Retour
            </button>
          ) : <div />}

          <button
            onClick={goNext}
            disabled={!canProceed()}
            className={canProceed() ? "onb-btn-sage" : undefined}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 24px", background: canProceed() ? SAGE : "#E5E5E5", color: canProceed() ? "#FFFFFF" : TEXT_MUTED, fontSize: 13, fontWeight: 600, border: "none", borderRadius: 8, cursor: canProceed() ? "pointer" : "not-allowed", fontFamily: "inherit", transition: "background 180ms ease, box-shadow 180ms ease, transform 180ms ease" }}
          >
            {step === 1 ? "Commencer" : "Continuer"} <ArrowRight size={14} />
          </button>
        </div>
      )}

      <style>{onbCss}</style>
    </div>
  );
}

// ─── CSS (focus states + button hover) ───────────────────────────
const onbCss = `
  @keyframes spin { to { transform: rotate(360deg); } }

  .onb-input {
    transition: border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
  }
  .onb-input::placeholder {
    color: #9CA3AF;
  }
  .onb-input:focus {
    border-color: ${INPUT_BORDER_FOCUS} !important;
    background: #FFFFFF !important;
    box-shadow: 0 0 0 3px ${SAGE_TINT_STRONG} !important;
  }
  .onb-input:disabled {
    background: #FAFAFA !important;
    color: #9CA3AF !important;
    cursor: not-allowed;
  }

  .onb-btn-charcoal:hover {
    background: ${CHARCOAL_HOVER} !important;
    box-shadow: 0 8px 20px rgba(0,0,0,0.14) !important;
  }
  .onb-btn-charcoal:active {
    transform: scale(0.98) !important;
  }

  .onb-btn-sage:hover {
    background: ${SAGE_HOVER} !important;
    box-shadow: 0 8px 20px rgba(74,123,95,0.20) !important;
  }
  .onb-btn-sage:active {
    transform: scale(0.98) !important;
  }

  .onb-btn-ghost:hover {
    border-color: ${CHARCOAL} !important;
    color: ${CHARCOAL} !important;
  }

  .onb-btn-plus:not(:disabled):hover {
    border-color: ${SAGE} !important;
    background: ${SAGE_TINT_STRONG} !important;
  }
  .onb-btn-plus:disabled {
    cursor: not-allowed !important;
    opacity: 0.5;
  }

  .onb-link-skip:hover {
    color: ${SAGE} !important;
  }

  @media (max-width: 480px) {
    .onb-card {
      padding: 24px 20px !important;
    }
  }
`;
