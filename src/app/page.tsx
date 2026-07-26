"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowRight, Newspaper, Bot, Activity, AlertTriangle, MessageCircle, Check } from "lucide-react";

/**
 * Harch Atelier — Marketing Landing Page (V26.0)
 *
 * Copied from production atelier.harchcorp.com — same color palette, same
 * hero copy, same 4 pillars, same structure. Adds a Login button in the
 * header (links to /client) and a "See live dashboard" CTA (links to /dashboard).
 *
 * Production palette:
 *  #0A0A0A near-black · #FFFFFF white · #FAFAFA off-white bg
 *  #4A7B5F forest green (primary) · #4A5D6E slate blue-grey (secondary)
 *  #525252 body text · #71717A muted text · #E5E5E5 border
 */
const PROD = {
  black: "#0A0A0A",
  white: "#FFFFFF",
  bg: "#FAFAFA",
  green: "#4A7B5F",
  slate: "#4A5D6E",
  body: "#525252",
  muted: "#71717A",
  border: "#E5E5E5",
};

const pillars = [
  {
    icon: Newspaper,
    title: "Media Monitoring",
    desc: "We track 30+ Moroccan & African media sources — Le Matin, L'Économiste, Hespress, TelQuel, Médias24, Aujourd'hui le Maroc and more — 24/7.",
  },
  {
    icon: Bot,
    title: "AI Visibility",
    desc: "See what ChatGPT, Perplexity, Gemini, and Claude say about your brand. Track your rank on the prompts that matter to your customers.",
  },
  {
    icon: Activity,
    title: "Sentiment Analysis",
    desc: "Every article is classified by HarchIQ, our trainable AI. You see the tone, the trend, and the impact on your reputation score.",
  },
  {
    icon: AlertTriangle,
    title: "Crisis Alerts",
    desc: "When negative sentiment spikes on a topic, you get a WhatsApp alert within 5 minutes — before it becomes a crisis.",
  },
];

export default function LandingPage() {
  return (
    <div style={{ background: PROD.bg, color: PROD.black, minHeight: "100vh" }}>
      {/* ─── Header ─── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(250,250,250,0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: `1px solid ${PROD.border}`,
        }}
      >
        <div
          style={{
            maxWidth: 1320,
            margin: "0 auto",
            padding: "0 32px",
            height: 64,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 24,
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: 8,
                background: `linear-gradient(135deg, ${PROD.green}, ${PROD.slate})`,
              }}
            >
              <ShieldCheck style={{ width: 18, height: 18, color: PROD.white }} />
            </span>
            <span style={{ fontSize: 15, fontWeight: 700, color: PROD.black, letterSpacing: "-0.01em" }}>
              Harch<span style={{ color: PROD.muted }}>Atelier</span>
            </span>
          </Link>

          {/* Nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: 28 }} className="hidden md:flex">
            {["Product", "Pillars", "Industries", "Pricing"].map((item) => (
              <span key={item} style={{ fontSize: 13, fontWeight: 500, color: PROD.body, cursor: "pointer" }}>
                {item}
              </span>
            ))}
          </nav>

          {/* Right side: Login + CTA */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link
              href="/client"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: PROD.slate,
                textDecoration: "none",
                padding: "8px 16px",
                borderRadius: 8,
                transition: "background 0.15s",
              }}
              className="hover:bg-slate-100"
            >
              Login
            </Link>
            <Link
              href="/dashboard"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 600,
                color: PROD.white,
                background: PROD.green,
                padding: "9px 18px",
                borderRadius: 8,
                textDecoration: "none",
                transition: "opacity 0.15s",
              }}
              className="hover:opacity-90"
            >
              See live dashboard
              <ArrowRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section style={{ maxWidth: 1320, margin: "0 auto", padding: "80px 32px 60px", textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px",
            borderRadius: 999,
            background: `${PROD.green}15`,
            border: `1px solid ${PROD.green}30`,
            marginBottom: 24,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: PROD.green }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: PROD.green, letterSpacing: "0.02em" }}>
            AI Reputation Intelligence · Decision Augmentation
          </span>
        </div>

        <h1
          style={{
            fontSize: "clamp(36px, 5vw, 56px)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
            color: PROD.black,
            maxWidth: 900,
            margin: "0 auto 24px",
          }}
        >
          AI Reputation Intelligence
          <br />
          <span style={{ color: PROD.green }}>for Africa</span>
        </h1>

        <p
          style={{
            fontSize: 18,
            lineHeight: 1.6,
            color: PROD.body,
            maxWidth: 640,
            margin: "0 auto 32px",
          }}
        >
          Monitor what media and AI say about your company. Sentiment analysis, crisis alerts on
          WhatsApp, monthly board-ready PDF reports. 30+ Moroccan and African media sources.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/client"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 15,
              fontWeight: 600,
              color: PROD.white,
              background: `linear-gradient(135deg, ${PROD.green}, ${PROD.slate})`,
              padding: "14px 28px",
              borderRadius: 10,
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(74,123,95,0.25)",
            }}
          >
            Start monitoring free
            <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
          <Link
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 15,
              fontWeight: 600,
              color: PROD.black,
              background: PROD.white,
              border: `1px solid ${PROD.border}`,
              padding: "14px 28px",
              borderRadius: 10,
              textDecoration: "none",
            }}
          >
            See live dashboard
          </Link>
        </div>

        <p style={{ fontSize: 13, color: PROD.muted, marginTop: 20 }}>
          No credit card required · 14-day free trial · Cancel anytime
        </p>
      </section>

      {/* ─── Media sources bar (social proof) ─── */}
      <section style={{ maxWidth: 1320, margin: "0 auto", padding: "0 32px 60px" }}>
        <p style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: PROD.muted, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 20 }}>
          Monitoring 30+ Moroccan &amp; African media sources
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "20px 32px", opacity: 0.55 }}>
          {["Le Matin", "L'Économiste", "Hespress", "TelQuel", "Médias24", "Aujourd'hui le Maroc", "Jeune Afrique", "The Africa Report"].map((src) => (
            <span key={src} style={{ fontSize: 15, fontWeight: 700, color: PROD.slate, letterSpacing: "-0.01em" }}>{src}</span>
          ))}
        </div>
      </section>

      {/* ─── Dashboard preview mockup ─── */}
      <section style={{ maxWidth: 1100, margin: "0 auto 80px", padding: "0 32px" }}>
        <div
          style={{
            borderRadius: 16,
            overflow: "hidden",
            border: `1px solid ${PROD.border}`,
            boxShadow: "0 24px 60px rgba(10,10,10,0.12), 0 8px 24px rgba(10,10,10,0.06)",
            background: PROD.white,
          }}
        >
          {/* Mock browser top bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderBottom: `1px solid ${PROD.border}`, background: "#F8F8F8" }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F57" }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FEBC2E" }} />
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28C840" }} />
            <span style={{ marginLeft: 12, fontSize: 11, color: PROD.muted, fontFamily: "monospace" }}>atelier.harchcorp.com/dashboard</span>
          </div>
          {/* Mock dashboard content */}
          <div style={{ padding: 20 }}>
            {/* Mock KPI row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
              {[
                { label: "HarchIQ Score", value: "82", unit: "/100", color: PROD.green, trend: "+2.1" },
                { label: "Media Mentions", value: "247", unit: "30d", color: PROD.slate, trend: "+12.3%" },
                { label: "Negative Share", value: "14%", unit: "", color: "#D97706", trend: "-3.2%" },
                { label: "AI Visibility", value: "100%", unit: "8/8", color: PROD.green, trend: "stable" },
              ].map((kpi) => (
                <div key={kpi.label} style={{ border: `1px solid ${PROD.border}`, borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: 9, fontWeight: 600, color: PROD.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{kpi.label}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                    <span style={{ fontSize: 22, fontWeight: 700, color: PROD.black, fontFamily: "monospace" }}>{kpi.value}</span>
                    <span style={{ fontSize: 10, color: PROD.muted }}>{kpi.unit}</span>
                  </div>
                  <div style={{ fontSize: 10, color: kpi.color, fontWeight: 600, marginTop: 2 }}>{kpi.trend}</div>
                </div>
              ))}
            </div>
            {/* Mock chart row */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
              <div style={{ border: `1px solid ${PROD.border}`, borderRadius: 10, padding: 14, height: 160 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: PROD.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Sentiment Trend · 30 days</div>
                <svg viewBox="0 0 300 100" style={{ width: "100%", height: 80 }}>
                  <defs>
                    <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={PROD.green} stopOpacity="0.25" />
                      <stop offset="100%" stopColor={PROD.green} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <polygon points="0,70 30,60 60,65 90,45 120,50 150,35 180,40 210,25 240,30 270,20 300,15 300,100 0,100" fill="url(#grad1)" />
                  <polyline points="0,70 30,60 60,65 90,45 120,50 150,35 180,40 210,25 240,30 270,20 300,15" fill="none" stroke={PROD.green} strokeWidth="2" />
                </svg>
              </div>
              <div style={{ border: `1px solid ${PROD.border}`, borderRadius: 10, padding: 14, height: 160 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: PROD.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>AI Engines</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {["ChatGPT", "Perplexity", "Gemini", "Claude"].map((e) => (
                    <div key={e} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: PROD.green }} />
                      <span style={{ fontSize: 10, color: PROD.body, flex: 1 }}>{e}</span>
                      <span style={{ fontSize: 9, color: PROD.green, fontWeight: 600 }}>#1</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4 Pillars ─── */}
      <section style={{ maxWidth: 1320, margin: "0 auto", padding: "40px 32px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", color: PROD.black, marginBottom: 12 }}>
            Four pillars of reputation intelligence.
          </h2>
          <p style={{ fontSize: 16, color: PROD.body, maxWidth: 680, margin: "0 auto" }}>
            Most reputation tools were built for American brands on English media. We built Harch
            Atelier for the francophone and African reality — Arabic sources, French business press,
            and AI engines your customers actually use.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 24,
          }}
        >
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                style={{
                  background: PROD.white,
                  border: `1px solid ${PROD.border}`,
                  borderRadius: 16,
                  padding: 28,
                  transition: "box-shadow 0.2s, border-color 0.2s",
                }}
                className="hover:shadow-lg"
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: `${PROD.green}12`,
                    marginBottom: 16,
                  }}
                >
                  <Icon style={{ width: 22, height: 22, color: PROD.green }} />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: PROD.black, marginBottom: 8 }}>{p.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: PROD.body }}>{p.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── WhatsApp Digest ─── */}
      <section style={{ background: PROD.black, color: PROD.white, padding: "80px 32px" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 48, alignItems: "center" }}>
          <div style={{ flex: "1 1 400px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 14px",
                borderRadius: 999,
                background: `${PROD.green}25`,
                marginBottom: 20,
              }}
            >
              <MessageCircle style={{ width: 14, height: 14, color: PROD.green }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: PROD.green }}>Daily WhatsApp Digest</span>
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 16, lineHeight: 1.15 }}>
              Every morning at 7:00, know what was said.
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: "#A0A0A0", marginBottom: 24 }}>
              You receive a structured digest of what was said about your brand in the last 24 hours —
              media, social, and AI engines. No app to open. No dashboard to check. Just open WhatsApp.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "Daily WhatsApp digest at 7:00",
                "Live dashboard with full drill-down",
                "Monthly PDF report for the board",
                "Real-time alerts when sentiment shifts",
              ].map((f) => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: PROD.green,
                      flexShrink: 0,
                    }}
                  >
                    <Check style={{ width: 12, height: 12, color: PROD.white }} />
                  </span>
                  <span style={{ fontSize: 14, color: "#D4D4D4" }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: "1 1 320px" }}>
            <div
              style={{
                background: "#1A1A1A",
                borderRadius: 20,
                padding: 24,
                border: "1px solid #2A2A2A",
                fontFamily: "monospace",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <MessageCircle style={{ width: 18, height: 18, color: PROD.green }} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>Harch Atelier · 7:00 AM</span>
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.7, color: "#A0A0A0" }}>
                <p style={{ color: PROD.white, fontWeight: 600, marginBottom: 8 }}>📊 Daily Digest — HarchCorp</p>
                <p>HarchIQ Score: <span style={{ color: PROD.green }}>82/100 (A)</span></p>
                <p>Media: 7 mentions · 0% negative</p>
                <p>AI Visibility: 100% (8/8 engines)</p>
                <p>Crisis: 4 alerts (1 critical)</p>
                <p style={{ marginTop: 12, color: PROD.green }}>→ Open dashboard for details</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How it works (pipeline) ─── */}
      <section style={{ background: PROD.white, borderTop: `1px solid ${PROD.border}`, borderBottom: `1px solid ${PROD.border}`, padding: "80px 32px" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", color: PROD.black, marginBottom: 12 }}>
              From a media mention to your WhatsApp in under 5 minutes.
            </h2>
            <p style={{ fontSize: 16, color: PROD.body, maxWidth: 620, margin: "0 auto" }}>
              Here's the pipeline that powers Harch Atelier.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 32 }}>
            {[
              { num: "01", title: "We monitor", desc: "30+ Moroccan & African media sources, social platforms, and 8 AI engines — scanned 24/7 in French, Arabic & English." },
              { num: "02", title: "HarchIQ analyzes", desc: "Every mention is classified by HarchIQ, our trainable AI. Positive / neutral / negative breakdowns per entity, topic, and source." },
              { num: "03", title: "We detect spikes", desc: "When negative sentiment spikes on a topic, the crisis pipeline triggers — severity scored, source tiered, impact estimated." },
              { num: "04", title: "We alert you", desc: "You get a WhatsApp alert within 5 minutes — before it becomes a crisis. Plus a daily 7:00 AM digest and monthly PDF report." },
            ].map((step) => (
              <div key={step.num} style={{ position: "relative", paddingLeft: 0 }}>
                <div style={{ fontSize: 40, fontWeight: 800, color: PROD.green, opacity: 0.18, lineHeight: 1, marginBottom: 8 }}>{step.num}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: PROD.black, marginBottom: 8 }}>{step.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: PROD.body }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section style={{ maxWidth: 1320, margin: "0 auto", padding: "40px 32px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", color: PROD.black, marginBottom: 12 }}>
            Pricing that scales with your reputation.
          </h2>
          <p style={{ fontSize: 16, color: PROD.body, maxWidth: 560, margin: "0 auto" }}>
            All plans include a 14-day free trial. No credit card required. Prices in MAD (Moroccan Dirham). Cancel anytime.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, alignItems: "stretch" }}>
          {[
            { name: "Starter", price: "499", desc: "For small teams monitoring one brand.", popular: false, features: ["1 brand monitored", "30+ media sources", "8 AI engines tracked", "Daily WhatsApp digest", "Sentiment analysis", "Web dashboard"] },
            { name: "Growth", price: "1990", desc: "For comms teams managing multiple brands.", popular: true, features: ["Everything in Starter, plus:", "Up to 5 brands", "Real-time crisis alerts (5-min)", "Monthly PDF board report", "Competitor benchmarking", "API access (beta)"] },
            { name: "Enterprise", price: "4990", desc: "For large organizations with custom needs.", popular: false, features: ["Everything in Growth, plus:", "Unlimited brands", "Custom AI training (HarchIQ)", "Dedicated WhatsApp number", "Custom data sources", "Priority support + SLA"] },
          ].map((tier) => (
            <div
              key={tier.name}
              style={{
                background: PROD.white,
                border: tier.popular ? `2px solid ${PROD.green}` : `1px solid ${PROD.border}`,
                borderRadius: 16,
                padding: 28,
                position: "relative",
                display: "flex",
                flexDirection: "column",
                boxShadow: tier.popular ? "0 8px 24px rgba(74,123,95,0.12)" : "none",
              }}
            >
              {tier.popular ? (
                <span
                  style={{
                    position: "absolute",
                    top: -12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: PROD.green,
                    color: PROD.white,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "4px 14px",
                    borderRadius: 999,
                    letterSpacing: "0.04em",
                  }}
                >
                  Most Popular
                </span>
              ) : null}
              <h3 style={{ fontSize: 18, fontWeight: 700, color: PROD.black, marginBottom: 6 }}>{tier.name}</h3>
              <p style={{ fontSize: 13, color: PROD.muted, marginBottom: 20, minHeight: 36 }}>{tier.desc}</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 24 }}>
                <span style={{ fontSize: 36, fontWeight: 700, color: PROD.black, letterSpacing: "-0.02em" }}>{tier.price}</span>
                <span style={{ fontSize: 13, color: PROD.muted }}>MAD / mois</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                {tier.features.map((f, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: i === 0 && tier.features[0].includes("Everything") ? PROD.slate : PROD.body, fontWeight: i === 0 && tier.features[0].includes("Everything") ? 600 : 400 }}>
                    <Check style={{ width: 14, height: 14, color: PROD.green, marginTop: 2, flexShrink: 0 }} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/client"
                style={{
                  display: "block",
                  textAlign: "center",
                  fontSize: 14,
                  fontWeight: 600,
                  color: tier.popular ? PROD.white : PROD.green,
                  background: tier.popular ? PROD.green : "transparent",
                  border: tier.popular ? "none" : `1px solid ${PROD.green}`,
                  padding: "11px 20px",
                  borderRadius: 10,
                  textDecoration: "none",
                  transition: "opacity 0.15s",
                }}
                className="hover:opacity-90"
              >
                Start free trial
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section style={{ maxWidth: 1320, margin: "0 auto", padding: "80px 32px", textAlign: "center" }}>
        <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em", color: PROD.black, marginBottom: 16 }}>
          One dashboard. Every signal that matters.
        </h2>
        <p style={{ fontSize: 16, color: PROD.body, maxWidth: 560, margin: "0 auto 32px" }}>
          Start monitoring your reputation today. 14-day free trial, no credit card required.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/client"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 15,
              fontWeight: 600,
              color: PROD.white,
              background: PROD.green,
              padding: "14px 28px",
              borderRadius: 10,
              textDecoration: "none",
            }}
          >
            Create your account
            <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
          <Link
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 15,
              fontWeight: 600,
              color: PROD.black,
              border: `1px solid ${PROD.border}`,
              background: PROD.white,
              padding: "14px 28px",
              borderRadius: 10,
              textDecoration: "none",
            }}
          >
            See live dashboard
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{ borderTop: `1px solid ${PROD.border}`, background: PROD.white, padding: "32px" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ShieldCheck style={{ width: 16, height: 16, color: PROD.green }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: PROD.black }}>
              Harch Atelier · AI Reputation Intelligence for Africa
            </span>
          </div>
          <span style={{ fontSize: 12, color: PROD.muted }}>© 2025 HarchCorp · Casablanca, Morocco</span>
        </div>
      </footer>
    </div>
  );
}
