// ═══════════════════════════════════════════════════════════════
//  SECTOR CLASSIFIER — keyword-based sector auto-detection
//
//  Used by the onboarding wizard to pre-fill the sector dropdown
//  when a user types a company name or website. The 15 sectors
//  cover the Moroccan economic fabric (banking, mining, telecom,
//  ...). Returns "Other" when no keyword matches.
//
//  Task: user-company-onboarding
// ═══════════════════════════════════════════════════════════════

export const SECTORS = [
  "Banking",
  "Telecommunications",
  "Mining & Phosphates",
  "Retail",
  "Energy & Utilities",
  "Real Estate",
  "Insurance",
  "Pharmaceuticals",
  "Agro-food",
  "Transport & Logistics",
  "Technology",
  "Media",
  "Construction",
  "Automotive",
  "Tourism",
] as const;

export type Sector = (typeof SECTORS)[number];

const SECTOR_KEYWORDS: Record<string, string[]> = {
  Banking: ["bank", "banque", "attijari", "bcp", "bmce", "bank of africa", "cih", "cfg", "credit", "banking", "wafa bank"],
  Telecommunications: ["telecom", "télécom", "iam", "maroc telecom", "inwi", "orange", "internet", "mobile", "operator"],
  "Mining & Phosphates": ["ocp", "phosphate", "mining", "mine", "managem", "copper", "gold", "cobalt", "silver"],
  Retail: ["retail", "label'vie", "label vie", "marjane", "carrefour", "supermarket", "shopping", "consumer goods"],
  "Energy & Utilities": ["energy", "onee", "lydec", "redeya", "electricity", "water", "gas", "petrol", "nareva", "solar", "wind"],
  Insurance: ["assurance", "insurance", "axa", "wafa assurance", "rma", "cnia", "saada"],
  Pharmaceuticals: ["pharma", "pharmaceutical", "drug", "medicine", "sothema", "laboratoires"],
  "Agro-food": ["agro", "food", "cosumar", "lesieur", "centrale lait", "dairy", "lait"],
  Construction: ["construction", "lafarge", "holcim", "ciment", "building", "btp", "addoha"],
  Automotive: ["automotive", "auto", "car", "vehicle", "renault", "psa", "snop"],
  "Real Estate": ["real estate", "immobilier", "property", "addoha", "cgi", "residential"],
  Technology: ["tech", "software", "it ", "digital", "s2m", "disway", "sagemcom", "datacenter"],
  Media: ["media", "press", "tv", "radio", "hespress", "telquel", "aujourdhui"],
  "Transport & Logistics": ["transport", "logistics", "shipping", "cargo", "port", "airline", "royal air maroc", "ram"],
  Tourism: ["tourism", "hotel", "travel", "resort", "vacation", "hospitality"],
};

/**
 * Classify a company into one of the 15 Moroccan sectors based on
 * name + website + description keyword matching. The first matching
 * sector wins (order is significant: Banking is checked before
 * Insurance because "wafa" appears in both, and bank is the more
 * specific interpretation).
 *
 * Returns "Other" when no keyword matches.
 */
export function classifySector(
  name: string,
  website?: string,
  description?: string,
): string {
  const text = `${name || ""} ${website || ""} ${description || ""}`.toLowerCase();
  if (!text.trim()) return "Other";

  for (const sector of SECTORS) {
    const keywords = SECTOR_KEYWORDS[sector] ?? [];
    for (const keyword of keywords) {
      if (text.includes(keyword)) return sector;
    }
  }
  return "Other";
}

/**
 * Slugify a company name into a URL-safe slug.
 * "Attijariwafa Bank" -> "attijariwafa-bank"
 */
export function slugify(name: string): string {
  return (name || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // strip punctuation
    .replace(/\s+/g, "-") // spaces → dashes
    .replace(/-+/g, "-") // collapse repeated dashes
    .replace(/^-+|-+$/g, ""); // trim leading/trailing dashes
}
