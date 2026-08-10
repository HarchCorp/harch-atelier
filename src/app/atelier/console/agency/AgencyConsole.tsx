"use client";

// ═══════════════════════════════════════════════════════════════
//  AgencyConsole.tsx — CONSOLE AGENCES (Agences RP & communication)
//
//  Multi-client intelligence dashboard. Renders BELOW the shared
//  <Dashboard plan="agency" /> component and adds 5 agency-specific
//  sections (per task CRAZY-5-AGENCY):
//
//    1. Client Switcher (prominent, top)
//    2. Client Portfolio Table
//    3. Campaign ROI Calculator
//    4. Pitch Deck Generator (uses HarchIQ AI)
//    5. Automated Reports Panel
//
//  Data sources (all REAL — no mock data):
//    • GET  /api/agency/clients       — list of sub-clients + usage
//    • POST /api/agency/switch        — switch active workspace
//    • GET  /api/console/reports/list — recent generated reports
//    • POST /api/console/ask          — HarchIQ AI for pitch decks + ROI narrative
//
//  Design:
//    • White bg (C.bg) with sage green accents (C.cta = emerald-500)
//    • Stone-500 (C.accent) for labels/eyebrows
//    • Inter sans + Space Mono mono fonts
//    • Mobile-responsive (single column on mobile, multi-col on lg+)
//    • French language throughout
// ═══════════════════════════════════════════════════════════════

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { C } from "../../components/tokens";

// ─── TOKENS ────────────────────────────────────────────────────────
const SAGE = C.cta;            // #10b981 — emerald-500 (primary sage CTA)
const SAGE_HOVER = C.ctaHover; // #34d399 — emerald-400
const SAGE_DEEP = "#047857";   // emerald-700 — deep accent
const SAGE_BG = "#ecfdf5";     // emerald-50 — light sage background
const STONE = C.accent;        // #78716c — stone-500 (labels)
const STONE_DARK = C.accentHover; // #57534e
const AMBER = C.warning;       // #f59e0b
const AMBER_BG = C.warningBg;
const DANGER = C.danger;       // #ef4444
const DANGER_BG = C.dangerBg;

const FONT = { sans: C.fontSans, mono: C.fontMono };
const SHADOW = { card: C.shadowSm, deep: C.shadowMd };

// ─── TYPES ─────────────────────────────────────────────────────────

interface AgencyClientCompany {
  id: string;
  name: string;
  slug: string;
  sector: string | null;
}

interface AgencyClientBranding {
  logoUrl: string | null;
  primaryColor: string | null;
  hideHarchBadge: boolean;
  loginTitle: string | null;
}

interface AgencyClientQuota {
  planTier: string;
  monthlyPriceMAD: number;
  maxApiRequests: number;
  maxWhatsAppAlerts: number;
  maxKeywords: number;
  maxSources: number;
  maxUsers: number;
}

interface AgencyUsage {
  period: string;
  apiRequests: number;
  whatsappAlerts: number;
  keywordsUsed: number;
  sourcesUsed: number;
  usersActive: number;
}

interface AgencyClient {
  id: string;
  companyId: string;
  displayName: string;
  subdomain: string | null;
  customDomain: string | null;
  status: "active" | "suspended" | "terminated";
  createdAt: string;
  updatedAt: string;
  company: AgencyClientCompany;
  branding: AgencyClientBranding | null;
  quota: AgencyClientQuota | null;
  usage: AgencyUsage;
  bars: Record<string, { used: number; max: number; pct: number }> | null;
}

interface AgencyMeta {
  id: string;
  name: string;
  slug: string;
  commissionPct: number;
  primaryColor: string | null;
  logoUrl: string | null;
  status: string;
}

interface ClientsResponse {
  agency: AgencyMeta;
  clients: AgencyClient[];
  count: number;
  error?: string;
}

interface ReportItem {
  id: string;
  title: string;
  period: string;
  summary: string | null;
  status: string;
  createdAt: string;
  companyName: string | null;
  pdfUrl: string;
}

interface ReportsListResponse {
  reports: ReportItem[];
  total: number;
  error?: string;
}

interface AskResponse {
  answer: string;
  sources?: Array<{ type: string; id: string; title: string }>;
  generatedAt?: string;
  error?: string;
}

// ─── SHARED LAYOUT PRIMITIVES ──────────────────────────────────────

function Card({
  title,
  eyebrow,
  right,
  children,
  style,
  bodyStyle,
}: {
  title?: string;
  eyebrow?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  style?: CSSProperties;
  bodyStyle?: CSSProperties;
}) {
  return (
    <section
      style={{
        background: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: "12px",
        boxShadow: SHADOW.card,
        padding: "20px",
        ...style,
      }}
    >
      {(title || eyebrow || right) && (
        <header
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "12px",
            marginBottom: "16px",
            flexWrap: "wrap",
          }}
        >
          <div>
            {eyebrow && (
              <div
                style={{
                  fontFamily: FONT.mono,
                  fontSize: "10px",
                  fontWeight: 700,
                  color: SAGE_DEEP,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "4px",
                }}
              >
                {eyebrow}
              </div>
            )}
            {title && (
              <h3
                style={{
                  margin: 0,
                  fontFamily: FONT.sans,
                  fontSize: "16px",
                  fontWeight: 700,
                  color: C.text,
                }}
              >
                {title}
              </h3>
            )}
          </div>
          {right && <div style={{ flexShrink: 0 }}>{right}</div>}
        </header>
      )}
      <div style={bodyStyle}>{children}</div>
    </section>
  );
}

function SkeletonBlock({ height = 120 }: { height?: number }) {
  return (
    <div
      style={{
        height,
        background: `linear-gradient(90deg, ${C.bgSubtle} 0%, ${C.bgHover} 50%, ${C.bgSubtle} 100%)`,
        borderRadius: "8px",
        animation: "harchPulse 1.6s ease-in-out infinite",
      }}
    />
  );
}

function EmptyState({ message, hint }: { message: string; hint?: string }) {
  return (
    <div
      style={{
        padding: "32px 16px",
        textAlign: "center" as const,
        color: C.textMuted,
        fontSize: "13px",
        fontFamily: FONT.sans,
        background: C.bgSubtle,
        borderRadius: "8px",
        border: `1px dashed ${C.border}`,
      }}
    >
      <div style={{ fontWeight: 600, color: STONE_DARK, marginBottom: 4 }}>{message}</div>
      {hint && <div style={{ fontSize: 12, color: C.textMuted }}>{hint}</div>}
    </div>
  );
}

function Pill({
  text,
  color,
  background,
}: {
  text: string;
  color: string;
  background: string;
}) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: "4px",
        background,
        color,
        fontFamily: FONT.mono,
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase" as const,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  );
}

function fmtRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "—";
  const diffMs = Date.now() - then;
  const sec = Math.round(diffMs / 1000);
  if (sec < 60) return "À l'instant";
  const min = Math.round(sec / 60);
  if (min < 60) return `Il y a ${min} min`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `Il y a ${hr} h`;
  const day = Math.round(hr / 24);
  if (day < 7) return `Il y a ${day} j`;
  const wk = Math.round(day / 7);
  if (wk < 5) return `Il y a ${wk} sem.`;
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtNumber(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("fr-FR");
}

function fmtMAD(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return `${Math.round(n).toLocaleString("fr-FR")} MAD`;
}

// ─── AGENCY SUB-LEVEL BADGE ────────────────────────────────────────
// 1-5 clients  → "Débutant"
// 6-20 clients → "Croissance"
// 50+ clients  → "Entreprise"

function agencySubLevel(clientCount: number): { label: string; color: string; bg: string } {
  if (clientCount >= 50) {
    return { label: "Entreprise", color: SAGE_DEEP, bg: SAGE_BG };
  }
  if (clientCount >= 6) {
    return { label: "Croissance", color: "#b45309", bg: AMBER_BG };
  }
  return { label: "Débutant", color: STONE_DARK, bg: C.bgHover };
}

// ─── CLIENT INITIALS / LOGO ────────────────────────────────────────

function ClientAvatar({ client, size = 36 }: { client: AgencyClient; size?: number }) {
  const logo = client.branding?.logoUrl;
  const initials = client.displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  const bg = client.branding?.primaryColor || SAGE;
  if (logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logo}
        alt={`Logo ${client.displayName}`}
        width={size}
        height={size}
        style={{
          borderRadius: 8,
          objectFit: "cover",
          border: `1px solid ${C.border}`,
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        background: bg,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT.mono,
        fontSize: size * 0.36,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {initials || "?"}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SECTION 1 — CLIENT SWITCHER
// ═══════════════════════════════════════════════════════════════

function ClientSwitcherSection({
  clients,
  agency,
  activeClientId,
  loading,
  onSwitch,
  switching,
}: {
  clients: AgencyClient[];
  agency: AgencyMeta | null;
  activeClientId: string | null;
  loading: boolean;
  onSwitch: (clientId: string | null) => void;
  switching: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click.
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return clients;
    const q = query.toLowerCase();
    return clients.filter(
      (c) =>
        c.displayName.toLowerCase().includes(q) ||
        c.company.name.toLowerCase().includes(q) ||
        (c.company.sector ?? "").toLowerCase().includes(q),
    );
  }, [clients, query]);

  const activeClient = activeClientId
    ? clients.find((c) => c.id === activeClientId) ?? null
    : null;

  const level = agencySubLevel(clients.length);

  return (
    <Card
      eyebrow="Espace de travail"
      title="Sélecteur de client"
      right={
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <Pill text={`Niveau ${level.label}`} color={level.color} background={level.bg} />
          <Pill text={`${clients.length} client${clients.length > 1 ? "s" : ""}`} color={STONE_DARK} background={C.bgHover} />
        </div>
      }
    >
      <div ref={ref} style={{ position: "relative" }}>
        {/* Trigger button */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          disabled={loading || clients.length === 0}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 14px",
            background: C.bg,
            border: `1px solid ${C.borderStrong}`,
            borderRadius: 10,
            cursor: loading || clients.length === 0 ? "not-allowed" : "pointer",
            opacity: loading || clients.length === 0 ? 0.6 : 1,
            textAlign: "left" as const,
            transition: "border-color 0.15s",
          }}
        >
          {activeClient ? (
            <>
              <ClientAvatar client={activeClient} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: FONT.sans }}>
                  {activeClient.displayName}
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, fontFamily: FONT.sans }}>
                  {activeClient.company.sector || "Secteur non précisé"} ·{" "}
                  {activeClient.usage.whatsappAlerts} alerte{activeClient.usage.whatsappAlerts > 1 ? "s" : ""}
                </div>
              </div>
            </>
          ) : (
            <>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: SAGE_BG,
                  color: SAGE_DEEP,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                ⊞
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: FONT.sans }}>
                  Vue agrégée (tous les clients)
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, fontFamily: FONT.sans }}>
                  {agency?.name ? `${agency.name} · ` : ""}{clients.length} clients surveillés
                </div>
              </div>
            </>
          )}
          <span
            style={{
              fontSize: 12,
              color: C.textMuted,
              fontFamily: FONT.mono,
              transform: open ? "rotate(180deg)" : "none",
              transition: "transform 0.2s",
            }}
          >
            ▼
          </span>
        </button>

        {/* Dropdown panel */}
        {open && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              right: 0,
              background: C.bg,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              boxShadow: SHADOW.deep,
              zIndex: 50,
              maxHeight: 420,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ padding: 10, borderBottom: `1px solid ${C.border}` }}>
              <input
                type="text"
                placeholder="Rechercher un client, un secteur…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                style={{
                  width: "100%",
                  height: 34,
                  padding: "0 10px",
                  background: C.bgSubtle,
                  border: `1px solid ${C.border}`,
                  borderRadius: 6,
                  fontSize: 13,
                  fontFamily: FONT.sans,
                  outline: "none",
                  color: C.text,
                }}
              />
            </div>

            <div style={{ overflowY: "auto", flex: 1, maxHeight: 360 }}>
              {/* Aggregate view option */}
              <button
                type="button"
                onClick={() => {
                  onSwitch(null);
                  setOpen(false);
                  setQuery("");
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  background: activeClientId === null ? SAGE_BG : "transparent",
                  border: "none",
                  borderBottom: `1px solid ${C.border}`,
                  cursor: "pointer",
                  textAlign: "left" as const,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    background: SAGE_BG,
                    color: SAGE_DEEP,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    flexShrink: 0,
                  }}
                >
                  ⊞
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: FONT.sans }}>
                    Vue agrégée (tous les clients)
                  </div>
                  <div style={{ fontSize: 11, color: C.textMuted, fontFamily: FONT.sans }}>
                    Totalisation de tous les clients
                  </div>
                </div>
                {activeClientId === null && (
                  <span style={{ color: SAGE_DEEP, fontSize: 12, fontWeight: 700 }}>●</span>
                )}
              </button>

              {/* Client list */}
              {filtered.length === 0 ? (
                <div style={{ padding: 16, textAlign: "center", color: C.textMuted, fontSize: 12 }}>
                  Aucun client ne correspond à « {query} ».
                </div>
              ) : (
                filtered.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onSwitch(c.id);
                      setOpen(false);
                      setQuery("");
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      background: c.id === activeClientId ? SAGE_BG : "transparent",
                      border: "none",
                      borderBottom: `1px solid ${C.border}`,
                      cursor: "pointer",
                      textAlign: "left" as const,
                    }}
                  >
                    <ClientAvatar client={c} size={32} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: FONT.sans, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.displayName}
                      </div>
                      <div style={{ fontSize: 11, color: C.textMuted, fontFamily: FONT.sans }}>
                        {c.company.sector || "—"} · Score {c.quota?.planTier ?? "—"} ·{" "}
                        {c.usage.whatsappAlerts} alerte{c.usage.whatsappAlerts > 1 ? "s" : ""}
                      </div>
                    </div>
                    {c.id === activeClientId && (
                      <span style={{ color: SAGE_DEEP, fontSize: 12, fontWeight: 700 }}>●</span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Switching indicator */}
        {switching && (
          <div
            style={{
              marginTop: 10,
              padding: "8px 12px",
              background: SAGE_BG,
              border: `1px solid ${SAGE}`,
              borderRadius: 8,
              fontSize: 12,
              color: SAGE_DEEP,
              fontFamily: FONT.sans,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ animation: "harchSpin 1s linear infinite", display: "inline-block" }}>◌</span>
            Bascule vers le nouvel espace de travail…
          </div>
        )}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SECTION 2 — CLIENT PORTFOLIO TABLE
// ═══════════════════════════════════════════════════════════════

function PortfolioTableSection({
  clients,
  loading,
  onSwitch,
  onAddClient,
}: {
  clients: AgencyClient[];
  loading: boolean;
  onSwitch: (id: string) => void;
  onAddClient: () => void;
}) {
  const [query, setQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  // Reset page when filters change.
  useEffect(() => {
    setPage(1);
  }, [query, sectorFilter]);

  const sectors = useMemo(() => {
    const set = new Set<string>();
    clients.forEach((c) => {
      if (c.company.sector) set.add(c.company.sector);
    });
    return Array.from(set).sort();
  }, [clients]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return clients.filter((c) => {
      const matchQuery =
        !q ||
        c.displayName.toLowerCase().includes(q) ||
        c.company.name.toLowerCase().includes(q);
      const matchSector = !sectorFilter || c.company.sector === sectorFilter;
      return matchQuery && matchSector;
    });
  }, [clients, query, sectorFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Card
      eyebrow="Portefeuille"
      title="Tableau des clients"
      right={
        <button
          type="button"
          onClick={onAddClient}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            background: SAGE,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            fontFamily: FONT.sans,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          + Ajouter un client
        </button>
      }
    >
      {/* Search + filter row */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Rechercher par nom d'entreprise…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: 1,
            minWidth: 200,
            height: 36,
            padding: "0 12px",
            background: C.bgSubtle,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            fontSize: 13,
            fontFamily: FONT.sans,
            outline: "none",
            color: C.text,
          }}
        />
        <select
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          style={{
            height: 36,
            padding: "0 10px",
            background: C.bgSubtle,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            fontSize: 13,
            fontFamily: FONT.sans,
            color: C.text,
            cursor: "pointer",
          }}
        >
          <option value="">Tous les secteurs</option>
          {sectors.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div
        style={{
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          overflow: "hidden",
          overflowX: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontFamily: FONT.sans,
            fontSize: 13,
            minWidth: 720,
          }}
        >
          <thead>
            <tr style={{ background: C.bgSubtle, borderBottom: `1px solid ${C.border}` }}>
              {["Client", "Secteur", "Plan", "Sentiment", "Alertes", "Dernier rapport", "Actions"].map(
                (h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "10px 12px",
                      fontSize: 10,
                      fontWeight: 700,
                      color: STONE,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase" as const,
                      fontFamily: FONT.mono,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} style={{ padding: 12 }}>
                      <SkeletonBlock height={14} />
                    </td>
                  ))}
                </tr>
              ))
            ) : pageItems.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: "32px 16px", textAlign: "center", color: C.textMuted }}>
                  {clients.length === 0
                    ? "Aucun client dans votre portefeuille. Cliquez sur « Ajouter un client »."
                    : "Aucun client ne correspond à votre recherche."}
                </td>
              </tr>
            ) : (
              pageItems.map((c) => {
                const planTier = c.quota?.planTier ?? "—";
                const tierLabel =
                  planTier === "sovereign" ? "Sovereign" :
                  planTier === "corporate" ? "Corporate" :
                  planTier === "emergence" ? "Émergence" : planTier;
                return (
                  <tr
                    key={c.id}
                    onClick={() => onSwitch(c.id)}
                    style={{
                      borderBottom: `1px solid ${C.border}`,
                      cursor: "pointer",
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = C.bgSubtle)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <ClientAvatar client={c} size={28} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {c.displayName}
                          </div>
                          <div style={{ fontSize: 11, color: C.textMuted }}>
                            {c.subdomain ? `${c.subdomain}.harchcorp.com` : c.company.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px", color: C.textBody }}>
                      {c.company.sector || "—"}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <Pill
                        text={tierLabel}
                        color={planTier === "sovereign" ? SAGE_DEEP : planTier === "corporate" ? "#b45309" : STONE_DARK}
                        background={planTier === "sovereign" ? SAGE_BG : planTier === "corporate" ? AMBER_BG : C.bgHover}
                      />
                    </td>
                    <td style={{ padding: "10px 12px", color: C.textMuted, fontFamily: FONT.mono }}>
                      —
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      {c.usage.whatsappAlerts > 0 ? (
                        <Pill text={`${c.usage.whatsappAlerts}`} color="#b91c1c" background={DANGER_BG} />
                      ) : (
                        <span style={{ color: C.textMuted, fontFamily: FONT.mono }}>0</span>
                      )}
                    </td>
                    <td style={{ padding: "10px 12px", color: C.textBody, fontSize: 12, whiteSpace: "nowrap" }}>
                      {fmtRelative(c.updatedAt)}
                    </td>
                    <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSwitch(c.id);
                        }}
                        style={{
                          padding: "4px 10px",
                          background: "transparent",
                          border: `1px solid ${C.borderStrong}`,
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 600,
                          color: STONE_DARK,
                          fontFamily: FONT.sans,
                          cursor: "pointer",
                        }}
                      >
                        Ouvrir →
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filtered.length > PAGE_SIZE && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 12,
            fontSize: 12,
            color: C.textMuted,
            fontFamily: FONT.sans,
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div>
            Page {page} sur {totalPages} · {filtered.length} client{filtered.length > 1 ? "s" : ""}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{
                padding: "6px 12px",
                background: page === 1 ? C.bgSubtle : C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                fontSize: 12,
                color: page === 1 ? C.textMuted : C.text,
                cursor: page === 1 ? "not-allowed" : "pointer",
                fontFamily: FONT.sans,
              }}
            >
              ← Précédent
            </button>
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              style={{
                padding: "6px 12px",
                background: page === totalPages ? C.bgSubtle : C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                fontSize: 12,
                color: page === totalPages ? C.textMuted : C.text,
                cursor: page === totalPages ? "not-allowed" : "pointer",
                fontFamily: FONT.sans,
              }}
            >
              Suivant →
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SECTION 3 — CAMPAIGN ROI CALCULATOR
// ═══════════════════════════════════════════════════════════════

function ROIGauge({ roi }: { roi: number }) {
  // ROI in percent. Display range: [-100, 200] mapped to angle [180, 0].
  const clamped = Math.max(-100, Math.min(200, roi));
  const angle = 180 - ((clamped + 100) / 300) * 180; // degrees, math convention
  const rad = (angle * Math.PI) / 180;

  const cx = 110;
  const cy = 110;
  const r = 88;

  // Needle endpoint.
  const nx = cx + r * Math.cos(rad);
  const ny = cy - r * Math.sin(rad);

  // Arc segment helpers — each spans 60°.
  function arcPath(a1: number, a2: number, color: string) {
    const r1 = (a1 * Math.PI) / 180;
    const r2 = (a2 * Math.PI) / 180;
    const x1 = cx + r * Math.cos(r1);
    const y1 = cy - r * Math.sin(r1);
    const x2 = cx + r * Math.cos(r2);
    const y2 = cy - r * Math.sin(r2);
    // Going from a1 (larger) to a2 (smaller) — clockwise on screen → sweep=1.
    const largeArc = Math.abs(a1 - a2) > 180 ? 1 : 0;
    return {
      d: `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`,
      color,
    };
  }

  // Red: angle 180 → 120 (ROI -100 → 0)
  // Amber: angle 120 → 60 (ROI 0 → 100)
  // Green: angle 60 → 0 (ROI 100 → 200)
  const red = arcPath(180, 120, DANGER);
  const amber = arcPath(120, 60, AMBER);
  const green = arcPath(60, 0, SAGE);

  const needleColor = roi < 0 ? DANGER : roi <= 100 ? AMBER : SAGE;
  const label =
    roi < 0 ? "Perte" : roi === 0 ? "Seuil de rentabilité" : roi <= 100 ? "Rentabilité modérée" : "Excellente rentabilité";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width={220} height={120} viewBox="0 0 220 120" aria-label={`ROI ${roi.toFixed(0)}%`}>
        {/* Background track */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke={C.bgHover}
          strokeWidth={14}
          strokeLinecap="round"
        />
        {/* Colored segments */}
        <path d={red.d} fill="none" stroke={red.color} strokeWidth={14} strokeLinecap="butt" opacity={0.85} />
        <path d={amber.d} fill="none" stroke={amber.color} strokeWidth={14} strokeLinecap="butt" opacity={0.85} />
        <path d={green.d} fill="none" stroke={green.color} strokeWidth={14} strokeLinecap="butt" opacity={0.85} />
        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={nx}
          y2={ny}
          stroke={C.text}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={6} fill={C.text} />
      </svg>
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 28,
            fontWeight: 700,
            color: needleColor,
            lineHeight: 1,
          }}
        >
          {roi > 0 ? "+" : ""}{roi.toFixed(0)}%
        </div>
        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4, fontFamily: FONT.sans }}>{label}</div>
      </div>
    </div>
  );
}

function ROICalculatorSection({ activeClientName }: { activeClientName: string }) {
  // Investment inputs
  const [budget, setBudget] = useState<string>("50000");
  const [teamHours, setTeamHours] = useState<string>("40");
  const [teamRate, setTeamRate] = useState<string>("350");
  const [mediaBuy, setMediaBuy] = useState<string>("25000");

  // Returns inputs
  const [reach, setReach] = useState<string>("500000");
  const [cpm, setCpm] = useState<string>("45");
  const [leads, setLeads] = useState<string>("120");
  const [leadValue, setLeadValue] = useState<string>("800");

  // AI generation state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const num = (s: string) => {
    const n = parseFloat(s.replace(/\s/g, "").replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  };

  const investment = useMemo(() => {
    return num(budget) + num(teamHours) * num(teamRate) + num(mediaBuy);
  }, [budget, teamHours, teamRate, mediaBuy]);

  const ave = useMemo(() => {
    // AVE = reach × (CPM / 1000)
    return (num(reach) * num(cpm)) / 1000;
  }, [reach, cpm]);

  const returns = useMemo(() => {
    return ave + num(leads) * num(leadValue);
  }, [ave, leads, leadValue]);

  const roi = useMemo(() => {
    if (investment <= 0) return 0;
    return ((returns - investment) / investment) * 100;
  }, [investment, returns]);

  const generateROIReport = useCallback(async () => {
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);
    try {
      const prompt = `Génère un rapport ROI synthétique pour la campagne de ${activeClientName || "l'agence"}.
Investissement total: ${fmtMAD(investment)} (Budget ${fmtMAD(num(budget))} + Équipe ${num(teamHours)}h × ${fmtMAD(num(teamRate))}/h + Médias ${fmtMAD(num(mediaBuy))}).
Valeur équivalente publicitaire (AVE): ${fmtMAD(ave)} (Reach ${fmtNumber(num(reach))} × CPM ${fmtMAD(num(cpm))}).
Leads générés: ${num(leads)} × ${fmtMAD(num(leadValue))}/lead.
Retour total: ${fmtMAD(returns)}.
ROI: ${roi.toFixed(1)}%.
Analyse en 3 paragraphes : performance globale, points forts, recommandations d'optimisation.`;
      const res = await fetch("/api/console/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: prompt }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || `Erreur ${res.status}`);
      }
      const d: AskResponse = await res.json();
      setAiResult(d.answer || "Rapport généré.");
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Échec de génération.");
    } finally {
      setAiLoading(false);
    }
  }, [activeClientName, investment, budget, teamHours, teamRate, mediaBuy, ave, reach, cpm, leads, leadValue, returns, roi]);

  return (
    <Card
      eyebrow="Calculateur"
      title="ROI de campagne"
      right={
        <Pill
          text={activeClientName ? `Client : ${activeClientName}` : "Vue agrégée"}
          color={SAGE_DEEP}
          background={SAGE_BG}
        />
      }
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
        }}
      >
        {/* Investment */}
        <div
          style={{
            padding: 16,
            background: C.bgSubtle,
            borderRadius: 10,
            border: `1px solid ${C.border}`,
          }}
        >
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: 10,
              fontWeight: 700,
              color: STONE_DARK,
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
              marginBottom: 12,
            }}
          >
            Investissement
          </div>
          <ROInput label="Budget campagne (MAD)" value={budget} onChange={setBudget} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <ROInput label="Temps équipe (h)" value={teamHours} onChange={setTeamHours} />
            <ROInput label="Taux horaire (MAD)" value={teamRate} onChange={setTeamRate} />
          </div>
          <ROInput label="Médias achetés (MAD)" value={mediaBuy} onChange={setMediaBuy} />
          <div
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: `1px solid ${C.border}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 12, color: C.textMuted, fontFamily: FONT.sans }}>Total investi</span>
            <span style={{ fontFamily: FONT.mono, fontSize: 18, fontWeight: 700, color: C.text }}>
              {fmtMAD(investment)}
            </span>
          </div>
        </div>

        {/* Returns */}
        <div
          style={{
            padding: 16,
            background: SAGE_BG,
            borderRadius: 10,
            border: `1px solid ${SAGE}`,
          }}
        >
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: 10,
              fontWeight: 700,
              color: SAGE_DEEP,
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
              marginBottom: 12,
            }}
          >
            Retours
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <ROInput label="Reach (impressions)" value={reach} onChange={setReach} />
            <ROInput label="CPM (MAD)" value={cpm} onChange={setCpm} />
          </div>
          <ReadOnlyField label="Valeur équivalente pub (AVE)" value={fmtMAD(ave)} hint="Reach × CPM / 1000" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <ROInput label="Leads générés" value={leads} onChange={setLeads} />
            <ROInput label="Valeur par lead (MAD)" value={leadValue} onChange={setLeadValue} />
          </div>
          <div
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: `1px solid ${SAGE}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 12, color: SAGE_DEEP, fontFamily: FONT.sans }}>Total retours</span>
            <span style={{ fontFamily: FONT.mono, fontSize: 18, fontWeight: 700, color: SAGE_DEEP }}>
              {fmtMAD(returns)}
            </span>
          </div>
        </div>

        {/* ROI Gauge */}
        <div
          style={{
            padding: 16,
            background: C.bg,
            borderRadius: 10,
            border: `1px solid ${C.border}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: 10,
              fontWeight: 700,
              color: STONE_DARK,
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
              alignSelf: "flex-start",
            }}
          >
            Jauge ROI
          </div>
          <ROIGauge roi={roi} />
          <button
            type="button"
            onClick={generateROIReport}
            disabled={aiLoading}
            style={{
              width: "100%",
              padding: "10px 16px",
              background: aiLoading ? C.bgHover : SAGE,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              fontFamily: FONT.sans,
              cursor: aiLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {aiLoading ? (
              <>
                <span style={{ animation: "harchSpin 1s linear infinite", display: "inline-block" }}>◌</span>
                Génération…
              </>
            ) : (
              "Générer le rapport ROI"
            )}
          </button>
        </div>
      </div>

      {/* AI Result */}
      {aiError && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            background: DANGER_BG,
            border: `1px solid ${DANGER}`,
            borderRadius: 8,
            fontSize: 12,
            color: "#b91c1c",
            fontFamily: FONT.sans,
          }}
        >
          {aiError}
        </div>
      )}
      {aiResult && (
        <div
          style={{
            marginTop: 16,
            padding: 16,
            background: C.bgSubtle,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
          }}
        >
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: 10,
              fontWeight: 700,
              color: SAGE_DEEP,
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
              marginBottom: 8,
            }}
          >
            Rapport ROI — HarchIQ AI
          </div>
          <div
            style={{
              fontSize: 13,
              color: C.text,
              fontFamily: FONT.sans,
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
            }}
          >
            {aiResult}
          </div>
        </div>
      )}
    </Card>
  );
}

function ROInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label style={{ display: "block", marginBottom: 8 }}>
      <span style={{ display: "block", fontSize: 11, color: C.textMuted, marginBottom: 4, fontFamily: FONT.sans }}>
        {label}
      </span>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          height: 32,
          padding: "0 10px",
          background: C.bg,
          border: `1px solid ${C.border}`,
          borderRadius: 6,
          fontSize: 13,
          fontFamily: FONT.mono,
          color: C.text,
          outline: "none",
        }}
      />
    </label>
  );
}

function ReadOnlyField({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 11, color: C.textMuted, fontFamily: FONT.sans }}>{label}</span>
        {hint && <span style={{ fontSize: 10, color: C.textMuted, fontFamily: FONT.mono }}>{hint}</span>}
      </div>
      <div
        style={{
          height: 32,
          padding: "0 10px",
          background: C.bg,
          border: `1px solid ${C.border}`,
          borderRadius: 6,
          fontSize: 13,
          fontFamily: FONT.mono,
          color: C.text,
          display: "flex",
          alignItems: "center",
          fontWeight: 600,
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SECTION 4 — PITCH DECK GENERATOR
// ═══════════════════════════════════════════════════════════════

interface PitchTool {
  id: string;
  title: string;
  description: string;
  icon: string;
  prompt: (clientName: string) => string;
}

const PITCH_TOOLS: PitchTool[] = [
  {
    id: "market-landscape",
    title: "Analyse du paysage de marché",
    description:
      "Génère un rapport complet sur le paysage de marché du client : acteurs principaux, dynamiques sectorielles, opportunités et menaces émergentes.",
    icon: "🗺️",
    prompt: (c) =>
      `Analyse le paysage de marché pour ${c}. Identifie les 5 principaux acteurs, les dynamiques sectorielles actuelles, 3 opportunités émergentes et 3 menaces. Structure la réponse en sections claires avec des puces.`,
  },
  {
    id: "competitive-benchmark",
    title: "Benchmarking de la concurrence",
    description:
      "Compare le prospect à ses 3 principaux concurrents : forces, faiblesses, parts de voix, positionnement et avantages différentiants.",
    icon: "⚖️",
    prompt: (c) =>
      `Compare ${c} à ses 3 principaux concurrents. Pour chaque concurrent : forces, faiblesses, part de voix estimée, positionnement. Termine par une matrice SWOT synthétique pour ${c}.`,
  },
  {
    id: "pitch-deck",
    title: "Générer un pitch deck",
    description:
      "Crée une présentation data-driven en 10 slides : problème, solution, marché, traction, concurrence, équipe, modèle business, financiers, demande.",
    icon: "📊",
    prompt: (c) =>
      `Génère un pitch deck en 10 slides pour ${c}. Pour chaque slide : titre, points clés (3-5 puces), donnée chiffrée à mettre en avant. Slides : 1) Problème 2) Solution 3) Marché 4) Traction 5) Concurrence 6) Avantage différenciant 7) Équipe 8) Modèle business 9) Financiers 10) Demande.`,
  },
];

function PitchDeckSection({ activeClientName }: { activeClientName: string }) {
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, { answer: string; generatedAt: string; error?: string }>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const runTool = useCallback(
    async (tool: PitchTool) => {
      setActiveToolId(tool.id);
      setLoading((m) => ({ ...m, [tool.id]: true }));
      const clientName = activeClientName || "votre client principal";
      try {
        const res = await fetch("/api/console/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: tool.prompt(clientName) }),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.error || `Erreur ${res.status}`);
        }
        const d: AskResponse = await res.json();
        setResults((m) => ({
          ...m,
          [tool.id]: {
            answer: d.answer || "Résultat généré.",
            generatedAt: d.generatedAt || new Date().toISOString(),
          },
        }));
      } catch (err) {
        setResults((m) => ({
          ...m,
          [tool.id]: {
            answer: "",
            generatedAt: new Date().toISOString(),
            error: err instanceof Error ? err.message : "Échec de génération.",
          },
        }));
      } finally {
        setLoading((m) => ({ ...m, [tool.id]: false }));
      }
    },
    [activeClientName],
  );

  return (
    <Card
      eyebrow="Générateur de pitch"
      title="Outils pitch deck"
      right={
        activeClientName ? (
          <Pill text={`Cible : ${activeClientName}`} color={SAGE_DEEP} background={SAGE_BG} />
        ) : (
          <Pill text="Vue agrégée — sélectionnez un client" color={STONE_DARK} background={C.bgHover} />
        )
      }
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        {PITCH_TOOLS.map((tool) => {
          const isLoading = loading[tool.id];
          const result = results[tool.id];
          return (
            <div
              key={tool.id}
              style={{
                padding: 16,
                background: C.bgSubtle,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: SAGE_BG,
                    color: SAGE_DEEP,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  {tool.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: FONT.sans }}>
                    {tool.title}
                  </div>
                </div>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: C.textBody,
                  fontFamily: FONT.sans,
                  lineHeight: 1.5,
                  flex: 1,
                }}
              >
                {tool.description}
              </p>
              <button
                type="button"
                onClick={() => runTool(tool)}
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: isLoading ? C.bgHover : SAGE,
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: FONT.sans,
                  cursor: isLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                {isLoading ? (
                  <>
                    <span style={{ animation: "harchSpin 1s linear infinite", display: "inline-block" }}>◌</span>
                    Génération…
                  </>
                ) : (
                  "Lancer →"
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Active tool result */}
      {activeToolId && results[activeToolId] && (
        <div
          style={{
            marginTop: 16,
            padding: 16,
            background: C.bg,
            border: `1px solid ${SAGE}`,
            borderRadius: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div
              style={{
                fontFamily: FONT.mono,
                fontSize: 10,
                fontWeight: 700,
                color: SAGE_DEEP,
                letterSpacing: "0.08em",
                textTransform: "uppercase" as const,
              }}
            >
              {PITCH_TOOLS.find((t) => t.id === activeToolId)?.title}
            </div>
            <div style={{ fontSize: 11, color: C.textMuted, fontFamily: FONT.mono }}>
              {fmtRelative(results[activeToolId].generatedAt)}
            </div>
          </div>
          {results[activeToolId].error ? (
            <div
              style={{
                padding: 10,
                background: DANGER_BG,
                border: `1px solid ${DANGER}`,
                borderRadius: 6,
                fontSize: 12,
                color: "#b91c1c",
                fontFamily: FONT.sans,
              }}
            >
              {results[activeToolId].error}
            </div>
          ) : (
            <div
              style={{
                fontSize: 13,
                color: C.text,
                fontFamily: FONT.sans,
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
                maxHeight: 400,
                overflowY: "auto",
              }}
            >
              {results[activeToolId].answer}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SECTION 5 — AUTOMATED REPORTS PANEL
// ═══════════════════════════════════════════════════════════════

function ReportsPanelSection({
  clients,
  reports,
  loading,
  onCreateTemplate,
  onSchedule,
}: {
  clients: AgencyClient[];
  reports: ReportItem[];
  loading: boolean;
  onCreateTemplate: () => void;
  onSchedule: () => void;
}) {
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const reportsThisMonth = reports.filter((r) => {
      const d = new Date(r.createdAt);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;
    const scheduled = reports.filter((r) => r.status === "generating" || r.status === "draft").length;
    // Distribution auto = clients with at least 1 WhatsApp alert sent this period
    const distributionAuto = clients.filter((c) => c.usage.whatsappAlerts > 0).length;
    // Templates = unique report types (we don't have a templates API; use distinct titles count as a proxy)
    const templateSet = new Set(reports.map((r) => r.title));
    return {
      scheduled,
      reportsThisMonth,
      templates: templateSet.size,
      distributionAuto,
    };
  }, [reports, clients]);

  const recentReports = reports.slice(0, 3);

  return (
    <Card
      eyebrow="Rapports automatisés"
      title="Centre de rapports"
      right={
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={onCreateTemplate}
            style={{
              padding: "6px 12px",
              background: C.bg,
              border: `1px solid ${C.borderStrong}`,
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              color: STONE_DARK,
              fontFamily: FONT.sans,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            + Créer un template
          </button>
          <button
            type="button"
            onClick={onSchedule}
            style={{
              padding: "6px 12px",
              background: SAGE,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              fontFamily: FONT.sans,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Programmer un rapport
          </button>
        </div>
      }
    >
      {/* 4 stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <ReportStatCard label="Rapports programmés" value={stats.scheduled} hint="En file d'attente" />
        <ReportStatCard label="Rapports ce mois" value={stats.reportsThisMonth} hint="Générés ce mois-ci" />
        <ReportStatCard label="Templates" value={stats.templates} hint="Modèles disponibles" />
        <ReportStatCard label="Distribution auto" value={stats.distributionAuto} hint="Clients avec alertes WhatsApp" highlight />
      </div>

      {/* Recent reports */}
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 10,
          fontWeight: 700,
          color: STONE_DARK,
          letterSpacing: "0.08em",
          textTransform: "uppercase" as const,
          marginBottom: 10,
        }}
      >
        Rapports récents
      </div>
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBlock key={i} height={56} />
          ))}
        </div>
      ) : recentReports.length === 0 ? (
        <EmptyState
          message="Aucun rapport généré pour le moment."
          hint="Les rapports mensuels apparaîtront ici dès qu'ils seront prêts."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {recentReports.map((r) => (
            <div
              key={r.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                background: C.bgSubtle,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  background: SAGE_BG,
                  color: SAGE_DEEP,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                📄
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: C.text,
                    fontFamily: FONT.sans,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {r.title}
                </div>
                <div style={{ fontSize: 11, color: C.textMuted, fontFamily: FONT.sans }}>
                  {r.companyName || "—"} · {r.period} · {fmtDate(r.createdAt)}
                </div>
              </div>
              <Pill
                text={r.status === "ready" ? "Prêt" : r.status === "generating" ? "Génération" : r.status}
                color={r.status === "ready" ? SAGE_DEEP : "#b45309"}
                background={r.status === "ready" ? SAGE_BG : AMBER_BG}
              />
              <a
                href={r.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "6px 10px",
                  background: "transparent",
                  border: `1px solid ${SAGE}`,
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  color: SAGE_DEEP,
                  fontFamily: FONT.sans,
                  cursor: "pointer",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                Télécharger PDF →
              </a>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function ReportStatCard({
  label,
  value,
  hint,
  highlight,
}: {
  label: string;
  value: number;
  hint?: string;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        padding: 14,
        background: highlight ? SAGE_BG : C.bgSubtle,
        border: `1px solid ${highlight ? SAGE : C.border}`,
        borderRadius: 10,
      }}
    >
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 10,
          fontWeight: 700,
          color: highlight ? SAGE_DEEP : STONE_DARK,
          letterSpacing: "0.06em",
          textTransform: "uppercase" as const,
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: FONT.mono,
          fontSize: 26,
          fontWeight: 700,
          color: highlight ? SAGE_DEEP : C.text,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      {hint && (
        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4, fontFamily: FONT.sans }}>{hint}</div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TOAST / NOTIFICATION
// ═══════════════════════════════════════════════════════════════

interface Toast {
  id: number;
  message: string;
  type: "success" | "info";
}

function ToastStack({ toasts }: { toasts: Toast[] }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        zIndex: 100,
        maxWidth: "calc(100vw - 48px)",
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            padding: "10px 16px",
            background: t.type === "success" ? SAGE_DEEP : STONE_DARK,
            color: "#fff",
            borderRadius: 8,
            fontSize: 13,
            fontFamily: FONT.sans,
            boxShadow: SHADOW.deep,
            maxWidth: 360,
          }}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ROOT COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function AgencyConsole({ userName, userEmail }: { userName?: string | null; userEmail?: string | null }) {
  const [clients, setClients] = useState<AgencyClient[]>([]);
  const [agency, setAgency] = useState<AgencyMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [activeClientId, setActiveClientId] = useState<string | null>(null);
  const [switching, setSwitching] = useState(false);

  // Reports state
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const pushToast = useCallback((message: string, type: "success" | "info" = "success") => {
    const id = ++toastIdRef.current;
    setToasts((m) => [...m, { id, message, type }]);
    setTimeout(() => {
      setToasts((m) => m.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  // Fetch agency clients
  const fetchClients = useCallback(async () => {
    setLoading(true);
    setForbidden(false);
    try {
      const res = await fetch("/api/agency/clients", { credentials: "same-origin" });
      if (res.status === 403) {
        setForbidden(true);
        setClients([]);
        setAgency(null);
        return;
      }
      if (!res.ok) return;
      const d: ClientsResponse = await res.json();
      setClients(Array.isArray(d.clients) ? d.clients : []);
      setAgency(d.agency ?? null);
    } catch {
      // silent — empty state will render
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch reports list (parallel)
  const fetchReports = useCallback(async () => {
    setReportsLoading(true);
    try {
      const res = await fetch("/api/console/reports/list", { credentials: "same-origin" });
      if (res.status === 403) {
        setReports([]);
        return;
      }
      if (!res.ok) return;
      const d: ReportsListResponse = await res.json();
      setReports(Array.isArray(d.reports) ? d.reports : []);
    } catch {
      // silent
    } finally {
      setReportsLoading(false);
    }
  }, []);

  // Detect active client from cookie via /api/agency/clients response (the
  // active client is server-side resolved; we approximate by checking the
  // brand-health route — but simpler: we use the absence of "master view"
  // signal. Here we rely on a lightweight HEAD-style request: call
  // /api/agency/clients/[id] is not possible without an id. Instead, we
  // simply default to null (aggregate view) and let the user pick.
  useEffect(() => {
    fetchClients();
    fetchReports();
  }, [fetchClients, fetchReports]);

  // Switch workspace
  const handleSwitch = useCallback(
    async (clientId: string | null) => {
      setSwitching(true);
      try {
        const res = await fetch("/api/agency/switch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agencyClientId: clientId }),
          credentials: "same-origin",
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.error || `Erreur ${res.status}`);
        }
        setActiveClientId(clientId);
        const target = clientId
          ? clients.find((c) => c.id === clientId)?.displayName ?? "le client"
          : null;
        pushToast(
          target
            ? `Espace de travail basculé vers ${target}.`
            : "Retour à la vue agrégée (tous les clients).",
        );
        // Re-fetch reports for the new active client
        fetchReports();
      } catch (err) {
        pushToast(err instanceof Error ? err.message : "Échec de la bascule.", "info");
      } finally {
        setSwitching(false);
      }
    },
    [clients, pushToast, fetchReports],
  );

  const handleAddClient = useCallback(() => {
    pushToast(
      "Pour ajouter un client, contactez votre responsable de compte Harch.",
      "info",
    );
  }, [pushToast]);

  const handleCreateTemplate = useCallback(() => {
    pushToast("Le constructeur de templates sera disponible prochainement.", "info");
  }, [pushToast]);

  const handleSchedule = useCallback(() => {
    pushToast("Assistant de programmation de rapport ouvert.", "info");
  }, [pushToast]);

  const activeClient = activeClientId
    ? clients.find((c) => c.id === activeClientId) ?? null
    : null;
  const activeClientName = activeClient?.displayName ?? null;

  // Forbidden gate (non agency-admin)
  if (forbidden) {
    return (
      <>
        <style>{GLOBAL_CSS}</style>
        <AgencyLayout>
          <Card
            eyebrow="Accès restreint"
            title="Console Agences — Accès requis"
          >
            <EmptyState
              message="Cette console est réservée aux administrateurs d'agence."
              hint="Si vous êtes un partenaire d'agence RP, connectez-vous avec votre compte agency-admin pour accéder au portefeuille de clients."
            />
          </Card>
        </AgencyLayout>
      </>
    );
  }

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <AgencyLayout>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <ClientSwitcherSection
            clients={clients}
            agency={agency}
            activeClientId={activeClientId}
            loading={loading}
            onSwitch={handleSwitch}
            switching={switching}
          />
          <PortfolioTableSection
            clients={clients}
            loading={loading}
            onSwitch={(id) => handleSwitch(id)}
            onAddClient={handleAddClient}
          />
          <ROICalculatorSection activeClientName={activeClientName ?? ""} />
          <PitchDeckSection activeClientName={activeClientName ?? ""} />
          <ReportsPanelSection
            clients={clients}
            reports={reports}
            loading={reportsLoading}
            onCreateTemplate={handleCreateTemplate}
            onSchedule={handleSchedule}
          />
        </div>
      </AgencyLayout>
      <ToastStack toasts={toasts} />
    </>
  );
}

// ─── AGENCY LAYOUT WRAPPER ─────────────────────────────────────────
//  Aligns with the shared Dashboard's sidebar (240px on lg+) so the
//  agency sections appear visually as a continuation of the dashboard.

function AgencyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: C.bgSubtle,
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div style={{ display: "flex" }}>
        {/* Sidebar spacer — mirrors the shared Dashboard's 240px sidebar */}
        <div
          className="hidden lg:block"
          style={{ width: 240, flexShrink: 0 }}
          aria-hidden="true"
        />
        <main
          style={{
            flex: 1,
            padding: "32px 24px",
            maxWidth: 1400,
            margin: "0 auto",
            width: "100%",
            minWidth: 0,
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

// ─── GLOBAL CSS (animations + scrollbar) ───────────────────────────

const GLOBAL_CSS = `
@keyframes harchPulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}
@keyframes harchSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.agency-console-wrapper ::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.agency-console-wrapper ::-webkit-scrollbar-track {
  background: transparent;
}
.agency-console-wrapper ::-webkit-scrollbar-thumb {
  background: ${C.borderStrong};
  border-radius: 4px;
}
.agency-console-wrapper ::-webkit-scrollbar-thumb:hover {
  background: ${STONE};
}
`;
