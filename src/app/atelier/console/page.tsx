import type { Metadata } from "next";
import { ConsoleShell } from "./ConsoleShell";

export const metadata: Metadata = {
  title: "Console HarchIQ",
  description:
    "Votre console d'intelligence réputationnelle. Météo, Signaux, Voisins, Empreinte IA — tout votre écosystème de perception en un coup d'œil.",
  alternates: { canonical: "https://atelier.harchcorp.com/atelier/console" },
  robots: { index: false, follow: false }, // private dashboard, no index
};

export default function ConsolePage() {
  return <ConsoleShell />;
}
