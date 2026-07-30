import type { Metadata } from "next";
import { AccessPage } from "./AccessPage";

export const metadata: Metadata = {
  title: "Activate your account — HarchIQ Console",
  robots: { index: false, follow: false },
};

// Next.js 16: searchParams is now a Promise
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    return (
      <div style={{ minHeight: "100vh", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#0a0a0a", margin: "0 0 12px" }}>Missing token</h1>
          <p style={{ fontSize: "15px", color: "#525252" }}>Check your invitation link.</p>
          <a href="/atelier/request-access" style={{ display: "inline-block", marginTop: "24px", fontSize: "13px", color: "#78716c", textDecoration: "underline" }}>Request access</a>
        </div>
      </div>
    );
  }
  return <AccessPage token={token} />;
}
