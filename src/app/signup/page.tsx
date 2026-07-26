"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldCheck, Mail, Lock, Building2, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Harch Atelier — Signup page (V27.0)
 * Matches the login page style exactly. Production-style invitation flow.
 */
export default function SignupPage() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const hasLength = password.length >= 8;
  const hasMixed = /[A-Z]/.test(password) && /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const strength = [hasLength, hasMixed, hasNumber].filter(Boolean).length;
  const strengthLabel = strength <= 1 ? "Weak" : strength === 2 ? "Fair" : "Strong";
  const strengthColor = strength <= 1 ? "#E11D48" : strength === 2 ? "#F59E0B" : "#4A7B5F";
  const passwordsMatch = confirm.length > 0 && password === confirm;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return;
    setLoading(true);
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1000);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAFAFA] px-4 py-8">
      <Link href="/" className="mb-6 flex flex-col items-center gap-3 no-underline">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#4A7B5F] to-[#4A5D6E] shadow-lg shadow-[#4A7B5F]/20">
          <ShieldCheck className="h-6 w-6 text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-[18px] font-bold tracking-tight text-slate-900">
            HARCH<span className="text-slate-400">ATELIER</span>
          </h1>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 mt-1">
            Create your account
          </p>
        </div>
      </Link>

      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name" className="text-[12px] font-semibold text-slate-700">Full name</Label>
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Amine Harch" className="h-10 pl-9 border-slate-200" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="text-[12px] font-semibold text-slate-700">Work email</Label>
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
            {password.length > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex gap-1 flex-1">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-1 flex-1 rounded-full" style={{ background: i < strength ? strengthColor : "#E5E5E5" }} />
                  ))}
                </div>
                <span className="text-[10px] font-semibold" style={{ color: strengthColor }}>{strengthLabel}</span>
              </div>
            )}
            {password.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                <span className="flex items-center gap-1 text-[9px]" style={{ color: hasLength ? "#4A7B5F" : "#71717A" }}>
                  <Check className="h-2.5 w-2.5" /> 8+ chars
                </span>
                <span className="flex items-center gap-1 text-[9px]" style={{ color: hasMixed ? "#4A7B5F" : "#71717A" }}>
                  <Check className="h-2.5 w-2.5" /> Aa
                </span>
                <span className="flex items-center gap-1 text-[9px]" style={{ color: hasNumber ? "#4A7B5F" : "#71717A" }}>
                  <Check className="h-2.5 w-2.5" /> 123
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirm" className="text-[12px] font-semibold text-slate-700">Confirm password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input id="confirm" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" className="h-10 pl-9 border-slate-200" />
            </div>
            {confirm.length > 0 && (
              <span className="text-[10px] font-medium" style={{ color: passwordsMatch ? "#4A7B5F" : "#E11D48" }}>
                {passwordsMatch ? "✓ Passwords match" : "✗ Passwords don't match"}
              </span>
            )}
          </div>
          <Button type="submit" disabled={loading || !passwordsMatch} className="mt-2 h-10 gap-2 bg-[#0A0A0A] text-white hover:bg-[#222] disabled:opacity-60">
            {loading ? "Creating account…" : "Create account"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </Button>
        </form>

        <div className="mt-5 border-t border-slate-100 pt-4">
          <div className="flex flex-col gap-2">
            {["14-day free trial", "No credit card required", "SOC-2 compliant · GDPR ready"].map((t) => (
              <div key={t} className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-[#4A7B5F]" />
                <span className="text-[12px] text-slate-600">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-5 text-[12px] text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[#4A7B5F] hover:underline">Sign in</Link>
      </p>
      <Link href="/" className="mt-3 text-[12px] text-slate-400 hover:text-slate-700">← Back to home</Link>
    </div>
  );
}
