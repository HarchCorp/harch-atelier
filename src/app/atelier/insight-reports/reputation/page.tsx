import type { Metadata } from "next";
import { InsightReportPage } from "../InsightReportTemplate";
import { REPORT_DATA } from "../reportData";

export const metadata: Metadata = {
  title: { absolute: "Reputation Reports — Full Audit with Score & Pillars | Harch Atelier" },
  description: "24-page flagship report. Reputation score, Innovation/Performance/Purpose pillars, 9 themes, top 30 articles, 5 narratives, 5 risks, 5 competitors, 90-day action plan.",
  alternates: { canonical: "https://atelier.harchcorp.com/insight-reports/reputation" },
};

export default function Page() {
  return <InsightReportPage data={REPORT_DATA["reputation"]} />;
}
