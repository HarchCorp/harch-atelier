"use client";

// ═══════════════════════════════════════════════════════════════
//  Skill 31 — HarchIQ Darija Translator (popup)
//
//  Translates Hespress comments from Darija (Moroccan Arabic +
//  French mixed) into professional French.
//
//  Layout:
//    Header bar    →  Languages icon + title + PDF + close
//    Input zone    →  textarea + "Traduire" button + examples
//    Result zone   →  language badge + confidence meter
//                      + side-by-side original / translated panels
//                      + detected words (Darija → French chips)
//                      + copy translated button
//
//  Design system: white #FFFFFF, sage #4A7B5F, charcoal #0A0A0A,
//  Space Mono headers, Inter body, Lucide icons, French, no emojis.
//  Same popup pattern as BriefingGenerator.
//
//  Task ID: SKILL-31-DARIJA
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Download, Loader2, AlertTriangle,
  Languages, Copy, Check, ArrowRight,
  Tag, RefreshCw, Gauge, FileText,
} from "lucide-react";

// ─── Design tokens (NON-NEGOTIABLE) ────────────────────────────
const WHITE = "#FFFFFF";
const SAGE = "#4A7B5F";
const SAGE_BG = "rgba(74,123,95,0.08)";
const SAGE_BORDER = "rgba(74,123,95,0.2)";
const CHARCOAL = "#0A0A0A";
const TEXT_BODY = "#525252";
const TEXT_MUTED = "#71717A";
const BORDER = "#F0F0F0";
const BG_SUBTLE = "#FAFAFA";
const AMBER = "#F59E0B";
const NEGATIVE = "#EF4444";

// ─── Types (mirror route.ts) ───────────────────────────────────
type DarijaLanguage = "darija" | "arabic" | "french" | "mixed";

interface DetectedWord {
  darija: string;
  french: string;
}

interface DarijaTranslateResponse {
  original: string;
  translated: string;
  language: DarijaLanguage;
  confidence: number;
  detectedWords: DetectedWord[];
  enhancedByLLM: boolean;
}

// ─── Example snippets (realistic Hespress comments) ───────────
const EXAMPLES: string[] = [
  "bghit n3raf 3lach l7okouma mabghatch tla9i 7al l mochkil dyal batala f lmaghrib",
  "wach sahi7 had l5bar ? 3andi l7iss bli maghaditch yban ljam3a o intikhabat",
  "chokran 3la lhadra, mezian bzaf. lmaghrib bayna kanmchiw l7asan inchallah",
  "had l wazir jdid, khassou ykhdem bzaf bach yla9i 7al l9adiya dyal t3lim",
];

const LANGUAGE_LABELS: Record<DarijaLanguage, string> = {
  darija: "Darija",
  arabic: "Arabe",
  french: "Français",
  mixed: "Mixte (Darija + Français)",
};

const LANGUAGE_COLORS: Record<DarijaLanguage, string> = {
  darija: SAGE,
  arabic: "#7C3AED",
  french: "#3B82F6",
  mixed: AMBER,
};

// ─── Confidence label + color ─────────────────────────────────
function confidenceMeta(c: number): { label: string; color: string } {
  if (c >= 0.85) return { label: "Élevée", color: SAGE };
  if (c >= 0.6) return { label: "Moyenne", color: AMBER };
  return { label: "Faible", color: NEGATIVE };
}

export function DarijaTranslatorGenerator({ onClose }: { onClose: () => void }) {
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DarijaTranslateResponse | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const translate = useCallback(async () => {
    const text = input.trim();
    if (!text) {
      setError("Veuillez saisir un texte à traduire.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    setCopied(false);
    try {
      const res = await fetch("/api/console/darija-translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody?.error ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as DarijaTranslateResponse;
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de la traduction");
    } finally {
      setLoading(false);
    }
  }, [input]);

  const copyTranslated = useCallback(async () => {
    if (!result?.translated) return;
    try {
      await navigator.clipboard.writeText(result.translated);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for non-secure contexts
      const ta = document.createElement("textarea");
      ta.value = result.translated;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* noop */ }
      document.body.removeChild(ta);
    }
  }, [result]);

  const reset = useCallback(() => {
    setInput("");
    setResult(null);
    setError(null);
    setCopied(false);
  }, []);

  const conf = result ? confidenceMeta(result.confidence) : null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(10,10,10,0.6)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          width: "100%", maxWidth: 920, maxHeight: "92vh",
          background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Header bar ─────────────────────────────────── */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px", borderBottom: `1px solid ${BORDER}`, background: BG_SUBTLE,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Languages size={18} style={{ color: SAGE }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL }}>
              Traducteur Darija
            </span>
            <span style={{ fontSize: 11, color: TEXT_MUTED, fontFamily: "'Space Mono', monospace" }}>
              Darija → Français
            </span>
            {loading && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: SAGE, fontFamily: "'Space Mono', monospace" }}>
                <Loader2 size={11} className="animate-spin" /> Traduction...
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => window.print()}
              disabled={!result}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
                background: !result ? BORDER : CHARCOAL, color: !result ? TEXT_MUTED : WHITE,
                border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600,
                cursor: !result ? "not-allowed" : "pointer", fontFamily: "inherit",
              }}
            >
              <Download size={13} /> PDF
            </button>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                background: "transparent", border: "none", cursor: "pointer", color: TEXT_MUTED,
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ─── Body ───────────────────────────────────────── */}
        <div
          id="darija-document"
          style={{
            flex: 1, overflowY: "auto", padding: "24px 28px",
            fontFamily: "'Inter', system-ui, sans-serif", color: CHARCOAL,
          }}
        >
          {/* Input zone */}
          <div style={{ marginBottom: 20 }}>
            <label
              htmlFor="darija-input"
              style={{
                display: "block", fontSize: 10, fontFamily: "'Space Mono', monospace",
                color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8,
              }}
            >
              Commentaire à traduire
            </label>
            <textarea
              id="darija-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Collez ici un commentaire Hespress en darija (script arabe ou arabe latin/arabizi)..."
              rows={4}
              style={{
                width: "100%", padding: "12px 14px", background: WHITE, color: CHARCOAL,
                border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 14, lineHeight: 1.5,
                fontFamily: "'Inter', system-ui, sans-serif", resize: "vertical", outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = SAGE; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = BORDER; }}
              maxLength={5000}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {EXAMPLES.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(ex)}
                    style={{
                      padding: "4px 8px", background: SAGE_BG, color: SAGE,
                      border: `1px solid ${SAGE_BORDER}`, borderRadius: 4,
                      fontSize: 11, fontFamily: "'Space Mono', monospace", cursor: "pointer",
                    }}
                    title="Charger cet exemple"
                  >
                    Exemple {i + 1}
                  </button>
                ))}
              </div>
              <span style={{ fontSize: 11, color: TEXT_MUTED, fontFamily: "'Space Mono', monospace" }}>
                {input.length}/5000
              </span>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                onClick={translate}
                disabled={loading || !input.trim()}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "10px 20px",
                  background: loading || !input.trim() ? BORDER : CHARCOAL,
                  color: loading || !input.trim() ? TEXT_MUTED : WHITE,
                  border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600,
                  cursor: loading || !input.trim() ? "not-allowed" : "pointer", fontFamily: "inherit",
                }}
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Languages size={14} />}
                Traduire
              </button>
              {(result || input) && (
                <button
                  onClick={reset}
                  style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "10px 16px",
                    background: "transparent", color: TEXT_BODY, border: `1px solid ${BORDER}`,
                    borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  <RefreshCw size={14} /> Réinitialiser
                </button>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginBottom: 16, padding: 16, background: "rgba(239,68,68,0.06)",
                borderRadius: 8, border: "1px solid rgba(239,68,68,0.2)",
                display: "flex", alignItems: "center", gap: 10,
              }}
            >
              <AlertTriangle size={18} style={{ color: NEGATIVE, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: NEGATIVE }}>{error}</span>
            </motion.div>
          )}

          {/* Result */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {/* Language badge + confidence meter */}
                <div
                  style={{
                    display: "flex", alignItems: "center", gap: 12, marginBottom: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    style={{
                      display: "flex", alignItems: "center", gap: 6, padding: "5px 10px",
                      background: `${LANGUAGE_COLORS[result.language]}14`,
                      border: `1px solid ${LANGUAGE_COLORS[result.language]}33`,
                      borderRadius: 4,
                    }}
                  >
                    <Tag size={12} style={{ color: LANGUAGE_COLORS[result.language] }} />
                    <span style={{
                      fontSize: 12, fontWeight: 600, color: LANGUAGE_COLORS[result.language],
                      fontFamily: "'Space Mono', monospace",
                    }}>
                      {LANGUAGE_LABELS[result.language]}
                    </span>
                  </div>
                  {result.enhancedByLLM && (
                    <span style={{
                      fontSize: 10, color: SAGE, fontFamily: "'Space Mono', monospace",
                      padding: "3px 8px", background: SAGE_BG, borderRadius: 4, border: `1px solid ${SAGE_BORDER}`,
                    }}>
                      GLM-4 actif
                    </span>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
                    <Gauge size={14} style={{ color: TEXT_MUTED }} />
                    <span style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Confiance
                    </span>
                    <div style={{
                      width: 120, height: 6, background: BORDER, borderRadius: 3, overflow: "hidden",
                    }}>
                      <div style={{
                        width: `${Math.round(result.confidence * 100)}%`, height: "100%",
                        background: conf?.color, transition: "width 0.4s ease",
                      }} />
                    </div>
                    <span style={{
                      fontSize: 12, fontFamily: "'Space Mono', monospace", fontWeight: 700,
                      color: conf?.color,
                    }}>
                      {Math.round(result.confidence * 100)}%
                    </span>
                    <span style={{
                      fontSize: 10, color: conf?.color, fontFamily: "'Space Mono', monospace",
                    }}>
                      ({conf?.label})
                    </span>
                  </div>
                </div>

                {/* Side-by-side original / translated */}
                <div
                  style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16,
                  }}
                >
                  {/* Original */}
                  <div style={{
                    padding: 16, background: BG_SUBTLE, borderRadius: 8,
                    border: `1px solid ${BORDER}`, display: "flex", flexDirection: "column",
                  }}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 6, marginBottom: 10,
                    }}>
                      <FileText size={12} style={{ color: TEXT_MUTED }} />
                      <span style={{
                        fontSize: 10, fontFamily: "'Space Mono', monospace", color: TEXT_MUTED,
                        textTransform: "uppercase", letterSpacing: "0.1em",
                      }}>
                        Original
                      </span>
                    </div>
                    <p style={{
                      fontSize: 14, lineHeight: 1.6, color: CHARCOAL, margin: 0,
                      whiteSpace: "pre-wrap", wordBreak: "break-word",
                      direction: /[\u0600-\u06FF]/.test(result.original) ? "rtl" : "ltr",
                    }}>
                      {result.original}
                    </p>
                  </div>

                  {/* Translated */}
                  <div style={{
                    padding: 16, background: SAGE_BG, borderRadius: 8,
                    border: `1px solid ${SAGE_BORDER}`, display: "flex", flexDirection: "column",
                  }}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 6, marginBottom: 10,
                    }}>
                      <Languages size={12} style={{ color: SAGE }} />
                      <span style={{
                        fontSize: 10, fontFamily: "'Space Mono', monospace", color: SAGE,
                        textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700,
                      }}>
                        Français
                      </span>
                      <button
                        onClick={copyTranslated}
                        title="Copier la traduction"
                        style={{
                          marginLeft: "auto", display: "flex", alignItems: "center", gap: 4,
                          padding: "3px 8px", background: copied ? SAGE : "transparent",
                          color: copied ? WHITE : SAGE, border: `1px solid ${SAGE_BORDER}`,
                          borderRadius: 4, fontSize: 11, fontFamily: "'Space Mono', monospace",
                          cursor: "pointer", fontWeight: 600,
                        }}
                      >
                        {copied ? <Check size={11} /> : <Copy size={11} />}
                        {copied ? "Copié" : "Copier"}
                      </button>
                    </div>
                    <p style={{
                      fontSize: 14, lineHeight: 1.6, color: CHARCOAL, margin: 0,
                      whiteSpace: "pre-wrap", wordBreak: "break-word",
                    }}>
                      {result.translated}
                    </p>
                  </div>
                </div>

                {/* Detected words list */}
                <div style={{
                  padding: 16, background: BG_SUBTLE, borderRadius: 8, border: `1px solid ${BORDER}`,
                }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 6, marginBottom: 12,
                  }}>
                    <Tag size={12} style={{ color: SAGE }} />
                    <span style={{
                      fontSize: 10, fontFamily: "'Space Mono', monospace", color: SAGE,
                      textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700,
                    }}>
                      Mots darija détectés
                    </span>
                    <span style={{
                      fontSize: 11, color: TEXT_MUTED, fontFamily: "'Space Mono', monospace",
                    }}>
                      ({result.detectedWords.length})
                    </span>
                  </div>
                  {result.detectedWords.length === 0 ? (
                    <p style={{
                      fontSize: 13, color: TEXT_MUTED, fontStyle: "italic", margin: 0,
                    }}>
                      Aucun mot darija reconnu par le lexique — la traduction repose
                      entièrement sur le modèle GLM-4.
                    </p>
                  ) : (
                    <div style={{
                      display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                      gap: 8,
                    }}>
                      {result.detectedWords.map((w, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex", alignItems: "center", gap: 8, padding: "8px 10px",
                            background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 6,
                          }}
                        >
                          <span style={{
                            fontSize: 13, fontWeight: 600, color: CHARCOAL,
                            fontFamily: "'Space Mono', monospace",
                            direction: /[\u0600-\u06FF]/.test(w.darija) ? "rtl" : "ltr",
                          }}>
                            {w.darija}
                          </span>
                          <ArrowRight size={12} style={{ color: SAGE, flexShrink: 0 }} />
                          <span style={{ fontSize: 13, color: TEXT_BODY }}>
                            {w.french}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer actions */}
                <div style={{
                  display: "flex", gap: 8, paddingTop: 16, marginTop: 16,
                  borderTop: `1px solid ${BORDER}`,
                }}>
                  <button
                    onClick={copyTranslated}
                    style={{
                      display: "flex", alignItems: "center", gap: 6, padding: "10px 20px",
                      background: CHARCOAL, color: WHITE, border: "none", borderRadius: 8,
                      fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? "Copié" : "Copier la traduction"}
                  </button>
                  <button
                    onClick={() => window.print()}
                    style={{
                      display: "flex", alignItems: "center", gap: 6, padding: "10px 20px",
                      background: "transparent", color: CHARCOAL, border: `1px solid ${BORDER}`,
                      borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <Download size={14} /> Exporter PDF
                  </button>
                  <button
                    onClick={translate}
                    disabled={loading}
                    style={{
                      display: "flex", alignItems: "center", gap: 6, padding: "10px 16px",
                      background: "transparent", color: TEXT_BODY, border: `1px solid ${BORDER}`,
                      borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                      fontFamily: "inherit", marginLeft: "auto",
                    }}
                  >
                    <RefreshCw size={14} /> Retraduire
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state hint */}
          {!result && !error && !loading && (
            <div style={{
              textAlign: "center", padding: "40px 20px", color: TEXT_MUTED,
            }}>
              <Languages size={32} style={{ color: BORDER, marginBottom: 8 }} />
              <p style={{ fontSize: 13, margin: 0 }}>
                Saisissez un commentaire Hespress en darija puis cliquez sur « Traduire ».
              </p>
              <p style={{ fontSize: 11, margin: "4px 0 0", fontFamily: "'Space Mono', monospace" }}>
                Le lexique couvre 130+ mots — GLM-4 affine si ZAI_API_KEY est configuré.
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Print styles — only the #darija-document shows when printing */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        @media print {
          body * { visibility: hidden; }
          #darija-document, #darija-document * { visibility: visible; }
          #darija-document {
            position: absolute; left: 0; top: 0; width: 100%;
            padding: 32px; max-height: none; overflow: visible;
          }
          button { display: none !important; }
        }
      `}</style>
    </div>
  );
}
