import type { Metadata } from "next";
import { ApiDocsPage } from "./ApiDocsPage";

export const metadata: Metadata = {
  title: "API Documentation — Harch Atelier",
  description:
    "REST API reference for the Harch Atelier reputation intelligence platform. Authentication, endpoints, parameters, response formats, and code examples in curl, JavaScript, and Python.",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://atelier.harchcorp.com/atelier/api-docs" },
};

export default function Page() {
  return <ApiDocsPage />;
}
