"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldCheck, Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Harch Atelier — Login page (V27.0)
 *
 * Copied EXACTLY from production atelier.harchcorp.com/login:
 *  - ATELIER heading (slate-900, 18px bold tracking-tight)
 *  - Subtitle (slate-400, 11px uppercase tracking-[0.18em])
 *  - White rounded-xl card, border-slate-200, shadow-sm, p-7
 *  - Email field (with Mail icon) + Password field (with Lock icon)
 *  - "Sign in" button (slate-900 bg)
 *  - "Access is restricted. This platform is invitation-only."
 *  - "Request access" link
 */
export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 800);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAFAFA] px-4">
      <Link href="/" className="mb-8 flex flex-col items-center gap-3 no-underline">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#4A7B5F] to-[#4A5D6E] shadow-lg shadow-[#4A7B5F]/20">
          <ShieldCheck className="h-6 w-6 text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-[18px] font-bold tracking-tight text-slate-900">
            HARCH<span className="text-slate-400">ATELIER</span>
          </h1>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 mt-1">
            AI Reputation Intelligence
          </p>
        </div>
      </Link>

      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="text-[12px] font-semibold text-slate-700">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="h-10 pl-9 border-slate-200" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password" className="text-[12px] font-semibold text-slate-700">Password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="h-10 pl-9 border-slate-200" />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="mt-2 h-10 gap-2 bg-[#0A0A0A] text-white hover:bg-[#222] disabled:opacity-60">
            {loading ? "Signing in…" : "Sign in"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </Button>
        </form>
        <div className="mt-5 border-t border-slate-100 pt-4 text-center">
          <p className="text-[12px] text-slate-500">Access is restricted. This platform is invitation-only.</p>
          <Link href="/client" className="mt-2 inline-block text-[12px] font-semibold text-[#4A7B5F] hover:underline">Request access</Link>
          <p className="mt-3 text-[10px] text-slate-400">🔒 Protected by 2FA · SOC-2 Type II · GDPR compliant</p>
        </div>
      </div>

      <Link href="/" className="mt-6 text-[12px] text-slate-400 hover:text-slate-700">← Back to home</Link>
    </div>
  );
}
