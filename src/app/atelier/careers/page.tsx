import type { Metadata } from "next";
import CareersPage from "./CareersPage";

export const metadata: Metadata = {
  title: { absolute: "Careers — Join Harch | Harch Atelier" },
  description: "Build the future of reputation intelligence for Morocco and Africa. 8 open roles. Competitive salary, hybrid work, top equipment, real impact.",
  alternates: { canonical: "https://atelier.harchcorp.com/careers" },
};

export default function Page() {
  return <CareersPage />;
}
