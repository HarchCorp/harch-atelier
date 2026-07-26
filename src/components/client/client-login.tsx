"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight, Mail, Building2, Sparkles } from "lucide-react";
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
import { cn } from "@/lib/utils";

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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4">
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="relative w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-900/30">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-[20px] font-bold tracking-tight text-slate-900">Harch<span className="text-slate-400">Atelier</span></h1>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">Client Reputation Portal</p>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
          <div className="mb-4">
            <h2 className="text-[16px] font-bold text-slate-900">Sign in to your client space</h2>
            <p className="mt-1 text-[12px] text-slate-500">Monitor what media and AI say about your brand — 30+ African sources, 8 AI engines, real-time alerts.</p>
          </div>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="brand" className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">Your brand</Label>
              <Select value={brandIdx} onValueChange={setBrandIdx}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DEMO_CLIENTS.map((c, i) => (
                    <SelectItem key={i} value={String(i)}>
                      <Building2 className="mr-1.5 inline h-3.5 w-3.5 text-slate-400" />
                      <span className="font-medium">{c.brand}</span>
                      <span className="ml-1.5 text-[10px] text-slate-400">· {c.plan}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input id="email" type="email" placeholder={DEMO_CLIENTS[parseInt(brandIdx, 10)]?.email || "you@company.com"} value={email} onChange={(e) => setEmail(e.target.value)} className="h-10 pl-9" />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="h-10 gap-2 bg-slate-900 text-white hover:bg-slate-800">
              {loading ? <Sparkles className="h-4 w-4 animate-pulse" /> : (<>Access my reputation <ArrowRight className="h-4 w-4" /></>)}
            </Button>
          </form>
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] text-slate-400">
            <span>Demo portal · no password needed</span>
            <span className={cn("rounded px-1.5 py-0.5 font-semibold uppercase", "bg-emerald-50 text-emerald-700")}>{DEMO_CLIENTS[parseInt(brandIdx, 10)]?.plan} plan</span>
          </div>
        </div>
        <p className="mt-4 text-center text-[10px] text-slate-400">Powered by HarchIQ · AI Reputation Intelligence for Africa</p>
      </div>
    </div>
  );
}
