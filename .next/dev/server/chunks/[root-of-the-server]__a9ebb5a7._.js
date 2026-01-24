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
"[project]/prediction_market_arb/app/api/deribit/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "getIvForStrike",
    ()=>getIvForStrike
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/prediction_market_arb/node_modules/next/server.js [app-route] (ecmascript)");
;
/**
 * Deribit API Route
 * 
 * Fetches options data from Deribit exchange for BTC and ETH.
 * Deribit is the primary crypto options exchange with deep liquidity.
 * 
 * Public API docs: https://docs.deribit.com/
 * No authentication required for public market data.
 */ const DERIBIT_API = 'https://www.deribit.com/api/v2/public';
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const symbol = (searchParams.get('symbol') || 'BTC').toUpperCase();
        const targetExpiry = searchParams.get('expiry'); // Optional: specific expiry to focus on
        if (![
            'BTC',
            'ETH'
        ].includes(symbol)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: `Unsupported symbol: ${symbol}. Deribit only supports BTC and ETH options.`
            }, {
                status: 400
            });
        }
        const currency = symbol;
        // 1. Get current index price
        const indexResponse = await fetch(`${DERIBIT_API}/get_index_price?index_name=${currency.toLowerCase()}_usd`, {
            cache: 'no-store'
        });
        if (!indexResponse.ok) {
            throw new Error(`Failed to fetch index price: ${indexResponse.status}`);
        }
        const indexData = await indexResponse.json();
        const underlyingPrice = indexData.result?.index_price;
        if (!underlyingPrice) {
            throw new Error('Could not get underlying price from Deribit');
        }
        // 2. Get all active options instruments
        const instrumentsResponse = await fetch(`${DERIBIT_API}/get_instruments?currency=${currency}&kind=option&expired=false`, {
            cache: 'no-store'
        });
        if (!instrumentsResponse.ok) {
            throw new Error(`Failed to fetch instruments: ${instrumentsResponse.status}`);
        }
        const instrumentsData = await instrumentsResponse.json();
        const instruments = instrumentsData.result || [];
        // Group instruments by expiration
        const expirationMap = new Map();
        instruments.forEach((inst)=>{
            if (!inst.is_active) return;
            const expTs = inst.expiration_timestamp;
            if (!expirationMap.has(expTs)) {
                expirationMap.set(expTs, []);
            }
            expirationMap.get(expTs).push(inst);
        });
        // Sort expirations by date
        const sortedExpirations = Array.from(expirationMap.entries()).sort((a, b)=>a[0] - b[0]);
        // Build expirations array
        const now = Date.now();
        const expirations = sortedExpirations.map(([timestamp, insts])=>({
                date: new Date(timestamp),
                timestamp,
                daysToExpiry: Math.max(0, (timestamp - now) / (1000 * 60 * 60 * 24)),
                instruments: insts.map((i)=>i.instrument_name)
            }));
        // 3. Fetch ticker data for options near ATM to get IV
        // We'll get options across several expirations to build an IV surface
        const ivByStrike = {};
        // Find ATM strike (closest to current price)
        const allStrikes = [
            ...new Set(instruments.map((i)=>i.strike))
        ].sort((a, b)=>a - b);
        const atmStrike = allStrikes.reduce((closest, strike)=>Math.abs(strike - underlyingPrice) < Math.abs(closest - underlyingPrice) ? strike : closest, allStrikes[0]);
        // Get strikes around ATM (±30% range for building IV surface)
        const minStrike = underlyingPrice * 0.5;
        const maxStrike = underlyingPrice * 2.0;
        const relevantStrikes = allStrikes.filter((s)=>s >= minStrike && s <= maxStrike);
        // Fetch ticker for ATM options to get ATM IV
        let atmIv = 0;
        const atmInstruments = instruments.filter((i)=>i.strike === atmStrike && i.option_type === 'call' && i.is_active);
        // Prefer nearest expiry for ATM IV
        if (atmInstruments.length > 0) {
            const nearestAtm = atmInstruments.sort((a, b)=>a.expiration_timestamp - b.expiration_timestamp)[0];
            try {
                const tickerResponse = await fetch(`${DERIBIT_API}/ticker?instrument_name=${nearestAtm.instrument_name}`, {
                    cache: 'no-store'
                });
                if (tickerResponse.ok) {
                    const tickerData = await tickerResponse.json();
                    const ticker = tickerData.result;
                    // Deribit returns IV as percentage, convert to decimal
                    atmIv = (ticker.mark_iv || 0) / 100;
                }
            } catch (e) {
                console.warn('Failed to fetch ATM ticker:', e);
            }
        }
        // Fetch tickers for a selection of strikes to build IV smile
        // Limit to avoid rate limits - get ~10-15 key strikes per expiry
        const nearestExpiries = sortedExpirations.slice(0, 3); // First 3 expirations
        for (const [expTimestamp, expInstruments] of nearestExpiries){
            const expDate = new Date(expTimestamp);
            const daysToExpiry = Math.max(0, (expTimestamp - now) / (1000 * 60 * 60 * 24));
            // Get unique strikes for this expiry, focus on strikes near ATM
            const expStrikes = [
                ...new Set(expInstruments.map((i)=>i.strike))
            ].filter((s)=>s >= minStrike && s <= maxStrike).sort((a, b)=>Math.abs(a - underlyingPrice) - Math.abs(b - underlyingPrice)).slice(0, 10); // Limit to 10 strikes per expiry
            for (const strike of expStrikes){
                const callInst = expInstruments.find((i)=>i.strike === strike && i.option_type === 'call');
                const putInst = expInstruments.find((i)=>i.strike === strike && i.option_type === 'put');
                if (callInst) {
                    try {
                        const tickerResponse = await fetch(`${DERIBIT_API}/ticker?instrument_name=${callInst.instrument_name}`, {
                            cache: 'no-store'
                        });
                        if (tickerResponse.ok) {
                            const tickerData = await tickerResponse.json();
                            const ticker = tickerData.result;
                            ivByStrike[strike] = {
                                strike,
                                callIv: (ticker.mark_iv || 0) / 100,
                                putIv: 0,
                                callDelta: ticker.delta || 0,
                                putDelta: 0,
                                expiry: expDate,
                                daysToExpiry
                            };
                        }
                    } catch (e) {
                        console.warn(`Failed to fetch ticker for ${callInst.instrument_name}:`, e);
                    }
                }
                // Fetch put IV if we have the call data
                if (putInst && ivByStrike[strike]) {
                    try {
                        const tickerResponse = await fetch(`${DERIBIT_API}/ticker?instrument_name=${putInst.instrument_name}`, {
                            cache: 'no-store'
                        });
                        if (tickerResponse.ok) {
                            const tickerData = await tickerResponse.json();
                            const ticker = tickerData.result;
                            ivByStrike[strike].putIv = (ticker.mark_iv || 0) / 100;
                            ivByStrike[strike].putDelta = ticker.delta || 0;
                        }
                    } catch (e) {
                        console.warn(`Failed to fetch put ticker for ${putInst.instrument_name}:`, e);
                    }
                }
            }
        }
        // If we didn't get ATM IV from ticker, estimate from the ivByStrike data
        if (atmIv === 0 && Object.keys(ivByStrike).length > 0) {
            const ivValues = Object.values(ivByStrike).map((d)=>d.callIv).filter((iv)=>iv > 0);
            if (ivValues.length > 0) {
                atmIv = ivValues.reduce((a, b)=>a + b, 0) / ivValues.length;
            }
        }
        const result = {
            symbol,
            underlyingPrice,
            atmIv: atmIv || 0.55,
            ivByStrike,
            expirations,
            lastUpdated: new Date()
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(result);
    } catch (error) {
        console.error('Deribit API error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to fetch Deribit options data',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, {
            status: 500
        });
    }
}
async function getIvForStrike(symbol, strike, expiryTimestamp) {
    try {
        // Construct instrument name: BTC-31DEC25-100000-C
        const expDate = new Date(expiryTimestamp);
        const day = expDate.getUTCDate();
        const months = [
            'JAN',
            'FEB',
            'MAR',
            'APR',
            'MAY',
            'JUN',
            'JUL',
            'AUG',
            'SEP',
            'OCT',
            'NOV',
            'DEC'
        ];
        const month = months[expDate.getUTCMonth()];
        const year = expDate.getUTCFullYear().toString().slice(-2);
        const instrumentName = `${symbol}-${day}${month}${year}-${strike}-C`;
        const response = await fetch(`${DERIBIT_API}/ticker?instrument_name=${instrumentName}`, {
            cache: 'no-store'
        });
        if (!response.ok) return null;
        const data = await response.json();
        const ticker = data.result;
        return {
            iv: (ticker.mark_iv || 0) / 100,
            delta: ticker.delta || 0
        };
    } catch (e) {
        return null;
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__a9ebb5a7._.js.map