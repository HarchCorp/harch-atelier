(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/mock-data.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Harch Atelier — Mock intelligence dataset (V12.0)
 *
 * Stand-in data for the Enterprise Risk Intelligence UI. In production these
 * shapes are populated by the GLMAnalysis / Alert / Watchlist tables via the
 * API. Here they are deterministic so every chart renders on first paint.
 *
 * Strict typing — no `any`.
 */ __turbopack_context__.s([
    "alertItems",
    ()=>alertItems,
    "articlesByEvent",
    ()=>articlesByEvent,
    "coverage30d",
    ()=>coverage30d,
    "entitiesByEvent",
    ()=>entitiesByEvent,
    "entitiesList",
    ()=>entitiesList,
    "entityIndex",
    ()=>entityIndex,
    "geoRegions",
    ()=>geoRegions,
    "getArticlesFor",
    ()=>getArticlesFor,
    "getEntitiesFor",
    ()=>getEntitiesFor,
    "getEventsForEntity",
    ()=>getEventsForEntity,
    "headlineKpis",
    ()=>headlineKpis,
    "navByAccountType",
    ()=>navByAccountType,
    "peakToEventId",
    ()=>peakToEventId,
    "pillarAgg",
    ()=>pillarAgg,
    "regionIndex",
    ()=>regionIndex,
    "regionNames",
    ()=>regionNames,
    "riskEvents",
    ()=>riskEvents,
    "riskPointToEvent",
    ()=>riskPointToEvent,
    "riskPoints",
    ()=>riskPoints,
    "riskTrend90d",
    ()=>riskTrend90d,
    "sentiment12m",
    ()=>sentiment12m,
    "sentimentColor",
    ()=>sentimentColor,
    "severityColor",
    ()=>severityColor,
    "shareOfVoice",
    ()=>shareOfVoice,
    "sliceCoverage",
    ()=>sliceCoverage,
    "sourceIndex",
    ()=>sourceIndex,
    "topSources",
    ()=>topSources,
    "watchlistSignals",
    ()=>watchlistSignals
]);
const riskPoints = [
    {
        id: "RSK-0481",
        name: "SEC 10-K restatement inquiry",
        frequency: 78,
        mediaImpact: 91,
        articles: 412,
        severity: "critical",
        pillar: "Regulatory",
        region: "NA"
    },
    {
        id: "RSK-0472",
        name: "Ransomware payload on EU logistics",
        frequency: 64,
        mediaImpact: 88,
        articles: 327,
        severity: "critical",
        pillar: "Cyber",
        region: "EU"
    },
    {
        id: "RSK-0455",
        name: "Insider trading allegations",
        frequency: 41,
        mediaImpact: 84,
        articles: 238,
        severity: "high",
        pillar: "Financial",
        region: "NA"
    },
    {
        id: "RSK-0448",
        name: "Scope-3 emissions misreporting",
        frequency: 33,
        mediaImpact: 76,
        articles: 191,
        severity: "high",
        pillar: "ESG",
        region: "EU"
    },
    {
        id: "RSK-0431",
        name: "Export-control probe (APAC)",
        frequency: 57,
        mediaImpact: 71,
        articles: 286,
        severity: "high",
        pillar: "Geopolitical",
        region: "APAC"
    },
    {
        id: "RSK-0419",
        name: "CEO social-media controversy",
        frequency: 49,
        mediaImpact: 69,
        articles: 174,
        severity: "high",
        pillar: "Reputational",
        region: "NA"
    },
    {
        id: "RSK-0402",
        name: "Supplier labor-law lawsuit",
        frequency: 28,
        mediaImpact: 63,
        articles: 132,
        severity: "medium",
        pillar: "ESG",
        region: "APAC"
    },
    {
        id: "RSK-0388",
        name: "Patent infringement (District Ct.)",
        frequency: 22,
        mediaImpact: 58,
        articles: 98,
        severity: "medium",
        pillar: "Financial",
        region: "NA"
    },
    {
        id: "RSK-0375",
        name: "Cloud region outage — US-East",
        frequency: 38,
        mediaImpact: 44,
        articles: 119,
        severity: "medium",
        pillar: "Cyber",
        region: "NA"
    },
    {
        id: "RSK-0361",
        name: "FX hedging disclosure gap",
        frequency: 19,
        mediaImpact: 51,
        articles: 77,
        severity: "medium",
        pillar: "Financial",
        region: "EU"
    },
    {
        id: "RSK-0349",
        name: "Board composition criticism",
        frequency: 12,
        mediaImpact: 47,
        articles: 54,
        severity: "low",
        pillar: "Reputational",
        region: "NA"
    },
    {
        id: "RSK-0333",
        name: "Trade-secret claim (supplier)",
        frequency: 9,
        mediaImpact: 38,
        articles: 41,
        severity: "low",
        pillar: "Financial",
        region: "NA"
    },
    {
        id: "RSK-0320",
        name: "Diversity report backlash",
        frequency: 16,
        mediaImpact: 29,
        articles: 63,
        severity: "low",
        pillar: "ESG",
        region: "NA"
    },
    {
        id: "RSK-0308",
        name: "Sanctions list naming error",
        frequency: 71,
        mediaImpact: 24,
        articles: 221,
        severity: "medium",
        pillar: "Geopolitical",
        region: "APAC"
    },
    {
        id: "RSK-0294",
        name: "App-store policy complaint",
        frequency: 53,
        mediaImpact: 18,
        articles: 158,
        severity: "low",
        pillar: "Reputational",
        region: "NA"
    },
    {
        id: "RSK-0281",
        name: "Greenwashing op-ed pickup",
        frequency: 84,
        mediaImpact: 33,
        articles: 264,
        severity: "medium",
        pillar: "ESG",
        region: "EU"
    }
];
const shareOfVoice = [
    {
        name: "HarchCorp",
        value: 1284,
        isTarget: true
    },
    {
        name: "Northwind",
        value: 842,
        isTarget: false
    },
    {
        name: "Vela Dynamics",
        value: 617,
        isTarget: false
    },
    {
        name: "Orbital Systems",
        value: 438,
        isTarget: false
    },
    {
        name: "Kessler & Vale",
        value: 293,
        isTarget: false
    },
    {
        name: "Other",
        value: 412,
        isTarget: false
    }
];
/* ------------------------------------------------------------------ */ /*  Media Coverage — last 30 days                                      */ /* ------------------------------------------------------------------ */ function isoDaysAgo(days) {
    const d = new Date(2025, 0, 31); // anchored reference date for deterministic output
    d.setDate(d.getDate() - days);
    return d.toISOString().slice(0, 10);
}
const coverage30d = Array.from({
    length: 30
}, (_, i)=>{
    const day = 29 - i;
    // deterministic pseudo-pattern so the chart looks alive but is stable
    const positive = Math.round(38 + 22 * Math.sin(i / 2.3) + 14 * Math.cos(i / 1.1) + i % 5);
    const negative = Math.round(26 + 19 * Math.sin(i / 1.7 + 1) + 11 * Math.cos(i / 3.1) - i % 4);
    return {
        date: isoDaysAgo(day),
        positive: Math.max(8, positive),
        negative: Math.max(4, negative)
    };
});
/* ------------------------------------------------------------------ */ /*  Sentiment Trend — 12 months                                        */ /* ------------------------------------------------------------------ */ const monthLabels = [
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
    "Jan"
];
const sentiment12m = monthLabels.map((month, i)=>{
    const positive = Math.round(120 + 55 * Math.sin(i / 1.4) + 20 * Math.cos(i / 2.6));
    const negative = Math.round(95 + 48 * Math.sin(i / 1.9 + 0.8) + 16 * Math.cos(i / 3.3));
    return {
        month,
        positive: Math.max(40, positive),
        negative: Math.max(30, negative)
    };
});
const riskEvents = [
    {
        id: "EVT-9821",
        date: "2025-01-29",
        pillar: "Regulatory",
        title: "SEC opens informal inquiry into Q4 revenue recognition",
        articles: 86,
        sentiment: "negative",
        severity: "critical",
        region: "NA"
    },
    {
        id: "EVT-9814",
        date: "2025-01-29",
        pillar: "Cyber",
        title: "Ransomware affiliate claims exfiltration of 2.1 TB logistics data",
        articles: 74,
        sentiment: "negative",
        severity: "critical",
        region: "EU"
    },
    {
        id: "EVT-9802",
        date: "2025-01-28",
        pillar: "Geopolitical",
        title: "Export-control authority requests documentation on APAC shipments",
        articles: 63,
        sentiment: "negative",
        severity: "high",
        region: "APAC"
    },
    {
        id: "EVT-9795",
        date: "2025-01-28",
        pillar: "ESG",
        title: "NGO report disputes Scope-3 emissions methodology in annual filing",
        articles: 58,
        sentiment: "negative",
        severity: "high",
        region: "EU"
    },
    {
        id: "EVT-9783",
        date: "2025-01-27",
        pillar: "Reputational",
        title: "Major outlet runs op-ed critical of board refresh process",
        articles: 47,
        sentiment: "negative",
        severity: "medium",
        region: "NA"
    },
    {
        id: "EVT-9771",
        date: "2025-01-27",
        pillar: "Financial",
        title: "Analyst downgrade cites margin compression in services segment",
        articles: 41,
        sentiment: "negative",
        severity: "medium",
        region: "NA"
    },
    {
        id: "EVT-9764",
        date: "2025-01-26",
        pillar: "Cyber",
        title: "Cloud region outage triggers SLA breach notices for enterprise tier",
        articles: 39,
        sentiment: "neutral",
        severity: "medium",
        region: "NA"
    },
    {
        id: "EVT-9758",
        date: "2025-01-26",
        pillar: "Regulatory",
        title: "EU privacy regulator extends retention-period review by 60 days",
        articles: 34,
        sentiment: "neutral",
        severity: "low",
        region: "EU"
    },
    {
        id: "EVT-9749",
        date: "2025-01-25",
        pillar: "ESG",
        title: "Supplier labor audit publishes conditional pass with remediation plan",
        articles: 31,
        sentiment: "positive",
        severity: "low",
        region: "APAC"
    },
    {
        id: "EVT-9736",
        date: "2025-01-25",
        pillar: "Financial",
        title: "Patent infringement ruling partially overturned on appeal",
        articles: 28,
        sentiment: "positive",
        severity: "medium",
        region: "NA"
    },
    {
        id: "EVT-9722",
        date: "2025-01-24",
        pillar: "Geopolitical",
        title: "Sanctions screening vendor confirms false-positive naming error",
        articles: 26,
        sentiment: "positive",
        severity: "low",
        region: "APAC"
    },
    {
        id: "EVT-9710",
        date: "2025-01-24",
        pillar: "Reputational",
        title: "Trade publication names CTO to annual innovation list",
        articles: 22,
        sentiment: "positive",
        severity: "low",
        region: "NA"
    },
    {
        id: "EVT-9704",
        date: "2025-01-23",
        pillar: "Financial",
        title: "Insider trading complaint amended; named individual departs firm",
        articles: 19,
        sentiment: "negative",
        severity: "high",
        region: "NA"
    },
    {
        id: "EVT-9691",
        date: "2025-01-23",
        pillar: "ESG",
        title: "Regional minister endorses water-stewardship pilot at facility 04",
        articles: 17,
        sentiment: "positive",
        severity: "low",
        region: "MEA"
    }
];
const watchlistSignals = [
    {
        id: "WL-001",
        ticker: "HRCH",
        entity: "HarchCorp",
        signal: "SEC inquiry — revenue recognition",
        pillar: "Regulatory",
        severity: "critical",
        delta: -3.4,
        articles: 86,
        updatedAt: "12m ago"
    },
    {
        id: "WL-002",
        ticker: "HRCH",
        entity: "HarchCorp",
        signal: "Ransomware claim — logistics data",
        pillar: "Cyber",
        severity: "critical",
        delta: -2.1,
        articles: 74,
        updatedAt: "24m ago"
    },
    {
        id: "WL-003",
        ticker: "HRCH",
        entity: "HarchCorp",
        signal: "Analyst downgrade — services margin",
        pillar: "Financial",
        severity: "high",
        delta: -1.7,
        articles: 41,
        updatedAt: "1h ago"
    },
    {
        id: "WL-004",
        ticker: "HRCH",
        entity: "HarchCorp",
        signal: "Export-control documentation request",
        pillar: "Geopolitical",
        severity: "high",
        delta: -0.9,
        articles: 63,
        updatedAt: "2h ago"
    },
    {
        id: "WL-005",
        ticker: "HRCH",
        entity: "HarchCorp",
        signal: "NGO Scope-3 methodology dispute",
        pillar: "ESG",
        severity: "high",
        delta: -0.6,
        articles: 58,
        updatedAt: "3h ago"
    },
    {
        id: "WL-006",
        ticker: "HRCH",
        entity: "HarchCorp",
        signal: "Patent ruling partially overturned",
        pillar: "Financial",
        severity: "medium",
        delta: +1.2,
        articles: 28,
        updatedAt: "5h ago"
    },
    {
        id: "WL-007",
        ticker: "HRCH",
        entity: "HarchCorp",
        signal: "Supplier labor audit — conditional pass",
        pillar: "ESG",
        severity: "low",
        delta: +0.4,
        articles: 31,
        updatedAt: "6h ago"
    },
    {
        id: "WL-008",
        ticker: "HRCH",
        entity: "HarchCorp",
        signal: "Innovation list — CTO named",
        pillar: "Reputational",
        severity: "low",
        delta: +0.3,
        articles: 22,
        updatedAt: "8h ago"
    }
];
const severityColor = {
    critical: {
        text: "text-rose-700",
        bg: "bg-rose-50",
        dot: "bg-rose-500",
        ring: "ring-rose-200"
    },
    high: {
        text: "text-orange-700",
        bg: "bg-orange-50",
        dot: "bg-orange-500",
        ring: "ring-orange-200"
    },
    medium: {
        text: "text-amber-700",
        bg: "bg-amber-50",
        dot: "bg-amber-400",
        ring: "ring-amber-200"
    },
    low: {
        text: "text-slate-600",
        bg: "bg-slate-100",
        dot: "bg-slate-400",
        ring: "ring-slate-200"
    }
};
const sentimentColor = {
    positive: {
        text: "text-emerald-700",
        bg: "bg-emerald-50",
        dot: "bg-emerald-500"
    },
    negative: {
        text: "text-rose-700",
        bg: "bg-rose-50",
        dot: "bg-rose-500"
    },
    neutral: {
        text: "text-slate-600",
        bg: "bg-slate-100",
        dot: "bg-slate-400"
    }
};
const headlineKpis = {
    riskIndex: 72.4,
    riskIndexDelta: +4.1,
    coverage30d: coverage30d.reduce((s, d)=>s + d.positive + d.negative, 0),
    coverageDelta: +12.3,
    negativeShare: Math.round(coverage30d.reduce((s, d)=>s + d.negative, 0) / coverage30d.reduce((s, d)=>s + d.positive + d.negative, 0) * 100),
    negativeShareDelta: +2.8,
    activeAlerts: 17,
    alertsDelta: +5
};
const navByAccountType = {
    admin: [
        {
            label: "Overview",
            href: "#overview"
        },
        {
            label: "Risk Matrix",
            href: "#matrix"
        },
        {
            label: "Coverage",
            href: "#coverage"
        },
        {
            label: "Alerts",
            href: "#alerts"
        },
        {
            label: "Entities",
            href: "#entities"
        },
        {
            label: "Audit Log",
            href: "#audit"
        },
        {
            label: "Settings",
            href: "#settings"
        }
    ],
    trader: [
        {
            label: "Signals",
            href: "#signals"
        },
        {
            label: "Risk Matrix",
            href: "#matrix"
        },
        {
            label: "Coverage",
            href: "#coverage"
        },
        {
            label: "Watchlist",
            href: "#watchlist"
        },
        {
            label: "Alerts",
            href: "#alerts"
        }
    ],
    legal: [
        {
            label: "Overview",
            href: "#overview"
        },
        {
            label: "Regulatory",
            href: "#regulatory"
        },
        {
            label: "Matters",
            href: "#matters"
        },
        {
            label: "Hold Notices",
            href: "#holds"
        },
        {
            label: "Alerts",
            href: "#alerts"
        }
    ],
    market: [
        {
            label: "Overview",
            href: "#overview"
        },
        {
            label: "Risk Matrix",
            href: "#matrix"
        },
        {
            label: "Coverage",
            href: "#coverage"
        },
        {
            label: "Sentiment",
            href: "#sentiment"
        },
        {
            label: "Share of Voice",
            href: "#sov"
        },
        {
            label: "Alerts",
            href: "#alerts"
        }
    ],
    self: [
        {
            label: "Overview",
            href: "#overview"
        },
        {
            label: "Coverage",
            href: "#coverage"
        },
        {
            label: "Alerts",
            href: "#alerts"
        }
    ],
    pr: [
        {
            label: "Overview",
            href: "#overview"
        },
        {
            label: "Sentiment",
            href: "#sentiment"
        },
        {
            label: "Share of Voice",
            href: "#sov"
        },
        {
            label: "Coverage",
            href: "#coverage"
        },
        {
            label: "Alerts",
            href: "#alerts"
        }
    ]
};
const outlets = [
    {
        name: "Financial Times",
        tier: "tier1",
        reach: 4_200_000
    },
    {
        name: "Reuters",
        tier: "tier1",
        reach: 8_900_000
    },
    {
        name: "Bloomberg",
        tier: "tier1",
        reach: 6_100_000
    },
    {
        name: "Wall Street Journal",
        tier: "tier1",
        reach: 3_800_000
    },
    {
        name: "The Economist",
        tier: "tier1",
        reach: 1_650_000
    },
    {
        name: "Le Monde",
        tier: "tier1",
        reach: 2_100_000
    },
    {
        name: "Handelsblatt",
        tier: "tier2",
        reach: 980_000
    },
    {
        name: "TechCrunch",
        tier: "tier2",
        reach: 1_400_000
    },
    {
        name: "The Information",
        tier: "tier2",
        reach: 320_000
    },
    {
        name: "S&P Global",
        tier: "tier2",
        reach: 760_000
    },
    {
        name: "GlobalData",
        tier: "tier3",
        reach: 180_000
    },
    {
        name: "OSINT Wire",
        tier: "tier3",
        reach: 95_000
    },
    {
        name: "Sector Monitor",
        tier: "tier3",
        reach: 140_000
    }
];
const headlineBank = {
    Regulatory: [
        "Regulator confirms informal inquiry into Q4 revenue recognition practices",
        "Compliance filing reveals expanded scope of disclosure review",
        "Securities authority requests additional documentation on segment reporting",
        "Legal counsel issues statement on cooperative posture with inquiry"
    ],
    Cyber: [
        "Ransomware affiliate posts sample data as proof of exfiltration",
        "Security researchers link incident to known threat-actor cluster",
        "Incident response firm engaged; containment timeline under review",
        "Customer notification drafted; regulator briefed within 72h window"
    ],
    Financial: [
        "Sell-side analyst downgrades on margin compression signals",
        "Earnings revision cites services-segment softness and FX headwinds",
        "Bondholders seek clarification on covenant headroom",
        "Hedge funds build defensive positions ahead of print"
    ],
    ESG: [
        "NGO report challenges methodology behind Scope-3 disclosure",
        "Investor coalition files shareholder proposal on transition plan",
        "Audit firm issues conditional pass with remediation milestones",
        "Regional minister endorses water-stewardship pilot at facility"
    ],
    Geopolitical: [
        "Export-control authority requests documentation on APAC shipments",
        "Sanctions screening vendor confirms false-positive naming error",
        "Trade ministry requests briefing on dual-use classification",
        "Customs hold lifted pending classification review"
    ],
    Reputational: [
        "Op-ed criticizes board refresh cadence and independence",
        "Trade publication names CTO to annual innovation list",
        "Social-media controversy drives spike in negative mentions",
        "Diversity report draws mixed coverage across outlets"
    ]
};
const languages = [
    "en",
    "en",
    "en",
    "en",
    "fr",
    "de",
    "es",
    "zh"
];
function buildArticlesForEvent(ev, count) {
    const heads = headlineBank[ev.pillar];
    return Array.from({
        length: count
    }, (_, i)=>{
        const outlet = outlets[(i + ev.title.length) % outlets.length];
        const head = heads[(i + ev.id.length) % heads.length];
        const daysAgo = i % 6;
        const d = new Date(2025, 0, 29 - daysAgo, 8 + i % 10, i * 7 % 60);
        const sentimentRoll = (i + ev.articles) % 10;
        const sentiment = ev.sentiment === "negative" ? sentimentRoll < 7 ? "negative" : sentimentRoll < 9 ? "neutral" : "positive" : ev.sentiment === "positive" ? sentimentRoll < 7 ? "positive" : "neutral" : "neutral";
        return {
            id: `ART-${ev.id.replace("EVT-", "")}-${String(i + 1).padStart(3, "0")}`,
            eventId: ev.id,
            headline: head,
            source: outlet.name,
            tier: outlet.tier,
            url: "#",
            publishedAt: d.toISOString(),
            sentiment,
            reach: outlet.reach - i % 5 * 12000,
            language: languages[(i + ev.pillar.length) % languages.length]
        };
    });
}
const articlesByEvent = Object.fromEntries(riskEvents.map((ev)=>[
        ev.id,
        buildArticlesForEvent(ev, Math.min(12, ev.articles))
    ]));
const entitiesByEvent = Object.fromEntries(riskEvents.map((ev, i)=>[
        ev.id,
        [
            "HarchCorp",
            "HarchCorp Logistics",
            "HarchCorp Capital",
            "HarchCorp Labs",
            "Facility 04",
            "APAC Sub"
        ].slice(0, i % 3 + 2)
    ]));
const entityIndex = (()=>{
    const m = new Map();
    for (const ev of riskEvents){
        const ents = entitiesByEvent[ev.id] ?? [];
        for (const e of ents){
            if (!m.has(e)) m.set(e, []);
            m.get(e).push(ev);
        }
    }
    return m;
})();
const entitiesList = [
    ...entityIndex.keys()
].sort();
function getEventsForEntity(entity) {
    return entityIndex.get(entity) ?? [];
}
const _articlesCache = new Map();
const _entitiesCache = new Map();
function getArticlesFor(ev) {
    const cached = _articlesCache.get(ev.id) ?? articlesByEvent[ev.id];
    if (cached) return cached;
    const fresh = buildArticlesForEvent(ev, Math.min(12, ev.articles));
    _articlesCache.set(ev.id, fresh);
    return fresh;
}
function getEntitiesFor(ev, index = 0) {
    const cached = _entitiesCache.get(ev.id) ?? entitiesByEvent[ev.id];
    if (cached) return cached;
    const fresh = [
        "HarchCorp",
        "HarchCorp Logistics",
        "HarchCorp Capital",
        "HarchCorp Labs",
        "Facility 04",
        "APAC Sub"
    ].slice(0, index % 3 + 2);
    _entitiesCache.set(ev.id, fresh);
    return fresh;
}
function riskPointToEvent(p, index = 0) {
    const sentiment = p.severity === "critical" || p.severity === "high" ? "negative" : p.severity === "medium" ? "neutral" : "positive";
    const d = new Date(2025, 0, 30 - index % 5);
    return {
        id: p.id,
        date: d.toISOString().slice(0, 10),
        pillar: p.pillar,
        title: p.name,
        articles: p.articles,
        sentiment,
        severity: p.severity,
        region: p.region
    };
}
const pillarAgg = (()=>{
    const map = new Map();
    for (const p of [
        "Regulatory",
        "Cyber",
        "Financial",
        "ESG",
        "Geopolitical",
        "Reputational"
    ]){
        map.set(p, {
            pillar: p,
            events: 0,
            articles: 0,
            exposure: 0,
            sentimentSkew: 0
        });
    }
    for (const e of riskEvents){
        const row = map.get(e.pillar);
        row.events += 1;
        row.articles += e.articles;
        row.sentimentSkew += e.sentiment === "negative" ? -1 : e.sentiment === "positive" ? 1 : 0;
    }
    const maxArticles = Math.max(...[
        ...map.values()
    ].map((r)=>r.articles), 1);
    for (const row of map.values()){
        // exposure = weighted blend of volume + severity-weighted event count
        const criticalHits = riskEvents.filter((e)=>e.pillar === row.pillar && (e.severity === "critical" || e.severity === "high")).length;
        row.exposure = Math.min(100, Math.round(row.articles / maxArticles * 60 + criticalHits * 12 + row.events * 3));
        row.sentimentSkew = Math.max(-100, Math.min(100, Math.round(row.sentimentSkew / Math.max(row.events, 1) * 100)));
    }
    return [
        ...map.values()
    ].sort((a, b)=>b.exposure - a.exposure);
})();
const topSources = [
    {
        source: "Reuters",
        tier: "tier1",
        articles: 312,
        positive: 98,
        negative: 154,
        neutral: 60,
        reach: 8_900_000
    },
    {
        source: "Bloomberg",
        tier: "tier1",
        articles: 284,
        positive: 86,
        negative: 142,
        neutral: 56,
        reach: 6_100_000
    },
    {
        source: "Financial Times",
        tier: "tier1",
        articles: 241,
        positive: 79,
        negative: 118,
        neutral: 44,
        reach: 4_200_000
    },
    {
        source: "Wall Street Journal",
        tier: "tier1",
        articles: 198,
        positive: 61,
        negative: 102,
        neutral: 35,
        reach: 3_800_000
    },
    {
        source: "Le Monde",
        tier: "tier1",
        articles: 156,
        positive: 48,
        negative: 84,
        neutral: 24,
        reach: 2_100_000
    },
    {
        source: "TechCrunch",
        tier: "tier2",
        articles: 143,
        positive: 72,
        negative: 51,
        neutral: 20,
        reach: 1_400_000
    },
    {
        source: "The Economist",
        tier: "tier1",
        articles: 119,
        positive: 34,
        negative: 68,
        neutral: 17,
        reach: 1_650_000
    },
    {
        source: "Handelsblatt",
        tier: "tier2",
        articles: 96,
        positive: 28,
        negative: 52,
        neutral: 16,
        reach: 980_000
    }
];
function sliceCoverage(range) {
    if (range === "30d") return coverage30d;
    if (range === "7d") return coverage30d.slice(-7);
    // 90d — synthesize by repeating the 30d pattern twice more with a slight drift
    const base = coverage30d;
    const extended = [];
    for(let cycle = 2; cycle >= 0; cycle--){
        for(let i = 0; i < base.length; i++){
            const drift = cycle * 0.85;
            extended.push({
                date: base[i].date,
                positive: Math.round(base[i].positive * drift + cycle * 4),
                negative: Math.round(base[i].negative * drift + cycle * 3)
            });
        }
    }
    // re-anchor dates so the 90d window ends "today"
    const today = new Date(2025, 0, 31);
    return extended.map((d, idx)=>{
        const dt = new Date(today);
        dt.setDate(dt.getDate() - (extended.length - 1 - idx));
        return {
            ...d,
            date: dt.toISOString().slice(0, 10)
        };
    });
}
const geoRegions = [
    {
        code: "NA",
        name: "North America",
        intensity: 82,
        signals: 14,
        articles: 487,
        sentimentSkew: -28,
        topPillar: "Regulatory"
    },
    {
        code: "EU",
        name: "Europe",
        intensity: 74,
        signals: 11,
        articles: 392,
        sentimentSkew: -14,
        topPillar: "Regulatory"
    },
    {
        code: "APAC",
        name: "Asia-Pacific",
        intensity: 63,
        signals: 9,
        articles: 271,
        sentimentSkew: -41,
        topPillar: "Geopolitical"
    },
    {
        code: "MEA",
        name: "Middle East & Africa",
        intensity: 38,
        signals: 4,
        articles: 118,
        sentimentSkew: -8,
        topPillar: "Cyber"
    },
    {
        code: "LATAM",
        name: "Latin America",
        intensity: 29,
        signals: 3,
        articles: 84,
        sentimentSkew: +12,
        topPillar: "ESG"
    }
];
const sourceIndex = (()=>{
    const m = new Map();
    for (const ev of riskEvents){
        const arts = getArticlesFor(ev);
        for (const a of arts){
            if (!m.has(a.source)) m.set(a.source, new Set());
            m.get(a.source).add(ev.id);
        }
    }
    return m;
})();
const regionIndex = (()=>{
    const m = new Map();
    for (const ev of riskEvents){
        if (!m.has(ev.region)) m.set(ev.region, new Set());
        m.get(ev.region).add(ev.id);
    }
    return m;
})();
const regionNames = Object.fromEntries(geoRegions.map((r)=>[
        r.code,
        r.name
    ]));
function buildRiskTrend90d() {
    const points = [];
    const today = new Date();
    for(let i = 89; i >= 0; i--){
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const t = 89 - i; // 0..89
        // Smooth pseudo-random walk centered around 65 with occasional spikes.
        const base = 62 + 8 * Math.sin(t / 7.5) + 6 * Math.cos(t / 13.2);
        const noise = (t * 9301 + 49297) % 233280 / 233280 * 8 - 4;
        const index = Math.max(18, Math.min(96, Math.round(base + noise)));
        const point = {
            day: 89 - i,
            date: d.toISOString().slice(0, 10),
            index
        };
        // Mark the 3 highest peaks.
        if (t === 17) point.peak = "SEC inquiry leak";
        if (t === 44) point.peak = "Ransomware claim";
        if (t === 71) point.peak = "Analyst downgrade";
        points.push(point);
    }
    return points;
}
const riskTrend90d = buildRiskTrend90d();
const peakToEventId = {
    "SEC inquiry leak": "EVT-9821",
    "Ransomware claim": "EVT-9814",
    "Analyst downgrade": "EVT-9771"
};
function isoMinutesAgo(min) {
    const d = new Date();
    d.setMinutes(d.getMinutes() - min);
    return d.toISOString();
}
const alertItems = [
    {
        id: "ALT-5012",
        eventId: "EVT-9821",
        title: "SEC inquiry — Q4 revenue recognition",
        pillar: "Regulatory",
        severity: "critical",
        triggeredAt: isoMinutesAgo(2),
        status: "new"
    },
    {
        id: "ALT-5011",
        eventId: "EVT-9814",
        title: "Ransomware affiliate claims exfiltration",
        pillar: "Cyber",
        severity: "critical",
        triggeredAt: isoMinutesAgo(8),
        status: "new"
    },
    {
        id: "ALT-5010",
        eventId: "EVT-9802",
        title: "Export-control documentation request",
        pillar: "Geopolitical",
        severity: "high",
        triggeredAt: isoMinutesAgo(21),
        status: "new"
    },
    {
        id: "ALT-5009",
        eventId: "EVT-9795",
        title: "NGO Scope-3 methodology dispute",
        pillar: "ESG",
        severity: "high",
        triggeredAt: isoMinutesAgo(37),
        status: "new"
    },
    {
        id: "ALT-5008",
        eventId: "EVT-9783",
        title: "Op-ed critical of board refresh",
        pillar: "Reputational",
        severity: "medium",
        triggeredAt: isoMinutesAgo(54),
        status: "acknowledged"
    },
    {
        id: "ALT-5007",
        eventId: "EVT-9771",
        title: "Analyst downgrade — services margin",
        pillar: "Financial",
        severity: "medium",
        triggeredAt: isoMinutesAgo(73),
        status: "acknowledged"
    },
    {
        id: "ALT-5006",
        eventId: "EVT-9764",
        title: "Cloud region outage — SLA breach",
        pillar: "Cyber",
        severity: "medium",
        triggeredAt: isoMinutesAgo(96),
        status: "escalated"
    },
    {
        id: "ALT-5005",
        eventId: "EVT-9704",
        title: "Insider trading complaint amended",
        pillar: "Financial",
        severity: "high",
        triggeredAt: isoMinutesAgo(128),
        status: "escalated"
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/risk-store.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "actionStateMeta",
    ()=>actionStateMeta,
    "actionToAlertStatus",
    ()=>actionToAlertStatus,
    "filterRiskEvents",
    ()=>filterRiskEvents,
    "useActionState",
    ()=>useActionState,
    "useRiskStore",
    ()=>useRiskStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/middleware.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/mock-data.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
const defaultFilters = {
    pillar: "all",
    severity: "all",
    status: "all",
    source: "all",
    region: "all",
    query: ""
};
const useRiskStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])()((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["persist"])((set, get)=>({
        actions: {},
        readAlerts: {},
        filters: {
            ...defaultFilters
        },
        selected: new Set(),
        savedViews: [],
        activity: [],
        setAction: (eventId, state, label)=>set((s)=>{
                const nextActions = {
                    ...s.actions,
                    [eventId]: state
                };
                const verb = state === "acknowledged" ? "Acknowledged" : state === "escalated" ? "Escalated" : state === "watching" ? "Watching" : "Set";
                const entry = {
                    id: `act-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
                    type: state === "acknowledged" ? "acknowledge" : state === "escalated" ? "escalate" : state === "watching" ? "watch" : "acknowledge",
                    label: label ? `${verb} "${label}"` : `${verb} ${eventId}`,
                    detail: eventId,
                    ts: Date.now()
                };
                return {
                    actions: nextActions,
                    activity: [
                        entry,
                        ...s.activity
                    ].slice(0, 50)
                };
            }),
        getAction: (eventId)=>get().actions[eventId] ?? "pending",
        markAlertRead: (alertId)=>set((s)=>({
                    readAlerts: {
                        ...s.readAlerts,
                        [alertId]: true
                    }
                })),
        markAllAlertsRead: (alertIds)=>set((s)=>{
                const next = {
                    ...s.readAlerts
                };
                for (const id of alertIds)next[id] = true;
                return {
                    readAlerts: next
                };
            }),
        acknowledgeAll: (alertIds, eventIds)=>set((s)=>{
                const nextActions = {
                    ...s.actions
                };
                const nextReads = {
                    ...s.readAlerts
                };
                for (const id of eventIds)nextActions[id] = "acknowledged";
                for (const id of alertIds)nextReads[id] = true;
                return {
                    actions: nextActions,
                    readAlerts: nextReads
                };
            }),
        isAlertRead: (alertId)=>get().readAlerts[alertId] === true,
        setFilter: (key, value)=>set((s)=>({
                    filters: {
                        ...s.filters,
                        [key]: value
                    }
                })),
        resetFilters: ()=>set({
                filters: {
                    ...defaultFilters
                }
            }),
        toggleSelected: (eventId)=>set((s)=>{
                const next = new Set(s.selected);
                if (next.has(eventId)) next.delete(eventId);
                else next.add(eventId);
                return {
                    selected: next
                };
            }),
        setSelected: (eventIds)=>set({
                selected: new Set(eventIds)
            }),
        clearSelected: ()=>set({
                selected: new Set()
            }),
        bulkAcknowledge: ()=>set((s)=>{
                if (s.selected.size === 0) return s;
                const nextActions = {
                    ...s.actions
                };
                for (const id of s.selected)nextActions[id] = "acknowledged";
                const count = s.selected.size;
                const entry = {
                    id: `act-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
                    type: "bulk-acknowledge",
                    label: `Bulk acknowledged ${count} event${count > 1 ? "s" : ""}`,
                    ts: Date.now()
                };
                return {
                    actions: nextActions,
                    selected: new Set(),
                    activity: [
                        entry,
                        ...s.activity
                    ].slice(0, 50)
                };
            }),
        bulkEscalate: ()=>set((s)=>{
                if (s.selected.size === 0) return s;
                const nextActions = {
                    ...s.actions
                };
                for (const id of s.selected)nextActions[id] = "escalated";
                const count = s.selected.size;
                const entry = {
                    id: `act-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
                    type: "bulk-escalate",
                    label: `Bulk escalated ${count} event${count > 1 ? "s" : ""}`,
                    ts: Date.now()
                };
                return {
                    actions: nextActions,
                    selected: new Set(),
                    activity: [
                        entry,
                        ...s.activity
                    ].slice(0, 50)
                };
            }),
        saveView: (name)=>set((s)=>{
                const view = {
                    id: `view-${Date.now().toString(36)}`,
                    name: name.trim() || `View ${s.savedViews.length + 1}`,
                    filters: {
                        ...s.filters
                    },
                    createdAt: Date.now()
                };
                const entry = {
                    id: `act-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
                    type: "save-view",
                    label: `Saved view "${view.name}"`,
                    ts: Date.now()
                };
                return {
                    savedViews: [
                        ...s.savedViews,
                        view
                    ],
                    activity: [
                        entry,
                        ...s.activity
                    ].slice(0, 50)
                };
            }),
        loadView: (id)=>set((s)=>{
                const view = s.savedViews.find((v)=>v.id === id);
                if (!view) return s;
                const entry = {
                    id: `act-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
                    type: "load-view",
                    label: `Loaded view "${view.name}"`,
                    ts: Date.now()
                };
                return {
                    filters: {
                        ...view.filters
                    },
                    selected: new Set(),
                    activity: [
                        entry,
                        ...s.activity
                    ].slice(0, 50)
                };
            }),
        deleteView: (id)=>set((s)=>{
                const view = s.savedViews.find((v)=>v.id === id);
                if (!view) return s;
                const entry = {
                    id: `act-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
                    type: "delete-view",
                    label: `Deleted view "${view.name}"`,
                    ts: Date.now()
                };
                return {
                    savedViews: s.savedViews.filter((v)=>v.id !== id),
                    activity: [
                        entry,
                        ...s.activity
                    ].slice(0, 50)
                };
            }),
        duplicateView: (id)=>set((s)=>{
                const src = s.savedViews.find((v)=>v.id === id);
                if (!src) return s;
                const copy = {
                    id: `view-${Date.now().toString(36)}`,
                    name: `${src.name} (copy)`,
                    filters: {
                        ...src.filters
                    },
                    createdAt: Date.now()
                };
                const entry = {
                    id: `act-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
                    type: "duplicate-view",
                    label: `Duplicated "${src.name}"`,
                    ts: Date.now()
                };
                return {
                    savedViews: [
                        ...s.savedViews,
                        copy
                    ],
                    activity: [
                        entry,
                        ...s.activity
                    ].slice(0, 50)
                };
            }),
        mergeViews: (idA, idB, name)=>set((s)=>{
                const a = s.savedViews.find((v)=>v.id === idA);
                const b = s.savedViews.find((v)=>v.id === idB);
                if (!a || !b) return s;
                // Merge: conflicting single-value filters broaden to "all".
                const mergeField = (key)=>{
                    const va = a.filters[key];
                    const vb = b.filters[key];
                    if (va === "all") return vb;
                    if (vb === "all") return va;
                    if (va === vb) return va;
                    return "all";
                };
                const queryA = a.filters.query.trim();
                const queryB = b.filters.query.trim();
                const mergedQuery = queryA && queryB ? `${queryA} OR ${queryB}` : queryA || queryB;
                const merged = {
                    id: `view-merged-${Date.now().toString(36)}`,
                    name: name.trim() || `${a.name} + ${b.name}`,
                    filters: {
                        pillar: mergeField("pillar"),
                        severity: mergeField("severity"),
                        status: mergeField("status"),
                        source: mergeField("source"),
                        region: mergeField("region"),
                        query: mergedQuery
                    },
                    createdAt: Date.now()
                };
                return {
                    savedViews: [
                        ...s.savedViews,
                        merged
                    ],
                    activity: [
                        {
                            id: `act-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
                            type: "merge-views",
                            label: `Merged "${a.name}" + "${b.name}"`,
                            detail: `→ "${merged.name}"`,
                            ts: Date.now()
                        },
                        ...s.activity
                    ].slice(0, 50)
                };
            }),
        importViews: (views)=>set((s)=>{
                // Re-id imported views to avoid collisions with existing ones.
                const imported = views.map((v, i)=>({
                        ...v,
                        id: `view-imported-${Date.now().toString(36)}-${i}`,
                        createdAt: Date.now()
                    }));
                return {
                    savedViews: [
                        ...s.savedViews,
                        ...imported
                    ]
                };
            }),
        logActivity: (type, label, detail)=>set((s)=>({
                    activity: [
                        {
                            id: `act-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
                            type,
                            label,
                            detail,
                            ts: Date.now()
                        },
                        ...s.activity
                    ].slice(0, 50)
                })),
        clearActivity: ()=>set({
                activity: []
            }),
        clearAll: ()=>set({
                actions: {},
                readAlerts: {},
                filters: {
                    ...defaultFilters
                },
                selected: new Set(),
                savedViews: [],
                activity: [
                    {
                        id: `act-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
                        type: "reset-workspace",
                        label: "Workspace reset",
                        detail: "All state cleared",
                        ts: Date.now()
                    }
                ]
            })
    }), {
    name: "harch-risk-store",
    storage: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createJSONStorage"])(()=>localStorage),
    // Persist actions + readAlerts + savedViews + activity. Filters + selected are session-only.
    partialize: (s)=>({
            actions: s.actions,
            readAlerts: s.readAlerts,
            savedViews: s.savedViews,
            activity: s.activity
        }),
    // Skip SSR/hydration mismatch: the store initializes empty on the server
    // and rehydrates on the client. Components read the live value after mount.
    skipHydration: false
}));
function useActionState(eventId) {
    _s();
    return useRiskStore({
        "useActionState.useRiskStore": (s)=>eventId ? s.actions[eventId] ?? "pending" : "pending"
    }["useActionState.useRiskStore"]);
}
_s(useActionState, "rcb8fGQUwXJzlSxUVhZhni+2mXI=", false, function() {
    return [
        useRiskStore
    ];
});
const actionStateMeta = {
    pending: {
        label: "Pending",
        chip: "bg-slate-100 text-slate-500",
        dot: "bg-slate-400"
    },
    acknowledged: {
        label: "Acknowledged",
        chip: "bg-emerald-50 text-emerald-700",
        dot: "bg-emerald-500"
    },
    escalated: {
        label: "Escalated",
        chip: "bg-amber-50 text-amber-700",
        dot: "bg-amber-500"
    },
    watching: {
        label: "Watching",
        chip: "bg-sky-50 text-sky-700",
        dot: "bg-sky-500"
    }
};
function actionToAlertStatus(action) {
    if (action === "acknowledged") return "acknowledged";
    if (action === "escalated") return "escalated";
    return "new";
}
function filterRiskEvents(events, filters, actions) {
    const q = filters.query.trim().toLowerCase();
    // Pre-resolve source + region filters to event-id sets (O(1) lookup).
    const sourceMatch = filters.source !== "all" ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sourceIndex"].get(filters.source) ?? new Set() : null;
    const regionMatch = filters.region !== "all" ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["regionIndex"].get(filters.region) ?? new Set() : null;
    return events.filter((e)=>{
        if (filters.pillar !== "all" && e.pillar !== filters.pillar) return false;
        if (filters.severity !== "all" && e.severity !== filters.severity) return false;
        if (filters.status !== "all") {
            const st = actions[e.id] ?? "pending";
            if (st !== filters.status) return false;
        }
        if (sourceMatch && !sourceMatch.has(e.id)) return false;
        if (regionMatch && !regionMatch.has(e.id)) return false;
        if (q) {
            const hay = `${e.title} ${e.id} ${e.pillar} ${e.severity} ${e.region}`.toLowerCase();
            if (!hay.includes(q)) return false;
        }
        return true;
    });
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/csv-export.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildEventsCsv",
    ()=>buildEventsCsv,
    "downloadCsv",
    ()=>downloadCsv
]);
"use client";
/** Convert a RiskEvent row to a CSV-safe line. */ function csvEscape(value) {
    const s = String(value);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
}
const actionLabel = {
    pending: "Pending",
    acknowledged: "Acknowledged",
    escalated: "Escalated",
    watching: "Watching"
};
const headers = [
    "Event ID",
    "Date",
    "Pillar",
    "Title",
    "Articles",
    "Sentiment",
    "Severity",
    "Status"
];
function buildEventsCsv(events, actions) {
    const rows = events.map((e)=>{
        const status = actions[e.id] ?? "pending";
        return [
            e.id,
            e.date,
            e.pillar,
            e.title,
            e.articles,
            e.sentiment,
            e.severity,
            actionLabel[status]
        ].map(csvEscape).join(",");
    });
    return [
        headers.join(","),
        ...rows
    ].join("\n");
}
function downloadCsv(filename, csv) {
    const blob = new Blob([
        csv
    ], {
        type: "text/csv;charset=utf-8;"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Revoke the object URL after a short delay to ensure the download starts.
    setTimeout(()=>URL.revokeObjectURL(url), 1000);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/store-io.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildActivityCsv",
    ()=>buildActivityCsv,
    "buildActivityJson",
    ()=>buildActivityJson,
    "buildSavedViewsJson",
    ()=>buildSavedViewsJson,
    "downloadJson",
    ()=>downloadJson,
    "parseSavedViewsJson",
    ()=>parseSavedViewsJson
]);
"use client";
function buildSavedViewsJson(views) {
    const payload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        views
    };
    return JSON.stringify(payload, null, 2);
}
function downloadJson(filename, json) {
    const blob = new Blob([
        json
    ], {
        type: "application/json;charset=utf-8;"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(()=>URL.revokeObjectURL(url), 1000);
}
function parseSavedViewsJson(json) {
    const data = JSON.parse(json);
    if (!data || typeof data !== "object") {
        throw new Error("Invalid file: not a JSON object.");
    }
    const views = Array.isArray(data.views) ? data.views : Array.isArray(data) ? data : null;
    if (!views) {
        throw new Error("Invalid file: no 'views' array found.");
    }
    return views.map((v, i)=>{
        const obj = v;
        if (!obj || typeof obj !== "object") {
            throw new Error(`View ${i}: not an object.`);
        }
        const filters = obj.filters;
        if (!filters || typeof filters !== "object") {
            throw new Error(`View ${i}: missing 'filters' object.`);
        }
        return {
            id: typeof obj.id === "string" ? obj.id : `view-imported-${Date.now().toString(36)}-${i}`,
            name: typeof obj.name === "string" ? obj.name : `Imported view ${i + 1}`,
            filters: {
                pillar: filters.pillar ?? "all",
                severity: filters.severity ?? "all",
                status: filters.status ?? "all",
                source: filters.source ?? "all",
                region: filters.region ?? "all",
                query: filters.query ?? ""
            },
            createdAt: typeof obj.createdAt === "number" ? obj.createdAt : Date.now()
        };
    });
}
/* ------------------------------------------------------------------ */ /*  Activity feed export (CSV + JSON)                                 */ /* ------------------------------------------------------------------ */ const activityHeaders = [
    "Timestamp",
    "Type",
    "Label",
    "Detail"
];
function activityCsvEscape(value) {
    const s = String(value ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
}
function buildActivityCsv(activity) {
    const rows = activity.map((a)=>[
            new Date(a.ts).toISOString(),
            a.type,
            a.label,
            a.detail ?? ""
        ].map(activityCsvEscape).join(","));
    return [
        activityHeaders.join(","),
        ...rows
    ].join("\n");
}
function buildActivityJson(activity) {
    return JSON.stringify({
        version: 1,
        exportedAt: new Date().toISOString(),
        count: activity.length,
        activity
    }, null, 2);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/intelligence-brief.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "chipToneClass",
    ()=>chipToneClass,
    "generateBrief",
    ()=>generateBrief,
    "itemToneClass",
    ()=>itemToneClass,
    "riskLevelMeta",
    ()=>riskLevelMeta
]);
/**
 * Harch Atelier — Intelligence Brief generator (V22.0)
 *
 * Synthesizes a deterministic "Daily Intelligence Brief" from the existing
 * mock-data datasets. Produces a structured brief object with narrative
 * sections, data chips, and recommended actions — the kind of morning brief
 * a Palantir-grade platform auto-generates for its analysts.
 *
 * The brief is role-aware: each account type gets a personalized executive
 * summary + recommended actions scoped to their function.
 *
 * Deterministic: same seed → same brief. `regenerate(seed)` produces a fresh
 * variant by shifting the seed (used by the "Regenerate" button).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/mock-data.ts [app-client] (ecmascript)");
;
/* ------------------------------------------------------------------ */ /*  Helpers                                                            */ /* ------------------------------------------------------------------ */ function mulberry32(seed) {
    let a = seed >>> 0;
    return ()=>{
        a = a + 0x6d2b79f5 >>> 0;
        let t = a;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}
function pick(arr, rng) {
    return arr[Math.floor(rng() * arr.length)];
}
function formatDateLabel(d) {
    return d.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}
/** Severity weight for ranking. */ const severityWeight = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1
};
/* ------------------------------------------------------------------ */ /*  Role-aware executive summaries                                     */ /* ------------------------------------------------------------------ */ const execSummaryByRole = {
    admin: (b)=>`Composite risk index stands at ${b.riskScore.toFixed(1)}/100, ${b.riskScore > 70 ? "elevated and trending upward" : "within normal range"}. ${b.criticalCount} critical signal${b.criticalCount === 1 ? "" : "s"} require immediate triage across the platform. Negative coverage share is ${b.negShare}% — ${b.negShare > 45 ? "above the 40% watch threshold" : "within tolerance"}. All ingestion pipelines are nominal; no source health incidents in the last 24h.`,
    trader: (b)=>`Risk environment is ${b.riskScore > 70 ? "elevated" : "stable"} at ${b.riskScore.toFixed(1)}/100. ${b.criticalCount} critical risk event${b.criticalCount === 1 ? "" : "s"} are active and may impact HarchCorp positions. Watchlist signals show ${b.negShare > 45 ? "deteriorating" : "stable"} sentiment — review position exposure to affected entities before the open.`,
    legal: (b)=>`Regulatory and compliance posture is ${b.riskScore > 70 ? "under pressure" : "stable"} at ${b.riskScore.toFixed(1)}/100. ${b.criticalCount} critical matter${b.criticalCount === 1 ? "" : "s"} need attention. Negative coverage at ${b.negShare}% — monitor for regulatory pickup. No new hold notices issued in the last 24h; 3 upcoming filing deadlines this week.`,
    market: (b)=>`Market intelligence signals ${b.riskScore > 70 ? "elevated" : "stable"} risk at ${b.riskScore.toFixed(1)}/100. Share-of-voice analysis shows HarchCorp leading peers, but negative coverage share is ${b.negShare}%. ${b.criticalCount} critical event${b.criticalCount === 1 ? "" : "s"} are driving coverage — assess sentiment impact on investor positioning.`,
    pr: (b)=>`Reputation environment is ${b.riskScore > 70 ? "strained" : "stable"} at ${b.riskScore.toFixed(1)}/100. Negative coverage share at ${b.negShare}% ${b.negShare > 45 ? "exceeds the comms watch threshold" : "is within tolerance"}. ${b.criticalCount} critical narrative${b.criticalCount === 1 ? "" : "s"} are active — coordinate response strategy with the comms desk.`,
    self: (b)=>`Your tracked entities show ${b.riskScore > 70 ? "elevated" : "stable"} risk at ${b.riskScore.toFixed(1)}/100. ${b.criticalCount} critical signal${b.criticalCount === 1 ? "" : "s"} on your watchlist need review. Negative coverage at ${b.negShare}%. Review your pinned entities and acknowledge outstanding alerts.`
};
const recommendedActionsByRole = {
    admin: [
        {
            id: "ra-admin-1",
            title: "Triage critical alerts",
            detail: "3 threshold breaches awaiting acknowledgement in the alerts queue.",
            tone: "warning",
            metric: "3 open"
        },
        {
            id: "ra-admin-2",
            title: "Review source health",
            detail: "Bloomberg feed latency spiked to 4.2s overnight — verify pipeline.",
            tone: "neutral",
            metric: "1 degraded"
        },
        {
            id: "ra-admin-3",
            title: "Approve new user provision",
            detail: "2 pending access requests for the Legal Counsel role.",
            tone: "neutral",
            metric: "2 pending"
        }
    ],
    trader: [
        {
            id: "ra-trader-1",
            title: "Reduce position exposure",
            detail: "HarchCorp (HRCH) sentiment delta -3.4 on SEC inquiry — review holding size.",
            tone: "negative",
            metric: "Δ -3.4"
        },
        {
            id: "ra-trader-2",
            title: "Monitor BVC open",
            detail: "MASI futures indicate a flat-to-negative open; watch banking sector.",
            tone: "neutral",
            metric: "MASI -0.2%"
        },
        {
            id: "ra-trader-3",
            title: "Hedge cyber-risk exposure",
            detail: "Ransomware claim on logistics data may impact supply-chain counterparties.",
            tone: "warning",
            metric: "2 counterparty"
        }
    ],
    legal: [
        {
            id: "ra-legal-1",
            title: "Issue litigation hold",
            detail: "SEC inquiry EVT-9821 triggered a hold-notice recommendation — coordinate with e-discovery.",
            tone: "warning",
            metric: "1 hold"
        },
        {
            id: "ra-legal-2",
            title: "File AMMC disclosure",
            detail: "Quarterly obligations register shows 1 filing due in 4 business days.",
            tone: "warning",
            metric: "4 days"
        },
        {
            id: "ra-legal-3",
            title: "Brief external counsel",
            detail: "Export-control probe EVT-9802 requires outside counsel briefing by EOW.",
            tone: "neutral",
            metric: "EOW"
        }
    ],
    market: [
        {
            id: "ra-market-1",
            title: "Update IR talking points",
            detail: "Negative coverage on revenue recognition — prepare Q&A for investor calls.",
            tone: "warning",
            metric: "86 articles"
        },
        {
            id: "ra-market-2",
            title: "Brief analyst relations",
            detail: "Board refresh op-ed pickup is growing — pre-empt analyst questions.",
            tone: "neutral",
            metric: "47 articles"
        },
        {
            id: "ra-market-3",
            title: "Monitor peer SoV shift",
            detail: "Northwind share-of-voice gained 2.1pp overnight — assess competitive positioning.",
            tone: "neutral",
            metric: "+2.1pp"
        }
    ],
    pr: [
        {
            id: "ra-pr-1",
            title: "Draft holding statement",
            detail: "Ransomware claim is gaining tier-1 pickup — prepare a holding statement within 2h.",
            tone: "negative",
            metric: "74 articles"
        },
        {
            id: "ra-pr-2",
            title: "Engage social listening",
            detail: "Sentiment on X/Twitter is skewing negative on the SEC inquiry — monitor virality.",
            tone: "warning",
            metric: "Δ -3.4"
        },
        {
            id: "ra-pr-3",
            title: "Schedule CEO briefing",
            detail: "Board composition criticism requires a coordinated CEO response — brief by EOD.",
            tone: "neutral",
            metric: "EOD"
        }
    ],
    self: [
        {
            id: "ra-self-1",
            title: "Acknowledge critical alerts",
            detail: "2 unacknowledged critical alerts on your pinned entities.",
            tone: "warning",
            metric: "2 open"
        },
        {
            id: "ra-self-2",
            title: "Review watchlist signals",
            detail: "HRCH watchlist shows 4 down signals — assess your tracked exposure.",
            tone: "negative",
            metric: "4 down"
        },
        {
            id: "ra-self-3",
            title: "Export your digest",
            detail: "Your daily activity digest is ready for export (CSV/JSON).",
            tone: "neutral",
            metric: "ready"
        }
    ]
};
function generateBrief(role, seed) {
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
    const s = seed ?? dayOfYear * 1000 + now.getHours();
    const rng = mulberry32(s);
    // --- Top risks (sort by severity weight × articles) ---
    const topRisks = [
        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["riskEvents"]
    ].sort((a, b)=>severityWeight[b.severity] * b.articles - severityWeight[a.severity] * a.articles).slice(0, 5);
    const criticalCount = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["riskEvents"].filter((e)=>e.severity === "critical").length;
    const riskScore = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["headlineKpis"].riskIndex;
    const negShare = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["headlineKpis"].negativeShare;
    const riskLevel = riskScore > 80 || criticalCount >= 3 ? "critical" : riskScore > 70 ? "high" : riskScore > 55 ? "elevated" : "stable";
    // --- Coverage pulse (last 7 days) ---
    const last7 = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["coverage30d"].slice(0, 7);
    const pos7 = last7.reduce((s, d)=>s + d.positive, 0);
    const neg7 = last7.reduce((s, d)=>s + d.negative, 0);
    const negPct7 = Math.round(neg7 / (pos7 + neg7) * 100);
    const prev7 = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["coverage30d"].slice(7, 14);
    const prevTotal = prev7.reduce((s, d)=>s + d.positive + d.negative, 0);
    const currTotal = pos7 + neg7;
    const coverageDelta = prevTotal > 0 ? Math.round((currTotal - prevTotal) / prevTotal * 100) : 0;
    // --- Sentiment trend (last 3 months) ---
    const last3 = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sentiment12m"].slice(-3);
    const last3Pos = last3.reduce((s, m)=>s + m.positive, 0);
    const last3Neg = last3.reduce((s, m)=>s + m.negative, 0);
    const sentTrend = last3Neg > last3Pos ? "deteriorating" : last3Pos > last3Neg ? "improving" : "stable";
    // --- Share of Voice ---
    const totalSov = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["shareOfVoice"].reduce((s, x)=>s + x.value, 0);
    const harchSov = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["shareOfVoice"].find((x)=>x.isTarget)?.value ?? 0;
    const harchSovPct = Math.round(harchSov / totalSov * 100);
    const topCompetitor = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["shareOfVoice"].filter((x)=>!x.isTarget).sort((a, b)=>b.value - a.value)[0];
    // --- Watchlist ---
    const wlDown = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["watchlistSignals"].filter((s)=>s.delta < 0);
    const wlCritical = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["watchlistSignals"].filter((s)=>s.severity === "critical");
    // --- Build sections ---
    const sections = [];
    // Section 1: Top Risk Signals
    sections.push({
        id: "top-risks",
        title: "Top Risk Signals",
        icon: "AlertTriangle",
        narrative: `${criticalCount} critical and ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["riskEvents"].filter((e)=>e.severity === "high").length} high-severity events are active. The most material signal is "${topRisks[0].title}" (${topRisks[0].articles} articles, ${topRisks[0].pillar}). Regulatory and Cyber pillars account for ${Math.round(topRisks.filter((r)=>r.pillar === "Regulatory" || r.pillar === "Cyber").length / topRisks.length * 100)}% of top-5 risk volume.`,
        items: topRisks.map((e)=>({
                id: e.id,
                title: e.title,
                detail: `${e.pillar} · ${e.region} · ${e.articles} articles · ${e.sentiment}`,
                severity: e.severity,
                pillar: e.pillar,
                metric: e.severity.toUpperCase(),
                tone: e.severity === "critical" || e.severity === "high" ? "negative" : e.severity === "medium" ? "warning" : "neutral"
            })),
        chips: [
            {
                label: "Critical",
                value: `${criticalCount}`,
                tone: "negative"
            },
            {
                label: "Risk index",
                value: `${riskScore.toFixed(1)}/100`,
                tone: riskScore > 70 ? "negative" : "neutral"
            },
            {
                label: "Active events",
                value: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["riskEvents"].length}`,
                tone: "info"
            }
        ]
    });
    // Section 2: Coverage & Sentiment Pulse
    sections.push({
        id: "coverage-pulse",
        title: "Coverage & Sentiment Pulse",
        icon: "Newspaper",
        narrative: `Last 7 days produced ${currTotal.toLocaleString()} articles — ${coverageDelta >= 0 ? "up" : "down"} ${Math.abs(coverageDelta)}% vs the prior week. Negative share is ${negPct7}%, ${negPct7 > 45 ? "above the 40% watch threshold" : "within tolerance"}. 3-month sentiment trend is ${sentTrend}.`,
        items: [
            {
                id: "cov-1",
                title: "7-day coverage volume",
                detail: `${currTotal.toLocaleString()} articles (${coverageDelta >= 0 ? "+" : ""}${coverageDelta}% WoW)`,
                metric: `${currTotal.toLocaleString()}`,
                tone: coverageDelta > 15 ? "warning" : coverageDelta < -10 ? "positive" : "neutral"
            },
            {
                id: "cov-2",
                title: "Negative share (7d)",
                detail: `${negPct7}% of coverage classified negative by GLM-4`,
                metric: `${negPct7}%`,
                tone: negPct7 > 45 ? "negative" : "neutral"
            },
            {
                id: "cov-3",
                title: "Sentiment trend (3m)",
                detail: `3-month positive vs negative balance: ${sentTrend}`,
                metric: sentTrend,
                tone: sentTrend === "improving" ? "positive" : sentTrend === "deteriorating" ? "negative" : "neutral"
            },
            {
                id: "cov-4",
                title: "Total coverage (30d)",
                detail: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["headlineKpis"].coverage30d.toLocaleString()} articles across 1,840 sources`,
                metric: `${(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["headlineKpis"].coverage30d / 1000).toFixed(1)}k`,
                tone: "info"
            }
        ],
        chips: [
            {
                label: "7d volume",
                value: `${currTotal.toLocaleString()}`,
                tone: "info"
            },
            {
                label: "WoW Δ",
                value: `${coverageDelta >= 0 ? "+" : ""}${coverageDelta}%`,
                tone: coverageDelta > 15 ? "negative" : coverageDelta < 0 ? "positive" : "neutral"
            },
            {
                label: "Neg share",
                value: `${negPct7}%`,
                tone: negPct7 > 45 ? "negative" : "neutral"
            },
            {
                label: "Trend",
                value: sentTrend,
                tone: sentTrend === "improving" ? "positive" : sentTrend === "deteriorating" ? "negative" : "neutral"
            }
        ]
    });
    // Section 3: Share of Voice
    sections.push({
        id: "sov",
        title: "Share of Voice",
        icon: "PieChart",
        narrative: `HarchCorp commands ${harchSovPct}% of monitored coverage (${harchSov.toLocaleString()} articles), leading all peers. Nearest competitor ${topCompetitor.name} holds ${Math.round(topCompetitor.value / totalSov * 100)}% (${topCompetitor.value.toLocaleString()} articles). The gap ${harchSov > topCompetitor.value * 1.5 ? "is comfortable" : "is narrowing — monitor competitive narrative activity"}.`,
        items: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["shareOfVoice"].slice(0, 5).map((s)=>({
                id: `sov-${s.name}`,
                title: s.name,
                detail: s.isTarget ? "Target entity (monitored)" : "Competitor / peer",
                metric: `${Math.round(s.value / totalSov * 100)}%`,
                tone: s.isTarget ? "positive" : "neutral"
            })),
        chips: [
            {
                label: "HarchCorp SoV",
                value: `${harchSovPct}%`,
                tone: "positive"
            },
            {
                label: "Top competitor",
                value: topCompetitor.name,
                tone: "neutral"
            },
            {
                label: "Gap",
                value: `${Math.round((harchSov - topCompetitor.value) / totalSov * 100)}pp`,
                tone: harchSov > topCompetitor.value * 1.5 ? "positive" : "warning"
            }
        ]
    });
    // Section 4: Watchlist Signals
    sections.push({
        id: "watchlist",
        title: "Watchlist Signals",
        icon: "Radio",
        narrative: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["watchlistSignals"].length} tracked signals on HarchCorp. ${wlDown.length} are trending negative, ${wlCritical.length} are critical severity. The steepest drop is "${wlDown.sort((a, b)=>a.delta - b.delta)[0]?.signal}" at Δ ${wlDown.sort((a, b)=>a.delta - b.delta)[0]?.delta.toFixed(1)}.`,
        items: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["watchlistSignals"].slice(0, 5).map((s)=>({
                id: s.id,
                title: s.signal,
                detail: `${s.pillar} · ${s.severity} · ${s.articles} articles`,
                severity: s.severity,
                pillar: s.pillar,
                metric: `Δ ${s.delta >= 0 ? "+" : ""}${s.delta.toFixed(1)}`,
                tone: s.delta < -2 ? "negative" : s.delta < 0 ? "warning" : "positive"
            })),
        chips: [
            {
                label: "Signals",
                value: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["watchlistSignals"].length}`,
                tone: "info"
            },
            {
                label: "Down",
                value: `${wlDown.length}`,
                tone: "negative"
            },
            {
                label: "Critical",
                value: `${wlCritical.length}`,
                tone: "negative"
            }
        ]
    });
    // --- Headline + exec summary ---
    const headline = riskLevel === "critical" ? "Critical risk environment — immediate action required" : riskLevel === "high" ? "Elevated risk environment — heightened vigilance advised" : riskLevel === "elevated" ? "Moderate risk elevation — monitor closely" : "Stable risk environment — routine monitoring";
    const execSummary = execSummaryByRole[role]({
        riskScore,
        criticalCount,
        negShare
    });
    const recommendedActions = recommendedActionsByRole[role];
    return {
        generatedAt: now.toISOString(),
        dateLabel: formatDateLabel(now),
        seed: s,
        role,
        headline,
        executiveSummary: execSummary,
        riskLevel,
        riskScore,
        sections,
        recommendedActions,
        briefId: `brief-${role}-${s}`
    };
}
const riskLevelMeta = {
    stable: {
        label: "Stable",
        tone: "positive",
        color: "emerald",
        icon: "ShieldCheck"
    },
    elevated: {
        label: "Elevated",
        tone: "warning",
        color: "amber",
        icon: "AlertCircle"
    },
    high: {
        label: "High",
        tone: "negative",
        color: "orange",
        icon: "AlertTriangle"
    },
    critical: {
        label: "Critical",
        tone: "negative",
        color: "rose",
        icon: "ShieldAlert"
    }
};
const chipToneClass = {
    positive: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    negative: "bg-rose-50 text-rose-700 ring-rose-200",
    neutral: "bg-slate-100 text-slate-600 ring-slate-200",
    warning: "bg-amber-50 text-amber-700 ring-amber-200",
    info: "bg-sky-50 text-sky-700 ring-sky-200"
};
const itemToneClass = {
    positive: "border-l-emerald-400",
    negative: "border-l-rose-400",
    neutral: "border-l-slate-300",
    warning: "border-l-amber-400"
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/hooks/use-signal-pulse.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "useSignalPulse",
    ()=>useSignalPulse
]);
/**
 * useSignalPulse — live watchlist signal stream for Harch Atelier V12.0.
 *
 * Connects to the signal-pulse mini-service (socket.io on port 3003) through
 * the Caddy gateway. The gateway requires the request URL to carry
 * ?XTransformPort=3003, so we always connect to "/?XTransformPort=3003" —
 * never to a direct localhost:3003 URL.
 *
 * Returned shape:
 *   { signals: WatchlistSignal[], kpis: PulseKpis | null, connected: boolean }
 *
 * The hook is SSR-safe: socket.io is only created inside useEffect so the
 * first server-rendered paint is deterministic and matches the mock-data
 * baseline.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$socket$2e$io$2d$client$2f$build$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/socket.io-client/build/esm/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/mock-data.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function useSignalPulse() {
    _s();
    const [signals, setSignals] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["watchlistSignals"]);
    const [kpis, setKpis] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [connected, setConnected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useSignalPulse.useEffect": ()=>{
            // Always go through the gateway — NEVER a direct localhost:3003 URL.
            const socket = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$socket$2e$io$2d$client$2f$build$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["io"])("/?XTransformPort=3003", {
                transports: [
                    "websocket",
                    "polling"
                ],
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 10000,
                timeout: 10000
            });
            const onConnect = {
                "useSignalPulse.useEffect.onConnect": ()=>setConnected(true)
            }["useSignalPulse.useEffect.onConnect"];
            const onDisconnect = {
                "useSignalPulse.useEffect.onDisconnect": ()=>setConnected(false)
            }["useSignalPulse.useEffect.onDisconnect"];
            const onSnapshot = {
                "useSignalPulse.useEffect.onSnapshot": (next)=>{
                    if (Array.isArray(next)) {
                        setSignals(next);
                    }
                }
            }["useSignalPulse.useEffect.onSnapshot"];
            const onSignalUpdate = {
                "useSignalPulse.useEffect.onSignalUpdate": (updated)=>{
                    if (!updated || typeof updated.id !== "string") return;
                    setSignals({
                        "useSignalPulse.useEffect.onSignalUpdate": (prev)=>prev.map({
                                "useSignalPulse.useEffect.onSignalUpdate": (s)=>s.id === updated.id ? {
                                        ...s,
                                        ...updated
                                    } : s
                            }["useSignalPulse.useEffect.onSignalUpdate"])
                    }["useSignalPulse.useEffect.onSignalUpdate"]);
                }
            }["useSignalPulse.useEffect.onSignalUpdate"];
            const onKpisTick = {
                "useSignalPulse.useEffect.onKpisTick": (next)=>{
                    if (!next || typeof next.ts !== "string") return;
                    setKpis(next);
                }
            }["useSignalPulse.useEffect.onKpisTick"];
            socket.on("connect", onConnect);
            socket.on("disconnect", onDisconnect);
            socket.on("signals:snapshot", onSnapshot);
            socket.on("signal:update", onSignalUpdate);
            socket.on("kpis:tick", onKpisTick);
            return ({
                "useSignalPulse.useEffect": ()=>{
                    socket.off("connect", onConnect);
                    socket.off("disconnect", onDisconnect);
                    socket.off("signals:snapshot", onSnapshot);
                    socket.off("signal:update", onSignalUpdate);
                    socket.off("kpis:tick", onKpisTick);
                    socket.disconnect();
                    setConnected(false);
                }
            })["useSignalPulse.useEffect"];
        }
    }["useSignalPulse.useEffect"], []);
    return {
        signals,
        kpis,
        connected
    };
}
_s(useSignalPulse, "74deT22BlofGjjawrfwdfhQAkEQ=");
const __TURBOPACK__default__export__ = useSignalPulse;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/hooks/use-real-data.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useRealData",
    ()=>useRealData
]);
/**
 * useRealData — client hook for fetching real data from the /api/real/* routes.
 *
 * SWR-like: fetches on mount, polls every `pollMs`, exposes {data, error, loading}.
 * Used by the KpiStrip, Intelligence Brief, and the real-data dashboard widget
 * so the user sees LIVE real data (FX, news+sentiment, market quotes).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
function useRealData(path, opts = {}) {
    _s();
    const { pollMs = 5 * 60 * 1000, skip = false } = opts;
    const [data, setData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(!skip);
    const [tick, setTick] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const refetch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useRealData.useCallback[refetch]": ()=>setTick({
                "useRealData.useCallback[refetch]": (t)=>t + 1
            }["useRealData.useCallback[refetch]"])
    }["useRealData.useCallback[refetch]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useRealData.useEffect": ()=>{
            if (skip) return;
            let cancelled = false;
            setLoading(true);
            fetch(path).then({
                "useRealData.useEffect": async (r)=>{
                    if (!r.ok) throw new Error(`HTTP ${r.status}`);
                    const json = await r.json();
                    if (!cancelled) {
                        setData(json);
                        setError(null);
                    }
                }
            }["useRealData.useEffect"]).catch({
                "useRealData.useEffect": (e)=>{
                    if (!cancelled) setError(e.message);
                }
            }["useRealData.useEffect"]).finally({
                "useRealData.useEffect": ()=>{
                    if (!cancelled) setLoading(false);
                }
            }["useRealData.useEffect"]);
            return ({
                "useRealData.useEffect": ()=>{
                    cancelled = true;
                }
            })["useRealData.useEffect"];
        }
    }["useRealData.useEffect"], [
        path,
        skip,
        tick
    ]);
    // Polling
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useRealData.useEffect": ()=>{
            if (skip || pollMs <= 0) return;
            const id = setInterval({
                "useRealData.useEffect.id": ()=>refetch()
            }["useRealData.useEffect.id"], pollMs);
            return ({
                "useRealData.useEffect": ()=>clearInterval(id)
            })["useRealData.useEffect"];
        }
    }["useRealData.useEffect"], [
        refetch,
        pollMs,
        skip
    ]);
    return {
        data,
        error,
        loading,
        refetch
    };
}
_s(useRealData, "TFeAtQgA3F9N0Mw5trV9pPXMHek=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$dashboard$2d$shell$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/dashboard-shell.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dataviz$2f$risk$2d$matrix$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dataviz/risk-matrix.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dataviz$2f$share$2d$of$2d$voice$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dataviz/share-of-voice.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dataviz$2f$media$2d$coverage$2d$chart$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dataviz/media-coverage-chart.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dataviz$2f$sentiment$2d$trend$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dataviz/sentiment-trend.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dataviz$2f$risk$2d$pillars$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dataviz/risk-pillars.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dataviz$2f$top$2d$sources$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dataviz/top-sources.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dataviz$2f$geo$2d$distribution$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dataviz/geo-distribution.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dataviz$2f$risk$2d$trend$2d$timeline$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dataviz/risk-trend-timeline.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dataviz$2f$entity$2d$kpis$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dataviz/entity-kpis.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$risk$2d$events$2d$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/risk-events-table.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$watchlist$2d$signals$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/watchlist-signals.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$activity$2d$feed$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/activity-feed.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$real$2d$data$2d$panel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/real-data-panel.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$reputation$2d$console$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/reputation-console.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$risk$2d$event$2d$drawer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/risk-event-drawer.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$entity$2d$profile$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/entity-profile-dialog.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$compare$2d$views$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/compare-views-dialog.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$command$2d$palette$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/command-palette.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$keyboard$2d$shortcuts$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/keyboard-shortcuts.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$intelligence$2d$brief$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/intelligence-brief-dialog.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/mock-data.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
const metaByAccount = {
    admin: {
        title: "Operations Console",
        description: "Full-spectrum risk intelligence across every monitored entity and pillar."
    },
    trader: {
        title: "Signal Desk",
        description: "Live risk signals with coverage context for HarchCorp positions."
    },
    legal: {
        title: "Legal & Regulatory Monitor",
        description: "Regulatory exposure, matters, and hold-notice activity across entities."
    },
    market: {
        title: "Market Intelligence",
        description: "Sentiment, share of voice, and coverage analytics for the IR desk."
    },
    self: {
        title: "My Watch",
        description: "Personalized monitoring for your tracked entities and saved alerts."
    },
    pr: {
        title: "Communications Console",
        description: "Reputation, sentiment, and share-of-voice analytics for comms teams."
    }
};
/** Enterprise grid — market / admin / pr / legal / self. */ function EnterpriseGrid({ onSelect, onSelectEvent, onSelectEntity }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$reputation$2d$console$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ReputationConsole"], {
                brand: "HarchCorp"
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 63,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$real$2d$data$2d$panel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RealDataPanel"], {}, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 65,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dataviz$2f$risk$2d$trend$2d$timeline$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RiskTrendTimeline"], {
                onSelectEvent: onSelectEvent
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 67,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 gap-5 xl:grid-cols-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dataviz$2f$risk$2d$matrix$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RiskMatrix"], {
                        onSelect: onSelect
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 70,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dataviz$2f$media$2d$coverage$2d$chart$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MediaCoverageChart"], {}, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 71,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 69,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 gap-5 xl:grid-cols-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dataviz$2f$share$2d$of$2d$voice$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ShareOfVoice"], {}, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 75,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dataviz$2f$sentiment$2d$trend$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SentimentTrend"], {}, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 76,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 74,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 gap-5 xl:grid-cols-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dataviz$2f$risk$2d$pillars$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RiskPillars"], {}, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 80,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "xl:col-span-2",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dataviz$2f$top$2d$sources$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TopSources"], {}, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 82,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 81,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 79,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 gap-5 xl:grid-cols-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dataviz$2f$geo$2d$distribution$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GeoDistribution"], {}, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 87,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "xl:col-span-2",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$risk$2d$events$2d$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RiskEventsTable"], {
                            onSelect: onSelect
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 89,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 88,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 86,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 gap-5 xl:grid-cols-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dataviz$2f$entity$2d$kpis$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EntityKPIs"], {
                        onSelectEntity: onSelectEntity
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 94,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$activity$2d$feed$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ActivityFeed"], {}, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 95,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 93,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/page.tsx",
        lineNumber: 61,
        columnNumber: 5
    }, this);
}
_c = EnterpriseGrid;
/** Trader desk — watchlist on top, then matrix + coverage + geo. */ function TraderView({ onSelect, onSelectEvent, onSelectEntity }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$reputation$2d$console$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ReputationConsole"], {
                brand: "HarchCorp"
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 106,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$real$2d$data$2d$panel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RealDataPanel"], {}, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 108,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$watchlist$2d$signals$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WatchlistSignals"], {}, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 109,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 gap-5 xl:grid-cols-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dataviz$2f$risk$2d$matrix$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RiskMatrix"], {
                        onSelect: onSelect
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 111,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dataviz$2f$media$2d$coverage$2d$chart$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MediaCoverageChart"], {}, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 112,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 110,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dataviz$2f$risk$2d$trend$2d$timeline$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RiskTrendTimeline"], {
                onSelectEvent: onSelectEvent
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 114,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 gap-5 xl:grid-cols-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dataviz$2f$risk$2d$pillars$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RiskPillars"], {}, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 116,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "xl:col-span-2",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dataviz$2f$top$2d$sources$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TopSources"], {}, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 118,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 117,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 115,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 gap-5 xl:grid-cols-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dataviz$2f$geo$2d$distribution$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GeoDistribution"], {}, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 122,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "xl:col-span-2",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$risk$2d$events$2d$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RiskEventsTable"], {
                            onSelect: onSelect
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 124,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 123,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 121,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 gap-5 xl:grid-cols-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dataviz$2f$entity$2d$kpis$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EntityKPIs"], {
                        onSelectEntity: onSelectEntity
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 129,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$activity$2d$feed$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ActivityFeed"], {}, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 130,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 128,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/page.tsx",
        lineNumber: 104,
        columnNumber: 5
    }, this);
}
_c1 = TraderView;
function Home() {
    _s();
    const [accountType, setAccountType] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"]("market");
    const [selectedEvent, setSelectedEvent] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](null);
    const [drawerOpen, setDrawerOpen] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](false);
    const [helpOpen, setHelpOpen] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](false);
    const [entityOpen, setEntityOpen] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](null);
    const [compareOpen, setCompareOpen] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](false);
    const [briefOpen, setBriefOpen] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](false);
    const palette = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$command$2d$palette$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCommandPalette"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$keyboard$2d$shortcuts$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useKeyboardShortcuts"])({
        "Home.useKeyboardShortcuts": ()=>setHelpOpen({
                "Home.useKeyboardShortcuts": (v)=>!v
            }["Home.useKeyboardShortcuts"])
    }["Home.useKeyboardShortcuts"], {
        "Home.useKeyboardShortcuts": ()=>setBriefOpen(true)
    }["Home.useKeyboardShortcuts"]);
    const handleSelect = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "Home.useCallback[handleSelect]": (e)=>{
            setSelectedEvent(e);
            setDrawerOpen(true);
        }
    }["Home.useCallback[handleSelect]"], []);
    const handleSelectById = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "Home.useCallback[handleSelectById]": (eventId)=>{
            const ev = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["riskEvents"].find({
                "Home.useCallback[handleSelectById].ev": (e)=>e.id === eventId
            }["Home.useCallback[handleSelectById].ev"]);
            if (ev) {
                setSelectedEvent(ev);
                setDrawerOpen(true);
            }
        }
    }["Home.useCallback[handleSelectById]"], []);
    const handleOpenAlert = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"]({
        "Home.useCallback[handleOpenAlert]": (a)=>{
            if (!a.eventId) return;
            const ev = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["riskEvents"].find({
                "Home.useCallback[handleOpenAlert].ev": (e)=>e.id === a.eventId
            }["Home.useCallback[handleOpenAlert].ev"]);
            if (ev) {
                setSelectedEvent(ev);
                setDrawerOpen(true);
            }
        }
    }["Home.useCallback[handleOpenAlert]"], []);
    const meta = metaByAccount[accountType];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$dashboard$2d$shell$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DashboardShell"], {
        accountType: accountType,
        onAccountTypeChange: setAccountType,
        onOpenPalette: palette.toggle,
        onOpenAlert: handleOpenAlert,
        onOpenBrief: ()=>setBriefOpen(true),
        title: meta.title,
        description: meta.description,
        children: [
            accountType === "trader" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TraderView, {
                onSelect: handleSelect,
                onSelectEvent: handleSelectById,
                onSelectEntity: (entity)=>setEntityOpen(entity)
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 183,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(EnterpriseGrid, {
                onSelect: handleSelect,
                onSelectEvent: handleSelectById,
                onSelectEntity: (entity)=>setEntityOpen(entity)
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 185,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$risk$2d$event$2d$drawer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RiskEventDrawer"], {
                event: selectedEvent,
                open: drawerOpen,
                onOpenChange: setDrawerOpen
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 187,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$command$2d$palette$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CommandPalette"], {
                open: palette.open,
                onOpenChange: palette.setOpen,
                accountType: accountType,
                onAccountTypeChange: setAccountType,
                onSelectEvent: handleSelect,
                onSelectEntity: (entity)=>setEntityOpen(entity),
                onOpenCompare: ()=>setCompareOpen(true),
                onOpenBrief: ()=>setBriefOpen(true)
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 192,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$keyboard$2d$shortcuts$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["KeyboardShortcuts"], {
                open: helpOpen,
                onOpenChange: setHelpOpen
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 202,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$entity$2d$profile$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EntityProfileDialog"], {
                entity: entityOpen,
                open: entityOpen !== null,
                onOpenChange: (v)=>{
                    if (!v) setEntityOpen(null);
                },
                onSelectEvent: handleSelect
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 203,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$compare$2d$views$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CompareViewsDialog"], {
                open: compareOpen,
                onOpenChange: setCompareOpen,
                onSelectEvent: handleSelect
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 209,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$intelligence$2d$brief$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IntelligenceBriefDialog"], {
                open: briefOpen,
                onOpenChange: setBriefOpen,
                accountType: accountType
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 210,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/page.tsx",
        lineNumber: 173,
        columnNumber: 5
    }, this);
}
_s(Home, "fAyLmBJAp4HhGE/Q3rjERoxjK4w=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$command$2d$palette$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCommandPalette"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$keyboard$2d$shortcuts$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useKeyboardShortcuts"]
    ];
});
_c2 = Home;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "EnterpriseGrid");
__turbopack_context__.k.register(_c1, "TraderView");
__turbopack_context__.k.register(_c2, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_94bf167c._.js.map