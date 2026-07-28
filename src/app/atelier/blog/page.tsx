import type { Metadata } from "next";
import BlogIndexPage from "./BlogIndexPage";

export const metadata: Metadata = {
  title: { absolute: "Blog — Insights on Reputation Intelligence | Harch Atelier" },
  description:
    "Field notes, methodology deep-dives and case studies on Moroccan and African reputation intelligence. 15 articles on reputation risk, ESG, AI visibility, regulation and PR & Comms.",
  alternates: { canonical: "https://atelier.harchcorp.com/blog" },
  openGraph: {
    title: "Harch Atelier Blog — Insights on reputation intelligence",
    description:
      "15 in-depth articles on Moroccan and African reputation intelligence: banking, ESG, AI visibility, regulation, crisis comms and methodology.",
    type: "website",
  },
};

export default function Page() {
  return <BlogIndexPage />;
}
