import type { Metadata } from "next";
import { InsightReportPage } from "../InsightReportTemplate";
import { REPORT_DATA } from "../reportData";

export const metadata: Metadata = {
  title: { absolute: "Reputation Risk Reports — Narrative Detection | Harch Atelier" },
  description: "5 dominant narratives with strength scoring. Crisis playbook for top 3 threats. 16-page PDF + analyst briefing in 5 business days.",
  alternates: { canonical: "https://atelier.harchcorp.com/insight-reports/reputation-risk" },
};

export default function Page() {
  return <InsightReportPage data={REPORT_DATA["reputation-risk"]} />;
}
