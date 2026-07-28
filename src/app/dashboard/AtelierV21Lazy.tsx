"use client";
import dynamic from "next/dynamic";
const AtelierV21Client = dynamic(() => import("./AtelierV21Client"), {
  ssr: false,
  loading: () => <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc" }}><p style={{ fontSize: "14px", color: "#64748b" }}>Loading dashboard…</p></div>,
});
export default function AtelierV21Lazy({ data }: { data: any }) {
  return <AtelierV21Client data={data} />;
}
