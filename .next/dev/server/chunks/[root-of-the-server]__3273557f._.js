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
"[project]/prediction_market_arb/types/trading.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Paper Trading Types
 */ __turbopack_context__.s([
    "DEFAULT_BOT_CONFIG",
    ()=>DEFAULT_BOT_CONFIG
]);
const DEFAULT_BOT_CONFIG = {
    startingBalance: 1000,
    minEdgeToEnter: 0.05,
    maxEdgeToExit: 0.05,
    basePositionSize: 25,
    edgeMultiplier: 500,
    maxPositionSize: 100,
    maxTotalExposure: 500,
    pollIntervalMs: 60000,
    maxPositionsPerMarket: 1,
    minTimeToExpiry: 1
};
}),
"[project]/prediction_market_arb/app/api/bot/status/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/prediction_market_arb/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$types$2f$trading$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/prediction_market_arb/types/trading.ts [app-route] (ecmascript)");
;
;
;
;
const STATE_FILE = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"](process.cwd(), 'data/bot-state.json');
function loadState() {
    try {
        if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["existsSync"](STATE_FILE)) {
            const data = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["readFileSync"](STATE_FILE, 'utf-8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Error loading bot state:', e);
    }
    return null;
}
async function GET() {
    const state = loadState();
    if (!state) {
        // Return empty state if bot hasn't run yet
        const emptyState = {
            startingBalance: 1000,
            currentBalance: 1000,
            totalPnl: 0,
            openPositions: [],
            closedPositions: [],
            trades: [],
            isRunning: false,
            lastUpdate: new Date().toISOString(),
            totalTrades: 0,
            winningTrades: 0,
            losingTrades: 0,
            winRate: 0,
            config: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$types$2f$trading$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_BOT_CONFIG"]
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            state: emptyState,
            lastUpdated: new Date().toISOString(),
            message: 'Bot has not been started yet. Run: npx ts-node bot/trading-bot.ts'
        });
    }
    // Calculate some additional stats
    const totalUnrealizedPnl = state.openPositions.reduce((sum, p)=>sum + (p.unrealizedPnl || 0), 0);
    const totalExposure = state.openPositions.reduce((sum, p)=>sum + p.size, 0);
    const response = {
        state,
        lastUpdated: new Date().toISOString()
    };
    return __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        ...response,
        stats: {
            totalUnrealizedPnl,
            totalExposure,
            availableBalance: state.currentBalance,
            totalEquity: state.currentBalance + totalUnrealizedPnl
        }
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__3273557f._.js.map