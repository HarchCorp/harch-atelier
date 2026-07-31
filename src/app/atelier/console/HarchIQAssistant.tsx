"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { C as TOKENS } from "../../components/tokens";

// ═══════════════════════════════════════════════════════════════
//  HARCHIQ ASSISTANT — Floating GenAI Chat Panel
//
//  The Brandwatch "Search Intelligence GenAI" + Dataminr "LLM
//  briefings" equivalent. A floating panel anchored bottom-right
//  that lets users ask natural-language questions about their
//  real Prisma data (alerts, topics, AI visibility, competitors).
//
//  Backend: POST /api/console/ask → returns { answer, sources, generatedAt }
//
//  Features:
//    • Toggle open/closed via the parent shell (Cmd+J or top-bar button)
//    • Chat interface with persistent message history (localStorage, last 20)
//    • "Thinking..." indicator while waiting for the LLM
//    • Source chips below each AI answer (click to highlight, hover to see type)
//    • Suggested questions on first open (4 prompts)
//    • Clear conversation button (with confirm)
//    • Copy answer button (with toast feedback)
//    • Auto-scroll to bottom on new message
//    • Light theme only, English, C tokens, no emojis
//
//  Layout (per spec):
//    • Fixed panel: bottom 80px, right 24px, 420px wide, max 600px tall
//    • Header: "HarchIQ Assistant" + close
//    • Messages: flex-1, overflow-y auto, 16px padding
//    • User msg: bg #f4f4f5, self-end, max 80%
//    • AI msg:    bg white, border, self-start, max 80%
//    • Input:    border-top, 12px padding, gap 8px, accent send button
// ═══════════════════════════════════════════════════════════════

// ─── DESIGN TOKENS (mirror ConsoleShell's local C extension) ─────
const C = {
  ...TOKENS,
  surface: TOKENS.bg,             // bg-white
  surfaceAlt: TOKENS.bgHover,     // bg-neutral-100
  borderLight: TOKENS.border,     // border-neutral-200
  textPrimary: TOKENS.text,       // text-neutral-950
  textSecondary: TOKENS.textBody, // text-neutral-600
  textFaint: "#a3a3a3",           // neutral-400
};

const FONT = {
  sans: C.fontSans,
  mono: C.fontMono,
};

// Accent — emerald (CTA color from C tokens), stays consistent with
// the Harch primary CTA without competing with the dashboard's per-
// offer accent.
const ACCENT = C.cta; // #10b981 (emerald-500)

// ─── TYPES ────────────────────────────────────────────────────────

interface Source {
  type: "alert" | "topic" | "ai-visibility" | "neighbor";
  id: string;
  title: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  generatedAt?: string;
  error?: boolean;
}

// ─── CONSTANTS ────────────────────────────────────────────────────

const STORAGE_KEY = "harchiq.assistant.history";
const MAX_MESSAGES = 20;

const SUGGESTED_QUESTIONS = [
  "What's my reputation trend this week?",
  "Which sources mention me most negatively?",
  "What are the top 3 threats right now?",
  "How visible am I across AI engines?",
];

// ─── SVG ICONS (inline, no emoji) ─────────────────────────────────

function IconSparkle({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l1.6 4.6L18 9.2l-4.4 1.6L12 15l-1.6-4.2L6 9.2l4.4-1.6z" />
      <path d="M19 14l.7 2 .3 1.3-1.3.3-.7.4-.4-.4-.3-1.3.7-2z" />
      <path d="M5 14l.6 1.8.3 1-1 .2-.6.3-.3-.3-.3-1z" />
    </svg>
  );
}

function IconClose({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconSend({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function IconTrash({ size = 13, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function IconCopy({ size = 13, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function IconCheck({ size = 13, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ─── HELPERS ──────────────────────────────────────────────────────

function newId(): string {
  return `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function loadHistory(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(-MAX_MESSAGES);
  } catch {
    return [];
  }
}

function saveHistory(messages: ChatMessage[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(messages.slice(-MAX_MESSAGES)),
    );
  } catch {
    // localStorage may be unavailable (privacy mode, quota) — ignore.
  }
}

function sourceTypeLabel(t: Source["type"]): string {
  switch (t) {
    case "alert":
      return "Alert";
    case "topic":
      return "Topic";
    case "ai-visibility":
      return "AI engine";
    case "neighbor":
      return "Competitor";
  }
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────

interface HarchIQAssistantProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function HarchIQAssistant({ open, onOpenChange }: HarchIQAssistantProps) {
  // Message history — lazy-loaded from localStorage on first render.
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadHistory());
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs for auto-scroll + textarea autosize.
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Persist history on every change.
  useEffect(() => {
    saveHistory(messages);
  }, [messages]);

  // Auto-scroll to bottom on messages / thinking change.
  useEffect(() => {
    if (!open) return;
    const el = messagesEndRef.current;
    if (el) {
      // Defer to next frame so layout is up to date.
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: "smooth", block: "end" });
      });
    }
  }, [messages, thinking, open]);

  // Focus input when panel opens (and history is empty → show suggestions).
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
    return;
  }, [open]);

  // ESC closes the panel (only when the panel is open and the input
  // is focused or no other element has focus). The shell keeps its
  // own Cmd+J toggle, but ESC inside the panel is the natural close.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onOpenChange(false);
      }
    };
    // Capture-phase so we beat the shell-level handler.
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, onOpenChange]);

  // ─── SEND A QUESTION ───────────────────────────────────────────
  const send = useCallback(
    async (rawQuestion: string) => {
      const question = rawQuestion.trim();
      if (!question || thinking) return;
      if (question.length < 3) return;
      if (question.length > 2000) {
        setError("Question too long (max 2000 characters).");
        return;
      }

      setError(null);
      const userMsg: ChatMessage = {
        id: newId(),
        role: "user",
        content: question,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setThinking(true);

      try {
        const res = await fetch("/api/console/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          const errMsg =
            (data && typeof data === "object" && "error" in data && String((data as { error: unknown }).error)) ||
            `Request failed (${res.status})`;
          const aiMsg: ChatMessage = {
            id: newId(),
            role: "assistant",
            content: `I couldn't process that request. ${errMsg}.`,
            error: true,
            generatedAt: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, aiMsg]);
          return;
        }

        const aiMsg: ChatMessage = {
          id: newId(),
          role: "assistant",
          content: (data as { answer?: string }).answer || "No response generated.",
          sources: Array.isArray((data as { sources?: unknown }).sources)
            ? ((data as { sources: Source[] }).sources)
            : [],
          generatedAt: (data as { generatedAt?: string }).generatedAt,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const aiMsg: ChatMessage = {
          id: newId(),
          role: "assistant",
          content: `Network error while contacting HarchIQ: ${message}`,
          error: true,
          generatedAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } finally {
        setThinking(false);
      }
    },
    [thinking],
  );

  // ─── FORM SUBMIT ───────────────────────────────────────────────
  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      void send(input);
    },
    [input, send],
  );

  // ─── TEXTAREA KEY HANDLING ─────────────────────────────────────
  // Enter sends, Shift+Enter inserts a newline. Stops propagation so
  // the shell's single-key shortcuts don't fire while typing.
  const onInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      e.stopPropagation();
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void send(input);
      }
    },
    [input, send],
  );

  // ─── CLEAR CONVERSATION ────────────────────────────────────────
  const onClear = useCallback(() => {
    if (messages.length === 0) return;
    const ok = window.confirm(
      "Clear the conversation? This removes all messages from this browser.",
    );
    if (!ok) return;
    setMessages([]);
    setError(null);
  }, [messages.length]);

  // ─── COPY ANSWER ───────────────────────────────────────────────
  const onCopy = useCallback(async (msg: ChatMessage) => {
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopiedId(msg.id);
      setTimeout(() => setCopiedId((cur) => (cur === msg.id ? null : cur)), 1500);
    } catch {
      // Clipboard may be unavailable — silently ignore.
    }
  }, []);

  // ─── SUGGESTED QUESTION CLICK ──────────────────────────────────
  const onSuggestion = useCallback(
    (q: string) => {
      void send(q);
    },
    [send],
  );

  // ─── DON'T RENDER WHEN CLOSED ──────────────────────────────────
  // Returning null keeps the DOM light and guarantees focus returns
  // to the underlying dashboard while the panel is hidden.
  if (!open) return null;

  const showSuggestions = messages.length === 0 && !thinking;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="HarchIQ Assistant"
      onMouseDown={(e) => {
        // Click on the backdrop (outer area) closes the panel.
        if (e.target === e.currentTarget) onOpenChange(false);
      }}
      style={{
        position: "fixed",
        bottom: 80,
        right: 24,
        width: "min(420px, calc(100vw - 32px))",
        maxHeight: "min(600px, calc(100vh - 120px))",
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        zIndex: 150,
        display: "flex",
        flexDirection: "column",
        fontFamily: FONT.sans,
        overflow: "hidden",
      }}
    >
      {/* ─── HEADER ─────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding: "12px 14px",
          borderBottom: `1px solid ${C.border}`,
          background: C.surface,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            aria-hidden
            style={{
              width: 24,
              height: 24,
              borderRadius: 4,
              background: ACCENT,
              color: "#ffffff",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <IconSparkle size={13} color="#ffffff" />
          </span>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: C.textPrimary,
                fontFamily: FONT.sans,
              }}
            >
              HarchIQ Assistant
            </span>
            <span
              style={{
                fontSize: 10,
                fontFamily: FONT.mono,
                color: C.textSecondary,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              GenAI · grounded on your data
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {/* Clear button — hidden when empty */}
          {messages.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              aria-label="Clear conversation"
              title="Clear conversation"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 6,
                color: C.textSecondary,
                borderRadius: 4,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "color 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = C.danger;
                e.currentTarget.style.background = C.dangerBg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = C.textSecondary;
                e.currentTarget.style.background = "transparent";
              }}
            >
              <IconTrash size={13} color="currentColor" />
            </button>
          )}

          {/* Close button */}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close HarchIQ Assistant"
            title="Close (Esc)"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 6,
              color: C.textSecondary,
              borderRadius: 4,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "color 0.15s, background 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = C.textPrimary;
              e.currentTarget.style.background = C.surfaceAlt;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = C.textSecondary;
              e.currentTarget.style.background = "transparent";
            }}
          >
            <IconClose size={14} color="currentColor" />
          </button>
        </div>
      </div>

      {/* ─── MESSAGES ───────────────────────────────────────────── */}
      <div
        className="harchiq-messages"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          background: C.surfaceAlt,
          minHeight: 200,
        }}
      >
        {showSuggestions && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              padding: "10px 2px",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: C.textSecondary,
                fontFamily: FONT.sans,
              }}
            >
              Ask HarchIQ anything about your reputation, alerts, competitors or AI visibility. Try:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => onSuggestion(q)}
                  style={{
                    textAlign: "left",
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 6,
                    padding: "8px 10px",
                    fontSize: 12,
                    fontFamily: FONT.sans,
                    color: C.textPrimary,
                    cursor: "pointer",
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = ACCENT;
                    e.currentTarget.style.background = C.surfaceAlt;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = C.border;
                    e.currentTarget.style.background = C.surface;
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            msg={m}
            copied={copiedId === m.id}
            onCopy={onCopy}
          />
        ))}

        {thinking && <ThinkingBubble />}

        {/* Error banner (only shows for non-fatal errors like input too long) */}
        {error && (
          <div
            role="alert"
            style={{
              alignSelf: "center",
              fontSize: 11,
              fontFamily: FONT.mono,
              color: C.warningText,
              background: C.warningBg,
              border: `1px solid ${C.warningBorder}`,
              borderRadius: 4,
              padding: "6px 10px",
              textAlign: "center",
              maxWidth: "90%",
            }}
          >
            {error}
          </div>
        )}

        <div ref={messagesEndRef} aria-hidden style={{ height: 0 }} />
      </div>

      {/* ─── INPUT ──────────────────────────────────────────────── */}
      <form
        onSubmit={onSubmit}
        style={{
          borderTop: `1px solid ${C.border}`,
          padding: 12,
          display: "flex",
          gap: 8,
          alignItems: "flex-end",
          background: C.surface,
          flexShrink: 0,
        }}
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onInputKeyDown}
          placeholder="Ask about your data... (Enter to send, Shift+Enter for newline)"
          rows={1}
          aria-label="Ask HarchIQ a question"
          style={{
            flex: 1,
            resize: "none",
            border: `1px solid ${C.border}`,
            borderRadius: 6,
            padding: "8px 10px",
            fontSize: 13,
            fontFamily: FONT.sans,
            color: C.textPrimary,
            background: C.surface,
            outline: "none",
            maxHeight: 120,
            lineHeight: 1.4,
            transition: "border-color 0.15s, box-shadow 0.15s",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = ACCENT;
            e.currentTarget.style.boxShadow = `0 0 0 2px rgba(16,185,129,0.12)`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = C.border;
            e.currentTarget.style.boxShadow = "none";
          }}
          disabled={thinking}
        />
        <button
          type="submit"
          aria-label="Send question"
          title="Send (Enter)"
          disabled={thinking || input.trim().length < 3}
          style={{
            width: 36,
            height: 36,
            borderRadius: 6,
            border: "none",
            background: thinking || input.trim().length < 3 ? C.textFaint : ACCENT,
            color: "#ffffff",
            cursor: thinking || input.trim().length < 3 ? "not-allowed" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "background 0.15s, opacity 0.15s",
            opacity: thinking ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!thinking && input.trim().length >= 3) {
              e.currentTarget.style.background = C.ctaHover;
            }
          }}
          onMouseLeave={(e) => {
            if (!thinking && input.trim().length >= 3) {
              e.currentTarget.style.background = ACCENT;
            }
          }}
        >
          <IconSend size={14} color="#ffffff" />
        </button>
      </form>

      {/* ─── SCROLLBAR STYLING (scoped) ─────────────────────────── */}
      <style>{`
        .harchiq-messages::-webkit-scrollbar { width: 8px; }
        .harchiq-messages::-webkit-scrollbar-track { background: transparent; }
        .harchiq-messages::-webkit-scrollbar-thumb {
          background: ${C.border};
          border-radius: 4px;
        }
        .harchiq-messages::-webkit-scrollbar-thumb:hover {
          background: ${C.textSecondary};
        }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MESSAGE BUBBLE — renders one user or assistant message
// ═══════════════════════════════════════════════════════════════

function MessageBubble({
  msg,
  copied,
  onCopy,
}: {
  msg: ChatMessage;
  copied: boolean;
  onCopy: (m: ChatMessage) => void;
}) {
  const isUser = msg.role === "user";

  // Convert plain text to paragraphs (preserve newlines).
  const paragraphs = msg.content.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        gap: 6,
        maxWidth: "100%",
      }}
    >
      <div
        style={{
          background: isUser ? "#f4f4f5" : C.surface,
          border: isUser ? "none" : `1px solid ${C.border}`,
          borderRadius: 8,
          padding: "10px 14px",
          maxWidth: "80%",
          fontSize: 13,
          fontFamily: FONT.sans,
          color: msg.error ? C.danger : C.textPrimary,
          lineHeight: 1.5,
          wordBreak: "break-word",
          whiteSpace: "pre-wrap",
          boxShadow: isUser ? "none" : C.shadowSm,
        }}
      >
        {paragraphs.length === 0 ? (
          <span style={{ color: C.textFaint, fontStyle: "italic" }}>(empty)</span>
        ) : (
          paragraphs.map((p, i) => (
            <p key={i} style={{ margin: i > 0 ? "8px 0 0" : 0 }}>
              {p}
            </p>
          ))
        )}

        {/* Sources — only on assistant messages with sources */}
        {!isUser && msg.sources && msg.sources.length > 0 && (
          <div
            style={{
              marginTop: 10,
              paddingTop: 8,
              borderTop: `1px dashed ${C.border}`,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontFamily: FONT.mono,
                color: C.textSecondary,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Sources ({msg.sources.length})
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {msg.sources.map((s, i) => (
                <SourceChip key={`${s.id}-${i}`} source={s} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer row: timestamp + copy (assistant only) */}
      {!isUser && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 10,
            fontFamily: FONT.mono,
            color: C.textFaint,
            maxWidth: "80%",
          }}
        >
          {msg.generatedAt && (
            <span>
              {new Date(msg.generatedAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
          {!msg.error && (
            <button
              type="button"
              onClick={() => onCopy(msg)}
              aria-label="Copy answer"
              title={copied ? "Copied" : "Copy answer"}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
                color: copied ? ACCENT : C.textFaint,
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                fontSize: 10,
                fontFamily: FONT.mono,
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!copied) e.currentTarget.style.color = C.textPrimary;
              }}
              onMouseLeave={(e) => {
                if (!copied) e.currentTarget.style.color = C.textFaint;
              }}
            >
              {copied ? <IconCheck size={11} color="currentColor" /> : <IconCopy size={11} color="currentColor" />}
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SOURCE CHIP — clickable citation below an AI answer
// ═══════════════════════════════════════════════════════════════

function SourceChip({ source }: { source: Source }) {
  // Color per source type — uses C tokens (no hardcoded palette).
  const typeColor = (() => {
    switch (source.type) {
      case "alert":
        return C.danger;
      case "topic":
        return C.accent;
      case "ai-visibility":
        return C.cta;
      case "neighbor":
        return C.warning;
    }
  })();

  return (
    <span
      title={`${sourceTypeLabel(source.type)}: ${source.title}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: C.surfaceAlt,
        border: `1px solid ${C.border}`,
        borderRadius: 4,
        padding: "3px 6px",
        fontSize: 10,
        fontFamily: FONT.mono,
        color: C.textPrimary,
        maxWidth: 180,
        cursor: "default",
        transition: "border-color 0.15s, background 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = typeColor;
        e.currentTarget.style.background = C.surface;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = C.border;
        e.currentTarget.style.background = C.surfaceAlt;
      }}
    >
      <span
        aria-hidden
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: typeColor,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {source.title}
      </span>
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════
//  THINKING BUBBLE — three-dot animation while the LLM is working
// ═══════════════════════════════════════════════════════════════

function ThinkingBubble() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        alignSelf: "flex-start",
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        padding: "10px 14px",
        maxWidth: "80%",
        boxShadow: C.shadowSm,
      }}
      aria-live="polite"
      aria-label="HarchIQ is thinking"
    >
      <span
        style={{
          fontSize: 11,
          fontFamily: FONT.mono,
          color: C.textSecondary,
          letterSpacing: "0.04em",
        }}
      >
        Thinking
      </span>
      <span style={{ display: "inline-flex", gap: 3 }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: ACCENT,
              display: "inline-block",
              animation: `harchiq-bounce 1.2s ${i * 0.18}s ease-in-out infinite`,
            }}
          />
        ))}
      </span>
      <style>{`
        @keyframes harchiq-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-3px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default HarchIQAssistant;
