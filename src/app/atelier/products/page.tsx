import type { Metadata } from "next";
import ProductsPage from "./ProductsPage";

export const metadata: Metadata = {
  title: { absolute: "Products — Platform, API & MCP, Insight Reports, Dashboards, Briefings | Harch Atelier" },
  description: "Five integrated products: Reputation Intelligence Platform, API & MCP Integrations, Insight Reports, Advanced Dashboards, Newsletters and Briefings. Built for every need from data analysts to C-suite.",
  alternates: { canonical: "https://atelier.harchcorp.com/products" },
  openGraph: {
    title: "Products — Harch Atelier",
    description: "Five integrated products for every reputation intelligence need.",
    url: "https://atelier.harchcorp.com/products",
    type: "website",
  },
};

export default function Page() {
  return <ProductsPage />;
}
