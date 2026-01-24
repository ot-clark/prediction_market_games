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
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/prediction_market_arb/app/api/bot/real-status/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/prediction_market_arb/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
;
;
const STATE_FILE = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"](process.cwd(), 'data/real-bot-state.json');
const CLOB_API = 'https://clob.polymarket.com';
function loadState() {
    try {
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["existsSync"](STATE_FILE)) {
            const data = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["readFileSync"](STATE_FILE, 'utf-8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Error loading real bot state:', e);
    }
    return null;
}
// Fetch current price from Polymarket order book
async function getCurrentPrice(tokenId) {
    try {
        const response = await fetch(`${CLOB_API}/book?token_id=${tokenId}`, {
            headers: {
                'Accept': 'application/json'
            },
            next: {
                revalidate: 10
            }
        });
        if (!response.ok) return null;
        const book = await response.json();
        // IMPORTANT: Polymarket API returns:
        // - bids sorted ASCENDING (lowest/worst first) → best bid is LAST
        // - asks sorted DESCENDING (highest/worst first) → best ask is LAST
        // So we need to find max(bids) and min(asks)
        let bestBid = 0;
        let bestAsk = 1;
        if (book.bids && book.bids.length > 0) {
            // Find highest bid (best for sellers)
            bestBid = Math.max(...book.bids.map((b)=>parseFloat(b.price)));
        }
        if (book.asks && book.asks.length > 0) {
            // Find lowest ask (best for buyers)
            bestAsk = Math.min(...book.asks.map((a)=>parseFloat(a.price)));
        }
        // Use mid-price for valuation (between best bid and ask)
        if (bestBid > 0 && bestAsk < 1 && bestAsk > bestBid) {
            return (bestBid + bestAsk) / 2;
        } else if (bestBid > 0) {
            return bestBid; // If you can only sell, use bid price
        } else if (bestAsk < 1) {
            return bestAsk;
        }
        return null;
    } catch (e) {
        console.error('Error fetching price for token:', tokenId, e);
        return null;
    }
}
// Calculate unrealized PnL for a position
function calculateUnrealizedPnl(position, currentPrice) {
    // For LONG positions: profit when price goes up
    // For SHORT positions: profit when price goes down
    // But in prediction markets, we're buying YES or NO tokens
    // If we buy YES at 0.99 and it's now 1.00, we profit
    // PnL = (currentPrice - entryPrice) * shares for LONG
    // For SHORT (buying NO), the token itself appreciates: same formula
    const pnl = (currentPrice - position.entryPrice) * position.shares;
    const pnlPercent = position.size > 0 ? pnl / position.size * 100 : 0;
    return {
        pnl,
        pnlPercent
    };
}
async function GET() {
    const state = loadState();
    if (!state) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            state: {
                maxExposure: 10,
                currentExposure: 0,
                totalPnl: 0,
                openPositions: [],
                closedPositions: [],
                isRunning: false,
                lastUpdate: new Date().toISOString(),
                config: {
                    maxTotalExposure: 10,
                    minEdgeToEnter: 0.05,
                    dryRun: true
                }
            },
            lastUpdated: new Date().toISOString(),
            message: 'Real trading bot has not been started yet.'
        });
    }
    // Fetch current prices and calculate unrealized PnL for each open position
    const positionsWithPnl = await Promise.all(state.openPositions.map(async (pos)=>{
        if (!pos.tokenId) return pos;
        const currentPrice = await getCurrentPrice(pos.tokenId);
        if (currentPrice === null) return pos;
        const { pnl, pnlPercent } = calculateUnrealizedPnl(pos, currentPrice);
        return {
            ...pos,
            currentPrice,
            unrealizedPnl: pnl,
            unrealizedPnlPercent: pnlPercent
        };
    }));
    // Calculate totals
    const totalUnrealizedPnl = positionsWithPnl.reduce((sum, p)=>sum + (p.unrealizedPnl || 0), 0);
    const totalRealizedPnl = state.closedPositions.reduce((sum, p)=>sum + (p.realizedPnl || 0), 0);
    // Current value of open positions
    const currentPositionValue = positionsWithPnl.reduce((sum, p)=>{
        if (p.currentPrice && p.shares) {
            return sum + p.currentPrice * p.shares;
        }
        return sum + p.size;
    }, 0);
    return __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        state: {
            ...state,
            openPositions: positionsWithPnl
        },
        lastUpdated: new Date().toISOString(),
        stats: {
            totalUnrealizedPnl,
            totalRealizedPnl,
            totalPnl: totalRealizedPnl + totalUnrealizedPnl,
            availableExposure: state.maxExposure - state.currentExposure,
            currentPositionValue,
            totalEquity: state.maxExposure - state.currentExposure + currentPositionValue + totalRealizedPnl
        }
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__46d48676._.js.map