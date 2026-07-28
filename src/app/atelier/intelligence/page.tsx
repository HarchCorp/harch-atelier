// ═══════════════════════════════════════════════════════════════
//  RAW INTELLIGENCE EXPORT — HARCH ATELIER v4.1
//
//  Server component — metadata + client mount.
//  The page itself lives in ./IntelligencePage (client) because it
//  drives an async audit pipeline and polls /api/jobs/[id]/status.
//
//  V4.1 RÈGLE D'OR: this page EXPORTS raw forensic data. No charts,
//  no dashboards, no recommendations — just structured evidence
//  tables and a JSON download.
// ═══════════════════════════════════════════════════════════════

import type { Metadata } from "next";
import IntelligencePage from "./IntelligencePage";

export const metadata: Metadata = {
  title: { absolute: "Raw Intelligence Export — Harch Atelier" },
  description:
    "Generate forensic intelligence reports. Raw data, evidence quotes, source URLs. No recommendations.",
  robots: {
    // Tool is authenticated + per-user; no value in indexing.
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "https://atelier.harchcorp.com/atelier/intelligence",
  },
};

export default function Page() {
  return <IntelligencePage />;
}
