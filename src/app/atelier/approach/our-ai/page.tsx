import type { Metadata } from "next";
import OurAIPage from "./OurAIPage";

export const metadata: Metadata = {
  title: { absolute: "Our AI — Meet HarchIQ | Harch Atelier" },
  description: "HarchIQ is the trainable AI at the heart of Harch Atelier. Reads 5M+ documents/day, understands context, surfaces what matters. 9-step pipeline from article to insight.",
  alternates: { canonical: "https://atelier.harchcorp.com/approach/our-ai" },
};

export default function Page() {
  return <OurAIPage />;
}
