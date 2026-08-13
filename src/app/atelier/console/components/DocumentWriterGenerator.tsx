"use client";

// ═══════════════════════════════════════════════════════════════
//  DocumentWriterGenerator — Skill 6: HarchIQ Document Writer
//
//  THE KILLER FEATURE. The user types a free-form French request
//  and a document WRITES ITSELF in front of them — paragraph by
//  paragraph, character by character. Like watching a document
//  being typed live. NOT chat. A live document.
//
//  Pipeline:
//    1. User types prompt (or clicks an example chip)
//    2. POST /api/console/document-writer
//    3. API returns the full sections array (generated all at once)
//    4. Client queues the sections + types each paragraph char by
//       char (setInterval 20ms = ~50 chars/sec)
//    5. Blinking cursor follows the typing head
//    6. When done: "Document terminé" + Export PDF + Copy + Régénérer
//
//  Design system (non-negotiable):
//    • White #FFFFFF bg, sage #4A7B5F accents, charcoal #0A0A0A text
//    • Space Mono headers, Inter body, Lucide icons, NO emojis, French
//    • Same popup pattern as BriefingGenerator
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useRef, type ReactNode, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Download, Loader2, AlertTriangle, RefreshCw,
  FileText, Send, Check, Copy, SkipForward, Sparkles,
} from "lucide-react";

// ─── DESIGN TOKENS ───────────────────────────────────────────────
const SAGE = "#4A7B5F";
const SAGE_BG = "rgba(74,123,95,0.08)";
const SAGE_BORDER = "rgba(74,123,95,0.20)";
const CHARCOAL = "#0A0A0A";
const WHITE = "#FFFFFF";
const TEXT_BODY = "#525252";
const TEXT_MUTED = "#71717A";
const BORDER = "#F0F0F0";
const POSITIVE = "#10B981";
const NEGATIVE = "#EF4444";
const AMBER = "#F59E0B";
const SPACE_MONO = "'Space Mono', ui-monospace, monospace";
const INTER = "'Inter', system-ui, -apple-system, sans-serif";

// Typing cadence: 20ms per character = ~50 chars/sec
const TYPE_INTERVAL_MS = 20;
// Brief pause between paragraphs (one tick gap)
const PARAGRAPH_PAUSE_MS = 220;
// Brief pause between sections
const SECTION_PAUSE_MS = 380;

// ─── EXAMPLE CHIPS ───────────────────────────────────────────────
const EXAMPLE_CHIPS = [
  "Analyse vs concurrents",
  "Brief COMEX",
  "Résumé semaine",
  "Veille crise",
];

// ─── TYPES (mirrors API response) ────────────────────────────────
type SectionType = "heading" | "body" | "data" | "recommendation";

interface Metric {
  label: string;
  value: string;
  trend?: string;
  sentiment?: "positive" | "negative" | "neutral";
}

interface Section {
  title: string;
  type: SectionType;
  paragraphs: string[];
  metrics?: Metric[];
}

interface DocMeta {
  companyName: string;
  sector: string | null;
  generatedAt: string;
  date: string;
  prompt: string;
  mode: string;
  enhancedByLLM: boolean;
}

interface DocResponse {
  meta: DocMeta;
  sections: Section[];
}

// ─── COMPONENT ───────────────────────────────────────────────────

export function DocumentWriterGenerator({ onClose }: { onClose: () => void }) {
  const [prompt, setPrompt] = useState("");
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [doc, setDoc] = useState<DocResponse | null>(null);
  // revealed[s][p] = number of characters typed in that paragraph
  const [revealed, setRevealed] = useState<number[][]>([]);
  // Which paragraph is currently being typed (for cursor render)
  const [cursor, setCursor] = useState<{ s: number; p: number } | null>(null);
  const [typing, setTyping] = useState(false);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef<{ s: number; p: number }>({ s: 0, p: 0 });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Submit handler ───────────────────────────────────────────
  const generate = useCallback(async (promptText: string) => {
    if (!promptText.trim() || fetching) return;
    setFetching(true);
    setError(null);
    setDoc(null);
    setRevealed([]);
    setCursor(null);
    setTyping(false);
    setDone(false);
    setCopied(false);

    try {
      const res = await fetch("/api/console/document-writer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText.trim() }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as DocResponse;
      if (!data?.sections || data.sections.length === 0) {
        throw new Error("Réponse vide du moteur");
      }
      setDoc(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec");
    } finally {
      setFetching(false);
    }
  }, [fetching]);

  // ─── Typing engine: starts when `doc` is set ─────────────────
  useEffect(() => {
    if (!doc || doc.sections.length === 0) return;

    // Initialize revealed grid: 0 chars per paragraph
    const init = doc.sections.map((s) => s.paragraphs.map(() => 0));
    setRevealed(init);
    cursorRef.current = { s: 0, p: 0 };
    setCursor({ s: 0, p: 0 });
    setTyping(true);
    setDone(false);

    // Helper to advance to next paragraph / section
    const advance = (s: number, p: number): { s: number; p: number } | null => {
      const section = doc.sections[s];
      if (!section) return null;
      if (p + 1 < section.paragraphs.length) {
        return { s, p: p + 1 };
      }
      if (s + 1 < doc.sections.length) {
        return { s: s + 1, p: 0 };
      }
      return null; // all done
    };

    let pauseUntil = 0; // when to resume typing (timestamp)

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      if (now < pauseUntil) return;

      const { s, p } = cursorRef.current;
      const section = doc.sections[s];
      if (!section) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setCursor(null);
        setTyping(false);
        setDone(true);
        return;
      }
      const para = section.paragraphs[p];

      // Defensive: empty paragraph → skip
      if (para === undefined || para.length === 0) {
        const next = advance(s, p);
        if (!next) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setCursor(null);
          setTyping(false);
          setDone(true);
          return;
        }
        cursorRef.current = next;
        setCursor(next);
        pauseUntil = now + SECTION_PAUSE_MS;
        return;
      }

      setRevealed((prev) => {
        if (!prev[s] || prev[s][p] === undefined) return prev;
        const current = prev[s][p];
        if (current < para.length) {
          const next = prev.map((row) => [...row]);
          next[s][p] = current + 1;
          return next;
        }
        // Paragraph finished — advance cursor
        const nextPos = advance(s, p);
        if (!nextPos) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setCursor(null);
          setTyping(false);
          setDone(true);
          return prev;
        }
        cursorRef.current = nextPos;
        setCursor(nextPos);
        // Insert a small pause depending on whether we crossed a section
        pauseUntil = now + (nextPos.s !== s ? SECTION_PAUSE_MS : PARAGRAPH_PAUSE_MS);
        return prev;
      });
    }, TYPE_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc]);

  // ─── Auto-scroll to bottom while typing ──────────────────────
  useEffect(() => {
    if (!typing || !scrollRef.current) return;
    const el = scrollRef.current;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [revealed, typing]);

  // ─── Skip animation: reveal all characters instantly ─────────
  const skipAnimation = useCallback(() => {
    if (!doc) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    const full = doc.sections.map((s) => s.paragraphs.map((p) => p.length));
    setRevealed(full);
    setCursor(null);
    setTyping(false);
    setDone(true);
  }, [doc]);

  // ─── Copy document as plain text ─────────────────────────────
  const copyDocument = useCallback(async () => {
    if (!doc) return;
    const text = buildPlainText(doc);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard might be unavailable
    }
  }, [doc]);

  // ─── Render ──────────────────────────────────────────────────
  const showDocument = doc !== null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(10,10,10,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          width: "100%",
          maxWidth: 720,
          maxHeight: "90vh",
          background: WHITE,
          borderRadius: 12,
          border: `1px solid ${BORDER}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── HEADER BAR ─────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: `1px solid ${BORDER}`,
            background: "#FAFAFA",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <FileText size={18} style={{ color: SAGE }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL, fontFamily: INTER }}>
              Document Writer
            </span>
            {fetching && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: SAGE, fontFamily: SPACE_MONO }}>
                <Loader2 size={11} className="animate-spin" /> Analyse...
              </span>
            )}
            {typing && !fetching && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: SAGE, fontFamily: SPACE_MONO }}>
                <Sparkles size={11} /> Rédaction en cours...
              </span>
            )}
            {done && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: SAGE, fontFamily: SPACE_MONO }}>
                <Check size={11} /> Document terminé
                {doc?.meta.enhancedByLLM && (
                  <span style={{ marginLeft: 6, padding: "1px 6px", background: SAGE_BG, borderRadius: 3, fontSize: 9, letterSpacing: "0.05em" }}>
                    GLM-4
                  </span>
                )}
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {typing && (
              <button
                onClick={skipAnimation}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  background: "transparent",
                  color: TEXT_MUTED,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: INTER,
                }}
              >
                <SkipForward size={13} /> Passer
              </button>
            )}
            {done && (
              <>
                <button
                  onClick={copyDocument}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    background: "transparent",
                    color: TEXT_BODY,
                    border: `1px solid ${BORDER}`,
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: INTER,
                  }}
                >
                  {copied ? <Check size={13} style={{ color: SAGE }} /> : <Copy size={13} />}
                  {copied ? "Copié" : "Copier"}
                </button>
                <button
                  onClick={() => window.print()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    background: CHARCOAL,
                    color: WHITE,
                    border: "none",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: INTER,
                  }}
                >
                  <Download size={13} /> PDF
                </button>
              </>
            )}
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: TEXT_MUTED,
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ─── INPUT BAR (visible when no doc yet) ──────────────── */}
        {!showDocument && (
          <div
            style={{
              padding: "20px 24px",
              borderBottom: `1px solid ${BORDER}`,
              background: WHITE,
              flexShrink: 0,
            }}
          >
            <label
              style={{
                display: "block",
                fontSize: 10,
                fontFamily: SPACE_MONO,
                color: TEXT_MUTED,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 8,
              }}
            >
              Que voulez-vous ?
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void generate(prompt);
                  }
                }}
                placeholder="Ex. Analyse ma réputation vs Marjane"
                disabled={fetching}
                style={{
                  flex: 1,
                  padding: "12px 14px",
                  fontSize: 14,
                  fontFamily: INTER,
                  color: CHARCOAL,
                  background: WHITE,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 8,
                  outline: "none",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = SAGE;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = BORDER;
                }}
              />
              <button
                onClick={() => void generate(prompt)}
                disabled={!prompt.trim() || fetching}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "12px 18px",
                  background: !prompt.trim() || fetching ? BORDER : SAGE,
                  color: !prompt.trim() || fetching ? TEXT_MUTED : WHITE,
                  border: "none",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: !prompt.trim() || fetching ? "not-allowed" : "pointer",
                  fontFamily: INTER,
                }}
              >
                {fetching ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {fetching ? "..." : "Générer"}
              </button>
            </div>
            {/* Example chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
              {EXAMPLE_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => {
                    setPrompt(chip);
                    void generate(chip);
                  }}
                  disabled={fetching}
                  style={{
                    padding: "5px 10px",
                    background: SAGE_BG,
                    color: SAGE,
                    border: `1px solid ${SAGE_BORDER}`,
                    borderRadius: 4,
                    fontSize: 11,
                    fontFamily: INTER,
                    cursor: fetching ? "not-allowed" : "pointer",
                    opacity: fetching ? 0.5 : 1,
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── DOCUMENT BODY ──────────────────────────────────── */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: showDocument ? "32px 40px" : "40px 24px",
            fontFamily: INTER,
            color: CHARCOAL,
            background: WHITE,
          }}
        >
          {/* Idle state */}
          {!showDocument && !fetching && !error && (
            <IdleState />
          )}

          {/* Fetching state */}
          {fetching && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <Loader2 size={32} style={{ color: SAGE, animation: "spin 1s linear infinite" }} />
              <p style={{ marginTop: 16, fontSize: 14, color: TEXT_MUTED }}>
                Collecte des données et génération du document...
              </p>
              <p style={{ marginTop: 4, fontSize: 11, color: TEXT_MUTED, fontFamily: SPACE_MONO }}>
                Brand health · Sentiment · Sources · Concurrents
              </p>
            </div>
          )}

          {/* Error state */}
          {error && !showDocument && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <AlertTriangle size={32} style={{ color: NEGATIVE }} />
              <p style={{ marginTop: 12, fontSize: 14, color: NEGATIVE }}>{error}</p>
              <button
                onClick={() => void generate(prompt)}
                style={{
                  marginTop: 16,
                  padding: "8px 16px",
                  background: CHARCOAL,
                  color: WHITE,
                  border: "none",
                  borderRadius: 6,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: INTER,
                }}
              >
                Réessayer
              </button>
            </div>
          )}

          {/* Document — the live-writing surface */}
          {showDocument && doc && (
            <div id="document-writer-document">
              <AnimatePresence>
                {doc.sections.map((section, sIdx) => {
                  // Section is visible if any of its paragraphs has been
                  // started OR the typing cursor is currently on it.
                  const sectionStarted =
                    (revealed[sIdx]?.some((c) => c > 0) ?? false) ||
                    (cursor?.s ?? -1) === sIdx;
                  if (!sectionStarted) return null;

                  return (
                    <motion.div
                      key={`sec-${sIdx}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{ marginBottom: sIdx === doc.sections.length - 1 ? 0 : 28 }}
                    >
                      <SectionRender
                        section={section}
                        sIdx={sIdx}
                        revealed={revealed[sIdx] ?? []}
                        cursor={cursor}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Footer actions when done */}
              {done && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: "flex",
                    gap: 8,
                    paddingTop: 20,
                    marginTop: 24,
                    borderTop: `1px solid ${BORDER}`,
                  }}
                >
                  <button
                    onClick={() => window.print()}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "10px 20px",
                      background: CHARCOAL,
                      color: WHITE,
                      border: "none",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: INTER,
                    }}
                  >
                    <Download size={14} /> Exporter PDF
                  </button>
                  <button
                    onClick={copyDocument}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "10px 16px",
                      background: "transparent",
                      color: TEXT_BODY,
                      border: `1px solid ${BORDER}`,
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: INTER,
                    }}
                  >
                    {copied ? <Check size={14} style={{ color: SAGE }} /> : <Copy size={14} />}
                    {copied ? "Copié" : "Copier le texte"}
                  </button>
                  <button
                    onClick={() => {
                      setDoc(null);
                      setRevealed([]);
                      setCursor(null);
                      setDone(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "10px 16px",
                      background: "transparent",
                      color: TEXT_BODY,
                      border: `1px solid ${BORDER}`,
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: INTER,
                      marginLeft: "auto",
                    }}
                  >
                    <RefreshCw size={14} /> Régénérer
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* ─── Print styles + cursor blink keyframes ─────────── */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blink-cursor { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @media print {
          body * { visibility: hidden; }
          #document-writer-document, #document-writer-document * { visibility: visible; }
          #document-writer-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 40px;
          }
        }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  IDLE STATE — pre-generation hero
// ═══════════════════════════════════════════════════════════════

function IdleState() {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px" }}>
      <div
        style={{
          width: 56,
          height: 56,
          margin: "0 auto 20px",
          borderRadius: "50%",
          background: SAGE_BG,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FileText size={28} style={{ color: SAGE }} />
      </div>
      <h3
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: CHARCOAL,
          margin: 0,
          fontFamily: INTER,
          letterSpacing: "-0.01em",
        }}
      >
        Décrivez le document dont vous avez besoin
      </h3>
      <p
        style={{
          fontSize: 13,
          color: TEXT_MUTED,
          marginTop: 8,
          maxWidth: 380,
          marginLeft: "auto",
          marginRight: "auto",
          lineHeight: 1.6,
        }}
      >
        Le moteur HarchIQ collecte vos données réelles — réputation,
        sentiment, sources, concurrents — et rédige un document
        structuré qui s'affichera paragraphe par paragraphe, en temps réel.
      </p>
      <div
        style={{
          marginTop: 20,
          display: "flex",
          justifyContent: "center",
          gap: 16,
          fontSize: 11,
          color: TEXT_MUTED,
          fontFamily: SPACE_MONO,
        }}
      >
        <span>4-6 sections</span>
        <span style={{ color: BORDER }}>·</span>
        <span>Données réelles</span>
        <span style={{ color: BORDER }}>·</span>
        <span>Rédaction live</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SECTION RENDER — renders one section based on type & typing state
// ═══════════════════════════════════════════════════════════════

function SectionRender({
  section,
  sIdx,
  revealed,
  cursor,
}: {
  section: Section;
  sIdx: number;
  revealed: number[];
  cursor: { s: number; p: number } | null;
}) {
  switch (section.type) {
    case "heading":
      return <HeadingSection section={section} revealed={revealed} cursor={cursor} />;
    case "body":
      return (
        <BodySection
          section={section}
          sIdx={sIdx}
          revealed={revealed}
          cursor={cursor}
        />
      );
    case "data":
      return (
        <DataSection
          section={section}
          sIdx={sIdx}
          revealed={revealed}
          cursor={cursor}
        />
      );
    case "recommendation":
      return (
        <RecommendationSection
          section={section}
          sIdx={sIdx}
          revealed={revealed}
          cursor={cursor}
        />
      );
    default:
      return null;
  }
}

// ─── HEADING SECTION (document title) ────────────────────────────

function HeadingSection({
  section,
  revealed,
  cursor,
}: {
  section: Section;
  revealed: number[];
  cursor: { s: number; p: number } | null;
}) {
  return (
    <div style={{ marginBottom: 32, paddingBottom: 20, borderBottom: `2px solid ${SAGE}` }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
        }}
      >
        <Sparkles size={12} style={{ color: SAGE }} />
        <span
          style={{
            fontSize: 10,
            fontFamily: SPACE_MONO,
            color: SAGE,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            fontWeight: 700,
          }}
        >
          Document HarchIQ
        </span>
      </div>
      <h1
        style={{
          fontSize: 26,
          fontWeight: 700,
          margin: 0,
          color: CHARCOAL,
          fontFamily: SPACE_MONO,
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
          minHeight: 32,
        }}
      >
        <TypedText
          text={section.paragraphs[0] ?? ""}
          revealed={revealed[0] ?? 0}
          isCursor={cursor?.s === 0 && cursor?.p === 0}
          style={{ fontSize: 26, fontFamily: SPACE_MONO, fontWeight: 700 }}
        />
      </h1>
      {section.paragraphs[1] && (
        <p
          style={{
            marginTop: 8,
            fontSize: 12,
            color: TEXT_MUTED,
            fontFamily: SPACE_MONO,
            letterSpacing: "0.02em",
            minHeight: 14,
          }}
        >
          <TypedText
            text={section.paragraphs[1]}
            revealed={revealed[1] ?? 0}
            isCursor={cursor?.s === 0 && cursor?.p === 1}
            style={{ fontSize: 12, fontFamily: SPACE_MONO }}
          />
        </p>
      )}
    </div>
  );
}

// ─── BODY SECTION ────────────────────────────────────────────────

function BodySection({
  section,
  sIdx,
  revealed,
  cursor,
}: {
  section: Section;
  sIdx: number;
  revealed: number[];
  cursor: { s: number; p: number } | null;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <SectionLabel>{section.title}</SectionLabel>
      {section.paragraphs.map((para, pIdx) => {
        const isCurrent = cursor?.s === sIdx && cursor?.p === pIdx;
        return (
          <p
            key={`p-${sIdx}-${pIdx}`}
            style={{
              fontSize: 14,
              color: TEXT_BODY,
              lineHeight: 1.7,
              margin: "0 0 12px 0",
              minHeight: 14,
              whiteSpace: "pre-wrap",
            }}
          >
            <TypedText
              text={para}
              revealed={revealed[pIdx] ?? 0}
              isCursor={isCurrent}
              style={{ fontSize: 14, fontFamily: INTER }}
            />
          </p>
        );
      })}
    </div>
  );
}

// ─── DATA SECTION ────────────────────────────────────────────────

function DataSection({
  section,
  sIdx,
  revealed,
  cursor,
}: {
  section: Section;
  sIdx: number;
  revealed: number[];
  cursor: { s: number; p: number } | null;
}) {
  // Render metrics all at once when section starts (no per-char typing
  // for numbers — they appear instantly when the caption starts).
  const sectionStarted = revealed.some((c) => c > 0) || cursor?.s === sIdx;
  return (
    <div
      style={{
        marginBottom: 24,
        padding: 18,
        background: "#FAFAFA",
        borderRadius: 8,
        border: `1px solid ${BORDER}`,
      }}
    >
      <SectionLabel>{section.title}</SectionLabel>

      {/* Metrics grid */}
      {sectionStarted && section.metrics && section.metrics.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 8,
            marginBottom: 14,
          }}
        >
          {section.metrics.map((m, i) => {
            const color =
              m.sentiment === "positive"
                ? POSITIVE
                : m.sentiment === "negative"
                ? NEGATIVE
                : CHARCOAL;
            return (
              <div
                key={`m-${i}`}
                style={{
                  padding: "10px 12px",
                  background: WHITE,
                  borderRadius: 6,
                  border: `1px solid ${BORDER}`,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontFamily: SPACE_MONO,
                    color: TEXT_MUTED,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 4,
                  }}
                >
                  {m.label}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color,
                      fontFamily: SPACE_MONO,
                    }}
                  >
                    {m.value}
                  </span>
                  {m.trend && (
                    <span
                      style={{
                        fontSize: 10,
                        color: TEXT_MUTED,
                        fontFamily: SPACE_MONO,
                      }}
                    >
                      {m.trend}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Caption paragraph — typed char by char */}
      {section.paragraphs.map((para, pIdx) => {
        const isCurrent = cursor?.s === sIdx && cursor?.p === pIdx;
        return (
          <p
            key={`dp-${sIdx}-${pIdx}`}
            style={{
              fontSize: 12,
              color: TEXT_MUTED,
              lineHeight: 1.6,
              margin: 0,
              minHeight: 12,
              whiteSpace: "pre-wrap",
              fontStyle: "italic",
            }}
          >
            <TypedText
              text={para}
              revealed={revealed[pIdx] ?? 0}
              isCursor={isCurrent}
              style={{ fontSize: 12, fontFamily: INTER }}
            />
          </p>
        );
      })}
    </div>
  );
}

// ─── RECOMMENDATION SECTION (sage box) ───────────────────────────

function RecommendationSection({
  section,
  sIdx,
  revealed,
  cursor,
}: {
  section: Section;
  sIdx: number;
  revealed: number[];
  cursor: { s: number; p: number } | null;
}) {
  return (
    <div
      style={{
        marginBottom: 24,
        padding: 18,
        background: SAGE_BG,
        borderRadius: 8,
        border: `1px solid ${SAGE_BORDER}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
        }}
      >
        <Sparkles size={12} style={{ color: SAGE }} />
        <span
          style={{
            fontSize: 10,
            fontFamily: SPACE_MONO,
            color: SAGE,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontWeight: 700,
          }}
        >
          {section.title}
        </span>
      </div>
      {section.paragraphs.map((para, pIdx) => {
        const isCurrent = cursor?.s === sIdx && cursor?.p === pIdx;
        return (
          <p
            key={`r-${sIdx}-${pIdx}`}
            style={{
              fontSize: 13,
              color: CHARCOAL,
              lineHeight: 1.65,
              margin: "0 0 10px 0",
              minHeight: 13,
              whiteSpace: "pre-wrap",
              display: "flex",
              gap: 8,
            }}
          >
            <span style={{ color: SAGE, fontWeight: 700, flexShrink: 0 }}>
              {pIdx + 1}.
            </span>
            <span style={{ flex: 1 }}>
              <TypedText
                text={para}
                revealed={revealed[pIdx] ?? 0}
                isCursor={isCurrent}
                style={{ fontSize: 13, fontFamily: INTER }}
              />
            </span>
          </p>
        );
      })}
    </div>
  );
}

// ─── SHARED LABEL ────────────────────────────────────────────────

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontSize: 10,
        fontFamily: SPACE_MONO,
        color: TEXT_MUTED,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        marginBottom: 10,
        fontWeight: 700,
      }}
    >
      {children}
    </div>
  );
}

// ─── TYPED TEXT (with cursor) ────────────────────────────────────

function TypedText({
  text,
  revealed,
  isCursor,
  style,
}: {
  text: string;
  revealed: number;
  isCursor: boolean;
  style?: CSSProperties;
}) {
  const visible = text.slice(0, Math.max(0, revealed));
  const showCursor = isCursor && revealed < text.length;
  return (
    <>
      <span style={style}>{visible}</span>
      {showCursor && (
        <span
          style={{
            display: "inline-block",
            width: 2,
            height: "1em",
            background: SAGE,
            marginLeft: 1,
            verticalAlign: "text-bottom",
            animation: "blink-cursor 0.8s step-end infinite",
          }}
          aria-hidden
        />
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════

function buildPlainText(doc: DocResponse): string {
  const lines: string[] = [];
  for (const section of doc.sections) {
    if (section.type === "heading") {
      lines.push(`# ${section.title}`);
      if (section.paragraphs[0]) lines.push(section.paragraphs[0]);
      lines.push("");
      lines.push(`Entreprise: ${doc.meta.companyName}`);
      lines.push(`Date: ${doc.meta.date}`);
      lines.push("");
      continue;
    }
    lines.push(`## ${section.title}`);
    lines.push("");
    if (section.metrics && section.metrics.length > 0) {
      for (const m of section.metrics) {
        lines.push(`- ${m.label}: ${m.value}${m.trend ? ` (${m.trend})` : ""}`);
      }
      lines.push("");
    }
    for (const p of section.paragraphs) {
      lines.push(p);
      lines.push("");
    }
  }
  lines.push("---");
  lines.push("Généré par HarchIQ");
  return lines.join("\n");
}
