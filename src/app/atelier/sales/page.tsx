"use client";

import { useState } from "react";
import { C } from "../components/tokens";
import { BrandBadge } from "@/components/BrandBadge";

// ═══════════════════════════════════════════════════════════════
//  SALES DASHBOARD — The nuclear button
//
//  Lists all 5 surgical email targets with their crisis event.
//  Super_admin can send individually or batch-send all 5.
//
//  Each email contains:
//    - The Dircom's name + company
//    - A REAL crisis that hit their company
//    - The 48h advance warning proof
//    - Link to the full retro-audit
//    - CTA: "On en parle 2 minutes ?"
// ═══════════════════════════════════════════════════════════════

interface SendResult {
  company: string;
  email: string;
  subject: string;
  status: "SENT" | "FAILED";
  id?: string;
  error?: string;
}

const TARGETS = [
  { slug: "ocp-group", name: "OCP Group", sector: "Mining", email: "communication@ocp.ma", crisis: "Boycott 2018", date: "2018-04-20" },
  { slug: "attijariwafa-bank", name: "Attijariwafa Bank", sector: "Banking", email: "communication@attijariwafa.com", crisis: "Frais bancaires 2023", date: "2023-01-15" },
  { slug: "bank-of-africa", name: "Bank of Africa", sector: "Banking", email: "communication@bankofafrica.ma", crisis: "Restructuration 2022", date: "2022-09-01" },
  { slug: "maroc-telecom", name: "Maroc Telecom", sector: "Telecom", email: "communication@iam.ma", crisis: "Panne réseau 2023", date: "2023-06-10" },
  { slug: "royal-air-maroc", name: "Royal Air Maroc", sector: "Aviation", email: "communication@royalairmaroc.com", crisis: "Retards été 2023", date: "2023-07-15" },
];

export default function SalesDashboardPage() {
  const [sending, setSending] = useState<string | null>(null);
  const [results, setResults] = useState<SendResult[]>([]);
  const [batchResult, setBatchResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendOne = async (slug: string) => {
    setSending(slug);
    setError(null);
    try {
      const res = await fetch("/api/sales/send-surgical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      if (data.results && data.results.length > 0) {
        setResults((prev) => [...prev, ...data.results]);
        const r = data.results[0];
        setBatchResult(r.status === "SENT"
          ? `✓ Email envoyé à ${r.company} (${r.email}) — Resend ID: ${r.id}`
          : `✕ Échec pour ${r.company}: ${r.error}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSending(null);
    }
  };

  const sendAll = async () => {
    setSending("ALL");
    setError(null);
    setResults([]);
    try {
      const res = await fetch("/api/sales/send-surgical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      setResults(data.results || []);
      setBatchResult(data.message || `${data.sent} envoyés, ${data.failed} échoués`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSending(null);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: C.fontSans, color: C.text }}>
      <header style={{ padding: "16px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: C.bg }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <BrandBadge subsidiary="Atelier" size="sm" theme="light" />
          <span style={{ fontFamily: C.fontMono, fontSize: "10px", color: "#ef4444", letterSpacing: "0.14em", textTransform: "uppercase", borderLeft: `1px solid ${C.border}`, paddingLeft: "10px" }}>
            Sales — Email Chirurgical
          </span>
        </div>
        <button
          onClick={sendAll}
          disabled={sending === "ALL"}
          style={{
            padding: "10px 20px",
            background: sending === "ALL" ? C.border : "#ef4444",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontFamily: C.fontMono,
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            cursor: sending === "ALL" ? "not-allowed" : "pointer",
          }}
        >
          {sending === "ALL" ? "Envoi en cours…" : "⚡ Envoyer les 5 emails →"}
        </button>
      </header>

      <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
          Cibles — Top 5 Marocain
        </h1>
        <p style={{ fontSize: "13px", color: C.textBody, marginBottom: "24px" }}>
          Chaque email contient une crise RÉELLE vécue par l'entreprise, la preuve des 48h d'anticipation, et un lien vers le rétro-audit complet.
        </p>

        {/* Banners */}
        {batchResult && (
          <div style={{ padding: "12px 16px", background: batchResult.startsWith("✓") ? "#ecfdf5" : "#fef2f2", border: `1px solid ${batchResult.startsWith("✓") ? "#a7f3d0" : "#fecaca"}`, borderRadius: "8px", fontSize: "13px", color: batchResult.startsWith("✓") ? "#065f46" : "#991b1b", marginBottom: "16px" }}>
            {batchResult}
          </div>
        )}
        {error && (
          <div style={{ padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", fontSize: "13px", color: "#991b1b", marginBottom: "16px" }}>
            ✕ {error}
          </div>
        )}

        {/* Targets table */}
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "12px", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 120px 140px 120px", gap: "12px", padding: "12px 16px", borderBottom: `1px solid ${C.border}`, fontFamily: C.fontMono, fontSize: "10px", fontWeight: 700, color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            <span>Entreprise</span>
            <span>Secteur</span>
            <span>Crise</span>
            <span>Email</span>
            <span>Action</span>
          </div>
          {TARGETS.map((t) => {
            const result = results.find((r) => r.company === t.name);
            const isSending = sending === t.slug;
            return (
              <div key={t.slug} style={{ display: "grid", gridTemplateColumns: "1fr 100px 120px 140px 120px", gap: "12px", padding: "14px 16px", borderBottom: `1px solid ${C.border || C.border}`, fontSize: "13px", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, color: C.text }}>{t.name}</div>
                  <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: C.fontMono }}>{t.date}</div>
                </div>
                <span style={{ fontSize: "11px", color: C.textBody }}>{t.sector}</span>
                <span style={{ fontSize: "11px", color: "#ef4444", fontWeight: 600 }}>{t.crisis}</span>
                <span style={{ fontSize: "10px", color: C.textMuted, fontFamily: C.fontMono, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.email}</span>
                <div>
                  {result ? (
                    <span style={{ fontSize: "11px", fontWeight: 700, fontFamily: C.fontMono, color: result.status === "SENT" ? "#10b981" : "#ef4444" }}>
                      {result.status === "SENT" ? "✓ ENVOYÉ" : "✕ ÉCHEC"}
                    </span>
                  ) : (
                    <button
                      onClick={() => sendOne(t.slug)}
                      disabled={isSending}
                      style={{
                        padding: "6px 12px",
                        background: isSending ? C.border : C.bgSubtle,
                        color: isSending ? C.textMuted : C.text,
                        border: `1px solid ${C.border}`,
                        borderRadius: "4px",
                        fontFamily: C.fontMono,
                        fontSize: "10px",
                        fontWeight: 700,
                        cursor: isSending ? "not-allowed" : "pointer",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      {isSending ? "…" : "Envoyer →"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Email preview info */}
        <div style={{ marginTop: "24px", padding: "16px 20px", background: C.bgSubtle, borderRadius: "8px", fontSize: "12px", color: C.textBody, lineHeight: 1.6 }}>
          <strong style={{ color: C.text }}>Contenu de l'email :</strong> Chaque email contient le nom de l'entreprise, la crise réelle vécue, la date du premier signal détectable, la preuve des 48h d'anticipation, un lien vers le rétro-audit complet, et un CTA clair : "On en parle 2 minutes ?"
          <br /><br />
          <strong style={{ color: C.text }}>Configuration requise :</strong> RESEND_API_KEY doit être configuré sur Vercel (Project → Settings → Environment Variables). Sans cette clé, les emails ne partent pas.
        </div>
      </main>
    </div>
  );
}
