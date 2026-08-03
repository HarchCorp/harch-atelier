// ═══════════════════════════════════════════════════════════════
//  RESILIENCE ENGINE — INDEX
//  Re-exports + the canonical 100-case catalog metadata used by
//  the /atelier/resilience page.
// ═══════════════════════════════════════════════════════════════

export * from "./nlp";
export * from "./entity";
export * from "./ingest";
export * from "./alerting";

export type CaseStatus = "live-demo" | "architectural" | "planned" | "roadmap";

export interface StressCase {
  id: string; // "001"
  block: string; // "Multi-tenant & Security"
  title: string;
  description: string;
  status: CaseStatus;
  demoSlug?: string; // for live-demo cases, the demo endpoint key
}

export const STRESS_BLOCKS: Array<{ name: string; cases: StressCase[] }> = [
  {
    name: "Block 1 — Multi-tenant & Security",
    cases: [
      { id: "001", block: "Multi-tenant & Security", title: "Corrupted tenant_id header", description: "Reject malformed tenant_id values at the API boundary before they reach business logic.", status: "architectural" },
      { id: "002", block: "Multi-tenant & Security", title: "Race condition on workspace delete", description: "Two admins delete the same workspace at the same millisecond — optimistic-concurrency guard via version token.", status: "planned" },
      { id: "003", block: "Multi-tenant & Security", title: "IDOR — cross-tenant report access", description: "Banque A tries to read Banque B's PR report via URL manipulation — ownership check on every read.", status: "architectural" },
      { id: "004", block: "Multi-tenant & Security", title: "JWT expires mid-export", description: "A 500-page PDF export outlives the user's token — refresh-token continuation or signed export job token.", status: "planned" },
      { id: "005", block: "Multi-tenant & Security", title: "RBAC privilege escalation", description: "Viewer → Org Admin via JSON manipulation — server-side role re-validation on every mutation.", status: "architectural" },
      { id: "006", block: "Multi-tenant & Security", title: "Recursive query depth DoS", description: "Infinitely-nested GraphQL-style query crashes the server — depth guard.", status: "live-demo", demoSlug: "query-depth" },
      { id: "007", block: "Multi-tenant & Security", title: "Revoke access mid-WebSocket", description: "Employee fired while a WS session is open — session re-validate on every message.", status: "planned" },
      { id: "008", block: "Multi-tenant & Security", title: "API key leak in logs", description: "Logger auto-masks secrets (Bearer tokens, API keys, PII).", status: "architectural" },
      { id: "009", block: "Multi-tenant & Security", title: "Brute-force on login", description: "Strict rate limit + exponential backoff + lockout.", status: "live-demo", demoSlug: "rate-limit" },
      { id: "010", block: "Multi-tenant & Security", title: "Tamper-evident audit log", description: "Hash-chained append-only audit log — mathematically inalterable.", status: "architectural" },
    ],
  },
  {
    name: "Block 2 — Ingestion & Pipeline",
    cases: [
      { id: "011", block: "Ingestion & Pipeline", title: "Non-UTF8 RSS encoding", description: "Iconv auto-detection + fallback chain (ISO-8859-1, Windows-1256 for Arabic).", status: "architectural" },
      { id: "012", block: "Ingestion & Pipeline", title: "50k articles in 10s", description: "Backpressure-aware buffer — never drop, spill to disk queue if over capacity.", status: "roadmap" },
      { id: "013", block: "Ingestion & Pipeline", title: "AFP dispatch dedup across 5 media", description: "64-bit content simhash + Hamming threshold collapses near-identical articles.", status: "live-demo", demoSlug: "dedup" },
      { id: "014", block: "Ingestion & Pipeline", title: "50MB text payload OOM", description: "Hard 2MB body limit + streaming parse, reject oversized payloads at the edge.", status: "architectural" },
      { id: "015", block: "Ingestion & Pipeline", title: "Postgres mid-write failure", description: "Dead-letter queue + at-least-once delivery with idempotency keys.", status: "roadmap" },
      { id: "016", block: "Ingestion & Pipeline", title: "Elasticsearch mapping conflict", description: "Explicit index templates reject dynamic-type changes.", status: "roadmap" },
      { id: "017", block: "Ingestion & Pipeline", title: "Network interruption mid-scrape", description: "Resumable scrapers with content-range checkpoints.", status: "planned" },
      { id: "018", block: "Ingestion & Pipeline", title: "Cloudflare JS Challenge on Hespress", description: "Headless-browser fallback + polite crawl delay.", status: "roadmap" },
      { id: "019", block: "Ingestion & Pipeline", title: "Reddit honeypot IP ban", description: "Rotating residential egress + behaviour-based trap detection.", status: "roadmap" },
      { id: "020", block: "Ingestion & Pipeline", title: "OCR on scanned PDF tables", description: "Tesseract + table-structure reconstruction.", status: "roadmap" },
    ],
  },
  {
    name: "Block 3 — NLP, Darija & Sentiment",
    cases: [
      { id: "021", block: "NLP & Darija", title: "Darija sarcasm — \"Tbarkellah 3la service, mchaw lflous\"", description: "Positive-marker + negative-reality pattern detection → flips overall polarity to NEGATIVE.", status: "live-demo", demoSlug: "sentiment" },
      { id: "022", block: "NLP & Darija", title: "FR/AR code-switching — \"khayb bzaf, 0/10\"", description: "Unified FR + Darija lexicon with mixed-script scoring.", status: "live-demo", demoSlug: "sentiment" },
      { id: "023", block: "NLP & Darija", title: "False positive — \"C'est de la bombe\"", description: "Contextual idiom detection flips \"bombe\" from violence-neg to slang-pos.", status: "live-demo", demoSlug: "sentiment" },
      { id: "024", block: "NLP & Darija", title: "Homonym entity — Orange (telco) vs Orange (fruit)", description: "Context-window disambiguation with sector vocabulary.", status: "planned" },
      { id: "025", block: "NLP & Darija", title: "Double negation", description: "Dependency-aware negation parser handles \"Ce n'est pas que le produit n'est pas mauvais\".", status: "roadmap" },
      { id: "026", block: "NLP & Darija", title: "SMS typos — \"Bnk\" → \"Banque\"", description: "Abbreviation expansion dictionary applied before sentiment scoring.", status: "live-demo", demoSlug: "sentiment" },
      { id: "027", block: "NLP & Darija", title: "Mid-text sentiment flip", description: "Clause-level scoring with recency weighting — \"commence bien, finit mal\" → final NEGATIVE.", status: "live-demo", demoSlug: "sentiment" },
      { id: "028", block: "NLP & Darija", title: "LLM 15s timeout", description: "Streaming + 8s soft deadline with cached fallback response.", status: "planned" },
      { id: "029", block: "NLP & Darija", title: "Prompt injection via Facebook comment", description: "Pattern-based sanitizer blocks \"ignore previous instructions\" and role-hijack.", status: "live-demo", demoSlug: "injection" },
      { id: "030", block: "NLP & Darija", title: "Fake-news structure (caps lock + emoji)", description: "Structural virality score: caps ratio, aggressive emoji density, sensational vocab.", status: "live-demo", demoSlug: "fakeness" },
    ],
  },
  {
    name: "Block 4 — WhatsApp Inbound",
    cases: [
      { id: "031", block: "WhatsApp Inbound", title: "5-min voice message instead of text", description: "ASR transcription (z-ai-web-dev-sdk) → sentiment on transcript.", status: "planned" },
      { id: "032", block: "WhatsApp Inbound", title: "Photo of a paper article", description: "VLM OCR + structure extraction.", status: "planned" },
      { id: "033", block: "WhatsApp Inbound", title: "Spam — 50 msgs in 10s", description: "Per-conversation rate limit, bot replies once.", status: "architectural" },
      { id: "034", block: "WhatsApp Inbound", title: "Twilio webhook timeout", description: "Async ack + Twilio StatusCallback pattern.", status: "planned" },
      { id: "035", block: "WhatsApp Inbound", title: "Broken/paywalled link", description: "HEAD probe + paywall detector + graceful fallback message.", status: "planned" },
      { id: "036", block: "WhatsApp Inbound", title: "Unknown WhatsApp number", description: "Onboarding flow + demo-mode for unrecognised senders.", status: "architectural" },
      { id: "037", block: "WhatsApp Inbound", title: "Persistent context — \"Et la BMCE ?\"", description: "Conversation state with entity reference carry-over.", status: "planned" },
      { id: "038", block: "WhatsApp Inbound", title: "Twilio policy block", description: "Pre-send policy classifier + template fallback.", status: "roadmap" },
      { id: "039", block: "WhatsApp Inbound", title: "vCard / contact inbound", description: "Parse + acknowledge, no LLM call.", status: "architectural" },
      { id: "040", block: "WhatsApp Inbound", title: "RGPD unsubscribe via \"Stop\"", description: "Honour Stop/Unsubscribe keywords immediately, log consent withdrawal.", status: "architectural" },
    ],
  },
  {
    name: "Block 5 — Risk Radar & Alerting",
    cases: [
      { id: "041", block: "Risk Radar", title: "Critical alert bypasses DND", description: "Severity-gated routing — Critical severity bypasses user DND.", status: "planned" },
      { id: "042", block: "Risk Radar", title: "Storm — 1000 mentions → 1 macro alert", description: "Velocity-based collapse into a single notification with representative headline.", status: "live-demo", demoSlug: "alert-storm" },
      { id: "043", block: "Risk Radar", title: "OFAC false-positive homonym", description: "Name match + DOB/nationality/occupation corroboration → distinguish homonym from sanctioned individual.", status: "live-demo", demoSlug: "ofac" },
      { id: "044", block: "Risk Radar", title: "Fuzzy match — Mohammed Al-Fayed vs Mohamed El Fayed", description: "Jaro-Winkler on transliteration-normalized names.", status: "live-demo", demoSlug: "fuzzy" },
      { id: "045", block: "Risk Radar", title: "Paradoxical boolean rule (A AND NOT A)", description: "Rule validator rejects unsatisfiable queries at save time.", status: "architectural" },
      { id: "046", block: "Risk Radar", title: "ESG 50-pt drop audit backtrace", description: "Every score change carries a contributing-factor diff.", status: "roadmap" },
      { id: "047", block: "Risk Radar", title: "Delete alert mid-distribution", description: "Tombstone marker — in-flight notifications carry a recall token.", status: "planned" },
      { id: "048", block: "Risk Radar", title: "Escalation after 30min L1 silence", description: "Two-tier SLA timer with auto-escalation to Comex.", status: "live-demo", demoSlug: "escalation" },
      { id: "049", block: "Risk Radar", title: "Crisis end auto-detection", description: "Velocity decay + sentiment normalisation → auto-resolve alert.", status: "roadmap" },
      { id: "050", block: "Risk Radar", title: "Risk matrix with missing data", description: "Bayesian imputation with confidence band.", status: "roadmap" },
    ],
  },
  {
    name: "Block 6 — Search & Indexation",
    cases: [
      { id: "051", block: "Search", title: "1B docs in <200ms", description: "Inverted index + early-termination ranking.", status: "roadmap" },
      { id: "052", block: "Search", title: "50-synonym query expansion", description: "Synonym graph with pruning to top-k expansions.", status: "planned" },
      { id: "053", block: "Search", title: "Relevance vs recency on generic queries", description: "Query-class router picks the right signal blend.", status: "planned" },
      { id: "054", block: "Search", title: "Highlight in 10k-word text", description: "Snippet-based highlight, not full-document.", status: "architectural" },
      { id: "055", block: "Search", title: "Mapping mismatch", description: "Explicit schema + reject-on-conflict.", status: "architectural" },
      { id: "056", block: "Search", title: "Zero-downtime reindex", description: "Blue/green index swap with dual-write.", status: "roadmap" },
      { id: "057", block: "Search", title: "Polygon geo filter (Morocco map)", description: "GeoJSON polygon containment query.", status: "planned" },
      { id: "058", block: "Search", title: "Multi-level aggregation", description: "Composite aggregation with caching.", status: "planned" },
      { id: "059", block: "Search", title: "Deep pagination (page 50k)", description: "Search-after cursor, not offset.", status: "architectural" },
      { id: "060", block: "Search", title: "Legally-blocked term censor", description: "Blocklist applied at query parse time.", status: "architectural" },
    ],
  },
  {
    name: "Block 7 — Frontend & UX",
    cases: [
      { id: "061", block: "Frontend & UX", title: "50k-point chart freeze", description: "Downsample + canvas WebGL renderer + virtualisation.", status: "planned" },
      { id: "062", block: "Frontend & UX", title: "Silent WS disconnect", description: "Exponential backoff reconnection with jitter.", status: "planned" },
      { id: "063", block: "Frontend & UX", title: "20 clicks on \"Generate Report\"", description: "Idempotency key + button lockout.", status: "architectural" },
      { id: "064", block: "Frontend & UX", title: "Theme switch mid-animation", description: "Animation respects prefers-color-scheme + RAF cancel.", status: "architectural" },
      { id: "065", block: "Frontend & UX", title: "LocalStorage quota exceeded", description: "LRU eviction + try/catch fallback.", status: "architectural" },
      { id: "066", block: "Frontend & UX", title: "Violent window resize on dashboard", description: "ResizeObserver debounce + responsive reflow.", status: "architectural" },
      { id: "067", block: "Frontend & UX", title: "State desync with DB", description: "TanStack Query invalidation keys + optimistic rollback.", status: "planned" },
      { id: "068", block: "Frontend & UX", title: "Full keyboard nav on data matrix", description: "ARIA grid roles + roving tabindex.", status: "planned" },
      { id: "069", block: "Frontend & UX", title: "3G unstable connection", description: "Response compression + skeleton + retry.", status: "planned" },
      { id: "070", block: "Frontend & UX", title: "SSR hydration mismatch", description: "Stable IDs + suppressHydrationWarning where needed.", status: "architectural" },
    ],
  },
  {
    name: "Block 8 — Reporting & Export",
    cases: [
      { id: "071", block: "Reporting", title: "500-page vector PDF", description: "Streamed React-PDF render, no full DOM materialise.", status: "planned" },
      { id: "072", block: "Reporting", title: "Chromium headless timeout", description: "Page-by-page render + retry on page failure.", status: "planned" },
      { id: "073", block: "Reporting", title: "CSV with commas/quotes/newlines", description: "RFC-4180 compliant quoting.", status: "architectural" },
      { id: "074", block: "Reporting", title: "Dynamic watermark for traceability", description: "Per-recipient watermark with user ID + timestamp.", status: "planned" },
      { id: "075", block: "Reporting", title: "LLM hallucinates financial stats", description: "Citation grounding — every number must trace to a source row.", status: "roadmap" },
      { id: "076", block: "Reporting", title: "Friday cron fail → Saturday resume", description: "Idempotent job with checkpoint resume.", status: "planned" },
      { id: "077", block: "Reporting", title: "25MB+ email attachment", description: "Auto-switch to secure signed link.", status: "architectural" },
      { id: "078", block: "Reporting", title: "1TB API export", description: "Streaming NDJSON + cursor pagination.", status: "roadmap" },
      { id: "079", block: "Reporting", title: "Revoke public report link", description: "Signed URL with short TTL + kill-switch.", status: "architectural" },
      { id: "080", block: "Reporting", title: "Template change mid-render", description: "Snapshot the template version into the job payload.", status: "architectural" },
    ],
  },
  {
    name: "Block 9 — Infrastructure & Billing",
    cases: [
      { id: "081", block: "Infra & Billing", title: "API quota exceeded (429 + overage)", description: "Per-tenant bucket + overage billing hook.", status: "planned" },
      { id: "082", block: "Infra & Billing", title: "Stripe card update fails", description: "Grace period + dunning emails.", status: "roadmap" },
      { id: "083", block: "Infra & Billing", title: "Enterprise → Basic downgrade", description: "Feature-gate by plan, no data loss.", status: "planned" },
      { id: "084", block: "Infra & Billing", title: "Redis down — API survives via Postgres", description: "Cache-aside fallback to DB with circuit breaker.", status: "roadmap" },
      { id: "085", block: "Infra & Billing", title: "Breaking API change", description: "URL versioning /v1/ → /v2/ with deprecation window.", status: "architectural" },
      { id: "086", block: "Infra & Billing", title: "Duplicate/out-of-order Stripe webhook", description: "Idempotency key on event ID + ordering by created.", status: "planned" },
      { id: "087", block: "Infra & Billing", title: "DB split-brain", description: "Quorum + fencing tokens.", status: "roadmap" },
      { id: "088", block: "Infra & Billing", title: "Pod OOMKilled mid-task", description: "Job checkpoint + node reschedule.", status: "roadmap" },
      { id: "089", block: "Infra & Billing", title: "LLM pricing structure change", description: "Abstracted cost ledger per provider.", status: "roadmap" },
      { id: "090", block: "Infra & Billing", title: "RGPD 3-year anonymisation", description: "Scheduled PII hashing job.", status: "planned" },
    ],
  },
  {
    name: "Block 10 — Pure Business Edge Cases",
    cases: [
      { id: "091", block: "Business Edge", title: "M&A entity merge without breaking history", description: "Entity graph with successor-of edges, history preserved.", status: "roadmap" },
      { id: "092", block: "Business Edge", title: "Verified-influencer 10000x weight", description: "Dynamic authority weighting in reputation score.", status: "planned" },
      { id: "093", block: "Business Edge", title: "0 mentions for 3 months → flat line", description: "Sparse series renders flat zero, no crash.", status: "architectural" },
      { id: "094", block: "Business Edge", title: "Client asks to block articles about itself", description: "Integrity policy refuses — data is immutable.", status: "architectural" },
      { id: "095", block: "Business Edge", title: "Sunday 3am bad-buzz velocity detection", description: "Z-score anomaly on rolling velocity, no volume threshold.", status: "planned" },
      { id: "096", block: "Business Edge", title: "Nested multilingual article (FR quoting AR with EN terms)", description: "Per-segment language detection + routed lexicon.", status: "roadmap" },
      { id: "097", block: "Business Edge", title: "CEO homonym (current vs former)", description: "Tenure-window resolution by article date.", status: "live-demo", demoSlug: "ceo" },
      { id: "098", block: "Business Edge", title: "Article deleted 5min after publish", description: "Immutable legal archive with \"Retiré\" tag + hash chain.", status: "live-demo", demoSlug: "archive" },
      { id: "099", block: "Business Edge", title: "Astroturfing — recent accounts", description: "Account-age + burst velocity + near-dup content heuristics.", status: "live-demo", demoSlug: "astroturfing" },
      { id: "100", block: "Business Edge", title: "Black Swan — all entities spike simultaneously", description: "Auto-calibration: systemic anomaly suppresses per-entity storm alerts.", status: "roadmap" },
    ],
  },
];

export function getCoverageStats() {
  const all = STRESS_BLOCKS.flatMap((b) => b.cases);
  const byStatus = {
    "live-demo": all.filter((c) => c.status === "live-demo").length,
    architectural: all.filter((c) => c.status === "architectural").length,
    planned: all.filter((c) => c.status === "planned").length,
    roadmap: all.filter((c) => c.status === "roadmap").length,
  };
  return { total: all.length, byStatus };
}
