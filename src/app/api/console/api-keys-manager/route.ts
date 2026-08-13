// ═══════════════════════════════════════════════════════════════
//  GET  /api/console/api-keys-manager         — lister les clés
//  POST /api/console/api-keys-manager         — générer une clé
//  DELETE /api/console/api-keys-manager?id=X  — révoquer une clé
//
//  Skill 29 — API Key Manager.
//  Génère, révoque et surveille les clés API pour les clients
//  Enterprise / Agency. Les clés sont des tokens Bearer réels
//  (`harch_<32 hex>`) acceptés par /api/v1/* via authenticateApiKey().
//
//  Stockage hybride :
//    • ApiKey table      — id, name, keyHash, keyPrefix, tier,
//                           lastUsedAt, createdAt, revokedAt.
//    • CompanySettings JSON (colonne alertThresholds) — métadonnées
//      par clé : rateLimitId, usageCount, usageHistory (14 jours).
//      Clé JSON : `apiKeyMeta[<apiKeyId>] = { rateLimitId, usageCount,
//      usageHistory: number[14] }`. On étend le grab-bag existant
//      (customAlerts / sentimentDrop / minMentions) sans l'écraser.
//
//  Périmètre entreprise : toutes les clés des utilisateurs dont le
//  companyId correspond à celui de l'appelant sont listées. La
//  révocation suit la même politique d'autorisation que
//  /api/api-keys/[id] : propriétaire, company-admin ou super-admin.
//
//  Limite : 10 clés actives par entreprise (vs 5 par utilisateur
//  pour la route /api/api-keys classique — le seuil entreprise est
//  plus généreux car les comptes Enterprise/Agency ont plusieurs
//  intégrations légitimes : ETL, dashboards BI, webhooks sortants).
//
//  Audit : Loi 09-08 (CNDP Maroc) — chaque création / révocation
//  est tracée dans AuditLog avec l'IP et le User-Agent.
//
//  Auth : session + plan Enterprise/Agency + requireUserCompany.
//  Pas de bypass admin (les admins passent par isAccountTypeAllowed).
//
//  Skill ID : SKILL-29-API-KEYS
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { isAccountTypeAllowed } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db";
import { logInfo, logError } from "@/lib/logger";
import { logAudit, extractIp, extractUserAgent } from "@/lib/harchiq/audit-log";
import {
  requireUserCompany,
  type UserCompanyOk,
} from "@/lib/harchiq/company-session";
import { generateApiKey } from "@/lib/auth/api-key";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

// ─── Constantes ───────────────────────────────────────────────
const MAX_KEYS_PER_COMPANY = 10;
const USAGE_HISTORY_DAYS = 14;

// ─── Paliers de rate limit ────────────────────────────────────
//  Exposés au client pour le sélecteur du formulaire "Générer une
//  clé". Le `id` est persisté dans CompanySettings.alertThresholds
//  JSON ; le libellé et les quotas sont dérivés côté client.
//
//  NB : authenticateApiKey() n'applique PAS encore ces limites —
//  le champ `tier` sur ApiKey est porté pour information. Le
//  rate-limiting effectif sera implémenté dans une autre tâche
//  (cf. src/lib/security/rate-limit.ts qui existe déjà pour les
//  routes web). Ici on documente l'intention et on fournit le
//  contrat UI.
export interface RateLimitPreset {
  id: string;
  label: string;
  requestsPerHour: number; // -1 = illimité
  requestsPerMonth: number; // -1 = illimité
  description: string;
}

export const RATE_LIMITS: RateLimitPreset[] = [
  {
    id: "standard",
    label: "Standard",
    requestsPerHour: 100,
    requestsPerMonth: 50_000,
    description: "Idéal pour les dashboards internes et les scripts périodiques.",
  },
  {
    id: "pro",
    label: "Pro",
    requestsPerHour: 1_000,
    requestsPerMonth: 250_000,
    description: "Pour les intégrations ETL et les outils de veille automatisés.",
  },
  {
    id: "enterprise",
    label: "Entreprise",
    requestsPerHour: 10_000,
    requestsPerMonth: 1_500_000,
    description: "Volume élevé pour les plateformes multi-clients et les webhooks.",
  },
  {
    id: "unlimited",
    label: "Illimité",
    requestsPerHour: -1,
    requestsPerMonth: -1,
    description: "Sans plafond. Réservé aux intégrations stratégiques validées.",
  },
];

function rateLimitById(id: string): RateLimitPreset {
  return RATE_LIMITS.find((r) => r.id === id) ?? RATE_LIMITS[0];
}

// ─── Types renvoyés au client ─────────────────────────────────

export type KeyStatus = "active" | "expired" | "revoked";

export interface ManagedApiKey {
  id: string;
  name: string;
  /** Clé masquée — prefix public + bullets (jamais la clé complète). */
  maskedKey: string;
  /** Prefix complet (12 premiers caractères) pour l'affichage technique. */
  prefix: string | null;
  createdAt: string;
  lastUsedAt: string | null;
  status: KeyStatus;
  /** ID du palier de rate limit (standard | pro | enterprise | unlimited). */
  rateLimitId: string;
  /** Libellé français du palier, pour l'affichage direct. */
  rateLimitLabel: string;
  /** Quota mensuel (-1 = illimité). */
  requestsPerMonth: number;
  /** Compteur d'utilisation cumulé (appels API enregistrés). */
  usageCount: number;
  /** Historique sur 14 jours (le plus ancien d'abord). */
  usageHistory: number[];
  /** Propriétaire de la clé (pour la vue entreprise multi-utilisateurs). */
  owner: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  } | null;
  /** Date de révocation (si status = revoked). */
  revokedAt: string | null;
  /** Date d'expiration (null = n'expire jamais). */
  expiresAt: string | null;
}

export interface ApiKeysListResponse {
  keys: ManagedApiKey[];
  total: number;
  active: number;
  revoked: number;
  expired: number;
  limit: number;
  rateLimits: RateLimitPreset[];
  meta: {
    companyName: string;
    companyId: string;
    generatedAt: string;
  };
}

export interface ApiKeyCreatedResponse {
  /** Clé en clair — renvoyée UNE SEULE FOIS à la création. */
  key: string;
  keyId: string;
  name: string;
  prefix: string | null;
  rateLimitId: string;
  rateLimitLabel: string;
  createdAt: string;
  warning: string;
  /** Exemple curl prêt à copier. */
  curlExample: string;
}

export interface ApiKeyRevokedResponse {
  ok: true;
  id: string;
  revokedAt: string;
  alreadyRevoked?: boolean;
}

// ─── Forme stockée dans CompanySettings.alertThresholds ───────
//  On étend le grab-bag existant (customAlerts / sentimentDrop /
//  minMentions / crisisThreshold) sans toucher aux autres entrées.
//  `apiKeyMeta` est un dictionnaire apiKeyId → métadonnées.

export interface KeyMeta {
  rateLimitId: string;
  usageCount: number;
  usageHistory: number[]; // 14 jours, le plus ancien d'abord
  lastUsageBumpAt?: string | null; // ISO, dernier jour où usageCount a été incrémenté
}

interface StoredMeta {
  customAlerts?: unknown;
  sentimentDrop?: number;
  minMentions?: number;
  crisisThreshold?: number;
  apiKeyMeta?: Record<string, KeyMeta>;
}

function parseMeta(raw: string | null | undefined): StoredMeta {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as StoredMeta;
  } catch {
    /* fall through */
  }
  return {};
}

function serializeMeta(s: StoredMeta): string {
  return JSON.stringify(s);
}

// ─── Masquage de clé ─────────────────────────────────────────
//  Le prefix public (12 premiers caractères, ex. "harch_ab12cd34")
//  est conservé ; le reste est remplacé par des bullets. La clé
//  complète n'est JAMAIS renvoyée par GET — seulement à la création.
function maskKey(prefix: string | null): string {
  if (!prefix) return "harch_••••••••••••••••••••";
  // prefix = "harch_ab12cd34" (12 chars). La clé complète fait
  // "harch_" + 32 hex = 38 chars. On masque les 26 chars restants.
  return `${prefix}${"•".repeat(26)}`;
}

// ─── Détermination du statut ─────────────────────────────────
function deriveStatus(
  revokedAt: Date | null,
  expiresAt: Date | null,
  now: Date,
): KeyStatus {
  if (revokedAt) return "revoked";
  if (expiresAt && expiresAt < now) return "expired";
  return "active";
}

// ─── Construction du payload complet (GET) ───────────────────
//  Récupère :
//    1. toutes les clés des utilisateurs dont companyId = appelant
//    2. le CompanySettings.alertThresholds JSON (métadonnées)
//  Fusionne les deux et renvoie ManagedApiKey[].
async function buildKeyList(
  sessionData: UserCompanyOk["data"],
): Promise<ApiKeysListResponse> {
  const companyId = sessionData.company.id;

  // ─── 1. Toutes les clés pour cette entreprise ──────────────
  //  On filtre par user.companyId — Prisma supporte les filtres
  //  sur les relations. On inclut le user pour la colonne "owner".
  const keys = await prisma.apiKey.findMany({
    where: { user: { companyId } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      lastUsedAt: true,
      createdAt: true,
      revokedAt: true,
      expiresAt: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      },
    },
  });

  // ─── 2. Métadonnées JSON depuis CompanySettings ─────────────
  const settings = await prisma.companySettings.findUnique({
    where: { companyId },
    select: { alertThresholds: true },
  });
  const stored = parseMeta(settings?.alertThresholds);
  const metaMap: Record<string, KeyMeta> = stored.apiKeyMeta ?? {};

  // ─── 3. Fusion ─────────────────────────────────────────────
  const now = new Date();
  const managed: ManagedApiKey[] = keys.map((k) => {
    const status = deriveStatus(k.revokedAt, k.expiresAt, now);
    const meta = metaMap[k.id];
    const rateLimitId = meta?.rateLimitId ?? "standard";
    const preset = rateLimitById(rateLimitId);

    return {
      id: k.id,
      name: k.name,
      maskedKey: maskKey(k.keyPrefix),
      prefix: k.keyPrefix,
      createdAt: k.createdAt.toISOString(),
      lastUsedAt: k.lastUsedAt ? k.lastUsedAt.toISOString() : null,
      status,
      rateLimitId,
      rateLimitLabel: preset.label,
      requestsPerMonth: preset.requestsPerMonth,
      usageCount: meta?.usageCount ?? 0,
      usageHistory:
        meta?.usageHistory && meta.usageHistory.length === USAGE_HISTORY_DAYS
          ? meta.usageHistory
          : new Array(USAGE_HISTORY_DAYS).fill(0),
      owner: k.user
        ? {
            id: k.user.id,
            email: k.user.email,
            name: k.user.name,
            role: k.user.role,
          }
        : null,
      revokedAt: k.revokedAt ? k.revokedAt.toISOString() : null,
      expiresAt: k.expiresAt ? k.expiresAt.toISOString() : null,
    };
  });

  return {
    keys: managed,
    total: managed.length,
    active: managed.filter((k) => k.status === "active").length,
    revoked: managed.filter((k) => k.status === "revoked").length,
    expired: managed.filter((k) => k.status === "expired").length,
    limit: MAX_KEYS_PER_COMPANY,
    rateLimits: RATE_LIMITS,
    meta: {
      companyName: sessionData.company.name,
      companyId,
      generatedAt: new Date().toISOString(),
    },
  };
}

// ─── Exemple curl pour la clé créée ──────────────────────────
//  Construit un snippet prêt-à-coller avec la clé en clair (visible
//  uniquement dans la réponse POST — le client doit la copier).
function buildCurlExample(plaintextKey: string): string {
  return [
    "curl -X GET \\",
    '  -H "Authorization: Bearer ' + plaintextKey + '" \\',
    '  -H "Content-Type: application/json" \\',
    '  "https://harch.atelier/api/v1/reputation"',
  ].join("\n");
}

// ═══════════════════════════════════════════════════════════════
//  GET — liste des clés (avec métadonnées d'usage)
// ═══════════════════════════════════════════════════════════════

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Skill 29 — réservé Enterprise / Agency. Les plans Essential /
  // Pro n'ont pas de gestion multi-clés et doivent passer par
  // /api/api-keys (limite 5 clés par utilisateur).
  if (!isAccountTypeAllowed(session, ["enterprise", "agency"])) {
    return NextResponse.json(
      {
        error:
          "Forbidden — API Key Manager est réservé aux plans Enterprise et Agency.",
      },
      { status: 403 },
    );
  }

  const result = await requireUserCompany();
  if (!result.ok) {
    return result.response;
  }

  try {
    const payload = await buildKeyList(result.data);

    logInfo(
      "console.api-keys-manager.get",
      `company=${result.data.company.slug} total=${payload.total} active=${payload.active}`,
    );

    return NextResponse.json(payload);
  } catch (err) {
    logError(
      "console.api-keys-manager.get",
      `List error: ${err instanceof Error ? err.message : err}`,
    );
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}

// ═══════════════════════════════════════════════════════════════
//  POST — générer une nouvelle clé
//  Body: { name: string, rateLimitId?: string }
// ═══════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAccountTypeAllowed(session, ["enterprise", "agency"])) {
    return NextResponse.json(
      {
        error:
          "Forbidden — API Key Manager est réservé aux plans Enterprise et Agency.",
      },
      { status: 403 },
    );
  }

  const result = await requireUserCompany();
  if (!result.ok) {
    return result.response;
  }

  const { userId, company } = result.data;

  // ─── 1. Parse + validation du body ─────────────────────────
  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name || name.length < 3 || name.length > 64) {
    return NextResponse.json(
      { error: "Le nom de la clé doit contenir entre 3 et 64 caractères." },
      { status: 400 },
    );
  }

  const rateLimitId =
    typeof body.rateLimitId === "string" &&
    RATE_LIMITS.some((r) => r.id === body.rateLimitId)
      ? body.rateLimitId
      : "standard";

  // ─── 2. Quota entreprise (10 clés actives max) ─────────────
  const activeCount = await prisma.apiKey.count({
    where: {
      user: { companyId: company.id },
      revokedAt: null,
    },
  });
  if (activeCount >= MAX_KEYS_PER_COMPANY) {
    return NextResponse.json(
      {
        error: `Votre entreprise a déjà ${activeCount} clés actives (limite ${MAX_KEYS_PER_COMPANY}). Révoquez une clé avant d'en générer une nouvelle.`,
        limit: MAX_KEYS_PER_COMPANY,
        activeCount,
      },
      { status: 409 },
    );
  }

  // ─── 3. Génération de la clé ───────────────────────────────
  //  generateApiKey() renvoie plaintext + hash SHA-256 + prefix.
  //  On stocke le hash dans ApiKey.keyHash (jamais le plaintext).
  const generated = generateApiKey();

  const apiKey = await prisma.apiKey.create({
    data: {
      userId,
      keyHash: generated.hash,
      keyPrefix: generated.prefix,
      name,
      // On surcharge le champ `tier` existant pour qu'il reflète
      // le palier choisi — authenticateApiKey() le renvoie déjà
      // dans ApiKeyIdentity, les routes /api/v1/* l'ignorent.
      tier: rateLimitId,
    },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      createdAt: true,
    },
  });

  // ─── 4. Métadonnées JSON (rateLimit + usage) ───────────────
  //  On upsert dans CompanySettings.alertThresholds en mergeant
  //  avec les customAlerts / sentimentDrop existants.
  const initialMeta: KeyMeta = {
    rateLimitId,
    usageCount: 0,
    usageHistory: new Array(USAGE_HISTORY_DAYS).fill(0),
    lastUsageBumpAt: null,
  };

  const settings = await prisma.companySettings.findUnique({
    where: { companyId: company.id },
    select: { alertThresholds: true },
  });
  const stored = parseMeta(settings?.alertThresholds);
  const nextMetaMap: Record<string, KeyMeta> = {
    ...(stored.apiKeyMeta ?? {}),
    [apiKey.id]: initialMeta,
  };
  const nextStored: StoredMeta = { ...stored, apiKeyMeta: nextMetaMap };

  await prisma.companySettings.upsert({
    where: { companyId: company.id },
    update: { alertThresholds: serializeMeta(nextStored) },
    create: {
      companyId: company.id,
      alertThresholds: serializeMeta(nextStored),
    },
  });

  // ─── 5. Audit (Loi 09-08) ──────────────────────────────────
  await logAudit({
    userId,
    action: "api_key.create" as never,
    resource: `apikey:${apiKey.id}`,
    result: "success",
    ipAddress: extractIp(req),
    userAgent: extractUserAgent(req),
    metadata: {
      name,
      prefix: generated.prefix,
      rateLimitId,
      companyId: company.id,
      source: "skill-29-api-keys-manager",
    },
  });

  const preset = rateLimitById(rateLimitId);

  logInfo(
    "console.api-keys-manager.post",
    `company=${company.slug} user=${userId} keyId=${apiKey.id} rateLimit=${rateLimitId}`,
  );

  const payload: ApiKeyCreatedResponse = {
    key: generated.plaintext, // RENVOYÉ UNE SEULE FOIS
    keyId: apiKey.id,
    name: apiKey.name,
    prefix: apiKey.keyPrefix,
    rateLimitId,
    rateLimitLabel: preset.label,
    createdAt: apiKey.createdAt.toISOString(),
    warning:
      "Cette clé ne sera plus jamais affichée. Stockez-la en lieu sûr — quiconque la possède peut appeler l'API Harch Atelier en votre nom.",
    curlExample: buildCurlExample(generated.plaintext),
  };

  return NextResponse.json(payload, { status: 201 });
}

// ═══════════════════════════════════════════════════════════════
//  DELETE — révoquer une clé
//  ?id=<apiKeyId> soft-revokes the key (sets revokedAt = now).
//  Same auth policy as /api/api-keys/[id] :
//    • owner can revoke own key
//    • company-admin can revoke any key in their company
//    • super-admin can revoke any key
// ═══════════════════════════════════════════════════════════════

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAccountTypeAllowed(session, ["enterprise", "agency"])) {
    return NextResponse.json(
      {
        error:
          "Forbidden — API Key Manager est réservé aux plans Enterprise et Agency.",
      },
      { status: 403 },
    );
  }

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { error: "Paramètre `id` manquant." },
      { status: 400 },
    );
  }

  // ─── 1. Charger la clé + propriétaire ──────────────────────
  const apiKey = await prisma.apiKey.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      name: true,
      keyPrefix: true,
      revokedAt: true,
      user: {
        select: { id: true, companyId: true, role: true },
      },
    },
  });

  if (!apiKey) {
    return NextResponse.json({ error: "Clé introuvable." }, { status: 404 });
  }

  // ─── 2. Authorisation ──────────────────────────────────────
  //  requireUserCompany() garantit que l'appelant a un companyId.
  //  On vérifie ensuite que la clé cible appartient à un user du
  //  même companyId (sauf admin qui peut tout révoquer).
  const result = await requireUserCompany();
  if (!result.ok) {
    return result.response;
  }
  const { userId: callerId, company } = result.data;

  // On recharge le caller pour récupérer son role (requireUserCompany
  // le renvoie déjà dans data.user.role — on l'utilise directement).
  const callerRole = result.data.user.role;
  const isOwner = apiKey.userId === callerId;
  const isSameCompany =
    apiKey.user?.companyId === company.id;
  const isSuperAdmin = callerRole === "admin";

  if (!isOwner && !isSameCompany && !isSuperAdmin) {
    return NextResponse.json(
      {
        error:
          "Forbidden — vous ne pouvez révoquer que les clés de votre entreprise.",
      },
      { status: 403 },
    );
  }

  // ─── 3. Idempotence ────────────────────────────────────────
  if (apiKey.revokedAt) {
    return NextResponse.json({
      ok: true,
      id: apiKey.id,
      revokedAt: apiKey.revokedAt.toISOString(),
      alreadyRevoked: true,
    } satisfies ApiKeyRevokedResponse);
  }

  // ─── 4. Soft-revoke ────────────────────────────────────────
  const revokedAt = new Date();
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { revokedAt },
  });

  // ─── 5. Audit (Loi 09-08) ──────────────────────────────────
  await logAudit({
    userId: callerId,
    action: "api_key.revoke" as never,
    resource: `apikey:${apiKey.id}`,
    result: "success",
    ipAddress: extractIp(req),
    userAgent: extractUserAgent(req),
    metadata: {
      name: apiKey.name,
      prefix: apiKey.keyPrefix,
      ownerId: apiKey.userId,
      selfRevoke: isOwner,
      source: "skill-29-api-keys-manager",
    },
  });

  logInfo(
    "console.api-keys-manager.delete",
    `company=${company.slug} caller=${callerId} keyId=${apiKey.id} selfRevoke=${isOwner}`,
  );

  return NextResponse.json({
    ok: true,
    id: apiKey.id,
    revokedAt: revokedAt.toISOString(),
  } satisfies ApiKeyRevokedResponse);
}
