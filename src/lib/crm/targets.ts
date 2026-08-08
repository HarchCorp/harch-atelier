// ═══════════════════════════════════════════════════════════════
//  CRM DE LA TERREUR — Cartographie de l'élite marocaine
//
//  Front 2: 200 cibles structurées par secteur avec:
//    - Nom de l'entreprise
//    - Secteur
//    - Dircom / SG / CEO (recherché)
//    - Email professionnel (pattern deviné)
//    - Téléphone direct (si disponible)
//    - Crisis event (pour le rétro-audit)
//    - Statut: NOT_CONTACTED → EMAIL_SENT → REPLIED → MEETING → SIGNED
//
//  Les emails sont des patterns (pas de données personnelles):
//    communication@{domain}
//    direction.com@{domain}
//    secretariat.general@{domain}
//
//  En production, ces emails seraient vérifiés via Hunter.io ou
//  recherchés manuellement. Ici on pose la structure.
// ═══════════════════════════════════════════════════════════════

export interface CRMTarget {
  id: string;
  rank: number;
  companyName: string;
  sector: string;
  domain: string;
  emailPattern: string;
  phone?: string;
  crisisEvent?: string;
  crisisDate?: string;
  status: "NOT_CONTACTED" | "EMAIL_SENT" | "REPLIED" | "MEETING" | "SIGNED" | "REJECTED";
  lastContactDate?: string;
  notes?: string;
}

// ─── Les 200 cibles (Top 50 initial, extensible à 200) ────────────

export const CRM_TARGETS: CRMTarget[] = [
  // ─── BANQUES (15) ──────────────────────────────────────────────
  { id: "t001", rank: 1, companyName: "Attijariwafa Bank", sector: "Banque", domain: "attijariwafa.com", emailPattern: "communication@attijariwafa.com", crisisEvent: "Frais bancaires excessifs", crisisDate: "2023-01-15", status: "NOT_CONTACTED" },
  { id: "t002", rank: 2, companyName: "Bank of Africa (BMCE)", sector: "Banque", domain: "bankofafrica.ma", emailPattern: "communication@bankofafrica.ma", crisisEvent: "Restructuration et suppressions", crisisDate: "2022-09-01", status: "NOT_CONTACTED" },
  { id: "t003", rank: 3, companyName: "Banque Centrale Populaire", sector: "Banque", domain: "bcp.ma", emailPattern: "communication@bcp.ma", status: "NOT_CONTACTED" },
  { id: "t004", rank: 4, companyName: "Banque Marocaine du Commerce Extérieur", sector: "Banque", domain: "bmcebank.ma", emailPattern: "communication@bmcebank.ma", status: "NOT_CONTACTED" },
  { id: "t005", rank: 5, companyName: "Crédit Agricole du Maroc", sector: "Banque", domain: "creditagricole.ma", emailPattern: "communication@creditagricole.ma", status: "NOT_CONTACTED" },
  { id: "t006", rank: 6, companyName: "Crédit Immobilier et Hôtelier", sector: "Banque", domain: "cihbank.ma", emailPattern: "communication@cihbank.ma", status: "NOT_CONTACTED" },
  { id: "t007", rank: 7, companyName: "Société Générale Maroc", sector: "Banque", domain: "socgen.ma", emailPattern: "communication@socgen.ma", status: "NOT_CONTACTED" },
  { id: "t008", rank: 8, companyName: "Banque Populaire", sector: "Banque", domain: "groupebp.ma", emailPattern: "communication@groupebp.ma", status: "NOT_CONTACTED" },
  { id: "t009", rank: 9, companyName: "CFG Bank", sector: "Banque", domain: "cfgbank.ma", emailPattern: "communication@cfgbank.ma", status: "NOT_CONTACTED" },
  { id: "t010", rank: 10, companyName: "Bank Assafa", sector: "Banque", domain: "bankassafa.ma", emailPattern: "communication@bankassafa.ma", status: "NOT_CONTACTED" },
  { id: "t011", rank: 11, companyName: "Umnia Bank", sector: "Banque", domain: "umniabank.ma", emailPattern: "communication@umniabank.ma", status: "NOT_CONTACTED" },
  { id: "t012", rank: 12, companyName: "Al Barid Bank", sector: "Banque", domain: "albaridbank.ma", emailPattern: "communication@albaridbank.ma", status: "NOT_CONTACTED" },
  { id: "t013", rank: 13, companyName: "CCBank", sector: "Banque", domain: "ccbank.ma", emailPattern: "communication@ccbank.ma", status: "NOT_CONTACTED" },
  { id: "t014", rank: 14, companyName: "Dirham Express", sector: "Banque", domain: "dirhamexpress.ma", emailPattern: "communication@dirhamexpress.ma", status: "NOT_CONTACTED" },
  { id: "t015", rank: 15, companyName: "Cash Plus", sector: "Banque", domain: "cashplus.ma", emailPattern: "communication@cashplus.ma", status: "NOT_CONTACTED" },

  // ─── TÉLÉCOM (5) ───────────────────────────────────────────────
  { id: "t016", rank: 16, companyName: "Maroc Telecom (IAM)", sector: "Télécom", domain: "iam.ma", emailPattern: "communication@iam.ma", crisisEvent: "Panne réseau nationale", crisisDate: "2023-06-10", status: "NOT_CONTACTED" },
  { id: "t017", rank: 17, companyName: "Orange Maroc", sector: "Télécom", domain: "orange.ma", emailPattern: "communication@orange.ma", status: "NOT_CONTACTED" },
  { id: "t018", rank: 18, companyName: "INWI", sector: "Télécom", domain: "inwi.ma", emailPattern: "communication@inwi.ma", status: "NOT_CONTACTED" },
  { id: "t019", rank: 19, companyName: "Huawei Maroc", sector: "Télécom", domain: "huawei.com", emailPattern: "communication@huawei.com", status: "NOT_CONTACTED" },
  { id: "t020", rank: 20, companyName: "Cisco Maroc", sector: "Télécom", domain: "cisco.com", emailPattern: "communication@cisco.com", status: "NOT_CONTACTED" },

  // ─── MINING & INDUSTRIE (10) ──────────────────────────────────
  { id: "t021", rank: 21, companyName: "OCP Group", sector: "Mining", domain: "ocp.ma", emailPattern: "communication@ocp.ma", crisisEvent: "Boycott des produits OCP", crisisDate: "2018-04-20", status: "NOT_CONTACTED" },
  { id: "t022", rank: 22, companyName: "Managem", sector: "Mining", domain: "managemgroup.com", emailPattern: "communication@managemgroup.com", status: "NOT_CONTACTED" },
  { id: "t023", rank: 23, companyName: "Ciments du Maroc", sector: "Industrie", domain: "cimentsdumaroc.com", emailPattern: "communication@cimentsdumaroc.com", status: "NOT_CONTACTED" },
  { id: "t024", rank: 24, companyName: "LafargeHolcim Maroc", sector: "Industrie", domain: "lafargeholcim.ma", emailPattern: "communication@lafargeholcim.ma", status: "NOT_CONTACTED" },
  { id: "t025", rank: 25, companyName: "Sonasid", sector: "Industrie", domain: "sonasid.ma", emailPattern: "communication@sonasid.ma", status: "NOT_CONTACTED" },
  { id: "t026", rank: 26, companyName: "LesieurCristal", sector: "Agroalimentaire", domain: "lesieuralgerie.com", emailPattern: "communication@lesieuralgerie.com", status: "NOT_CONTACTED" },
  { id: "t027", rank: 27, companyName: "Cosumar", sector: "Agroalimentaire", domain: "cosumar.co.ma", emailPattern: "communication@cosumar.co.ma", status: "NOT_CONTACTED" },
  { id: "t028", rank: 28, companyName: "Centrale Laitière", sector: "Agroalimentaire", domain: "centrale-laitiere.com", emailPattern: "communication@centrale-laitiere.com", crisisEvent: "Boycott lait 2018", crisisDate: "2018-04-25", status: "NOT_CONTACTED" },
  { id: "t029", rank: 29, companyName: "SNI", sector: "Holding", domain: "sni.ma", emailPattern: "communication@sni.ma", status: "NOT_CONTACTED" },
  { id: "t030", rank: 30, companyName: "Al Mada", sector: "Holding", domain: "almada.ma", emailPattern: "communication@almada.ma", status: "NOT_CONTACTED" },

  // ─── ASSURANCES (5) ────────────────────────────────────────────
  { id: "t031", rank: 31, companyName: "Wafa Assurance", sector: "Assurance", domain: "wafaassurance.ma", emailPattern: "communication@wafaassurance.ma", status: "NOT_CONTACTED" },
  { id: "t032", rank: 32, companyName: "RMA Watanya", sector: "Assurance", domain: "rmawatanya.com", emailPattern: "communication@rmawatanya.com", status: "NOT_CONTACTED" },
  { id: "t033", rank: 33, companyName: "AXA Assurance Maroc", sector: "Assurance", domain: "axa.ma", emailPattern: "communication@axa.ma", status: "NOT_CONTACTED" },
  { id: "t034", rank: 34, companyName: "CNIA Saada", sector: "Assurance", domain: "cniasaada.com", emailPattern: "communication@cniasaada.com", status: "NOT_CONTACTED" },
  { id: "t035", rank: 35, companyName: "MAMDA-MCMA", sector: "Assurance", domain: "mamda.ma", emailPattern: "communication@mamda.ma", status: "NOT_CONTACTED" },

  // ─── TRANSPORT & LOGISTIQUE (5) ───────────────────────────────
  { id: "t036", rank: 36, companyName: "Royal Air Maroc", sector: "Aviation", domain: "royalairmaroc.com", emailPattern: "communication@royalairmaroc.com", crisisEvent: "Retards et annulations été", crisisDate: "2023-07-15", status: "NOT_CONTACTED" },
  { id: "t037", rank: 37, companyName: "ONCF", sector: "Transport", domain: "oncf.ma", emailPattern: "communication@oncf.ma", crisisEvent: "Retards trains répétés", crisisDate: "2023-03-01", status: "NOT_CONTACTED" },
  { id: "t038", rank: 38, companyName: "Marsa Maroc", sector: "Logistique", domain: "marsamaroc.co.ma", emailPattern: "communication@marsamaroc.co.ma", status: "NOT_CONTACTED" },
  { id: "t039", rank: 39, companyName: "CTM", sector: "Transport", domain: "ctm.ma", emailPattern: "communication@ctm.ma", status: "NOT_CONTACTED" },
  { id: "t040", rank: 40, companyName: "DHL Maroc", sector: "Logistique", domain: "dhl.ma", emailPattern: "communication@dhl.ma", status: "NOT_CONTACTED" },

  // ─── ÉNERGIE (5) ──────────────────────────────────────────────
  { id: "t041", rank: 41, companyName: "ONEE", sector: "Énergie", domain: "onee.ma", emailPattern: "communication@onee.ma", status: "NOT_CONTACTED" },
  { id: "t042", rank: 42, companyName: "Lydec", sector: "Énergie", domain: "lydec.ma", emailPattern: "communication@lydec.ma", status: "NOT_CONTACTED" },
  { id: "t043", rank: 43, companyName: "Redal", sector: "Énergie", domain: "redal.ma", emailPattern: "communication@redal.ma", status: "NOT_CONTACTED" },
  { id: "t044", rank: 44, companyName: "Amendis", sector: "Énergie", domain: "amendis.ma", emailPattern: "communication@amendis.ma", status: "NOT_CONTACTED" },
  { id: "t045", rank: 45, companyName: "Shell Maroc", sector: "Énergie", domain: "shell.ma", emailPattern: "communication@shell.ma", status: "NOT_CONTACTED" },

  // ─── RETAIL & DISTRIBUTION (5) ────────────────────────────────
  { id: "t046", rank: 46, companyName: "Marjane Holding", sector: "Retail", domain: "marjane.ma", emailPattern: "communication@marjane.ma", status: "NOT_CONTACTED" },
  { id: "t047", rank: 47, companyName: "Label'Vie", sector: "Retail", domain: "labelvie.ma", emailPattern: "communication@labelvie.ma", status: "NOT_CONTACTED" },
  { id: "t048", rank: 48, companyName: "BIM Maroc", sector: "Retail", domain: "bim.com.tr", emailPattern: "communication@bim.com.tr", status: "NOT_CONTACTED" },
  { id: "t049", rank: 49, companyName: "Aswak Assalam", sector: "Retail", domain: "aswakassalam.com", emailPattern: "communication@aswakassalam.com", status: "NOT_CONTACTED" },
  { id: "t050", rank: 50, companyName: "Decathlon Maroc", sector: "Retail", domain: "decathlon.ma", emailPattern: "communication@decathlon.ma", status: "NOT_CONTACTED" },
];

// ─── Helpers ──────────────────────────────────────────────────────

export function getTargetsBySector(sector: string): CRMTarget[] {
  return CRM_TARGETS.filter((t) => t.sector === sector);
}

export function getTargetsWithCrisis(): CRMTarget[] {
  return CRM_TARGETS.filter((t) => t.crisisEvent);
}

export function getTargetsByStatus(status: CRMTarget["status"]): CRMTarget[] {
  return CRM_TARGETS.filter((t) => t.status === status);
}

export function getSectorStats(): Record<string, number> {
  const stats: Record<string, number> = {};
  for (const t of CRM_TARGETS) {
    stats[t.sector] = (stats[t.sector] ?? 0) + 1;
  }
  return stats;
}

export function getStatusStats(): Record<string, number> {
  const stats: Record<string, number> = {};
  for (const t of CRM_TARGETS) {
    stats[t.status] = (stats[t.status] ?? 0) + 1;
  }
  return stats;
}
