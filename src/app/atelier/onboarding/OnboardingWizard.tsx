"use client";

// ═══════════════════════════════════════════════════════════════
//  ONBOARDING WIZARD — 4-step setup shown on first login
//
//  Step 1: Company Setup   — pick existing OR create new (with sector auto-detect)
//  Step 2: Role & Use Case — jobTitle + free-form useCase
//  Step 3: Monitoring      — per accountType (topics / competitors / portfolio / tickers)
//  Step 4: Confirmation    — summary + "Start using HarchIQ"
//
//  Skip path: user can click "Skip for now" — they get attached to
//  the first company in the DB as a fallback. The wizard warns them
//  that data will be generic.
//
//  Calls POST /api/user/onboard on submit. On success → redirect to
//  /atelier/console (which routes them to their dashboard).
//
//  Task: user-company-onboarding
// ═══════════════════════════════════════════════════════════════

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { C } from "../components/tokens";
import { SECTORS, classifySector } from "@/lib/harchiq/sector-classifier";

// ─── Types ────────────────────────────────────────────────────────

interface ExistingCompany {
  id: string;
  name: string;
  slug: string;
  sector: string;
  website: string | null;
}

interface UserState {
  id: string;
  email: string;
  name: string | null;
  accountType: string;
  companyId: string | null;
  jobTitle: string | null;
  onboardingCompleted: boolean;
  topics: string[];
  competitors: string[];
  trackedAssets: string[];
  useCaseNote: string | null;
  company: {
    id: string;
    name: string;
    slug: string;
    sector: string;
    website: string | null;
    description: string | null;
    iceNumber: string | null;
    rcNumber: string | null;
  } | null;
}

const JOB_TITLES = [
  "CEO",
  "CRO (Chief Risk Officer)",
  "Dircom",
  "CMO",
  "Director of Strategy",
  "Analyst",
  "Associate",
  "Trader",
  "Other",
] as const;

const TOPIC_OPTIONS = [
  { id: "earnings", label: "Earnings & Financials" },
  { id: "regulation", label: "Regulation & Compliance" },
  { id: "crisis", label: "Crisis & Controversies" },
  { id: "leadership", label: "Leadership & M&A" },
  { id: "product", label: "Product & Launches" },
  { id: "esg", label: "ESG & Sustainability" },
] as const;

const BVC_TICKERS = [
  { ticker: "OCP", name: "OCP Group", sector: "Mining & Phosphates" },
  { ticker: "IAM", name: "Maroc Telecom", sector: "Telecommunications" },
  { ticker: "ATW", name: "Attijariwafa Bank", sector: "Banking" },
  { ticker: "BCP", name: "Banque Centrale Populaire", sector: "Banking" },
  { ticker: "CIH", name: "CIH Bank", sector: "Banking" },
  { ticker: "CFG", name: "CFG Bank", sector: "Banking" },
  { ticker: "LAS", name: "LesieurCristal", sector: "Agro-food" },
  { ticker: "CSU", name: "Cosumar", sector: "Agro-food" },
  { ticker: "MNG", name: "Managem", sector: "Mining & Phosphates" },
  { ticker: "LHM", name: "LafargeHolcim Maroc", sector: "Construction" },
  { ticker: "ADH", name: "Addoha", sector: "Real Estate" },
  { ticker: "CGI", name: "CGI", sector: "Real Estate" },
  { ticker: "RIS", name: "Risma", sector: "Retail" },
  { ticker: "SBT", name: "Société d'Investissement Tunisie", sector: "Real Estate" },
  { ticker: "TQM", name: "Total Maroc", sector: "Energy & Utilities" },
];

// ─── Inline styles (mirrors LoginPage.tsx patterns) ───────────────

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: `1px solid ${C.border}`,
  borderRadius: "4px",
  background: C.bg,
  color: C.text,
  fontSize: "14px",
  fontFamily: C.fontSans,
  outline: "none",
  transition: "border-color 0.15s",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  fontFamily: C.fontMono,
  color: C.textMuted,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  marginBottom: "6px",
};

const btnPrimary: React.CSSProperties = {
  padding: "10px 20px",
  background: C.cta,
  color: "#ffffff",
  border: "none",
  borderRadius: "4px",
  fontSize: "14px",
  fontWeight: 600,
  fontFamily: C.fontSans,
  cursor: "pointer",
  transition: "background 0.15s",
};

const btnSecondary: React.CSSProperties = {
  padding: "10px 20px",
  background: "transparent",
  color: C.textBody,
  border: `1px solid ${C.borderStrong}`,
  borderRadius: "4px",
  fontSize: "14px",
  fontWeight: 500,
  fontFamily: C.fontSans,
  cursor: "pointer",
  transition: "background 0.15s",
};

const btnGhost: React.CSSProperties = {
  padding: "8px 14px",
  background: "transparent",
  color: C.textMuted,
  border: "none",
  fontSize: "13px",
  fontWeight: 500,
  fontFamily: C.fontSans,
  cursor: "pointer",
};

const cardStyle: React.CSSProperties = {
  background: C.bg,
  border: `1px solid ${C.border}`,
  borderRadius: "6px",
  padding: "20px",
};

// ─── Component ────────────────────────────────────────────────────

export function OnboardingWizard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserState | null>(null);

  // Wizard state
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1 — company
  const [companyMode, setCompanyMode] = useState<"existing" | "new">("existing");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ExistingCompany[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<ExistingCompany | null>(null);
  const [newCompany, setNewCompany] = useState({
    name: "",
    website: "",
    sector: "Banking",
    ice: "",
    rc: "",
    description: "",
  });

  // Step 2 — role
  const [jobTitle, setJobTitle] = useState<string>("");
  const [useCase, setUseCase] = useState("");

  // Step 3 — monitoring (per accountType)
  const [topics, setTopics] = useState<string[]>([]);
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [competitorInput, setCompetitorInput] = useState("");
  const [trackedAssets, setTrackedAssets] = useState<string[]>([]);
  const [portfolioCsv, setPortfolioCsv] = useState("");
  const [portfolioFileName, setPortfolioFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  // ─── Load the user's current onboarding state on mount ─────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/user/onboard", { cache: "no-store" });
        if (!res.ok) {
          setError("Failed to load onboarding state");
          setLoading(false);
          return;
        }
        const data = (await res.json()) as { user: UserState };
        if (cancelled) return;
        setUser(data.user);
        // Pre-fill fields from any partial state.
        if (data.user.companyId && data.user.company) {
          setSelectedCompany({
            id: data.user.company.id,
            name: data.user.company.name,
            slug: data.user.company.slug,
            sector: data.user.company.sector,
            website: data.user.company.website,
          });
        }
        if (data.user.jobTitle) setJobTitle(data.user.jobTitle);
        if (data.user.useCaseNote) setUseCase(data.user.useCaseNote);
        if (data.user.topics?.length) setTopics(data.user.topics);
        if (data.user.competitors?.length) setCompetitors(data.user.competitors);
        if (data.user.trackedAssets?.length) setTrackedAssets(data.user.trackedAssets);
        setLoading(false);
      } catch {
        if (!cancelled) {
          setError("Network error loading onboarding");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ─── Company search (debounced) ────────────────────────────────
  useEffect(() => {
    if (companyMode !== "existing") return;
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/companies?q=${encodeURIComponent(searchQuery)}`,
          { cache: "no-store" },
        );
        if (!res.ok) {
          setSearchResults([]);
          return;
        }
        const data = await res.json();
        // The companies route returns either { companies: [...] } or
        // an array — handle both shapes defensively.
        const list: ExistingCompany[] = Array.isArray(data)
          ? (data as ExistingCompany[])
          : (data.companies as ExistingCompany[]) ?? [];
        setSearchResults(list.slice(0, 8));
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [searchQuery, companyMode]);

  // ─── Auto-detect sector from name + website ────────────────────
  const detectedSector = useMemo(
    () =>
      classifySector(
        newCompany.name,
        newCompany.website,
        newCompany.description,
      ),
    [newCompany.name, newCompany.website, newCompany.description],
  );

  // ─── Step validation ────────────────────────────────────────────
  const step1Valid = !!selectedCompany || (companyMode === "new" && newCompany.name.trim().length >= 2);
  const step2Valid = !!jobTitle;
  const accountType = user?.accountType ?? "brand-monitor";

  // ─── Handlers ───────────────────────────────────────────────────
  const handleToggleTopic = (id: string) => {
    setTopics((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const handleAddCompetitor = () => {
    const v = competitorInput.trim();
    if (!v) return;
    if (competitors.includes(v)) return;
    if (competitors.length >= 50) return;
    setCompetitors([...competitors, v]);
    setCompetitorInput("");
  };

  const handleRemoveCompetitor = (c: string) => {
    setCompetitors(competitors.filter((x) => x !== c));
  };

  const handleToggleAsset = (ticker: string) => {
    const upper = ticker.toUpperCase();
    setTrackedAssets((prev) =>
      prev.includes(upper)
        ? prev.filter((t) => t !== upper)
        : [...prev, upper],
    );
  };

  const handleFileUpload = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      setError("Portfolio CSV must be under 2 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      setPortfolioCsv(text);
      setPortfolioFileName(file.name);
      setError(null);
    };
    reader.onerror = () => setError("Failed to read CSV file");
    reader.readAsText(file);
  };

  const handleNext = () => {
    setError(null);
    if (step === 1 && !step1Valid) {
      setError("Pick or create a company to continue");
      return;
    }
    if (step === 2 && !step2Valid) {
      setError("Select your role to continue");
      return;
    }
    setStep((s) => (Math.min(4, s + 1) as 1 | 2 | 3 | 4));
  };

  const handleBack = () => {
    setError(null);
    setStep((s) => (Math.max(1, s - 1) as 1 | 2 | 3 | 4));
  };

  // ─── Submission ─────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (opts: { skip?: boolean } = {}) => {
      setSubmitting(true);
      setError(null);
      try {
        const payload: Record<string, unknown> = {
          skip: opts.skip === true,
        };
        if (!opts.skip) {
          if (companyMode === "existing" && selectedCompany) {
            payload.companyId = selectedCompany.id;
          } else if (companyMode === "new") {
            payload.newCompany = {
              name: newCompany.name.trim(),
              website: newCompany.website.trim() || undefined,
              sector: newCompany.sector,
              ice: newCompany.ice.trim() || undefined,
              rc: newCompany.rc.trim() || undefined,
              description: newCompany.description.trim() || undefined,
            };
          }
          payload.jobTitle = jobTitle;
          payload.useCase = useCase.trim() || undefined;
          payload.topics = topics;
          payload.competitors = competitors;
          payload.trackedAssets = trackedAssets;
          payload.portfolioCsv = portfolioCsv || undefined;
        }

        const res = await fetch("/api/user/onboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Onboarding failed");
          setSubmitting(false);
          return;
        }
        // Success → bounce to the console redirector (which routes by
        // accountType / onboardingCompleted).
        router.push("/atelier/console");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Network error");
        setSubmitting(false);
      }
    },
    [
      companyMode,
      selectedCompany,
      newCompany,
      jobTitle,
      useCase,
      topics,
      competitors,
      trackedAssets,
      portfolioCsv,
      router,
    ],
  );

  // ─── Render ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: C.fontSans,
          color: C.textMuted,
          fontSize: "14px",
        }}
      >
        Loading onboarding...
      </div>
    );
  }

  if (!user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: C.fontSans,
          color: C.danger,
          fontSize: "14px",
        }}
      >
        {error || "Unable to load onboarding"}
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bgSubtle,
        display: "flex",
        flexDirection: "column",
        fontFamily: C.fontSans,
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: "20px 24px",
          borderBottom: `1px solid ${C.border}`,
          background: C.bg,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            maxWidth: "640px",
            margin: "0 auto",
          }}
        >
          <span
            style={{
              fontFamily: C.fontMono,
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.18em",
              color: C.text,
              textTransform: "uppercase",
            }}
          >
            HarchIQ<span style={{ color: C.accent, marginLeft: "8px" }}>Onboarding</span>
          </span>
          <span style={{ fontSize: "12px", color: C.textMuted }}>
            Signed in as <strong style={{ color: C.textBody }}>{user.email}</strong>
          </span>
        </div>
      </header>

      {/* Main */}
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "40px 16px",
        }}
      >
        <div style={{ maxWidth: "640px", width: "100%" }}>
          {/* Progress dots */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "32px",
            }}
            aria-label={`Step ${step} of 4`}
          >
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                style={{
                  width: n === step ? "32px" : "8px",
                  height: "8px",
                  borderRadius: "4px",
                  background: n <= step ? C.cta : C.border,
                  transition: "width 0.2s, background 0.2s",
                }}
              />
            ))}
            <span
              style={{
                marginLeft: "12px",
                fontSize: "12px",
                fontFamily: C.fontMono,
                color: C.textMuted,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Step {step} / 4
            </span>
          </div>

          {/* Step 1 — Company Setup */}
          {step === 1 && (
            <section>
              <h1
                style={{
                  fontSize: "clamp(24px, 4vw, 30px)",
                  fontWeight: 700,
                  color: C.text,
                  letterSpacing: "-0.02em",
                  margin: "0 0 8px",
                }}
              >
                Which company are you monitoring?
              </h1>
              <p
                style={{
                  fontSize: "15px",
                  color: C.textBody,
                  lineHeight: 1.5,
                  margin: "0 0 24px",
                }}
              >
                We&apos;ll isolate the data so only you and your teammates see this company&apos;s alerts, sentiment, and AI visibility.
              </p>

              {/* Mode toggle */}
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginBottom: "16px",
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                {(["existing", "new"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setCompanyMode(m)}
                    style={{
                      padding: "10px 16px",
                      background: "transparent",
                      color: companyMode === m ? C.text : C.textMuted,
                      border: "none",
                      borderBottom: companyMode === m ? `2px solid ${C.cta}` : "2px solid transparent",
                      fontSize: "14px",
                      fontWeight: 600,
                      fontFamily: C.fontSans,
                      cursor: "pointer",
                      transition: "color 0.15s",
                    }}
                  >
                    {m === "existing" ? "Pick existing" : "Create new"}
                  </button>
                ))}
              </div>

              {companyMode === "existing" ? (
                <div>
                  {selectedCompany ? (
                    <div style={cardStyle}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: "11px",
                              fontFamily: C.fontMono,
                              color: C.textMuted,
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                              marginBottom: "4px",
                            }}
                          >
                            Selected company
                          </div>
                          <div style={{ fontSize: "18px", fontWeight: 600, color: C.text }}>
                            {selectedCompany.name}
                          </div>
                          <div style={{ fontSize: "13px", color: C.textMuted, marginTop: "2px" }}>
                            {selectedCompany.sector} · {selectedCompany.website || `/${selectedCompany.slug}`}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedCompany(null)}
                          style={btnGhost}
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label style={labelStyle}>Search companies</label>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Type &quot;Attijariwafa&quot;, &quot;OCP&quot;, ..."
                        style={inputStyle}
                        autoFocus
                      />
                      {searchLoading && (
                        <div style={{ fontSize: "12px", color: C.textMuted, marginTop: "8px" }}>
                          Searching...
                        </div>
                      )}
                      {!searchLoading && searchResults.length > 0 && (
                        <ul
                          style={{
                            listStyle: "none",
                            padding: 0,
                            margin: "12px 0 0",
                            border: `1px solid ${C.border}`,
                            borderRadius: "4px",
                            overflow: "hidden",
                          }}
                        >
                          {searchResults.map((c) => (
                            <li key={c.id}>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCompany(c);
                                  setSearchQuery("");
                                  setSearchResults([]);
                                }}
                                style={{
                                  width: "100%",
                                  textAlign: "left",
                                  padding: "10px 14px",
                                  background: C.bg,
                                  border: "none",
                                  borderBottom: `1px solid ${C.border}`,
                                  cursor: "pointer",
                                  fontFamily: C.fontSans,
                                }}
                              >
                                <div style={{ fontSize: "14px", fontWeight: 600, color: C.text }}>
                                  {c.name}
                                </div>
                                <div style={{ fontSize: "12px", color: C.textMuted }}>
                                  {c.sector}{c.website ? ` · ${c.website}` : ""}
                                </div>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                      {!searchLoading && searchQuery.trim() && searchResults.length === 0 && (
                        <div
                          style={{
                            marginTop: "12px",
                            padding: "12px 14px",
                            background: C.bgSubtle,
                            border: `1px solid ${C.border}`,
                            borderRadius: "4px",
                            fontSize: "13px",
                            color: C.textBody,
                          }}
                        >
                          No match. Switch to <strong>Create new</strong> to add it.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label style={labelStyle}>Company name *</label>
                    <input
                      type="text"
                      value={newCompany.name}
                      onChange={(e) =>
                        setNewCompany({ ...newCompany, name: e.target.value })
                      }
                      placeholder="e.g. Attijariwafa Bank"
                      style={inputStyle}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Website</label>
                    <input
                      type="url"
                      value={newCompany.website}
                      onChange={(e) =>
                        setNewCompany({ ...newCompany, website: e.target.value })
                      }
                      placeholder="https://www.attijariwafa.com"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Sector</label>
                    <select
                      value={newCompany.sector}
                      onChange={(e) =>
                        setNewCompany({ ...newCompany, sector: e.target.value })
                      }
                      style={inputStyle}
                    >
                      {SECTORS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                    {detectedSector !== newCompany.sector && detectedSector !== "Other" && (
                      <div style={{ fontSize: "12px", color: C.accent, marginTop: "6px" }}>
                        Tip: based on the name, we&apos;d suggest <strong>{detectedSector}</strong>.
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>ICE number (optional)</label>
                      <input
                        type="text"
                        value={newCompany.ice}
                        onChange={(e) =>
                          setNewCompany({ ...newCompany, ice: e.target.value })
                        }
                        placeholder="000000000000000"
                        style={inputStyle}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>RC number (optional)</label>
                      <input
                        type="text"
                        value={newCompany.rc}
                        onChange={(e) =>
                          setNewCompany({ ...newCompany, rc: e.target.value })
                        }
                        placeholder="Casablanca 000000"
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Description (optional)</label>
                    <textarea
                      value={newCompany.description}
                      onChange={(e) =>
                        setNewCompany({ ...newCompany, description: e.target.value })
                      }
                      placeholder="Short description of the company's activity"
                      rows={3}
                      style={{ ...inputStyle, resize: "vertical" }}
                    />
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Step 2 — Role & Use Case */}
          {step === 2 && (
            <section>
              <h1
                style={{
                  fontSize: "clamp(24px, 4vw, 30px)",
                  fontWeight: 700,
                  color: C.text,
                  letterSpacing: "-0.02em",
                  margin: "0 0 8px",
                }}
              >
                What do you do here?
              </h1>
              <p
                style={{
                  fontSize: "15px",
                  color: C.textBody,
                  lineHeight: 1.5,
                  margin: "0 0 24px",
                }}
              >
                We use your role to recommend the right account type and pre-configure your dashboard widgets.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Your job title *</label>
                  <select
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">— Select —</option>
                    {JOB_TITLES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>What do you want to monitor? (optional)</label>
                  <textarea
                    value={useCase}
                    onChange={(e) => setUseCase(e.target.value)}
                    placeholder="e.g. Track negative coverage on OCP across Moroccan press and AI engines"
                    rows={4}
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                </div>
                <div
                  style={{
                    padding: "12px 14px",
                    background: C.bgSubtle,
                    border: `1px solid ${C.border}`,
                    borderRadius: "4px",
                    fontSize: "13px",
                    color: C.textBody,
                    lineHeight: 1.5,
                  }}
                >
                  <strong style={{ color: C.text }}>Your current account type:</strong>{" "}
                  <code
                    style={{
                      fontFamily: C.fontMono,
                      fontSize: "12px",
                      color: C.accent,
                    }}
                  >
                    {accountType}
                  </code>
                  . You can ask an admin to change it later.
                </div>
              </div>
            </section>
          )}

          {/* Step 3 — Configure Monitoring */}
          {step === 3 && (
            <section>
              <h1
                style={{
                  fontSize: "clamp(24px, 4vw, 30px)",
                  fontWeight: 700,
                  color: C.text,
                  letterSpacing: "-0.02em",
                  margin: "0 0 8px",
                }}
              >
                Configure your monitoring
              </h1>
              <p
                style={{
                  fontSize: "15px",
                  color: C.textBody,
                  lineHeight: 1.5,
                  margin: "0 0 24px",
                }}
              >
                Tailored to your account type ({accountType}).
              </p>

              {accountType === "brand-monitor" && (
                <div>
                  <label style={labelStyle}>Which topics matter to you?</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {TOPIC_OPTIONS.map((t) => {
                      const active = topics.includes(t.id);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleToggleTopic(t.id)}
                          style={{
                            padding: "8px 14px",
                            background: active ? C.cta : C.bg,
                            color: active ? "#ffffff" : C.textBody,
                            border: `1px solid ${active ? C.cta : C.borderStrong}`,
                            borderRadius: "999px",
                            fontSize: "13px",
                            fontWeight: 500,
                            fontFamily: C.fontSans,
                            cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                        >
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {accountType === "market-competitor" && (
                <div>
                  <label style={labelStyle}>Who are your competitors?</label>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                    <input
                      type="text"
                      value={competitorInput}
                      onChange={(e) => setCompetitorInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCompetitor();
                        }
                      }}
                      placeholder="Type a competitor name + Enter"
                      style={inputStyle}
                    />
                    <button
                      type="button"
                      onClick={handleAddCompetitor}
                      style={{ ...btnPrimary, whiteSpace: "nowrap" }}
                    >
                      Add
                    </button>
                  </div>
                  {competitors.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {competitors.map((c) => (
                        <span
                          key={c}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 10px 6px 12px",
                            background: C.bgSubtle,
                            border: `1px solid ${C.border}`,
                            borderRadius: "999px",
                            fontSize: "13px",
                            color: C.text,
                          }}
                        >
                          {c}
                          <button
                            type="button"
                            onClick={() => handleRemoveCompetitor(c)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: C.textMuted,
                              cursor: "pointer",
                              fontSize: "16px",
                              lineHeight: 1,
                              padding: 0,
                            }}
                            aria-label={`Remove ${c}`}
                          >
                            x
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div style={{ fontSize: "12px", color: C.textMuted, marginTop: "8px" }}>
                    {competitors.length} / 50 added. We&apos;ll auto-create Company records for each.
                  </div>
                </div>
              )}

              {accountType === "investment-bank" && (
                <div>
                  <label style={labelStyle}>Upload your portfolio (CSV)</label>
                  <div
                    style={{
                      padding: "16px",
                      border: `2px dashed ${C.borderStrong}`,
                      borderRadius: "6px",
                      background: C.bgSubtle,
                      textAlign: "center",
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,text/csv"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFileUpload(f);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      style={btnSecondary}
                    >
                      Choose CSV file
                    </button>
                    {portfolioFileName && (
                      <div style={{ fontSize: "13px", color: C.textBody, marginTop: "8px" }}>
                        Loaded: <strong>{portfolioFileName}</strong>
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      marginTop: "12px",
                      padding: "10px 12px",
                      background: C.bg,
                      border: `1px solid ${C.border}`,
                      borderRadius: "4px",
                      fontFamily: C.fontMono,
                      fontSize: "11px",
                      color: C.textMuted,
                      lineHeight: 1.6,
                    }}
                  >
                    Expected columns: <code>companyName, weight, sector</code>
                    <br />
                    weight is 0-1 (e.g. 0.25 for 25%).
                  </div>
                  <textarea
                    value={portfolioCsv}
                    onChange={(e) => setPortfolioCsv(e.target.value)}
                    placeholder={`companyName,weight,sector\nAttijariwafa Bank,0.25,Banking\nOCP Group,0.40,Mining`}
                    rows={5}
                    style={{ ...inputStyle, marginTop: "12px", fontFamily: C.fontMono, fontSize: "12px", resize: "vertical" }}
                  />
                </div>
              )}

              {accountType === "harch-alpha" && (
                <div>
                  <label style={labelStyle}>Which assets do you track?</label>
                  <p style={{ fontSize: "13px", color: C.textMuted, margin: "0 0 12px" }}>
                    Pick from BVC tickers. You can change this later.
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                      gap: "8px",
                      maxHeight: "320px",
                      overflowY: "auto",
                      padding: "4px",
                    }}
                  >
                    {BVC_TICKERS.map((a) => {
                      const active = trackedAssets.includes(a.ticker);
                      return (
                        <button
                          key={a.ticker}
                          type="button"
                          onClick={() => handleToggleAsset(a.ticker)}
                          style={{
                            padding: "10px 12px",
                            background: active ? C.cta : C.bg,
                            color: active ? "#ffffff" : C.text,
                            border: `1px solid ${active ? C.cta : C.border}`,
                            borderRadius: "4px",
                            textAlign: "left",
                            cursor: "pointer",
                            fontFamily: C.fontSans,
                            transition: "all 0.15s",
                          }}
                        >
                          <div
                            style={{
                              fontFamily: C.fontMono,
                              fontSize: "12px",
                              fontWeight: 700,
                              letterSpacing: "0.05em",
                            }}
                          >
                            {a.ticker}
                          </div>
                          <div style={{ fontSize: "12px", opacity: 0.85, marginTop: "2px" }}>
                            {a.name}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ fontSize: "12px", color: C.textMuted, marginTop: "8px" }}>
                    {trackedAssets.length} asset{trackedAssets.length === 1 ? "" : "s"} selected.
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Step 4 — Confirmation */}
          {step === 4 && (
            <section>
              <h1
                style={{
                  fontSize: "clamp(24px, 4vw, 30px)",
                  fontWeight: 700,
                  color: C.text,
                  letterSpacing: "-0.02em",
                  margin: "0 0 8px",
                }}
              >
                Ready to start?
              </h1>
              <p
                style={{
                  fontSize: "15px",
                  color: C.textBody,
                  lineHeight: 1.5,
                  margin: "0 0 24px",
                }}
              >
                Review your setup. You can change all of this later in the Console.
              </p>

              <div style={cardStyle}>
                <SummaryRow
                  label="Company"
                  value={
                    companyMode === "existing" && selectedCompany
                      ? selectedCompany.name
                      : companyMode === "new" && newCompany.name
                        ? `${newCompany.name} (new)`
                        : "—"
                  }
                />
                <SummaryRow label="Sector" value={
                  companyMode === "existing" && selectedCompany
                    ? selectedCompany.sector
                    : companyMode === "new"
                      ? newCompany.sector
                      : "—"
                } />
                <SummaryRow label="Role" value={jobTitle || "—"} />
                {useCase && <SummaryRow label="Use case" value={useCase} />}

                {accountType === "brand-monitor" && (
                  <SummaryRow
                    label="Topics"
                    value={
                      topics.length > 0
                        ? topics.map((t) => TOPIC_OPTIONS.find((o) => o.id === t)?.label ?? t).join(", ")
                        : "All topics (default)"
                    }
                  />
                )}
                {accountType === "market-competitor" && (
                  <SummaryRow
                    label="Competitors"
                    value={competitors.length > 0 ? `${competitors.length} added` : "None yet"}
                  />
                )}
                {accountType === "investment-bank" && (
                  <SummaryRow
                    label="Portfolio"
                    value={portfolioCsv ? "CSV ready to import" : "No CSV uploaded"}
                  />
                )}
                {accountType === "harch-alpha" && (
                  <SummaryRow
                    label="Tracked assets"
                    value={trackedAssets.length > 0 ? trackedAssets.join(", ") : "None yet"}
                  />
                )}
              </div>
            </section>
          )}

          {/* Error */}
          {error && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px 14px",
                background: C.dangerBg,
                border: `1px solid ${C.danger}30`,
                borderRadius: "4px",
                fontSize: "13px",
                color: C.danger,
                lineHeight: 1.5,
              }}
            >
              {error}
            </div>
          )}

          {/* Footer / actions */}
          <div
            style={{
              marginTop: "32px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  style={btnSecondary}
                  disabled={submitting}
                >
                  Back
                </button>
              )}
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              {step < 4 ? (
                <>
                  {!showSkipConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowSkipConfirm(true)}
                      style={btnGhost}
                      disabled={submitting}
                    >
                      Skip for now
                    </button>
                  ) : (
                    <span
                      style={{
                        fontSize: "12px",
                        color: C.warningText,
                        background: C.warningBg,
                        border: `1px solid ${C.warningBorder}`,
                        padding: "6px 10px",
                        borderRadius: "4px",
                      }}
                    >
                      Generic data only —{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setShowSkipConfirm(false);
                          void handleSubmit({ skip: true });
                        }}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: C.warningText,
                          fontWeight: 700,
                          cursor: "pointer",
                          padding: 0,
                          textDecoration: "underline",
                        }}
                      >
                        confirm skip
                      </button>
                      {" or "}
                      <button
                        type="button"
                        onClick={() => setShowSkipConfirm(false)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: C.textMuted,
                          cursor: "pointer",
                          padding: 0,
                          textDecoration: "underline",
                        }}
                      >
                        cancel
                      </button>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleNext}
                    style={btnPrimary}
                    disabled={submitting || (step === 1 && !step1Valid) || (step === 2 && !step2Valid)}
                  >
                    Continue
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleSubmit({ skip: false })}
                  style={btnPrimary}
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : "Start using HarchIQ"}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "8px 0",
        borderBottom: `1px solid ${C.border}`,
        gap: "16px",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          fontFamily: C.fontMono,
          color: C.textMuted,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          flexShrink: 0,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "14px",
          color: C.text,
          textAlign: "right",
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}
