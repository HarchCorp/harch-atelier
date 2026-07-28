"use client";

import { useState } from "react";
import { AtelierNav } from "../../components/AtelierNav";
import { AtelierFooter } from "../../components/AtelierFooter";
import { InstitutionalAuditTemplate } from "../../components/pdf-templates/InstitutionalAuditTemplate";

const C = {
  bg: "#FAFAFA", surface: "#FFFFFF", border: "#E5E5E5",
  text: "#0A0A0A", textSec: "#525252", textMuted: "#71717A",
  accent: "#4A5D6E", sage: "#4A7B5F", red: "#A0524B",
};

export default function InstitutionalAuditPreviewPage() {
  const [teaser, setTeaser] = useState(true);

  return (
    <>
      <AtelierNav />

      {/* Toolbar */}
      <div style={{
        background: C.surface, borderBottom: `1px solid ${C.border}`,
        padding: "20px 32px",
      }}>
        <div style={{
          maxWidth: "1280px", margin: "0 auto",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: "16px",
        }}>
          <div>
            <div style={{
              fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
              color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase",
              marginBottom: "4px",
            }}>
              Report Preview · Institutional Audit
            </div>
            <h1 style={{
              fontSize: "24px", fontWeight: 700, color: C.text,
              letterSpacing: "-0.02em", margin: 0,
            }}>
              12-page institutional reputation audit
            </h1>
            <div style={{ fontSize: "12px", color: C.textMuted, marginTop: "4px" }}>
              10x more content than the free version · 32 risk categories · 5 competitors · 90-day action plan
            </div>
          </div>

          <div style={{
            display: "flex", gap: "8px", alignItems: "center",
          }}>
            <span style={{
              fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
              color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase",
            }}>
              View mode:
            </span>
            <button
              onClick={() => setTeaser(true)}
              style={{
                padding: "8px 14px", fontSize: "12px", fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                background: teaser ? C.text : C.surface,
                color: teaser ? "#FFFFFF" : C.textSec,
                border: `1px solid ${teaser ? C.text : C.border}`,
                borderRadius: "6px", cursor: "pointer",
              }}
            >
              Free teaser (2 pages)
            </button>
            <button
              onClick={() => setTeaser(false)}
              style={{
                padding: "8px 14px", fontSize: "12px", fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                background: !teaser ? C.sage : C.surface,
                color: !teaser ? "#FFFFFF" : C.textSec,
                border: `1px solid ${!teaser ? C.sage : C.border}`,
                borderRadius: "6px", cursor: "pointer",
              }}
            >
              Full report (12 pages) — paid
            </button>
          </div>
        </div>
      </div>

      {/* Report container */}
      <div style={{
        background: C.bg, padding: "40px 32px 80px",
        minHeight: "calc(100vh - 64px)",
      }}>
        <div style={{
          maxWidth: "900px", margin: "0 auto",
          background: C.surface, padding: "20px 0",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          borderRadius: "12px", overflow: "hidden",
        }}>
          <InstitutionalAuditTemplate teaser={teaser} />
        </div>

        {/* CTA below report */}
        {teaser && (
          <div style={{
            maxWidth: "900px", margin: "40px auto 0",
            padding: "32px", background: C.text, color: "#FFFFFF",
            borderRadius: "12px", textAlign: "center",
          }}>
            <div style={{
              fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
              color: "#6FA386", letterSpacing: "0.14em", textTransform: "uppercase",
              marginBottom: "12px",
            }}>
              Unlock 10 more pages
            </div>
            <h3 style={{
              fontSize: "24px", fontWeight: 700, color: "#FFFFFF",
              letterSpacing: "-0.02em", margin: "0 0 12px",
            }}>
              Get the full institutional audit.
            </h3>
            <p style={{
              fontSize: "14px", color: "rgba(255,255,255,0.7)",
              lineHeight: 1.5, marginBottom: "20px",
            }}>
              AI visibility matrix · top 30 articles · topic clustering · 5 dominant narratives ·
              5 risks with mitigations · 5 competitor benchmarks · 7 prioritized recommendations ·
              10-week action plan · methodology
            </p>
            <a href="/atelier/pricing" style={{
              display: "inline-block", padding: "14px 28px",
              background: C.sage, color: "#FFFFFF",
              fontSize: "14px", fontWeight: 600, textDecoration: "none",
              borderRadius: "8px", fontFamily: "'Inter', sans-serif",
            }}>
              View pricing →
            </a>
          </div>
        )}
      </div>

      <AtelierFooter />
    </>
  );
}
