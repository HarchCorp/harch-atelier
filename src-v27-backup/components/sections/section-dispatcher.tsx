"use client";

import * as React from "react";
import {
  SectionPlaceholder,
  type SectionComponentProps,
} from "@/components/dashboard/section-registry";
import { SectionHeader } from "./section-header";
import type { AccountType } from "@/lib/mock-data";

/* Trader (Markets & Trading) sections */
import { BvcOverview } from "./trader/bvc-overview";
import { EquitiesScreener } from "./trader/equities-screener";
import { PositionsBlotter } from "./trader/positions-blotter";
import { IndicesView } from "./trader/indices-view";
import { FxRatesView } from "./trader/fx-rates";
import { CommoditiesBoard } from "./trader/commodities-board";
import { FixedIncomeView } from "./trader/fixed-income";

/* Intelligence sections (reuse existing dataviz widgets) */
import { IntelRiskMatrix } from "./intel/intel-risk-matrix";
import { IntelCoverage } from "./intel/intel-coverage";
import { IntelSentiment } from "./intel/intel-sentiment";
import { IntelSov } from "./intel/intel-sov";
import { IntelEvents } from "./intel/intel-events";
import { IntelWatchlist } from "./intel/intel-watchlist";
import { IntelActivity } from "./intel/intel-activity";

/* Administration + oversight sections (admin role) */
import { UsersRoles } from "./admin/users-roles";
import { DataSources } from "./admin/data-sources";
import { Integrations } from "./admin/integrations";
import { Billing } from "./admin/billing";
import { Settings } from "./admin/settings";
import { IntelOverview } from "./admin/intel-overview";
import { AlertsQueue } from "./admin/alerts-queue";
import { RiskOverview } from "./admin/risk-overview";
import { AuditLog } from "./admin/risk-audit";

/* Risk & Compliance sections (legal role — V16.0) */
import { RegulatoryRisk } from "./legal/regulatory";
import { CyberRisk } from "./legal/cyber";
import { FinancialRisk } from "./legal/financial";
import { EsgRisk } from "./legal/esg";
import { GeopoliticalRisk } from "./legal/geopolitical";
import { ReputationalRisk } from "./legal/reputational";
import { LegalMatters } from "./legal/matters";
import { HoldNotices } from "./legal/holds";

/* Communications sections (pr role — V17.0) */
import { CommsOverview } from "./comms/overview";
import { CommsSentiment } from "./comms/sentiment";
import { CommsSov } from "./comms/sov";
import { CommsCoverage } from "./comms/coverage";
import { CommsCampaigns } from "./comms/campaigns";
import { CommsReputation } from "./comms/reputation";
import { CommsPress } from "./comms/press";
import { CommsSocial } from "./comms/social";

/* Entities sections (market role — V18.0) */
import { DirectorySection as EntityDirectory } from "./entities/directory";
import { MoroccanSection as EntityMoroccan } from "./entities/moroccan";
import { ProfilesSection as EntityProfiles } from "./entities/profiles";
import { PeersSection as EntityPeers } from "./entities/peers";
import { WatchlistSection as EntityWatchlist } from "./entities/watchlist";

/**
 * Section dispatcher — the single entry point for non-dashboard sections.
 *
 * Returns the real component for built sections, otherwise the universal
 * SectionPlaceholder. `page.tsx` calls this with `renderSection(activeSection, props)`.
 */
export function renderSection(
  sectionId: string,
  props: SectionComponentProps,
): React.ReactNode {
  const component = sectionComponents[sectionId];
  if (!component) {
    return <SectionPlaceholder sectionId={sectionId} accountType={props.accountType} />;
  }
  const Comp = component;
  return <Comp {...props} />;
}

/** Render the hero header alone — used by some pages to maintain a uniform
 * breadcrumb before the section content. Currently the section components
 * render their own headers, so this is exported for parity only. */
export function renderSectionHeader(
  sectionId: string,
  accountType: AccountType,
): React.ReactNode {
  return <SectionHeader sectionId={sectionId} accountType={accountType} />;
}

/* ------------------------------------------------------------------ */
/*  Section registry                                                   */
/* ------------------------------------------------------------------ */

type SectionComponent = React.FC<SectionComponentProps>;

const sectionComponents: Partial<Record<string, SectionComponent>> = {
  // Markets & Trading — trader
  "mkt-bvc": BvcOverview,
  "mkt-equities": EquitiesScreener,
  "mkt-positions": PositionsBlotter,
  "mkt-indices": IndicesView,
  "mkt-fx": FxRatesView,
  "mkt-commodities": CommoditiesBoard,
  "mkt-fixed-income": FixedIncomeView,

  // Intelligence (trader-visible subset — reuses existing widgets)
  "intel-risk-matrix": IntelRiskMatrix,
  "intel-coverage": IntelCoverage,
  "intel-sentiment": IntelSentiment,
  "intel-sov": IntelSov,
  "intel-events": IntelEvents,
  "intel-watchlist": IntelWatchlist,
  "intel-activity": IntelActivity,

  // Administration category (admin-only)
  "admin-users": UsersRoles,
  "admin-sources": DataSources,
  "admin-integrations": Integrations,
  "admin-billing": Billing,
  "admin-settings": Settings,

  // Oversight sections (admin-only)
  "intel-overview": IntelOverview,
  "intel-alerts": AlertsQueue,
  "risk-overview": RiskOverview,
  "risk-audit": AuditLog,

  // Risk & Compliance (legal role — V16.0)
  "risk-regulatory": RegulatoryRisk,
  "risk-cyber": CyberRisk,
  "risk-financial": FinancialRisk,
  "risk-esg": EsgRisk,
  "risk-geo": GeopoliticalRisk,
  "risk-rep": ReputationalRisk,
  "risk-matters": LegalMatters,
  "risk-holds": HoldNotices,

  // Communications (pr role — V17.0)
  "comms-overview": CommsOverview,
  "comms-sentiment": CommsSentiment,
  "comms-sov": CommsSov,
  "comms-coverage": CommsCoverage,
  "comms-campaigns": CommsCampaigns,
  "comms-reputation": CommsReputation,
  "comms-press": CommsPress,
  "comms-social": CommsSocial,

  // Entities (market role — V18.0)
  "ent-directory": EntityDirectory,
  "ent-moroccan": EntityMoroccan,
  "ent-profiles": EntityProfiles,
  "ent-peers": EntityPeers,
  "ent-watchlist": EntityWatchlist,
};

/** Set of section ids that have real (non-placeholder) implementations. */
export const builtSections: Set<string> = new Set(Object.keys(sectionComponents));
