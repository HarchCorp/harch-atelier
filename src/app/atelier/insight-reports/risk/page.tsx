import type { Metadata } from "next";
import { InsightReportPage } from "../InsightReportTemplate";
import { REPORT_DATA } from "../reportData";

export const metadata: Metadata = {
  title: { absolute: "Risk Reports — 32-Category Risk Assessment | Harch Atelier" },
  description: "32 risk categories scored on Frequency × Impact × Velocity. Top 10 active risks with mitigation plan. Board-ready PDF in 5 business days.",
  alternates: { canonical: "https://atelier.harchcorp.com/insight-reports/risk" },
};

export default function Page() {
  return <InsightReportPage data={REPORT_DATA["risk"]} />;
}
