import type { Metadata } from "next";
import { AccessPage } from "./AccessPage";

export const metadata: Metadata = {
  title: "Activate your account — HarchIQ Console",
  robots: { index: false, follow: false },
};

export default function Page({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token;
  if (!token) {
    return (
      <div style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace" }}>
        <div style={{ textAlign: "center" }}>
          <h1>Missing token</h1>
          <p>Check your invitation link.</p>
        </div>
      </div>
    );
  }
  return <AccessPage token={token} />;
}
