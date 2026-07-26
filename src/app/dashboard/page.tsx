"use client";

import * as React from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { RiskMatrix } from "@/components/dataviz/risk-matrix";
import { ShareOfVoice } from "@/components/dataviz/share-of-voice";
import { MediaCoverageChart } from "@/components/dataviz/media-coverage-chart";
import { SentimentTrend } from "@/components/dataviz/sentiment-trend";
import { RiskPillars } from "@/components/dataviz/risk-pillars";
import { TopSources } from "@/components/dataviz/top-sources";
import { GeoDistribution } from "@/components/dataviz/geo-distribution";
import { RiskTrendTimeline } from "@/components/dataviz/risk-trend-timeline";
import { EntityKPIs } from "@/components/dataviz/entity-kpis";
import { RiskEventsTable } from "@/components/dashboard/risk-events-table";
import { WatchlistSignals } from "@/components/dashboard/watchlist-signals";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { RealDataPanel } from "@/components/dashboard/real-data-panel";
import { ReputationConsole } from "@/components/dashboard/reputation-console";
import { RiskEventDrawer } from "@/components/dashboard/risk-event-drawer";
import { EntityProfileDialog } from "@/components/dashboard/entity-profile-dialog";
import { CompareViewsDialog } from "@/components/dashboard/compare-views-dialog";
import { CommandPalette, useCommandPalette } from "@/components/dashboard/command-palette";
import {
  KeyboardShortcuts,
  useKeyboardShortcuts,
} from "@/components/dashboard/keyboard-shortcuts";
import { IntelligenceBriefDialog } from "@/components/dashboard/intelligence-brief-dialog";
import type { AccountType, RiskEvent, AlertItem } from "@/lib/mock-data";
import { riskEvents } from "@/lib/mock-data";

const metaByAccount: Record<AccountType, { title: string; description: string }> = {
  admin: {
    title: "Operations Console",
    description: "Full-spectrum risk intelligence across every monitored entity and pillar.",
  },
  trader: {
    title: "Signal Desk",
    description: "Live risk signals with coverage context for HarchCorp positions.",
  },
  legal: {
    title: "Legal & Regulatory Monitor",
    description: "Regulatory exposure, matters, and hold-notice activity across entities.",
  },
  market: {
    title: "Market Intelligence",
    description: "Sentiment, share of voice, and coverage analytics for the IR desk.",
  },
  self: {
    title: "My Watch",
    description: "Personalized monitoring for your tracked entities and saved alerts.",
  },
  pr: {
    title: "Communications Console",
    description: "Reputation, sentiment, and share-of-voice analytics for comms teams.",
  },
};

/** Enterprise grid — market / admin / pr / legal / self. */
function EnterpriseGrid({ onSelect, onSelectEvent, onSelectEntity }: { onSelect: (e: RiskEvent) => void; onSelectEvent: (eventId: string) => void; onSelectEntity: (entity: string) => void }) {
  return (
    <div className="flex flex-col gap-5">
      {/* Reputation Intelligence console — the production centerpiece (4 pillars) */}
      <ReputationConsole brand="HarchCorp" />
      {/* Real-time intelligence (live FX + news + market) */}
      <RealDataPanel />
      {/* Row 0 — full-width risk trend timeline */}
      <RiskTrendTimeline onSelectEvent={onSelectEvent} />
      {/* Row 1 */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <RiskMatrix onSelect={onSelect} />
        <MediaCoverageChart />
      </div>
      {/* Row 2 */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <ShareOfVoice />
        <SentimentTrend />
      </div>
      {/* Row 3 — analytical widgets */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <RiskPillars />
        <div className="xl:col-span-2">
          <TopSources />
        </div>
      </div>
      {/* Row 4 — geo + events */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <GeoDistribution />
        <div className="xl:col-span-2">
          <RiskEventsTable onSelect={onSelect} />
        </div>
      </div>
      {/* Row 5 — entity KPIs + activity feed */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <EntityKPIs onSelectEntity={onSelectEntity} />
        <ActivityFeed />
      </div>
    </div>
  );
}

/** Trader desk — watchlist on top, then matrix + coverage + geo. */
function TraderView({ onSelect, onSelectEvent, onSelectEntity }: { onSelect: (e: RiskEvent) => void; onSelectEvent: (eventId: string) => void; onSelectEntity: (entity: string) => void }) {
  return (
    <div className="flex flex-col gap-5">
      {/* Reputation Intelligence console — the production centerpiece (4 pillars) */}
      <ReputationConsole brand="HarchCorp" />
      {/* Real-time intelligence (live FX + news + market) */}
      <RealDataPanel />
      <WatchlistSignals />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <RiskMatrix onSelect={onSelect} />
        <MediaCoverageChart />
      </div>
      <RiskTrendTimeline onSelectEvent={onSelectEvent} />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <RiskPillars />
        <div className="xl:col-span-2">
          <TopSources />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <GeoDistribution />
        <div className="xl:col-span-2">
          <RiskEventsTable onSelect={onSelect} />
        </div>
      </div>
      {/* Row 5 — entity KPIs + activity feed */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <EntityKPIs onSelectEntity={onSelectEntity} />
        <ActivityFeed />
      </div>
    </div>
  );
}

export default function Home() {
  const [accountType, setAccountType] = React.useState<AccountType>("market");
  const [selectedEvent, setSelectedEvent] = React.useState<RiskEvent | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [helpOpen, setHelpOpen] = React.useState(false);
  const [entityOpen, setEntityOpen] = React.useState<string | null>(null);
  const [compareOpen, setCompareOpen] = React.useState(false);
  const [briefOpen, setBriefOpen] = React.useState(false);

  const palette = useCommandPalette();
  useKeyboardShortcuts(() => setHelpOpen((v) => !v), () => setBriefOpen(true));

  const handleSelect = React.useCallback((e: RiskEvent) => {
    setSelectedEvent(e);
    setDrawerOpen(true);
  }, []);

  const handleSelectById = React.useCallback((eventId: string) => {
    const ev = riskEvents.find((e) => e.id === eventId);
    if (ev) {
      setSelectedEvent(ev);
      setDrawerOpen(true);
    }
  }, []);

  const handleOpenAlert = React.useCallback((a: AlertItem) => {
    if (!a.eventId) return;
    const ev = riskEvents.find((e) => e.id === a.eventId);
    if (ev) {
      setSelectedEvent(ev);
      setDrawerOpen(true);
    }
  }, []);

  const meta = metaByAccount[accountType];

  return (
    <DashboardShell
      accountType={accountType}
      onAccountTypeChange={setAccountType}
      onOpenPalette={palette.toggle}
      onOpenAlert={handleOpenAlert}
      onOpenBrief={() => setBriefOpen(true)}
      title={meta.title}
      description={meta.description}
    >
      {accountType === "trader" ? (
        <TraderView onSelect={handleSelect} onSelectEvent={handleSelectById} onSelectEntity={(entity) => setEntityOpen(entity)} />
      ) : (
        <EnterpriseGrid onSelect={handleSelect} onSelectEvent={handleSelectById} onSelectEntity={(entity) => setEntityOpen(entity)} />
      )}
      <RiskEventDrawer
        event={selectedEvent}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
      <CommandPalette
        open={palette.open}
        onOpenChange={palette.setOpen}
        accountType={accountType}
        onAccountTypeChange={setAccountType}
        onSelectEvent={handleSelect}
        onSelectEntity={(entity) => setEntityOpen(entity)}
        onOpenCompare={() => setCompareOpen(true)}
        onOpenBrief={() => setBriefOpen(true)}
      />
      <KeyboardShortcuts open={helpOpen} onOpenChange={setHelpOpen} />
      <EntityProfileDialog
        entity={entityOpen}
        open={entityOpen !== null}
        onOpenChange={(v) => { if (!v) setEntityOpen(null); }}
        onSelectEvent={handleSelect}
      />
      <CompareViewsDialog open={compareOpen} onOpenChange={setCompareOpen} onSelectEvent={handleSelect} />
      <IntelligenceBriefDialog
        open={briefOpen}
        onOpenChange={setBriefOpen}
        accountType={accountType}
      />
    </DashboardShell>
  );
}
