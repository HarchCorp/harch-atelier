"use client";

import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════
//  TEAM COLLABORATION PANEL
//
//  Shows team members + their alert assignments + activity.
//  The Dircom can see who acknowledged what, who's active,
//  and assign alerts to specific team members.
//
//  Pattern: Meltwater team management + Brandwatch collaboration.
// ═══════════════════════════════════════════════════════════════

const C = {
  surface: "#FFFFFF",
  surfaceAlt: "#F4F4F5",
  border: "#E5E5E5",
  text: "#0A0A0A",
  textSec: "#525252",
  textMuted: "#71717A",
  accent: "#78716c",
  cta: "#10b981",
  danger: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
  fontSans: "'Inter', system-ui, sans-serif",
  fontMono: "'Space Mono', monospace",
};

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "invited" | "suspended";
  lastActive: string | null;
  alertsAcknowledged: number;
  alertsAssigned: number;
  avatar: string;
}

const DEMO_TEAM: TeamMember[] = [
  { id: "1", name: "Salma Bennani", email: "s.bennani@attijariwafa.com", role: "Dircom", status: "active", lastActive: "2min ago", alertsAcknowledged: 12, alertsAssigned: 8, avatar: "SB" },
  { id: "2", name: "Karim El Idrissi", email: "k.elidrissi@attijariwafa.com", role: "Analyst", status: "active", lastActive: "1h ago", alertsAcknowledged: 24, alertsAssigned: 15, avatar: "KE" },
  { id: "3", name: "Nadia Tazi", email: "n.tazi@attijariwafa.com", role: "Viewer", status: "active", lastActive: "3h ago", alertsAcknowledged: 3, alertsAssigned: 0, avatar: "NT" },
  { id: "4", name: "Omar Fassi", email: "o.fassi@attijariwafa.com", role: "Analyst", status: "invited", lastActive: null, alertsAcknowledged: 0, alertsAssigned: 0, avatar: "OF" },
];

const ROLE_META: Record<string, { color: string; bg: string }> = {
  Dircom: { color: "#1e3a5f", bg: "#eff6ff" },
  Analyst: { color: "#4a7b5f", bg: "#ecfdf5" },
  Viewer: { color: "#78716c", bg: "#f4f4f5" },
};

const STATUS_META: Record<string, { color: string; label: string; dot: string }> = {
  active: { color: C.cta, label: "Active", dot: "#10b981" },
  invited: { color: C.warning, label: "Invited", dot: "#f59e0b" },
  suspended: { color: C.danger, label: "Suspended", dot: "#ef4444" },
};

export function TeamCollaborationPanel() {
  const [members] = useState<TeamMember[]>(DEMO_TEAM);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const totalAck = members.reduce((sum, m) => sum + m.alertsAcknowledged, 0);
  const activeCount = members.filter(m => m.status === "active").length;
  const invitedCount = members.filter(m => m.status === "invited").length;

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div>
          <div style={{ fontFamily: C.fontMono, fontSize: "11px", fontWeight: 700, color: C.text, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "4px" }}>
            Team Collaboration
          </div>
          <div style={{ fontSize: "13px", color: C.textSec }}>Team members, alert assignments, and activity</div>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "20px", fontWeight: 700, color: C.cta }}>{activeCount}</div>
            <div style={{ fontFamily: C.fontMono, fontSize: "9px", color: C.textMuted }}>ACTIVE</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "20px", fontWeight: 700, color: C.warning }}>{invitedCount}</div>
            <div style={{ fontFamily: C.fontMono, fontSize: "9px", color: C.textMuted }}>INVITED</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "20px", fontWeight: 700, color: C.text }}>{totalAck}</div>
            <div style={{ fontFamily: C.fontMono, fontSize: "9px", color: C.textMuted }}>ACKS</div>
          </div>
        </div>
      </div>

      {/* Team members */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {members.map(m => {
          const role = ROLE_META[m.role] || ROLE_META.Viewer;
          const status = STATUS_META[m.status];
          const isSelected = selectedMember === m.id;
          return (
            <div
              key={m.id}
              onClick={() => setSelectedMember(isSelected ? null : m.id)}
              style={{
                display: "grid",
                gridTemplateColumns: "40px 1fr auto auto auto",
                gap: "12px",
                alignItems: "center",
                padding: "12px 14px",
                background: isSelected ? C.surfaceAlt : C.surface,
                border: `1px solid ${isSelected ? C.accent : C.border}`,
                borderRadius: "10px",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${role.color}, ${role.color}80)`,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: 700,
                  fontFamily: C.fontMono,
                  position: "relative",
                }}
              >
                {m.avatar}
                {m.status === "active" && (
                  <div style={{
                    position: "absolute",
                    bottom: "0",
                    right: "0",
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: status.dot,
                    border: `2px solid ${C.surface}`,
                  }} />
                )}
              </div>

              {/* Name + email */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: C.text }}>{m.name}</span>
                  <span style={{
                    fontFamily: C.fontMono,
                    fontSize: "9px",
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: "3px",
                    background: role.bg,
                    color: role.color,
                  }}>{m.role}</span>
                </div>
                <div style={{ fontFamily: C.fontMono, fontSize: "11px", color: C.textMuted }}>{m.email}</div>
              </div>

              {/* Last active */}
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted }}>LAST ACTIVE</div>
                <div style={{ fontSize: "12px", color: m.lastActive ? C.textSec : C.textMuted }}>{m.lastActive || "—"}</div>
              </div>

              {/* Alerts acknowledged */}
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted }}>ACKS</div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: C.cta }}>{m.alertsAcknowledged}</div>
              </div>

              {/* Assigned */}
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted }}>ASSIGNED</div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: C.info }}>{m.alertsAssigned}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Invite button */}
      <button
        style={{
          marginTop: "12px",
          width: "100%",
          padding: "10px",
          background: C.surface,
          border: `1px dashed ${C.border}`,
          borderRadius: "8px",
          fontFamily: C.fontSans,
          fontSize: "13px",
          fontWeight: 600,
          color: C.textSec,
          cursor: "pointer",
        }}
      >
        + Invite team member
      </button>

      {/* Footer */}
      <div style={{ marginTop: "12px", padding: "10px 14px", background: C.surfaceAlt, borderRadius: "8px", display: "flex", gap: "8px", alignItems: "center" }}>
        <span style={{ fontSize: "14px" }}>💡</span>
        <p style={{ margin: 0, fontSize: "12px", color: C.textSec, lineHeight: 1.5 }}>
          Assign alerts to team members from the Crisis Alert Feed. Each acknowledgment is logged in the audit trail for compliance (Loi 09-08).
        </p>
      </div>
    </div>
  );
}
