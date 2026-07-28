"use client";
import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { ShieldCheck, Lock, Mail, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (!res || res.error) { setError("Invalid email or password."); setLoading(false); return; }
      window.location.href = "/dashboard";
    } catch { setError("An error occurred during sign in."); setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white mb-3">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h1 className="text-[18px] font-bold tracking-tight text-slate-900">HARCH<span className="text-slate-400">ATELIER</span></h1>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 mt-1">Risk Intelligence</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-7">
          {error && (
            <div className="mb-4 flex items-center gap-2 px-3 py-2.5 bg-rose-50 border border-rose-200 rounded-lg text-[12px] text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0" />{error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} placeholder="admin@harchcorp.com"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-[13px] text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 focus:outline-none transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-[13px] text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 focus:outline-none transition-all" />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white font-semibold text-[13px] rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (<><Loader2 className="h-4 w-4 animate-spin" />Signing in...</>) : "Sign in"}
            </button>
          </form>
        </div>
        <div className="text-center mt-5">
          <p className="text-[11px] text-slate-400">Access is restricted. This platform is invitation-only.</p>
          <Link href="/contact" className="text-[11px] text-slate-500 hover:text-slate-700 mt-1 inline-block">Request access</Link>
        </div>
      </div>
    </div>
  );
}
