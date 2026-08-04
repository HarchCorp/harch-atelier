"use client";

import { useState, useRef, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════
//  AI SEARCH ASSISTANT
//
//  Inspired by Meltwater's AI Search Assistant (IMG_1052).
//  The Dircom asks a question in natural language, gets an
//  AI-powered answer grounded in their reputation data.
//
//  Pattern: chat interface with user messages on the right,
//  AI responses on the left with the Harch eye icon.
//  Suggested questions below the input.
// ═══════════════════════════════════════════════════════════════

const C = {
  surface: "#FFFFFF",
  surfaceAlt: "#F4F4F5",
  surfaceDark: "#0A0A0A",
  border: "#E5E5E5",
  borderLight: "#F0F0F0",
  text: "#0A0A0A",
  textSec: "#525252",
  textMuted: "#71717A",
  accent: "#78716c",
  cta: "#10b981",
  ctaBg: "#ecfdf5",
  fontSans: "'Inter', system-ui, sans-serif",
  fontMono: "'Space Mono', monospace",
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const SUGGESTED_QUESTIONS = [
  "What is being said about my brand on Hespress today?",
  "Show me the emerging narratives in Darija this week",
  "Compare my sentiment vs my top 3 competitors",
  "What did ChatGPT say about us in the last 24h?",
];

// Pre-canned responses (in production, these would call the GLM-4 API)
const RESPONSES: Record<string, string> = {
  hespress: "Sur Hespress aujourd'hui, 47 articles vous mentionnent. Le sentiment est majoritairement négatif (-0.18) en raison du narrative 'Frais bancaires excessifs' qui émerge dans les commentaires Darija. 3 articles positifs couvrent votre stratégie digitale. Voir le feed d'alertes pour le détail.",
  darija: "3 narratives émergentes en Darija cette semaine:\n1. 'Frais bancaires excessifs' — momentum RISING, 412 mentions, 65% négatif\n2. 'Service client dégradé' — momentum STABLE, 187 mentions, 58% négatif\n3. 'Digitalisation' — momentum RISING, 134 mentions, 72% POSITIF\nLe narrative #1 a déclenché une alerte CASCADE (Darija → MSA + French).",
  compare: "Votre sentiment vs concurrents (7j):\n• Votre marque: -0.08 (en baisse de 3pts)\n• Concurrent #1: +0.21 (+2pts)\n• Concurrent #2: +0.14 (stable)\n• Concurrent #3: -0.03 (-1pt)\nVous êtes rank #2 sur 4. L'écart se creuse avec le leader sur le sentiment positif.",
  chatgpt: "ChatGPT visibility (24h):\n• Score: 72/100 (stable)\n• Citations: 14 mentions de votre marque dans les réponses ChatGPT\n• Sentiment des citations: +0.34 (positif)\n• Sujets associés: 'banque marocaine', 'attijariwafa', 'digitalisation'\n• Comparé à la semaine dernière: +2pts (amélioration sur les queries 'meilleure banque Maroc').",
};

function getResponse(query: string): string {
  const q = query.toLowerCase();
  if (q.includes("hespress") || q.includes("today") || q.includes("aujourd")) return RESPONSES.hespress;
  if (q.includes("darija") || q.includes("narrative") || q.includes("emerging")) return RESPONSES.darija;
  if (q.includes("compare") || q.includes("competitor") || q.includes("concurrent")) return RESPONSES.compare;
  if (q.includes("chatgpt") || q.includes("ai") || q.includes("llm")) return RESPONSES.chatgpt;
  return "Je peux analyser votre réputation à travers 30+ sources marocaines, 8 moteurs IA, et les commentaires Hespress en Darija. Posez-moi une question sur votre sentiment, vos concurrents, les narratives émergentes, ou ce que les LLMs disent de vous.";
}

export function AISearchAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Bonjour. Je suis HarchIQ, votre assistant d'intelligence réputationnelle. Je peux analyser votre présence à travers 30+ sources marocaines, 8 moteurs IA, et les commentaires Hespress en Darija. Que voulez-vous savoir?",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setThinking(true);

    // Call real GLM-4 via /api/console/ask
    // Falls back to local responses if the API fails
    try {
      const res = await fetch("/api/console/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });
      const data = await res.json();
      const aiContent = data.answer || data.response || getResponse(text);
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: aiContent,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      // Fallback to local responses if GLM-4 is unavailable
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: getResponse(text),
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "12px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "500px",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 20px",
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: C.surface,
        }}
      >
        {/* Harch eye icon */}
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            background: `linear-gradient(135deg, ${C.accent}, ${C.cta})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "16px",
            fontWeight: 700,
          }}
        >
          ◉
        </div>
        <div>
          <div style={{ fontSize: "14px", fontWeight: 700, color: C.text }}>HarchIQ Assistant</div>
          <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted }}>
            Powered by GLM-4 · grounded in your reputation data
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "4px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.cta, animation: "pulse 2s infinite" }} />
          <span style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.cta }}>online</span>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          background: C.surfaceAlt,
        }}
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {thinking && (
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "12px", flexShrink: 0 }}>◉</div>
            <div style={{ display: "flex", gap: "4px", padding: "10px 14px", background: C.surface, borderRadius: "10px", borderTopLeftRadius: "2px" }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: C.textMuted,
                    animation: `pulse 1s infinite ${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Suggested questions */}
      {messages.length <= 1 && (
        <div style={{ padding: "0 20px 8px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {SUGGESTED_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => send(q)}
              style={{
                padding: "6px 12px",
                background: C.ctaBg,
                border: `1px solid ${C.cta}30`,
                borderRadius: "16px",
                fontFamily: C.fontMono,
                fontSize: "11px",
                color: C.cta,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = C.cta; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = C.ctaBg; e.currentTarget.style.color = C.cta; }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div
        style={{
          padding: "12px 20px",
          borderTop: `1px solid ${C.border}`,
          display: "flex",
          gap: "8px",
          background: C.surface,
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Ask HarchIQ anything about your reputation..."
          style={{
            flex: 1,
            padding: "10px 14px",
            border: `1px solid ${C.border}`,
            borderRadius: "8px",
            fontFamily: C.fontSans,
            fontSize: "14px",
            color: C.text,
            background: C.surfaceAlt,
            outline: "none",
          }}
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || thinking}
          style={{
            padding: "10px 18px",
            background: input.trim() && !thinking ? C.cta : C.border,
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontFamily: C.fontSans,
            fontSize: "14px",
            fontWeight: 600,
            cursor: input.trim() && !thinking ? "pointer" : "not-allowed",
          }}
        >
          {thinking ? "..." : "→"}
        </button>
      </div>

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", flexDirection: isUser ? "row-reverse" : "row" }}>
      {/* Avatar */}
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "6px",
          background: isUser ? C.text : `linear-gradient(135deg, ${C.accent}, ${C.cta})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: "12px",
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {isUser ? "D" : "◉"}
      </div>

      {/* Bubble */}
      <div
        style={{
          maxWidth: "75%",
          padding: "10px 14px",
          background: isUser ? C.text : C.surface,
          color: isUser ? "#fff" : C.text,
          borderRadius: "10px",
          borderTopLeftRadius: isUser ? "10px" : "2px",
          borderTopRightRadius: isUser ? "2px" : "10px",
          fontSize: "13px",
          lineHeight: 1.55,
          fontFamily: C.fontSans,
          whiteSpace: "pre-wrap",
          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        }}
      >
        {message.content}
      </div>
    </div>
  );
}
