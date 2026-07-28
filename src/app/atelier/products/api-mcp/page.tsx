import type { Metadata } from "next";
import ApiMcpPage from "./ApiMcpPage";

export const metadata: Metadata = {
  title: { absolute: "API & MCP Integrations — REST API, MCP Server, Webhooks, SDKs | Harch Atelier" },
  description: "Build custom reputation intelligence into your tools. REST API with 8 endpoints, MCP server for Claude / ChatGPT / Cursor / Windsurf, webhooks for score changes and risk spikes, and official SDKs in Python, TypeScript, Go, and Ruby.",
  alternates: { canonical: "https://atelier.harchcorp.com/products/api-mcp" },
  openGraph: {
    title: "API & MCP Integrations — Harch Atelier",
    description: "REST API, MCP server, webhooks, and SDKs. Pull Harch reputation intelligence into your BI, CRM, and AI assistants.",
    url: "https://atelier.harchcorp.com/products/api-mcp",
    type: "website",
  },
};

export default function Page() {
  return <ApiMcpPage />;
}
