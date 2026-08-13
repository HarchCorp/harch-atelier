// ═══════════════════════════════════════════════════════════════
//  GET  /api/console/saved-searches
//  POST /api/console/saved-searches
//
//  Skill 22 — Saved Searches Manager.
//
//  Persistance : localStorage côté client (PAS de base de données).
//  Le serveur ne peut pas lire localStorage — ce routeur joue donc
//  deux rôles :
//    • GET  : renvoie un payload documentaire expliquant que la
//             liste réelle vit dans le navigateur (clé localStorage
//             `harchiq.saved-searches.v1`). Permet aux outils de
//             monitoring / Postman de constater que l'endpoint
//             répond sans erreur.
//    • POST : valide le payload { name, query, operators }, génère
//             un id stable (crypto.randomUUID) et les timestamps
//             (createdAt, lastRunAt, runCount) côté serveur, et
//             renvoie l'objet SavedSearch normalisé. Le client est
//             ensuite responsable de l'écrire dans localStorage.
//
//  Body (POST) :
//    {
//      name:      string,                          // 1..80 chars
//      query:     string,                          // 0..240 chars (aperçu)
//      operators: {
//        AND: string[],   // mots-clés obligatoires (tous présents)
//        OR:  string[],   // mots-clés optionnels (au moins un)
//        NOT: string[],   // mots-clés exclus (aucun présent)
//      }
//    }
//
//  Réponses :
//    200 GET  → { searches: [], storage: "client-localStorage",
//                 localStorageKey: "harchiq.saved-searches.v1" }
//    200 POST → SavedSearch normalisé (id + timestamps serveur)
//    400      → { error: "..." } (payload invalide)
//    401      → { error: "Unauthorized" }
//
//  Skill ID : SKILL-22-SAVED-SEARCHES
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { logInfo, logError } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

// ─── Clé localStorage partagée avec le client ─────────────────
export const SAVED_SEARCHES_LOCALSTORAGE_KEY = "harchiq.saved-searches.v1";

// ─── Types renvoyés au client ─────────────────────────────────

export interface SavedSearchOperators {
  AND: string[];
  OR: string[];
  NOT: string[];
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  operators: SavedSearchOperators;
  createdAt: string;        // ISO 8601
  lastRunAt: string | null; // ISO 8601 ou null si jamais exécutée
  runCount: number;
}

// ─── Limites de validation ────────────────────────────────────

const NAME_MAX = 80;
const QUERY_MAX = 240;
const KEYWORD_MAX = 60;
const OPERATORS_MAX = 20; // par catégorie (AND / OR / NOT)

// ─── Helpers ──────────────────────────────────────────────────

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function isStringArray(v: unknown): v is string[] {
  if (!Array.isArray(v)) return false;
  return v.every((item) => typeof item === "string");
}

function sanitizeKeyword(kw: string): string {
  // Trim + plafond à KEYWORD_MAX caractères. On garde la casse
  // d'origine pour respecter les acronymes (OCP, BAM, BVC…).
  return kw.trim().slice(0, KEYWORD_MAX);
}

function sanitizeOperators(raw: unknown): SavedSearchOperators | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const and = obj.AND;
  const or = obj.OR;
  const not = obj.NOT;
  if (!isStringArray(and) || !isStringArray(or) || !isStringArray(not)) return null;
  return {
    AND: and.map(sanitizeKeyword).filter((k) => k.length > 0).slice(0, OPERATORS_MAX),
    OR:  or.map(sanitizeKeyword).filter((k) => k.length > 0).slice(0, OPERATORS_MAX),
    NOT: not.map(sanitizeKeyword).filter((k) => k.length > 0).slice(0, OPERATORS_MAX),
  };
}

// ═══════════════════════════════════════════════════════════════
//  GET — documentation / sentinel
// ═══════════════════════════════════════════════════════════════

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Le serveur ne peut pas lire localStorage — on renvoie un
  // payload documentaire. Le client lit directement localStorage
  // via la clé partagée `SAVED_SEARCHES_LOCALSTORAGE_KEY`.
  return NextResponse.json({
    searches: [],
    storage: "client-localStorage",
    localStorageKey: SAVED_SEARCHES_LOCALSTORAGE_KEY,
    note: "Les recherches sauvegardées sont persistées côté client dans localStorage. Le serveur ne stocke aucune donnée.",
  });
}

// ═══════════════════════════════════════════════════════════════
//  POST — valider + normaliser + renvoyer
// ═══════════════════════════════════════════════════════════════

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête invalide (JSON attendu)" },
      { status: 400 },
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Payload invalide" },
      { status: 400 },
    );
  }

  const obj = body as Record<string, unknown>;
  const name = obj.name;
  const query = obj.query;
  const operatorsRaw = obj.operators;

  if (!isNonEmptyString(name)) {
    return NextResponse.json(
      { error: "Champ 'name' requis (chaîne non vide)" },
      { status: 400 },
    );
  }
  if (name.trim().length > NAME_MAX) {
    return NextResponse.json(
      { error: `Champ 'name' trop long (max ${NAME_MAX} caractères)` },
      { status: 400 },
    );
  }

  // `query` est optionnelle — si absente, on la dérive des operators.
  let queryStr = "";
  if (typeof query === "string") {
    queryStr = query.trim().slice(0, QUERY_MAX);
  }

  const operators = sanitizeOperators(operatorsRaw);
  if (!operators) {
    return NextResponse.json(
      {
        error:
          "Champ 'operators' invalide — attendu { AND: string[], OR: string[], NOT: string[] }",
      },
      { status: 400 },
    );
  }

  // Au moins un mot-clé ou une query libre — sinon la recherche est vide.
  const totalKeywords =
    operators.AND.length + operators.OR.length + operators.NOT.length;
  if (totalKeywords === 0 && queryStr.length === 0) {
    return NextResponse.json(
      { error: "Recherche vide — fournissez au moins un mot-clé ou une requête" },
      { status: 400 },
    );
  }

  // Si query vide, on la sérialise côté serveur pour l'aperçu.
  if (queryStr.length === 0) {
    queryStr = serializeQuery(operators);
  }

  const now = new Date().toISOString();
  const saved: SavedSearch = {
    id: crypto.randomUUID(),
    name: name.trim(),
    query: queryStr,
    operators,
    createdAt: now,
    lastRunAt: null,
    runCount: 0,
  };

  logInfo(
    "saved-searches",
    `Saved search normalized: "${saved.name}" (id=${saved.id}, AND=${operators.AND.length} OR=${operators.OR.length} NOT=${operators.NOT.length})`,
  );

  return NextResponse.json(saved);
}

// ─── Sérialisation des operators en chaîne lisible ────────────
//
// Format : `(kw1 AND kw2) (kw3 OR kw4) -kw5 -kw6`
// Si une catégorie est vide, elle est omise. Si toutes vides,
// renvoie la chaîne vide.
function serializeQuery(ops: SavedSearchOperators): string {
  const parts: string[] = [];
  if (ops.AND.length > 0) {
    parts.push(`(${ops.AND.join(" AND ")})`);
  }
  if (ops.OR.length > 0) {
    parts.push(`(${ops.OR.join(" OR ")})`);
  }
  for (const not of ops.NOT) {
    parts.push(`-${not}`);
  }
  return parts.join(" ").slice(0, QUERY_MAX);
}
