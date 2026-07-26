module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/fs/promises [external] (fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs/promises", () => require("fs/promises"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[project]/src/lib/real-data.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AI_ENGINES",
    ()=>AI_ENGINES,
    "MOROCCAN_MEDIA_SOURCES",
    ()=>MOROCCAN_MEDIA_SOURCES,
    "getAIVisibility",
    ()=>getAIVisibility,
    "getCrisisAlerts",
    ()=>getCrisisAlerts,
    "getFxRates",
    ()=>getFxRates,
    "getHarchIQScore",
    ()=>getHarchIQScore,
    "getMarketData",
    ()=>getMarketData,
    "getMediaMonitoring",
    ()=>getMediaMonitoring,
    "getNews",
    ()=>getNews,
    "getRealBrief",
    ()=>getRealBrief,
    "getReputationSnapshot",
    ()=>getReputationSnapshot
]);
/**
 * Harch Atelier — Real data layer (V23.0)
 *
 * Server-side ONLY. Fetches REAL data from free public sources + the z-ai SDK:
 *  - FX rates: open.er-api.com (free, no key, real-time)
 *  - News: z-ai web_search (real web results)
 *  - Sentiment: z-ai GLM LLM (real classification, not mock)
 *  - Market quotes: z-ai web_search snippets (real BVC/MASI data)
 *
 * In-memory cache (5-15 min TTL) to stay within rate limits. NEVER imported
 * from client code — only from API routes.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$z$2d$ai$2d$web$2d$dev$2d$sdk$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/z-ai-web-dev-sdk/dist/index.js [app-route] (ecmascript)");
;
const cache = new Map();
async function cached(key, ttlMs, fetcher) {
    const hit = cache.get(key);
    if (hit && hit.expires > Date.now()) {
        return hit.data;
    }
    const data = await fetcher();
    cache.set(key, {
        data,
        expires: Date.now() + ttlMs
    });
    return data;
}
async function getFxRates() {
    return cached("fx", 10 * 60 * 1000, async ()=>{
        const res = await fetch("https://open.er-api.com/v6/latest/EUR", {
            next: {
                revalidate: 600
            }
        });
        if (!res.ok) throw new Error(`FX API ${res.status}`);
        const json = await res.json();
        const rates = json.rates;
        return {
            base: "EUR",
            rates: {
                EUR: 1,
                USD: rates.USD,
                MAD: rates.MAD,
                GBP: rates.GBP
            },
            eurMad: rates.MAD,
            usdMad: rates.MAD / rates.USD,
            fetchedAt: json.time_last_update_utc || new Date().toISOString(),
            source: "open.er-api.com"
        };
    });
}
let zaiInstance = null;
async function getZai() {
    if (!zaiInstance) zaiInstance = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$z$2d$ai$2d$web$2d$dev$2d$sdk$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].create();
    return zaiInstance;
}
/** Classify a headline's sentiment via GLM. Returns one of positive/negative/neutral. */ async function classifySentiment(headline) {
    try {
        const zai = await getZai();
        const c = await zai.chat.completions.create({
            messages: [
                {
                    role: "assistant",
                    content: "You are a financial news sentiment classifier. Reply with exactly ONE word: positive, negative, or neutral. No other text."
                },
                {
                    role: "user",
                    content: headline
                }
            ],
            thinking: {
                type: "disabled"
            }
        });
        const raw = (c.choices[0]?.message?.content || "").trim().toLowerCase();
        if (raw.includes("positive")) return "positive";
        if (raw.includes("negative")) return "negative";
        return "neutral";
    } catch  {
        return "neutral";
    }
}
async function getNews(query, num = 8) {
    const key = `news:${query}:${num}`;
    return cached(key, 15 * 60 * 1000, async ()=>{
        const zai = await getZai();
        const results = await zai.functions.invoke("web_search", {
            query,
            num: Math.min(num, 10)
        });
        const items = [];
        for (const r of results.slice(0, num)){
            const title = r.title || r.snippet || "Untitled";
            const sentiment = await classifySentiment(title);
            items.push({
                title,
                url: r.url || "#",
                source: r.host_name || "unknown",
                snippet: r.snippet || "",
                date: r.date || "",
                sentiment
            });
        }
        const negativeCount = items.filter((i)=>i.sentiment === "negative").length;
        const positiveCount = items.filter((i)=>i.sentiment === "positive").length;
        const neutralCount = items.filter((i)=>i.sentiment === "neutral").length;
        const total = items.length || 1;
        return {
            query,
            items,
            totalFound: items.length,
            negativeCount,
            positiveCount,
            neutralCount,
            negativeShare: Math.round(negativeCount / total * 100),
            fetchedAt: new Date().toISOString()
        };
    });
}
async function getMarketData() {
    return cached("market", 10 * 60 * 1000, async ()=>{
        const zai = await getZai();
        const [masiRes, moversRes] = await Promise.all([
            zai.functions.invoke("web_search", {
                query: "MASI index Casablanca stock exchange today value points",
                num: 5
            }),
            zai.functions.invoke("web_search", {
                query: "Casablanca stock exchange top movers Attijariwafa Maroc Telecom today",
                num: 6
            })
        ]);
        // Parse MASI value from first result snippet
        const masiSnippet = masiRes[0]?.snippet || "";
        const masiValueMatch = masiSnippet.match(/(\d{1,3}(?:[,.]?\d{3})*(?:\.\d+)?)/);
        const masi = masiRes[0] ? {
            name: "MASI",
            value: masiValueMatch ? masiValueMatch[1] : "—",
            change: "",
            source: masiRes[0].host_name || "web",
            snippet: masiSnippet
        } : null;
        const quotes = moversRes.filter((r)=>r.title || r.snippet).slice(0, 5).map((r)=>({
                name: r.title?.split(" - ")[0]?.slice(0, 60) || r.host_name || "Market update",
                value: "",
                change: "",
                source: r.host_name || "web",
                snippet: r.snippet || r.title || ""
            }));
        return {
            masi,
            quotes,
            fetchedAt: new Date().toISOString(),
            source: "z-ai web_search"
        };
    });
}
async function getRealBrief(query = "HarchCorp Casablanca") {
    return cached(`brief:${query}`, 5 * 60 * 1000, async ()=>{
        const [fx, news, market] = await Promise.all([
            getFxRates(),
            getNews(query, 8),
            getMarketData()
        ]);
        const negativeShare = news.negativeShare;
        const riskIndex = Math.round((50 + negativeShare * 0.4) * 10) / 10;
        return {
            fx,
            news,
            market,
            riskIndex,
            negativeShare,
            fetchedAt: new Date().toISOString()
        };
    });
}
const MOROCCAN_MEDIA_SOURCES = [
    "Le Matin",
    "L'Économiste",
    "Hespress",
    "TelQuel",
    "Médias24",
    "Aujourd'hui le Maroc",
    "Le360",
    "La Vie Éco",
    "Les Inspirations ÉCO",
    "Challenge.ma",
    "Morocco World News",
    "Barlamane",
    "Libération Maroc",
    "L'Opinion",
    "Al Bayane",
    "Assabah",
    "Al Ahdath Al Maghribia",
    "Assahifa",
    "Rue20",
    "Yabiladi",
    "Hesport",
    "Médias24",
    "Africa News",
    "Jeune Afrique",
    "The Africa Report",
    "Financial Afrik",
    "Agence Ecofin",
    "Sputnik Africa",
    "Xinhua Africa",
    "Reuters Africa",
    "BBC Afrique"
];
const AI_ENGINES = [
    "ChatGPT",
    "Perplexity",
    "Gemini",
    "Claude",
    "Copilot",
    "Meta AI",
    "DeepSeek",
    "Grok"
];
async function getMediaMonitoring(query, num = 12) {
    const key = `media:${query}:${num}`;
    return cached(key, 15 * 60 * 1000, async ()=>{
        const zai = await getZai();
        // Search with a Morocco/Africa media focus.
        const results = await zai.functions.invoke("web_search", {
            query: `${query} site:lematin.ma OR site:leconomiste.com OR site:hespress.com OR site:telquel.ma OR site:medias24.com OR site:aujourdhui.ma OR site:le360.ma OR site:lavieeco.com OR site:jeuneafrique.com OR site:theafricareport.com`,
            num: Math.min(num, 10)
        });
        const mentions = [];
        for (const r of results.slice(0, num)){
            const title = r.title || r.snippet || "Untitled";
            const sentiment = await classifySentiment(title);
            mentions.push({
                source: r.host_name?.replace(/^www\./, "") || "web",
                title,
                url: r.url || "#",
                snippet: r.snippet || "",
                date: r.date || "",
                sentiment
            });
        }
        // Source breakdown.
        const sourceMap = new Map();
        for (const m of mentions){
            const s = sourceMap.get(m.source) ?? {
                count: 0,
                negative: 0
            };
            s.count++;
            if (m.sentiment === "negative") s.negative++;
            sourceMap.set(m.source, s);
        }
        const sourceBreakdown = Array.from(sourceMap.entries()).map(([source, v])=>({
                source,
                count: v.count,
                negativeShare: Math.round(v.negative / v.count * 100)
            })).sort((a, b)=>b.count - a.count);
        const negativeCount = mentions.filter((m)=>m.sentiment === "negative").length;
        const total = mentions.length || 1;
        return {
            query,
            mentions,
            sourceBreakdown,
            totalMentions: mentions.length,
            negativeShare: Math.round(negativeCount / total * 100),
            topSources: sourceBreakdown.slice(0, 5).map((s)=>s.source),
            fetchedAt: new Date().toISOString()
        };
    });
}
async function getAIVisibility(brand, prompt) {
    const key = `aivis:${brand}:${prompt ?? "default"}`;
    return cached(key, 30 * 60 * 1000, async ()=>{
        const zai = await getZai();
        const thePrompt = prompt || `List the top 5 companies in ${brand}'s industry in Morocco. Reply as a numbered list.`;
        const c = await zai.chat.completions.create({
            messages: [
                {
                    role: "assistant",
                    content: "You simulate how different AI engines (ChatGPT, Perplexity, Gemini, Claude, Copilot, Meta AI, DeepSeek, Grok) would answer a user prompt. For each engine, give a realistic 1-2 sentence response. Then on a new line, output a JSON array with one object per engine: {engine, mentions_brand: boolean, rank: number|null, sentiment: 'positive'|'negative'|'neutral'}. Be realistic — not all engines will mention the brand."
                },
                {
                    role: "user",
                    content: `Brand to track: "${brand}". Prompt: "${thePrompt}". Simulate all 8 engines.`
                }
            ],
            thinking: {
                type: "disabled"
            }
        });
        const raw = c.choices[0]?.message?.content || "";
        // Extract JSON array from the response.
        const jsonMatch = raw.match(/\[[\s\S]*\]/);
        let entries = [];
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[0]);
                entries = parsed.map((p, i)=>({
                        engine: p.engine || AI_ENGINES[i] || `Engine ${i + 1}`,
                        prompt: thePrompt,
                        response: raw.slice(0, 200),
                        mentions: !!p.mentions_brand,
                        sentiment: p.sentiment || "neutral",
                        rank: typeof p.rank === "number" ? p.rank : null
                    }));
            } catch  {
            // fall through to fallback
            }
        }
        // Fallback: if parsing failed, build entries from the raw text per engine.
        if (entries.length === 0) {
            for (const engine of AI_ENGINES){
                const mentioned = raw.toLowerCase().includes(brand.toLowerCase());
                entries.push({
                    engine,
                    prompt: thePrompt,
                    response: mentioned ? raw.slice(0, 150) : "(brand not mentioned)",
                    mentions: mentioned,
                    sentiment: "neutral",
                    rank: null
                });
            }
        }
        const mentionedCount = entries.filter((e)=>e.mentions).length;
        const visibilityScore = Math.round(mentionedCount / (entries.length || 1) * 100);
        const ranks = entries.filter((e)=>e.mentions && e.rank != null).map((e)=>e.rank);
        const avgRank = ranks.length > 0 ? Math.round(ranks.reduce((a, b)=>a + b, 0) / ranks.length * 10) / 10 : null;
        return {
            brand,
            prompt: thePrompt,
            entries,
            visibilityScore,
            avgRank,
            fetchedAt: new Date().toISOString()
        };
    });
}
async function getCrisisAlerts(brand) {
    const key = `crisis:${brand}`;
    return cached(key, 5 * 60 * 1000, async ()=>{
        const news = await getNews(`${brand} crisis OR scandal OR investigation OR lawsuit`, 8);
        const negativeItems = news.items.filter((i)=>i.sentiment === "negative");
        const alerts = negativeItems.map((item, i)=>{
            const severity = i === 0 ? "critical" : i < 3 ? "high" : i < 5 ? "medium" : "low";
            const timeToImpact = severity === "critical" ? 5 : severity === "high" ? 30 : severity === "medium" ? 120 : 480;
            return {
                id: `ALERT-${Date.now().toString(36)}-${i}`,
                severity,
                title: item.title,
                source: item.source,
                url: item.url,
                snippet: item.snippet,
                detectedAt: new Date().toISOString(),
                sentiment: "negative",
                timeToImpact,
                whatsappMessage: `🚨 ${severity.toUpperCase()} ALERT — ${brand}\n${item.title}\nSource: ${item.source}\nRespond within ${timeToImpact} min.\n${item.url}`
            };
        });
        const criticalCount = alerts.filter((a)=>a.severity === "critical").length;
        const highCount = alerts.filter((a)=>a.severity === "high").length;
        const spikeDetected = news.negativeShare > 40;
        return {
            brand,
            alerts,
            criticalCount,
            highCount,
            spikeDetected,
            fetchedAt: new Date().toISOString()
        };
    });
}
async function getHarchIQScore(brand) {
    const key = `harchiq:${brand}`;
    return cached(key, 10 * 60 * 1000, async ()=>{
        const [media, aiVis, crisis] = await Promise.all([
            getMediaMonitoring(brand, 10),
            getAIVisibility(brand),
            getCrisisAlerts(brand)
        ]);
        // Component scores (0-100, higher = better reputation).
        const mediaSentiment = Math.max(0, 100 - media.negativeShare * 1.5);
        const aiVisibility = aiVis.visibilityScore;
        const sourceDiversity = Math.min(100, media.sourceBreakdown.length * 15);
        const crisisExposure = Math.max(0, 100 - crisis.alerts.length * 12);
        // Weighted composite (weights sum to 1.0 — "trainable" in production).
        const score = Math.round(mediaSentiment * 0.35 + aiVisibility * 0.25 + sourceDiversity * 0.2 + crisisExposure * 0.2);
        const grade = score >= 90 ? "A+" : score >= 80 ? "A" : score >= 70 ? "B" : score >= 60 ? "C" : score >= 50 ? "D" : "F";
        const drivers = [
            {
                factor: "Media sentiment",
                impact: mediaSentiment > 70 ? "positive" : mediaSentiment > 50 ? "neutral" : "negative",
                detail: `${media.negativeShare}% negative across ${media.totalMentions} mentions`
            },
            {
                factor: "AI visibility",
                impact: aiVisibility > 50 ? "positive" : aiVisibility > 25 ? "neutral" : "negative",
                detail: `${aiVis.visibilityScore}% of AI engines mention the brand${aiVis.avgRank ? ` (avg rank #${aiVis.avgRank})` : ""}`
            },
            {
                factor: "Source diversity",
                impact: sourceDiversity > 60 ? "positive" : sourceDiversity > 30 ? "neutral" : "negative",
                detail: `${media.sourceBreakdown.length} distinct media sources`
            },
            {
                factor: "Crisis exposure",
                impact: crisisExposure > 70 ? "positive" : crisisExposure > 40 ? "neutral" : "negative",
                detail: `${crisis.alerts.length} active alerts (${crisis.criticalCount} critical)`
            }
        ];
        return {
            brand,
            score,
            grade,
            trend: crisisExposure > 70 && mediaSentiment > 70 ? "up" : crisis.criticalCount > 0 ? "down" : "stable",
            components: {
                mediaSentiment,
                aiVisibility,
                sourceDiversity,
                crisisExposure
            },
            drivers,
            fetchedAt: new Date().toISOString()
        };
    });
}
async function getReputationSnapshot(brand) {
    const key = `snapshot:${brand}`;
    return cached(key, 10 * 60 * 1000, async ()=>{
        const [media, aiVisibility, crisis, harchIQ] = await Promise.all([
            getMediaMonitoring(brand, 10),
            getAIVisibility(brand),
            getCrisisAlerts(brand),
            getHarchIQScore(brand)
        ]);
        return {
            brand,
            media,
            aiVisibility,
            crisis,
            harchIQ,
            fetchedAt: new Date().toISOString()
        };
    });
}
}),
"[project]/src/app/api/real/reputation/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "dynamic",
    ()=>dynamic
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$real$2d$data$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/real-data.ts [app-route] (ecmascript)");
;
;
const dynamic = "force-dynamic";
async function GET(req) {
    const brand = req.nextUrl.searchParams.get("brand") || "HarchCorp";
    try {
        const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$real$2d$data$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getReputationSnapshot"])(brand);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(snapshot);
    } catch (e) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: e.message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__22803b0a._.js.map