// ═══════════════════════════════════════════════════════════════
//  DEMO CONSOLE API — DEPRECATED STUB
//
//  All demo console API functions have been disabled.
//  This file exists only to prevent import errors.
//  All functions return null/empty arrays.
// ═══════════════════════════════════════════════════════════════

export function getDemoWeather(_email?: string): any { return null; }
export function getDemoAlerts(_email?: string): any[] { return []; }
export function getDemoReputation(_email?: string): any { return null; }
export function getDemoReports(_email?: string): any[] { return []; }
export function getDemoCompany(_email?: string): any { return null; }
export function getDemoCompanySettings(_email?: string): any { return null; }
export function getDemoInvitations(_email?: string): any[] { return []; }
export function getDemoNotifications(_email?: string): any[] { return []; }
export function getDemoTopics(_email?: string): any[] { return []; }
export function getDemoAIVisibility(_email?: string): any { return null; }
export function getDemoGeoSignals(_email?: string): any { return null; }
export function getDemoInsights(_email?: string): any[] { return []; }
export function getDemoTeam(_email?: string): any[] { return []; }

// Response stubs (all return empty NextResponse-like — demo data disabled)
import { NextResponse } from "next/server";

const emptyResponse = (..._args: any[]) => NextResponse.json({ success: true, data: [], alerts: [], insights: [], topics: [], reports: [], users: [], invitations: [], notifications: [], platforms: [], rankings: [], metrics: {}, settings: {}, team: [] });

export const demoWeatherResponse = emptyResponse;
export const demoAlertsResponse = emptyResponse;
export const demoCrisisResponse = emptyResponse;
export const demoTopicsResponse = emptyResponse;
export const demoAiVisibilityResponse = emptyResponse;
export const demoGeoSignalsResponse = emptyResponse;
export const demoInsightsResponse = emptyResponse;
export const demoReportsListResponse = emptyResponse;
export const demoNeighborsResponse = emptyResponse;
export const demoNotificationsResponse = emptyResponse;
export const demoCompanyInviteListResponse = emptyResponse;
export const demoCompanyInvitePostResponse = emptyResponse;
export const demoCompanySettingsResponse = emptyResponse;
export const demoCompanySettingsPatchResponse = emptyResponse;
export const demoCompanyTeamResponse = emptyResponse;
export const demoCompanyTeamPatchResponse = emptyResponse;
export const demoCompanyTeamDeleteResponse = emptyResponse;
