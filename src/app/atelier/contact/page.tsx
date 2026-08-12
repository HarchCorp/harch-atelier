import { redirect } from "next/navigation";
import type { Metadata } from "next";

// ═══════════════════════════════════════════════════════════════
//  /atelier/contact — REDIRECT PERMANENT vers /atelier/audit
//
//  La page contact a été enterrée. Toute la fonctionnalité de lead
//  gen est maintenant sur /atelier/audit (formulaire 3 étapes plus
//  riche : company, sources, goals, competitors, contact).
//
//  Tous les CTAs "Contacter le service commercial" pointent vers
//  /atelier/audit. Cette page ne fait que rediriger pour préserver
//  les anciens liens/bookmarks.
// ═══════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: "Audit — Harch Atelier",
  robots: { index: false, follow: true }, // noindex + follow to pass SEO juice
};

export const dynamic = "force-dynamic";

export default function ContactRedirect() {
  redirect("/atelier/audit");
}
