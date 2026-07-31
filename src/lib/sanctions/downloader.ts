// ═══════════════════════════════════════════════════════════════
//  SANCTIONS LISTS DOWNLOADER + PARSER
//
//  Downloads and parses 3 real sanctions lists:
//
//  1. OFAC SDN (Specially Designated Nationals)
//     Spec'd URL: https://www.treasury.gov/ofac/downloads/sdn.csv
//     Real status: Treasury now redirects this URL to
//        https://sanctionslistservice.ofac.treas.gov/api/publicationpreview/exports/sdn.csv
//     which is fronted by an F5 BIG-IP bot-protection layer that
//     403-blocks automated clients (no browser fingerprint, no JS
//     challenge solver). Fallback: OpenSanctions FTM JSON mirror at
//        https://data.opensanctions.org/datasets/latest/us_ofac_sdn/entities.ftm.json
//     (NDJSON, ~50MB, daily refresh, official OFAC data — re-published
//     under CC BY-NC 4.0 by the OCCRP OpenSanctions project).
//
//  2. EU Consolidated Sanctions List (Financial Sanctions Files)
//     Spec'd URL: https://webgate.ec.europa.eu/fsd/fsf/public/files/xmlSanctions/content.xml
//     Real status: that path now 404s. The current endpoint is
//        https://webgate.ec.europa.eu/fsd/fsf/public/files/xmlFullSanctionsList_1_1/content?token=dG9rZW4tMjAxNw
//     (~14MB XML, refreshes multiple times per week).
//
//  3. UN Security Council Consolidated List
//     URL: https://scsanctions.un.org/resources/xml/en/consolidated.xml
//     (~2.2MB XML, refreshes daily). Direct download works.
//
//  Output: SanctionsEntry[] (normalized — same shape for all 3 lists).
//  The downloader is SIDE-EFFECT-FREE — it does not touch the cache.
//  The cache layer (cache.ts) is responsible for storing the result.
//
//  SERVER-SIDE ONLY. No client imports.
// ═══════════════════════════════════════════════════════════════

import { XMLParser } from "fast-xml-parser";

// ─── Types ───────────────────────────────────────────────────────

export type SanctionsListCode = "OFAC" | "EU" | "UN";

export interface SanctionsEntry {
  list: SanctionsListCode;
  name: string;
  aliases: string[];
  type: "individual" | "entity" | "vessel" | "unknown";
  program?: string;
  remarks?: string;
  regulation?: string;
}

export interface DownloadResult {
  list: SanctionsListCode;
  entries: SanctionsEntry[];
  sourceUrl: string;       // URL the data was actually fetched from (may differ from spec'd URL)
  byteSize: number;        // raw payload size in bytes (for telemetry)
  downloadedAt: Date;      // when the download completed
  warnings: string[];      // non-fatal issues (e.g. fallback used, partial parse)
}

// ─── Source URLs (spec'd primary + working fallback) ─────────────

const OFAC_PRIMARY_URL =
  "https://www.treasury.gov/ofac/downloads/sdn.csv";
const OFAC_FALLBACK_URL =
  "https://data.opensanctions.org/datasets/latest/us_ofac_sdn/entities.ftm.json";

// EU spec'd URL (now 404) — kept here for auditability, but we use the
// working endpoint directly. If the EU ever restores the legacy URL,
// we'll pick it up automatically because downloadEU tries spec'd first.
const EU_PRIMARY_URL =
  "https://webgate.ec.europa.eu/fsd/fsf/public/files/xmlSanctions/content.xml";
const EU_FALLBACK_URL =
  "https://webgate.ec.europa.eu/fsd/fsf/public/files/xmlFullSanctionsList_1_1/content?token=dG9rZW4tMjAxNw";

const UN_URL =
  "https://scsanctions.un.org/resources/xml/en/consolidated.xml";

const FETCH_TIMEOUT_MS = 90_000; // 90s per list — generous for the 50MB OFAC mirror
const USER_AGENT =
  "HarchAtelier-SanctionsScreening/1.0 (+compliance; contact: atelier@harchcorp.com)";

// ─── Fetch helper ────────────────────────────────────────────────

async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = FETCH_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "*/*",
        ...(init.headers || {}),
      },
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

// ─── OFAC parser (semicolon-separated CSV) ───────────────────────
//
//  OFAC SDN CSV format (per Treasury spec):
//    ent_num;SDN_Name;SDN_Type;Program;Title;Call_Sign;Vess_type;
//    Tonnage;GRT;Vess_flag;Vess_owner;Remarks;gender;aka_count;...
//
//  Each SDN row is followed by 0..N AKA rows and 0..N ADD rows.
//  AKA rows have ent_num matching the parent SDN row and an empty
//  SDN_Type. We group them: the first non-empty SDN_Name is the
//  canonical name; subsequent AKA names become aliases.

const OFAC_SDN_TYPE_MAP: Record<string, SanctionsEntry["type"]> = {
  individual: "individual",
  "individual-": "individual",
  entity: "entity",
  "entity-": "entity",
  vessel: "vessel",
  aircraft: "vessel", // treat aircraft under the same bucket as vessels
  organization: "entity",
};

function ofacType(rawType: string | undefined): SanctionsEntry["type"] {
  if (!rawType) return "unknown";
  const key = rawType.trim().toLowerCase();
  for (const [k, v] of Object.entries(OFAC_SDN_TYPE_MAP)) {
    if (key === k || key.startsWith(k)) return v;
  }
  return "unknown";
}

// Split a CSV line on `;`, honoring double-quoted fields that may
// contain semicolons or escaped quotes ("" → ").
function splitOfacCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ";") {
        out.push(cur);
        cur = "";
      } else cur += ch;
    }
  }
  out.push(cur);
  return out;
}

export function parseOFAC(csv: string): SanctionsEntry[] {
  const entries: SanctionsEntry[] = [];
  // Pre-split lines, ignoring trailing empty line.
  const lines = csv.split(/\r?\n/);
  // OFAC CSV has no header row — row 0 is the first SDN entry.
  // Build a map of ent_num → entry so AKA rows can attach.
  const byEntNum = new Map<string, SanctionsEntry>();

  for (const line of lines) {
    if (!line.trim()) continue;
    const cols = splitOfacCsvLine(line);
    // SDN rows have >= 12 cols and a non-empty SDN_Name (col 1).
    // AKA rows have a non-empty col 1 but col 2 (SDN_Type) empty AND
    // the first column (ent_num) is shared with the parent.
    if (cols.length < 3) continue;
    const entNum = cols[0]?.trim();
    const name = cols[1]?.trim();
    const sdnType = cols[2]?.trim();
    const program = cols[3]?.trim();
    const remarks = cols[11]?.trim();

    if (!entNum || !name) continue;

    // Heuristic: an SDN row has a non-empty SDN_Type. AKA/ADD rows
    // leave it blank. (Real OFAC CSV emits AKA rows with the parent
    // ent_num but an empty SDN_Type column.)
    const isSdnRow = sdnType && sdnType.length > 0;

    if (isSdnRow) {
      const entry: SanctionsEntry = {
        list: "OFAC",
        name,
        aliases: [],
        type: ofacType(sdnType),
        program: program || undefined,
        remarks: remarks || undefined,
      };
      entries.push(entry);
      if (entNum) byEntNum.set(entNum, entry);
    } else {
      // AKA / ADD row — attach to the parent SDN entry if known.
      const parent = entNum ? byEntNum.get(entNum) : undefined;
      if (parent && name && !parent.aliases.includes(name)) {
        parent.aliases.push(name);
      } else if (!parent) {
        // Orphan AKA — record as a standalone entry to avoid silent loss.
        entries.push({
          list: "OFAC",
          name,
          aliases: [],
          type: "unknown",
          program: program || undefined,
          remarks: remarks || undefined,
        });
      }
    }
  }

  return entries;
}

// ─── OFAC FTM JSON parser (OpenSanctions fallback) ───────────────
//
//  Each line of the NDJSON stream is one FollowTheMoney entity:
//    {
//      "schema": "Person" | "Organization" | "LegalEntity" | "Company" | ...,
//      "caption": "Display name",
//      "properties": {
//        "name": ["Primary name", "Alternate spelling"],
//        "alias": ["Other alias", ...],
//        "programId": ["US-GLOMAG"],
//        "topics": ["sanction"],
//        "sourceUrl": ["https://sanctionssearch.ofac.treas.gov/..."],
//        ...
//      },
//      "target": true
//    }
//
//  We only emit entries where `target === true` (sanctioned, not just
//  a connected PEP/relative).

function ofacFtmType(schema: string | undefined): SanctionsEntry["type"] {
  if (!schema) return "unknown";
  const s = schema.toLowerCase();
  if (s === "person") return "individual";
  if (s === "organization" || s === "legalentity" || s === "company")
    return "entity";
  if (s === "vehicle" || s === "vessel" || s === "airplane") return "vessel";
  return "entity";
}

export function parseOFACFtmJson(ndjson: string): SanctionsEntry[] {
  const entries: SanctionsEntry[] = [];
  const lines = ndjson.split(/\r?\n/);
  for (const line of lines) {
    if (!line.trim()) continue;
    let obj: Record<string, unknown>;
    try {
      obj = JSON.parse(line) as Record<string, unknown>;
    } catch {
      continue;
    }
    const target = obj.target;
    if (target !== true) continue; // skip non-sanctioned adjacent entities

    const props = (obj.properties as Record<string, unknown>) || {};
    const nameArr = (props.name as string[] | undefined) || [];
    const aliasArr = (props.alias as string[] | undefined) || [];
    const programArr = (props.programId as string[] | undefined) || [];
    const caption = (obj.caption as string | undefined) || "";
    const schema = (obj.schema as string | undefined) || "";

    const name = nameArr[0] || caption || "";
    if (!name) continue;

    const aliases: string[] = [];
    for (const n of [...nameArr.slice(1), ...aliasArr]) {
      const trimmed = (n || "").trim();
      if (trimmed && trimmed !== name && !aliases.includes(trimmed)) {
        aliases.push(trimmed);
      }
    }

    entries.push({
      list: "OFAC",
      name,
      aliases,
      type: ofacFtmType(schema),
      program: programArr[0] || undefined,
      remarks: undefined,
    });
  }
  return entries;
}

// ─── OFAC download (primary → fallback) ──────────────────────────

export async function downloadOFAC(): Promise<DownloadResult> {
  const warnings: string[] = [];

  // Try the spec'd CSV URL first.
  try {
    const res = await fetchWithTimeout(OFAC_PRIMARY_URL, {
      headers: { Accept: "text/csv,application/csv,*/*" },
    });
    if (res.ok) {
      const csv = await res.text();
      if (csv.length > 1000 && csv.includes(";")) {
        const entries = parseOFAC(csv);
        return {
          list: "OFAC",
          entries,
          sourceUrl: OFAC_PRIMARY_URL,
          byteSize: csv.length,
          downloadedAt: new Date(),
          warnings,
        };
      }
      warnings.push(
        `Primary OFAC CSV returned ${res.status} but body was not a valid semicolon-separated CSV (length=${csv.length}). Falling back to OpenSanctions FTM JSON.`,
      );
    } else {
      warnings.push(
        `Primary OFAC CSV returned HTTP ${res.status} (${OFAC_PRIMARY_URL}). Falling back to OpenSanctions FTM JSON.`,
      );
    }
  } catch (err) {
    warnings.push(
      `Primary OFAC CSV fetch threw ${(err as Error).message}. Falling back to OpenSanctions FTM JSON.`,
    );
  }

  // Fallback: OpenSanctions FTM JSON (NDJSON).
  const res = await fetchWithTimeout(OFAC_FALLBACK_URL, {
    headers: { Accept: "application/json+ftm,application/json,*/*" },
  });
  if (!res.ok) {
    throw new Error(
      `OFAC download failed: primary CSV unavailable and OpenSanctions fallback returned HTTP ${res.status}`,
    );
  }
  const ndjson = await res.text();
  const entries = parseOFACFtmJson(ndjson);
  warnings.push(
    `Used OpenSanctions FTM JSON mirror as OFAC source (Treasury direct CSV unavailable from this runtime).`,
  );

  return {
    list: "OFAC",
    entries,
    sourceUrl: OFAC_FALLBACK_URL,
    byteSize: ndjson.length,
    downloadedAt: new Date(),
    warnings,
  };
}

// ─── EU parser (XML) ─────────────────────────────────────────────
//
//  EU FSF XML structure (default namespace: eu.europa.ec.fpi.fsd.export):
//    <export>
//      <sanctionEntity euReferenceNumber="EU.27.28" ...>
//        <remark>UNSC RESOLUTION 1483</remark>
//        <regulation programme="IRQ" numberTitle="1210/2003 (OJ L169)" ...>
//          <publicationUrl>...</publicationUrl>
//        </regulation>
//        <subjectType code="person" classificationCode="P"/>
//        <nameAlias firstName="Saddam" lastName="Hussein Al-Tikriti"
//                   wholeName="Saddam Hussein Al-Tikriti" .../>
//        <nameAlias wholeName="Abu Ali" .../>
//      </sanctionEntity>
//      ...
//    </export>

function euType(subjectTypeCode: string | undefined): SanctionsEntry["type"] {
  if (!subjectTypeCode) return "unknown";
  const c = subjectTypeCode.toLowerCase();
  if (c === "person" || c === "p") return "individual";
  if (c === "entity" || c === "e") return "entity";
  return "unknown";
}

const EU_XML_PARSER = new XMLParser({
  removeNSPrefix: true,
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  isArray: (tagName) =>
    tagName === "sanctionEntity" ||
    tagName === "nameAlias" ||
    tagName === "regulation",
});

export function parseEU(xml: string): SanctionsEntry[] {
  const entries: SanctionsEntry[] = [];
  let parsed: unknown;
  try {
    parsed = EU_XML_PARSER.parse(xml);
  } catch (err) {
    throw new Error(`EU XML parse failed: ${(err as Error).message}`);
  }

  const root = (parsed as { export?: { sanctionEntity?: unknown[] } }).export;
  if (!root) return entries;
  const entities = Array.isArray(root.sanctionEntity) ? root.sanctionEntity : [];

  for (const e of entities) {
    const ent = e as Record<string, unknown>;
    // subjectType appears on the <sanctionEntity> as a child element
    // (fast-xml-parser surfaces it as an object with @_code attribute).
    let subjectTypeCode: string | undefined;
    const subjectType = ent.subjectType as
      | { "@_code"?: string; "#text"?: string }
      | string
      | undefined;
    if (typeof subjectType === "string") {
      subjectTypeCode = subjectType;
    } else if (subjectType && typeof subjectType === "object") {
      subjectTypeCode = subjectType["@_code"];
    }

    const remarksRaw = ent.remark as string | undefined;

    // Regulations (one or more per entity) — pick the first programme.
    let regulation: string | undefined;
    let program: string | undefined;
    const regArr = ent.regulation as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(regArr) && regArr.length > 0) {
      const first = regArr[0];
      const numberTitle = first["@_numberTitle"] as string | undefined;
      const programme = first["@_programme"] as string | undefined;
      if (numberTitle) regulation = numberTitle;
      if (programme) program = programme;
    }

    // Name aliases.
    const nameAliases = ent.nameAlias as Array<Record<string, unknown>> | undefined;
    if (!Array.isArray(nameAliases) || nameAliases.length === 0) continue;

    const wholeNames = nameAliases
      .map((na) => (na["@_wholeName"] as string | undefined) || "")
      .map((s) => s.trim())
      .filter(Boolean);
    if (wholeNames.length === 0) continue;

    const name = wholeNames[0];
    const aliases = Array.from(new Set(wholeNames.slice(1)));

    entries.push({
      list: "EU",
      name,
      aliases,
      type: euType(subjectTypeCode),
      program,
      remarks: remarksRaw || undefined,
      regulation,
    });
  }

  return entries;
}

// ─── EU download (primary → fallback) ────────────────────────────

export async function downloadEU(): Promise<DownloadResult> {
  const warnings: string[] = [];

  // Try the spec'd URL first.
  try {
    const res = await fetchWithTimeout(EU_PRIMARY_URL, {
      headers: { Accept: "application/xml,text/xml,*/*" },
    });
    if (res.ok) {
      const xml = await res.text();
      if (xml.includes("<export") || xml.includes("sanctionEntity")) {
        const entries = parseEU(xml);
        return {
          list: "EU",
          entries,
          sourceUrl: EU_PRIMARY_URL,
          byteSize: xml.length,
          downloadedAt: new Date(),
          warnings,
        };
      }
      warnings.push(
        `Primary EU XML endpoint returned HTTP ${res.status} but body was not the expected sanctions XML. Falling back to xmlFullSanctionsList endpoint.`,
      );
    } else {
      warnings.push(
        `Primary EU XML endpoint returned HTTP ${res.status} (${EU_PRIMARY_URL}). Falling back to xmlFullSanctionsList endpoint.`,
      );
    }
  } catch (err) {
    warnings.push(
      `Primary EU XML fetch threw ${(err as Error).message}. Falling back to xmlFullSanctionsList endpoint.`,
    );
  }

  // Fallback: the working xmlFullSanctionsList endpoint.
  const res = await fetchWithTimeout(EU_FALLBACK_URL, {
    headers: { Accept: "application/xml,text/xml,*/*" },
  });
  if (!res.ok) {
    throw new Error(
      `EU download failed: primary endpoint unavailable and xmlFullSanctionsList fallback returned HTTP ${res.status}`,
    );
  }
  const xml = await res.text();
  const entries = parseEU(xml);
  warnings.push(
    `Used xmlFullSanctionsList_1_1 endpoint as EU source (legacy xmlSanctions/content.xml no longer served).`,
  );

  return {
    list: "EU",
    entries,
    sourceUrl: EU_FALLBACK_URL,
    byteSize: xml.length,
    downloadedAt: new Date(),
    warnings,
  };
}

// ─── UN parser (XML) ─────────────────────────────────────────────
//
//  UN consolidated XML structure (no namespace):
//    <CONSOLIDATED_LIST>
//      <INDIVIDUALS>
//        <INDIVIDUAL>
//          <FIRST_NAME>ERIC</FIRST_NAME>
//          <SECOND_NAME>BADEGE</SECOND_NAME>
//          <THIRD_NAME>...</THIRD_NAME>
//          <UN_LIST_TYPE>DRC</UN_LIST_TYPE>
//          <COMMENTS1>He fled to Rwanda ...</COMMENTS1>
//          <INDIVIDUAL_ALIAS>
//            <QUALITY>Good</QUALITY>
//            <ALIAS_NAME>FRANK KAKORERE</ALIAS_NAME>
//          </INDIVIDUAL_ALIAS>
//          ...
//        </INDIVIDUAL>
//      </INDIVIDUALS>
//      <ENTITIES>
//        <ENTITY>
//          <FIRST_NAME>ADF</FIRST_NAME>
//          <UN_LIST_TYPE>DRC</UN_LIST_TYPE>
//          <COMMENTS1>...</COMMENTS1>
//          <ENTITY_ALIAS>
//            <QUALITY>...</QUALITY>
//            <ALIAS_NAME>...</ALIAS_NAME>
//          </ENTITY_ALIAS>
//          ...
//        </ENTITY>
//      </ENTITIES>
//    </CONSOLIDATED_LIST>

const UN_XML_PARSER = new XMLParser({
  removeNSPrefix: true,
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  // Force these tags to always be arrays even when only 1 present —
  // simplifies downstream code.
  isArray: (tagName) =>
    tagName === "INDIVIDUAL" ||
    tagName === "ENTITY" ||
    tagName === "INDIVIDUAL_ALIAS" ||
    tagName === "ENTITY_ALIAS",
});

function pickText(v: unknown): string {
  if (typeof v === "string") return v.trim();
  return "";
}

export function parseUN(xml: string): SanctionsEntry[] {
  const entries: SanctionsEntry[] = [];
  let parsed: unknown;
  try {
    parsed = UN_XML_PARSER.parse(xml);
  } catch (err) {
    throw new Error(`UN XML parse failed: ${(err as Error).message}`);
  }

  const root = parsed as {
    CONSOLIDATED_LIST?: {
      INDIVIDUALS?: { INDIVIDUAL?: Array<Record<string, unknown>> };
      ENTITIES?: { ENTITY?: Array<Record<string, unknown>> };
    };
  };
  const cl = root.CONSOLIDATED_LIST;
  if (!cl) return entries;

  // Individuals
  const individuals = cl.INDIVIDUALS?.INDIVIDUAL || [];
  for (const ind of individuals) {
    const firstName = pickText(ind.FIRST_NAME);
    const secondName = pickText(ind.SECOND_NAME);
    const thirdName = pickText(ind.THIRD_NAME);
    const fourthName = pickText(ind.FOURTH_NAME);
    const name = [firstName, secondName, thirdName, fourthName]
      .filter(Boolean)
      .join(" ")
      .trim();
    if (!name) continue;

    const program = pickText(ind.UN_LIST_TYPE) || undefined;
    const remarks = pickText(ind.COMMENTS1) || undefined;

    const aliasNodes =
      (ind.INDIVIDUAL_ALIAS as Array<Record<string, unknown>> | undefined) || [];
    const aliases: string[] = [];
    for (const a of aliasNodes) {
      const aliasName = pickText(a.ALIAS_NAME);
      if (aliasName && aliasName !== name && !aliases.includes(aliasName)) {
        aliases.push(aliasName);
      }
    }

    entries.push({
      list: "UN",
      name,
      aliases,
      type: "individual",
      program,
      remarks,
    });
  }

  // Entities
  const entNodes = cl.ENTITIES?.ENTITY || [];
  for (const ent of entNodes) {
    const firstName = pickText(ent.FIRST_NAME);
    const name = firstName.trim();
    if (!name) continue;

    const program = pickText(ent.UN_LIST_TYPE) || undefined;
    const remarks = pickText(ent.COMMENTS1) || undefined;

    const aliasNodes =
      (ent.ENTITY_ALIAS as Array<Record<string, unknown>> | undefined) || [];
    const aliases: string[] = [];
    for (const a of aliasNodes) {
      const aliasName = pickText(a.ALIAS_NAME);
      if (aliasName && aliasName !== name && !aliases.includes(aliasName)) {
        aliases.push(aliasName);
      }
    }

    entries.push({
      list: "UN",
      name,
      aliases,
      type: "entity",
      program,
      remarks,
    });
  }

  return entries;
}

// ─── UN download ─────────────────────────────────────────────────

export async function downloadUN(): Promise<DownloadResult> {
  const warnings: string[] = [];
  const res = await fetchWithTimeout(UN_URL, {
    headers: { Accept: "application/xml,text/xml,*/*" },
  });
  if (!res.ok) {
    throw new Error(`UN download failed: HTTP ${res.status} (${UN_URL})`);
  }
  const xml = await res.text();
  const entries = parseUN(xml);

  return {
    list: "UN",
    entries,
    sourceUrl: UN_URL,
    byteSize: xml.length,
    downloadedAt: new Date(),
    warnings,
  };
}

// ─── Aggregate: download all 3 lists ─────────────────────────────

export interface DownloadAllResult {
  ofac: DownloadResult;
  eu: DownloadResult;
  un: DownloadResult;
  totalEntries: number;
}

export async function downloadAllSanctionsLists(): Promise<DownloadAllResult> {
  // Run all 3 downloads in parallel — they hit different hosts so
  // there is no head-of-line blocking. Each individual download has
  // its own 90s timeout.
  const [ofac, eu, un] = await Promise.all([
    downloadOFAC(),
    downloadEU(),
    downloadUN(),
  ]);

  return {
    ofac,
    eu,
    un,
    totalEntries: ofac.entries.length + eu.entries.length + un.entries.length,
  };
}
