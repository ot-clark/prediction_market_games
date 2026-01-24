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
"[project]/prediction_market_arb/app/api/arbitrage/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/prediction_market_arb/node_modules/next/server.js [app-route] (ecmascript)");
;
/**
 * API Route to find arbitrage opportunities between Polymarket and sportsbooks
 */ // Keywords that indicate a sports market on Polymarket
const SPORTS_KEYWORDS = [
    'nfl',
    'nba',
    'mlb',
    'nhl',
    'ncaa',
    'ncaaf',
    'ncaab',
    'super bowl',
    'world series',
    'stanley cup',
    'march madness',
    'vs.',
    'vs ',
    ' vs ',
    'championship',
    'playoffs',
    'finals'
];
// Sport detection patterns
const SPORT_INDICATORS = {
    'nba': [
        'nba',
        'basketball',
        'lakers',
        'celtics',
        'warriors',
        'heat',
        'bulls',
        'knicks',
        'bucks',
        'nets',
        'suns',
        'nuggets',
        'clippers',
        'grizzlies',
        '76ers',
        'sixers',
        'mavericks',
        'pelicans',
        'rockets',
        'spurs',
        'thunder',
        'jazz',
        'timberwolves',
        'pacers',
        'hawks',
        'magic',
        'hornets',
        'pistons',
        'cavaliers',
        'wizards',
        'raptors',
        'trail blazers'
    ],
    'nfl': [
        'nfl',
        'football',
        'super bowl',
        'cowboys',
        'eagles',
        'chiefs',
        'patriots',
        '49ers',
        'packers',
        'steelers',
        'ravens',
        'bills',
        'dolphins',
        'jets',
        'giants',
        'commanders',
        'bears',
        'lions',
        'vikings',
        'saints',
        'falcons',
        'buccaneers',
        'bucs',
        'cardinals',
        'rams',
        'seahawks',
        'broncos',
        'raiders',
        'chargers',
        'texans',
        'colts',
        'jaguars',
        'titans',
        'bengals',
        'browns'
    ],
    'nhl': [
        'nhl',
        'hockey',
        'stanley cup',
        'bruins',
        'maple leafs',
        'canadiens',
        'habs',
        'rangers',
        'islanders',
        'devils',
        'flyers',
        'penguins',
        'capitals',
        'hurricanes',
        'lightning',
        'panthers',
        'blue jackets',
        'red wings',
        'blackhawks',
        'wild',
        'blues',
        'predators',
        'stars',
        'avalanche',
        'jets',
        'flames',
        'oilers',
        'canucks',
        'kraken',
        'sharks',
        'ducks',
        'kings',
        'golden knights',
        'coyotes',
        'senators',
        'sabres'
    ],
    'mlb': [
        'mlb',
        'baseball',
        'world series',
        'yankees',
        'red sox',
        'dodgers',
        'cubs',
        'mets',
        'braves',
        'phillies',
        'cardinals',
        'brewers',
        'padres',
        'giants',
        'astros',
        'rangers',
        'mariners',
        'angels',
        'athletics',
        'rays',
        'blue jays',
        'orioles',
        'twins',
        'guardians',
        'white sox',
        'royals',
        'tigers',
        'reds',
        'pirates',
        'nationals',
        'marlins',
        'rockies',
        'diamondbacks'
    ],
    'ncaab': [
        'ncaab',
        'ncaa basketball',
        'march madness',
        'college basketball',
        'bulldogs',
        'wildcats',
        'tar heels',
        'blue devils',
        'jayhawks',
        'spartans',
        'wolverines',
        'buckeyes',
        'hoosiers',
        'badgers',
        'hawkeyes',
        'boilermakers',
        'fighting illini',
        'gophers',
        'cornhuskers',
        'nittany lions',
        'terrapins',
        'scarlet knights'
    ],
    'ncaaf': [
        'ncaaf',
        'ncaa football',
        'college football',
        'crimson tide',
        'tigers',
        'bulldogs',
        'buckeyes',
        'wolverines',
        'fighting irish',
        'trojans',
        'longhorns',
        'sooners',
        'aggies',
        'seminoles',
        'gators',
        'hurricanes',
        'hokies',
        'cavaliers',
        'yellow jackets'
    ],
    'soccer': [
        'epl',
        'premier league',
        'la liga',
        'bundesliga',
        'serie a',
        'champions league',
        'mls',
        'manchester',
        'liverpool',
        'chelsea',
        'arsenal',
        'tottenham',
        'city',
        'united',
        'barcelona',
        'real madrid',
        'bayern',
        'juventus',
        'inter',
        'milan',
        'psg'
    ],
    'mma': [
        'ufc',
        'mma',
        'fight night',
        'bellator',
        'pfl'
    ],
    'boxing': [
        'boxing',
        'heavyweight',
        'middleweight',
        'lightweight',
        'welterweight',
        'fury',
        'joshua',
        'canelo',
        'crawford',
        'spence'
    ]
};
// Comprehensive team name mappings (short name → variations)
const TEAM_ALIASES = {
    // NBA
    'hawks': [
        'atlanta hawks',
        'atlanta'
    ],
    'celtics': [
        'boston celtics',
        'boston'
    ],
    'nets': [
        'brooklyn nets',
        'brooklyn'
    ],
    'hornets': [
        'charlotte hornets',
        'charlotte'
    ],
    'bulls': [
        'chicago bulls',
        'chicago'
    ],
    'cavaliers': [
        'cleveland cavaliers',
        'cleveland',
        'cavs'
    ],
    'mavericks': [
        'dallas mavericks',
        'dallas',
        'mavs'
    ],
    'nuggets': [
        'denver nuggets',
        'denver'
    ],
    'pistons': [
        'detroit pistons',
        'detroit'
    ],
    'warriors': [
        'golden state warriors',
        'golden state',
        'gsw'
    ],
    'rockets': [
        'houston rockets',
        'houston'
    ],
    'pacers': [
        'indiana pacers',
        'indiana'
    ],
    'clippers': [
        'los angeles clippers',
        'la clippers'
    ],
    'lakers': [
        'los angeles lakers',
        'la lakers'
    ],
    'grizzlies': [
        'memphis grizzlies',
        'memphis'
    ],
    'heat': [
        'miami heat',
        'miami'
    ],
    'bucks': [
        'milwaukee bucks',
        'milwaukee'
    ],
    'timberwolves': [
        'minnesota timberwolves',
        'minnesota',
        'wolves'
    ],
    'pelicans': [
        'new orleans pelicans',
        'new orleans'
    ],
    'knicks': [
        'new york knicks',
        'ny knicks'
    ],
    'thunder': [
        'oklahoma city thunder',
        'oklahoma city',
        'okc'
    ],
    'magic': [
        'orlando magic',
        'orlando'
    ],
    '76ers': [
        'philadelphia 76ers',
        'philadelphia',
        'sixers',
        'philly'
    ],
    'suns': [
        'phoenix suns',
        'phoenix'
    ],
    'trail blazers': [
        'portland trail blazers',
        'portland',
        'blazers'
    ],
    'kings': [
        'sacramento kings',
        'sacramento'
    ],
    'spurs': [
        'san antonio spurs',
        'san antonio'
    ],
    'raptors': [
        'toronto raptors',
        'toronto'
    ],
    'jazz': [
        'utah jazz',
        'utah'
    ],
    'wizards': [
        'washington wizards',
        'washington'
    ],
    // NFL
    'cardinals': [
        'arizona cardinals',
        'arizona'
    ],
    'falcons': [
        'atlanta falcons'
    ],
    'ravens': [
        'baltimore ravens',
        'baltimore'
    ],
    'bills': [
        'buffalo bills',
        'buffalo'
    ],
    'panthers': [
        'carolina panthers',
        'carolina'
    ],
    'bears': [
        'chicago bears'
    ],
    'bengals': [
        'cincinnati bengals',
        'cincinnati'
    ],
    'browns': [
        'cleveland browns'
    ],
    'cowboys': [
        'dallas cowboys',
        'dallas'
    ],
    'broncos': [
        'denver broncos'
    ],
    'lions': [
        'detroit lions'
    ],
    'packers': [
        'green bay packers',
        'green bay'
    ],
    'texans': [
        'houston texans'
    ],
    'colts': [
        'indianapolis colts',
        'indianapolis',
        'indy'
    ],
    'jaguars': [
        'jacksonville jaguars',
        'jacksonville',
        'jags'
    ],
    'chiefs': [
        'kansas city chiefs',
        'kansas city',
        'kc'
    ],
    'raiders': [
        'las vegas raiders',
        'las vegas',
        'lv raiders'
    ],
    'chargers': [
        'los angeles chargers',
        'la chargers'
    ],
    'rams': [
        'los angeles rams',
        'la rams'
    ],
    'dolphins': [
        'miami dolphins'
    ],
    'vikings': [
        'minnesota vikings',
        'minnesota'
    ],
    'patriots': [
        'new england patriots',
        'new england',
        'pats'
    ],
    'saints': [
        'new orleans saints'
    ],
    'giants': [
        'new york giants',
        'ny giants'
    ],
    'jets': [
        'new york jets',
        'ny jets'
    ],
    'eagles': [
        'philadelphia eagles',
        'philly eagles'
    ],
    'steelers': [
        'pittsburgh steelers',
        'pittsburgh'
    ],
    '49ers': [
        'san francisco 49ers',
        'san francisco',
        'niners',
        'sf 49ers'
    ],
    'seahawks': [
        'seattle seahawks',
        'seattle'
    ],
    'buccaneers': [
        'tampa bay buccaneers',
        'tampa bay',
        'bucs'
    ],
    'titans': [
        'tennessee titans',
        'tennessee'
    ],
    'commanders': [
        'washington commanders'
    ],
    // NHL
    'ducks': [
        'anaheim ducks',
        'anaheim'
    ],
    'coyotes': [
        'arizona coyotes'
    ],
    'bruins': [
        'boston bruins'
    ],
    'sabres': [
        'buffalo sabres'
    ],
    'flames': [
        'calgary flames',
        'calgary'
    ],
    'hurricanes': [
        'carolina hurricanes',
        'carolina'
    ],
    'blackhawks': [
        'chicago blackhawks'
    ],
    'avalanche': [
        'colorado avalanche',
        'colorado'
    ],
    'blue jackets': [
        'columbus blue jackets',
        'columbus'
    ],
    'stars': [
        'dallas stars'
    ],
    'red wings': [
        'detroit red wings'
    ],
    'oilers': [
        'edmonton oilers',
        'edmonton'
    ],
    'panthers': [
        'florida panthers',
        'florida'
    ],
    'kings': [
        'los angeles kings',
        'la kings'
    ],
    'wild': [
        'minnesota wild'
    ],
    'canadiens': [
        'montreal canadiens',
        'montreal',
        'habs'
    ],
    'predators': [
        'nashville predators',
        'nashville',
        'preds'
    ],
    'devils': [
        'new jersey devils',
        'new jersey',
        'nj devils'
    ],
    'islanders': [
        'new york islanders',
        'ny islanders'
    ],
    'rangers': [
        'new york rangers',
        'ny rangers'
    ],
    'senators': [
        'ottawa senators',
        'ottawa',
        'sens'
    ],
    'flyers': [
        'philadelphia flyers'
    ],
    'penguins': [
        'pittsburgh penguins'
    ],
    'sharks': [
        'san jose sharks',
        'san jose'
    ],
    'kraken': [
        'seattle kraken',
        'seattle'
    ],
    'blues': [
        'st louis blues',
        'st. louis blues',
        'stl blues'
    ],
    'lightning': [
        'tampa bay lightning',
        'tampa bay',
        'bolts'
    ],
    'maple leafs': [
        'toronto maple leafs',
        'toronto',
        'leafs'
    ],
    'canucks': [
        'vancouver canucks',
        'vancouver'
    ],
    'golden knights': [
        'vegas golden knights',
        'vegas',
        'vgk'
    ],
    'capitals': [
        'washington capitals',
        'caps'
    ],
    'jets': [
        'winnipeg jets',
        'winnipeg'
    ]
};
/**
 * Check if a Polymarket market is sports-related
 */ function isSportsMarket(market) {
    const text = `${market.question} ${market.description || ''}`.toLowerCase();
    return SPORTS_KEYWORDS.some((keyword)=>text.includes(keyword.toLowerCase()));
}
/**
 * Check if a market is a valid moneyline bet (not spread, not resolved)
 */ function isValidMoneylineMarket(market) {
    const question = market.question.toLowerCase();
    // Exclude spread bets
    if (question.includes('spread:') || question.includes('spread -') || question.includes('spread +')) {
        return false;
    }
    // Exclude over/under bets
    if (question.includes('over/under') || question.includes('total points') || question.includes('o/u')) {
        return false;
    }
    // Exclude already resolved markets (one side at 99%+ or 1%-)
    const prices = Array.isArray(market.outcomePrices) ? market.outcomePrices.map((p)=>parseFloat(p)) : [];
    if (prices.some((p)=>p >= 0.99 || p <= 0.01)) {
        return false;
    }
    // Must have exactly 2 outcomes for simple moneyline
    if (!market.outcomes || market.outcomes.length !== 2) {
        return false;
    }
    return true;
}
/**
 * Detect sport from Polymarket question text
 */ function detectSport(text) {
    const lowerText = text.toLowerCase();
    for (const [sport, indicators] of Object.entries(SPORT_INDICATORS)){
        const matchCount = indicators.filter((ind)=>lowerText.includes(ind)).length;
        if (matchCount >= 1) {
            // For team names, require the text to NOT contain indicators from other sports
            // This helps avoid "Kings" matching both NHL and NBA
            return sport;
        }
    }
    return null;
}
/**
 * Map sportsbook sport key to our sport categories
 */ function mapSportsbookSport(sportKey) {
    if (sportKey.includes('basketball_nba')) return 'nba';
    if (sportKey.includes('basketball_ncaab')) return 'ncaab';
    if (sportKey.includes('americanfootball_nfl')) return 'nfl';
    if (sportKey.includes('americanfootball_ncaaf')) return 'ncaaf';
    if (sportKey.includes('icehockey_nhl')) return 'nhl';
    if (sportKey.includes('baseball_mlb')) return 'mlb';
    if (sportKey.includes('soccer')) return 'soccer';
    if (sportKey.includes('mma')) return 'mma';
    if (sportKey.includes('boxing')) return 'boxing';
    return null;
}
/**
 * Normalize team name for matching
 */ function normalizeTeamName(name) {
    return name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}
/**
 * Get all possible names for a team (short name and aliases)
 */ function getTeamVariations(teamName) {
    const normalized = normalizeTeamName(teamName);
    const variations = [
        normalized
    ];
    // Add the last word (usually the team nickname)
    const words = normalized.split(' ');
    if (words.length > 1) {
        variations.push(words[words.length - 1]); // e.g., "thunder" from "oklahoma city thunder"
    }
    // Check if this team has aliases
    for (const [shortName, aliases] of Object.entries(TEAM_ALIASES)){
        if (aliases.some((alias)=>normalized.includes(alias) || alias.includes(normalized))) {
            variations.push(shortName);
            variations.push(...aliases);
        }
        // Also check if the normalized name matches the short name
        if (normalized.includes(shortName) || shortName === words[words.length - 1]) {
            variations.push(shortName);
            variations.push(...aliases);
        }
    }
    return [
        ...new Set(variations)
    ];
}
/**
 * Extract team names from Polymarket "X vs. Y" or "X vs Y" format
 */ function extractTeamsFromQuestion(question) {
    // Match patterns like "Spurs vs. Thunder" or "Spurs vs Thunder"
    const vsMatch = question.match(/^([A-Za-z0-9\s]+?)\s+vs\.?\s+([A-Za-z0-9\s]+?)(?:\?|$|\s*-|\s*\()/i);
    if (vsMatch) {
        return {
            team1: normalizeTeamName(vsMatch[1]),
            team2: normalizeTeamName(vsMatch[2])
        };
    }
    // Match patterns like "Will X beat Y" or "X to beat Y"
    const beatMatch = question.match(/(?:will\s+)?([A-Za-z0-9\s]+?)\s+(?:beat|defeat|win against)\s+([A-Za-z0-9\s]+)/i);
    if (beatMatch) {
        return {
            team1: normalizeTeamName(beatMatch[1]),
            team2: normalizeTeamName(beatMatch[2])
        };
    }
    return null;
}
/**
 * Check if a Polymarket team name matches a sportsbook team
 */ function teamsMatch(polyTeam, sbTeam) {
    const polyNorm = normalizeTeamName(polyTeam);
    const sbNorm = normalizeTeamName(sbTeam);
    // Get the nickname from sportsbook team (last word usually)
    const sbWords = sbNorm.split(' ');
    const sbNickname = sbWords[sbWords.length - 1]; // e.g., "kings" from "sacramento kings"
    // Direct exact match on nickname
    if (polyNorm === sbNickname) {
        return true;
    }
    // Check if the full SB team name contains the poly team name
    if (sbNorm.includes(polyNorm) && polyNorm.length > 3) {
        return true;
    }
    // Check aliases - but be strict: poly name must match the short name exactly
    for (const [shortName, aliases] of Object.entries(TEAM_ALIASES)){
        if (polyNorm === shortName) {
            // Poly uses exact short name, check if SB team is in aliases
            if (aliases.some((alias)=>sbNorm.includes(alias) || alias === sbNorm)) {
                return true;
            }
        }
    }
    return false;
}
/**
 * Try to match a Polymarket market with a sportsbook event
 */ function matchEvents(polyMarket, sportsbookEvents) {
    // Try to extract teams from "X vs. Y" format first
    const extractedTeams = extractTeamsFromQuestion(polyMarket.question);
    // Detect sport from Polymarket question
    const polyText = `${polyMarket.question} ${polyMarket.description || ''}`;
    const polySport = detectSport(polyText);
    let bestMatch = null;
    for (const sbEvent of sportsbookEvents){
        // Check sport compatibility first (if we can detect it)
        const sbSport = mapSportsbookSport(sbEvent.sportKey);
        if (polySport && sbSport && polySport !== sbSport) {
            continue;
        }
        let homeMatch = false;
        let awayMatch = false;
        if (extractedTeams) {
            // Match extracted teams against sportsbook teams
            homeMatch = teamsMatch(extractedTeams.team1, sbEvent.homeTeam) || teamsMatch(extractedTeams.team2, sbEvent.homeTeam);
            awayMatch = teamsMatch(extractedTeams.team1, sbEvent.awayTeam) || teamsMatch(extractedTeams.team2, sbEvent.awayTeam);
        } else {
            // Fallback: search in full question text
            const homeVariations = getTeamVariations(sbEvent.homeTeam);
            const awayVariations = getTeamVariations(sbEvent.awayTeam);
            homeMatch = homeVariations.some((v)=>polyText.toLowerCase().includes(v));
            awayMatch = awayVariations.some((v)=>polyText.toLowerCase().includes(v));
        }
        if (homeMatch && awayMatch) {
            // Both teams found - high confidence match
            // Even higher if sports match
            const sportBonus = polySport && sbSport && polySport === sbSport ? 0.05 : 0;
            const confidence = (extractedTeams ? 0.90 : 0.70) + sportBonus;
            if (!bestMatch || confidence > bestMatch.confidence) {
                bestMatch = {
                    event: sbEvent,
                    confidence
                };
            }
        }
    // Don't match on single team - too many false positives
    }
    return bestMatch;
}
/**
 * Map Polymarket outcomes to sportsbook outcomes
 */ function mapOutcomes(polyOutcomes, sbEvent) {
    const mapping = new Map();
    polyOutcomes.forEach((outcome)=>{
        const outcomeNorm = normalizeTeamName(outcome);
        // Check if outcome matches home team using the teamsMatch function
        if (teamsMatch(outcomeNorm, sbEvent.homeTeam)) {
            mapping.set(outcome, 'home');
        } else if (teamsMatch(outcomeNorm, sbEvent.awayTeam)) {
            mapping.set(outcome, 'away');
        } else if (outcomeNorm === 'draw' || outcomeNorm === 'tie') {
            mapping.set(outcome, 'draw');
        }
    });
    return mapping;
}
/**
 * Calculate arbitrage opportunity
 */ function calculateArbitrage(polyMarket, sbEvent, confidence) {
    const outcomes = polyMarket.outcomes || [];
    const prices = Array.isArray(polyMarket.outcomePrices) ? polyMarket.outcomePrices.map((p)=>parseFloat(p)) : [];
    if (outcomes.length === 0 || prices.length === 0) return null;
    // Get bids/asks from tokens
    const bids = [];
    const asks = [];
    if (polyMarket.tokens) {
        outcomes.forEach((outcome)=>{
            const key = outcome.toLowerCase().replace(/\s+/g, '-');
            const token = polyMarket.tokens?.[key];
            bids.push(token?.bid ? parseFloat(token.bid) : undefined);
            asks.push(token?.ask ? parseFloat(token.ask) : undefined);
        });
    }
    // Map outcomes to sportsbook
    const outcomeMapping = mapOutcomes(outcomes, sbEvent);
    const comparisons = [];
    outcomes.forEach((outcome, index)=>{
        const polyPrice = prices[index] || 0;
        const polyBid = bids[index];
        const polyAsk = asks[index];
        const sbSide = outcomeMapping.get(outcome);
        if (!sbSide) return;
        const sbOdds = sbEvent.bestOdds[sbSide];
        if (!sbOdds || sbOdds.probability === 0) return;
        const edgePercent = (polyPrice - sbOdds.probability) * 100;
        comparisons.push({
            outcome,
            polymarketPrice: polyPrice,
            polymarketBid: polyBid,
            polymarketAsk: polyAsk,
            bestSportsbookProb: sbOdds.probability,
            bestSportsbookOdds: sbOdds.odds,
            bestBookmaker: sbOdds.bookmaker,
            edgePercent
        });
    });
    if (comparisons.length === 0) return null;
    // Calculate potential arbitrage
    // If sum of best probabilities < 1, there's an arbitrage opportunity
    const totalSbProb = comparisons.reduce((sum, c)=>sum + c.bestSportsbookProb, 0);
    const arbitragePercent = totalSbProb < 1 ? (1 - totalSbProb) * 100 : undefined;
    return {
        polymarketEvent: {
            id: polyMarket.id,
            question: polyMarket.question,
            slug: polyMarket.slug,
            outcomes,
            prices,
            bids,
            asks
        },
        sportsbookEvent: sbEvent,
        matchConfidence: confidence,
        comparison: comparisons,
        arbitragePercent
    };
}
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const minConfidence = parseFloat(searchParams.get('minConfidence') || '0.5');
        // Fetch Polymarket sports markets
        const polyResponse = await fetch(`${request.url.split('/api/')[0]}/api/markets?limit=500&active=true`, {
            cache: 'no-store'
        });
        if (!polyResponse.ok) {
            throw new Error('Failed to fetch Polymarket data');
        }
        const polyData = await polyResponse.json();
        const allPolyMarkets = polyData.data || [];
        // Filter to sports moneyline markets (not spreads, not resolved)
        const sportsMarkets = allPolyMarkets.filter((m)=>isSportsMarket(m) && isValidMoneylineMarket(m));
        console.log(`Found ${sportsMarkets.length} valid sports moneyline markets on Polymarket`);
        // Fetch sportsbook odds
        const sbResponse = await fetch(`${request.url.split('/api/')[0]}/api/sportsbook`, {
            cache: 'no-store'
        });
        const sbData = await sbResponse.json();
        if (sbData.error) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                opportunities: [],
                totalPolymarketSports: sportsMarkets.length,
                totalSportsbookEvents: 0,
                matchedEvents: 0,
                error: sbData.error
            });
        }
        const sportsbookEvents = sbData.data || [];
        console.log(`Found ${sportsbookEvents.length} sportsbook events`);
        // Match and compare
        const opportunities = [];
        for (const polyMarket of sportsMarkets){
            const match = matchEvents(polyMarket, sportsbookEvents);
            if (match && match.confidence >= minConfidence) {
                const arb = calculateArbitrage(polyMarket, match.event, match.confidence);
                if (arb) {
                    opportunities.push(arb);
                }
            }
        }
        // Sort by edge (largest positive edge first)
        opportunities.sort((a, b)=>{
            const maxEdgeA = Math.max(...a.comparison.map((c)=>Math.abs(c.edgePercent)));
            const maxEdgeB = Math.max(...b.comparison.map((c)=>Math.abs(c.edgePercent)));
            return maxEdgeB - maxEdgeA;
        });
        console.log(`Found ${opportunities.length} matched opportunities`);
        return __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            opportunities,
            totalPolymarketSports: sportsMarkets.length,
            totalSportsbookEvents: sportsbookEvents.length,
            matchedEvents: opportunities.length
        });
    } catch (error) {
        console.error('Error calculating arbitrage:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            opportunities: [],
            totalPolymarketSports: 0,
            totalSportsbookEvents: 0,
            matchedEvents: 0,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__551bf991._.js.map