"use client";

import BrandBadge from "@/components/BrandBadge";
import { ATELIER_FOOTER_LINKS, ATELIER_COUNTRIES } from "./tokens";

// ─── ATELIER FOOTER — LIGHT THEME ───────────────────────────────
// White background (#FFFFFF), light borders (#E5E5E5), text in #525252,
// link hover #0A0A0A, sage country code badges on light cards, legal in #71717A.

export function AtelierFooter() {
  return (
    <footer
      style={{
        borderTop: "1px solid #E5E5E5",
        background: "#FFFFFF",
        padding: "64px 32px 32px",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: "48px",
          marginBottom: "48px",
          alignItems: "start",
        }}
      >
        {/* Brand block */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <BrandBadge subsidiary="Atelier" href="/atelier" size="md" theme="light" accentColor="#4A5D6E" />
          <p
            style={{
              marginTop: "8px",
              fontSize: "14px",
              color: "#71717A",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.04em",
            }}
          >
            AI Reputation Intelligence — Afrique & monde francophone.
          </p>
          <div
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
              marginTop: "12px",
              fontSize: "13px",
            }}
          >
            <a
              href="mailto:atelier@harchcorp.com"
              style={{ color: "#525252", textDecoration: "none" }}
            >
              atelier@harchcorp.com
            </a>
            <span style={{ color: "#A1A1AA" }}>·</span>
            <a
              href="tel:+212684440682"
              style={{ color: "#525252", textDecoration: "none" }}
            >
              +212 684 440 682
            </a>
          </div>
          <a
            href="https://harchcorp.com"
            style={{
              marginTop: "4px",
              fontSize: "13px",
              color: "#4A5D6E",
              textDecoration: "none",
            }}
          >
            → harchcorp.com
          </a>
        </div>

        {/* Link columns */}
        <div style={{ display: "flex", gap: "48px" }}>
          {Object.entries(ATELIER_FOOTER_LINKS).map(([key, links]) => (
            <div
              key={key}
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "#71717A",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                {key}
              </div>
              {links.map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  style={{
                    fontSize: "13px",
                    color: "#525252",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#0A0A0A")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#525252")
                  }
                >
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Countries */}
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "40px 0",
          borderTop: "1px solid #E5E5E5",
          marginTop: "40px",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            fontFamily: "'JetBrains Mono', monospace",
            color: "#71717A",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: "16px",
          }}
        >
          8 marchés francophones couverts
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
          }}
        >
          {ATELIER_COUNTRIES.map((c) => (
            <div
              key={c.code}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                background: "#FAFAFA",
                border: "1px solid #E5E5E5",
                borderRadius: "4px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "#FFFFFF",
                  padding: "4px 8px",
                  background: "#4A7B5F",
                  border: "1px solid #4A7B5F",
                  borderRadius: "2px",
                  letterSpacing: "0.08em",
                }}
              >
                {c.code}
              </span>
              <div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#0A0A0A",
                  }}
                >
                  {c.name}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#71717A",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {c.cities}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legal */}
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          paddingTop: "32px",
          borderTop: "1px solid #E5E5E5",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            color: "#71717A",
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.04em",
          }}
        >
          Building in Public, depuis 2024 · Casablanca, Maroc
        </div>
        <div
          style={{
            fontSize: "12px",
            color: "#71717A",
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.04em",
          }}
        >
          Harch Atelier est une activité de Harch Corp · Virement bancaire
        </div>
      </div>
    </footer>
  );
}
