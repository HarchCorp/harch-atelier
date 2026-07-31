// ═══════════════════════════════════════════════════════════════
//  DOMAIN EXTRACTION — work-email self-registration matching
//
//  Used by:
//    • /api/auth/register-company   (self-service signup)
//    • /atelier/request-access      (real-time domain validation)
//
//  Task: domain-matching-demo-isolation
// ═══════════════════════════════════════════════════════════════

/**
 * Disposable / consumer email providers that we never accept for
 * self-service company registration. A user signing up with
 * `med.alami@gmail.com` is told to use their work email instead —
 * we can't attach them to a company without a verifiable corporate
 * domain.
 *
 * The list is intentionally short — we block the dozen or so
 * consumer providers that cover ~95% of personal email traffic. A
 * longer blocklist would create false positives (e.g. blocking a
 * legitimate `protonmail.com` address from a privacy-focused
 * consultancy). Disposable-alias services (mailinator, guerrillamail,
 * 10minutemail) are not in the list because they're not the
 * self-registration abuse vector we're defending against — those
 * would just produce empty AccessRequests, which is fine.
 */
const DISPOSABLE_EMAIL_DOMAINS: ReadonlySet<string> = new Set([
  "gmail.com",
  "yahoo.com",
  "yahoo.fr",
  "hotmail.com",
  "hotmail.fr",
  "outlook.com",
  "outlook.fr",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "protonmail.com",
  "proton.me",
  "aol.com",
  "mail.com",
  "yandex.com",
  "yandex.ru",
  "gmx.com",
  "gmx.net",
  "zoho.com",
  "tutanota.com",
  "tuta.io",
  "fastmail.com",
  "hushmail.com",
]);

/**
 * Extract the root domain from an email address.
 *
 *   "med.alami@attijariwafa.com"        → "attijariwafa.com"
 *   "j.doe@corp.ocp-group.ma"           → "ocp-group.ma"
 *   "x@subdomain.attijariwafa.com"      → "attijariwafa.com"  (subdomain stripped)
 *   "user@gmail.com"                    → null  (disposable)
 *   "invalid"                           → null  (no @)
 *
 * Returns null for:
 *   • Malformed emails (no @, multiple @)
 *   • Disposable / consumer email providers (gmail, yahoo, ...)
 *   • Empty or whitespace-only domains
 *
 * Subdomain handling: a user signing up with `user@corp.ocp-group.ma`
 * should match the company registered with domain `ocp-group.ma`.
 * We strip leading subdomains so the lookup matches the parent
 * domain. The last two labels are always kept (e.g. `ocp-group.ma`);
 * for three-label TLDs like `co.uk`, `com.ma`, `co.ma` we keep three
 * labels. This is a best-effort heuristic — it's not a perfect
 * public-suffix parser, but it covers the Moroccan / French / generic
 * cases that the Harch Atelier customer base actually uses.
 */
export function extractDomainFromEmail(email: string): string | null {
  if (typeof email !== "string") return null;
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return null;

  const parts = trimmed.split("@");
  if (parts.length !== 2) return null;
  const localPart = parts[0];
  const fullDomain = parts[1];
  if (!localPart || !fullDomain) return null;

  // Block disposable providers BEFORE any normalization so the
  // gmail.com / googlemail.com equivalence is handled once, here.
  if (DISPOSABLE_EMAIL_DOMAINS.has(fullDomain)) return null;
  // googlemail.com is the same as gmail.com (Google's alternate domain).
  if (fullDomain === "googlemail.com") return null;

  return stripSubdomain(fullDomain);
}

/**
 * Normalize a user-entered domain or website URL.
 *
 *   "https://www.attijariwafa.com"   → "attijariwafa.com"
 *   "http://attijariwafa.com/about"  → "attijariwafa.com"
 *   "www.iam.ma"                     → "iam.ma"
 *   "IAM.MA"                         → "iam.ma"
 *   "  attijariwafa.com  "           → "attijariwafa.com"
 *
 * Used by the seed script + admin company-edit form so that
 * whatever the user pastes gets reduced to the canonical
 * `example.com` form before being stored as `Company.domain`.
 */
export function normalizeDomain(input: string): string {
  if (typeof input !== "string") return "";
  return input
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .replace(/\?.*$/, "")
    .replace(/#.*$/, "")
    .trim();
}

/**
 * Strip leading subdomains from a domain.
 *
 *   "corp.ocp-group.ma"   → "ocp-group.ma"
 *   "mail.attijariwafa.com" → "attijariwafa.com"
 *   "attijariwafa.com"    → "attijariwafa.com"  (no change)
 *   "ocp-group.ma"        → "ocp-group.ma"      (no change)
 *   "foo.bar.baz.co.uk"   → "baz.co.uk"
 *
 * Uses a small TWO_LABEL_TLDS set to know which suffixes are "shared"
 * (e.g. co.uk, com.ma) so the parent domain keeps three labels.
 */
const TWO_LABEL_TLDS: ReadonlySet<string> = new Set([
  "co.uk",
  "org.uk",
  "ac.uk",
  "gov.uk",
  "com.ma",
  "co.ma",
  "org.ma",
  "ac.ma",
  "net.ma",
  "co.fr",
  "com.fr",
  "co.jp",
  "co.kr",
  "com.au",
  "net.au",
  "co.nz",
  "co.in",
  "com.br",
  "com.cn",
  "com.hk",
  "com.sg",
  "co.za",
  "com.tr",
  "com.mx",
  "com.ar",
  "co.id",
  "co.th",
  "com.my",
  "com.ph",
  "com.vn",
]);

function stripSubdomain(domain: string): string {
  if (!domain) return domain;
  const labels = domain.split(".");
  if (labels.length <= 2) return domain;

  // Three-label case: check whether the last two labels form a known
  // shared TLD (co.uk, com.ma, ...). If yes, the parent domain is the
  // last THREE labels (e.g. baz.co.uk). If no, the parent is the last
  // TWO labels (e.g. attijariwafa.com).
  if (labels.length === 3) {
    const lastTwo = `${labels[1]}.${labels[2]}`;
    if (TWO_LABEL_TLDS.has(lastTwo)) {
      return domain; // already the parent (e.g. ocp-group.ma is wrong here)
    }
    return lastTwo;
  }

  // Four+ labels: take the last 2 (or last 3 if last 2 form a shared TLD).
  const lastTwo = `${labels[labels.length - 2]}.${labels[labels.length - 1]}`;
  if (TWO_LABEL_TLDS.has(lastTwo) && labels.length >= 4) {
    return `${labels[labels.length - 3]}.${lastTwo}`;
  }
  return lastTwo;
}

/**
 * Check whether an email looks like a work email (i.e. NOT a
 * disposable / consumer provider). Used by the registration form for
 * real-time validation feedback before the user submits.
 */
export function isWorkEmail(email: string): boolean {
  return extractDomainFromEmail(email) !== null;
}
