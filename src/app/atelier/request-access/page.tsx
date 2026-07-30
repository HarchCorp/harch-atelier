import type { Metadata } from "next";
import { RequestAccessPage } from "./RequestAccessPage";

export const metadata: Metadata = {
  title: "Request Access — HarchIQ Console",
  description: "Request access to the HarchIQ Console. Access is granted by the Harch Atelier team.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <RequestAccessPage />;
}
