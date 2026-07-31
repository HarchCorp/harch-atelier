"use client";

// ═══════════════════════════════════════════════════════════════
//  BroadcastMonitor.tsx — TV / radio monitoring placeholder
//
//  Talkwalker-style broadcast module. We CANNOT actually ingest
//  broadcast telemetry (TV / radio closed captions or audio streams)
//  yet. This view is an HONEST shell:
//    • Lists the 9 main Moroccan TV channels and 5 radio stations.
//    • Every channel card carries a "MONITORING OFFLINE" badge and
//      a "Request access" button — NO fake telemetry anywhere.
//    • Clicking a channel opens a modal that explains broadcast
//      monitoring is available in the Enterprise plan and routes
//      the user to sales.
//
//  Light theme. English. No emojis. C tokens only. Zero mock data.
// ═══════════════════════════════════════════════════════════════

import { type CSSProperties, useEffect, useState } from "react";
import { C } from "../../components/tokens";

const FONT = { sans: C.fontSans, mono: C.fontMono };
const ACCENT = "#059669";

interface Channel {
  id: string;
  name: string;
  kind: "tv" | "radio";
  group: string;
  language: string;
  notes: string;
}

const TV_CHANNELS: Channel[] = [
  { id: "2m", name: "2M TV", kind: "tv", group: "SNRT / SOREAD", language: "Arabic / French", notes: "Generalist — largest private Moroccan TV audience." },
  { id: "alaoula", name: "Al Aoula", kind: "tv", group: "SNRT", language: "Arabic", notes: "Public flagship — news, drama, religious." },
  { id: "arryadia", name: "Arryadia", kind: "tv", group: "SNRT", language: "Arabic", notes: "Sports — Botola, CAF, international football." },
  { id: "arrabia", name: "Arrabia", kind: "tv", group: "SNRT", language: "Arabic", notes: "Education and culture." },
  { id: "almaghribia", name: "Al Maghribia", kind: "tv", group: "SNRT", language: "Arabic / Tamazight", notes: "Satellite channel for the Moroccan diaspora." },
  { id: "assadissa", name: "Assadissa", kind: "tv", group: "SNRT", language: "Arabic", notes: "Religious programming and Quran." },
  { id: "tamazight", name: "Tamazight TV", kind: "tv", group: "SNRT", language: "Tamazight", notes: "Amazigh language and culture." },
  { id: "medi1-tv", name: "Médi1 TV", kind: "tv", group: "Médi1", language: "Arabic / French", notes: "News-led pan-Maghreb satellite channel." },
  { id: "chada-tv", name: "Chada TV", kind: "tv", group: "Private", language: "Arabic", notes: "Music and entertainment." },
];

const RADIO_STATIONS: Channel[] = [
  { id: "radio-marocaine", name: "Radio Marocaine", kind: "radio", group: "SNRT", language: "Arabic", notes: "Public generalist radio." },
  { id: "chaine-inter", name: "Chaîne Inter", kind: "radio", group: "SNRT", language: "Arabic / French", notes: "Public news & talk." },
  { id: "medi1-radio", name: "Médi1 Radio", kind: "radio", group: "Médi1", language: "Arabic / French", notes: "News radio — Maghreb coverage." },
  { id: "aswat", name: "Aswat", kind: "radio", group: "Private", language: "Arabic", notes: "Music and entertainment." },
  { id: "hit-radio", name: "Hit Radio", kind: "radio", group: "Private", language: "Arabic / French", notes: "Youth music radio — large urban audience." },
];

// ─── Shared inline styles ───────────────────────────────────────
const widgetCardStyle: CSSProperties = {
  border: `1px solid ${C.border}`,
  borderRadius: "4px",
  padding: "12px",
  background: C.bg,
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
};

const labelStyle: CSSProperties = {
  fontSize: "10px",
  fontFamily: FONT.mono,
  color: C.textMuted,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  fontWeight: 600,
};

// ─── Logo placeholder (channel initials in a square tile) ───────
function ChannelLogo({ name, kind, size = 64 }: { name: string; kind: "tv" | "radio"; size?: number }) {
  // Generate initials — first 2-3 letters of the first word.
  const first = name.split(/\s+/)[0] ?? name;
  const text = first.length > 4 ? first.slice(0, 3).toUpperCase() : first.slice(0, 4).toUpperCase();
  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: "4px",
        background: C.bgSubtle,
        border: `1px dashed ${C.border}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: C.textMuted,
        fontFamily: FONT.mono,
        fontWeight: 700,
        fontSize: size * 0.22,
        letterSpacing: "0.04em",
        gap: "2px",
        flexShrink: 0,
      }}
    >
      <span>{text}</span>
      <span style={{
        fontSize: size * 0.13,
        color: C.textMuted,
        opacity: 0.7,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
      }}>{kind}</span>
    </div>
  );
}

// ─── Status badge (offline) ────────────────────────────────────
function OfflineBadge() {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      padding: "2px 8px",
      borderRadius: "2px",
      background: `${C.warning}14`,
      border: `1px solid ${C.warning}40`,
      color: C.warningText,
      fontFamily: FONT.mono,
      fontSize: "9px",
      fontWeight: 700,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
    }}>
      <span style={{
        width: "5px", height: "5px", borderRadius: "50%",
        background: C.warning, display: "inline-block",
      }} />
      Monitoring offline
    </span>
  );
}

// ─── Channel card ───────────────────────────────────────────────
function ChannelCard({ channel, onRequest }: { channel: Channel; onRequest: (c: Channel) => void }) {
  return (
    <div style={{
      ...widgetCardStyle,
      padding: "16px",
      gap: "12px",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <ChannelLogo name={channel.name} kind={channel.kind} size={64} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: FONT.sans, fontSize: "14px", fontWeight: 700, color: C.text,
            marginBottom: "2px",
          }}>{channel.name}</div>
          <div style={{
            fontFamily: FONT.mono, fontSize: "10px", color: C.textMuted,
          }}>{channel.group} · {channel.language}</div>
          <div style={{ marginTop: "8px" }}>
            <OfflineBadge />
          </div>
        </div>
      </div>
      <div style={{
        fontFamily: FONT.sans, fontSize: "11px", color: C.textBody, lineHeight: 1.5,
      }}>{channel.notes}</div>
      <button
        onClick={() => onRequest(channel)}
        type="button"
        style={{
          alignSelf: "flex-start",
          padding: "6px 12px",
          background: C.bgSubtle,
          border: `1px solid ${C.border}`,
          borderRadius: "4px",
          color: C.textBody,
          fontFamily: FONT.mono,
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          cursor: "pointer",
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = ACCENT;
          e.currentTarget.style.color = ACCENT;
          e.currentTarget.style.background = C.bg;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = C.border;
          e.currentTarget.style.color = C.textBody;
          e.currentTarget.style.background = C.bgSubtle;
        }}
      >
        Request access →
      </button>
    </div>
  );
}

// ─── Request access modal ──────────────────────────────────────
function RequestModal({ channel, onClose }: { channel: Channel | null; onClose: () => void }) {
  // Lock body scroll while open + close on Esc.
  useEffect(() => {
    if (!channel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [channel, onClose]);

  if (!channel) return null;

  const mailtoSubject = encodeURIComponent(`Broadcast monitoring access request — ${channel.name}`);
  const mailtoBody = encodeURIComponent(
    `Hello Harch Atelier team,\n\n` +
      `I would like to request access to broadcast monitoring for ${channel.name} ` +
      `(${channel.kind.toUpperCase()}, ${channel.group}).\n\n` +
      `Account: brand-monitor\n` +
      `Channel: ${channel.name}\n` +
      `Use case: [please describe]\n\n` +
      `Thank you.`,
  );
  const mailtoHref = `mailto:sales@harch.atelier?subject=${mailtoSubject}&body=${mailtoBody}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="broadcast-modal-title"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10,10,10,0.55)",
        zIndex: 120,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: FONT.sans,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.bg,
          border: `1px solid ${C.border}`,
          borderRadius: "6px",
          padding: "24px",
          maxWidth: "520px",
          width: "100%",
          boxShadow: C.shadowMd,
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
          <ChannelLogo name={channel.name} kind={channel.kind} size={56} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div id="broadcast-modal-title" style={{
              fontFamily: FONT.sans, fontSize: "18px", fontWeight: 700, color: C.text,
            }}>{channel.name}</div>
            <div style={{
              fontFamily: FONT.mono, fontSize: "11px", color: C.textMuted, marginTop: "2px",
            }}>
              {channel.kind === "tv" ? "Television" : "Radio"} · {channel.group} · {channel.language}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            type="button"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: C.textMuted,
              fontSize: "18px",
              padding: "0 4px",
              fontFamily: FONT.mono,
            }}
          >×</button>
        </div>

        <div style={{
          padding: "12px 14px",
          background: `${C.warning}10`,
          border: `1px solid ${C.warning}30`,
          borderRadius: "4px",
        }}>
          <div style={{
            fontFamily: FONT.mono, fontSize: "10px", fontWeight: 700,
            color: C.warningText, textTransform: "uppercase", letterSpacing: "0.1em",
            marginBottom: "6px",
          }}>
            Awaiting broadcast telemetry
          </div>
          <div style={{
            fontFamily: FONT.sans, fontSize: "13px", color: C.textBody, lineHeight: 1.5,
          }}>
            Broadcast monitoring for <b style={{ color: C.text }}>{channel.name}</b> is
            available in the <b style={{ color: ACCENT }}>Enterprise plan</b>. Real-time
            closed-caption ingestion, segment-level sentiment and brand mention tracking
            across Moroccan TV and radio require a dedicated capture pipeline.
          </div>
        </div>

        <div style={{
          fontFamily: FONT.mono, fontSize: "11px", color: C.textMuted, lineHeight: 1.6,
        }}>
          We do not display synthetic broadcast metrics. When your Enterprise contract
          is activated, this card will populate with live caption mentions, segment
          transcripts and air-time analytics — sourced from the broadcaster feed, not
          fabricated.
        </div>

        <div style={{
          display: "flex", gap: "8px", justifyContent: "flex-end", flexWrap: "wrap",
        }}>
          <button
            onClick={onClose}
            type="button"
            style={{
              padding: "8px 14px",
              background: C.bg,
              border: `1px solid ${C.border}`,
              borderRadius: "4px",
              color: C.textBody,
              fontFamily: FONT.mono,
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Close
          </button>
          <a
            href={mailtoHref}
            style={{
              padding: "8px 14px",
              background: ACCENT,
              border: `1px solid ${ACCENT}`,
              borderRadius: "4px",
              color: "#ffffff",
              fontFamily: FONT.mono,
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              textDecoration: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Contact sales →
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Status banner (honest about the placeholder state) ────────
function StatusBanner() {
  return (
    <div style={{
      ...widgetCardStyle,
      padding: "16px 18px",
      background: `${C.warning}08`,
      borderColor: `${C.warning}40`,
      display: "flex",
      alignItems: "flex-start",
      gap: "12px",
    }}>
      <div style={{
        width: "10px", height: "10px", borderRadius: "50%",
        background: C.warning, marginTop: "4px", flexShrink: 0,
        animation: "broadcast-pulse 1.5s ease-in-out infinite",
      }} />
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: FONT.mono, fontSize: "10px", fontWeight: 700,
          color: C.warningText, textTransform: "uppercase", letterSpacing: "0.1em",
          marginBottom: "4px",
        }}>
          Awaiting broadcast telemetry
        </div>
        <div style={{
          fontFamily: FONT.sans, fontSize: "12px", color: C.textBody, lineHeight: 1.55,
        }}>
          Broadcast monitoring (TV + radio closed captions, segment transcripts, air-time
          analytics) is gated to the Enterprise plan. The directory below lists every
          Moroccan channel we will track when access is granted. No synthetic data is
          displayed — every channel shows "MONITORING OFFLINE" until capture is live.
        </div>
        <style>{`
          @keyframes broadcast-pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.3; transform: scale(0.7); }
          }
        `}</style>
      </div>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────
export function BroadcastMonitor() {
  const [requested, setRequested] = useState<Channel | null>(null);

  return (
    <div
      className="dash-main"
      style={{
        padding: "24px",
        background: C.bg,
        overflowX: "hidden",
        minHeight: "calc(100vh - 56px)",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{
          fontSize: "11px", fontFamily: FONT.mono, color: ACCENT,
          letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px",
        }}>
          Brand Monitor · Broadcast
        </div>
        <h3 style={{
          fontSize: "22px", fontWeight: 700, color: C.text, margin: 0,
          letterSpacing: "-0.02em",
        }}>
          Broadcast Monitoring
        </h3>
        <p style={{
          fontSize: "13px", color: C.textMuted, fontFamily: FONT.mono, marginTop: "4px", marginBottom: 0,
        }}>
          Moroccan television and radio coverage — Talkwalker-style capture pipeline.
        </p>
      </div>

      {/* Status banner */}
      <div style={{ marginBottom: "20px" }}>
        <StatusBanner />
      </div>

      {/* KPI strip — honest placeholders, no fake numbers */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))",
        gap: "12px", marginBottom: "20px",
      }}>
        <div style={widgetCardStyle}>
          <div style={labelStyle}>TV channels</div>
          <div style={{
            fontSize: "28px", fontWeight: 800, fontFamily: FONT.mono, color: C.text,
            marginTop: "8px", letterSpacing: "-0.02em", lineHeight: 1,
          }}>{TV_CHANNELS.length}</div>
          <div style={{ fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted, marginTop: "6px" }}>awaiting capture</div>
        </div>
        <div style={widgetCardStyle}>
          <div style={labelStyle}>Radio stations</div>
          <div style={{
            fontSize: "28px", fontWeight: 800, fontFamily: FONT.mono, color: C.text,
            marginTop: "8px", letterSpacing: "-0.02em", lineHeight: 1,
          }}>{RADIO_STATIONS.length}</div>
          <div style={{ fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted, marginTop: "6px" }}>awaiting capture</div>
        </div>
        <div style={widgetCardStyle}>
          <div style={labelStyle}>Live mentions</div>
          <div style={{
            fontSize: "28px", fontWeight: 800, fontFamily: FONT.mono, color: C.textMuted,
            marginTop: "8px", letterSpacing: "-0.02em", lineHeight: 1,
          }}>—</div>
          <div style={{ fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted, marginTop: "6px" }}>no feed</div>
        </div>
        <div style={widgetCardStyle}>
          <div style={labelStyle}>Hours ingested</div>
          <div style={{
            fontSize: "28px", fontWeight: 800, fontFamily: FONT.mono, color: C.textMuted,
            marginTop: "8px", letterSpacing: "-0.02em", lineHeight: 1,
          }}>—</div>
          <div style={{ fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted, marginTop: "6px" }}>no feed</div>
        </div>
      </div>

      {/* TV channels grid */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{
          display: "flex", alignItems: "baseline", justifyContent: "space-between",
          marginBottom: "12px",
        }}>
          <div style={{
            fontFamily: FONT.sans, fontSize: "14px", fontWeight: 700, color: C.text,
          }}>
            Television channels
          </div>
          <div style={labelStyle}>{TV_CHANNELS.length} channels · all offline</div>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
          gap: "12px",
        }}>
          {TV_CHANNELS.map((ch) => (
            <ChannelCard key={ch.id} channel={ch} onRequest={setRequested} />
          ))}
        </div>
      </div>

      {/* Radio stations grid */}
      <div>
        <div style={{
          display: "flex", alignItems: "baseline", justifyContent: "space-between",
          marginBottom: "12px",
        }}>
          <div style={{
            fontFamily: FONT.sans, fontSize: "14px", fontWeight: 700, color: C.text,
          }}>
            Radio stations
          </div>
          <div style={labelStyle}>{RADIO_STATIONS.length} stations · all offline</div>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
          gap: "12px",
        }}>
          {RADIO_STATIONS.map((ch) => (
            <ChannelCard key={ch.id} channel={ch} onRequest={setRequested} />
          ))}
        </div>
      </div>

      {/* Request access modal */}
      <RequestModal channel={requested} onClose={() => setRequested(null)} />
    </div>
  );
}
