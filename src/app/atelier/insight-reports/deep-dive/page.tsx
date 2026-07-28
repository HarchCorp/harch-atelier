import type { Metadata } from "next";
import { InsightReportPage } from "../InsightReportTemplate";
import { REPORT_DATA } from "../reportData";

export const metadata: Metadata = {
  title: { absolute: "Deep Dive Reports — Bespoke Research | Harch Atelier" },
  description: "Custom research on any topic, competitor, or market. 30-page PDF + executive deck + 2-hour workshop. Senior analyst consultation included.",
  alternates: { canonical: "https://atelier.harchcorp.com/insight-reports/deep-dive" },
};

export default function Page() {
  return <InsightReportPage data={REPORT_DATA["deep-dive"]} />;
}
