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
"[project]/prediction_market_arb/types/crypto.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Crypto Arbitrage Types
__turbopack_context__.s([
    "COINGECKO_ID_MAP",
    ()=>COINGECKO_ID_MAP,
    "CRYPTO_SYMBOL_MAP",
    ()=>CRYPTO_SYMBOL_MAP,
    "DEFAULT_VOLATILITY",
    ()=>DEFAULT_VOLATILITY,
    "DERIBIT_SUPPORTED",
    ()=>DERIBIT_SUPPORTED
]);
const CRYPTO_SYMBOL_MAP = {
    'bitcoin': 'BTC',
    'btc': 'BTC',
    'ethereum': 'ETH',
    'eth': 'ETH',
    'solana': 'SOL',
    'sol': 'SOL',
    'cardano': 'ADA',
    'ada': 'ADA',
    'dogecoin': 'DOGE',
    'doge': 'DOGE',
    'xrp': 'XRP',
    'ripple': 'XRP',
    'polygon': 'MATIC',
    'matic': 'MATIC',
    'avalanche': 'AVAX',
    'avax': 'AVAX',
    'chainlink': 'LINK',
    'link': 'LINK',
    'polkadot': 'DOT',
    'dot': 'DOT',
    'litecoin': 'LTC',
    'ltc': 'LTC'
};
const COINGECKO_ID_MAP = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'SOL': 'solana',
    'ADA': 'cardano',
    'DOGE': 'dogecoin',
    'XRP': 'ripple',
    'MATIC': 'matic-network',
    'AVAX': 'avalanche-2',
    'LINK': 'chainlink',
    'DOT': 'polkadot',
    'LTC': 'litecoin'
};
const DERIBIT_SUPPORTED = [
    'BTC',
    'ETH'
];
const DEFAULT_VOLATILITY = {
    'BTC': 0.55,
    'ETH': 0.65,
    'SOL': 0.85,
    'ADA': 0.75,
    'DOGE': 1.00,
    'XRP': 0.70,
    'MATIC': 0.80,
    'AVAX': 0.80,
    'LINK': 0.75,
    'DOT': 0.75,
    'LTC': 0.65,
    'DEFAULT': 0.70
};
}),
"[project]/prediction_market_arb/app/api/crypto-prices/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "getHistoricalPrices",
    ()=>getHistoricalPrices
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/prediction_market_arb/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$types$2f$crypto$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/prediction_market_arb/types/crypto.ts [app-route] (ecmascript)");
;
;
/**
 * Crypto Prices API Route
 * 
 * Fetches current prices for cryptocurrencies from CoinGecko.
 * Free tier: 10-50 calls/minute depending on endpoint.
 * 
 * API docs: https://www.coingecko.com/en/api/documentation
 */ const COINGECKO_API = 'https://api.coingecko.com/api/v3';
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const symbolsParam = searchParams.get('symbols');
        // Determine which symbols to fetch
        let symbols;
        if (symbolsParam) {
            symbols = symbolsParam.split(',').map((s)=>s.trim().toUpperCase());
        } else {
            // Default to all supported symbols
            symbols = Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$types$2f$crypto$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COINGECKO_ID_MAP"]);
        }
        // Map symbols to CoinGecko IDs
        const coinIds = [];
        const symbolToId = {};
        for (const symbol of symbols){
            const geckoId = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$types$2f$crypto$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COINGECKO_ID_MAP"][symbol];
            if (geckoId) {
                coinIds.push(geckoId);
                symbolToId[geckoId] = symbol;
            }
        }
        if (coinIds.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'No valid symbols provided',
                supportedSymbols: Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$types$2f$crypto$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COINGECKO_ID_MAP"])
            }, {
                status: 400
            });
        }
        // Fetch market data from CoinGecko
        const response = await fetch(`${COINGECKO_API}/coins/markets?vs_currency=usd&ids=${coinIds.join(',')}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`, {
            headers: {
                'Accept': 'application/json'
            },
            cache: 'no-store'
        });
        if (!response.ok) {
            // Handle rate limiting
            if (response.status === 429) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: 'CoinGecko rate limit exceeded. Please try again in a minute.'
                }, {
                    status: 429
                });
            }
            throw new Error(`CoinGecko API error: ${response.status}`);
        }
        const data = await response.json();
        // Transform to our format
        const prices = {};
        for (const coin of data){
            const symbol = symbolToId[coin.id];
            if (!symbol) continue;
            prices[symbol] = {
                symbol,
                name: coin.name,
                currentPrice: coin.current_price,
                priceChange24h: coin.price_change_24h || 0,
                priceChangePercent24h: coin.price_change_percentage_24h || 0,
                marketCap: coin.market_cap || 0,
                volume24h: coin.total_volume || 0,
                high24h: coin.high_24h || coin.current_price,
                low24h: coin.low_24h || coin.current_price,
                ath: coin.ath || coin.current_price,
                athDate: coin.ath_date || '',
                atl: coin.atl || 0,
                atlDate: coin.atl_date || '',
                lastUpdated: new Date(coin.last_updated || Date.now())
            };
        }
        const result = {
            prices,
            lastUpdated: new Date()
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(result);
    } catch (error) {
        console.error('Crypto prices API error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to fetch crypto prices',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, {
            status: 500
        });
    }
}
async function getHistoricalPrices(symbol, days = 30) {
    try {
        const geckoId = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$types$2f$crypto$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COINGECKO_ID_MAP"][symbol];
        if (!geckoId) return [];
        const response = await fetch(`${COINGECKO_API}/coins/${geckoId}/market_chart?vs_currency=usd&days=${days}&interval=daily`, {
            headers: {
                'Accept': 'application/json'
            },
            cache: 'no-store'
        });
        if (!response.ok) return [];
        const data = await response.json();
        // data.prices is array of [timestamp, price] pairs
        return (data.prices || []).map((p)=>p[1]);
    } catch (e) {
        console.error('Error fetching historical prices:', e);
        return [];
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__4f7788a8._.js.map