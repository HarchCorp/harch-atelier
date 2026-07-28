import type { Metadata } from "next";
import NewsPage from "./NewsPage";

export const metadata: Metadata = {
  title: { absolute: "Live News Feed — Real-time Moroccan & African Media Monitoring | Harch Atelier" },
  description:
    "Real-time news feed monitoring 30+ Moroccan and African media sources in FR, AR, EN. AI-classified sentiment, sector tagging, relevance scoring. Updated every 5 minutes.",
  alternates: { canonical: "https://atelier.harchcorp.com/news" },
  openGraph: {
    title: "Live News Feed — Real-time Moroccan & African Media Monitoring",
    description:
      "Real-time monitoring of 30+ Moroccan and African media sources. AI sentiment classification, sector tags, relevance scores on every article.",
    type: "website",
    locale: "fr_FR",
  },
};

export default function Page() {
  return <NewsPage />;
}
