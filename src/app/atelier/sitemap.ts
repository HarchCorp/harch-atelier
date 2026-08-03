import { MetadataRoute } from "next";

// ─── ATELIER SITEMAP ─────────────────────────────────────────────
// Dedicated sitemap for the atelier.harchcorp.com subdomain.
// Generated at /atelier/sitemap.xml — see Next.js docs on
// nested sitemaps for route segments.

const BASE_URL = "https://atelier.harchcorp.com";
const now = new Date();

const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1.0, changeFrequency: "weekly" },
  { path: "/products", priority: 1.0, changeFrequency: "monthly" },
  { path: "/products/reputation-dashboards", priority: 1.0, changeFrequency: "monthly" },
  { path: "/products/enterprise-risk-intelligence", priority: 1.0, changeFrequency: "monthly" },
  { path: "/products/api-mcp", priority: 1.0, changeFrequency: "monthly" },
  { path: "/products/integrations", priority: 1.0, changeFrequency: "monthly" },
  { path: "/changelog", priority: 0.8, changeFrequency: "weekly" },
  { path: "/compare", priority: 0.9, changeFrequency: "weekly" },
  { path: "/solutions", priority: 1.0, changeFrequency: "monthly" },
  { path: "/decision-augmentation", priority: 1.0, changeFrequency: "monthly" },
  { path: "/harch-100", priority: 1.0, changeFrequency: "weekly" },
  { path: "/risk-tracker", priority: 1.0, changeFrequency: "weekly" },
  { path: "/reputation-tracker", priority: 1.0, changeFrequency: "weekly" },
  { path: "/media-intelligence", priority: 1.0, changeFrequency: "monthly" },
  { path: "/ask-harchiq", priority: 1.0, changeFrequency: "monthly" },
  { path: "/insights", priority: 1.0, changeFrequency: "weekly" },
  { path: "/news", priority: 1.0, changeFrequency: "daily" },
  { path: "/blog", priority: 1.0, changeFrequency: "weekly" },
  { path: "/expertise/enterprise-risk", priority: 0.9, changeFrequency: "monthly" },
  { path: "/expertise/reputation-risk", priority: 0.9, changeFrequency: "monthly" },
  { path: "/expertise/pr-comms", priority: 0.9, changeFrequency: "monthly" },
  { path: "/expertise/esg", priority: 0.9, changeFrequency: "monthly" },
  { path: "/expertise/regulation", priority: 0.9, changeFrequency: "monthly" },
  { path: "/approach/our-ai", priority: 0.9, changeFrequency: "monthly" },
  { path: "/approach/our-data", priority: 0.9, changeFrequency: "monthly" },
  { path: "/approach/our-commitment", priority: 0.9, changeFrequency: "monthly" },
  { path: "/insight-reports/risk", priority: 0.9, changeFrequency: "monthly" },
  { path: "/insight-reports/reputation-risk", priority: 0.9, changeFrequency: "monthly" },
  { path: "/insight-reports/reputation", priority: 0.9, changeFrequency: "monthly" },
  { path: "/insight-reports/media-impact", priority: 0.9, changeFrequency: "monthly" },
  { path: "/insight-reports/deep-dive", priority: 0.9, changeFrequency: "monthly" },
  { path: "/flagship-report", priority: 1.0, changeFrequency: "weekly" },
  { path: "/health", priority: 0.3, changeFrequency: "always" },
  { path: "/industries/banking", priority: 0.9, changeFrequency: "weekly" },
  { path: "/industries/telecom", priority: 0.9, changeFrequency: "weekly" },
  { path: "/industries/mining", priority: 0.9, changeFrequency: "weekly" },
  { path: "/industries/aviation", priority: 0.9, changeFrequency: "weekly" },
  { path: "/industries/retail", priority: 0.9, changeFrequency: "weekly" },
  { path: "/industries/energy", priority: 0.9, changeFrequency: "weekly" },
  { path: "/companies/ocp-group", priority: 0.9, changeFrequency: "weekly" },
  { path: "/companies/attijariwafa-bank", priority: 0.9, changeFrequency: "weekly" },
  { path: "/companies/maroc-telecom", priority: 0.9, changeFrequency: "weekly" },
  { path: "/companies/royal-air-maroc", priority: 0.9, changeFrequency: "weekly" },
  { path: "/companies/bank-of-africa", priority: 0.9, changeFrequency: "weekly" },
  { path: "/customers", priority: 0.9, changeFrequency: "monthly" },
  { path: "/resources", priority: 0.9, changeFrequency: "weekly" },
  { path: "/pricing", priority: 0.9, changeFrequency: "monthly" },
  { path: "/method", priority: 0.8, changeFrequency: "monthly" },
  { path: "/use-cases", priority: 0.8, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.8, changeFrequency: "monthly" },
  { path: "/glossary", priority: 0.8, changeFrequency: "monthly" },
  { path: "/audit", priority: 0.9, changeFrequency: "weekly" },
  { path: "/dashboard", priority: 0.8, changeFrequency: "daily" },
  { path: "/templates", priority: 0.6, changeFrequency: "monthly" },
  { path: "/templates/institutional-audit", priority: 0.7, changeFrequency: "monthly" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/careers", priority: 0.7, changeFrequency: "weekly" },
  { path: "/partners", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
  { path: "/trust", priority: 0.8, changeFrequency: "monthly" },
  { path: "/security", priority: 0.7, changeFrequency: "monthly" },
  { path: "/legal", priority: 0.6, changeFrequency: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((r) => ({
    url: `${BASE_URL}/atelier${r.path === "" ? "" : r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
