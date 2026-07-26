"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ArrowRight, Mail, Building2, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClientStore, DEMO_CLIENTS } from "@/lib/client-store";
import { toast } from "sonner";

/**
 * Harch Atelier — Client Login (V26.0)
 *
 * Uses the SAME color palette as the landing page (production atelier.harchcorp.com):
 * #0A0A0A, #FFFFFF, #FAFAFA, #4A7B5F (green), #4A5D6E (slate), #525252, #71717A.
 * No more mismatched slate-900/emerald-700 — this matches the home page exactly.
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

export function ClientLogin() {
  const router = useRouter();
  const login = useClientStore((s) => s.login);
  const [email, setEmail] = React.useState("");
  const [brandIdx, setBrandIdx] = React.useState("0");
  const [loading, setLoading] = React.useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const client = DEMO_CLIENTS[parseInt(brandIdx, 10)];
    if (!client) return;
    setLoading(true);
    setTimeout(() => {
      login({
        brand: client.brand,
        email: email || client.email,
        contactName: client.contactName,
        plan: client.plan,
        loginAt: Date.now(),
      });
      toast.success("Welcome, " + client.contactName, {
        description: "Monitoring reputation for " + client.brand,
      });
      router.refresh();
    }, 600);
  };

  return (
    <div style={{ background: PROD.bg, color: PROD.black, minHeight: "100vh" }}>
      {/* Header — matches landing page exactly */}
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
            <span style={{ fontSize: 15, fontWeight: 700, color: PROD.black }}>
              Harch<span style={{ color: PROD.muted }}>Atelier</span>
            </span>
          </Link>
          <Link
            href="/"
            style={{ fontSize: 13, fontWeight: 600, color: PROD.slate, textDecoration: "none" }}
          >
            ← Back to home
          </Link>
        </div>
      </header>

      {/* Body */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 32px", minHeight: "calc(100vh - 64px)" }}>
        <div style={{ width: "100%", maxWidth: 440 }}>
          {/* Logo + heading */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 56,
                height: 56,
                borderRadius: 14,
                background: `linear-gradient(135deg, ${PROD.green}, ${PROD.slate})`,
                marginBottom: 16,
                boxShadow: "0 8px 24px rgba(74,123,95,0.25)",
              }}
            >
              <ShieldCheck style={{ width: 28, height: 28, color: PROD.white }} />
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", color: PROD.black, marginBottom: 8 }}>
              Sign in to your client space
            </h1>
            <p style={{ fontSize: 14, color: PROD.body, maxWidth: 340, margin: "0 auto" }}>
              Monitor what media and AI say about your brand — 30+ African sources, 8 AI engines, real-time alerts.
            </p>
          </div>

          {/* Form card */}
          <form
            onSubmit={handleLogin}
            style={{
              background: PROD.white,
              border: `1px solid ${PROD.border}`,
              borderRadius: 16,
              padding: 28,
              display: "flex",
              flexDirection: "column",
              gap: 18,
              boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: PROD.slate, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Your brand
              </label>
              <Select value={brandIdx} onValueChange={setBrandIdx}>
                <SelectTrigger style={{ height: 44, borderColor: PROD.border }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEMO_CLIENTS.map((c, i) => (
                    <SelectItem key={i} value={String(i)}>
                      <Building2 style={{ marginRight: 6, width: 14, height: 14, color: PROD.muted, display: "inline" }} />
                      <span style={{ fontWeight: 500 }}>{c.brand}</span>
                      <span style={{ marginLeft: 6, fontSize: 11, color: PROD.muted }}>· {c.plan}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: PROD.slate, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Email
              </label>
              <div style={{ position: "relative" }}>
                <Mail style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: PROD.muted }} />
                <Input
                  id="email"
                  type="email"
                  placeholder={DEMO_CLIENTS[parseInt(brandIdx, 10)]?.email || "you@company.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ height: 44, paddingLeft: 36, borderColor: PROD.border }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                height: 44,
                fontSize: 14,
                fontWeight: 600,
                color: PROD.white,
                background: `linear-gradient(135deg, ${PROD.green}, ${PROD.slate})`,
                border: "none",
                borderRadius: 10,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                transition: "opacity 0.15s",
              }}
            >
              {loading ? (
                <Sparkles style={{ width: 16, height: 16, animation: "pulse 1.5s infinite" }} />
              ) : (
                <>
                  Access my reputation
                  <ArrowRight style={{ width: 16, height: 16 }} />
                </>
              )}
            </button>

            {/* Trust row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, paddingTop: 8, borderTop: `1px solid ${PROD.border}` }}>
              {["14-day trial", "No credit card", "Cancel anytime"].map((t) => (
                <span key={t} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: PROD.muted }}>
                  <Check style={{ width: 12, height: 12, color: PROD.green }} />
                  {t}
                </span>
              ))}
            </div>
          </form>

          <p style={{ textAlign: "center", fontSize: 12, color: PROD.muted, marginTop: 20 }}>
            Powered by HarchIQ · AI Reputation Intelligence for Africa
          </p>
        </div>
      </div>
    </div>
  );
}
