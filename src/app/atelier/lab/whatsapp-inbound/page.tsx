import { WhatsAppInboundLabPage } from "./WhatsAppInboundLabPage";

// /atelier/lab/whatsapp-inbound — WhatsApp inbound webhook lab.
//
// This route lives under the /atelier/lab/* tree (sibling of the
// Hespress comments lab from BRICK-1). It demos the IKEA-effect
// loop: a Dircom forwards a WhatsApp message (text, screenshot,
// or link) to Harch's dedicated number, the NLP pipeline analyzes
// it, and the verdict appears in the inbound feed.
//
// In production, Twilio POSTs to /api/whatsapp/inbound automatically.
// In the lab, the simulate endpoint (/api/whatsapp/simulate) runs
// the same pipeline without needing real Twilio credentials.
//
// Task ID: BRICK-2-whatsapp-inbound

export const metadata = {
  title: "WhatsApp Inbound Lab — Harch Atelier",
  description:
    "Simulate an inbound WhatsApp message to Harch's dedicated number. The NLP pipeline runs sentiment + sarcasm + injection + fakeness + Darija language detection and returns a risk assessment. Lab experiment — not yet wired into the console.",
};

export default function Page() {
  return <WhatsAppInboundLabPage />;
}
