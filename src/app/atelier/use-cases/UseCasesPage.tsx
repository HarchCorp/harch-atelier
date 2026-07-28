"use client";

import React, { useState } from "react";
import { AtelierNav } from "../components/AtelierNav";
import { AtelierFooter } from "../components/AtelierFooter";
import {
  ScrollProgress,
  CursorGlow,
  BackToTop,
} from "../components/shared";

// ═══════════════════════════════════════════════════════════════════════
// HARCH ATELIER — USE CASES PAGE
// Light theme · Inter + JetBrains Mono · SVG charts · No images
// ═══════════════════════════════════════════════════════════════════════
//
// Product: AI Reputation Intelligence — 6 sectors, same methodology.
// Banking · Telecom · Energy · Mining · Agriculture · Hospitality
//
// Palette (LOCKED — light):
//   bg #FAFAFA · surface #FFFFFF · surfaceAlt #F4F4F5 · border #E5E5E5
//   text #0A0A0A · secondary #525252 · muted #71717A
//   accent #8B9DAF · accentDark #4A5D6E
//   sage #4A7B5F · sageBright #6FA386 · red #A0524B
//
// Sections:
//   01  Hero
//   02  Sector overview grid (6 cards)
//   03  Banking deep dive
//   04  Telecom deep dive
//   05  Energy deep dive
//   06  Mining deep dive
//   07  Agriculture deep dive
//   08  Hospitality deep dive
//   09  Cross-sector comparison chart
//   10  CTA
//   11  Footer
//
// ═══════════════════════════════════════════════════════════════════════

// ─── DESIGN TOKENS ─────────────────────────────────────────────────────
const C = {
  bg: "#FAFAFA",
  surface: "#FFFFFF",
  surfaceAlt: "#F4F4F5",
  border: "#E5E5E5",
  borderLight: "#F0F0F0",
  textPrimary: "#0A0A0A",
  textSecondary: "#525252",
  textMuted: "#71717A",
  textFaint: "#A1A1AA",
  accent: "#8B9DAF",
  accentDark: "#4A5D6E",
  sage: "#4A7B5F",
  sageBright: "#6FA386",
  sageDark: "#3D6650",
  sageBg: "rgba(74,123,95,0.08)",
  red: "#A0524B",
  redBg: "rgba(160,82,75,0.08)",
  neutral: "#71717A",
  neutralBg: "rgba(113,113,122,0.10)",
} as const;

const FONT = {
  sans: "'Inter', system-ui, -apple-system, sans-serif",
  mono: "'JetBrains Mono', 'SF Mono', monospace",
} as const;

const SHADOW = {
  card: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
  cardHover: "0 2px 8px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.06)",
  hero: "0 4px 12px rgba(0,0,0,0.04), 0 24px 48px rgba(0,0,0,0.06)",
} as const;

// ─── DATA ──────────────────────────────────────────────────────────────

type Sector = {
  id: string;
  name: string;
  nameFr: string;
  icon: string;
  tagline: string;
  exampleBrand: string;
  score: number;
  scoreDelta: number;
  sentiment: { pos: number; neu: number; neg: number };
  mentions: number;
  aiCitations: number;
  riskTopic: string;
  riskSentiment: number;
  opportunity: string;
  topics: { name: string; pos: number; neg: number; mentions: number }[];
  mentions30d: number[];
  alertExample: { title: string; source: string; sentiment: number; time: string };
  sourceBreakdown: { source: string; share: number }[];
  accent: string;
};

const SECTORS: Sector[] = [
  {
    id: "banking",
    name: "Banking",
    nameFr: "Banque",
    icon: "bank",
    tagline: "Frais, service client, résultats financiers",
    exampleBrand: "Bank of Africa",
    score: 78,
    scoreDelta: 4.2,
    sentiment: { pos: 68, neu: 22, neg: 10 },
    mentions: 1247,
    aiCitations: 14,
    riskTopic: "Frais bancaires",
    riskSentiment: -0.61,
    opportunity: "Positionner comme la banque la plus transparente sur les frais",
    topics: [
      { name: "Frais bancaires", pos: 42, neg: 48, mentions: 89 },
      { name: "Service client", pos: 71, neg: 18, mentions: 67 },
      { name: "Application mobile", pos: 65, neg: 22, mentions: 54 },
      { name: "Taux de crédit", pos: 55, neg: 30, mentions: 41 },
      { name: "Réseau d'agences", pos: 73, neg: 15, mentions: 38 },
    ],
    mentions30d: [42, 45, 48, 52, 50, 54, 58, 60, 55, 62, 65, 68, 70, 72, 75, 73, 78, 82, 85, 88, 90, 92, 95, 98, 102, 108, 112, 118, 122, 124],
    alertExample: {
      title: "Frais bancaires: les clients dénoncent une hausse",
      source: "Hespress",
      sentiment: -0.61,
      time: "12:42",
    },
    sourceBreakdown: [
      { source: "Hespress", share: 28 },
      { source: "L'Économiste", share: 22 },
      { source: "Médias24", share: 18 },
      { source: "TelQuel", share: 14 },
      { source: "Le Matin", share: 10 },
      { source: "Autres", share: 8 },
    ],
    accent: C.sage,
  },
  {
    id: "telecom",
    name: "Telecom",
    nameFr: "Télécom",
    icon: "signal",
    tagline: "Réseau, data, service client, couverture",
    exampleBrand: "Inwi",
    score: 82,
    scoreDelta: 3.5,
    sentiment: { pos: 71, neu: 20, neg: 9 },
    mentions: 1892,
    aiCitations: 18,
    riskTopic: "Couverture réseau zones rurales",
    riskSentiment: -0.48,
    opportunity: "Mettre en avant l'investissement 5G et la couverture rurale",
    topics: [
      { name: "Couverture réseau", pos: 58, neg: 32, mentions: 124 },
      { name: "Offres data", pos: 74, neg: 12, mentions: 98 },
      { name: "Service client", pos: 68, neg: 22, mentions: 87 },
      { name: "5G launch", pos: 81, neg: 8, mentions: 72 },
      { name: "Roaming", pos: 62, neg: 25, mentions: 45 },
    ],
    mentions30d: [55, 58, 60, 62, 65, 68, 70, 72, 75, 78, 80, 82, 85, 88, 90, 92, 95, 98, 100, 102, 105, 108, 110, 112, 115, 118, 120, 122, 125, 128],
    alertExample: {
      title: "Inwi: coupures réseau signalées à Marrakech",
      source: "TelQuel",
      sentiment: -0.48,
      time: "09:15",
    },
    sourceBreakdown: [
      { source: "TelQuel", share: 25 },
      { source: "Hespress", share: 22 },
      { source: "Médias24", share: 18 },
      { source: "Yabiladi", share: 15 },
      { source: "Le Matin", share: 12 },
      { source: "Autres", share: 8 },
    ],
    accent: C.accentDark,
  },
  {
    id: "energy",
    name: "Energy",
    nameFr: "Énergie",
    icon: "bolt",
    tagline: "Tarifs, transition, projets verts, regulation",
    exampleBrand: "ONEE",
    score: 71,
    scoreDelta: 1.8,
    sentiment: { pos: 58, neu: 28, neg: 14 },
    mentions: 894,
    aiCitations: 9,
    riskTopic: "Hausse des tarifs électriques",
    riskSentiment: -0.54,
    opportunity: "Communiquer sur le mix énergétique renouvelable",
    topics: [
      { name: "Tarifs électriques", pos: 38, neg: 52, mentions: 78 },
      { name: "Énergie renouvelable", pos: 82, neg: 6, mentions: 65 },
      { name: "Coupures courant", pos: 45, neg: 38, mentions: 52 },
      { name: "Projet solaire", pos: 85, neg: 5, mentions: 41 },
      { name: "Nucleaire", pos: 52, neg: 28, mentions: 28 },
    ],
    mentions30d: [28, 30, 32, 34, 35, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 78, 80, 82, 84],
    alertExample: {
      title: "Hausse des tarifs électriques: l'ONEE justifie sa décision",
      source: "L'Économiste",
      sentiment: -0.54,
      time: "08:30",
    },
    sourceBreakdown: [
      { source: "L'Économiste", share: 32 },
      { source: "Le Matin", share: 24 },
      { source: "Médias24", share: 18 },
      { source: "Aujourd'hui", share: 12 },
      { source: "TelQuel", share: 8 },
      { source: "Autres", share: 6 },
    ],
    accent: C.red,
  },
  {
    id: "mining",
    name: "Mining",
    nameFr: "Mines",
    icon: "pickaxe",
    tagline: "Phosphates, impact environnemental, RSE",
    exampleBrand: "OCP Group",
    score: 84,
    scoreDelta: 2.3,
    sentiment: { pos: 72, neu: 21, neg: 7 },
    mentions: 624,
    aiCitations: 11,
    riskTopic: "Impact environnemental phosphates",
    riskSentiment: -0.41,
    opportunity: "Mettre en avant les programmes de développement durable",
    topics: [
      { name: "Résultats financiers", pos: 85, neg: 8, mentions: 62 },
      { name: "Impact environnemental", pos: 42, neg: 48, mentions: 54 },
      { name: "Expansion Afrique", pos: 78, neg: 12, mentions: 48 },
      { name: "RSE", pos: 80, neg: 10, mentions: 42 },
      { name: "Phosphates prix", pos: 68, neg: 18, mentions: 35 },
    ],
    mentions30d: [18, 20, 22, 24, 25, 26, 28, 30, 32, 34, 35, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72],
    alertExample: {
      title: "OCP: associations dénoncent l'impact environnemental à Khouribga",
      source: "TelQuel",
      sentiment: -0.41,
      time: "14:20",
    },
    sourceBreakdown: [
      { source: "L'Économiste", share: 30 },
      { source: "TelQuel", share: 22 },
      { source: "Le Matin", share: 20 },
      { source: "Médias24", share: 14 },
      { source: "Aujourd'hui", share: 8 },
      { source: "Autres", share: 6 },
    ],
    accent: C.sage,
  },
  {
    id: "agriculture",
    name: "Agriculture",
    nameFr: "Agriculture",
    icon: "wheat",
    tagline: "Agri-tech, export, sécurité alimentaire",
    exampleBrand: "LesieurCristal",
    score: 69,
    scoreDelta: 0.6,
    sentiment: { pos: 63, neu: 27, neg: 10 },
    mentions: 412,
    aiCitations: 6,
    riskTopic: "Hausse prix huiles alimentaires",
    riskSentiment: -0.52,
    opportunity: "Communiquer sur la filière locale et la qualité",
    topics: [
      { name: "Prix huiles", pos: 35, neg: 55, mentions: 68 },
      { name: "Export", pos: 72, neg: 14, mentions: 52 },
      { name: "Qualité produit", pos: 78, neg: 10, mentions: 45 },
      { name: "Filière locale", pos: 75, neg: 12, mentions: 38 },
      { name: "Sécheresse", pos: 42, neg: 38, mentions: 32 },
    ],
    mentions30d: [12, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42],
    alertExample: {
      title: "Hausse des prix: l'huile de table menace le pouvoir d'achat",
      source: "Médias24",
      sentiment: -0.52,
      time: "11:08",
    },
    sourceBreakdown: [
      { source: "Médias24", share: 28 },
      { source: "Le Matin", share: 24 },
      { source: "L'Économiste", share: 22 },
      { source: "Aujourd'hui", share: 14 },
      { source: "TelQuel", share: 8 },
      { source: "Autres", share: 4 },
    ],
    accent: C.accentDark,
  },
  {
    id: "hospitality",
    name: "Hospitality",
    nameFr: "Hôtellerie",
    icon: "bed",
    tagline: "Hôtels, tourisme, avis clients, service",
    exampleBrand: "Royal Air Maroc (Hotels)",
    score: 79,
    scoreDelta: 2.1,
    sentiment: { pos: 70, neu: 22, neg: 8 },
    mentions: 1056,
    aiCitations: 13,
    riskTopic: "Avis négatifs sur la qualité de service",
    riskSentiment: -0.45,
    opportunity: "Mettre en avant les labels et certifications qualité",
    topics: [
      { name: "Qualité service", pos: 62, neg: 28, mentions: 92 },
      { name: "Rapport qualité-prix", pos: 58, neg: 30, mentions: 78 },
      { name: "Localisation", pos: 82, neg: 8, mentions: 65 },
      { name: "Petit-déjeuner", pos: 75, neg: 15, mentions: 52 },
      { name: "Wifi", pos: 48, neg: 35, mentions: 41 },
    ],
    mentions30d: [35, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 78, 80, 82, 84, 86, 88, 90, 92, 94],
    alertExample: {
      title: "Hôtel X: voyageurs dénoncent un service dégradé",
      source: "Yabiladi",
      sentiment: -0.45,
      time: "16:45",
    },
    sourceBreakdown: [
      { source: "Yabiladi", share: 26 },
      { source: "TelQuel", share: 22 },
      { source: "Le Matin", share: 18 },
      { source: "Médias24", share: 16 },
      { source: "Bladi.net", share: 12 },
      { source: "Autres", share: 6 },
    ],
    accent: C.red,
  },
];

// ─── SHARED HELPERS ────────────────────────────────────────────────────

function Eyebrow({ children, color = C.textMuted }: { children: React.ReactNode; color?: string }) {
  return (
    <div
      style={{
        fontSize: "12px",
        fontFamily: FONT.mono,
        color: color,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        fontWeight: 500,
      }}
    >
      {children}
      <span
        style={{
          width: "48px",
          height: "1px",
          background: `linear-gradient(to right, ${color}, transparent)`,
          opacity: 0.6,
        }}
        aria-hidden
      />
    </div>
  );
}

function SectionTitle({ children, maxW = "820px" }: { children: React.ReactNode; maxW?: string }) {
  return (
    <h2
      style={{
        fontSize: "clamp(30px, 4vw, 46px)",
        fontWeight: 700,
        letterSpacing: "-0.03em",
        lineHeight: 1.1,
        color: C.textPrimary,
        margin: "0 0 20px",
        maxWidth: maxW,
      }}
    >
      {children}
    </h2>
  );
}

function SectionSub({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: "18px",
        color: C.textSecondary,
        lineHeight: 1.6,
        maxWidth: "640px",
        margin: "0 0 56px",
      }}
    >
      {children}
    </p>
  );
}

function buildLinePath(data: number[], w: number, h: number, max = 100): string {
  const step = w / (data.length - 1);
  return data
    .map((v, i) => {
      const x = i * step;
      const y = h - (v / max) * h;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function buildAreaPath(data: number[], w: number, h: number, max = 100): string {
  const step = w / (data.length - 1);
  const line = data
    .map((v, i) => {
      const x = i * step;
      const y = h - (v / max) * h;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  return `${line} L ${w.toFixed(1)} ${h.toFixed(1)} L 0 ${h.toFixed(1)} Z`;
}

// ─── SVG ICONS ─────────────────────────────────────────────────────────

function IconBank({ size = 28, color = C.sage }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="21" x2="21" y2="21" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <polygon points="12 3 3 10 21 10" />
      <line x1="6" y1="14" x2="6" y2="18" />
      <line x1="10" y1="14" x2="10" y2="18" />
      <line x1="14" y1="14" x2="14" y2="18" />
      <line x1="18" y1="14" x2="18" y2="18" />
    </svg>
  );
}

function IconSignal({ size = 28, color = C.sage }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20h.01M6 16v4M10 12v8M14 8v12M18 4v16" />
    </svg>
  );
}

function IconBolt({ size = 28, color = C.sage }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function IconPickaxe({ size = 28, color = C.sage }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21l8-8" />
      <path d="M11 13l4 4" />
      <path d="M14 4l6 6-3 3-6-6 3-3z" />
      <path d="M9 9c-2 0-4 1-5 3 1 1 3 2 5 1" />
    </svg>
  );
}

function IconWheat({ size = 28, color = C.sage }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 22 16 8" />
      <path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
      <path d="M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
      <path d="M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z" />
    </svg>
  );
}

function IconBed({ size = 28, color = C.sage }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8V4h12" />
    </svg>
  );
}

function IconArrow({ size = 20, color = C.textMuted }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function IconCheck({ size = 16, color = C.sage }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconAlert({ size = 18, color = C.red }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function IconChart({ size = 18, color = C.textMuted }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 14l3-3 3 3 5-5" />
    </svg>
  );
}

function SectorIcon({ id, size = 28, color = C.sage }: { id: string; size?: number; color?: string }) {
  if (id === "banking") return <IconBank size={size} color={color} />;
  if (id === "telecom") return <IconSignal size={size} color={color} />;
  if (id === "energy") return <IconBolt size={size} color={color} />;
  if (id === "mining") return <IconPickaxe size={size} color={color} />;
  if (id === "agriculture") return <IconWheat size={size} color={color} />;
  return <IconBed size={size} color={color} />;
}

// Wrapper for places that need a component reference instead of JSX
function getSectorIcon(id: string) {
  return ({ size = 28, color = C.sage }: { size?: number; color?: string }) => (
    <SectorIcon id={id} size={size} color={color} />
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 01 — HERO
// ═══════════════════════════════════════════════════════════════════════

function Hero() {
  return (
    <section
      style={{
        position: "relative",
        background: C.bg,
        padding: "80px 32px 100px",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-200px",
          right: "-100px",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(74,123,95,0.04), transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: "-150px",
          left: "-100px",
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, rgba(139,157,175,0.05), transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Eyebrow color={C.sage}>Use cases · 6 sectors</Eyebrow>
        <h1
          style={{
            fontSize: "clamp(40px, 5.5vw, 64px)",
            fontWeight: 700,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            color: C.textPrimary,
            margin: "0 0 24px",
            maxWidth: "900px",
          }}
        >
          Six sectors. One methodology.
          <br />
          <span style={{ color: C.sage }}>Reputation intelligence that adapts.</span>
        </h1>
        <p
          style={{
            fontSize: "19px",
            color: C.textSecondary,
            lineHeight: 1.55,
            maxWidth: "640px",
            margin: "0 0 40px",
          }}
        >
          A bank, a telecom, and a hotel group don't face the same reputation
          risks. We adapt our monitoring, our topic taxonomy, and our alert
          thresholds to each sector's reality.
        </p>

        {/* Sector quick-stats */}
        <div
          className="hero-stats"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: "16px",
            maxWidth: "1000px",
          }}
        >
          {SECTORS.map((s) => {
            return (
              <div
                key={s.id}
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: "6px",
                  padding: "16px 12px",
                  textAlign: "center",
                  boxShadow: SHADOW.card,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = s.accent;
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
                  <SectorIcon id={s.id} size={22} color={s.accent} />
                </div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: C.textPrimary, marginBottom: "4px" }}>{s.name}</div>
                <div style={{ fontSize: "14px", fontFamily: FONT.mono, fontWeight: 700, color: s.accent }}>{s.score}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 02 — SECTOR OVERVIEW GRID
// ═══════════════════════════════════════════════════════════════════════

function SectorOverview() {
  return (
    <section
      style={{
        background: C.surface,
        padding: "100px 32px",
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <Eyebrow>The six sectors</Eyebrow>
        <SectionTitle>Each sector has its own risk map.</SectionTitle>
        <SectionSub>
          Click into each to see what we monitor, what we alert on, and what
          a typical dashboard looks like. Every sector has a custom topic
          taxonomy and threshold tuning.
        </SectionSub>

        <div
          className="sector-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "24px",
          }}
        >
          {SECTORS.map((s) => (
            <SectorOverviewCard key={s.id} sector={s} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SectorOverviewCard({ sector }: { sector: Sector }) {
  const Icon = getSectorIcon(sector.id);
  const bg = sector.accent === C.sage ? C.sageBg : sector.accent === C.accentDark ? "rgba(74,93,110,0.08)" : C.redBg;
  const border = sector.accent === C.sage ? "rgba(74,123,95,0.2)" : sector.accent === C.accentDark ? "rgba(74,93,110,0.2)" : "rgba(160,82,75,0.2)";
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "8px",
        padding: "28px",
        boxShadow: SHADOW.card,
        transition: "all 0.25s",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = sector.accent;
        e.currentTarget.style.boxShadow = SHADOW.cardHover;
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = C.border;
        e.currentTarget.style.boxShadow = SHADOW.card;
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "8px",
            background: bg,
            border: `1px solid ${border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={24} color={sector.accent} />
        </div>
        <div>
          <div style={{ fontSize: "18px", fontWeight: 700, color: C.textPrimary, letterSpacing: "-0.01em" }}>{sector.name}</div>
          <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: "2px" }}>{sector.nameFr}</div>
        </div>
      </div>

      <p style={{ fontSize: "14px", color: C.textSecondary, lineHeight: 1.55, margin: "0 0 20px", flex: 1 }}>
        {sector.tagline}
      </p>

      {/* Sentiment bar */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span style={{ fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>Sentiment split</span>
          <span style={{ fontSize: "12px", fontFamily: FONT.mono, fontWeight: 700, color: sector.accent }}>{sector.score}/100</span>
        </div>
        <div style={{ display: "flex", height: "6px", borderRadius: "3px", overflow: "hidden", background: C.borderLight }}>
          <div style={{ width: `${sector.sentiment.pos}%`, background: C.sage }} />
          <div style={{ width: `${sector.sentiment.neu}%`, background: C.neutral }} />
          <div style={{ width: `${sector.sentiment.neg}%`, background: C.red }} />
        </div>
      </div>

      {/* Stats row */}
      <div
        style={{
          paddingTop: "16px",
          borderTop: `1px solid ${C.borderLight}`,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontSize: "16px", fontWeight: 700, fontFamily: FONT.mono, color: C.textPrimary }}>{sector.mentions}</div>
          <div style={{ fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>mentions</div>
        </div>
        <div>
          <div style={{ fontSize: "16px", fontWeight: 700, fontFamily: FONT.mono, color: sector.accent }}>↑ {sector.scoreDelta}</div>
          <div style={{ fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>vs last month</div>
        </div>
        <div>
          <div style={{ fontSize: "16px", fontWeight: 700, fontFamily: FONT.mono, color: C.textPrimary }}>{sector.aiCitations}</div>
          <div style={{ fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>AI citations</div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTOR DEEP DIVE (reusable)
// ═══════════════════════════════════════════════════════════════════════

function SectorDeepDive({ sector, alt = false }: { sector: Sector; alt?: boolean }) {
  const Icon = getSectorIcon(sector.id);
  return (
    <section
      id={sector.id}
      style={{
        background: alt ? C.surfaceAlt : C.surface,
        padding: "100px 32px",
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "8px",
              background: sector.accent === C.sage ? C.sageBg : sector.accent === C.accentDark ? "rgba(74,93,110,0.08)" : C.redBg,
              border: `1px solid ${sector.accent === C.sage ? "rgba(74,123,95,0.2)" : sector.accent === C.accentDark ? "rgba(74,93,110,0.2)" : "rgba(160,82,75,0.2)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={28} color={sector.accent} />
          </div>
          <div>
            <div style={{ fontSize: "12px", fontFamily: FONT.mono, color: sector.accent, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "4px" }}>
              Use case · {sector.nameFr}
            </div>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 40px)",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                color: C.textPrimary,
                margin: 0,
              }}
            >
              {sector.name} — {sector.exampleBrand}
            </h2>
          </div>
        </div>

        <p style={{ fontSize: "17px", color: C.textSecondary, lineHeight: 1.6, maxWidth: "760px", margin: "0 0 56px" }}>
          {sector.tagline}. Example: <strong style={{ color: C.textPrimary }}>{sector.exampleBrand}</strong>,
          score de réputation {sector.score}/100 ({sector.scoreDelta > 0 ? "+" : ""}{sector.scoreDelta} pts vs
          le mois dernier). {sector.mentions} mentions suivies sur 30 jours, {sector.aiCitations} citations par les moteurs IA.
        </p>

        <div
          className="deepdive-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: "24px",
            alignItems: "start",
          }}
        >
          {/* Left: Dashboard mockup */}
          <SectorDashboardMockup sector={sector} />

          {/* Right: Sentiment examples + alert */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <SectorSentimentBreakdown sector={sector} />
            <SectorAlertExample sector={sector} />
            <SectorOpportunity sector={sector} />
          </div>
        </div>

        {/* Bottom: Topic + source breakdown */}
        <div
          className="deepdive-bottom"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
            marginTop: "24px",
          }}
        >
          <SectorTopicBreakdown sector={sector} />
          <SectorSourceBreakdown sector={sector} />
        </div>
      </div>
    </section>
  );
}

function SectorDashboardMockup({ sector }: { sector: Sector }) {
  const maxMentions = Math.max(...sector.mentions30d);
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "8px",
        boxShadow: SHADOW.hero,
        overflow: "hidden",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "12px 16px",
          borderBottom: `1px solid ${C.border}`,
          background: C.surfaceAlt,
        }}
      >
        <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#E5E5E5" }} />
        <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#E5E5E5" }} />
        <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#E5E5E5" }} />
        <span style={{ marginLeft: "8px", fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.04em" }}>
          atelier.harchcorp.com / dashboard / {sector.id}
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: "10px",
            fontFamily: FONT.mono,
            color: C.sage,
            background: C.sageBg,
            padding: "3px 8px",
            borderRadius: "2px",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            border: "1px solid rgba(74,123,95,0.2)",
          }}
        >
          ● Live
        </span>
      </div>

      <div style={{ padding: "24px" }}>
        {/* Top: brand + score */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>
              {sector.name} reputation score
            </div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: C.textPrimary, marginBottom: "4px" }}>
              {sector.exampleBrand}
            </div>
            <div style={{ fontSize: "12px", fontFamily: FONT.mono, color: C.sage }}>
              ↑ +{sector.scoreDelta} pts vs last month
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span style={{ fontSize: "40px", fontWeight: 700, fontFamily: FONT.mono, color: sector.accent, lineHeight: 1, letterSpacing: "-0.03em" }}>
              {sector.score}
            </span>
            <span style={{ fontSize: "12px", fontFamily: FONT.mono, color: C.textMuted }}>/ 100</span>
          </div>
        </div>

        {/* Sentiment bar */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Sentiment · 30 days
            </span>
            <span style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted }}>{sector.mentions} mentions</span>
          </div>
          <div style={{ display: "flex", height: "12px", borderRadius: "6px", overflow: "hidden", marginBottom: "10px", background: C.borderLight }}>
            <div style={{ width: `${sector.sentiment.pos}%`, background: C.sage }} />
            <div style={{ width: `${sector.sentiment.neu}%`, background: C.neutral }} />
            <div style={{ width: `${sector.sentiment.neg}%`, background: C.red }} />
          </div>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <LegendItem color={C.sage} label="Positive" pct={`${sector.sentiment.pos}%`} />
            <LegendItem color={C.neutral} label="Neutral" pct={`${sector.sentiment.neu}%`} />
            <LegendItem color={C.red} label="Negative" pct={`${sector.sentiment.neg}%`} />
          </div>
        </div>

        {/* KPI row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <KpiMini label="Articles" value={String(sector.mentions)} />
          <KpiMini label="AI Citations" value={String(sector.aiCitations)} />
          <KpiMini label="Avg / day" value={String(Math.round(sector.mentions / 30))} />
        </div>

        {/* Chart */}
        <div
          style={{
            padding: "16px",
            background: C.surfaceAlt,
            borderRadius: "6px",
            border: `1px solid ${C.borderLight}`,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              30-day mentions
            </span>
            <span style={{ fontSize: "12px", fontFamily: FONT.mono, color: sector.accent, fontWeight: 700 }}>
              ↑ +{Math.round((sector.mentions30d[sector.mentions30d.length - 1] - sector.mentions30d[0]) / sector.mentions30d[0] * 100)}%
            </span>
          </div>
          <svg width="100%" height="56" viewBox="0 0 300 56" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`sectorGrad-${sector.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={sector.accent} stopOpacity="0.25" />
                <stop offset="100%" stopColor={sector.accent} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={buildAreaPath(sector.mentions30d, 300, 56, maxMentions * 1.1)} fill={`url(#sectorGrad-${sector.id})`} />
            <path d={buildLinePath(sector.mentions30d, 300, 56, maxMentions * 1.1)} fill="none" stroke={sector.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label, pct }: { color: string; label: string; pct: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: color }} />
      <span style={{ fontSize: "12px", color: C.textSecondary }}>{label}</span>
      <span style={{ fontSize: "12px", fontFamily: FONT.mono, color: C.textPrimary, fontWeight: 600 }}>{pct}</span>
    </div>
  );
}

function KpiMini({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: "12px",
        background: C.surfaceAlt,
        borderRadius: "6px",
        border: `1px solid ${C.borderLight}`,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "20px", fontWeight: 700, fontFamily: FONT.mono, color: C.textPrimary, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted, marginTop: "4px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
        {label}
      </div>
    </div>
  );
}

function SectorSentimentBreakdown({ sector }: { sector: Sector }) {
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "8px",
        padding: "20px",
        boxShadow: SHADOW.card,
      }}
    >
      <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
        <IconChart size={12} color={sector.accent} />
        Sentiment examples
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <SentimentExample label="Positive" text="L'application mobile est élue meilleure du secteur" score="+0.71" color={C.sage} />
        <SentimentExample label="Neutral" text="Le groupe publie ses résultats semestriels" score="+0.08" color={C.neutral} />
        <SentimentExample label="Negative" text="Les clients dénoncent une hausse des frais" score="-0.61" color={C.red} />
      </div>
    </div>
  );
}

function SentimentExample({ label, text, score, color }: { label: string; text: string; score: string; color: string }) {
  return (
    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
      <span
        style={{
          fontSize: "9px",
          fontFamily: FONT.mono,
          color: color,
          background: color === C.sage ? C.sageBg : color === C.red ? C.redBg : C.neutralBg,
          padding: "3px 6px",
          borderRadius: "2px",
          border: `1px solid ${color === C.sage ? "rgba(74,123,95,0.2)" : color === C.red ? "rgba(160,82,75,0.2)" : "rgba(113,113,122,0.2)"}`,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          fontWeight: 700,
          flexShrink: 0,
          minWidth: "62px",
          textAlign: "center",
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "12px", color: C.textSecondary, lineHeight: 1.5, marginBottom: "2px" }}>{text}</div>
        <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: color, fontWeight: 700 }}>{score}</div>
      </div>
    </div>
  );
}

function SectorAlertExample({ sector }: { sector: Sector }) {
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid rgba(160,82,75,0.3)`,
        borderRadius: "8px",
        padding: "20px",
        boxShadow: SHADOW.card,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
        <IconAlert size={14} color={C.red} />
        <span style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.red, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700 }}>
          Crisis alert example
        </span>
      </div>
      <div style={{ fontSize: "14px", fontWeight: 600, color: C.textPrimary, lineHeight: 1.4, marginBottom: "10px" }}>
        {sector.alertExample.title}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "10px", borderTop: `1px solid ${C.borderLight}` }}>
        <div>
          <span style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted }}>Source: </span>
          <span style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textPrimary, fontWeight: 600 }}>{sector.alertExample.source}</span>
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <span style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted }}>{sector.alertExample.time}</span>
          <span style={{ fontSize: "13px", fontFamily: FONT.mono, color: C.red, fontWeight: 700 }}>
            {sector.alertExample.sentiment}
          </span>
        </div>
      </div>
    </div>
  );
}

function SectorOpportunity({ sector }: { sector: Sector }) {
  return (
    <div
      style={{
        background: sector.accent === C.sage ? C.sageBg : sector.accent === C.accentDark ? "rgba(74,93,110,0.08)" : C.redBg,
        border: `1px solid ${sector.accent === C.sage ? "rgba(74,123,95,0.2)" : sector.accent === C.accentDark ? "rgba(74,93,110,0.2)" : "rgba(160,82,75,0.2)"}`,
        borderRadius: "8px",
        padding: "20px",
      }}
    >
      <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: sector.accent, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px", fontWeight: 700 }}>
        Recommended action
      </div>
      <p style={{ fontSize: "14px", color: C.textPrimary, lineHeight: 1.55, margin: 0 }}>
        {sector.opportunity}
      </p>
    </div>
  );
}

function SectorTopicBreakdown({ sector }: { sector: Sector }) {
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "8px",
        padding: "24px",
        boxShadow: SHADOW.card,
      }}
    >
      <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>
        Topic breakdown — {sector.topics.length} themes tracked
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {sector.topics.map((t, i) => (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <span style={{ fontSize: "13px", color: C.textPrimary, fontWeight: 600 }}>{t.name}</span>
              <span style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted }}>{t.mentions} mentions</span>
            </div>
            <div style={{ display: "flex", height: "6px", borderRadius: "3px", overflow: "hidden", background: C.borderLight }}>
              <div style={{ width: `${t.pos}%`, background: C.sage }} />
              <div style={{ width: `${100 - t.pos - t.neg}%`, background: C.neutral }} />
              <div style={{ width: `${t.neg}%`, background: C.red }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectorSourceBreakdown({ sector }: { sector: Sector }) {
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "8px",
        padding: "24px",
        boxShadow: SHADOW.card,
      }}
    >
      <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>
        Source breakdown — where mentions come from
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {sector.sourceBreakdown.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "12px", color: C.textSecondary, minWidth: "100px" }}>{s.source}</span>
            <div style={{ flex: 1, height: "6px", background: C.surfaceAlt, borderRadius: "3px", overflow: "hidden" }}>
              <div style={{ width: `${s.share}%`, height: "100%", background: sector.accent }} />
            </div>
            <span style={{ fontSize: "12px", fontFamily: FONT.mono, color: C.textPrimary, fontWeight: 600, minWidth: "36px", textAlign: "right" }}>{s.share}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 09 — CROSS-SECTOR COMPARISON
// ═══════════════════════════════════════════════════════════════════════

function CrossSectorComparison() {
  return (
    <section
      style={{
        background: C.surfaceAlt,
        padding: "100px 32px",
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <Eyebrow color={C.sage}>Cross-sector view</Eyebrow>
        <SectionTitle>Compare reputation scores across sectors.</SectionTitle>
        <SectionSub>
          The same dashboard, all six sectors side-by-side. Spot which
          sectors face the most risk, which have the most positive coverage,
          and where AI engines cite your brand most.
        </SectionSub>

        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "8px",
            boxShadow: SHADOW.card,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 16px",
              borderBottom: `1px solid ${C.border}`,
              background: C.surfaceAlt,
            }}
          >
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#E5E5E5" }} />
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#E5E5E5" }} />
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#E5E5E5" }} />
            <span style={{ marginLeft: "8px", fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.04em" }}>
              atelier.harchcorp.com / compare / sectors
            </span>
          </div>

          {/* Table */}
          <div style={{ padding: "24px" }}>
            <ComparisonTable />
          </div>

          {/* Chart */}
          <div
            style={{
              padding: "24px",
              borderTop: `1px solid ${C.borderLight}`,
            }}
          >
            <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "20px" }}>
              Reputation score by sector
            </div>
            <ComparisonBarChart />
          </div>
        </div>
      </div>
    </section>
  );
}

function ComparisonTable() {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: "720px" }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${C.border}` }}>
            <th style={{ textAlign: "left", padding: "12px 8px", fontFamily: FONT.mono, fontSize: "11px", color: C.textMuted, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>Sector</th>
            <th style={{ textAlign: "right", padding: "12px 8px", fontFamily: FONT.mono, fontSize: "11px", color: C.textMuted, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>Score</th>
            <th style={{ textAlign: "right", padding: "12px 8px", fontFamily: FONT.mono, fontSize: "11px", color: C.textMuted, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>Delta</th>
            <th style={{ textAlign: "right", padding: "12px 8px", fontFamily: FONT.mono, fontSize: "11px", color: C.textMuted, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>Mentions</th>
            <th style={{ textAlign: "right", padding: "12px 8px", fontFamily: FONT.mono, fontSize: "11px", color: C.textMuted, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>AI Cites</th>
            <th style={{ textAlign: "left", padding: "12px 8px", fontFamily: FONT.mono, fontSize: "11px", color: C.textMuted, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>Sentiment split</th>
            <th style={{ textAlign: "left", padding: "12px 8px", fontFamily: FONT.mono, fontSize: "11px", color: C.textMuted, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase" }}>Top risk</th>
          </tr>
        </thead>
        <tbody>
          {SECTORS.map((s) => {
            const Icon = getSectorIcon(s.id);
            return (
              <tr key={s.id} style={{ borderBottom: `1px solid ${C.borderLight}`, transition: "background 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = C.surfaceAlt)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ padding: "14px 8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Icon size={16} color={s.accent} />
                    <span style={{ fontWeight: 600, color: C.textPrimary }}>{s.name}</span>
                  </div>
                </td>
                <td style={{ padding: "14px 8px", textAlign: "right", fontFamily: FONT.mono, fontWeight: 700, color: s.accent }}>
                  {s.score}
                </td>
                <td style={{ padding: "14px 8px", textAlign: "right", fontFamily: FONT.mono, color: C.sage, fontWeight: 600 }}>
                  +{s.scoreDelta}
                </td>
                <td style={{ padding: "14px 8px", textAlign: "right", fontFamily: FONT.mono, color: C.textPrimary }}>
                  {s.mentions}
                </td>
                <td style={{ padding: "14px 8px", textAlign: "right", fontFamily: FONT.mono, color: C.textPrimary }}>
                  {s.aiCitations}
                </td>
                <td style={{ padding: "14px 8px" }}>
                  <div style={{ display: "flex", height: "8px", borderRadius: "4px", overflow: "hidden", width: "120px", background: C.borderLight }}>
                    <div style={{ width: `${s.sentiment.pos}%`, background: C.sage }} />
                    <div style={{ width: `${s.sentiment.neu}%`, background: C.neutral }} />
                    <div style={{ width: `${s.sentiment.neg}%`, background: C.red }} />
                  </div>
                </td>
                <td style={{ padding: "14px 8px", fontSize: "12px", color: C.textSecondary }}>
                  {s.riskTopic}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ComparisonBarChart() {
  const maxScore = 100;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {SECTORS.map((s) => {
        const Icon = getSectorIcon(s.id);
        return (
          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ minWidth: "140px", display: "flex", alignItems: "center", gap: "10px" }}>
              <Icon size={16} color={s.accent} />
              <span style={{ fontSize: "13px", fontWeight: 600, color: C.textPrimary }}>{s.name}</span>
            </div>
            <div style={{ flex: 1, height: "28px", background: C.surfaceAlt, borderRadius: "4px", overflow: "hidden", position: "relative" }}>
              <div
                style={{
                  width: `${(s.score / maxScore) * 100}%`,
                  height: "100%",
                  background: `linear-gradient(to right, ${s.accent}, ${s.accent === C.sage ? C.sageBright : s.accent === C.accentDark ? C.accent : C.red})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  paddingRight: "10px",
                }}
              >
                <span style={{ fontSize: "13px", fontFamily: FONT.mono, color: "#FFFFFF", fontWeight: 700 }}>{s.score}</span>
              </div>
            </div>
            <div style={{ minWidth: "80px", fontSize: "12px", fontFamily: FONT.mono, color: C.sage, fontWeight: 600 }}>
              +{s.scoreDelta} pts
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 10 — CTA
// ═══════════════════════════════════════════════════════════════════════

function CTA() {
  return (
    <section
      style={{
        background: C.surface,
        padding: "100px 32px",
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          textAlign: "center",
          padding: "64px 48px",
          background: C.surfaceAlt,
          border: `1px solid ${C.border}`,
          borderRadius: "12px",
          boxShadow: SHADOW.card,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "300px",
            height: "300px",
            background: "radial-gradient(circle, rgba(74,123,95,0.06), transparent 70%)",
            borderRadius: "50%",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "-100px",
            width: "300px",
            height: "300px",
            background: "radial-gradient(circle, rgba(139,157,175,0.06), transparent 70%)",
            borderRadius: "50%",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <Eyebrow color={C.sage}>Your sector, your risks</Eyebrow>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              color: C.textPrimary,
              margin: "0 0 20px",
            }}
          >
            Tell us your sector — we'll show you your risks.
          </h2>
          <p
            style={{
              fontSize: "17px",
              color: C.textSecondary,
              lineHeight: 1.6,
              maxWidth: "560px",
              margin: "0 auto 36px",
            }}
          >
            A free 7-day audit on your brand. Sector-specific topic taxonomy,
            custom alert thresholds, and a board-ready PDF at the end.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="/atelier/audit"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "15px 28px",
                background: C.sage,
                color: "#FFFFFF",
                fontSize: "15px",
                fontWeight: 600,
                textDecoration: "none",
                borderRadius: "3px",
                border: `1px solid ${C.sage}`,
                cursor: "pointer",
                fontFamily: FONT.sans,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = C.sageDark)}
              onMouseLeave={(e) => (e.currentTarget.style.background = C.sage)}
            >
              Start your free audit
              <IconArrow size={16} color="#FFFFFF" />
            </a>
            <a
              href="/atelier/pricing"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "15px 28px",
                background: "transparent",
                color: C.accentDark,
                fontSize: "15px",
                fontWeight: 500,
                textDecoration: "none",
                borderRadius: "3px",
                border: `1px solid ${C.accentDark}`,
                cursor: "pointer",
                fontFamily: FONT.sans,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(74,93,110,0.06)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              See pricing
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// RESPONSIVE STYLES
// ═══════════════════════════════════════════════════════════════════════

function ResponsiveStyles() {
  return (
    <style>{`
      @media (max-width: 900px) {
        .hero-stats { grid-template-columns: repeat(3, 1fr) !important; }
        .sector-grid { grid-template-columns: 1fr !important; }
        .deepdive-grid { grid-template-columns: 1fr !important; }
        .deepdive-bottom { grid-template-columns: 1fr !important; }
      }
      @media (max-width: 640px) {
        .hero-stats { grid-template-columns: repeat(2, 1fr) !important; }
      }
    `}</style>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════

export default function UseCasesPage() {
  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <AtelierNav />
      <main style={{ background: C.bg, color: C.textPrimary, fontFamily: FONT.sans }}>
        <Hero />
        <SectorOverview />
        <SectorDeepDive sector={SECTORS[0]} />
        <SectorDeepDive sector={SECTORS[1]} alt />
        <SectorDeepDive sector={SECTORS[2]} />
        <SectorDeepDive sector={SECTORS[3]} alt />
        <SectorDeepDive sector={SECTORS[4]} />
        <SectorDeepDive sector={SECTORS[5]} alt />
        <CrossSectorComparison />
        <CTA />
      </main>
      <AtelierFooter />
      <BackToTop />
      <ResponsiveStyles />
    </>
  );
}
