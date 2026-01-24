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
"[project]/prediction_market_arb/app/api/sportsbook/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/prediction_market_arb/node_modules/next/server.js [app-route] (ecmascript)");
;
const ODDS_API_BASE = 'https://api.the-odds-api.com/v4';
// Sports we want to fetch (major US sports + soccer)
const SPORTS_TO_FETCH = [
    'americanfootball_nfl',
    'americanfootball_ncaaf',
    'basketball_nba',
    'basketball_ncaab',
    'icehockey_nhl',
    'baseball_mlb',
    'soccer_usa_mls',
    'soccer_epl',
    'soccer_uefa_champs_league',
    'mma_mixed_martial_arts',
    'boxing_boxing'
];
/**
 * Convert American odds to implied probability
 */ function americanToProb(odds) {
    if (odds > 0) {
        return 100 / (odds + 100);
    } else {
        return Math.abs(odds) / (Math.abs(odds) + 100);
    }
}
/**
 * Convert decimal odds to implied probability
 */ function decimalToProb(odds) {
    return 1 / odds;
}
/**
 * Normalize odds from The Odds API format - Pinnacle only
 */ function normalizeOdds(event, oddsFormat) {
    // Filter to only Pinnacle bookmaker
    const pinnacleBookmaker = event.bookmakers.find((bm)=>bm.key.toLowerCase() === 'pinnacle' || bm.title.toLowerCase().includes('pinnacle'));
    if (!pinnacleBookmaker) {
        return null; // Skip events without Pinnacle odds
    }
    const h2hMarket = pinnacleBookmaker.markets.find((m)=>m.key === 'h2h');
    if (!h2hMarket) return null;
    const homeOutcome = h2hMarket.outcomes.find((o)=>o.name === event.home_team);
    const awayOutcome = h2hMarket.outcomes.find((o)=>o.name === event.away_team);
    const drawOutcome = h2hMarket.outcomes.find((o)=>o.name === 'Draw');
    if (!homeOutcome || !awayOutcome) return null;
    const convertProb = oddsFormat === 'decimal' ? decimalToProb : americanToProb;
    const homeProb = convertProb(homeOutcome.price);
    const awayProb = convertProb(awayOutcome.price);
    const drawProb = drawOutcome ? convertProb(drawOutcome.price) : undefined;
    const normalized = {
        key: pinnacleBookmaker.key,
        name: pinnacleBookmaker.title,
        lastUpdate: pinnacleBookmaker.last_update,
        odds: {
            home: {
                probability: homeProb,
                americanOdds: homeOutcome.price
            },
            away: {
                probability: awayProb,
                americanOdds: awayOutcome.price
            },
            ...drawProb !== undefined && {
                draw: {
                    probability: drawProb,
                    americanOdds: drawOutcome.price
                }
            }
        }
    };
    return {
        eventId: event.id,
        sportKey: event.sport_key,
        sportTitle: event.sport_title,
        commenceTime: event.commence_time,
        homeTeam: event.home_team,
        awayTeam: event.away_team,
        eventName: `${event.away_team} @ ${event.home_team}`,
        bookmakers: [
            normalized
        ],
        bestOdds: {
            home: {
                probability: homeProb,
                odds: homeOutcome.price,
                bookmaker: pinnacleBookmaker.title
            },
            away: {
                probability: awayProb,
                odds: awayOutcome.price,
                bookmaker: pinnacleBookmaker.title
            },
            ...drawProb !== undefined && {
                draw: {
                    probability: drawProb,
                    odds: drawOutcome.price,
                    bookmaker: pinnacleBookmaker.title
                }
            }
        }
    };
}
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const sport = searchParams.get('sport'); // Optional: filter to specific sport
        const apiKey = process.env.ODDS_API_KEY?.trim();
        if (!apiKey) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                data: [],
                sports: [],
                error: 'ODDS_API_KEY not configured. Get a free key at https://the-odds-api.com'
            });
        }
        // Debug: Log API key status (without exposing the key)
        console.log(`API Key configured: ${apiKey ? 'Yes' : 'No'}, Length: ${apiKey?.length || 0}`);
        const sportsToFetch = sport ? [
            sport
        ] : SPORTS_TO_FETCH;
        const allEvents = [];
        const availableSports = [];
        let remainingCredits;
        // Test API key first with a simple request
        try {
            const testUrl = `${ODDS_API_BASE}/sports?apiKey=${apiKey}`;
            const testResponse = await fetch(testUrl, {
                headers: {
                    'Accept': 'application/json'
                },
                cache: 'no-store'
            });
            if (testResponse.status === 401) {
                const testError = await testResponse.json().catch(()=>({}));
                console.error('API Key test failed:', testError);
                return __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    data: [],
                    sports: [],
                    error: `API key authentication failed. Status: ${testResponse.status}. Error: ${JSON.stringify(testError)}. Please verify your ODDS_API_KEY is correct and has not expired.`,
                    details: testError
                }, {
                    status: 401
                });
            }
            if (!testResponse.ok) {
                console.warn(`API key test returned ${testResponse.status}`);
            } else {
                console.log('API key test passed');
            }
        } catch (testError) {
            console.error('Error testing API key:', testError);
        }
        // Fetch odds for each sport
        for (const sportKey of sportsToFetch){
            try {
                const url = new URL(`${ODDS_API_BASE}/sports/${sportKey}/odds`);
                url.searchParams.set('apiKey', apiKey);
                url.searchParams.set('regions', 'us,us2,uk,au'); // Multiple regions to find Pinnacle
                url.searchParams.set('markets', 'h2h'); // Moneyline/head-to-head
                url.searchParams.set('oddsFormat', 'american');
                // Note: The Odds API doesn't support filtering by bookmaker in the request,
                // so we filter in normalizeOdds function
                const response = await fetch(url.toString(), {
                    headers: {
                        'Accept': 'application/json'
                    },
                    cache: 'no-store'
                });
                // Get remaining credits from headers
                const creditsHeader = response.headers.get('x-requests-remaining');
                if (creditsHeader) {
                    remainingCredits = parseInt(creditsHeader, 10);
                }
                if (!response.ok) {
                    // Handle 401 specifically (unauthorized - invalid API key)
                    if (response.status === 401) {
                        let errorData = {};
                        try {
                            const text = await response.text();
                            errorData = JSON.parse(text);
                        } catch  {
                        // Not JSON, use as text
                        }
                        console.error(`401 Unauthorized for ${sportKey}:`, {
                            status: response.status,
                            statusText: response.statusText,
                            errorData,
                            url: url.toString().replace(apiKey, 'REDACTED')
                        });
                        return __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                            data: [],
                            sports: [],
                            error: `Invalid API key. The Odds API returned 401 Unauthorized for ${sportKey}. Error: ${errorData.message || errorData.error || 'Authentication failed'}. Please verify your ODDS_API_KEY in .env.local is correct and restart the server.`,
                            details: errorData
                        }, {
                            status: 401
                        });
                    }
                    // Handle other errors
                    let errorText = 'Unknown error';
                    try {
                        const text = await response.text();
                        errorText = text;
                    } catch  {}
                    console.warn(`Failed to fetch ${sportKey}: ${response.status} - ${errorText}`);
                    continue;
                }
                const events = await response.json();
                if (events.length > 0) {
                    availableSports.push({
                        key: sportKey,
                        title: events[0].sport_title
                    });
                    events.forEach((event)=>{
                        const normalized = normalizeOdds(event, 'american');
                        if (normalized) {
                            allEvents.push(normalized);
                        }
                    });
                }
                console.log(`Fetched ${events.length} events for ${sportKey}`);
            } catch (error) {
                console.warn(`Error fetching ${sportKey}:`, error);
            }
        }
        // Sort by commence time
        allEvents.sort((a, b)=>new Date(a.commenceTime).getTime() - new Date(b.commenceTime).getTime());
        console.log(`Total sportsbook events: ${allEvents.length}`);
        return __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            data: allEvents,
            sports: availableSports,
            remainingCredits
        });
    } catch (error) {
        console.error('Error fetching sportsbook odds:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            data: [],
            sports: [],
            error: error instanceof Error ? error.message : 'Unknown error'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__c6454393._.js.map