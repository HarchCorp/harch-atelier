import type { Metadata } from "next";
import { DemoPage } from "./DemoPage";

export const metadata: Metadata = {
  title: "Executive Demo — HarchIQ Console",
  description:
    "Pre-populated demo environment for Comex presentations. One click per offer.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function DemoPageRoute() {
  return <DemoPage />;
}
