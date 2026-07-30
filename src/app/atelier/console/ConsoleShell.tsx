"use client";

import { useState, useEffect, useCallback } from "react";
import { C } from "../components/tokens";

// ═══════════════════════════════════════════════════════════════
//  HARCHIQ CONSOLE — Shell
//
//  Vocabulary (HarchIQ private dictionary — no geek terms on the UI):
//    • Console        = dashboard
//    • Météo          = sentiment analysis
//    • HarchIQ Signal = OSINT (rebranded — "Signal" = antenna image)
//    • Voisins        = competitors (your neighborhood)
//    • Empreinte IA   = AI visibility (your footprint on ChatGPT/Perplexity)
//    • Présence       = share of voice
//    • Pression       = risk score (thermometer image)
//    • Signal fort    = crisis alert
//    • Mouvement      = trend detection
//    • Écoute         = media monitoring
//    • Sujets         = entity extraction
//    • Pass           = API key
//    • Relais         = webhook
//
//  Account types (3 in this Console, 1 separate product):
//    Type 1 — Découverte  : articles + weather + AI footprint. 5K MAD/mo
//    Type 2 — Veille      : + Voisins with Indice de Voisinage. 15K MAD/mo
//    Type 3 — Investor    : + unlimited dossiers + board PDF + API. 50K+ MAD/mo
//    Type 4 — Solo        : separate product (HarchIQ Solo, 290 MAD/mo, PLG)
//
//  Design rules (per founder):
//    • NO emojis — pure typography (Swiss/Vignelli style)
//    • Numbers in Space Mono, labels in Inter
//    • Minimalist, lots of whitespace
//    • stone-500 accent, emerald-500 CTA only
// ═══════════════════════════════════════════════════════════════

// ─── ACCOUNT TYPES ───────────────────────────────────────────────
type AccountType = "decouverte" | "veille" | "investor";

interface AccountTier {
  id: AccountType;
  label: string;
  tagline: string;
  price: string;
}

const ACCOUNT_TIERS: AccountTier[] = [
  { id: "decouverte", label: "Découverte", tagline: "Veille essentielle", price: "5K MAD / mois" },
  { id: "veille", label: "Veille", tagline: "Avec voisins", price: "15K MAD / mois" },
  { id: "investor", label: "Investor", tagline: "Accès complet", price: "50K+ MAD / mois" },
];

// ─── NATIVE SECTIONS (menu items) ────────────────────────────────
interface Section {
  id: string;
  label: string;
  description: string;
  tiers: AccountType[];
  count?: number;
  countLabel?: string;
  isNative?: boolean;
}

const NATIVE_SECTIONS: Section[] = [
  { id: "meteo", label: "Météo", description: "Bulletin du jour — sentiment global", tiers: ["decouverte", "veille", "investor"], count: 67, countLabel: "/100", isNative: true },
  { id: "signaux", label: "Signaux", description: "HarchIQ Signal — antenne activée", tiers: ["decouverte", "veille", "investor"], count: 3, countLabel: "nouveaux", isNative: true },
  { id: "voisins", label: "Voisins", description: "Concurrents directs suivis", tiers: ["veille", "investor"], count: 5, countLabel: "suivis", isNative: true },
  { id: "presence", label: "Présence", description: "Votre place dans la conversation", tiers: ["decouverte", "veille", "investor"], count: 23, countLabel: "% secteur", isNative: true },
  { id: "empreinte-ia", label: "Empreinte IA", description: "Votre visibilité sur les moteurs IA", tiers: ["decouverte", "veille", "investor"], count: 4, countLabel: "/8 moteurs", isNative: true },
  { id: "ecoute", label: "Écoute", description: "Articles collectés (30+ sources)", tiers: ["decouverte", "veille", "investor"], count: 2546, countLabel: "articles", isNative: true },
  { id: "pression", label: "Pression", description: "Niveau de pression médiatique", tiers: ["decouverte", "veille", "investor"], count: 2, countLabel: "/5", isNative: true },
  { id: "sujets", label: "Sujets", description: "Thèmes émergents détectés", tiers: ["decouverte", "veille", "investor"], count: 12, countLabel: "émergents", isNative: true },
  { id: "calendrier", label: "Calendrier", description: "Événements à venir (AG, earnings)", tiers: ["decouverte", "veille", "investor"], count: 3, countLabel: "événements", isNative: true },
  { id: "rapports", label: "Rapports", description: "PDF board-ready mensuels", tiers: ["decouverte", "veille", "investor"], count: 1, countLabel: "prêt", isNative: true },
];

interface CustomSection {
  id: string;
  label: string;
  query: string;
}

const DEFAULT_CUSTOM_SECTIONS: CustomSection[] = [
  { id: "custom-1", label: "Mon CEO", query: "Amine Harch El Korane" },
];

const STORAGE_KEY = "harchiq-console-layout-v1";

interface ConsoleLayout {
  tier: AccountType;
  visibleSections: string[];
  hiddenSections: string[];
  customSections: CustomSection[];
}

export function ConsoleShell() {
  const [layout, setLayout] = useState<ConsoleLayout>({
    tier: "decouverte",
    visibleSections: ["meteo", "signaux", "presence", "empreinte-ia", "ecoute", "pression", "sujets", "calendrier", "rapports"],
    hiddenSections: [],
    customSections: DEFAULT_CUSTOM_SECTIONS,
  });
  const [activeSection, setActiveSection] = useState<string>("meteo");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionLabel, setNewSectionLabel] = useState("");
  const [newSectionQuery, setNewSectionQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ConsoleLayout;
        setLayout(parsed);
        if (parsed.visibleSections.length > 0) {
          setActiveSection(parsed.visibleSections[0]);
        }
      }
    } catch {
      // ignore
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
    } catch {
      // ignore
    }
  }, [layout, mounted]);

  const availableNativeSections = NATIVE_SECTIONS.filter((s) => s.tiers.includes(layout.tier));

  const orderedSections: Section[] = layout.visibleSections
    .map((id) => {
      const native = NATIVE_SECTIONS.find((s) => s.id === id);
      if (native) return native;
      const custom = layout.customSections.find((s) => s.id === id);
      if (custom) return { id: custom.id, label: custom.label, description: `Recherche : "${custom.query}"`, tiers: [layout.tier], isNative: false };
      return null;
    })
    .filter((s): s is Section => s !== null);

  const changeTier = useCallback((tier: AccountType) => {
    setLayout((prev) => {
      const available = NATIVE_SECTIONS.filter((s) => s.tiers.includes(tier));
      const stillVisible = prev.visibleSections.filter((id) =>
        available.some((s) => s.id === id) || prev.customSections.some((c) => c.id === id)
      );
      if (stillVisible.length > 0 && !stillVisible.includes(activeSection)) {
        setActiveSection(stillVisible[0]);
      }
      return { ...prev, tier, visibleSections: stillVisible };
    });
  }, [activeSection]);

  const moveSection = useCallback((id: string, direction: "up" | "down") => {
    setLayout((prev) => {
      const ids = [...prev.visibleSections];
      const idx = ids.indexOf(id);
      if (idx === -1) return prev;
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= ids.length) return prev;
      [ids[idx], ids[newIdx]] = [ids[newIdx], ids[idx]];
      return { ...prev, visibleSections: ids };
    });
  }, []);

  const hideSection = useCallback((id: string) => {
    setLayout((prev) => {
      const isNative = NATIVE_SECTIONS.some((s) => s.id === id);
      const newVisible = prev.visibleSections.filter((s) => s !== id);
      const newHidden = isNative ? [...prev.hiddenSections, id] : prev.hiddenSections;
      const newCustom = isNative ? prev.customSections : prev.customSections.filter((c) => c.id !== id);
      if (id === activeSection && newVisible.length > 0) {
        setActiveSection(newVisible[0]);
      }
      return { ...prev, visibleSections: newVisible, hiddenSections: newHidden, customSections: newCustom };
    });
  }, [activeSection]);

  const showSection = useCallback((id: string) => {
    setLayout((prev) => {
      if (prev.visibleSections.includes(id)) return prev;
      return { ...prev, visibleSections: [...prev.visibleSections, id], hiddenSections: prev.hiddenSections.filter((h) => h !== id) };
    });
  }, []);

  const addCustomSection = useCallback(() => {
    if (!newSectionLabel.trim() || !newSectionQuery.trim()) return;
    const id = `custom-${Date.now()}`;
    const newCustom: CustomSection = { id, label: newSectionLabel.trim(), query: newSectionQuery.trim() };
    setLayout((prev) => ({
      ...prev,
      customSections: [...prev.customSections, newCustom],
      visibleSections: [...prev.visibleSections, id],
    }));
    setNewSectionLabel("");
    setNewSectionQuery("");
    setShowAddSection(false);
    setActiveSection(id);
  }, [newSectionLabel, newSectionQuery]);

  const onDragStart = (id: string) => setDraggedId(id);
  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;
    setLayout((prev) => {
      const ids = [...prev.visibleSections];
      const fromIdx = ids.indexOf(draggedId);
      const toIdx = ids.indexOf(targetId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      ids.splice(fromIdx, 1);
      ids.splice(toIdx, 0, draggedId);
      return { ...prev, visibleSections: ids };
    });
    setDraggedId(null);
  };

  if (!mounted) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, padding: "48px 16px", fontFamily: C.fontSans }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", color: C.textMuted, fontFamily: C.fontMono, fontSize: "13px" }}>
          Chargement de la Console HarchIQ…
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: C.fontSans }}>
      <TopBar
        tier={layout.tier}
        onTierChange={changeTier}
        onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        mobileMenuOpen={mobileMenuOpen}
      />

      <div className="console-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", maxWidth: "1440px", margin: "0 auto", width: "100%" }}>
        <SideMenu
          sections={orderedSections}
          activeSection={activeSection}
          onSelect={(id) => {
            setActiveSection(id);
            setMobileMenuOpen(false);
          }}
          onMoveUp={(id) => moveSection(id, "up")}
          onMoveDown={(id) => moveSection(id, "down")}
          onHide={hideSection}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
          draggedId={draggedId}
          onAddSection={() => setShowAddSection(true)}
          tier={layout.tier}
          hiddenSections={layout.hiddenSections}
          onShowHidden={showSection}
          availableNativeSections={availableNativeSections}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />
        <Content section={orderedSections.find((s) => s.id === activeSection) || orderedSections[0]} tier={layout.tier} />
      </div>

      {showAddSection && (
        <AddSectionModal
          label={newSectionLabel}
          query={newSectionQuery}
          onLabelChange={setNewSectionLabel}
          onQueryChange={setNewSectionQuery}
          onSubmit={addCustomSection}
          onClose={() => setShowAddSection(false)}
        />
      )}

      <style>{`
        @media (min-width: 768px) {
          .console-grid { grid-template-columns: 280px minmax(0, 1fr) !important; }
        }
        @media (min-width: 1200px) {
          .console-grid { grid-template-columns: 320px minmax(0, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}

function TopBar({
  tier,
  onTierChange,
  onMobileMenuToggle,
  mobileMenuOpen,
}: {
  tier: AccountType;
  onTierChange: (t: AccountType) => void;
  onMobileMenuToggle: () => void;
  mobileMenuOpen: boolean;
}) {
  const currentTier = ACCOUNT_TIERS.find((t) => t.id === tier)!;
  return (
    <header style={{ borderBottom: `1px solid ${C.border}`, background: C.bg, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Hamburger — mobile only (controlled by CSS class) */}
        <button
          onClick={onMobileMenuToggle}
          className="console-hamburger"
          style={{
            flexDirection: "column",
            gap: "3px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "6px",
          }}
          aria-label="Menu"
        >
          <span style={{ width: "18px", height: "1.5px", background: C.text, transition: "transform 0.2s", transform: mobileMenuOpen ? "translateY(4.5px) rotate(45deg)" : "none" }} />
          <span style={{ width: "18px", height: "1.5px", background: C.text, opacity: mobileMenuOpen ? 0 : 1, transition: "opacity 0.2s" }} />
          <span style={{ width: "18px", height: "1.5px", background: C.text, transition: "transform 0.2s", transform: mobileMenuOpen ? "translateY(-4.5px) rotate(-45deg)" : "none" }} />
        </button>

        <div style={{ fontFamily: C.fontMono, fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", color: C.text, textTransform: "uppercase" }}>
          HarchIQ<span style={{ color: C.accent, marginLeft: "8px" }}>Console</span>
        </div>
        <div className="console-tier-info" style={{ width: "1px", height: "16px", background: C.border }} />
        <div className="console-tier-info" style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          {currentTier.label} · {currentTier.price}
        </div>
      </div>
      <div style={{ display: "flex", gap: "0", border: `1px solid ${C.border}`, borderRadius: "4px", overflow: "hidden", background: C.bgSubtle }}>
        {ACCOUNT_TIERS.map((t) => (
          <button key={t.id} onClick={() => onTierChange(t.id)} style={{ padding: "8px 12px", background: tier === t.id ? C.text : "transparent", color: tier === t.id ? "#ffffff" : C.textBody, border: "none", fontFamily: C.fontSans, fontSize: "11px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s", letterSpacing: "0.02em" }}>
            {t.label}
          </button>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .console-hamburger { display: flex !important; }
          .console-tier-info { display: none !important; }
        }
      `}</style>
    </header>
  );
}

interface SideMenuProps {
  sections: Section[];
  activeSection: string;
  onSelect: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onHide: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (id: string) => void;
  draggedId: string | null;
  onAddSection: () => void;
  tier: AccountType;
  hiddenSections: string[];
  onShowHidden: (id: string) => void;
  availableNativeSections: Section[];
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

function SideMenu(props: SideMenuProps) {
  const [showHidden, setShowHidden] = useState(false);
  const hiddenAvailable = props.availableNativeSections.filter((s) => props.hiddenSections.includes(s.id));

  return (
    <>
      {/* Mobile overlay — click to close */}
      {props.mobileOpen && (
        <div
          onClick={props.onCloseMobile}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 40,
          }}
          className="console-mobile-overlay"
        />
      )}

      <aside
        style={{
          borderRight: `1px solid ${C.border}`,
          background: C.bg,
          minHeight: "calc(100vh - 49px)",
          padding: "24px 0",
        }}
        className="console-sidebar"
        data-open={props.mobileOpen ? "true" : "false"}
      >
        <div style={{ padding: "0 20px 16px", fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, letterSpacing: "0.14em", textTransform: "uppercase", borderBottom: `1px solid ${C.border}`, marginBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Sections</span>
          <span style={{ color: C.accent }}>{props.sections.length}</span>
        </div>

        <div>
          {props.sections.map((section, idx) => {
            const isActive = section.id === props.activeSection;
            const isDragged = section.id === props.draggedId;
            return (
              <div
                key={section.id}
                draggable
                onDragStart={() => props.onDragStart(section.id)}
                onDragOver={props.onDragOver}
                onDrop={() => props.onDrop(section.id)}
                className="console-section"
                style={{ padding: "10px 20px", cursor: "pointer", background: isActive ? C.bgSubtle : "transparent", borderLeft: isActive ? `2px solid ${C.accent}` : "2px solid transparent", opacity: isDragged ? 0.4 : 1, transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}
                onClick={() => props.onSelect(section.id)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flex: 1 }}>
                  <span style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, minWidth: "20px" }}>
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: isActive ? 600 : 500, color: isActive ? C.text : C.textBody, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {section.label}
                      {!section.isNative && (
                        <span style={{ marginLeft: "6px", fontSize: "9px", fontFamily: C.fontMono, color: C.accent, letterSpacing: "0.1em", textTransform: "uppercase" }}>custom</span>
                      )}
                    </div>
                    <div style={{ fontSize: "11px", color: C.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {section.description}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                  {section.count !== undefined && (
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: C.fontMono, fontSize: "12px", fontWeight: 700, color: C.text }}>{section.count}</div>
                      {section.countLabel && <div style={{ fontSize: "9px", color: C.textMuted, fontFamily: C.fontMono }}>{section.countLabel}</div>}
                    </div>
                  )}
                  <div className="section-actions" style={{ display: "flex", flexDirection: "column", gap: "2px", opacity: 0, transition: "opacity 0.15s" }}>
                    <button onClick={(e) => { e.stopPropagation(); props.onMoveUp(section.id); }} style={{ padding: "1px 4px", background: "transparent", border: `1px solid ${C.border}`, color: C.textMuted, fontSize: "8px", cursor: "pointer", fontFamily: C.fontMono, lineHeight: 1 }} title="Monter">▲</button>
                    <button onClick={(e) => { e.stopPropagation(); props.onMoveDown(section.id); }} style={{ padding: "1px 4px", background: "transparent", border: `1px solid ${C.border}`, color: C.textMuted, fontSize: "8px", cursor: "pointer", fontFamily: C.fontMono, lineHeight: 1 }} title="Descendre">▼</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ padding: "16px 20px 0" }}>
          <button onClick={props.onAddSection} style={{ width: "100%", padding: "10px 12px", background: "transparent", border: `1px dashed ${C.border}`, color: C.textBody, fontFamily: C.fontSans, fontSize: "12px", fontWeight: 500, cursor: "pointer", transition: "all 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.accent; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textBody; }}>
            + Ajouter une section
          </button>
          <div style={{ marginTop: "6px", fontSize: "10px", color: C.textMuted, fontFamily: C.fontMono, textAlign: "center" }}>
            Illimité · recherches sauvegardées
          </div>
        </div>

        {hiddenAvailable.length > 0 && (
          <div style={{ padding: "24px 20px 0", borderTop: `1px solid ${C.border}`, marginTop: "24px" }}>
            <button onClick={() => setShowHidden(!showHidden)} style={{ width: "100%", padding: "8px 0", background: "transparent", border: "none", color: C.textMuted, fontFamily: C.fontMono, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Masquées</span>
              <span>{hiddenAvailable.length}</span>
            </button>
            {showHidden && (
              <div style={{ marginTop: "8px" }}>
                {hiddenAvailable.map((s) => (
                  <button key={s.id} onClick={() => props.onShowHidden(s.id)} style={{ width: "100%", padding: "6px 0", background: "transparent", border: "none", color: C.textMuted, fontFamily: C.fontSans, fontSize: "12px", cursor: "pointer", textAlign: "left" }}>
                    + {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <style>{`
          .console-section .section-actions { opacity: 0; }
          .console-section:hover .section-actions { opacity: 1; }

          /* Mobile: sidebar becomes a drawer */
          @media (max-width: 767px) {
            .console-sidebar {
              position: fixed !important;
              top: 49px;
              left: 0;
              bottom: 0;
              width: 280px;
              max-width: 85vw;
              z-index: 50;
              transform: translateX(-100%);
              transition: transform 0.25s ease;
              overflow-y: auto;
              box-shadow: 4px 0 24px rgba(0,0,0,0.08);
            }
            .console-sidebar[data-open="true"] {
              transform: translateX(0);
            }
          }
        `}</style>
      </aside>
    </>
  );
}

function Content({ section, tier }: { section: Section; tier: AccountType }) {
  if (section.id === "meteo") return <MeteoSection tier={tier} />;
  return (
    <main style={{ padding: "32px 24px", maxWidth: "100%", overflowX: "hidden" }}>
      <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "12px" }}>
        Section · {section.id}
      </div>
      <h1 style={{ fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 700, color: C.text, letterSpacing: "-0.03em", margin: "0 0 16px" }}>
        {section.label}
      </h1>
      <p style={{ fontSize: "16px", color: C.textBody, lineHeight: 1.6, maxWidth: "640px", margin: "0 0 32px" }}>
        {section.description}
      </p>
      <div style={{ padding: "48px 32px", border: `1px dashed ${C.border}`, borderRadius: "8px", textAlign: "center", color: C.textMuted, fontFamily: C.fontMono, fontSize: "12px" }}>
        Section en cours de construction.
        <br />
        <span style={{ color: C.accent, marginTop: "8px", display: "inline-block" }}>
          {section.label} sera disponible dans la prochaine itération.
        </span>
      </div>
    </main>
  );
}

function MeteoSection({ tier }: { tier: AccountType }) {
  const meteo = {
    score: 67,
    trend: "up" as "up" | "down" | "stable",
    trendValue: "+2 pts vs semaine dernière",
    sky: "Partiellement nuageux",
    skyDescription: "Sentiment globalement positif, avec quelques zones d'attention.",
    breakdown: { positive: 58, neutral: 27, negative: 15 },
    sources: [
      { name: "Hespress", articles: 142, sentiment: "positif" },
      { name: "Le360", articles: 89, sentiment: "neutre" },
      { name: "Medias24", articles: 67, sentiment: "positif" },
      { name: "TelQuel", articles: 45, sentiment: "négatif" },
    ],
    todaySignals: [
      { time: "07:00", source: "Hespress", title: "Article positif sur votre dernier communiqué", weight: "fort" },
      { time: "09:32", source: "Twitter/X", title: "Mention d'un influenceur (12K followers)", weight: "moyen" },
      { time: "14:15", source: "TelQuel", title: "Question sur votre gouvernance ESG", weight: "faible" },
    ],
  };

  const skyColor = meteo.score >= 70 ? C.cta : meteo.score >= 50 ? C.warning : C.danger;

  return (
    <main style={{ padding: "32px 24px", maxWidth: "100%", overflowX: "hidden" }}>
      <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "12px" }}>
        Section 01 · Météo
      </div>
      <h1 style={{ fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 700, color: C.text, letterSpacing: "-0.03em", margin: "0 0 8px" }}>
        Bulletin du jour
      </h1>
      <p style={{ fontSize: "15px", color: C.textMuted, fontFamily: C.fontMono, marginBottom: "32px" }}>
        {new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
      </p>

      <div style={{ padding: "32px 24px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "8px", marginBottom: "32px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: "24px", alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: C.fontMono, fontSize: "clamp(48px, 10vw, 72px)", fontWeight: 700, color: skyColor, lineHeight: 1, letterSpacing: "-0.04em" }}>
            {meteo.score}
          </div>
          <div style={{ fontSize: "12px", color: C.textMuted, fontFamily: C.fontMono, marginTop: "8px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            / 100
          </div>
        </div>
        <div>
          <div style={{ fontSize: "20px", fontWeight: 600, color: C.text, marginBottom: "8px", letterSpacing: "-0.01em" }}>
            {meteo.sky}
          </div>
          <div style={{ fontSize: "14px", color: C.textBody, lineHeight: 1.5, marginBottom: "12px" }}>
            {meteo.skyDescription}
          </div>
          <div style={{ fontSize: "12px", fontFamily: C.fontMono, color: meteo.trend === "up" ? C.cta : meteo.trend === "down" ? C.danger : C.textMuted }}>
            {meteo.trend === "up" ? "↑" : meteo.trend === "down" ? "↓" : "→"} {meteo.trendValue}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "32px" }}>
        <div style={{ fontSize: "11px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "12px" }}>
          Répartition
        </div>
        <div style={{ display: "flex", height: "8px", borderRadius: "4px", overflow: "hidden", background: C.bgSubtle, marginBottom: "12px" }}>
          <div style={{ width: `${meteo.breakdown.positive}%`, background: C.cta }} />
          <div style={{ width: `${meteo.breakdown.neutral}%`, background: C.border }} />
          <div style={{ width: `${meteo.breakdown.negative}%`, background: C.danger }} />
        </div>
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", fontSize: "12px", fontFamily: C.fontMono }}>
          <span style={{ color: C.cta }}>
            <span style={{ fontWeight: 700 }}>{meteo.breakdown.positive}%</span>
            <span style={{ color: C.textMuted, marginLeft: "6px" }}>positif</span>
          </span>
          <span style={{ color: C.textBody }}>
            <span style={{ fontWeight: 700 }}>{meteo.breakdown.neutral}%</span>
            <span style={{ color: C.textMuted, marginLeft: "6px" }}>neutre</span>
          </span>
          <span style={{ color: C.danger }}>
            <span style={{ fontWeight: 700 }}>{meteo.breakdown.negative}%</span>
            <span style={{ color: C.textMuted, marginLeft: "6px" }}>négatif</span>
          </span>
        </div>
      </div>

      <div style={{ marginBottom: "32px" }}>
        <div style={{ fontSize: "11px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "12px" }}>
          Signaux du jour
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {meteo.todaySignals.map((signal, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "12px 16px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "6px", flexWrap: "wrap" }}>
              <span style={{ fontFamily: C.fontMono, fontSize: "12px", color: C.textMuted, minWidth: "48px" }}>{signal.time}</span>
              <span style={{ fontSize: "11px", fontFamily: C.fontMono, color: C.accent, minWidth: "80px" }}>{signal.source}</span>
              <span style={{ fontSize: "14px", color: C.text, flex: 1, minWidth: "200px" }}>{signal.title}</span>
              <span style={{ fontSize: "10px", fontFamily: C.fontMono, padding: "2px 8px", borderRadius: "2px", background: signal.weight === "fort" ? `${C.danger}15` : signal.weight === "moyen" ? `${C.warning}15` : `${C.textMuted}15`, color: signal.weight === "fort" ? C.danger : signal.weight === "moyen" ? C.warning : C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {signal.weight}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: "11px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "12px" }}>
          Sources principales
        </div>
        <div style={{ border: `1px solid ${C.border}`, borderRadius: "6px", overflow: "hidden" }}>
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: "400px" }}>
              <thead>
                <tr style={{ background: C.bgSubtle }}>
                  <th style={{ padding: "10px 16px", textAlign: "left", fontFamily: C.fontMono, fontSize: "11px", color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>Source</th>
                  <th style={{ padding: "10px 16px", textAlign: "right", fontFamily: C.fontMono, fontSize: "11px", color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>Articles</th>
                  <th style={{ padding: "10px 16px", textAlign: "left", fontFamily: C.fontMono, fontSize: "11px", color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>Sentiment</th>
                </tr>
              </thead>
              <tbody>
                {meteo.sources.map((src, i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${C.border}` }}>
                    <td style={{ padding: "10px 16px", color: C.text, fontWeight: 500 }}>{src.name}</td>
                    <td style={{ padding: "10px 16px", textAlign: "right", fontFamily: C.fontMono, color: C.textBody }}>{src.articles}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{ fontSize: "11px", fontFamily: C.fontMono, padding: "2px 8px", borderRadius: "2px", background: src.sentiment === "positif" ? `${C.cta}15` : src.sentiment === "négatif" ? `${C.danger}15` : `${C.textMuted}15`, color: src.sentiment === "positif" ? C.cta : src.sentiment === "négatif" ? C.danger : C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        {src.sentiment}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {tier === "decouverte" && (
        <div style={{ marginTop: "32px", padding: "16px 20px", background: C.bgSubtle, border: `1px solid ${C.border}`, borderRadius: "6px", fontSize: "13px", color: C.textBody, lineHeight: 1.5 }}>
          <strong style={{ color: C.text, fontFamily: C.fontMono, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Tier Découverte ·
          </strong>{" "}
          Passez au tier Veille pour suivre vos Voisins (concurrents directs) avec l&apos;Indice de Voisinage.
        </div>
      )}
    </main>
  );
}

function AddSectionModal({
  label, query, onLabelChange, onQueryChange, onSubmit, onClose,
}: {
  label: string; query: string;
  onLabelChange: (v: string) => void;
  onQueryChange: (v: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "32px", maxWidth: "480px", width: "100%" }}>
        <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "8px" }}>
          Nouvelle section
        </div>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: C.text, letterSpacing: "-0.02em", margin: "0 0 24px" }}>
          Recherche sauvegardée
        </h2>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "11px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>
            Nom de la section
          </label>
          <input type="text" value={label} onChange={(e) => onLabelChange(e.target.value)} placeholder="Ex : Mon CEO, Mon produit phare" style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: "4px", fontFamily: C.fontSans, fontSize: "14px", color: C.text, background: C.bg, boxSizing: "border-box" }} autoFocus />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", fontSize: "11px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>
            Recherche
          </label>
          <input type="text" value={query} onChange={(e) => onQueryChange(e.target.value)} placeholder="Ex : Amine Harch El Korane" style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: "4px", fontFamily: C.fontSans, fontSize: "14px", color: C.text, background: C.bg, boxSizing: "border-box" }} />
          <div style={{ marginTop: "6px", fontSize: "11px", color: C.textMuted, fontFamily: C.fontMono }}>
            HarchIQ Signal surveillera cette requête sur 30+ sources.
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "10px 16px", background: "transparent", border: `1px solid ${C.border}`, color: C.textBody, fontFamily: C.fontSans, fontSize: "13px", fontWeight: 500, cursor: "pointer", borderRadius: "4px" }}>
            Annuler
          </button>
          <button onClick={onSubmit} disabled={!label.trim() || !query.trim()} style={{ padding: "10px 16px", background: !label.trim() || !query.trim() ? C.border : C.cta, border: "none", color: "#ffffff", fontFamily: C.fontSans, fontSize: "13px", fontWeight: 600, cursor: !label.trim() || !query.trim() ? "not-allowed" : "pointer", borderRadius: "4px" }}>
            Créer la section
          </button>
        </div>
      </div>
    </div>
  );
}
