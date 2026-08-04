// Direct test of the GLM-4 WhatsApp extraction logic (bypasses HTTP/auth)
import ZAI from "z-ai-web-dev-sdk";

async function testExtraction(conversation: string, label: string) {
  console.log(`\n--- ${label} ---`);
  try {
    const zai = await ZAI.create();
    const systemPrompt = `You are an assistant that extracts structured information from WhatsApp conversations between a PR/communications agency and their potential client (a Moroccan company). The agency is selling reputation intelligence services.

Extract:
- company_name, contact_name, email, phone
- plan_tier: "emergence" (15K MAD/mo), "corporate" (40K MAD/mo), "sovereign" (75K MAD/mo), or "custom"
- pricing_mad: The monthly price in MAD (number only)
- topics: Array of topics to monitor
- competitors: Array of competitor names
- use_case: One-line summary
- notes: Any other relevant info

Return ONLY valid JSON. No markdown.`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: conversation },
      ],
      thinking: { type: "disabled" },
    });

    const raw = completion.choices?.[0]?.message?.content || "";
    let jsonStr = raw.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");
    const firstBrace = jsonStr.indexOf("{");
    const lastBrace = jsonStr.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) jsonStr = jsonStr.slice(firstBrace, lastBrace + 1);
    const extracted = JSON.parse(jsonStr);
    
    console.log("✓ GLM-4 extraction succeeded");
    console.log("  company:", extracted.company_name);
    console.log("  contact:", extracted.contact_name);
    console.log("  email:", extracted.email);
    console.log("  phone:", extracted.phone);
    console.log("  plan:", extracted.plan_tier);
    console.log("  pricing:", extracted.pricing_mad, typeof extracted.pricing_mad);
    console.log("  topics:", extracted.topics);
    console.log("  competitors:", extracted.competitors);
    console.log("  use_case:", String(extracted.use_case || "").slice(0, 60));
    return extracted;
  } catch (e) {
    console.log("❌ ERROR:", e instanceof Error ? e.message : String(e));
    return null;
  }
}

async function main() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  CRASH-TEST: WhatsApp Import GLM-4");
  console.log("  Testing: Darija bruité, emojis, tarifs absurdes,");
  console.log("  SQL injection, XSS, garbage, massive payload");
  console.log("═══════════════════════════════════════════════════");

  // 1a: Darija + emojis + absurd pricing
  await testExtraction(
    `[14:32] 🇲🇦 Salma: Salam wlakhiin, bghit n3ref 3la l'outil dyalkom. 7na f Attijariwafa 🏦
[14:33] Omocto: Plans: Émergence 15K, Corporate 40K, Sovereign 75K MAD/mo.
[14:34] 🇲🇦 Salma: 3tina Sovereign. Prix: 75.000 MAD wla 8.350 EUR??
[14:35] Omocto: 75000 MAD/mo fixe.
[14:36] 🇲🇦 Salma: Topics: frais bancaires, service client, digitalisation.
[14:37] 🇲🇦 Salma: Concurrents: BCP, Bank of Africa, CIH.
[14:38] 🇲🇦 Salma: Email: s.bennani@attijariwafa.com Phone: +212661234567
[14:39] 🇲🇦 Salma: Use case: bad buzz 3la les frais. 😤`,
    "1a: Darija bruité + emojis + tarifs absurdes"
  );

  // 1b: Pure garbage
  await testExtraction(
    "asdfghjkl 🔥💀 1234567890 !@#$%^&*() (null) [object Object]",
    "1b: Pure garbage input"
  );

  // 1c: SQL injection
  await testExtraction(
    "'; DROP TABLE users; -- UNION SELECT password FROM users; Company: TestCorp",
    "1c: SQL injection attempt"
  );

  // 1d: XSS
  await testExtraction(
    "<script>alert('xss')</script><img src=x onerror=alert(1)> Company: TestCorp",
    "1d: XSS attempt"
  );

  // 1e: Mixed languages with no structure
  await testExtraction(
    "السلام عليكم, khoya bghit un outil dyal monitoring, mais je sais pas exactement ce que je veux. Combien ça coûte? 3ndna budget mahdoud bzaf. Wakha n-tester? Merci bzaf! 🙏",
    "1e: Unstructured mixed Darija/French/Arabic"
  );

  console.log("\n═══════════════════════════════════════════════════");
  console.log("  CRASH-TEST COMPLETE");
  console.log("═══════════════════════════════════════════════════");
}

main().catch(e => { console.error("FATAL:", e); process.exit(1); });
