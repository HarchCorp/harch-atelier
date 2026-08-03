import { HespressLabPage } from "./HespressLabPage";

// /atelier/lab/hespress — experimental lab for the Hespress comments scraper.
//
// This route lives under a new /atelier/lab/* tree reserved for
// experimental data sources + scrapers that haven't been promoted
// into the main console yet. The Hespress comments scraper is the
// first lab resident (Task BRICK-1-hespress).

export const metadata = {
  title: "Hespress Comments Lab — Harch Atelier",
  description:
    "Scrape comments from any Hespress article and run them through the Darija NLP pipeline (sentiment + sarcasm + language detection). Lab experiment — not yet wired into the console.",
};

export default function Page() {
  return <HespressLabPage />;
}
