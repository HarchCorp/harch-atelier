"use client";

import { useState } from "react";
import { C } from "../../../components/tokens";
import { BrandBadge } from "@/components/BrandBadge";
import {
  PolymorphicProvider,
  PolymorphicBox,
  ArchetypeBadge,
} from "@/components/polymorphic/PolymorphicProvider";
import { AutoHealingBoundary } from "@/components/polymorphic/AutoHealingBoundary";

// ═══════════════════════════════════════════════════════════════
//  POLYMORPHIC UI LAB — Live demo of the adaptive engine
//
//  This page demonstrates N(20,50,100) + N(30,80,100):
//    • The UI adapts in real-time to your behavior (click fast →
//      power mode, scroll fast → skimmer mode, etc.)
//    • The ArchetypeBadge shows which mode you're in
//    • A crash test button triggers the Auto-Healing DOM
//
//  URL: /atelier/lab/polymorphic
// ═══════════════════════════════════════════════════════════════

function CrashingComponent() {
  const [shouldCrash, setShouldCrash] = useState(false);
  if (shouldCrash) {
    throw new Error("Simulated crash — testing Auto-Healing DOM");
  }
  return (
    <div style={{
      padding: "16px",
      background: "#ecfdf5",
      border: "1px solid #a7f3d0",
      borderRadius: "8px",
      fontSize: "13px",
      color: "#065f46",
    }}>
      ✓ Component is healthy. Click "Simulate Crash" to test auto-healing.
    </div>
  );
}

export default function PolymorphicLabPage() {
  const [crashKey, setCrashKey] = useState(0);

  return (
    <PolymorphicProvider>
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: C.fontSans, color: C.text }}>
        {/* Header */}
        <header style={{
          padding: "16px 24px",
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: C.surface,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
              Lab · Polymorphic UI Engine
            </span>
          </div>
          <ArchetypeBadge />
        </header>

        <main style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 24px" }}>
          <style>{`
            @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
          `}</style>

          <h1 style={{ fontSize: "28px", fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
            Polymorphic UI Engine
          </h1>
          <p style={{ fontSize: "14px", color: C.textBody, lineHeight: 1.6, marginBottom: "32px" }}>
            The interface adapts to your behavior in real-time. Click fast → power mode (compact).
            Scroll fast → skimmer mode (larger text). Dwell on elements → reader mode (expanded detail).
            The badge above shows your current archetype.
          </p>

          {/* Behavior guide */}
          <PolymorphicBox style={{
            padding: "20px",
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "12px",
            marginBottom: "24px",
          }}>
            <div style={{
              fontFamily: C.fontMono,
              fontSize: "10px",
              fontWeight: 700,
              color: C.accent,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}>
              Try these behaviors
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
              <div>
                <strong style={{ color: C.text }}>Power User</strong>
                <p style={{ color: C.textBody, margin: "4px 0 0", fontSize: "12px" }}>
                  Click 30+ times in 60 seconds with quick dwell times. UI becomes compact + fast animations.
                </p>
              </div>
              <div>
                <strong style={{ color: C.text }}>Skimmer</strong>
                <p style={{ color: C.textBody, margin: "4px 0 0", fontSize: "12px" }}>
                  Scroll fast through the page. Text becomes larger for scannability.
                </p>
              </div>
              <div>
                <strong style={{ color: C.text }}>Reader</strong>
                <p style={{ color: C.textBody, margin: "4px 0 0", fontSize: "12px" }}>
                  Hover on elements for 2+ seconds without scrolling. Detail expands, animations slow.
                </p>
              </div>
              <div>
                <strong style={{ color: C.text }}>Beginner</strong>
                <p style={{ color: C.textBody, margin: "4px 0 0", fontSize: "12px" }}>
                  Trigger 3+ errors (crash test below). Tooltips appear, density decreases.
                </p>
              </div>
            </div>
          </PolymorphicBox>

          {/* Auto-Healing DOM demo */}
          <PolymorphicBox style={{
            padding: "20px",
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "12px",
            marginBottom: "24px",
          }}>
            <div style={{
              fontFamily: C.fontMono,
              fontSize: "10px",
              fontWeight: 700,
              color: C.accent,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}>
              Auto-Healing DOM (N30)
            </div>
            <p style={{ fontSize: "13px", color: C.textBody, marginBottom: "16px" }}>
              When a component crashes, the boundary auto-retries 3 times. If it keeps failing,
              a fallback appears. Each crash increments the error counter → triggers beginner mode.
            </p>

            <AutoHealingBoundary componentName="CrashingDemo" maxRetries={3}>
              <CrashingComponent key={crashKey} />
            </AutoHealingBoundary>

            <button
              onClick={() => setCrashKey((k) => k + 1)}
              style={{
                marginTop: "12px",
                padding: "8px 14px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "6px",
                fontFamily: C.fontMono,
                fontSize: "11px",
                fontWeight: 700,
                color: "#991b1b",
                cursor: "pointer",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Simulate Crash (remount)
            </button>
          </PolymorphicBox>

          {/* Live adaptive content */}
          <PolymorphicBox style={{
            padding: "20px",
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "12px",
          }}>
            <div style={{
              fontFamily: C.fontMono,
              fontSize: "10px",
              fontWeight: 700,
              color: C.accent,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}>
              Live Adaptive Content
            </div>
            <p style={{ fontSize: "14px", lineHeight: 1.6, color: C.text }}>
              This text adapts to your behavior. The font size, line height, and background warmth
              are all dynamic. If you've been on this page for 30+ minutes, the colors will shift
              to warmer tones to reduce visual fatigue. If you click rapidly, the density increases
              and animations speed up — the interface becomes a power tool.
            </p>
            <p style={{ fontSize: "14px", lineHeight: 1.6, color: C.textBody, marginTop: "12px" }}>
              No data leaves your browser. All behavior tracking is client-side, passive, and
              privacy-preserving. The engine is a set of design tokens that replace the static
              C.bg / C.text values — any component wrapped in <code style={{ fontFamily: C.fontMono, fontSize: "12px", background: C.bgSubtle, padding: "2px 4px", borderRadius: "3px" }}>{"<PolymorphicBox>"}</code> inherits the adaptation.
            </p>
          </PolymorphicBox>
        </main>
      </div>
    </PolymorphicProvider>
  );
}
