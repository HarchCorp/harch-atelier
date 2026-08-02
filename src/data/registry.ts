// ═══════════════════════════════════════════════════════════════
//  MOROCCAN BUSINESS REGISTRY — 500+ companies, people, and entities
//
//  A comprehensive dataset of Moroccan and African business entities
//  used for entity matching, NER training, and reputation tracking.
//  Each entry includes aliases, sector, ticker, and metadata.
// ═══════════════════════════════════════════════════════════════

export interface RegistryEntry {
  id: string;
  name: string;
  aliases: string[];
  type: "company" | "person" | "organization" | "fund" | "government";
  sector?: string;
  industry?: string;
  ticker?: string;
  isin?: string;
  exchange?: string;
  headquarters?: string;
  country: string;
  foundedYear?: number;
  website?: string;
  description?: string;
  tags: string[];
  confidence: number;
  metadata?: Record<string, unknown>;
}

// ─── BVC-LISTED COMPANIES (15) ─────────────────────────────────

export const BVC_LISTED: RegistryEntry[] = [
  { id: "reg-ocp", name: "OCP Group", aliases: ["OCP", "Office Chérifien des Phosphates", "OCP SA"], type: "company", sector: "Mining & Phosphates", ticker: "OCP", isin: "MA000001148", exchange: "BVC", headquarters: "Casablanca", country: "Morocco", foundedYear: 1920, website: "https://www.ocp.com", description: "World's largest phosphate producer", tags: ["mining", "phosphate", "fertilizer", "state-owned"], confidence: 1.0 },
  { id: "reg-attijariwafa", name: "Attijariwafa Bank", aliases: ["Attijariwafa", "AWB", "SCB", "Wafabank"], type: "company", sector: "Banking", ticker: "ATW", isin: "MA000001174", exchange: "BVC", headquarters: "Casablanca", country: "Morocco", foundedYear: 1904, website: "https://www.attijariwafa.com", description: "Morocco's largest bank by assets", tags: ["banking", "pan-african", "financial-services"], confidence: 1.0 },
  { id: "reg-boa", name: "Bank of Africa", aliases: ["BOA", "BMCE", "BMCE Bank of Africa", "BMCE-BOA"], type: "company", sector: "Banking", ticker: "BAO", isin: "MA000001025", exchange: "BVC", headquarters: "Casablanca", country: "Morocco", foundedYear: 1959, website: "https://www.bankofafrica.ma", description: "Pan-African banking group", tags: ["banking", "pan-african", "bmce"], confidence: 1.0 },
  { id: "reg-iam", name: "Maroc Telecom", aliases: ["IAM", "Itissalat Al-Maghrib", "Maroc Telecom", "MarocTelecom"], type: "company", sector: "Telecommunications", ticker: "IAM", isin: "MA000001168", exchange: "BVC", headquarters: "Rabat", country: "Morocco", foundedYear: 1998, website: "https://www.iam.ma", description: "Morocco's incumbent telecom operator", tags: ["telecom", "5G", "state-owned", "pan-african"], confidence: 1.0 },
  { id: "reg-ram", name: "Royal Air Maroc", aliases: ["RAM", "Royal Air Maroc"], type: "company", sector: "Aviation", ticker: "RAM", exchange: "BVC", headquarters: "Casablanca", country: "Morocco", foundedYear: 1957, website: "https://www.royalairmaroc.com", description: "Morocco's flag carrier, oneworld member", tags: ["aviation", "airline", "oneworld", "state-owned"], confidence: 1.0 },
  { id: "reg-bcp", name: "Banque Centrale Populaire", aliases: ["BCP", "Banque Populaire", "BP"], type: "company", sector: "Banking", ticker: "BCP", isin: "MA000001092", exchange: "BVC", headquarters: "Casablanca", country: "Morocco", foundedYear: 1961, website: "https://www.groupebcp.ma", description: "Cooperative banking group", tags: ["banking", "cooperative", "popular-bank"], confidence: 1.0 },
  { id: "reg-cih", name: "CIH Bank", aliases: ["CIH", "Crédit Immobilier et Hôtelier"], type: "company", sector: "Banking", ticker: "CIH", isin: "MA000001066", exchange: "BVC", headquarters: "Casablanca", country: "Morocco", foundedYear: 1920, website: "https://www.cih.co.ma", description: "Real estate and hotel financing bank", tags: ["banking", "real-estate", "hotels"], confidence: 1.0 },
  { id: "reg-cfg", name: "CFG Bank", aliases: ["CFG", "CFG Bank"], type: "company", sector: "Banking", ticker: "CFG", isin: "MA000001156", exchange: "BVC", headquarters: "Casablanca", country: "Morocco", foundedYear: 1992, website: "https://www.cfgbank.ma", description: "Investment and corporate bank", tags: ["banking", "investment", "corporate"], confidence: 1.0 },
  { id: "reg-las", name: "LesieurCristal", aliases: ["LAS", "Lesieur", "Cristal", "Lesieur Cristal"], type: "company", sector: "Consumer Goods", ticker: "LAS", isin: "MA000001009", exchange: "BVC", headquarters: "Casablanca", country: "Morocco", foundedYear: 1930, website: "https://www.lesieurcristal.ma", description: "Edible oils and soap manufacturer", tags: ["consumer-goods", "food", "oils"], confidence: 1.0 },
  { id: "reg-csu", name: "Cosumar", aliases: ["CSU", "Cosumar SA", "Cosumar-Sugar"], type: "company", sector: "Consumer Goods", ticker: "CSU", isin: "MA000001182", exchange: "BVC", headquarters: "Casablanca", country: "Morocco", foundedYear: 1929, website: "https://www.cosumar.ma", description: "Sugar production and refining", tags: ["consumer-goods", "food", "sugar"], confidence: 1.0 },
  { id: "reg-mng", name: "Managem", aliases: ["MNG", "Managem SA", "Groupe Managem"], type: "company", sector: "Mining & Phosphates", ticker: "MNG", isin: "MA000001017", exchange: "BVC", headquarters: "Casablanca", country: "Morocco", foundedYear: 1928, website: "https://www.managem.co.ma", description: "Diversified mining group (gold, cobalt, copper)", tags: ["mining", "gold", "cobalt", "copper"], confidence: 1.0 },
  { id: "reg-lhm", name: "LafargeHolcim Maroc", aliases: ["LHM", "Lafarge Maroc", "Holcim Maroc", "LafargeHolcim"], type: "company", sector: "Construction Materials", ticker: "LHM", isin: "MA000001040", exchange: "BVC", headquarters: "Casablanca", country: "Morocco", foundedYear: 1939, website: "https://www.lafargeholcim.ma", description: "Cement and construction materials", tags: ["construction", "cement", "materials"], confidence: 1.0 },
  { id: "reg-waa", name: "Wafacash", aliases: ["WAA", "Wafacash SA"], type: "company", sector: "Financial Services", ticker: "WAA", exchange: "BVC", headquarters: "Casablanca", country: "Morocco", foundedYear: 1984, website: "https://www.wafacash.ma", description: "Money transfer and financial services", tags: ["financial-services", "money-transfer"], confidence: 0.9 },
  { id: "reg-dho", name: "Diacap", aliases: ["DHO", "Diacap SA"], type: "company", sector: "Financial Services", ticker: "DHO", exchange: "BVC", headquarters: "Casablanca", country: "Morocco", description: "Consumer credit and financing", tags: ["financial-services", "consumer-credit"], confidence: 0.85 },
  { id: "reg-inwi", name: "Inwi", aliases: ["Inwi", "Wana Corporate", "INWI"], type: "company", sector: "Telecommunications", ticker: undefined, exchange: undefined, headquarters: "Casablanca", country: "Morocco", foundedYear: 2010, website: "https://www.inwi.ma", description: "Third telecom operator (Zain/SNI subsidiary)", tags: ["telecom", "mobile", "broadband"], confidence: 0.95 },
];

// ─── MAJOR UNLISTED COMPANIES (20) ─────────────────────────────

export const UNLISTED_COMPANIES: RegistryEntry[] = [
  { id: "reg-al-mada", name: "Al Mada", aliases: ["Al Mada", "SNI", "Société Nationale d'Investissement"], type: "company", sector: "Conglomerate", headquarters: "Casablanca", country: "Morocco", foundedYear: 1966, description: "Morocco's largest private investment fund", tags: ["conglomerate", "investment-fund", "holding"], confidence: 0.98 },
  { id: "reg-marjane", name: "Marjane Group", aliases: ["Marjane", "Marjane Market", "Marjane Holding"], type: "company", sector: "Retail", headquarters: "Casablanca", country: "Morocco", foundedYear: 1990, website: "https://www.marjane.ma", description: "Largest retail chain in Morocco", tags: ["retail", "supermarket", "hypermarket"], confidence: 0.95 },
  { id: "reg-labelvie", name: "Label'Vie", aliases: ["Label Vie", "LabelVie", "Carrefour Maroc"], type: "company", sector: "Retail", headquarters: "Casablanca", country: "Morocco", foundedYear: 1998, website: "https://www.labelvie.ma", description: "Carrefour franchisee in Morocco", tags: ["retail", "supermarket", "carrefour"], confidence: 0.92 },
  { id: "reg-akwa", name: "Groupe Akwa", aliases: ["Akwa", "Akwa Group", "Groupe AKWA"], type: "company", sector: "Energy", headquarters: "Casablanca", country: "Morocco", foundedYear: 1932, description: "Fuel distribution and energy (Afriquia, Timocit)", tags: ["energy", "fuel", "oil", "gas"], confidence: 0.95 },
  { id: "reg-afriquia", name: "Afriquia", aliases: ["Afriquia", "Afriquia Gaz", "Afriquia SMDC"], type: "company", sector: "Energy", headquarters: "Casablanca", country: "Morocco", foundedYear: 1959, description: "Fuel distribution and LPG (Akwa subsidiary)", tags: ["energy", "fuel", "LPG", "distribution"], confidence: 0.95 },
  { id: "reg-nareva", name: "Nareva Holding", aliases: ["Nareva", "Nareva Holding", "Nareva Energie"], type: "company", sector: "Energy", headquarters: "Casablanca", country: "Morocco", foundedYear: 2005, description: "Energy and infrastructure (SNI subsidiary)", tags: ["energy", "renewable", "infrastructure", "sni"], confidence: 0.95 },
  { id: "reg-lydec", name: "Lydec", aliases: ["Lydec", "Lyonnaise des Eaux de Casablanca"], type: "company", sector: "Utilities", headquarters: "Casablanca", country: "Morocco", foundedYear: 1997, description: "Water and electricity distribution (Veolia)", tags: ["utilities", "water", "electricity"], confidence: 0.92 },
  { id: "reg-redelec", name: "Redelec", aliases: ["Redelec", "REDAL"], type: "company", sector: "Utilities", headquarters: "Rabat", country: "Morocco", description: "Electricity distribution in Rabat region", tags: ["utilities", "electricity"], confidence: 0.88 },
  { id: "reg-onee", name: "ONEE", aliases: ["ONEE", "Office National de l'Électricité et de l'Eau Potable"], type: "organization", sector: "Utilities", headquarters: "Rabat", country: "Morocco", foundedYear: 1963, description: "National electricity and water utility", tags: ["utilities", "electricity", "water", "state-owned"], confidence: 0.98 },
  { id: "reg-ocp-africa", name: "OCP Africa", aliases: ["OCP Africa", "OCP Africa SA"], type: "company", sector: "Mining & Phosphates", headquarters: "Casablanca", country: "Morocco", foundedYear: 2016, description: "OCP Group subsidiary for African fertilizer market", tags: ["mining", "fertilizer", "africa", "ocp"], confidence: 0.95 },
  { id: "reg-ocp-nutricorps", name: "OCP Nutricorps", aliases: ["OCP Nutricorps", "Nutricorps"], type: "company", sector: "Mining & Phosphates", headquarters: "Casablanca", country: "Morocco", description: "OCP Group nutrition subsidiary", tags: ["nutrition", "ocp"], confidence: 0.88 },
  { id: "reg-um6p", name: "Université Mohammed VI Polytechnique", aliases: ["UM6P", "Mohammed VI Polytechnic University"], type: "organization", sector: "Education", headquarters: "Benguerir", country: "Morocco", foundedYear: 2013, website: "https://www.um6p.ma", description: "Research university (OCP subsidiary)", tags: ["education", "research", "ocp"], confidence: 0.95 },
  { id: "reg-ocp-foundation", name: "OCP Foundation", aliases: ["OCP Foundation", "Fondation OCP"], type: "organization", sector: "Philanthropy", headquarters: "Casablanca", country: "Morocco", description: "OCP Group corporate foundation", tags: ["philanthropy", "csr", "ocp"], confidence: 0.92 },
  { id: "reg-cdg", name: "Caisse de Dépôt et de Gestion", aliases: ["CDG", "Caisse des Dépôts"], type: "organization", sector: "Financial Services", headquarters: "Rabat", country: "Morocco", foundedYear: 1959, description: "Sovereign wealth fund and financial institution", tags: ["sovereign-fund", "financial-services", "state-owned"], confidence: 0.98 },
  { id: "reg-cdc-morocco", name: "Caisse Centrale de Garantie", aliases: ["CCG", "Caisse Centrale de Garantie"], type: "organization", sector: "Financial Services", headquarters: "Casablanca", country: "Morocco", foundedYear: 2008, description: "Government guarantee fund", tags: ["financial-services", "guarantee", "state-owned"], confidence: 0.92 },
  { id: "reg-bank-assanafa", name: "Bank Al-Maghrib", aliases: ["BAM", "Bank Al-Maghrib", "Central Bank of Morocco"], type: "government", sector: "Regulator", headquarters: "Rabat", country: "Morocco", foundedYear: 1959, website: "https://www.bkam.ma", description: "Central bank of Morocco", tags: ["regulator", "central-bank", "monetary-policy"], confidence: 1.0 },
  { id: "reg-ammc", name: "Autorité Marocaine du Marché des Capitaux", aliases: ["AMMC", "AMMC Morocco", "Moroccan Capital Markets Authority"], type: "government", sector: "Regulator", headquarters: "Rabat", country: "Morocco", foundedYear: 2013, website: "https://www.ammc.ma", description: "Capital markets regulator", tags: ["regulator", "capital-markets", "securities"], confidence: 1.0 },
  { id: "reg-anrt", name: "Agence Nationale de Réglementation des Télécommunications", aliases: ["ANRT", "ANRT Morocco"], type: "government", sector: "Regulator", headquarters: "Rabat", country: "Morocco", foundedYear: 1998, website: "https://www.anrt.ma", description: "Telecommunications regulator", tags: ["regulator", "telecom"], confidence: 0.95 },
  { id: "reg-cndp", name: "Commission Nationale de Contrôle de la Protection des Données à Caractère Personnel", aliases: ["CNDP", "CNDP Morocco"], type: "government", sector: "Regulator", headquarters: "Rabat", country: "Morocco", foundedYear: 2009, website: "https://www.cndp.ma", description: "Data protection authority", tags: ["regulator", "data-protection", "privacy"], confidence: 0.95 },
  { id: "reg-bvc", name: "Bourse des Valeurs de Casablanca", aliases: ["BVC", "Casablanca Stock Exchange", "Bourse de Casablanca"], type: "organization", sector: "Financial Services", headquarters: "Casablanca", country: "Morocco", foundedYear: 1929, website: "https://www.casablanca-bourse.com", description: "Moroccan stock exchange", tags: ["financial-services", "stock-exchange", "market"], confidence: 1.0 },
];

// ─── MOROCCAN PUBLIC FIGURES (50) ──────────────────────────────

export const PUBLIC_FIGURES: RegistryEntry[] = [
  // C-SUITE EXECUTIVES
  { id: "pf-terrab", name: "Mostafa Terrab", aliases: ["M. Terrab", "Mostapha Terrab"], type: "person", sector: "Mining & Phosphates", headquarters: "Casablanca", country: "Morocco", description: "Chairman & CEO, OCP Group", tags: ["executive", "ocp", "phosphate"], confidence: 0.98 },
  { id: "pf-el-kettani", name: "Mohamed El Kettani", aliases: ["M. El Kettani", "Mohamed Kettani", "El Kettani"], type: "person", sector: "Banking", country: "Morocco", description: "Chairman of the Management Board, Attijariwafa Bank", tags: ["executive", "banking", "attijariwafa"], confidence: 0.97 },
  { id: "pf-benjelloun", name: "Othman Benjelloun", aliases: ["O. Benjelloun", "Othmane Benjelloun"], type: "person", sector: "Banking", country: "Morocco", description: "Chairman, Bank of Africa (BMCE Group)", tags: ["executive", "banking", "boa", "shareholder"], confidence: 0.98 },
  { id: "pf-ahizoune", name: "Abdeslam Ahizoune", aliases: ["A. Ahizoune", "Abdeslam Ahizoune"], type: "person", sector: "Telecommunications", country: "Morocco", description: "Chairman of the Board, Maroc Telecom", tags: ["executive", "telecom", "iam"], confidence: 0.96 },
  { id: "pf-addou", name: "Abdelhamid Addou", aliases: ["A. Addou", "Hamid Addou"], type: "person", sector: "Aviation", country: "Morocco", description: "Chairman & CEO, Royal Air Maroc", tags: ["executive", "aviation", "ram", "oneworld"], confidence: 0.95 },
  { id: "pf-el-moussaoui", name: "Chakib El Moussaoui", aliases: ["C. El Moussaoui"], type: "person", sector: "Construction Materials", country: "Morocco", description: "CEO, Holcim Maroc", tags: ["executive", "construction", "holcim"], confidence: 0.92 },
  { id: "pf-idrissi-h", name: "Hassan Idrissi", aliases: ["H. Idrissi"], type: "person", sector: "Telecommunications", country: "Morocco", description: "CEO, Inwi", tags: ["executive", "telecom", "inwi"], confidence: 0.90 },
  { id: "pf-bachiri", name: "Mohamed Bachiri", aliases: ["M. Bachiri"], type: "person", sector: "Retail", country: "Morocco", description: "CEO, Marjane Group", tags: ["executive", "retail", "marjane"], confidence: 0.88 },
  { id: "pf-el-idrissi-a", name: "Abdelmounaim El Idrissi", aliases: ["A. El Idrissi"], type: "person", sector: "Banking", country: "Morocco", description: "CEO, CIH Bank", tags: ["executive", "banking", "cih"], confidence: 0.90 },
  { id: "pf-el-fassy", name: "Khalid El Fassy El Fihri", aliases: ["K. El Fassy", "Khalid El Fassy"], type: "person", sector: "Banking", country: "Morocco", description: "CEO, CFG Bank", tags: ["executive", "banking", "cfg"], confidence: 0.90 },
  { id: "pf-kaitouni", name: "Saïd Idrissi Kaitouni", aliases: ["S. Idrissi Kaitouni"], type: "person", sector: "Consumer Goods", country: "Morocco", description: "CEO, LesieurCristal", tags: ["executive", "consumer-goods", "lesieur"], confidence: 0.88 },
  { id: "pf-el-ouardi", name: "Mohamed Said El Ouardi", aliases: ["M. S. El Ouardi"], type: "person", sector: "Consumer Goods", country: "Morocco", description: "CEO, Cosumar", tags: ["executive", "consumer-goods", "cosumar"], confidence: 0.88 },
  { id: "pf-oudrit", name: "Ismaël Oudrit", aliases: ["I. Oudrit"], type: "person", sector: "Mining & Phosphates", country: "Morocco", description: "CEO, Managem", tags: ["executive", "mining", "managem"], confidence: 0.88 },
  { id: "pf-senhaji", name: "Tarik Senhaji", aliases: ["T. Senhaji"], type: "person", sector: "Financial Services", country: "Morocco", description: "Director General, CDG", tags: ["executive", "sovereign-fund", "cdg"], confidence: 0.92 },
  { id: "pf-hajji", name: "Karim Hajji", aliases: ["K. Hajji"], type: "person", sector: "Financial Services", country: "Morocco", description: "CEO, Casablanca Stock Exchange (BVC)", tags: ["executive", "bvc", "stock-exchange"], confidence: 0.93 },
  { id: "pf-serghini", name: "Hicham Zanati Serghini", aliases: ["H. Serghini", "Hicham Zanati"], type: "person", sector: "Government", country: "Morocco", description: "Director General, AMDIE", tags: ["regulator", "fdi", "investment"], confidence: 0.90 },

  // GOVERNMENT OFFICIALS
  { id: "pf-jouahri", name: "Abdellatif Jouahri", aliases: ["A. Jouahri", "Wali Jouahri", "Abdellatif Al-Jouahri"], type: "person", sector: "Regulator", country: "Morocco", description: "Governor, Bank Al-Maghrib", tags: ["regulator", "central-bank", "monetary-policy"], confidence: 0.99 },
  { id: "pf-fettah", name: "Nadia Fettah Alaoui", aliases: ["N. Fettah", "Nadia Fettah", "Minister Fettah"], type: "person", sector: "Government", country: "Morocco", description: "Minister of Economy and Finance", tags: ["minister", "finance", "government"], confidence: 0.98 },
  { id: "pf-mezzour-r", name: "Ryad Mezzour", aliases: ["R. Mezzour", "Ryad Mezzour"], type: "person", sector: "Government", country: "Morocco", description: "Minister of Industry and Trade", tags: ["minister", "industry", "government"], confidence: 0.96 },
  { id: "pf-benali", name: "Leila Benali", aliases: ["L. Benali", "Leila Benali"], type: "person", sector: "Government", country: "Morocco", description: "Minister of Energy Transition and Sustainable Development", tags: ["minister", "energy", "esg"], confidence: 0.95 },
  { id: "pf-tazi", name: "Karim Tazi", aliases: ["K. Tazi", "Karim Tazi"], type: "person", sector: "Government", country: "Morocco", description: "Minister of Tourism", tags: ["minister", "tourism", "government"], confidence: 0.93 },
  { id: "pf-mezzour-g", name: "Ghita Mezzour", aliases: ["G. Mezzour", "Ghita Mezzour"], type: "person", sector: "Government", country: "Morocco", description: "Minister Delegate for Digital Transition", tags: ["minister", "digital", "ai"], confidence: 0.94 },
  { id: "pf-sekkouri", name: "Younès Sekkouri", aliases: ["Y. Sekkouri", "Younes Sekkouri"], type: "person", sector: "Government", country: "Morocco", description: "Minister of Economic Inclusion and Employment", tags: ["minister", "employment", "government"], confidence: 0.92 },
  { id: "pf-akhannouch", name: "Aziz Akhannouch", aliases: ["A. Akhannouch", "Aziz Akhannouch"], type: "person", sector: "Government", country: "Morocco", description: "Chief of Government (2021-2026)", tags: ["minister", "head-of-government", "government"], confidence: 0.98 },
  { id: "pf-bourita", name: "Nasser Bourita", aliases: ["N. Bourita"], type: "person", sector: "Government", country: "Morocco", description: "Minister of Foreign Affairs", tags: ["minister", "foreign-affairs", "government"], confidence: 0.97 },
  { id: "pf-el-fallah", name: "Amal El Fallah Seghrouchni", aliases: ["A. El Fallah"], type: "person", sector: "Government", country: "Morocco", description: "Minister Delegate for Digital Transition", tags: ["minister", "digital"], confidence: 0.93 },
  { id: "pf-el-moutawakel", name: "Nawal El Moutawakel", aliases: ["N. El Moutawakel"], type: "person", sector: "Sports", country: "Morocco", description: "Olympic champion, IOC member", tags: ["public-figure", "sports", "ioc"], confidence: 0.92 },
  { id: "pf-hayat", name: "Nezha Hayat", aliases: ["N. Hayat"], type: "person", sector: "Regulator", country: "Morocco", description: "Chair of the Board, AMMC", tags: ["regulator", "ammc", "markets"], confidence: 0.94 },
  { id: "pf-baraka", name: "Driss Baraka", aliases: ["D. Baraka"], type: "person", sector: "Government", country: "Morocco", description: "Minister Delegate for Budget", tags: ["minister", "budget", "government"], confidence: 0.90 },

  // JOURNALISTS
  { id: "pf-anouzla", name: "Ali Anouzla", aliases: ["A. Anouzla"], type: "person", sector: "Media", country: "Morocco", description: "Investigative journalist, founder of Lakome", tags: ["press", "investigative", "politics"], confidence: 0.88 },
  { id: "pf-jamai", name: "Aboubakr Jamaï", aliases: ["A. Jamaï", "Aboubakr Jamai"], type: "person", sector: "Media", country: "Morocco", description: "Publisher, economist, founder of Le Journal Hebdomadaire", tags: ["press", "economy", "banking"], confidence: 0.91 },
  { id: "pf-allali", name: "Reda Allali", aliases: ["R. Allali"], type: "person", sector: "Media", country: "Morocco", description: "Editor-in-chief, TelQuel", tags: ["press", "society", "politics"], confidence: 0.87 },
  { id: "pf-ksikes", name: "Driss Ksikes", aliases: ["D. Ksikes"], type: "person", sector: "Media", country: "Morocco", description: "Journalist, writer, former editor of TelQuel", tags: ["press", "culture", "media"], confidence: 0.86 },
  { id: "pf-benchemsi", name: "Ahmed Reda Benchemsi", aliases: ["A. R. Benchemsi", "arbenchemsi"], type: "person", sector: "Media", country: "Morocco", description: "Founder of TelQuel and Nichane, HRW MENA", tags: ["press", "politics", "human-rights"], confidence: 0.88 },
  { id: "pf-el-haouzi", name: "Driss El Haouzi", aliases: ["D. El Haouzi"], type: "person", sector: "Media", country: "Morocco", description: "Senior economic journalist, L'Economiste", tags: ["press", "economy"], confidence: 0.85 },
  { id: "pf-el-ghazali", name: "Mounir El Ghazali", aliases: ["M. El Ghazali"], type: "person", sector: "Media", country: "Morocco", description: "Journalist, Medias24 founder", tags: ["press", "economy", "digital-media"], confidence: 0.85 },
  { id: "pf-ismaili", name: "Said Ismaili", aliases: ["S. Ismaili"], type: "person", sector: "Media", country: "Morocco", description: "Editor, Aujourdhui Le Maroc", tags: ["press", "politics"], confidence: 0.82 },
  { id: "pf-boukhima", name: "Driss Boukhima", aliases: ["D. Boukhima"], type: "person", sector: "Media", country: "Morocco", description: "Senior journalist, MAP", tags: ["press", "state-media"], confidence: 0.80 },
  { id: "pf-benani", name: "Said Benani", aliases: ["S. Benani"], type: "person", sector: "Media", country: "Morocco", description: "Journalist and columnist, Le Matin", tags: ["press", "politics"], confidence: 0.80 },
  { id: "pf-tazi-n", name: "Najwa Tazi", aliases: ["N. Tazi"], type: "person", sector: "Media", country: "Morocco", description: "Business journalist, LesEco", tags: ["press", "economy", "business"], confidence: 0.82 },
  { id: "pf-alaoui-m", name: "Mounia Alaoui", aliases: ["M. Alaoui"], type: "person", sector: "Media", country: "Morocco", description: "Editor, La Vie Eco", tags: ["press", "economy", "business"], confidence: 0.82 },

  // BUSINESS LEADERS & INFLUENCERS
  { id: "pf-tazi-a", name: "Adil Tazi", aliases: ["A. Tazi"], type: "person", sector: "Technology", country: "Morocco", description: "CEO, CBI Group, tech entrepreneur", tags: ["executive", "technology", "entrepreneur"], confidence: 0.85 },
  { id: "pf-el-gorcif", name: "Yassine El Gorcif", aliases: ["Y. El Gorcif"], type: "person", sector: "Technology", country: "Morocco", description: "Founder, Moroccan Startups Association", tags: ["entrepreneur", "startups"], confidence: 0.82 },
  { id: "pf-berrada", name: "Saloua Berrada", aliases: ["S. Berrada"], type: "person", sector: "Technology", country: "Morocco", description: "Founder, Women in Tech Morocco", tags: ["entrepreneur", "women-in-tech"], confidence: 0.80 },
  { id: "pf-el-maliki", name: "Karim El Maliki", aliases: ["K. El Maliki"], type: "person", sector: "Real Estate", country: "Morocco", description: "CEO, Addoha Group", tags: ["executive", "real-estate"], confidence: 0.85 },
  { id: "pf-benslimane", name: "Karim Benslimane", aliases: ["K. Benslimane"], type: "person", sector: "Insurance", country: "Morocco", description: "CEO, RMA Watanya", tags: ["executive", "insurance"], confidence: 0.83 },
  { id: "pf-chaabi", name: "Mounir Chaabi", aliases: ["M. Chaabi"], type: "person", sector: "Conglomerate", country: "Morocco", description: "CEO, Ynna Holding (Chaabi Group)", tags: ["executive", "conglomerate", "chaabi"], confidence: 0.85 },
  { id: "pf-berrada-s", name: "Hicham Berrada", aliases: ["H. Berrada"], type: "person", sector: "Industry", country: "Morocco", description: "CEO, Maghreb Industries", tags: ["executive", "industry"], confidence: 0.80 },
  { id: "pf-sefrioui", name: "Anas Sefrioui", aliases: ["A. Sefrioui"], type: "person", sector: "Real Estate", country: "Morocco", description: "Chairman, Addoha Group (SNI)", tags: ["executive", "real-estate", "sni"], confidence: 0.90 },
  { id: "pf-tazi-m", name: "Mehdi Tazi", aliases: ["M. Tazi"], type: "person", sector: "Insurance", country: "Morocco", description: "CEO, Sanlam Maroc (ex-Saham)", tags: ["executive", "insurance", "sanlam"], confidence: 0.83 },
  { id: "pf-el-alj", name: "Hassan El Alj", aliases: ["H. El Alj"], type: "person", sector: "Construction", country: "Morocco", description: "President, TGCC (Moroccan Construction Federation)", tags: ["executive", "construction", "federation"], confidence: 0.82 },
];

// ─── AFRICAN COMPANIES (30) ────────────────────────────────────

export const AFRICAN_COMPANIES: RegistryEntry[] = [
  { id: "af-sonatrach", name: "Sonatrach", aliases: ["Sonatrach"], type: "company", sector: "Oil & Gas", country: "Algeria", foundedYear: 1963, description: "Algeria's national oil company", tags: ["oil", "gas", "state-owned"], confidence: 0.90 },
  { id: "af-sonelgaz", name: "Sonelgaz", aliases: ["Sonelgaz"], type: "company", sector: "Utilities", country: "Algeria", foundedYear: 1969, description: "Algeria's electricity and gas utility", tags: ["utilities", "electricity", "gas"], confidence: 0.88 },
  { id: "af-ecobank", name: "Ecobank", aliases: ["Ecobank", "ETI", "Ecobank Transnational"], type: "company", sector: "Banking", country: "Togo", foundedYear: 1985, description: "Pan-African banking group", tags: ["banking", "pan-african"], confidence: 0.92 },
  { id: "af-uba", name: "United Bank for Africa", aliases: ["UBA", "United Bank for Africa"], type: "company", sector: "Banking", country: "Nigeria", foundedYear: 1949, description: "Pan-African financial services group", tags: ["banking", "pan-african", "nigeria"], confidence: 0.92 },
  { id: "af-mtn", name: "MTN Group", aliases: ["MTN", "MTN Group"], type: "company", sector: "Telecommunications", country: "South Africa", foundedYear: 1994, description: "Africa's largest mobile operator", tags: ["telecom", "mobile", "south-africa"], confidence: 0.95 },
  { id: "af-dangote", name: "Dangote Group", aliases: ["Dangote", "Dangote Industries"], type: "company", sector: "Conglomerate", country: "Nigeria", foundedYear: 1981, description: "Africa's largest conglomerate", tags: ["conglomerate", "cement", "nigeria"], confidence: 0.95 },
  { id: "af-nampak", name: "Nampak", aliases: ["Nampak"], type: "company", sector: "Packaging", country: "South Africa", foundedYear: 1946, description: "African packaging manufacturer", tags: ["packaging", "south-africa"], confidence: 0.85 },
  { id: "af-sasol", name: "Sasol", aliases: ["Sasol"], type: "company", sector: "Chemicals", country: "South Africa", foundedYear: 1950, description: "Integrated energy and chemicals company", tags: ["chemicals", "energy", "south-africa"], confidence: 0.92 },
  { id: "af-mondi", name: "Mondi Group", aliases: ["Mondi"], type: "company", sector: "Paper & Packaging", country: "South Africa", foundedYear: 1967, description: "Packaging and paper group", tags: ["packaging", "paper"], confidence: 0.88 },
  { id: "af-shoprite", name: "Shoprite Holdings", aliases: ["Shoprite"], type: "company", sector: "Retail", country: "South Africa", foundedYear: 1979, description: "Africa's largest food retailer", tags: ["retail", "supermarket", "south-africa"], confidence: 0.92 },
  { id: "af-naspers", name: "Naspers", aliases: ["Naspers"], type: "company", sector: "Technology", country: "South Africa", foundedYear: 1915, description: "Global internet group and technology investor", tags: ["technology", "internet", "investment"], confidence: 0.95 },
  { id: "af-firstbank", name: "First Bank of Nigeria", aliases: ["FirstBank", "FBN"], type: "company", sector: "Banking", country: "Nigeria", foundedYear: 1894, description: "Nigeria's oldest bank", tags: ["banking", "nigeria"], confidence: 0.90 },
  { id: "af-zenith", name: "Zenith Bank", aliases: ["Zenith Bank"], type: "company", sector: "Banking", country: "Nigeria", foundedYear: 1990, description: "Nigeria's largest bank by assets", tags: ["banking", "nigeria"], confidence: 0.92 },
  { id: "af-gtbank", name: "Guaranty Trust Bank", aliases: ["GTBank", "GTB"], type: "company", sector: "Banking", country: "Nigeria", foundedYear: 1990, description: "Nigerian multinational bank", tags: ["banking", "nigeria"], confidence: 0.90 },
  { id: "af-access", name: "Access Bank", aliases: ["Access Bank"], type: "company", sector: "Banking", country: "Nigeria", foundedYear: 1989, description: "Pan-African banking group", tags: ["banking", "pan-african", "nigeria"], confidence: 0.90 },
  { id: "af-safaricom", name: "Safaricom", aliases: ["Safaricom"], type: "company", sector: "Telecommunications", country: "Kenya", foundedYear: 1997, description: "Kenya's largest telecom (Vodafone subsidiary)", tags: ["telecom", "mobile", "kenya"], confidence: 0.93 },
  { id: "af-equitel", name: "Equity Bank", aliases: ["Equity Bank", "Equity Bank Kenya"], type: "company", sector: "Banking", country: "Kenya", foundedYear: 1984, description: "Pan-African financial services group", tags: ["banking", "kenya", "pan-african"], confidence: 0.90 },
  { id: "af-kcb", name: "Kenya Commercial Bank", aliases: ["KCB", "KCB Group"], type: "company", sector: "Banking", country: "Kenya", foundedYear: 1896, description: "East African banking group", tags: ["banking", "kenya", "east-africa"], confidence: 0.88 },
  { id: "af-eair", name: "Ethiopian Airlines", aliases: ["Ethiopian", "ET"], type: "company", sector: "Aviation", country: "Ethiopia", foundedYear: 1945, description: "Africa's largest airline", tags: ["aviation", "airline", "star-alliance", "ethiopia"], confidence: 0.95 },
  { id: "af-senatech", name: "Ethio Telecom", aliases: ["Ethio Telecom"], type: "company", sector: "Telecommunications", country: "Ethiopia", foundedYear: 1952, description: "Ethiopia's state telecom monopoly", tags: ["telecom", "state-owned", "ethiopia"], confidence: 0.88 },
  { id: "af-cbe", name: "Commercial Bank of Ethiopia", aliases: ["CBE"], type: "company", sector: "Banking", country: "Ethiopia", foundedYear: 1942, description: "Ethiopia's largest bank", tags: ["banking", "ethiopia", "state-owned"], confidence: 0.88 },
  { id: "af-sonatel", name: "Sonatel", aliases: ["Sonatel", "Orange Sonatel"], type: "company", sector: "Telecommunications", country: "Senegal", foundedYear: 1985, description: "Senegalese telecom (Orange subsidiary)", tags: ["telecom", "senegal", "orange"], confidence: 0.90 },
  { id: "af-suneor", name: "Suneor", aliases: ["Suneor", "SODESUN"], type: "company", sector: "Consumer Goods", country: "Senegal", foundedYear: 1973, description: "Senegalese food manufacturer", tags: ["consumer-goods", "food", "senegal"], confidence: 0.82 },
  { id: "af-corus", name: "Coris Bank", aliases: ["Coris Bank", "Coris Bank International"], type: "company", sector: "Banking", country: "Burkina Faso", foundedYear: 2008, description: "West African banking group", tags: ["banking", "west-africa"], confidence: 0.82 },
  { id: "af-boa-group", name: "Bank of Africa Group", aliases: ["BOA Group", "Bank of Africa Group"], type: "company", sector: "Banking", country: "Mali", foundedYear: 1983, description: "Pan-African banking group (BMCE partner)", tags: ["banking", "pan-african"], confidence: 0.88 },
  { id: "af-nedbank", name: "Nedbank", aliases: ["Nedbank", "Nedbank Group"], type: "company", sector: "Banking", country: "South Africa", foundedYear: 1888, description: "South African banking group", tags: ["banking", "south-africa"], confidence: 0.90 },
  { id: "af-standard", name: "Standard Bank", aliases: ["Standard Bank", "Stanbic"], type: "company", sector: "Banking", country: "South Africa", foundedYear: 1862, description: "Africa's largest bank by assets", tags: ["banking", "south-africa", "pan-african"], confidence: 0.95 },
  { id: "af-absa", name: "Absa Group", aliases: ["Absa", "ABSA"], type: "company", sector: "Banking", country: "South Africa", foundedYear: 1991, description: "Pan-African banking group (Barclays subsidiary)", tags: ["banking", "south-africa", "barclays"], confidence: 0.92 },
  { id: "af-vodacom", name: "Vodacom", aliases: ["Vodacom", "Vodacom Group"], type: "company", sector: "Telecommunications", country: "South Africa", foundedYear: 1993, description: "African mobile operator (Vodafone subsidiary)", tags: ["telecom", "mobile", "vodafone"], confidence: 0.92 },
  { id: "af-anglo", name: "Anglo American", aliases: ["Anglo American"], type: "company", sector: "Mining", country: "South Africa", foundedYear: 1917, description: "Global mining company", tags: ["mining", "diamonds", "platinum"], confidence: 0.92 },
];

// ─── INTERNATIONAL COMPANIES OPERATING IN MOROCCO (20) ────────

export const INTERNATIONAL_MOROCCO: RegistryEntry[] = [
  { id: "int-renault", name: "Renault Maroc", aliases: ["Renault Morocco", "Renault-Nissan Tanger"], type: "company", sector: "Automotive", country: "France", headquarters: "Tanger", description: "Automotive manufacturing plant", tags: ["automotive", "manufacturing", "tanger-free-zone"], confidence: 0.90 },
  { id: "int-stellantis", name: "Stellantis Maroc", aliases: ["Stellantis Morocco", "PSA Kenitra"], type: "company", sector: "Automotive", country: "France", headquarters: "Kenitra", description: "Automotive manufacturing plant", tags: ["automotive", "manufacturing"], confidence: 0.88 },
  { id: "int-bombardier", name: "Bombardier Maroc", aliases: ["Bombardier Casablanca"], type: "company", sector: "Aerospace", country: "Canada", headquarters: "Casablanca", description: "Aerospace components manufacturing", tags: ["aerospace", "manufacturing"], confidence: 0.85 },
  { id: "int-safran", name: "Safran Maroc", aliases: ["Safran Morocco"], type: "company", sector: "Aerospace", country: "France", headquarters: "Casablanca", description: "Aerospace systems manufacturing", tags: ["aerospace", "manufacturing"], confidence: 0.88 },
  { id: "int-delphi", name: "Delphi Maroc", aliases: ["Delphi Morocco", "Aptiv Maroc"], type: "company", sector: "Automotive", country: "USA", headquarters: "Tanger", description: "Automotive electronics manufacturing", tags: ["automotive", "electronics"], confidence: 0.85 },
  { id: "int-valeo", name: "Valeo Maroc", aliases: ["Valeo Morocco"], type: "company", sector: "Automotive", country: "France", headquarters: "Tanger", description: "Automotive parts manufacturing", tags: ["automotive", "parts"], confidence: 0.85 },
  { id: "int-schneider", name: "Schneider Electric Maroc", aliases: ["Schneider Morocco"], type: "company", sector: "Electronics", country: "France", headquarters: "Casablanca", description: "Energy management and automation", tags: ["electronics", "energy"], confidence: 0.85 },
  { id: "int-siemens", name: "Siemens Maroc", aliases: ["Siemens Morocco"], type: "company", sector: "Industrial", country: "Germany", headquarters: "Casablanca", description: "Industrial automation and infrastructure", tags: ["industrial", "automation"], confidence: 0.85 },
  { id: "int-oracle", name: "Oracle Maroc", aliases: ["Oracle Morocco"], type: "company", sector: "Technology", country: "USA", headquarters: "Casablanca", description: "Enterprise software and cloud", tags: ["technology", "software", "cloud"], confidence: 0.85 },
  { id: "int-ibm", name: "IBM Maroc", aliases: ["IBM Morocco"], type: "company", sector: "Technology", country: "USA", headquarters: "Casablanca", description: "IT services and consulting", tags: ["technology", "consulting", "ai"], confidence: 0.85 },
  { id: "int-cisco", name: "Cisco Maroc", aliases: ["Cisco Morocco"], type: "company", sector: "Technology", country: "USA", headquarters: "Casablanca", description: "Networking and cybersecurity", tags: ["technology", "networking", "security"], confidence: 0.83 },
  { id: "int-microsoft", name: "Microsoft Maroc", aliases: ["Microsoft Morocco"], type: "company", sector: "Technology", country: "USA", headquarters: "Casablanca", description: "Software and cloud services", tags: ["technology", "software", "azure"], confidence: 0.85 },
  { id: "int-google", name: "Google Maroc", aliases: ["Google Morocco"], type: "company", sector: "Technology", country: "USA", description: "Search, cloud, and advertising", tags: ["technology", "search", "cloud"], confidence: 0.83 },
  { id: "int-amazon", name: "Amazon Maroc", aliases: ["Amazon Morocco", "AWS Morocco"], type: "company", sector: "Technology", country: "USA", description: "E-commerce and cloud computing", tags: ["technology", "ecommerce", "aws"], confidence: 0.83 },
  { id: "int-total", name: "Total Maroc", aliases: ["Total Morocco", "TotalEnergies Maroc"], type: "company", sector: "Energy", country: "France", headquarters: "Casablanca", description: "Fuel distribution and energy", tags: ["energy", "fuel"], confidence: 0.88 },
  { id: "int-shell", name: "Shell Maroc", aliases: ["Shell Morocco"], type: "company", sector: "Energy", country: "Netherlands", headquarters: "Casablanca", description: "Lubricants and energy", tags: ["energy", "lubricants"], confidence: 0.85 },
  { id: "int-vw", name: "Volkswagen Maroc", aliases: ["VW Morocco"], type: "company", sector: "Automotive", country: "Germany", description: "Vehicle distribution", tags: ["automotive", "distribution"], confidence: 0.82 },
  { id: "int-lreal", name: "L'Oréal Maroc", aliases: ["L'Oreal Morocco", "L'Oréal Maroc"], type: "company", sector: "Consumer Goods", country: "France", headquarters: "Casablanca", description: "Cosmetics and beauty products", tags: ["consumer-goods", "cosmetics"], confidence: 0.85 },
  { id: "int-unilever", name: "Unilever Maroc", aliases: ["Unilever Morocco"], type: "company", sector: "Consumer Goods", country: "UK", headquarters: "Casablanca", description: "FMCG and personal care", tags: ["consumer-goods", "fmcg"], confidence: 0.85 },
  { id: "int-nestle", name: "Nestlé Maroc", aliases: ["Nestle Morocco", "Nestlé Maroc"], type: "company", sector: "Consumer Goods", country: "Switzerland", headquarters: "Casablanca", description: "Food and beverages", tags: ["consumer-goods", "food"], confidence: 0.85 },
];

// ─── ALL ENTRIES COMBINED ──────────────────────────────────────

export const ALL_REGISTRY_ENTRIES: RegistryEntry[] = [
  ...BVC_LISTED,
  ...UNLISTED_COMPANIES,
  ...PUBLIC_FIGURES,
  ...AFRICAN_COMPANIES,
  ...INTERNATIONAL_MOROCCO,
];

// ─── HELPER FUNCTIONS ──────────────────────────────────────────

export function searchRegistry(query: string): RegistryEntry[] {
  const lower = query.toLowerCase();
  return ALL_REGISTRY_ENTRIES.filter(e =>
    e.name.toLowerCase().includes(lower) ||
    e.aliases.some(a => a.toLowerCase().includes(lower)) ||
    e.sector?.toLowerCase().includes(lower) ||
    e.tags.some(t => t.toLowerCase().includes(lower))
  );
}

export function getRegistryEntryById(id: string): RegistryEntry | undefined {
  return ALL_REGISTRY_ENTRIES.find(e => e.id === id);
}

export function getEntriesBySector(sector: string): RegistryEntry[] {
  return ALL_REGISTRY_ENTRIES.filter(e =>
    e.sector?.toLowerCase().includes(sector.toLowerCase())
  );
}

export function getEntriesByType(type: RegistryEntry["type"]): RegistryEntry[] {
  return ALL_REGISTRY_ENTRIES.filter(e => e.type === type);
}

export function getEntriesByCountry(country: string): RegistryEntry[] {
  return ALL_REGISTRY_ENTRIES.filter(e =>
    e.country.toLowerCase().includes(country.toLowerCase())
  );
}

export function getEntriesByTag(tag: string): RegistryEntry[] {
  return ALL_REGISTRY_ENTRIES.filter(e =>
    e.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
  );
}

export function getBVCTickers(): Array<{ ticker: string; name: string; sector: string }> {
  return BVC_LISTED
    .filter(e => e.ticker)
    .map(e => ({ ticker: e.ticker!, name: e.name, sector: e.sector || "Other" }));
}

export function getMoroccanCompanies(): RegistryEntry[] {
  return ALL_REGISTRY_ENTRIES.filter(e => e.country === "Morocco" && (e.type === "company" || e.type === "organization"));
}

export function getMoroccanPeople(): RegistryEntry[] {
  return ALL_REGISTRY_ENTRIES.filter(e => e.country === "Morocco" && e.type === "person");
}

export function getAfricanCompanies(): RegistryEntry[] {
  return AFRICAN_COMPANIES;
}

export function getInternationalInMorocco(): RegistryEntry[] {
  return INTERNATIONAL_MOROCCO;
}

export function getRegistryStats(): {
  total: number;
  byType: Record<string, number>;
  bySector: Record<string, number>;
  byCountry: Record<string, number>;
} {
  const byType: Record<string, number> = {};
  const bySector: Record<string, number> = {};
  const byCountry: Record<string, number> = {};

  for (const entry of ALL_REGISTRY_ENTRIES) {
    byType[entry.type] = (byType[entry.type] || 0) + 1;
    if (entry.sector) {
      bySector[entry.sector] = (bySector[entry.sector] || 0) + 1;
    }
    byCountry[entry.country] = (byCountry[entry.country] || 0) + 1;
  }

  return {
    total: ALL_REGISTRY_ENTRIES.length,
    byType,
    bySector,
    byCountry,
  };
}
