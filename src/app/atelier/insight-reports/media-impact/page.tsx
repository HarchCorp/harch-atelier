import type { Metadata } from "next";
import { InsightReportPage } from "../InsightReportTemplate";
import { REPORT_DATA } from "../reportData";

export const metadata: Metadata = {
  title: { absolute: "Media Impact Reports — PR Campaign Measurement | Harch Atelier" },
  description: "Before/during/after PR campaign analysis. Sentiment shift, share of voice, AI engine pickup, source authority, ROI calculation. 14-page PDF in 5 days.",
  alternates: { canonical: "https://atelier.harchcorp.com/insight-reports/media-impact" },
};

export default function Page() {
  return <InsightReportPage data={REPORT_DATA["media-impact"]} />;
}
