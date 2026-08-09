import type { Metadata } from "next";
import MethodPage from "./MethodPage";

export const metadata: Metadata = {
  title: "Méthode — Harch Atelier",
  description:
    "De l'article source au score board-ready. Pipeline 5 étapes : Collection, Preprocessing, AI Analysis, Scoring, Alert. 20+ sources marocaines. Score à 5 piliers. Conformité CNDP, Loi 09-08, ISO 27001.",
  alternates: {
    canonical: "https://atelier.harchcorp.com/atelier/method",
  },
};

export default function Page() {
  return <MethodPage />;
}
