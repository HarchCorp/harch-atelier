// ═══════════════════════════════════════════════════════════════
//  POST /api/console/crisis-playbook
//
//  Skill 17 — Crisis Playbook Builder.
//
//  Generates a structured, PDF-ready crisis response playbook for one
//  of five crisis archetypes. Each playbook has 4 sequential phases
//  (Détection & Confinement → Communication Publique → Remédiation
//  & Action → Sortie & Apprentissage), each carrying a timeline
//  badge, a set of action items (title + owner + priority + desc),
//  and ready-to-use communication templates (name + French prose).
//
//  Body: { crisisType }
//    crisisType: "boycott" | "product" | "executive"
//              | "regulatory" | "cybersecurity"
//
//  Returns: { playbook: { type, label, phases: [...] } }
//
//  The content is rule-based (no DB queries required) so the playbook
//  is delivered synchronously and deterministically — the same crisis
//  type always yields the same baseline playbook. The client-side
//  "Personnaliser" mode lets the Dircom edit actions/templates before
//  export. A future LLM pass (ZAI_API_KEY + GLM-4) could personalise
//  the playbook from the actual crisis signals detected by the
//  crisis-briefing route (same enhancement pattern as DocumentWriter).
//
//  Auth: requires session (getServerSession). Demo sessions are
//  served the same playbook — the content is archetype-driven, not
//  company-driven, so there is no demo/real fork here.
//
//  Skill ID: SKILL-17-CRISIS-PLAYBOOK
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { logInfo, logError } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

// ─── Types (returned to the client) ─────────────────────────────

export type CrisisType =
  | "boycott"
  | "product"
  | "executive"
  | "regulatory"
  | "cybersecurity";

export type ActionPriority = "critical" | "high" | "medium";

export interface PlaybookAction {
  title: string;
  owner: string;
  priority: ActionPriority;
  description: string;
}

export interface PlaybookTemplate {
  name: string;
  content: string;
}

export interface PlaybookPhase {
  name: string;
  timeline: string;
  actions: PlaybookAction[];
  templates: PlaybookTemplate[];
}

export interface Playbook {
  type: CrisisType;
  label: string;
  generatedAt: string;
  phases: PlaybookPhase[];
}

interface CrisisPlaybookResponse {
  playbook: Playbook;
}

// ─── Crisis type catalogue ──────────────────────────────────────
//
// Each archetype carries a French display label + a one-line context
// blurb surfaced in the type-selector cards on the client.

export const CRISIS_TYPES: Array<{
  type: CrisisType;
  label: string;
  blurb: string;
}> = [
  {
    type: "boycott",
    label: "Boycott consommateur",
    blurb:
      "Appel au boycott diffusé sur les réseaux sociaux ou relayé par des associations de consommateurs.",
  },
  {
    type: "product",
    label: "Défaut produit",
    blurb:
      "Défaut, contamination ou rappel de produit portant atteinte à la sécurité des clients.",
  },
  {
    type: "executive",
    label: "Scandale dirigeant",
    blurb:
      "Déclaration publique, conduite ou conflit d'intérêts impliquant un membre de la direction.",
  },
  {
    type: "regulatory",
    label: "Action réglementaire",
    blurb:
      "Enquête, inspection, sanction ou notification d'un régulateur (concurrence, bourse, secteur).",
  },
  {
    type: "cybersecurity",
    label: "Incident cyber",
    blurb:
      "Compromission de données, ransomware ou intrusion affectant les systèmes d'information.",
  },
];

// ─── POST handler ───────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ─── Parse body ──────────────────────────────────────────────
  let crisisType: CrisisType | null = null;
  try {
    const body = await req.json();
    const raw = typeof body?.crisisType === "string" ? body.crisisType : "";
    if (
      raw === "boycott" ||
      raw === "product" ||
      raw === "executive" ||
      raw === "regulatory" ||
      raw === "cybersecurity"
    ) {
      crisisType = raw;
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!crisisType) {
    return NextResponse.json(
      { error: "Missing or invalid crisisType" },
      { status: 400 },
    );
  }

  try {
    const playbook = buildPlaybook(crisisType);
    logInfo(
      "crisis-playbook",
      `Playbook generated for type=${crisisType}, phases=${playbook.phases.length}, actions=${playbook.phases.reduce(
        (n, p) => n + p.actions.length,
        0,
      )}`,
    );
    const response: CrisisPlaybookResponse = { playbook };
    return NextResponse.json(response);
  } catch (err) {
    logError("crisis-playbook", `Build failed: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}

// ─── Builder ────────────────────────────────────────────────────

function buildPlaybook(type: CrisisType): Playbook {
  const meta = CRISIS_TYPES.find((c) => c.type === type);
  const label = meta?.label ?? type;
  return {
    type,
    label,
    generatedAt: new Date().toISOString(),
    // Spread to a fresh mutable array — the source library is a
    // frozen-shape `readonly PlaybookPhases` so callers cannot mutate
    // the shared module-scope constant by accident.
    phases: [...PLAYBOOKS[type]],
  };
}

// ─── Phase library (per crisis type) ────────────────────────────
//
// Four phases, constant cadence across archetypes so the analyst can
// pivot from one crisis type to another without re-learning the
// rhythm. Phase timelines use a stable 0-2h / 2-24h / J1-J7 / J7-J30
// grid; only the action items + templates differ per archetype.

const PHASE_TIMELINES = {
  detect: "Heures 0 à 2",
  comms: "Heures 2 à 24",
  remediation: "Jour 1 à Jour 7",
  exit: "Jour 7 à Jour 30",
} as const;

type PlaybookPhases = readonly PlaybookPhase[];

const PLAYBOOKS: Record<CrisisType, PlaybookPhases> = {
  // ─────────────────────────────────────────────────────────────
  //  BOYCOTT CONSOMMATEUR
  // ─────────────────────────────────────────────────────────────
  boycott: [
    {
      name: "Détection & Confinement",
      timeline: PHASE_TIMELINES.detect,
      actions: [
        {
          title: "Activer la cellule de crise Dircom",
          owner: "Direction de la Communication",
          priority: "critical",
          description:
            "Convoquer le comité de crise (Dircom, DG, Juridique, RSE, Customer Care). Désigner un porte-parole unique et un secrétariat de crise consignant chaque décision horodatée.",
        },
        {
          title: "Cartographier l'origine du boycott",
          owner: "Veille réputationnelle",
          priority: "critical",
          description:
            "Identifier le post ou compte déclencheur, les hashtags associés, la vélocité de propagation et les relais (associations, influenceurs, médias). Estimer la portée atteinte à H+2.",
        },
        {
          title: "Suspendre les campagnes actives",
          owner: "Direction Marketing",
          priority: "high",
          description:
            "Mettre en pause les investissements média payants (social, display, search de marque) tant que le sentiment reste négatif. Éviter toute communication perçue comme ton déconnecté.",
        },
        {
          title: "Mobiliser le service client",
          owner: "Direction Customer Care",
          priority: "high",
          description:
            "Brief unified des équipes client (téléphone, WhatsApp Business, réseaux). Mettre à disposition une FAQ de crise et un script de réponse homologué par le Juridique.",
        },
      ],
      templates: [
        {
          name: "Note interne — activation cellule de crise",
          content:
            "À : Comité de direction\nDe : Direction de la Communication\nObjet : Activation de la cellule de crise — boycott en cours\n\nUn appel au boycott diffusé sur les réseaux sociaux gagne en vélocité depuis le [date/heure]. Origine identifiée : [compte/hashtag]. Portée estimée à H+2 : [X] contacts.\n\nLa cellule de crise est activée à compter de [heure]. Réunion de cadrage à [lieu/lien] à [heure]. Porte-parole désigné : [nom].\n\nPremières consignes :\n  1. Aucune communication externe non homologuée.\n  2. Campagnes média payantes suspendues.\n  3. Service client briefé avec la FAQ de crise v1.\n\nProchain point de situation : [heure].",
        },
        {
          name: "Brief service client (WhatsApp Business)",
          content:
            "Bonjour, merci de votre message. Nous prenons acte de vos préoccupations et les transmettons à la direction. Notre engagement : répondre factuellement, sans polémique. Toute question sera traitée sous 24h. Nous restons à votre écoute.",
        },
      ],
    },
    {
      name: "Communication Publique",
      timeline: PHASE_TIMELINES.comms,
      actions: [
        {
          title: "Publier une déclaration publique",
          owner: "Direction de la Communication",
          priority: "critical",
          description:
            "Diffuser un communiqué factuel sur le site corporate et les canaux sociaux officiels. Ton : mesuré, transparent, sans ironie. Reconnaître l'écoute et annoncer les actions concrètes engagées.",
        },
        {
          title: "Engager un dialogue avec les initiateurs",
          owner: "Direction des Affaires Publiques",
          priority: "high",
          description:
            "Contacter en privé les comptes à l'origine du boycott pour comprendre les griefs et ouvrir un canal de dialogue documenté. Ne pas négocier sous pression publique.",
        },
        {
          title: "Brief presse et agences",
          owner: "Relations Presse",
          priority: "high",
          description:
            "Informer agences et journalistes clés du positionnement officiel. Tenir un point de presse si la portée dépasse le seuil défini. Refuser le off-the-record contradictoire avec la ligne publique.",
        },
        {
          title: "Renforcer la veille 24/7",
          owner: "Veille réputationnelle",
          priority: "medium",
          description:
            "Mettre en place une surveillance continue (mentions, sentiment, sources) avec alertes horaires. Détecter toute escalade vers un média mainstream ou un régulateur.",
        },
      ],
      templates: [
        {
          name: "Communiqué de position publique",
          content:
            "[Entreprise] a pris connaissance des préoccupations exprimées ces dernières heures par une partie de ses clients. Nous les prenons au sérieux.\n\nNos équipes ont engagé les actions suivantes :\n  • [action concrète 1]\n  • [action concrète 2]\n  • [action concrète 3]\n\nNous restons à l'écoute. Un point d'étape sera partagé sous 48 heures. La satisfaction et la confiance de nos clients restent notre priorité.",
        },
        {
          name: "Message de réponse réseaux sociaux",
          content:
            "Bonjour, merci pour votre message. Nous avons pris connaissance de votre préoccupation et l'avons transmise à nos équipes. Une réponse factuelle vous sera adressée. Notre engagement : transparence et écoute.",
        },
      ],
    },
    {
      name: "Remédiation & Action",
      timeline: PHASE_TIMELINES.remediation,
      actions: [
        {
          title: "Mettre en œuvre les engagements pris",
          owner: "Direction des Opérations",
          priority: "critical",
          description:
            "Exécuter les actions annoncées publiquement dans les délais communiqués. Documenter chaque jalon (preuve de diligence). Toute glissade de calendrier doit être communiquée avant l'échéance.",
        },
        {
          title: "Publier un point d'étape",
          owner: "Direction de la Communication",
          priority: "high",
          description:
            "À J+3 et J+7, diffuser un point d'étape factuel (avancement, indicateurs, prochaines étapes). Pas de promesse nouvelle tant que les engagements initiaux ne sont pas tenus.",
        },
        {
          title: "Activer les relais de confiance",
          owner: "Direction RSE",
          priority: "medium",
          description:
            "Mobiliser partenaires, associations et clients de longue date susceptibles de témoigner de la sincérité de la démarche. Aucune rémunération cachée — transparence obligatoire.",
        },
      ],
      templates: [
        {
          name: "Point d'étape J+3",
          content:
            "Trois jours après l'ouverture du dialogue, voici l'avancement de nos engagements :\n\n  1. [engagement 1] — statut : [en cours / finalisé], preuve : [lien/document].\n  2. [engagement 2] — statut : [en cours / finalisé].\n  3. [engagement 3] — statut : [à venir].\n\nProchaine étape à [date]. Nous remercions les clients qui ont accepté d'échanger directement avec nos équipes.",
        },
      ],
    },
    {
      name: "Sortie & Apprentissage",
      timeline: PHASE_TIMELINES.exit,
      actions: [
        {
          title: "Clôturer officiellement la cellule de crise",
          owner: "Direction Générale",
          priority: "medium",
          description:
            "Convoquer une séance de clôture. Confirmer le retour à la normale (sentiment, vélocité, portée). Désactiver la veille 24/7 et basculer sur la veille standard.",
        },
        {
          title: "Produire le post-mortem",
          owner: "Direction de la Communication",
          priority: "high",
          description:
            "Rédiger une note d'apprentissage : chronologie, décisions, impact, écarts. Identifier 3 actions préventives (process, formation, signaux d'alerte plus précoces).",
        },
        {
          title: "Renforcer les dispositifs de veille",
          owner: "Veille réputationnelle",
          priority: "medium",
          description:
            "Ajuster les seuils d'alerte de la plateforme HarchIQ en fonction des signaux précurseurs observés. Planifier une revue trimestrielle du dispositif.",
        },
      ],
      templates: [
        {
          name: "Note de post-mortem",
          content:
            "Objet : Post-mortem crise boycott [période]\n\n1. Chronologie : premier signal [date/heure], pic [date/heure], retour à normale [date/heure].\n2. Décisions clés : [liste horodatée].\n3. Impact : sentiment [X→Y], portée estimée [Z], [impact commercial si mesurable].\n4. Écarts et apprentissages : [liste].\n5. Actions préventives : [3 actions assignées avec responsables et échéances].",
        },
      ],
    },
  ],

  // ─────────────────────────────────────────────────────────────
  //  DÉFAUT PRODUIT
  // ─────────────────────────────────────────────────────────────
  product: [
    {
      name: "Détection & Confinement",
      timeline: PHASE_TIMELINES.detect,
      actions: [
        {
          title: "Qualifier le défaut et l'ampleur",
          owner: "Direction Qualité",
          priority: "critical",
          description:
            "Caractériser la nature du défaut, les lots concernés, le périmètre géographique et le risque client (sécurité, santé, conformité). Estimer le volume de produits impactés.",
        },
        {
          title: "Décider du rappel ou du retrait",
          owner: "Direction Générale",
          priority: "critical",
          description:
            "Arbitrer entre rappel volontaire, retrait préventif ou action corrective ciblée. La décision et son heure sont consignées et notifiées au régulateur secteur si requis.",
        },
        {
          title: "Activer la cellule de crise produit",
          owner: "Direction de la Communication",
          priority: "critical",
          description:
            "Réunir Qualité, Logistique, Juridique, Customer Care, Dircom, RSE. Désigner le porte-parole. Préparer la coordination avec les autorités de contrôle.",
        },
        {
          title: "Sécuriser la chaîne logistique",
          owner: "Direction Logistique",
          priority: "high",
          description:
            "Bloquer les expéditions des lots concernés, isoler les stocks entreposés et préparer la procédure de retour client. Documenter chaque mouvement pour audit.",
        },
      ],
      templates: [
        {
          name: "Notification interne — défaut produit",
          content:
            "À : Comité de crise produit\nDe : Direction Qualité\nObjet : Défaut détecté — lot [référence]\n\nNature du défaut : [description]. Lots concernés : [références]. Périmètre : [sites/régions]. Risque client estimé : [sécurité / santé / conformité / mineur].\n\nDécision requise à [heure] : rappel / retrait / action corrective. Notif régulateur : [oui/non]. Porte-parole : [nom].",
        },
        {
          name: "Notification au régulateur (modèle)",
          content:
            "Objet : Notification de défaut produit — [entreprise] / [référence lot]\n\nNous portons à votre connaissance la détection d'un défaut affectant le lot [référence]. Nature : [description]. Volume estimé : [unités]. Périmètre : [zones]. Mesures engagées : [rappel / retrait / isolement stock]. Nous restons à votre disposition pour tout complément.",
        },
      ],
    },
    {
      name: "Communication Publique",
      timeline: PHASE_TIMELINES.comms,
      actions: [
        {
          title: "Publier l'avis de rappel",
          owner: "Direction de la Communication",
          priority: "critical",
          description:
            "Diffuser l'avis de rappel sur le site corporate, les réseaux sociaux et les points de vente. Inclure : identification du lot, motif, conduite à tenir, canal de retour.",
        },
        {
          title: "Activer le canal de retour client",
          owner: "Direction Customer Care",
          priority: "critical",
          description:
            "Ouvrir un canal dédié (téléphone, formulaire, WhatsApp Business) avec procédure de remboursement ou d'échange simplifiée. Capacité d'absorption dimensionnée au volume attendu.",
        },
        {
          title: "Brief presse spécialisée",
          owner: "Relations Presse",
          priority: "high",
          description:
            "Informer les médias spécialisés du secteur et la presse locale des zones concernées. Mettre à disposition un porteur technique pour répondre aux questions factuelles.",
        },
        {
          title: "Coordonner avec les distributeurs",
          owner: "Direction Commerciale",
          priority: "high",
          description:
            "Notifier l'ensemble des distributeurs et points de vente. Fournir les consignes de retrait, d'affichage en rayon et de traitement des retours clients.",
        },
      ],
      templates: [
        {
          name: "Avis de rappel produit",
          content:
            "AVIS DE RAPPEL — [Nom du produit]\n\nDans le cadre de notre démarche de transparence et de sécurité, nous informons nos clients d'un rappel concernant le produit [nom], lot [référence], date de péremption [date], commercialisé entre le [date] et le [date].\n\nMotif : [description factuelle]. Risque identifié : [nature].\n\nConduite à tenir : ne pas consommer / utiliser le produit. Rapportez-le en point de vente pour échange ou remboursement, ou contactez-nous au [canal].\n\nNous prions nos clients de nous excuser pour cette situation et mettons tout en œuvre pour la résoudre.",
        },
        {
          name: "Réponse client type (WhatsApp)",
          content:
            "Bonjour, nous confirmons la prise en charge de votre demande relative au lot [référence]. Pour procéder à l'échange ou au remboursement, merci de nous indiquer votre point de vente habituel. Aucune preuve d'achat n'est exigée pour les lots visés par le rappel.",
        },
      ],
    },
    {
      name: "Remédiation & Action",
      timeline: PHASE_TIMELINES.remediation,
      actions: [
        {
          title: "Corriger la cause racine",
          owner: "Direction Qualité",
          priority: "critical",
          description:
            "Mener l'analyse des causes (5 Pourquoi, Ishikawa). Mettre en œuvre les actions correctives sur le processus de fabrication ou de contrôle. Vérifier l'efficacité avant reprise.",
        },
        {
          title: "Suivre le taux de retour",
          owner: "Direction Logistique",
          priority: "high",
          description:
            "Piloter quotidiennement le taux de retour client (vs volume estimé). Alerte si le taux reste inférieur au seuil de sécurité défini avec le régulateur.",
        },
        {
          title: "Communiquer la résolution",
          owner: "Direction de la Communication",
          priority: "high",
          description:
            "À la clôture du rappel, publier un bilan factuel : volume retourné, causes identifiées, mesures préventives déployées. Reconnaître l'impact et remercier les clients.",
        },
      ],
      templates: [
        {
          name: "Bilan de clôture du rappel",
          content:
            "Clôture du rappel — [Nom du produit] / lot [référence]\n\nPériode : du [date] au [date].\nVolume retourné : [X] unités ([Y] % du volume estimé).\nCause racine identifiée : [description].\nMesures correctives déployées : [liste].\nMesures préventives : [liste].\n\nNous remercions nos clients et partenaires pour leur coopération. Notre engagement qualité reste renforcé.",
        },
      ],
    },
    {
      name: "Sortie & Apprentissage",
      timeline: PHASE_TIMELINES.exit,
      actions: [
        {
          title: "Réviser le plan de contrôle qualité",
          owner: "Direction Qualité",
          priority: "high",
          description:
            "Intégrer les leçons apprises au plan HACCP / contrôle qualité. Renforcer les points de contrôle concernés et former les équipes aux nouveaux seuils.",
        },
        {
          title: "Documenter pour audit",
          owner: "Direction Juridique & Conformité",
          priority: "medium",
          description:
            "Archiver l'ensemble de la traçabilité (décision, notifications, retours, corrections) pour les audits interne, régulateur et assurance. Délai de conservation défini.",
        },
        {
          title: "Restituer au comité de direction",
          owner: "Direction Générale",
          priority: "medium",
          description:
            "Présenter le post-mortem au CODIR. Valider les indicateurs avancés à surveiller. Intégrer la crise au corpus de formation interne.",
        },
      ],
      templates: [
        {
          name: "Note de post-mortem produit",
          content:
            "Objet : Post-mortem rappel produit [référence]\n\n1. Détection : [date/heure], via [source].\n2. Décision de rappel : [date/heure], validée par [nom].\n3. Cause racine : [description].\n4. Volume impacté : [X] unités ; retour : [Y] %.\n5. Coûts (estimation) : [rappel, remboursement, perte de marge].\n6. Mesures préventives : [3 actions avec responsables].",
        },
      ],
    },
  ],

  // ─────────────────────────────────────────────────────────────
  //  SCANDALE DIRIGEANT
  // ─────────────────────────────────────────────────────────────
  executive: [
    {
      name: "Détection & Confinement",
      timeline: PHASE_TIMELINES.detect,
      actions: [
        {
          title: "Qualifier les faits et leur portée",
          owner: "Direction Juridique",
          priority: "critical",
          description:
            "Établir les faits de manière factuelle (dates, personnes, preuves). Distinguer ce qui est avéré, allégué et spéculé. Évaluer l'exposition juridique, réputationnelle et contractuelle.",
        },
        {
          title: "Convoquer le conseil d'administration",
          owner: "Secrétariat du Conseil",
          priority: "critical",
          description:
            "Réunir le conseil ou son bureau pour décider des mesures conservatoires (suspension temporaire, mise à l'écart, enquête interne). Consigner la délibération.",
        },
        {
          title: "Désigner un porte-parole neutre",
          owner: "Direction de la Communication",
          priority: "critical",
          description:
            "Le dirigeant concerné ne peut être porte-parole de sa propre situation. Désigner un administrateur, le DG adjoint ou la Dircom pour porter la parole publique.",
        },
        {
          title: "Protéger les collaborateurs",
          owner: "Direction des Ressources Humaines",
          priority: "high",
          description:
            "Brief unified des managers. Canaux de signalement ouverts. Lutte contre toute forme de représailles ou de pression interne liée à la situation.",
        },
      ],
      templates: [
        {
          name: "Note interne — mesures conservatoires",
          content:
            "À : Conseil d'administration\nDe : Direction Juridique\nObjet : Mesures conservatoires — situation dirigeant\n\nFaits : [description factuelle, datée]. Portée juridique estimée : [nature].\n\nMesures proposées au conseil :\n  1. Suspension temporaire de [fonction] pour [durée / enquête].\n  2. Ouverture d'une enquête interne confiée à [comité / cabinet].\n  3. Désignation d'un porte-parole neutre : [nom].\n\nCommunication publique coordonnée à [heure].",
        },
        {
          name: "Brief managers (interne)",
          content:
            "Bonjour, une situation impliquant un membre de la direction fait l'objet d'un traitement par le conseil d'administration. À ce stade, nous communiquons en interne les éléments suivants : [éléments validés]. Merci de ne pas spéculer auprès de vos équipes et de remonter toute question au DRH ou à la Dircom. Un point d'étape sera partagé sous 48h.",
        },
      ],
    },
    {
      name: "Communication Publique",
      timeline: PHASE_TIMELINES.comms,
      actions: [
        {
          title: "Publier une déclaration institutionnelle",
          owner: "Direction de la Communication",
          priority: "critical",
          description:
            "Diffuser une déclaration sobre, factuelle, sans jugement de valeur ni présomption. Annoncer les mesures conservatoires et le calendrier d'enquête. Pas de commentaire sur les faits allégués.",
        },
        {
          title: "Informer les actionnaires et partenaires",
          owner: "Direction Financière",
          priority: "high",
          description:
            "Notification aux actionnaires significatifs, investisseurs, banques et partenaires stratégiques. Veiller au respect des obligations de communication financière (information privilégiée).",
        },
        {
          title: "Coordonner avec les autorités",
          owner: "Direction Juridique",
          priority: "high",
          description:
            "Selon la nature des faits, notifier les autorités compétentes (parquet, AMMC, régulateur sectoriel). Pleine coopération documentée.",
        },
        {
          title: "Gérer les sollicitations média",
          owner: "Relations Presse",
          priority: "medium",
          description:
            "Centraliser les sollicitations. Refuser les débats et les interviews du dirigeant concerné. Tenir un point presse si la pression justifie.",
        },
      ],
      templates: [
        {
          name: "Déclaration institutionnelle",
          content:
            "Le conseil d'administration de [entreprise], réuni le [date], a pris connaissance de faits impliquant [nom/fonction].\n\nDans le respect de la présomption d'innocence et de l'ensemble des parties, le conseil a décidé des mesures conservatoires suivantes :\n  • [mesure 1]\n  • [mesure 2]\n\nUne enquête [interne / confiée à un cabinet indépendant] est ouverte. Le conseil communiquera à son terme. [Nom] assurera l'intérim de la direction.\n\nL'entreprise reste pleinement opérationnelle et coopère avec les autorités.",
        },
        {
          name: "Message aux actionnaires",
          content:
            "Objet : Information — situation concernant [nom/fonction]\n\nCher actionnaire, nous vous informons qu'une situation impliquant [nom/fonction] a été portée à la connaissance du conseil d'administration. Des mesures conservatoires ont été prises. Une communication publique a été diffusée à [heure]. Nous restons à votre disposition pour échanger.",
        },
      ],
    },
    {
      name: "Remédiation & Action",
      timeline: PHASE_TIMELINES.remediation,
      actions: [
        {
          title: "Conduire l'enquête interne",
          owner: "Comité d'Audit",
          priority: "critical",
          description:
            "Mener l'enquête de manière indépendante, contradictoire et documentée. Préserver les preuves. Garantir la confidentialité et la protection des témoins.",
        },
        {
          title: "Maintenir la continuité de direction",
          owner: "Direction Générale",
          priority: "high",
          description:
            "Assurer la conduite des affaires courantes par l'intérimaire désigné. Maintenir le dialogue avec les équipes, les clients et les partenaires. Pas de décisions stratégiques majeures sans arbitrage du conseil.",
        },
        {
          title: "Communiquer à mi-parcours",
          owner: "Direction de la Communication",
          priority: "medium",
          description:
            "À J+5, publier un point d'étape factuel sur l'avancement de l'enquête et la continuité opérationnelle. Pas de révélations sur les faits tant que l'enquête n'est pas close.",
        },
      ],
      templates: [
        {
          name: "Point d'étape J+5",
          content:
            "Point d'étape — [date]\n\nL'enquête [interne / confiée à un cabinet] se poursuit dans des conditions conformes aux standards d'indépendance et de confidentialité. La continuité opérationnelle de l'entreprise est assurée.\n\nLe conseil d'administration communiquera à l'issue du processus. Nous remercions nos collaborateurs, clients et partenaires pour leur confiance.",
        },
      ],
    },
    {
      name: "Sortie & Apprentissage",
      timeline: PHASE_TIMELINES.exit,
      actions: [
        {
          title: "Décider des sanctions ou de la réintégration",
          owner: "Conseil d'Administration",
          priority: "critical",
          description:
            "À l'issue de l'enquête, décider en conseil des mesures définitives : réintégration, sanction, rupture. Consigner la décision et la motivation.",
        },
        {
          title: "Publier la conclusion",
          owner: "Direction de la Communication",
          priority: "high",
          description:
            "Communiquer publiquement la conclusion de l'enquête et les décisions prises. Ton sobre, factuel, respectueux des personnes et des procédures.",
        },
        {
          title: "Renforcer la gouvernance",
          owner: "Direction Juridique",
          priority: "medium",
          description:
            "Actualiser la charte de gouvernance, le code d'éthique et les procédures d'alerte. Planifier une formation des dirigeants aux nouveaux standards.",
        },
      ],
      templates: [
        {
          name: "Communication de clôture",
          content:
            "Le conseil d'administration de [entreprise], réuni le [date], a acté la conclusion de l'enquête [interne / confiée à un cabinet] ouverte le [date].\n\nÀ l'issue de ce processus contradictoire, le conseil a décidé : [décision factuelle].\n\n[Si sanction] : [nom] quitte ses fonctions avec effet au [date]. [Nom] assure la direction par intérim.\n\n[Si réintégration] : [nom] reprend ses fonctions avec effet au [date].\n\nLa gouvernance de l'entreprise a été renforcée à cette occasion.",
        },
      ],
    },
  ],

  // ─────────────────────────────────────────────────────────────
  //  ACTION RÉGLEMENTAIRE
  // ─────────────────────────────────────────────────────────────
  regulatory: [
    {
      name: "Détection & Confinement",
      timeline: PHASE_TIMELINES.detect,
      actions: [
        {
          title: "Analyser l'acte du régulateur",
          owner: "Direction Juridique",
          priority: "critical",
          description:
            "Décortiquer la notification, l'inspection ou la sanction : nature, champ, délais de réponse, voies de recours. Identifier les obligations déclaratives (marché, AMMC, sectoriel).",
        },
        {
          title: "Constituer le dossier de réponse",
          owner: "Direction Juridique",
          priority: "critical",
          description:
            "Mobiliser les pièces justificatives, données techniques et éléments factuels. Respecter strictement le délai réglementaire. Préparer les annexes pour le régulateur et le conseil.",
        },
        {
          title: "Activer la cellule de crise réglementaire",
          owner: "Direction Générale",
          priority: "high",
          description:
            "Réunir Juridique, Conformité, Dircom, DAF et le métier concerné. Désigner un interlocuteur unique avec le régulateur. Consigner les échanges et pièces.",
        },
        {
          title: "Évaluer l'impact financier",
          owner: "Direction Financière",
          priority: "high",
          description:
            "Estimer l'impact potentiel (sanction, provision, coût de mise en conformité, impact actionnarial). Décider d'une communication financière si seuil d'information atteint.",
        },
      ],
      templates: [
        {
          name: "Note interne — analyse réglementaire",
          content:
            "À : Comité de crise réglementaire\nDe : Direction Juridique\nObjet : Analyse de l'acte du régulateur [référence]\n\nNature : [notification / inspection / sanction / enquête]. Émetteur : [autorité]. Date de réception : [date]. Délai de réponse : [date]. Voies de recours : [description].\n\nChamp concerné : [périmètre]. Pièces à produire : [liste]. Interlocuteur unique désigné : [nom]. Calendrier de réponse : [dates clés].",
        },
        {
          name: "Accusé de réception au régulateur",
          content:
            "Objet : Accusé de réception — [référence de l'acte]\n\nNous accusons réception de votre [notification/inspection/sanction] référencée [référence] en date du [date]. Notre direction juridique, sous la responsabilité de [nom], assure le suivi de ce dossier. Une réponse formelle vous sera adressée dans le délai imparti. Nous restons à votre disposition pour toute clarification.",
        },
      ],
    },
    {
      name: "Communication Publique",
      timeline: PHASE_TIMELINES.comms,
      actions: [
        {
          title: "Décider du périmètre de communication",
          owner: "Direction de la Communication",
          priority: "critical",
          description:
            "Arbitrer entre communication proactive, réponse à sollicitation ou silence stratégique. L'arbitrage dépend du statut confidentiel, de la pression médiatique et des obligations de marché.",
        },
        {
          title: "Informer le marché si requis",
          owner: "Direction Financière",
          priority: "critical",
          description:
            "Si l'information est privilégiée ou dépasse les seuils de matérialité, publier un communiqué réglementé dans les délais. Coordination stricte avec l'AMMC et l'auditeur.",
        },
        {
          title: "Préparer le porte-parole",
          owner: "Direction de la Communication",
          priority: "high",
          description:
            "Brief du porte-parole sur les messages clés : faits, mesures de coopération, impact sur la continuité. Strict respect du secret professionnel et de la présomption tant que le régulateur n'a pas statué.",
        },
        {
          title: "Coordonner avec les partenaires",
          owner: "Direction des Affaires Publiques",
          priority: "medium",
          description:
            "Notifier les partenaires commerciaux et institutionnels concernés. Rassurer sans minimiser. Documenter les échanges pour preuve de transparence.",
        },
      ],
      templates: [
        {
          name: "Communiqué de transparence",
          content:
            "[Entreprise] a reçu le [date] une [notification/inspection] de la part de [autorité] portant sur [périmètre].\n\nNous coopérons pleinement avec l'autorité et mettons à disposition les éléments demandés dans les délais impartis. La procédure est suivie par notre direction juridique.\n\nL'activité de l'entreprise se poursuit normalement. Toute information matérielle sera communiquée conformément à nos obligations de marché.",
        },
        {
          name: "Note aux partenaires",
          content:
            "Objet : Information — procédure réglementaire en cours\n\nCher partenaire, nous vous informons qu'une procédure réglementaire est en cours avec [autorité] concernant [périmètre]. Nous coopérons pleinement et l'activité se poursuit normalement. Nous restons à votre disposition pour échanger.",
        },
      ],
    },
    {
      name: "Remédiation & Action",
      timeline: PHASE_TIMELINES.remediation,
      actions: [
        {
          title: "Mettre en conformité les pratiques",
          owner: "Direction Conformité",
          priority: "critical",
          description:
            "Déployer le plan de mise en conformité : processus, contrôles, formation. Prioriser les écarts à risque élevé. Documenter chaque action pour preuve auprès du régulateur.",
        },
        {
          title: "Renforcer le dispositif de contrôle interne",
          owner: "Direction de l'Audit Interne",
          priority: "high",
          description:
            "Étendre les contrôles au périmètre concerné. Mettre en place des indicateurs de suivi et un reporting trimestriel au comité d'audit.",
        },
        {
          title: "Former les équipes",
          owner: "Direction des Ressources Humaines",
          priority: "medium",
          description:
            "Planifier des sessions de formation à la nouvelle réglementation et aux procédures internalisées. Cibler en priorité les fonctions exposées.",
        },
      ],
      templates: [
        {
          name: "Plan de mise en conformité",
          content:
            "Plan de mise en conformité — [périmètre]\n\n1. Écarts identifiés : [liste priorisée].\n2. Actions correctives :\n   • [action 1] — responsable : [nom] — échéance : [date].\n   • [action 2] — responsable : [nom] — échéance : [date].\n3. Contrôles complémentaires : [description].\n4. Formation : [cible, volume, calendrier].\n5. Reporting au comité d'audit : trimestriel.",
        },
      ],
    },
    {
      name: "Sortie & Apprentissage",
      timeline: PHASE_TIMELINES.exit,
      actions: [
        {
          title: "Clôturer la procédure avec le régulateur",
          owner: "Direction Juridique",
          priority: "high",
          description:
            "Obtenir la clôture formelle de la procédure. Conserver l'ensemble du dossier pour la durée de conservation requise. Évaluer l'opportunité d'un recours si la décision est contestable.",
        },
        {
          title: "Capitaliser sur l'apprentissage",
          owner: "Direction Conformité",
          priority: "medium",
          description:
            "Intégrer la procédure au corpus de formation. Mettre à jour la cartographie des risques réglementaires. Partager les enseignements avec les filiales et entités similaires.",
        },
        {
          title: "Restituer au conseil d'administration",
          owner: "Direction Générale",
          priority: "medium",
          description:
            "Présenter au conseil la chronologie, les décisions, le coût total et les mesures structurelles prises. Confirmer le retour à la normale et l'efficacité des nouveaux contrôles.",
        },
      ],
      templates: [
        {
          name: "Note de clôture réglementaire",
          content:
            "Objet : Clôture de la procédure [référence]\n\n1. Chronologie : réception [date], réponse [date], clôture [date].\n2. Décision du régulateur : [description].\n3. Coût total : [sanction, conseil, mise en conformité].\n4. Mesures structurelles : [liste].\n5. Recours éventuel : [oui/non, motivation].\n6. Archivage : [durée, support].",
        },
      ],
    },
  ],

  // ─────────────────────────────────────────────────────────────
  //  INCIDENT CYBER
  // ─────────────────────────────────────────────────────────────
  cybersecurity: [
    {
      name: "Détection & Confinement",
      timeline: PHASE_TIMELINES.detect,
      actions: [
        {
          title: "Confirmer l'incident et qualifier l'ampleur",
          owner: "Direction des Systèmes d'Information",
          priority: "critical",
          description:
            "Caractériser la nature de l'incident (intrusion, ransomware, exfiltration, déni de service). Identifier les systèmes affectés, les données potentiellement compromises et la cinétique d'attaque.",
        },
        {
          title: "Isoler les systèmes compromis",
          owner: "Direction des Systèmes d'Information",
          priority: "critical",
          description:
            "Déconnecter les machines compromises, isoler les segments réseau, révoquer les accès suspects. Préserver les journaux et preuves pour l'investigation forensique.",
        },
        {
          title: "Activer la cellule de crise cyber",
          owner: "Direction Générale",
          priority: "critical",
          description:
            "Réunir DSI, RSSI, Juridique, Dircom, DAF. Désigner un chef de crise technique et un porte-parole. Mobiliser le prestataire de réponse à incident (CERT / cabinet forensique).",
        },
        {
          title: "Évaluer les obligations de notification",
          owner: "Direction Juridique",
          priority: "high",
          description:
            "Identifier les régulateurs à notifier (CNDP pour données personnelles, AMMC si information privilégiée, régulateur secteur) et les délais applicables (72h pour la CNDP en matière de données personnelles).",
        },
      ],
      templates: [
        {
          name: "Note interne — activation cellule cyber",
          content:
            "À : Comité de crise cyber\nDe : Direction des Systèmes d'Information\nObjet : Incident cyber — activation de la cellule\n\nNature : [intrusion / ransomware / exfiltration / DoS]. Systèmes affectés : [liste]. Données potentiellement compromises : [catégories]. Cinétique : [en cours / contenue].\n\nMesures de confinement prises : [isolement, révocation accès, sauvegarde journaux]. Prestataire de réponse à incident mobilisé : [nom].\n\nObligations de notification identifiées : [CNDP / AMMC / secteur] — délai : [date].",
        },
        {
          name: "Notification CNDP (modèle)",
          content:
            "Objet : Notification de violation de données à caractère personnel\n\nConformément à la loi 09-08 et ses textes d'application, nous vous notifions une violation de données à caractère personnel détectée le [date].\n\nNature : [description]. Catégories de données : [liste]. Nombre approximatif de personnes concernées : [estimation]. Conséquences possibles : [description]. Mesures prises ou proposées : [liste]. Coordination avec nos équipes : [interlocuteur].",
        },
      ],
    },
    {
      name: "Communication Publique",
      timeline: PHASE_TIMELINES.comms,
      actions: [
        {
          title: "Publier une communication mesurée",
          owner: "Direction de la Communication",
          priority: "critical",
          description:
            "Si l'incident est de nature à affecter les clients ou le public, publier une communication sobre et factuelle. Privilégier la transparence à la cacophonie : un seul canal, une seule voix.",
        },
        {
          title: "Informer les clients concernés",
          owner: "Direction Customer Care",
          priority: "critical",
          description:
            "Notifier individuellement les personnes dont les données sont compromises (obligation légale). Indiquer la nature, les mesures prises et les conseils de vigilance (mots de passe, phishing).",
        },
        {
          title: "Coordonner avec les autorités",
          owner: "Direction Juridique",
          priority: "high",
          description:
            "Maintenir le dialogue avec la CNDP et les autorités sectorielles. Documenter les échanges. Demander conseil en cas de doute sur l'interprétation des obligations.",
        },
        {
          title: "Préparer la communication interne",
          owner: "Direction des Ressources Humaines",
          priority: "medium",
          description:
            "Brief unified des collaborateurs : consignes techniques, conduite à tenir face aux sollicitations externes. Canaux de remontée des signaux suspects ouverts.",
        },
      ],
      templates: [
        {
          name: "Communiqué public — incident cyber",
          content:
            "[Entreprise] a détecté le [date] un incident cyber affectant [périmètre]. Nos équipes techniques, assistées d'un prestataire spécialisé, ont engagé les mesures de confinement et d'investigation.\n\nÀ ce stade : [état factuel]. Les autorités compétentes ont été notifiées conformément à nos obligations.\n\nNous mobilisons l'ensemble des ressources nécessaires pour garantir la sécurité de nos systèmes et la protection de nos clients. Un point d'étape sera communiqué dès que les éléments le permettront.",
        },
        {
          name: "Notification individuelle aux personnes concernées",
          content:
            "Bonjour, nous vous informons qu'un incident cyber détecté le [date] a pu affecter certaines de vos données [catégorie]. Par mesure de précaution, nous vous recommandons : modifier vos mots de passe, rester vigilant face à toute sollicitation suspecte, surveiller vos comptes.\n\nNous avons notifié l'incident à la CNDP. Nos équipes restent à votre disposition au [canal] pour toute question. Nous prions nos clients de nous excuser pour cette situation.",
        },
      ],
    },
    {
      name: "Remédiation & Action",
      timeline: PHASE_TIMELINES.remediation,
      actions: [
        {
          title: "Mener l'investigation forensique",
          owner: "Direction des Systèmes d'Information",
          priority: "critical",
          description:
            "Identifier le vecteur d'entrée, l'étendue de la compromission, la chronologie et les données exfiltrées. Documenter les constats pour les autorités et l'assurance.",
        },
        {
          title: "Restaurer les systèmes en confiance",
          owner: "Direction des Systèmes d'Information",
          priority: "high",
          description:
            "Reconstruire les systèmes à partir de sauvegardes saines, appliquer les correctifs de sécurité, renforcer les contrôles avant remise en service progressive. Validation par test d'intrusion ciblé.",
        },
        {
          title: "Renforcer le dispositif de sécurité",
          owner: "Direction de la Sécurité (RSSI)",
          priority: "high",
          description:
            "Déployer les mesures structurelles : MFA généralisé, segmentation renforcée, supervision des journaux, plan de continuité actualisé, formation anti-phishing ciblée.",
        },
        {
          title: "Communiquer la résolution",
          owner: "Direction de la Communication",
          priority: "medium",
          description:
            "À la clôture technique, publier un bilan factuel : chronologie, données impactées, mesures déployées. Reconnaître l'impact sans dramatiser ni minimiser.",
        },
      ],
      templates: [
        {
          name: "Bilan de clôture technique",
          content:
            "Bilan de l'incident cyber — [entreprise]\n\n1. Détection : [date/heure], via [source].\n2. Nature : [intrusion / ransomware / exfiltration].\n3. Vecteur d'entrée identifié : [description].\n4. Données impactées : [catégories, volumes].\n5. Confinement : [date/heure].\n6. Restauration complète : [date].\n7. Mesures structurelles déployées : [liste].\n\nNotification CNDP : [date]. Coordination assurance : [statut].",
        },
      ],
    },
    {
      name: "Sortie & Apprentissage",
      timeline: PHASE_TIMELINES.exit,
      actions: [
        {
          title: "Réviser le plan de réponse à incident",
          owner: "Direction de la Sécurité (RSSI)",
          priority: "high",
          description:
            "Intégrer les enseignements au PRA / plan de réponse à incident. Mettre à jour les contacts, les procédures et les playbooks techniques. Planifier un exercice de simulation annuel.",
        },
        {
          title: "Documenter pour audit et assurance",
          owner: "Direction Juridique",
          priority: "medium",
          description:
            "Constituer le dossier complet : chronologie, décisions, constats forensiques, notifications, restauration. À produire pour l'assureur cyber et les audits futurs.",
        },
        {
          title: "Sensibiliser durablement",
          owner: "Direction des Ressources Humaines",
          priority: "medium",
          description:
            "Inscrire la cybersensibilisation dans le parcours annuel obligatoire. Cibler les fonctions exposées (finance, RH, support client) par des modules avancés.",
        },
      ],
      templates: [
        {
          name: "Note de post-mortem cyber",
          content:
            "Objet : Post-mortem incident cyber [période]\n\n1. Chronologie : détection [date/heure], confinement [date/heure], restauration complète [date].\n2. Vecteur : [description].\n3. Données impactées : [catégories, volumes].\n4. Coûts (estimation) : [prestataire, restauration, communication, indemnisation].\n5. Mesures préventives : [3 actions avec responsables et échéances].\n6. Exercice de simulation planifié : [date].",
        },
      ],
    },
  ],
};
