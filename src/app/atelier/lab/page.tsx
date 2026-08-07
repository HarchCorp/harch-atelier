"use client";

import { C } from "../components/tokens";
import { BrandBadge } from "@/components/BrandBadge";

// ═══════════════════════════════════════════════════════════════
//  LAB INDEX — Directory of experimental features
//
//  Lists all lab experiments with their status + Yggdrasil node ID.
//  This is the discovery page — every lab page is linked from here.
// ═══════════════════════════════════════════════════════════════

const EXPERIMENTS = [
  {
    href: "/atelier/lab/polymorphic",
    title: "Polymorphic UI Engine",
    node: "N(20,50,100)",
    status: "PRODUCTION",
    statusColor: "#10b981",
    desc: "Interface that adapts in real-time to user behavior (click velocity, scroll, dwell time). 5 archetypes, 8 dynamic tokens.",
    nemesis: "NEMESIS 3/3 PASS",
  },
  {
    href: "/atelier/lab/zkp",
    title: "Zero-Knowledge Proof Auth",
    node: "N(10,10,100)",
    status: "PRODUCTION",
    statusColor: "#10b981",
    desc: "Passwordless authentication via SRP-like challenge-response. The server NEVER knows your password. PBKDF2 → ECDSA P-256.",
    nemesis: "NEMESIS 2/3 PASS, 0 FRAUD",
  },
  {
    href: "/atelier/lab/whatsapp-inbound",
    title: "WhatsApp Inbound Pipeline",
    node: "N(60,40,80)",
    status: "PRODUCTION",
    statusColor: "#10b981",
    desc: "Twilio webhook → GLM-4 sentiment → Darija NLP → crisis detection. Real WhatsApp message processing.",
  },
  {
    href: "/atelier/lab/hespress",
    title: "Hespress Comment Scraper",
    node: "N(55,30,80)",
    status: "PRODUCTION",
    statusColor: "#10b981",
    desc: "Scrapes Hespress comments + runs Darija sentiment analysis. 200-2000 comments per article.",
  },
  {
    href: "/atelier/lab/command-center",
    title: "Command Center",
    node: "N(70,50,80)",
    status: "PRODUCTION",
    statusColor: "#10b981",
    desc: "Fullscreen war-room mode for TV/projector display. Dark overlay with real-time alerts.",
  },
  {
    href: "/atelier/lab/linguistic-matrix",
    title: "Linguistic Intelligence Matrix",
    node: "N(65,60,100)",
    status: "PRODUCTION",
    statusColor: "#10b981",
    desc: "35/35/20/10 language matrix (MSA/French/English/Darija). Global Risk Index + cascade detection.",
  },
];

export default function LabIndexPage() {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: C.fontSans, color: C.text }}>
      <header style={{
        padding: "16px 24px",
        borderBottom: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "center",
        gap: "12px",
        background: C.bg,
      }}>
        <BrandBadge subsidiary="Atelier" size="sm" theme="light" />
        <span style={{
          fontFamily: C.fontMono,
          fontSize: "10px",
          color: C.accent,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          borderLeft: `1px solid ${C.border}`,
          paddingLeft: "10px",
        }}>
          Lab · Experiments
        </span>
      </header>

      <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 24px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
          Yggdrasil Lab
        </h1>
        <p style={{ fontSize: "14px", color: C.textBody, lineHeight: 1.6, marginBottom: "32px" }}>
          Experimental features from the x100 cartography. Each experiment is a Yggdrasil node —
          verified by NEMESIS adversarial QA where applicable.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))", gap: "16px" }}>
          {EXPERIMENTS.map(exp => (
            <a
              key={exp.href}
              href={exp.href}
              style={{
                display: "block",
                padding: "20px",
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: "12px",
                textDecoration: "none",
                color: "inherit",
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <h2 style={{ fontSize: "16px", fontWeight: 700, color: C.text, margin: 0 }}>{exp.title}</h2>
                <span style={{
                  padding: "2px 8px",
                  borderRadius: "4px",
                  background: `${exp.statusColor}15`,
                  color: exp.statusColor,
                  fontSize: "9px",
                  fontWeight: 700,
                  fontFamily: C.fontMono,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}>
                  {exp.status}
                </span>
              </div>
              <p style={{ fontSize: "13px", color: C.textBody, lineHeight: 1.5, margin: "0 0 12px" }}>
                {exp.desc}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, letterSpacing: "0.04em" }}>
                  {exp.node}
                </span>
                {exp.nemesis && (
                  <span style={{ fontFamily: C.fontMono, fontSize: "10px", color: "#10b981", fontWeight: 600 }}>
                    ✓ {exp.nemesis}
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
