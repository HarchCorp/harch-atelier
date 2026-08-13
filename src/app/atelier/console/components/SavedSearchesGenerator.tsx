"use client";

// ═══════════════════════════════════════════════════════════════
//  SavedSearchesGenerator
//
//  Skill 22 — Gestionnaire de recherches sauvegardées.
//
//  Permet à l'analyste de :
//    • sauvegarder des requêtes booléennes (AND / OR / NOT),
//    • les exécuter à la demande,
//    • visualiser le nombre d'articles correspondants + le top 3,
//    • supprimer les recherches obsolètes,
//    • exporter le tout en PDF (window.print).
//
//  Persistance : localStorage côté client (PAS de base de données).
//  Clé : `harchiq.saved-searches.v1` (partagée avec l'API route).
//
//  Même motif de popup que BriefingGenerator / EsgScorecardGenerator :
//    • overlay fixe avec backdrop blur
//    • entrée en scale (framer-motion)
//    • sections révélées en cadence (AnimatePresence)
//    • barre d'actions : Export PDF · Fermer
//    • CSS print isolant #saved-searches-document
//
//  Palette : Blanc / Sage / Charcoal — outil de productivité, pas crise.
//  Typographie : Space Mono (labels techniques), Inter (corps).
//  Icônes : Lucide. Aucun emoji.
//
//  Structure du corps :
//    a. En-tête — date + nombre de recherches sauvegardées
//    b. Onglets — Liste / Nouvelle recherche
//    c. Vue Liste — cartes (nom, aperçu requête, dernière exécution,
//       compteur d'exécutions, boutons Exécuter / Supprimer)
//    d. Vue Nouvelle — nom + saisie de mots-clés avec chips
//       AND / OR / NOT + aperçu requête sérialisée + bouton Sauvegarder
//    e. Résultats — nombre d'articles correspondants + top 3 (titre,
//       source, date, sentiment)
//
//  Skill ID : SKILL-22-SAVED-SEARCHES
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Download, Loader2, AlertTriangle, RefreshCw,
  Search, Plus, Trash2, Play, Clock, History, Save,
  FileText, ChevronRight,
} from "lucide-react";

// ─── Design tokens (non négociables) ──────────────────────────
const WHITE = "#FFFFFF";
const SAGE = "#4A7B5F";
const SAGE_BG = "rgba(74,123,95,0.08)";
const SAGE_BG_STRONG = "rgba(74,123,95,0.16)";
const SAGE_BORDER = "rgba(74,123,95,0.25)";
const CHARCOAL = "#0A0A0A";
const TEXT_BODY = "#525252";
const TEXT_MUTED = "#71717A";
const BORDER = "#F0F0F0";
const AMBER = "#F59E0B";
const AMBER_BG = "rgba(245,158,11,0.10)";
const AMBER_BORDER = "rgba(245,158,11,0.30)";
const RED = "#DC2626";
const RED_BG = "rgba(220,38,38,0.08)";
const RED_BORDER = "rgba(220,38,38,0.25)";
const POSITIVE = "#10B981";

// Couleurs par opérateur (AND = sage, OR = amber, NOT = red).
const OP_COLORS = {
  AND: { fg: SAGE, bg: SAGE_BG, border: SAGE_BORDER },
  OR:  { fg: AMBER, bg: AMBER_BG, border: AMBER_BORDER },
  NOT: { fg: RED, bg: RED_BG, border: RED_BORDER },
} as const;

// ─── Types ────────────────────────────────────────────────────

type OperatorKind = "AND" | "OR" | "NOT";

interface SavedSearchOperators {
  AND: string[];
  OR: string[];
  NOT: string[];
}

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  operators: SavedSearchOperators;
  createdAt: string;
  lastRunAt: string | null;
  runCount: number;
}

interface RunResultRow {
  title: string;
  source: string;
  date: string | null;
  url: string | null;
  severity: string | null;
  text: string; // texte concatené pour filtrage booléen
}

interface RunResults {
  searchId: string;
  searchName: string;
  count: number;
  top3: RunResultRow[];
  ranAt: string;
}

// ─── Constantes ───────────────────────────────────────────────

const STORAGE_KEY = "harchiq.saved-searches.v1";

const SECTIONS = [
  { id: "header",  delay: 200 },
  { id: "tabs",    delay: 350 },
  { id: "body",    delay: 500 },
];

// ═══════════════════════════════════════════════════════════════
//  Composant principal
// ═══════════════════════════════════════════════════════════════

export function SavedSearchesGenerator({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [view, setView] = useState<"list" | "new">("list");

  // Formulaire "Nouvelle recherche"
  const [newName, setNewName] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const [activeOp, setActiveOp] = useState<OperatorKind>("AND");
  const [pendingOps, setPendingOps] = useState<SavedSearchOperators>({
    AND: [],
    OR: [],
    NOT: [],
  });

  // Exécution
  const [runningId, setRunningId] = useState<string | null>(null);
  const [runResults, setRunResults] = useState<RunResults | null>(null);

  // Sauvegarde
  const [saving, setSaving] = useState(false);

  // ─── Chargement initial : lire localStorage ───────────────
  const loadFromStorage = useCallback(() => {
    try {
      if (typeof window === "undefined") return;
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setSearches([]);
        return;
      }
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        setSearches([]);
        return;
      }
      // Validation légère — on ne fait pas confiance au contenu.
      const valid: SavedSearch[] = [];
      for (const item of parsed) {
        if (!item || typeof item !== "object") continue;
        const s = item as Record<string, unknown>;
        if (
          typeof s.id === "string" &&
          typeof s.name === "string" &&
          typeof s.query === "string" &&
          s.operators && typeof s.operators === "object" &&
          typeof s.createdAt === "string" &&
          (s.lastRunAt === null || typeof s.lastRunAt === "string") &&
          typeof s.runCount === "number"
        ) {
          valid.push(s as unknown as SavedSearch);
        }
      }
      setSearches(valid);
    } catch {
      setSearches([]);
    }
  }, []);

  const persistToStorage = useCallback((list: SavedSearch[]) => {
    try {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // localStorage peut être plein ou désactivé — on ignore.
    }
  }, []);

  // ─── Cycle de vie : mount + cadence ───────────────────────
  useEffect(() => {
    loadFromStorage();
    setLoading(false);
    setError(null);
    for (const section of SECTIONS) {
      setTimeout(() => {
        setVisibleSections((prev) => new Set(prev).add(section.id));
      }, section.delay);
    }
  }, [loadFromStorage]);

  // ─── Ajouter un mot-clé à l'opérateur actif ───────────────
  const addKeyword = useCallback(() => {
    const kw = newKeyword.trim();
    if (!kw) return;
    // Éviter les doublons dans la même catégorie.
    setPendingOps((prev) => {
      if (prev[activeOp].includes(kw)) return prev;
      return {
        ...prev,
        [activeOp]: [...prev[activeOp], kw],
      };
    });
    setNewKeyword("");
  }, [newKeyword, activeOp]);

  // ─── Retirer un mot-clé ───────────────────────────────────
  const removeKeyword = useCallback((op: OperatorKind, kw: string) => {
    setPendingOps((prev) => ({
      ...prev,
      [op]: prev[op].filter((k) => k !== kw),
    }));
  }, []);

  // ─── Réinitialiser le formulaire ──────────────────────────
  const resetForm = useCallback(() => {
    setNewName("");
    setNewKeyword("");
    setActiveOp("AND");
    setPendingOps({ AND: [], OR: [], NOT: [] });
  }, []);

  // ─── Sauvegarder une nouvelle recherche ───────────────────
  const saveSearch = useCallback(async () => {
    const name = newName.trim();
    if (!name) {
      setError("Veuillez saisir un nom pour cette recherche.");
      return;
    }
    const totalKeywords =
      pendingOps.AND.length + pendingOps.OR.length + pendingOps.NOT.length;
    if (totalKeywords === 0) {
      setError("Veuillez ajouter au moins un mot-clé (AND, OR ou NOT).");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/console/saved-searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          query: serializeQuery(pendingOps),
          operators: pendingOps,
        }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      const saved = (await res.json()) as SavedSearch;
      const next = [saved, ...searches];
      setSearches(next);
      persistToStorage(next);
      resetForm();
      setView("list");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de la sauvegarde");
    } finally {
      setSaving(false);
    }
  }, [newName, pendingOps, searches, persistToStorage, resetForm]);

  // ─── Supprimer une recherche ──────────────────────────────
  const deleteSearch = useCallback((id: string) => {
    const next = searches.filter((s) => s.id !== id);
    setSearches(next);
    persistToStorage(next);
    // Si les résultats affichés correspondent à la recherche supprimée,
    // on les efface.
    setRunResults((prev) =>
      prev && prev.searchId === id ? null : prev,
    );
  }, [searches, persistToStorage]);

  // ─── Exécuter une recherche ───────────────────────────────
  const runSearch = useCallback(async (search: SavedSearch) => {
    setRunningId(search.id);
    setError(null);
    setRunResults(null);
    try {
      const rows = await fetchAndFilter(search.operators);
      const top3 = rows.slice(0, 3);
      const result: RunResults = {
        searchId: search.id,
        searchName: search.name,
        count: rows.length,
        top3,
        ranAt: new Date().toISOString(),
      };
      setRunResults(result);
      // Incrémenter runCount + lastRunAt côté client (localStorage).
      const next = searches.map((s) =>
        s.id === search.id
          ? { ...s, runCount: s.runCount + 1, lastRunAt: result.ranAt }
          : s,
      );
      setSearches(next);
      persistToStorage(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'exécution");
    } finally {
      setRunningId(null);
    }
  }, [searches, persistToStorage]);

  // ─── Render ───────────────────────────────────────────────
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(10,10,10,0.6)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          width: "100%", maxWidth: 960, maxHeight: "92vh",
          background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Barre d'en-tête ─── */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px", borderBottom: `1px solid ${BORDER}`,
            background: "#FAFAFA",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Search size={18} style={{ color: SAGE }} />
            <span
              style={{
                fontSize: 14, fontWeight: 700, color: CHARCOAL,
                fontFamily: "'Space Mono', monospace",
              }}
            >
              Recherches sauvegardées
            </span>
            {loading && (
              <span
                style={{
                  display: "flex", alignItems: "center", gap: 4, fontSize: 11,
                  color: SAGE, fontFamily: "'Space Mono', monospace",
                }}
              >
                <Loader2 size={11} className="animate-spin" /> Chargement...
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => window.print()}
              disabled={searches.length === 0}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
                background: searches.length === 0 ? BORDER : CHARCOAL,
                color: searches.length === 0 ? TEXT_MUTED : WHITE,
                border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600,
                cursor: searches.length === 0 ? "not-allowed" : "pointer",
                fontFamily: "inherit",
              }}
            >
              <Download size={13} /> PDF
            </button>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, display: "flex", alignItems: "center",
                justifyContent: "center", background: "transparent", border: "none",
                cursor: "pointer", color: TEXT_MUTED,
              }}
              aria-label="Fermer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ─── Corps ─── */}
        <div
          style={{
            flex: 1, overflowY: "auto", padding: "24px 32px",
            fontFamily: "'Inter', system-ui, sans-serif", color: CHARCOAL,
          }}
        >
          <div id="saved-searches-document">
            {/* ─── A. En-tête ─── */}
            <AnimatePresence>
              {visibleSections.has("header") && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ marginBottom: 20 }}
                >
                  <div
                    style={{
                      display: "flex", alignItems: "center", gap: 8, marginBottom: 6,
                    }}
                  >
                    <Clock size={14} style={{ color: SAGE }} />
                    <span
                      style={{
                        fontSize: 11, fontFamily: "'Space Mono', monospace",
                        color: SAGE, textTransform: "uppercase",
                        letterSpacing: "0.08em", fontWeight: 700,
                      }}
                    >
                      Gestionnaire de requêtes · {formatDate(new Date().toISOString())}
                    </span>
                  </div>
                  <h1
                    style={{
                      fontSize: 22, fontWeight: 700, margin: 0, color: CHARCOAL,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Recherches sauvegardées
                  </h1>
                  <p style={{ fontSize: 13, color: TEXT_MUTED, marginTop: 4 }}>
                    {searches.length} recherche{searches.length > 1 ? "s" : ""} persistante{searches.length > 1 ? "s" : ""} · Opérateurs booléens AND / OR / NOT · Stockage local (navigateur)
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ─── B. Onglets ─── */}
            <AnimatePresence>
              {visibleSections.has("tabs") && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: "flex", gap: 0, marginBottom: 20,
                    borderBottom: `1px solid ${BORDER}`,
                  }}
                >
                  <TabButton
                    active={view === "list"}
                    onClick={() => setView("list")}
                    label="Liste"
                    count={searches.length}
                  />
                  <TabButton
                    active={view === "new"}
                    onClick={() => setView("new")}
                    label="Nouvelle recherche"
                    icon={<Plus size={13} />}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ─── C. Corps principal ─── */}
            <AnimatePresence>
              {visibleSections.has("body") && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error && (
                    <div
                      style={{
                        marginBottom: 16, padding: "12px 16px",
                        background: RED_BG, border: `1px solid ${RED_BORDER}`,
                        borderRadius: 8, display: "flex", alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <AlertTriangle size={16} style={{ color: RED, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: RED }}>{error}</span>
                      <button
                        onClick={() => setError(null)}
                        style={{
                          marginLeft: "auto", background: "transparent", border: "none",
                          cursor: "pointer", color: RED, padding: 4,
                        }}
                        aria-label="Fermer l'erreur"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  {view === "list" && (
                    <ListView
                      searches={searches}
                      runningId={runningId}
                      onRun={runSearch}
                      onDelete={deleteSearch}
                      onGoNew={() => setView("new")}
                    />
                  )}

                  {view === "new" && (
                    <NewSearchForm
                      newName={newName}
                      setNewName={setNewName}
                      newKeyword={newKeyword}
                      setNewKeyword={setNewKeyword}
                      activeOp={activeOp}
                      setActiveOp={setActiveOp}
                      pendingOps={pendingOps}
                      onAddKeyword={addKeyword}
                      onRemoveKeyword={removeKeyword}
                      onSave={saveSearch}
                      onReset={resetForm}
                      saving={saving}
                      onEnterKeyword={addKeyword}
                    />
                  )}

                  {runResults && (
                    <ResultsPanel results={runResults} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ─── Pied de page ─── */}
            <div
              style={{
                marginTop: 24, paddingTop: 16,
                borderTop: `1px solid ${BORDER}`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                fontSize: 11, color: TEXT_MUTED,
                fontFamily: "'Space Mono', monospace",
              }}
            >
              <span>
                Stockage : localStorage · Clé : {STORAGE_KEY}
              </span>
              <span>
                HarchIQ · Skill 22
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── CSS print — isoler #saved-searches-document ─── */}
      <PrintStyles />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Vue Liste — cartes des recherches sauvegardées
// ═══════════════════════════════════════════════════════════════

function ListView({
  searches, runningId, onRun, onDelete, onGoNew,
}: {
  searches: SavedSearch[];
  runningId: string | null;
  onRun: (s: SavedSearch) => void;
  onDelete: (id: string) => void;
  onGoNew: () => void;
}) {
  if (searches.length === 0) {
    return (
      <div
        style={{
          textAlign: "center", padding: "48px 24px",
          background: "#FAFAFA", borderRadius: 12,
          border: `1px dashed ${BORDER}`,
        }}
      >
        <Search size={32} style={{ color: TEXT_MUTED, margin: "0 auto" }} />
        <p
          style={{
            marginTop: 12, fontSize: 14, color: TEXT_BODY, fontWeight: 500,
          }}
        >
          Aucune recherche sauvegardée pour le moment
        </p>
        <p style={{ marginTop: 4, fontSize: 12, color: TEXT_MUTED }}>
          Créez votre première requête booléenne pour la réutiliser ultérieurement.
        </p>
        <button
          onClick={onGoNew}
          style={{
            marginTop: 16, display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 16px", background: CHARCOAL, color: WHITE,
            border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
          }}
        >
          <Plus size={14} /> Nouvelle recherche
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {searches.map((s) => (
        <SearchCard
          key={s.id}
          search={s}
          running={runningId === s.id}
          onRun={() => onRun(s)}
          onDelete={() => onDelete(s.id)}
        />
      ))}
    </div>
  );
}

function SearchCard({
  search, running, onRun, onDelete,
}: {
  search: SavedSearch;
  running: boolean;
  onRun: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      style={{
        padding: 16, background: WHITE,
        border: `1px solid ${BORDER}`, borderRadius: 10,
        transition: "border-color 200ms ease",
      }}
    >
      <div
        style={{
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 4,
            }}
          >
            <FileText size={14} style={{ color: SAGE, flexShrink: 0 }} />
            <h3
              style={{
                margin: 0, fontSize: 14, fontWeight: 700, color: CHARCOAL,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}
            >
              {search.name}
            </h3>
          </div>
          <div
            style={{
              fontSize: 12, fontFamily: "'Space Mono', monospace",
              color: TEXT_BODY, marginBottom: 8,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}
          >
            {search.query || "—"}
          </div>
          <div
            style={{
              display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
              fontSize: 11, color: TEXT_MUTED,
              fontFamily: "'Space Mono', monospace",
            }}
          >
            <span
              style={{
                display: "flex", alignItems: "center", gap: 4,
              }}
            >
              <Clock size={11} />
              Sauvegardée le {formatDate(search.createdAt)}
            </span>
            <span
              style={{
                display: "flex", alignItems: "center", gap: 4,
              }}
            >
              <History size={11} />
              {search.runCount} exécution{search.runCount > 1 ? "s" : ""}
            </span>
            {search.lastRunAt && (
              <span>
                Dernière : {formatDate(search.lastRunAt)}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <button
            onClick={onRun}
            disabled={running}
            style={{
              display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
              background: running ? SAGE_BG_STRONG : SAGE,
              color: running ? SAGE : WHITE,
              border: `1px solid ${SAGE_BORDER}`,
              borderRadius: 6, fontSize: 12, fontWeight: 600,
              cursor: running ? "wait" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {running ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Play size={12} />
            )}
            {running ? "Exécution..." : "Exécuter"}
          </button>
          <button
            onClick={onDelete}
            style={{
              width: 30, height: 30, display: "flex", alignItems: "center",
              justifyContent: "center", background: WHITE,
              border: `1px solid ${BORDER}`, borderRadius: 6,
              cursor: "pointer", color: RED,
            }}
            aria-label={`Supprimer ${search.name}`}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Vue Nouvelle recherche — formulaire avec chips AND/OR/NOT
// ═══════════════════════════════════════════════════════════════

function NewSearchForm({
  newName, setNewName,
  newKeyword, setNewKeyword,
  activeOp, setActiveOp,
  pendingOps,
  onAddKeyword, onRemoveKeyword,
  onSave, onReset,
  saving, onEnterKeyword,
}: {
  newName: string;
  setNewName: (v: string) => void;
  newKeyword: string;
  setNewKeyword: (v: string) => void;
  activeOp: OperatorKind;
  setActiveOp: (op: OperatorKind) => void;
  pendingOps: SavedSearchOperators;
  onAddKeyword: () => void;
  onRemoveKeyword: (op: OperatorKind, kw: string) => void;
  onSave: () => void;
  onReset: () => void;
  saving: boolean;
  onEnterKeyword: () => void;
}) {
  const totalKeywords =
    pendingOps.AND.length + pendingOps.OR.length + pendingOps.NOT.length;

  return (
    <div
      style={{
        padding: 20, background: "#FAFAFA",
        border: `1px solid ${BORDER}`, borderRadius: 12,
      }}
    >
      {/* Nom */}
      <div style={{ marginBottom: 16 }}>
        <label
          style={{
            display: "block", marginBottom: 6, fontSize: 11, fontWeight: 700,
            color: CHARCOAL, fontFamily: "'Space Mono', monospace",
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}
        >
          Nom de la recherche
        </label>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Ex. Veille OCP phosphate"
          maxLength={80}
          style={{
            width: "100%", padding: "10px 12px", fontSize: 14,
            background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 6,
            color: CHARCOAL, fontFamily: "'Inter', sans-serif",
            outline: "none",
          }}
        />
      </div>

      {/* Opérateur actif */}
      <div style={{ marginBottom: 12 }}>
        <label
          style={{
            display: "block", marginBottom: 6, fontSize: 11, fontWeight: 700,
            color: CHARCOAL, fontFamily: "'Space Mono', monospace",
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}
        >
          Opérateur booléen
        </label>
        <div style={{ display: "flex", gap: 6 }}>
          {(["AND", "OR", "NOT"] as OperatorKind[]).map((op) => {
            const c = OP_COLORS[op];
            const isActive = activeOp === op;
            return (
              <button
                key={op}
                onClick={() => setActiveOp(op)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 14px", fontSize: 12, fontWeight: 700,
                  fontFamily: "'Space Mono', monospace",
                  background: isActive ? c.bg : WHITE,
                  color: isActive ? c.fg : TEXT_MUTED,
                  border: `1px solid ${isActive ? c.border : BORDER}`,
                  borderRadius: 6, cursor: "pointer",
                }}
              >
                {op}
                <span
                  style={{
                    fontSize: 10, fontWeight: 400,
                    fontFamily: "'Inter', sans-serif", opacity: 0.8,
                  }}
                >
                  {op === "AND" ? "tous" : op === "OR" ? "au moins un" : "aucun"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Saisie du mot-clé */}
      <div style={{ marginBottom: 16 }}>
        <label
          style={{
            display: "block", marginBottom: 6, fontSize: 11, fontWeight: 700,
            color: CHARCOAL, fontFamily: "'Space Mono', monospace",
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}
        >
          Mot-clé à ajouter ({activeOp})
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onEnterKeyword();
              }
            }}
            placeholder={`Mot-clé pour ${activeOp}...`}
            maxLength={60}
            style={{
              flex: 1, padding: "10px 12px", fontSize: 14,
              background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 6,
              color: CHARCOAL, fontFamily: "'Inter', sans-serif",
              outline: "none",
            }}
          />
          <button
            onClick={onAddKeyword}
            disabled={!newKeyword.trim()}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "0 14px", fontSize: 12, fontWeight: 600,
              background: newKeyword.trim() ? CHARCOAL : BORDER,
              color: newKeyword.trim() ? WHITE : TEXT_MUTED,
              border: "none", borderRadius: 6,
              cursor: newKeyword.trim() ? "pointer" : "not-allowed",
              fontFamily: "inherit",
            }}
          >
            <Plus size={13} /> Ajouter
          </button>
        </div>
      </div>

      {/* Chips par opérateur */}
      <div style={{ marginBottom: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {(["AND", "OR", "NOT"] as OperatorKind[]).map((op) => (
          <div key={op}>
            <div
              style={{
                display: "flex", alignItems: "center", gap: 6, marginBottom: 4,
                fontSize: 10, fontWeight: 700, color: TEXT_MUTED,
                fontFamily: "'Space Mono', monospace",
                textTransform: "uppercase", letterSpacing: "0.06em",
              }}
            >
              {op}
              <span style={{ color: OP_COLORS[op].fg }}>
                ({pendingOps[op].length})
              </span>
            </div>
            <div
              style={{
                display: "flex", flexWrap: "wrap", gap: 6,
                minHeight: 28, padding: 6,
                background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 6,
              }}
            >
              {pendingOps[op].length === 0 && (
                <span
                  style={{
                    fontSize: 11, color: TEXT_MUTED, fontStyle: "italic",
                    alignSelf: "center", paddingLeft: 4,
                  }}
                >
                  Aucun mot-clé
                </span>
              )}
              {pendingOps[op].map((kw) => {
                const c = OP_COLORS[op];
                return (
                  <span
                    key={kw}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "3px 8px 3px 10px",
                      background: c.bg, color: c.fg,
                      border: `1px solid ${c.border}`,
                      borderRadius: 12, fontSize: 12, fontWeight: 600,
                      fontFamily: "'Space Mono', monospace",
                    }}
                  >
                    {kw}
                    <button
                      onClick={() => onRemoveKeyword(op, kw)}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: 14, height: 14, background: "transparent",
                        border: "none", cursor: "pointer", color: c.fg,
                        padding: 0,
                      }}
                      aria-label={`Retirer ${kw}`}
                    >
                      <X size={10} />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Aperçu requête sérialisée */}
      <div style={{ marginBottom: 16 }}>
        <label
          style={{
            display: "block", marginBottom: 6, fontSize: 11, fontWeight: 700,
            color: CHARCOAL, fontFamily: "'Space Mono', monospace",
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}
        >
          Aperçu de la requête
        </label>
        <div
          style={{
            padding: "10px 12px", background: WHITE,
            border: `1px solid ${BORDER}`, borderRadius: 6,
            fontFamily: "'Space Mono', monospace", fontSize: 12,
            color: totalKeywords > 0 ? CHARCOAL : TEXT_MUTED,
            minHeight: 38, wordBreak: "break-word",
          }}
        >
          {totalKeywords > 0 ? serializeQuery(pendingOps) : "Ajoutez au moins un mot-clé pour générer la requête..."}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onSave}
          disabled={saving || !newName.trim() || totalKeywords === 0}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 16px", fontSize: 13, fontWeight: 600,
            background: saving || !newName.trim() || totalKeywords === 0 ? BORDER : SAGE,
            color: saving || !newName.trim() || totalKeywords === 0 ? TEXT_MUTED : WHITE,
            border: "none", borderRadius: 6,
            cursor: saving || !newName.trim() || totalKeywords === 0 ? "not-allowed" : "pointer",
            fontFamily: "inherit",
          }}
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </button>
        <button
          onClick={onReset}
          disabled={saving}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 16px", fontSize: 13, fontWeight: 600,
            background: "transparent", color: TEXT_MUTED,
            border: `1px solid ${BORDER}`, borderRadius: 6,
            cursor: saving ? "not-allowed" : "pointer",
            fontFamily: "inherit",
          }}
        >
          <RefreshCw size={14} /> Réinitialiser
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Panneau de résultats — nombre d'articles + top 3
// ═══════════════════════════════════════════════════════════════

function ResultsPanel({ results }: { results: RunResults }) {
  return (
    <div
      style={{
        marginTop: 20, padding: 20,
        background: SAGE_BG, border: `1px solid ${SAGE_BORDER}`,
        borderRadius: 12,
      }}
    >
      <div
        style={{
          display: "flex", alignItems: "center", gap: 8, marginBottom: 12,
        }}
      >
        <Search size={16} style={{ color: SAGE }} />
        <span
          style={{
            fontSize: 11, fontFamily: "'Space Mono', monospace",
            color: SAGE, textTransform: "uppercase",
            letterSpacing: "0.08em", fontWeight: 700,
          }}
        >
          Résultats — {results.searchName}
        </span>
        <span
          style={{
            marginLeft: "auto", fontSize: 11,
            fontFamily: "'Space Mono', monospace", color: TEXT_MUTED,
          }}
        >
          {formatDate(results.ranAt)}
        </span>
      </div>

      <div
        style={{
          display: "flex", alignItems: "baseline", gap: 6, marginBottom: 16,
        }}
      >
        <span
          style={{
            fontSize: 32, fontWeight: 700, color: CHARCOAL,
            fontFamily: "'Space Mono', monospace", lineHeight: 1,
          }}
        >
          {results.count}
        </span>
        <span style={{ fontSize: 13, color: TEXT_BODY }}>
          article{results.count > 1 ? "s" : ""} correspondant{results.count > 1 ? "s" : ""}
        </span>
      </div>

      {results.count === 0 ? (
        <div
          style={{
            padding: "16px 12px", background: WHITE,
            border: `1px dashed ${BORDER}`, borderRadius: 8,
            textAlign: "center", fontSize: 13, color: TEXT_MUTED,
          }}
        >
          Aucun article ne correspond à cette requête.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              fontSize: 11, fontWeight: 700, color: TEXT_MUTED,
              fontFamily: "'Space Mono', monospace",
              textTransform: "uppercase", letterSpacing: "0.06em",
              marginBottom: 2,
            }}
          >
            Top 3 résultats
          </div>
          {results.top3.map((row, idx) => (
            <ResultRow key={idx} row={row} rank={idx + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function ResultRow({ row, rank }: { row: RunResultRow; rank: number }) {
  const sevColor =
    row.severity === "critical" ? RED :
    row.severity === "high" ? AMBER :
    TEXT_MUTED;
  return (
    <a
      href={row.url ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex", gap: 10, padding: "10px 12px",
        background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 8,
        textDecoration: "none", color: "inherit",
        transition: "border-color 200ms ease",
      }}
    >
      <span
        style={{
          flexShrink: 0, width: 22, height: 22, display: "flex",
          alignItems: "center", justifyContent: "center",
          background: SAGE_BG, color: SAGE, borderRadius: "50%",
          fontSize: 11, fontWeight: 700, fontFamily: "'Space Mono', monospace",
        }}
      >
        {rank}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13, fontWeight: 600, color: CHARCOAL,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}
        >
          {row.title}
        </div>
        <div
          style={{
            display: "flex", alignItems: "center", gap: 8, marginTop: 2,
            fontSize: 11, color: TEXT_MUTED,
            fontFamily: "'Space Mono', monospace",
          }}
        >
          <span>{row.source}</span>
          {row.date && (
            <>
              <span style={{ opacity: 0.5 }}>·</span>
              <span>{formatDate(row.date)}</span>
            </>
          )}
          {row.severity && (
            <>
              <span style={{ opacity: 0.5 }}>·</span>
              <span style={{ color: sevColor, fontWeight: 600 }}>
                {row.severity === "critical" ? "Critique" : row.severity === "high" ? "Élevé" : row.severity}
              </span>
            </>
          )}
        </div>
      </div>
      <ChevronRight size={14} style={{ color: TEXT_MUTED, flexShrink: 0, alignSelf: "center" }} />
    </a>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Onglets
// ═══════════════════════════════════════════════════════════════

function TabButton({
  active, onClick, label, count, icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "10px 16px", fontSize: 13, fontWeight: 600,
        background: "transparent", color: active ? SAGE : TEXT_MUTED,
        border: "none", borderBottom: active ? `2px solid ${SAGE}` : "2px solid transparent",
        cursor: "pointer", fontFamily: "inherit",
        marginBottom: -1,
      }}
    >
      {icon}
      {label}
      {count !== undefined && count > 0 && (
        <span
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            minWidth: 18, height: 18, padding: "0 5px",
            background: active ? SAGE_BG : BORDER, color: active ? SAGE : TEXT_MUTED,
            borderRadius: 9, fontSize: 10, fontWeight: 700,
            fontFamily: "'Space Mono', monospace",
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
//  CSS print — isoler #saved-searches-document
// ═══════════════════════════════════════════════════════════════

function PrintStyles() {
  return (
    <style>{`
      @media print {
        body * { visibility: hidden !important; }
        #saved-searches-document, #saved-searches-document * {
          visibility: visible !important;
        }
        #saved-searches-document {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          max-width: none !important;
          padding: 24px !important;
        }
      }
    `}</style>
  );
}

// ═══════════════════════════════════════════════════════════════
//  Helpers
// ═══════════════════════════════════════════════════════════════

/**
 * Sérialise les operators en chaîne lisible :
 *   `(kw1 AND kw2) (kw3 OR kw4) -kw5 -kw6`
 * Les catégories vides sont omises.
 */
function serializeQuery(ops: SavedSearchOperators): string {
  const parts: string[] = [];
  if (ops.AND.length > 0) parts.push(`(${ops.AND.join(" AND ")})`);
  if (ops.OR.length > 0) parts.push(`(${ops.OR.join(" OR ")})`);
  for (const not of ops.NOT) parts.push(`-${not}`);
  return parts.join(" ");
}

/**
 * Formate une date ISO en chaîne FR courte : "12/03/2025 14:32".
 * Si la date est invalide, renvoie "—".
 */
function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  } catch {
    return "—";
  }
}

// ─── Runner : fetch + filtrage booléen côté client ────────────
//
//  1. Construire une requête simple depuis les keywords positifs
//     (AND + OR) — on les joint par " OR " pour que l'API
//     /api/console/search renvoie un sur-ensemble large.
//  2. Fetch /api/console/search?q=<positive-query>&limit=50.
//  3. Filtrer les résultats (type "alert" = articles) avec les
//     règles booléennes :
//       • AND  → tous les keywords doivent être présents
//       • OR   → au moins un keyword doit être présent (ou liste
//                vide = pas de contrainte)
//       • NOT  → aucun keyword ne doit être présent
//  4. Renvoyer la liste filtrée triée par date décroissante.
async function fetchAndFilter(
  ops: SavedSearchOperators,
): Promise<RunResultRow[]> {
  const positives = [...ops.AND, ...ops.OR];
  if (positives.length === 0 && ops.NOT.length === 0) {
    return [];
  }

  // Si on n'a que des NOT, on ne peut pas requêter l'API sans un
  // token positif — on renvoie une liste vide avec un message
  // explicite via le compteur.
  if (positives.length === 0) {
    return [];
  }

  // L'API fait un `contains` insensible à la casse — on lui passe
  // le premier mot-clé positif (le plus discriminant). On filtre
  // ensuite côté client pour les autres keywords.
  const apiQuery = positives[0];
  const url = `/api/console/search?q=${encodeURIComponent(apiQuery)}&limit=50`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Erreur API recherche : HTTP ${res.status}`);
  }
  const json = (await res.json()) as {
    results?: Array<{
      type: string;
      title?: string;
      source?: string;
      date?: string | null;
      url?: string | null;
      severity?: string;
      label?: string;
      period?: string;
    }>;
  };

  const raw = json.results ?? [];

  // Normaliser en RunResultRow — on ne garde que les articles
  // (type === "alert"). Les topics/reports n'ont pas de titre
  // exploitable pour le filtrage booléen.
  const rows: RunResultRow[] = raw
    .filter((r) => r.type === "alert")
    .map((r) => {
      const title = r.title ?? "Sans titre";
      const source = r.source ?? "Source inconnue";
      return {
        title,
        source,
        date: r.date ?? null,
        url: r.url ?? null,
        severity: r.severity ?? null,
        text: `${title} ${source}`.toLowerCase(),
      };
    });

  // Filtrage booléen.
  const filtered = rows.filter((row) => {
    const text = row.text;
    // AND : tous présents
    for (const kw of ops.AND) {
      if (!text.includes(kw.toLowerCase())) return false;
    }
    // OR : au moins un présent (si liste non vide)
    if (ops.OR.length > 0) {
      const hasOr = ops.OR.some((kw) => text.includes(kw.toLowerCase()));
      if (!hasOr) return false;
    }
    // NOT : aucun présent
    for (const kw of ops.NOT) {
      if (text.includes(kw.toLowerCase())) return false;
    }
    return true;
  });

  // Trier par date décroissante (nulls en dernier).
  filtered.sort((a, b) => {
    const ta = a.date ? new Date(a.date).getTime() : 0;
    const tb = b.date ? new Date(b.date).getTime() : 0;
    return tb - ta;
  });

  return filtered;
}
