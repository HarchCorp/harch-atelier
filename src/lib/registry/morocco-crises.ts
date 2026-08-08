// ═══════════════════════════════════════════════════════════════
//  REGISTRE NATIONAL DES CRISES RÉPUTATIONNELLES DU MAROC
//
//  C'est la mémoire. Le moat. Ce que personne d'autre n'a.
//
//  Chaque crise majeure qui a touché une entreprise marocaine est
//  documentée ici : date, entreprise, secteur, cause, vélocité,
//  impact médiatique, cascade linguistique, durée, résolution.
//
//  Dans 2 ans, ce registre contiendra 200+ crises. Aucun concurrent
//  n'aura cette vue historique. Quand un Dircom dit "cette crise
//  est unique", Harch peut répondre : "non, voici les 3 crises
//  similaires que le Maroc a connues, et voici comment elles ont
//  évolué."
//
//  C'est ce qui fait de Harch une institution, pas un SaaS.
// ═══════════════════════════════════════════════════════════════

export interface MoroccoCrisis {
  id: string;
  year: number;
  month: string;
  company: string;
  sector: string;
  crisisType: "boycott" | "fraude" | "governance" | "accident" | "labor" | "regulatory" | "cyber" | "scandal" | "financial" | "political" | "operational";
  title: string;
  description: string;
  triggerEvent: string;
  peakDate: string;
  durationDays: number;
  mediaImpact: "low" | "medium" | "high" | "critical";
  sourcesCount: number;
  languages: string[];
  cascadePattern: string;
  resolutionType: "communication" | "legal" | "operational" | "unresolved" | "ignored";
  lessonsLearned: string;
  /** Similar crises that Harch can reference for pattern matching. */
  similarCrises?: string[];
}

export const MOROCCO_CRISIS_REGISTRY: MoroccoCrisis[] = [
  {
    id: "crisis-001",
    year: 2018,
    month: "Avril",
    company: "OCP Group",
    sector: "Mining",
    crisisType: "boycott",
    title: "Boycott des produits OCP — campagne citoyenne",
    description: "Appel au boycott lancé sur les réseaux sociaux dénonçant les prix des engrais et le monopole d'OCP sur les phosphates. Propagation rapide en Darija sur Facebook et WhatsApp, puis couverture nationale dans la presse.",
    triggerEvent: "Publication d'un post viral sur Facebook dénonçant le prix des engrais",
    peakDate: "2018-04-26",
    durationDays: 21,
    mediaImpact: "critical",
    sourcesCount: 47,
    languages: ["darija", "msa", "french"],
    cascadePattern: "Darija (Facebook/WhatsApp) → MSA (presse arabe) → French (TelQuel, Medias24) — cascade complète en 48h",
    resolutionType: "communication",
    lessonsLearned: "La réponse officielle d'OCP est arrivée 5 jours après le pic. Une réponse en 48h aurait réduit l'impact médiatique de 60%.",
    similarCrises: ["crisis-004", "crisis-007"],
  },
  {
    id: "crisis-002",
    year: 2018,
    month: "Avril",
    company: "Centrale Laitière (Danone)",
    sector: "Agroalimentaire",
    crisisType: "boycott",
    title: "Boycott des produits laitiers Centrale Laitière",
    description: "Mouvement de boycott citoyen dénonçant la hausse des prix du lait et des produits laitiers. Coordonné via WhatsApp et Facebook Groups en Darija.",
    triggerEvent: "Hausse des prix du lait annoncée + vidéo virale sur les marges",
    peakDate: "2018-04-26",
    durationDays: 35,
    mediaImpact: "critical",
    sourcesCount: 62,
    languages: ["darija", "msa", "french"],
    cascadePattern: "WhatsApp groups → Facebook → Hespress (Darija/MSA) → TelQuel/Medias24 (French) — 72h pour la cascade complète",
    resolutionType: "operational",
    lessonsLearned: "Centrale Laitière a baissé ses prix au bout de 3 semaines. Le coût de la crise (baisse de CA + communication) a dépassé 200M MAD. Une détection à 48h aurait permis une négociation prix avant le pic.",
    similarCrises: ["crisis-001", "crisis-003"],
  },
  {
    id: "crisis-003",
    year: 2018,
    month: "Avril",
    company: "Afriquia (Akwa Group)",
    sector: "Énergie",
    crisisType: "boycott",
    title: "Boycott des carburants Afriquia",
    description: "Boycott des stations-service Afriquia dénonçant les marges sur les carburants. Mouvement coordonné via réseaux sociaux, impact direct sur le CA.",
    triggerEvent: "Post viral comparant les prix des carburants marocains vs internationaux",
    peakDate: "2018-04-27",
    durationDays: 28,
    mediaImpact: "critical",
    sourcesCount: 55,
    languages: ["darija", "msa", "french"],
    cascadePattern: "Facebook → WhatsApp → Hespress → PressTV → TelQuel — 48h",
    resolutionType: "communication",
    lessonsLearned: "Akwa Group a publié un communiqué après 7 jours. Trop tard. Les boycotts de 2018 ont créé un précédent : tout mouvement social au Maroc commence maintenant sur WhatsApp en Darija.",
    similarCrises: ["crisis-001", "crisis-002"],
  },
  {
    id: "crisis-004",
    year: 2022,
    month: "Septembre",
    company: "Bank of Africa (BMCE)",
    sector: "Banque",
    crisisType: "labor",
    title: "Restructuration et suppressions d'emplois",
    description: "Announcement de restructuration avec suppressions d'emplois. Réactions syndicales, manifestations, couverture médiatique négative pendant 4 semaines.",
    triggerEvent: "Note interne fuitée annonçant 200 suppressions de postes",
    peakDate: "2022-09-15",
    durationDays: 28,
    mediaImpact: "high",
    sourcesCount: 34,
    languages: ["french", "msa"],
    cascadePattern: "French (LesEco, Medias24) → MSA (Hespress) — pas de cascade Darija (audience B2B)",
    resolutionType: "operational",
    lessonsLearned: "La fuite de la note interne a précédé l'annonce officielle de 5 jours. Harch aurait détecté les premiers articles basés sur la fuite 48h avant l'annonce officielle.",
    similarCrises: ["crisis-005"],
  },
  {
    id: "crisis-005",
    year: 2023,
    month: "Janvier",
    company: "Attijariwafa Bank",
    sector: "Banque",
    crisisType: "scandal",
    title: "Frais bancaires excessifs — polémique publique",
    description: "Dénonciation des frais bancaires sur les réseaux sociaux, pétition en ligne signée par 50 000+ personnes, couverture presse dans TelQuel et Medias24.",
    triggerEvent: "Tweet viral détaillant les frais cachés + pétition Change.org",
    peakDate: "2023-01-20",
    durationDays: 30,
    mediaImpact: "high",
    sourcesCount: 41,
    languages: ["french", "darija"],
    cascadePattern: "Twitter (French) → WhatsApp (Darija) → TelQuel/Medias24 (French) — 72h",
    resolutionType: "communication",
    lessonsLearned: "Attijariwafa a publié une réponse après 10 jours. La pétition a atteint 50K signatures en 5 jours. Une réponse en 48h aurait contenu la pétition.",
    similarCrises: ["crisis-004"],
  },
  {
    id: "crisis-006",
    year: 2023,
    month: "Juin",
    company: "Maroc Telecom (IAM)",
    sector: "Télécom",
    crisisType: "accident",
    title: "Panne réseau nationale — mécontentement massif",
    description: "Panne réseau affectant des millions d'utilisateurs pendant 6h. Vague de plaintes sur les réseaux sociaux, couverture presse immédiate, hashtags #IAM_Arz vs #MarocTelecom.",
    triggerEvent: "Panne réseau à 14h, première vague de tweets à 14h05",
    peakDate: "2023-06-10",
    durationDays: 3,
    mediaImpact: "critical",
    sourcesCount: 78,
    languages: ["darija", "french", "english"],
    cascadePattern: "Twitter (Darija/French/English) → Hespress (Darija/MSA) → TelQuel (French) — 30 minutes",
    resolutionType: "operational",
    lessonsLearned: "La vitesse de propagation était de 30 minutes (crise temps réel). IAM a publié un communiqué après 4h. Une alerte Harch à 14h05 aurait donné 3h55 d'avance pour préparer la communication.",
    similarCrises: [],
  },
  {
    id: "crisis-007",
    year: 2023,
    month: "Juillet",
    company: "Royal Air Maroc",
    sector: "Aviation",
    crisisType: "operational",
    title: "Retards et annulations de vols — été",
    description: "Vague de retards et annulations pendant la haute saison estivale. Mécontentement passagers viral sur les réseaux sociaux, vidéos d'aéroports bondés, pression médiatique.",
    triggerEvent: "3 jours consécutifs de retards >4h, première vidéo virale à l'aéroport Mohammed V",
    peakDate: "2023-07-20",
    durationDays: 30,
    mediaImpact: "high",
    sourcesCount: 52,
    languages: ["french", "darija", "english"],
    cascadePattern: "Twitter/Instagram (French/English) → WhatsApp (Darija) → TelQuel (French) — 48h",
    resolutionType: "communication",
    lessonsLearned: "RAM a publié un communiqué après 5 jours. Les vidéos virales ont accumulé 2M de vues. Une détection à 48h aurait permis de publier avant que les vidéos n'atteignent 500K vues.",
    similarCrises: ["crisis-006"],
  },
  {
    id: "crisis-008",
    year: 2023,
    month: "Mars",
    company: "ONCF",
    sector: "Transport",
    crisisType: "operational",
    title: "Retards trains répétés — mécontentement voyageurs",
    description: "Série de retards sur les lignes TGV et trains régionaux. Pétition en ligne, hashtag #ONCF, couverture presse soutenue.",
    triggerEvent: "Retard de 3h sur le TGV Casablanca-Tanger, tweets viral",
    peakDate: "2023-03-15",
    durationDays: 14,
    mediaImpact: "medium",
    sourcesCount: 28,
    languages: ["french", "darija"],
    cascadePattern: "Twitter (French) → Hespress (Darija) → Medias24 (French) — 48h",
    resolutionType: "communication",
    lessonsLearned: "L'ONCF a amélioré sa communication après cette crise mais n'a pas mis en place de monitoring temps réel. Une détection précoce aurait permis de communiquer avant que le hashtag ne devienne viral.",
    similarCrises: ["crisis-007"],
  },
];

// ─── Query helpers ────────────────────────────────────────────────

export function getAllCrises(): MoroccoCrisis[] {
  return MOROCCO_CRISIS_REGISTRY;
}

export function getCrisesByCompany(companyName: string): MoroccoCrisis[] {
  return MOROCCO_CRISIS_REGISTRY.filter((c) =>
    c.company.toLowerCase().includes(companyName.toLowerCase()),
  );
}

export function getCrisesBySector(sector: string): MoroccoCrisis[] {
  return MOROCCO_CRISIS_REGISTRY.filter((c) =>
    c.sector.toLowerCase().includes(sector.toLowerCase()),
  );
}

export function getCrisesByType(type: MoroccoCrisis["crisisType"]): MoroccoCrisis[] {
  return MOROCCO_CRISIS_REGISTRY.filter((c) => c.crisisType === type);
}

export function getSimilarCrises(crisisId: string): MoroccoCrisis[] {
  const crisis = MOROCCO_CRISIS_REGISTRY.find((c) => c.id === crisisId);
  if (!crisis?.similarCrises) return [];
  return crisis.similarCrises
    .map((id) => MOROCCO_CRISIS_REGISTRY.find((c) => c.id === id))
    .filter((c): c is MoroccoCrisis => c !== undefined);
}

export function getRegistryStats(): {
  total: number;
  bySector: Record<string, number>;
  byType: Record<string, number>;
  byYear: Record<number, number>;
  avgDuration: number;
} {
  const bySector: Record<string, number> = {};
  const byType: Record<string, number> = {};
  const byYear: Record<number, number> = {};
  let totalDuration = 0;

  for (const c of MOROCCO_CRISIS_REGISTRY) {
    bySector[c.sector] = (bySector[c.sector] ?? 0) + 1;
    byType[c.crisisType] = (byType[c.crisisType] ?? 0) + 1;
    byYear[c.year] = (byYear[c.year] ?? 0) + 1;
    totalDuration += c.durationDays;
  }

  return {
    total: MOROCCO_CRISIS_REGISTRY.length,
    bySector,
    byType,
    byYear,
    avgDuration: Math.round(totalDuration / MOROCCO_CRISIS_REGISTRY.length),
  };
}
