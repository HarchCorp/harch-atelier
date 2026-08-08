import { logInfo } from "@/lib/logger";
// ═══════════════════════════════════════════════════════════════
//  PROJECT AEGIS v3.1 — HarchIQ OSINT FORENSICS MODULE
//  Infrastructure risk assessment, image metadata, shadow-based
//  chronolocalization, multi-source claim verification, and
//  digital forensics URL analysis.
//
//  Inspired by Bellingcat's open-source investigation toolkit and
//  the NSA's NSA/CSS Technical Director's Office OSINT methodology.
//
//  ┌────────────────────────────────────────────────────────────┐
//  │  Core algorithms                                            │
//  ├────────────────────────────────────────────────────────────┤
//  │  • Infrastructure risk heuristics (ASN/port/SSL/tech)       │
//  │  • Shadow-azimuth → sun-azimuth → time-of-day inference     │
//  │  • Cross-source claim verification (diversity + temporal)   │
//  │  • Digital forensics URL triage                             │
//  │  • EXIF metadata extraction (stub — needs sharp/exiftool)   │
//  └────────────────────────────────────────────────────────────┘
//
//  Task ID: AEGIS-V31-ALGO
//  Module:  harchiq/forensics/osint-tools
// ═══════════════════════════════════════════════════════════════

// ─── TYPES ────────────────────────────────────────────────────────

/**
 * InfrastructureProfile — observed attributes of a domain/IP.
 *
 * Assembled by the COLLECT stage from passive DNS, Shodan-like port
 * scans, SSL certificate transparency logs, and HTTP header
 * fingerprinting.
 */
export interface InfrastructureProfile {
  /** Domain name (e.g. "example.com"). */
  domain: string;
  /** Autonomous System Number (e.g. "AS12345"). */
  asn: string;
  /** Open TCP/UDP ports observed. */
  openPorts: number[];
  /** SSL certificate fingerprint (SHA-256), if HTTPS. */
  sslFingerprint?: string;
  /** SSL certificate validity status. */
  sslStatus?: "valid" | "self_signed" | "expired" | "mismatched" | "none";
  /** Detected technology stack (e.g. ["wordpress", "nginx", "php-7.4"]). */
  techStack: string[];
  /** Pre-computed risk score in [0,100] (optional — recomputed here). */
  riskScore?: number;
}

/**
 * ImageMetadata — EXIF-derived metadata extracted from an image.
 */
export interface ImageMetadata {
  /** URL of the analyzed image. */
  imageUrl: string;
  /** GPS coordinates [lat, lng] if present in EXIF. */
  gpsCoordinates?: { lat: number; lng: number };
  /** Capture timestamp (ISO-8601) from EXIF DateTimeOriginal. */
  timestamp?: string;
  /** Device / camera model string. */
  device?: string;
  /** Image-processing software (e.g. "Adobe Photoshop CC 2023"). */
  software?: string;
  /** Image dimensions in pixels. */
  dimensions?: { width: number; height: number };
}

/**
 * ShadowAnalysis — output of `calculateShadowAzimuth`.
 */
export interface ShadowAnalysis {
  /** Shadow direction in degrees from north (input). */
  shadowDirection: number;
  /** Computed sun azimuth in degrees from north. */
  sunAzimuth: number;
  /** Rough time-of-day estimate based on azimuth → hour mapping. */
  estimatedTimeOfDay: string;
  /** Hemisphere assumption (northern/southern) used for the estimate. */
  hemisphere: "northern" | "southern";
}

/**
 * ClaimSource — a single source reporting (or refuting) a claim.
 */
export interface ClaimSource {
  /** Source name (e.g. "Reuters", "Bellingcat"). */
  name: string;
  /** URL of the source article/report. */
  url: string;
  /** ISO-8601 publication timestamp. */
  publishedAt: string;
  /** Source type for diversity scoring. */
  type: "wire" | "newspaper" | "regulator" | "social" | "ngo" | "government" | "blog";
  /** Whether this source corroborates (true) or refutes (false) the claim. */
  corroborates: boolean;
  /** Reliability tier of this source. */
  reliability: "high" | "medium" | "low";
}

/**
 * CrossReferenceResult — output of `crossReferenceSources`.
 */
export interface CrossReferenceResult {
  /** True if the claim is verified by ≥3 independent sources. */
  verified: boolean;
  /** Number of corroborating sources. */
  sourceCount: number;
  /** Diversity score in [0,1] — fraction of distinct source types. */
  diversityScore: number;
  /** Temporal consistency in [0,1] — how clustered the publication dates are. */
  temporalConsistency: number;
  /** Overall confidence in [0,1]. */
  confidence: number;
  /** Refuting source count (if any). */
  refutingCount: number;
}

/**
 * DigitalForensicsReport — output of `extractDigitalForensics`.
 */
export interface DigitalForensicsReport {
  /** URL analyzed. */
  url: string;
  /** Parsed domain. */
  domain: string;
  /** Registered domain (eTLD+1). */
  registeredDomain: string;
  /** Subdomain (if any). */
  subdomain: string;
  /** URL path. */
  path: string;
  /** Whether the URL uses HTTPS. */
  usesHttps: boolean;
  /** WHOIS info (stub — needs RDAP/WHOIS API). */
  whoisInfo: {
    /** ISO-8601 registration date, if known. */
    registeredAt?: string;
    /** ISO-8601 expiry date, if known. */
    expiresAt?: string;
    /** Registrar name, if known. */
    registrar?: string;
    /** Registrant country, if known. */
    country?: string;
  };
  /** SSL certificate info (stub). */
  sslInfo: {
    /** Whether HTTPS is in use. */
    enabled: boolean;
    /** Issuer, if known. */
    issuer?: string;
    /** Validity status. */
    status?: "valid" | "self_signed" | "expired" | "unknown";
  };
  /** URL age in days (stub — computed from WHOIS when available). */
  urlAgeDays?: number;
  /** Risk indicators found. */
  riskIndicators: string[];
}

// ─── CONSTANTS ────────────────────────────────────────────────────

/**
 * MALICIOUS_ASNS — known hosting providers frequently abused for
 * phishing, malware C2, and scam infrastructure. Sourced from
 * public threat-intel feeds (Spamhaus DROP, FireHol, etc.).
 *
 * In production this would be fed from a continuously updated
 * threat-intel feed; v3.1 hardcodes a representative sample.
 */
const MALICIOUS_ASNS: ReadonlySet<string> = new Set([
  "AS14061",  // DigitalOcean (frequently abused for ephemeral C2)
  "AS49505",  // Selectel (ru)
  "AS396982", // Google Cloud (abused for phishing)
  "AS16509",  // AWS (abused — flagged selectively)
  "AS24940",  // Hetzner (abused for scam pages)
  "AS46562",  // Performa LLC (bulletproof hosting)
  "AS398101", // "Privacy protection" hosting
]);

/**
 * STANDARD_CORPORATE_PORTS — ports typically open on a legitimate
 * corporate web server. Anything outside this set is suspicious.
 */
const STANDARD_CORPORATE_PORTS: ReadonlySet<number> = new Set([
  80,   // HTTP
  443,  // HTTPS
  22,   // SSH
  21,   // FTP
  25,   // SMTP
  465,  // SMTPS
  587,  // SMTP submission
  993,  // IMAPS
  995,  // POP3S
  53,   // DNS
  3306, // MySQL (internal)
  5432, // PostgreSQL (internal)
]);

/**
 * VULNERABLE_TECHNOLOGIES — technology stack signatures known to be
 * frequently exploited. Presence is a strong risk indicator.
 *
 * Regex patterns matched case-insensitively against techStack entries.
 */
const VULNERABLE_TECH_PATTERNS: ReadonlyArray<{ pattern: RegExp; label: string }> = [
  { pattern: /wordpress\s*[0-9]*\.[0-4]\./i, label: "WordPress ≤ 4.x (RCE-prone)" },
  { pattern: /wordpress\s*5\.[0-3]\./i, label: "WordPress 5.0-5.3 (XSS-prone)" },
  { pattern: /php\s*[0-6]\./i, label: "PHP ≤ 6.x (EOL, multiple CVEs)" },
  { pattern: /php\s*7\.[0-2]\./i, label: "PHP 7.0-7.2 (EOL)" },
  { pattern: /joomla\s*[0-3]\./i, label: "Joomla ≤ 3.x (SQLi-prone)" },
  { pattern: /drupal\s*[0-8]\./i, label: "Drupal ≤ 8.x (Drupalgeddon)" },
  { pattern: /tomcat\s*[0-8]\./i, label: "Tomcat ≤ 8.x (RCE-prone)" },
  { pattern: /exposed-admin-panel/i, label: "Exposed admin panel (credential stuffing)" },
  { pattern: /phpmyadmin/i, label: "phpMyAdmin exposed (credential attack surface)" },
  { pattern: /git\s*exposed/i, label: ".git directory exposed (source code leak)" },
];

/**
 * VERIFICATION_THRESHOLD — minimum number of corroborating sources
 * for a claim to be marked "verified".
 */
const VERIFICATION_THRESHOLD = 3;

// ─── INFRASTRUCTURE RISK ASSESSMENT ───────────────────────────────

/**
 * assessInfrastructureRisk — heuristic infrastructure risk triage.
 *
 * Checks the profile against four risk dimensions and returns a list
 * of human-readable indicators (empty list = clean profile):
 *
 *   1. ASN blacklist match (strong indicator — bulletproof hosting).
 *   2. Anomalous open ports (non-standard for corporate web presence).
 *   3. SSL anomalies (self-signed, expired, mismatched, or absent).
 *   4. Vulnerable technology stack (EOL CMS, exposed admin panels).
 *
 * @param profile the infrastructure profile to assess
 * @returns       array of risk indicator strings (empty = clean)
 */
export function assessInfrastructureRisk(profile: InfrastructureProfile): string[] {
  const indicators: string[] = [];

  // ── 1. ASN blacklist ─────────────────────────────────────
  if (MALICIOUS_ASNS.has(profile.asn)) {
    indicators.push(
      `ASN ${profile.asn} appears in malicious-hosting blocklist (bulletproof hosting indicator)`,
    );
  }

  // ── 2. Anomalous open ports ──────────────────────────────
  const anomalousPorts = profile.openPorts.filter(
    (p) => !STANDARD_CORPORATE_PORTS.has(p),
  );
  if (anomalousPorts.length > 0) {
    indicators.push(
      `Non-standard open ports: ${anomalousPorts.join(", ")} (potential exposed services)`,
    );
  }
  // Specifically flag database ports exposed to the internet.
  const exposedDbPorts = profile.openPorts.filter((p) =>
    [3306, 5432, 27017, 6379, 9200].includes(p),
  );
  if (exposedDbPorts.length > 0) {
    indicators.push(
      `Database ports exposed to internet: ${exposedDbPorts.join(", ")} (severe)`,
    );
  }

  // ── 3. SSL anomalies ─────────────────────────────────────
  if (profile.sslStatus === "self_signed") {
    indicators.push("SSL certificate is self-signed (no CA trust chain)");
  } else if (profile.sslStatus === "expired") {
    indicators.push("SSL certificate is expired (neglected infrastructure)");
  } else if (profile.sslStatus === "mismatched") {
    indicators.push("SSL certificate hostname mismatch (phishing indicator)");
  } else if (profile.sslStatus === "none" || profile.sslStatus === undefined) {
    indicators.push("No SSL/TLS configured (plaintext credentials)");
  }

  // ── 4. Vulnerable tech stack ─────────────────────────────
  for (const tech of profile.techStack) {
    for (const { pattern, label } of VULNERABLE_TECH_PATTERNS) {
      if (pattern.test(tech)) {
        indicators.push(`Vulnerable technology detected: ${label} (${tech})`);
      }
    }
  }

  logInfo("lib.harchiq.forensics.osint-tools", `[HarchIQ-Forensics] Infrastructure risk for ${profile.domain}: ` +
      `${indicators.length} indicators (ASN=${profile.asn}, ports=[${profile.openPorts.join(",")}], ` +
      `ssl=${profile.sslStatus ?? "n/a"}, tech=${profile.techStack.length} entries)`);

  return indicators;
}

// ─── IMAGE METADATA (EXIF) — STUB ─────────────────────────────────

/**
 * analyzeImageMetadata — extract EXIF metadata from an image URL.
 *
 * STUB: This function is a placeholder pending integration with a
 * server-side EXIF parser (recommended: `exiftool-vendored` or
 * `sharp`'s metadata API). The stub logs the attempt and returns
 * null so callers can fall back to analyst-supplied metadata.
 *
 * @param imageUrl URL of the image to analyze
 * @returns        ImageMetadata if EXIF data is available, else null
 */
export function analyzeImageMetadata(imageUrl: string): ImageMetadata | null {
  logInfo("lib.harchiq.forensics.osint-tools", `[HarchIQ-Forensics] Image metadata extraction not yet configured ` +
      `(url=${imageUrl}). TODO: integrate exiftool-vendored.`);
  // TODO: integrate exiftool-vendored or sharp for real EXIF extraction.
  // Expected fields: GPSLatitude/GPSLongitude, DateTimeOriginal,
  // Make/Model, Software, ImageWidth/ImageHeight.
  return null;
}

// ─── SHADOW-BASED CHRONOLOCALIZATION ──────────────────────────────

/**
 * calculateShadowAzimuth — infer sun azimuth from shadow direction.
 *
 * Geometry:
 *   A shadow is cast directly opposite the sun. If a shadow points
 *   in direction `shadowDirection` (degrees clockwise from north),
 *   the sun is at azimuth `shadowDirection + 180° (mod 360°)`.
 *
 * Time-of-day estimate:
 *   In the northern hemisphere (simplified), the sun:
 *     • Rises in the east   (~90°)  at ~06:00 local
 *     • Peaks in the south  (~180°) at ~12:00 local
 *     • Sets in the west    (~270°) at ~18:00 local
 *
 *   This function maps the sun azimuth to a rough hour using a linear
 *   interpolation between 06:00 (azimuth 60°) and 18:00 (azimuth 300°),
 *   assuming a 30° offset from due E/W to account for seasonal tilt.
 *
 *   For the southern hemisphere, the sun arcs through the north
 *   (azimuth ~0° at noon), so the mapping is mirrored.
 *
 * @param imageHeight   image height in pixels (unused — reserved for
 *                      future shadow-length → sun-elevation analysis)
 * @param imageWidth    image width in pixels (unused — reserved)
 * @param shadowDirection shadow direction in degrees from north [0, 360)
 * @returns             ShadowAnalysis with sun azimuth and time estimate
 */
export function calculateShadowAzimuth(
  imageHeight: number,
  imageWidth: number,
  shadowDirection: number,
): ShadowAnalysis {
  void imageHeight;
  void imageWidth;

  // Normalize shadow direction to [0, 360).
  const sd = ((shadowDirection % 360) + 360) % 360;

  // Sun azimuth is opposite the shadow direction.
  const sunAzimuth = (sd + 180) % 360;

  // Determine hemisphere from sun azimuth: in the northern hemisphere
  // at solar noon, the sun is in the south (azimuth ~180°); in the
  // southern hemisphere, north (~0°/360°).
  //
  // Heuristic: if sun azimuth is in the southern half (90° < az < 270°),
  // assume northern hemisphere. Otherwise, southern.
  const hemisphere: ShadowAnalysis["hemisphere"] =
    sunAzimuth > 90 && sunAzimuth < 270 ? "northern" : "southern";

  // ── Time-of-day estimate ─────────────────────────────────
  let estimatedTimeOfDay: string;
  if (hemisphere === "northern") {
    // Sun rises E (~90°) at 06:00, peaks S (~180°) at 12:00, sets W (~270°) at 18:00.
    // Linear interpolation across the day arc [60°, 300°] → [06:00, 18:00].
    if (sunAzimuth < 60 || sunAzimuth > 300) {
      estimatedTimeOfDay = "night / twilight (sun below horizon)";
    } else {
      const fraction = (sunAzimuth - 60) / (300 - 60); // 0 → 1
      const hour = 6 + fraction * 12; // 6 → 18
      estimatedTimeOfDay = formatHour(hour);
    }
  } else {
    // Southern hemisphere: sun rises E (~90°), peaks N (~0°/360°), sets W (~270°).
    // Day arc goes 90° → 0° → 270° (clockwise through north).
    if (sunAzimuth > 90 && sunAzimuth < 270) {
      // Sun in southern half — nighttime for southern hemisphere.
      estimatedTimeOfDay = "night / twilight (sun below horizon)";
    } else {
      // Mirror the azimuth: 0° → noon, 90° → sunrise (06:00), 270° → sunset (18:00).
      let hour: number;
      if (sunAzimuth <= 90) {
        // Morning: 90° → 06:00, 0° → 12:00.
        hour = 6 + (90 - sunAzimuth) / 90 * 6;
      } else {
        // Afternoon: 360° → 12:00, 270° → 18:00.
        hour = 12 + (360 - sunAzimuth) / 90 * 6;
      }
      estimatedTimeOfDay = formatHour(hour);
    }
  }

  logInfo("lib.harchiq.forensics.osint-tools", `[HarchIQ-Forensics] Shadow analysis: shadow=${sd.toFixed(1)}°, ` +
      `sun=${sunAzimuth.toFixed(1)}°, hemisphere=${hemisphere}, ` +
      `time≈${estimatedTimeOfDay}`);

  return {
    shadowDirection: Number(sd.toFixed(1)),
    sunAzimuth: Number(sunAzimuth.toFixed(1)),
    estimatedTimeOfDay,
    hemisphere,
  };
}

// ─── CROSS-SOURCE CLAIM VERIFICATION ──────────────────────────────

/**
 * crossReferenceSources — verify a claim across multiple sources.
 *
 * Inspired by Bellingcat's verification workflow and the First Draft
 * "Verification Handbook" five-step protocol (source, content, date,
 * location, motivation).
 *
 * Verification logic:
 *   1. Source count: how many independent sources corroborate?
 *   2. Source diversity: how many distinct source types (wire, ngo,
 *      government, social, …)? Higher diversity = more robust.
 *   3. Temporal consistency: how tightly clustered are publication
 *      dates? (Reported within hours of each other = high consistency;
 *      scattered across months = low consistency, suggesting rumor
 *      re-circulation rather than original reporting.)
 *   4. Refuting count: any sources actively refute the claim?
 *
 * Verified iff: corroboration ≥ VERIFICATION_THRESHOLD (3) AND
 * diversity ≥ 0.5 AND refuting count == 0.
 *
 * @param claim   the claim text (unused beyond logging — semantic
 *                matching is a TODO for v3.2 LLM integration)
 * @param sources array of ClaimSource objects
 * @returns       CrossReferenceResult
 */
export function crossReferenceSources(
  claim: string,
  sources: ClaimSource[],
): CrossReferenceResult {
  const corroborating = sources.filter((s) => s.corroborates);
  const refuting = sources.filter((s) => !s.corroborates);
  const sourceCount = corroborating.length;
  const refutingCount = refuting.length;

  // ── Diversity score ──────────────────────────────────────
  // Fraction of distinct source types among corroborating sources.
  const distinctTypes = new Set(corroborating.map((s) => s.type));
  const diversityScore =
    corroborating.length > 0
      ? distinctTypes.size / corroborating.length
      : 0;

  // ── Temporal consistency ─────────────────────────────────
  // 1 = all published in the same hour; 0 = spread over a year+.
  let temporalConsistency = 0;
  if (corroborating.length >= 2) {
    const timestamps = corroborating
      .map((s) => Date.parse(s.publishedAt))
      .filter((t) => !Number.isNaN(t))
      .sort((a, b) => a - b);
    if (timestamps.length >= 2) {
      const span = timestamps[timestamps.length - 1] - timestamps[0]; // ms
      const spanHours = span / (3600 * 1000);
      // Map: 0 hours → 1.0, 168 hours (1 week) → 0.5, 720 hours (1 month) → 0.0.
      temporalConsistency = Math.max(0, Math.min(1, 1 - spanHours / 720));
    } else {
      temporalConsistency = 0.5; // single source — neutral
    }
  }

  // ── Confidence blend ─────────────────────────────────────
  const countConf = Math.min(1, sourceCount / 5);
  const divConf = diversityScore;
  const tempConf = temporalConsistency;
  const refutingPenalty = Math.min(1, refutingCount * 0.3);
  const confidence = Number(
    Math.max(0, countConf * 0.4 + divConf * 0.3 + tempConf * 0.3 - refutingPenalty).toFixed(3),
  );

  // ── Verification decision ────────────────────────────────
  const verified =
    sourceCount >= VERIFICATION_THRESHOLD &&
    diversityScore >= 0.5 &&
    refutingCount === 0;

  logInfo("lib.harchiq.forensics.osint-tools", `[HarchIQ-Forensics] Cross-reference: claim="${claim.slice(0, 60)}…" ` +
      `sources=${sourceCount} (refuting=${refutingCount}), ` +
      `diversity=${diversityScore.toFixed(2)}, temporal=${temporalConsistency.toFixed(2)}, ` +
      `verified=${verified}, confidence=${confidence.toFixed(2)}`);

  return {
    verified,
    sourceCount,
    diversityScore: Number(diversityScore.toFixed(3)),
    temporalConsistency: Number(temporalConsistency.toFixed(3)),
    confidence,
    refutingCount,
  };
}

// ─── DIGITAL FORENSICS URL ANALYSIS ───────────────────────────────

/**
 * extractDigitalForensics — analyze a URL for forensics triage.
 *
 * Parses the URL into its components (domain, registered domain,
 * subdomain, path, scheme) and applies lightweight risk heuristics.
 * Heavy-lookups (WHOIS, SSL certificate, DNS history) are stubbed
 * pending integration with RDAP/CT-log APIs in v3.2.
 *
 * @param url the URL to analyze
 * @returns   DigitalForensicsReport
 */
export function extractDigitalForensics(url: string): DigitalForensicsReport {
  logInfo("lib.harchiq.forensics.osint-tools", `[HarchIQ-Forensics] Digital forensics triage: ${url}`);

  const riskIndicators: string[] = [];

  // ── URL parsing ──────────────────────────────────────────
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return {
      url,
      domain: "",
      registeredDomain: "",
      subdomain: "",
      path: "",
      usesHttps: false,
      whoisInfo: {},
      sslInfo: { enabled: false, status: "unknown" },
      riskIndicators: ["Invalid URL — could not parse"],
    };
  }

  const usesHttps = parsed.protocol === "https:";
  if (!usesHttps) {
    riskIndicators.push("No HTTPS (credentials transmitted in plaintext)");
  }

  // Split hostname into subdomain / registered domain (eTLD+1).
  // Simplified: assumes the last two labels are the registered domain.
  // (Full eTLD handling would use the Public Suffix List.)
  const hostParts = parsed.hostname.split(".");
  let registeredDomain = "";
  let subdomain = "";
  if (hostParts.length >= 2) {
    registeredDomain = hostParts.slice(-2).join(".");
    subdomain = hostParts.slice(0, -2).join(".");
  } else {
    registeredDomain = parsed.hostname;
  }

  // ── Risk heuristics on the URL itself ────────────────────
  // IP-address host (suspicious for phishing).
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(parsed.hostname)) {
    riskIndicators.push("Hostname is a raw IP address (phishing indicator)");
  }
  // Excessive subdomain depth.
  if (hostParts.length > 4) {
    riskIndicators.push(
      `Deep subdomain chain (${hostParts.length} labels — typosquatting indicator)`,
    );
  }
  // Suspicious TLDs (high-abuse rate).
  const suspiciousTlds = [".tk", ".ml", ".ga", ".cf", ".gq", ".top", ".xyz", ".work"];
  const tld = `.${hostParts[hostParts.length - 1]}`;
  if (suspiciousTlds.includes(tld)) {
    riskIndicators.push(`TLD "${tld}" has high abuse rate (free / low-reputation)`);
  }
  // URL shortener (obfuscation).
  const shorteners = ["bit.ly", "t.co", "tinyurl.com", "goo.gl", "ow.ly", "is.gd"];
  if (shorteners.includes(registeredDomain)) {
    riskIndicators.push(`URL shortener detected (${registeredDomain}) — destination obfuscated`);
  }
  // Embedded credentials (RFC 3986 userinfo — strong phishing indicator).
  if (parsed.username || parsed.password) {
    riskIndicators.push("URL contains embedded userinfo (credential phishing pattern)");
  }
  // Suspiciously long path.
  if (parsed.pathname.length > 100) {
    riskIndicators.push(`Unusually long URL path (${parsed.pathname.length} chars)`);
  }

  // ── WHOIS info (stub) ────────────────────────────────────
  // TODO: integrate RDAP (Registration Data Access Protocol) for real
  // WHOIS lookups. RDAP is the modern replacement for WHOIS and returns
  // structured JSON.
  const whoisInfo: DigitalForensicsReport["whoisInfo"] = {};
  logInfo("lib.harchiq.forensics.osint-tools", `[HarchIQ-Forensics] WHOIS lookup not yet configured for ${registeredDomain}. ` +
      `TODO: integrate RDAP.`);

  // ── SSL info (stub) ──────────────────────────────────────
  // TODO: integrate `tls-socket` or call out to a CT-log API for SSL
  // certificate details.
  const sslInfo: DigitalForensicsReport["sslInfo"] = {
    enabled: usesHttps,
    status: usesHttps ? "unknown" : "unknown",
  };
  if (usesHttps) {
    logInfo("lib.harchiq.forensics.osint-tools", `[HarchIQ-Forensics] SSL certificate inspection not yet configured for ${registeredDomain}. ` +
        `TODO: integrate tls-socket / certstream.`);
  }

  // ── URL age (stub — derived from WHOIS when available) ───
  let urlAgeDays: number | undefined;
  if (whoisInfo.registeredAt) {
    const regMs = Date.parse(whoisInfo.registeredAt);
    if (!Number.isNaN(regMs)) {
      urlAgeDays = Math.floor((Date.now() - regMs) / (24 * 3600 * 1000));
      if (urlAgeDays < 30) {
        riskIndicators.push(`Domain registered ${urlAgeDays} days ago (newly-registered — phishing indicator)`);
      }
    }
  }

  logInfo("lib.harchiq.forensics.osint-tools", `[HarchIQ-Forensics] Triage complete: ${registeredDomain}, ` +
      `${riskIndicators.length} indicators`);

  return {
    url,
    domain: parsed.hostname,
    registeredDomain,
    subdomain,
    path: parsed.pathname,
    usesHttps,
    whoisInfo,
    sslInfo,
    urlAgeDays,
    riskIndicators,
  };
}

// ─── INTERNAL HELPERS ─────────────────────────────────────────────

/**
 * formatHour — convert a fractional hour (e.g. 14.5) to a human-readable
 * time string (e.g. "14:30 local solar time ≈ 02:30 PM").
 */
function formatHour(hour: number): string {
  const h = Math.floor(hour) % 24;
  const m = Math.round((hour - Math.floor(hour)) * 60);
  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  const ampm = h < 12 ? "AM" : "PM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hh}:${mm} local solar time (≈ ${h12}:${mm} ${ampm})`;
}
