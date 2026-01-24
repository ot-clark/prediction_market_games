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
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

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
var __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__ = __turbopack_context__.i("[project]/prediction_market_arb/node_modules/ethers/lib.esm/ethers.js [app-route] (ecmascript) <export * as ethers>");
;
;
;
;
const STATE_FILE = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"](process.cwd(), 'data/real-bot-state.json');
const CLOB_API = 'https://clob.polymarket.com';
const DATA_API = 'https://data-api.polymarket.com';
const POLYGON_RPC = 'https://polygon-rpc.com';
const CTF_CONTRACT = '0x4D97DCd97eC945f40cF65F87097ACe5EA0476045'; // Conditional Tokens Framework (ERC1155)
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
// Check CTF token balance on-chain
async function checkCtfTokenBalance(tokenId, walletAddress) {
    try {
        const provider = new __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__["ethers"].providers.JsonRpcProvider(POLYGON_RPC);
        const erc1155Abi = [
            'function balanceOf(address account, uint256 id) view returns (uint256)'
        ];
        const ctfToken = new __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__["ethers"].Contract(CTF_CONTRACT, erc1155Abi, provider);
        const balance = await ctfToken.balanceOf(walletAddress, tokenId);
        return parseFloat(__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__["ethers"].utils.formatEther(balance));
    } catch (e) {
        console.error(`Error checking CTF token balance:`, e);
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
    // Get wallet address from environment
    const privateKey = process.env.POLYMARKET_PRIVATE_KEY;
    let walletAddress = null;
    if (privateKey) {
        try {
            const wallet = new __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$ethers$2f$lib$2e$esm$2f$ethers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__ethers$3e$__["ethers"].Wallet(privateKey);
            walletAddress = wallet.address;
        } catch (e) {
            console.error('Error deriving wallet address:', e);
        }
    }
    // Fetch actual positions from Polymarket Data API (this is the source of truth)
    let polymarketPositions = [];
    if (walletAddress) {
        try {
            const positionsResponse = await fetch(`${DATA_API}/positions?user=${walletAddress}&limit=100&sortBy=CURRENT&sortDirection=DESC`, {
                headers: {
                    'Accept': 'application/json'
                }
            });
            if (positionsResponse.ok) {
                const positionsData = await positionsResponse.json();
                // Convert Polymarket API format to our RealPosition format
                // Note: In Polymarket API, `size` = number of shares, `initialValue` = cost basis in USD
                polymarketPositions = positionsData.filter((p)=>parseFloat(p.size) > 0) // Only include positions with shares > 0
                .map((p, idx)=>{
                    const shares = parseFloat(p.size); // size = number of shares
                    const avgPrice = parseFloat(p.avgPrice);
                    const currentPrice = parseFloat(p.curPrice);
                    const initialValue = parseFloat(p.initialValue); // Cost basis in USD
                    const currentValue = parseFloat(p.currentValue); // Current market value in USD
                    return {
                        id: `polymarket_${p.asset}_${idx}`,
                        marketId: p.conditionId,
                        marketQuestion: p.title,
                        tokenId: p.asset,
                        side: p.outcomeIndex === 0 ? 'long' : 'short',
                        entryPrice: avgPrice,
                        size: initialValue,
                        shares: shares,
                        entryEdge: 0,
                        entryTimestamp: new Date().toISOString(),
                        status: 'open',
                        currentPrice: currentPrice,
                        currentValue: currentValue,
                        unrealizedPnl: parseFloat(p.cashPnl),
                        unrealizedPnlPercent: parseFloat(p.percentPnl)
                    };
                });
            }
        } catch (e) {
            console.error('Error fetching positions from Polymarket Data API:', e);
        }
    }
    // Use Polymarket API positions if available, otherwise fall back to state file
    const positionsToProcess = polymarketPositions.length > 0 ? polymarketPositions : state.openPositions;
    // If we got positions from Polymarket API, use them directly (they're already accurate)
    // Otherwise, sync positions from state file with blockchain
    let validPositions;
    if (polymarketPositions.length > 0) {
        // Positions from Polymarket API are already accurate - just verify they have valid data
        validPositions = positionsToProcess.filter((p)=>p.shares > 0 && p.size > 0);
    } else {
        // Sync positions from state file with blockchain
        const positionsWithPnl = await Promise.all(positionsToProcess.map(async (pos)=>{
            if (!pos.tokenId) return null;
            // Check on-chain balance if we have wallet address
            let onChainBalance = null;
            if (walletAddress) {
                onChainBalance = await checkCtfTokenBalance(pos.tokenId, walletAddress);
                if (onChainBalance !== null) {
                    // Update shares to match blockchain reality
                    pos.shares = onChainBalance;
                    // If balance is zero, return null to filter it out
                    if (onChainBalance < 0.0001) {
                        return null;
                    }
                }
            } else {
                // If no wallet address, use stored shares (but less reliable)
                onChainBalance = pos.shares;
            }
            // Get current price and calculate P&L
            const currentPrice = await getCurrentPrice(pos.tokenId);
            if (currentPrice === null) return null;
            // Recalculate size based on actual shares if we have on-chain data
            const actualSize = onChainBalance ? onChainBalance * pos.entryPrice : pos.size;
            const { pnl, pnlPercent } = calculateUnrealizedPnl({
                ...pos,
                shares: onChainBalance || pos.shares
            }, currentPrice);
            return {
                ...pos,
                shares: onChainBalance || pos.shares,
                size: actualSize,
                currentPrice,
                unrealizedPnl: pnl,
                unrealizedPnlPercent: pnlPercent
            };
        }));
        // Filter out null positions (zero balance or missing data)
        validPositions = positionsWithPnl.filter((p)=>p !== null && p !== undefined);
    }
    // Calculate totals using valid positions only
    const totalUnrealizedPnl = validPositions.reduce((sum, p)=>sum + (p.unrealizedPnl || 0), 0);
    const totalRealizedPnl = state.closedPositions.reduce((sum, p)=>sum + (p.realizedPnl || 0), 0);
    // Current value of open positions
    const currentPositionValue = validPositions.reduce((sum, p)=>{
        if (p.currentPrice && p.shares) {
            return sum + p.currentPrice * p.shares;
        }
        return sum + p.size;
    }, 0);
    // Recalculate exposure based on actual position sizes
    const actualExposure = validPositions.reduce((sum, p)=>sum + p.size, 0);
    return __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        state: {
            ...state,
            openPositions: validPositions,
            currentExposure: actualExposure
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

//# sourceMappingURL=%5Broot-of-the-server%5D__15f1fce9._.js.map