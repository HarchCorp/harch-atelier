import type { Metadata } from "next";
import TrustPage from "./TrustPage";

export const metadata: Metadata = {
  title: { absolute: "Sécurité & Conformité — Trust Center | Harch Atelier" },
  description:
    "Conforme CNDP · Loi 09-08 · Audit trail SHA-256. Chiffrement TLS 1.3 + AES-256, ZKP, WebAuthn/Passkeys, RBAC à 10 rôles, hébergement souverain au Maroc. Harch Atelier est conçu pour les institutions les plus exigeantes du Maroc.",
  alternates: { canonical: "https://atelier.harchcorp.com/trust" },
  openGraph: {
    title: "Sécurité & Conformité | Harch Atelier",
    description:
      "Conforme CNDP · Loi 09-08 · Audit trail SHA-256. Sécurité cryptographique de bout en bout pour institutions exigeantes.",
    url: "https://atelier.harchcorp.com/trust",
    type: "website",
  },
};

export default function Page() {
  return <TrustPage />;
}
