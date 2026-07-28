import type { Metadata } from "next";
import IntegrationsPage from "./IntegrationsPage";

export const metadata: Metadata = {
  title: { absolute: "Integrations — Slack, Teams, WhatsApp, Tableau, Claude, ChatGPT, Cursor | Harch Atelier" },
  description: "Connect Harch AI to your favorite tools. 12 native integrations across communication (Slack, Teams, WhatsApp, Email), BI & analytics (Tableau, Power BI, Looker, Google Sheets), and AI & automation (Claude, ChatGPT, Cursor, Zapier). Plus a REST API and MCP server for custom builds.",
  alternates: { canonical: "https://atelier.harchcorp.com/products/integrations" },
  openGraph: {
    title: "Integrations — Harch Atelier",
    description: "Connect Harch AI to Slack, Teams, WhatsApp, Tableau, Power BI, Looker, Claude, ChatGPT, Cursor, and Zapier.",
    url: "https://atelier.harchcorp.com/products/integrations",
    type: "website",
  },
};

export default function Page() {
  return <IntegrationsPage />;
}
