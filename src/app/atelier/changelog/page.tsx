import type { Metadata } from "next";
import ChangelogPage from "./ChangelogPage";

export const metadata: Metadata = {
  title: { absolute: "Changelog — Product Updates | Harch Atelier" },
  description: "Every update to the Harch Atelier platform — new features, improvements, bug fixes, and breaking changes. Subscribe to stay informed.",
  alternates: { canonical: "https://atelier.harchcorp.com/atelier/changelog" },
  openGraph: {
    title: "Changelog — Harch Atelier",
    description: "Product updates, new features, and bug fixes.",
    url: "https://atelier.harchcorp.com/atelier/changelog",
    type: "website",
  },
};

export default function Page() {
  return <ChangelogPage />;
}
