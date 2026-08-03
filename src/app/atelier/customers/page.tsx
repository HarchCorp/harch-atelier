import type { Metadata } from "next";
import CustomersPage from "./CustomersPage";

export const metadata: Metadata = {
  title: { absolute: "Clients — Déploiement confidentiel | Harch Atelier" },
  description: "Déploiement en cours auprès d'institutions pilotes de premier plan au Maroc. Liste de clients non publique — clauses de confidentialité sectorielles.",
  alternates: { canonical: "https://atelier.harchcorp.com/customers" },
  openGraph: {
    title: "Clients — Harch Atelier",
    description: "Déploiement confidentiel auprès d'institutions pilotes. Banque, assurance, énergie, télécoms.",
    url: "https://atelier.harchcorp.com/customers",
    type: "website",
  },
};

export default function Page() {
  return <CustomersPage />;
}
