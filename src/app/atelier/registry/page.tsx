import type { Metadata } from "next";
import RegistryPageClient from "./RegistryPageClient";

// ═══════════════════════════════════════════════════════════════
//  REGISTRE NATIONAL DES CRISES — Server entry
//
//  Server component (metadata + client import).
//  All interactivity lives in RegistryPageClient.tsx.
// ═══════════════════════════════════════════════════════════════

export const metadata: Metadata = {
  title: "Registre National des Crises Réputationnelles",
  description:
    "8 crises réputationnelles marocaines (2018-2023) — pattern matching, rétro-audit, et leçons apprises. Timeline interactive, heatmap secteurs × années, et analyse statistique.",
  alternates: {
    canonical: "https://atelier.harchcorp.com/atelier/registry",
  },
  openGraph: {
    title: "Registre National des Crises — Harch Atelier",
    description:
      "8 crises réputationnelles marocaines (2018-2023) — pattern matching, rétro-audit, et leçons apprises. La mémoire institutionnelle de Harch.",
    url: "https://atelier.harchcorp.com/atelier/registry",
    type: "website",
  },
};

export default function RegistryPage() {
  return <RegistryPageClient />;
}
