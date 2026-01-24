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
"[project]/prediction_market_arb/lib/crypto-math.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Crypto Arbitrage Math Library
 * 
 * Contains all probability calculation functions for comparing
 * Polymarket prices vs options-implied probabilities.
 * 
 * Based on the methodology from Moontower's article:
 * https://moontower.substack.com/p/from-everything-computer-to-everything
 */ __turbopack_context__.s([
    "calculateAverageBrierScore",
    ()=>calculateAverageBrierScore,
    "calculateBrierScore",
    ()=>calculateBrierScore,
    "calculateCallDelta",
    ()=>calculateCallDelta,
    "calculateD1D2",
    ()=>calculateD1D2,
    "calculateDeribitProbability",
    ()=>calculateDeribitProbability,
    "calculateEdge",
    ()=>calculateEdge,
    "calculateOneTouchProbability",
    ()=>calculateOneTouchProbability,
    "calculateRealizedVolatility",
    ()=>calculateRealizedVolatility,
    "calculateVerticalSpreadProbability",
    ()=>calculateVerticalSpreadProbability,
    "calculateZScore",
    ()=>calculateZScore,
    "calculateZScoreProbability",
    ()=>calculateZScoreProbability,
    "normalCDF",
    ()=>normalCDF,
    "normalInverseCDF",
    ()=>normalInverseCDF,
    "normalPDF",
    ()=>normalPDF,
    "parseCryptoMarketQuestion",
    ()=>parseCryptoMarketQuestion,
    "timeToExpiryDays",
    ()=>timeToExpiryDays,
    "timeToExpiryYears",
    ()=>timeToExpiryYears
]);
function normalCDF(x) {
    // Constants for approximation
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;
    // Save the sign of x
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x) / Math.sqrt(2);
    // Approximation formula
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return 0.5 * (1.0 + sign * y);
}
function normalPDF(x) {
    return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}
function normalInverseCDF(p) {
    if (p <= 0) return -Infinity;
    if (p >= 1) return Infinity;
    if (p === 0.5) return 0;
    // Coefficients for rational approximation
    const a = [
        -3.969683028665376e+01,
        2.209460984245205e+02,
        -2.759285104469687e+02,
        1.383577518672690e+02,
        -3.066479806614716e+01,
        2.506628277459239e+00
    ];
    const b = [
        -5.447609879822406e+01,
        1.615858368580409e+02,
        -1.556989798598866e+02,
        6.680131188771972e+01,
        -1.328068155288572e+01
    ];
    const c = [
        -7.784894002430293e-03,
        -3.223964580411365e-01,
        -2.400758277161838e+00,
        -2.549732539343734e+00,
        4.374664141464968e+00,
        2.938163982698783e+00
    ];
    const d = [
        7.784695709041462e-03,
        3.224671290700398e-01,
        2.445134137142996e+00,
        3.754408661907416e+00
    ];
    const pLow = 0.02425;
    const pHigh = 1 - pLow;
    let q, r;
    if (p < pLow) {
        q = Math.sqrt(-2 * Math.log(p));
        return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    } else if (p <= pHigh) {
        q = p - 0.5;
        r = q * q;
        return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
    } else {
        q = Math.sqrt(-2 * Math.log(1 - p));
        return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }
}
function timeToExpiryYears(expiryDate, fromDate = new Date()) {
    const msPerYear = 365.25 * 24 * 60 * 60 * 1000;
    const diffMs = expiryDate.getTime() - fromDate.getTime();
    return Math.max(0, diffMs / msPerYear);
}
function timeToExpiryDays(expiryDate, fromDate = new Date()) {
    const msPerDay = 24 * 60 * 60 * 1000;
    const diffMs = expiryDate.getTime() - fromDate.getTime();
    return Math.max(0, diffMs / msPerDay);
}
function calculateZScore(currentPrice, targetPrice, volatility, timeYears) {
    if (currentPrice <= 0 || targetPrice <= 0 || volatility <= 0 || timeYears <= 0) {
        return targetPrice > currentPrice ? Infinity : -Infinity;
    }
    const logReturn = Math.log(targetPrice / currentPrice);
    const scaledVol = volatility * Math.sqrt(timeYears);
    return logReturn / scaledVol;
}
function calculateZScoreProbability(currentPrice, targetPrice, volatility, timeYears) {
    const zScore = calculateZScore(currentPrice, targetPrice, volatility, timeYears);
    // P(price > target) = 1 - Φ(z) where Φ is standard normal CDF
    // But we need to adjust for the drift-less assumption
    // Under risk-neutral measure: z = [ln(K/S) + 0.5σ²T] / (σ√T)
    // Simplified (ignoring drift): z = ln(K/S) / (σ√T)
    const probability = 1 - normalCDF(zScore);
    // Build math breakdown for display
    const mathBreakdown = {
        formula: 'P(S_T > K) = 1 - Φ(z), where z = ln(K/S) / (σ√T)',
        steps: [
            `Current price (S): $${currentPrice.toLocaleString()}`,
            `Target price (K): $${targetPrice.toLocaleString()}`,
            `Volatility (σ): ${(volatility * 100).toFixed(1)}%`,
            `Time to expiry (T): ${timeYears.toFixed(4)} years (${Math.round(timeYears * 365)} days)`,
            ``,
            `Step 1: Calculate log return`,
            `  ln(K/S) = ln(${targetPrice}/${currentPrice}) = ${Math.log(targetPrice / currentPrice).toFixed(4)}`,
            ``,
            `Step 2: Scale volatility by √T`,
            `  σ√T = ${volatility.toFixed(3)} × √${timeYears.toFixed(4)} = ${(volatility * Math.sqrt(timeYears)).toFixed(4)}`,
            ``,
            `Step 3: Calculate z-score`,
            `  z = ${Math.log(targetPrice / currentPrice).toFixed(4)} / ${(volatility * Math.sqrt(timeYears)).toFixed(4)} = ${zScore.toFixed(4)}`,
            ``,
            `Step 4: Convert to probability`,
            `  P(S > K) = 1 - Φ(${zScore.toFixed(4)}) = 1 - ${normalCDF(zScore).toFixed(4)} = ${probability.toFixed(4)}`,
            ``,
            `Result: ${(probability * 100).toFixed(2)}% probability of exceeding target`
        ],
        result: probability
    };
    return {
        method: 'zscore',
        probability,
        volatilityUsed: volatility,
        timeToExpiry: timeYears,
        zScore,
        mathBreakdown
    };
}
function calculateOneTouchProbability(currentPrice, targetPrice, volatility, timeYears) {
    const zScore = calculateZScore(currentPrice, targetPrice, volatility, timeYears);
    // Determine if this is upward or downward touch
    const isUpward = targetPrice > currentPrice;
    // For upward: P(touch) = 2 × P(settle above) = 2 × (1 - Φ(z))
    // For downward: P(touch) = 2 × P(settle below) = 2 × Φ(z)
    const binaryProb = isUpward ? 1 - normalCDF(zScore) : normalCDF(zScore);
    // One-touch approximation: 2 × binary probability, capped at 1.0
    const oneTouchProb = Math.min(1.0, 2 * binaryProb);
    const direction = isUpward ? 'upward' : 'downward';
    const settleDirection = isUpward ? 'above' : 'below';
    const mathBreakdown = {
        formula: isUpward ? 'P(touch up) ≈ 2 × P(S_T > K) = 2 × (1 - Φ(z))' : 'P(touch down) ≈ 2 × P(S_T < K) = 2 × Φ(z)',
        steps: [
            `Current price (S): $${currentPrice.toLocaleString()}`,
            `Target price (K): $${targetPrice.toLocaleString()}`,
            `Direction: ${direction} (target ${isUpward ? '>' : '<'} current)`,
            `Volatility (σ): ${(volatility * 100).toFixed(1)}%`,
            `Time to expiry (T): ${timeYears.toFixed(4)} years (${Math.round(timeYears * 365)} days)`,
            ``,
            `Step 1: Calculate z-score`,
            `  z = ln(K/S) / (σ√T) = ln(${targetPrice}/${currentPrice}) / (${volatility.toFixed(3)} × √${timeYears.toFixed(4)})`,
            `  z = ${zScore.toFixed(4)}`,
            ``,
            `Step 2: Calculate binary probability (settle ${settleDirection})`,
            isUpward ? `  P(settle above) = 1 - Φ(${zScore.toFixed(4)}) = ${binaryProb.toFixed(4)}` : `  P(settle below) = Φ(${zScore.toFixed(4)}) = ${binaryProb.toFixed(4)}`,
            ``,
            `Step 3: Apply one-touch rule (2x multiplier)`,
            `  P(touch) ≈ 2 × ${binaryProb.toFixed(4)} = ${(2 * binaryProb).toFixed(4)}`,
            oneTouchProb < 2 * binaryProb ? `  Capped at 100%` : '',
            ``,
            `Result: ${(oneTouchProb * 100).toFixed(2)}% probability of touching $${targetPrice.toLocaleString()}`
        ].filter((s)=>s !== ''),
        result: oneTouchProb
    };
    return {
        method: 'zscore',
        probability: oneTouchProb,
        volatilityUsed: volatility,
        timeToExpiry: timeYears,
        zScore,
        mathBreakdown
    };
}
function calculateD1D2(currentPrice, strikePrice, volatility, timeYears, riskFreeRate = 0) {
    if (timeYears <= 0 || volatility <= 0) {
        return {
            d1: 0,
            d2: 0
        };
    }
    const sqrtT = Math.sqrt(timeYears);
    const d1 = (Math.log(currentPrice / strikePrice) + (riskFreeRate + 0.5 * volatility * volatility) * timeYears) / (volatility * sqrtT);
    const d2 = d1 - volatility * sqrtT;
    return {
        d1,
        d2
    };
}
function calculateCallDelta(currentPrice, strikePrice, volatility, timeYears) {
    const { d1 } = calculateD1D2(currentPrice, strikePrice, volatility, timeYears);
    return normalCDF(d1);
}
function calculateDeribitProbability(delta, betType, volatility, timeYears) {
    const probability = betType === 'binary' ? delta : Math.min(1.0, 2 * delta);
    const mathBreakdown = {
        formula: betType === 'binary' ? 'P(S_T > K) ≈ Δ (option delta)' : 'P(touch K) ≈ 2 × Δ',
        steps: [
            `Deribit option delta: ${delta.toFixed(4)}`,
            `Bet type: ${betType}`,
            ``,
            betType === 'binary' ? `For binary (settle above): P = Δ = ${delta.toFixed(4)}` : `For one-touch: P = 2 × Δ = 2 × ${delta.toFixed(4)} = ${Math.min(1.0, 2 * delta).toFixed(4)}`,
            ``,
            `Result: ${(probability * 100).toFixed(2)}% probability`
        ],
        result: probability
    };
    return {
        method: 'deribit-delta',
        probability,
        volatilityUsed: volatility,
        timeToExpiry: timeYears,
        delta,
        mathBreakdown
    };
}
function calculateVerticalSpreadProbability(spreadPrice, strikeWidth, midStrike, currentPrice, volatility, timeYears) {
    const probability = Math.max(0, Math.min(1, spreadPrice / strikeWidth));
    const mathBreakdown = {
        formula: 'P(S_T > K) ≈ Spread Price / Strike Width',
        steps: [
            `Vertical spread price: $${spreadPrice.toFixed(2)}`,
            `Strike width: $${strikeWidth.toFixed(2)}`,
            `Target strike: $${midStrike.toLocaleString()}`,
            ``,
            `P(S > K) = ${spreadPrice.toFixed(2)} / ${strikeWidth.toFixed(2)} = ${probability.toFixed(4)}`,
            ``,
            `Result: ${(probability * 100).toFixed(2)}% probability`
        ],
        result: probability
    };
    return {
        method: 'vertical-spread',
        probability,
        volatilityUsed: volatility,
        timeToExpiry: timeYears,
        mathBreakdown
    };
}
function calculateRealizedVolatility(prices) {
    if (prices.length < 2) return 0;
    // Calculate log returns
    const returns = [];
    for(let i = 1; i < prices.length; i++){
        if (prices[i] > 0 && prices[i - 1] > 0) {
            returns.push(Math.log(prices[i] / prices[i - 1]));
        }
    }
    if (returns.length < 2) return 0;
    // Calculate standard deviation
    const mean = returns.reduce((a, b)=>a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r)=>sum + Math.pow(r - mean, 2), 0) / (returns.length - 1);
    const dailyVol = Math.sqrt(variance);
    // Annualize (assuming 365 days for crypto which trades 24/7)
    return dailyVol * Math.sqrt(365);
}
function calculateBrierScore(prediction, outcome) {
    const outcomeNum = outcome ? 1 : 0;
    return Math.pow(prediction - outcomeNum, 2);
}
function calculateAverageBrierScore(predictions, outcomes) {
    if (predictions.length !== outcomes.length || predictions.length === 0) {
        return 0;
    }
    const totalScore = predictions.reduce((sum, pred, i)=>{
        return sum + calculateBrierScore(pred, outcomes[i]);
    }, 0);
    return totalScore / predictions.length;
}
function parseCryptoMarketQuestion(question) {
    const q = question.toLowerCase();
    // EXCLUSION PATTERNS - Skip markets that aren't about crypto spot prices
    const exclusionPatterns = [
        /market\s*cap/i,
        /\bfdv\b/i,
        /\btvl\b/i,
        /\bmcap\b/i,
        /dominance/i,
        /\bfee[s]?\b/i,
        /\bgas\b/i,
        /\bstaking\b/i,
        /\bairdrop\b/i,
        /\betf\b/i,
        /\bhalving\b/i,
        /mega\s*eth/i,
        /\bweth\b/i,
        /\bsteth\b/i,
        /\breth\b/i,
        /\bcbeth\b/i
    ];
    for (const pattern of exclusionPatterns){
        if (pattern.test(question)) {
            return null;
        }
    }
    // Check if this is a crypto price market
    // Use word boundaries to avoid matching "MegaETH" when looking for "ETH"
    const cryptoPatterns = [
        {
            pattern: /\bbitcoin\b|\bbtc\b/i,
            symbol: 'BTC'
        },
        {
            pattern: /\bethereum\b|\beth\b(?!er)/i,
            symbol: 'ETH'
        },
        {
            pattern: /\bsolana\b|\bsol\b(?!ar)/i,
            symbol: 'SOL'
        },
        {
            pattern: /\bcardano\b|\bada\b/i,
            symbol: 'ADA'
        },
        {
            pattern: /\bdogecoin\b|\bdoge\b/i,
            symbol: 'DOGE'
        },
        {
            pattern: /\bxrp\b|\bripple\b/i,
            symbol: 'XRP'
        },
        {
            pattern: /\bpolygon\b|\bmatic\b/i,
            symbol: 'MATIC'
        },
        {
            pattern: /\bavalanche\b|\bavax\b/i,
            symbol: 'AVAX'
        },
        {
            pattern: /\bchainlink\b|\blink\b/i,
            symbol: 'LINK'
        },
        {
            pattern: /\bpolkadot\b|\bdot\b/i,
            symbol: 'DOT'
        },
        {
            pattern: /\blitecoin\b|\bltc\b/i,
            symbol: 'LTC'
        }
    ];
    let crypto = null;
    for (const { pattern, symbol } of cryptoPatterns){
        if (pattern.test(question)) {
            crypto = symbol;
            break;
        }
    }
    if (!crypto) return null;
    // Check for price target keywords
    const priceKeywords = /\bprice\b|\bhit\b|\breach\b|\babove\b|\bbelow\b|\bexceed\b|\bsurpass\b|\$|\bover\b|\bunder\b|\bdip\b/i;
    if (!priceKeywords.test(question)) return null;
    // Extract price target
    // Patterns: $200,000 | $200k | $200K | 200,000 | 200k
    const pricePatterns = [
        /\$?([\d,]+(?:\.\d+)?)\s*k/i,
        /\$?([\d,]+(?:\.\d+)?)\s*(?:thousand)/i,
        /\$([\d,]+(?:\.\d+)?)/,
        /([\d,]+(?:\.\d+)?)\s*(?:dollars?|usd)/i
    ];
    let targetPrice = null;
    for (const pattern of pricePatterns){
        const match = question.match(pattern);
        if (match) {
            let priceStr = match[1].replace(/,/g, '');
            let price = parseFloat(priceStr);
            // Check if it's in thousands (k suffix)
            if (/k/i.test(match[0]) || /thousand/i.test(match[0])) {
                price *= 1000;
            }
            // Sanity check - BTC price should be > 1000, ETH > 100, etc.
            if (price > 0) {
                targetPrice = price;
                break;
            }
        }
    }
    if (!targetPrice) return null;
    // Determine bet type
    // "hit" / "reach" / "touch" / "dip" = one-touch (path-dependent)
    // "above" / "end" / "close" / "on" = binary (settle above)
    const oneTouchKeywords = /hit|reach|touch|surpass|exceed|dip|drop|crash/i;
    const betType = oneTouchKeywords.test(question) ? 'one-touch' : 'binary';
    // Determine direction
    // "dip", "drop", "crash", "fall", "below", "under" = below/down direction
    const belowKeywords = /below|under|less than|fall|dip|drop|crash|sink|plunge|decline/i;
    const direction = belowKeywords.test(question) ? 'below' : 'above';
    // Extract expiry date
    const expiryDate = parseDateFromQuestion(question);
    return {
        crypto,
        targetPrice,
        expiryDate,
        betType,
        direction
    };
}
/**
 * Parse a date from a market question
 */ function parseDateFromQuestion(question) {
    const months = {
        'january': 0,
        'jan': 0,
        'february': 1,
        'feb': 1,
        'march': 2,
        'mar': 2,
        'april': 3,
        'apr': 3,
        'may': 4,
        'june': 5,
        'jun': 5,
        'july': 6,
        'jul': 6,
        'august': 7,
        'aug': 7,
        'september': 8,
        'sep': 8,
        'sept': 8,
        'october': 9,
        'oct': 9,
        'november': 10,
        'nov': 10,
        'december': 11,
        'dec': 11
    };
    // Pattern: "December 31, 2025" or "Dec 31 2025" or "31 December 2025"
    const datePatterns = [
        /(\w+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s*(\d{4})/i,
        /(\d{1,2})(?:st|nd|rd|th)?\s+(\w+),?\s*(\d{4})/i,
        /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
        /by\s+(?:end\s+of\s+)?(\d{4})/i,
        /before\s+(\d{4})/i,
        /in\s+(\d{4})/i
    ];
    for (const pattern of datePatterns){
        const match = question.match(pattern);
        if (match) {
            // Handle "by 2025" / "before 2026" / "in 2025" patterns
            if (match.length === 2) {
                const year = parseInt(match[1]);
                // "before 2026" means end of 2025, "by 2025" / "in 2025" means end of 2025
                const effectiveYear = /before/i.test(match[0]) ? year - 1 : year;
                return new Date(effectiveYear, 11, 31, 23, 59, 59); // Dec 31 of that year
            }
            // Handle MM/DD/YYYY
            if (/^\d/.test(match[1]) && /^\d/.test(match[2])) {
                const month = parseInt(match[1]) - 1;
                const day = parseInt(match[2]);
                const year = parseInt(match[3]);
                return new Date(year, month, day, 23, 59, 59);
            }
            // Handle Month Day Year or Day Month Year
            let monthStr = match[1].toLowerCase();
            let day = parseInt(match[2]);
            let year = parseInt(match[3]);
            // Check if first match is actually a day number
            if (/^\d+$/.test(match[1])) {
                day = parseInt(match[1]);
                monthStr = match[2].toLowerCase();
            }
            const month = months[monthStr];
            if (month !== undefined) {
                return new Date(year, month, day, 23, 59, 59);
            }
        }
    }
    // Default: try to find just a year and assume end of year
    const yearMatch = question.match(/20\d{2}/);
    if (yearMatch) {
        const year = parseInt(yearMatch[0]);
        return new Date(year, 11, 31, 23, 59, 59);
    }
    return null;
}
function calculateEdge(polymarketPrice, modelProbability) {
    const edge = polymarketPrice - modelProbability;
    const absEdge = Math.abs(edge);
    // Determine signal
    let signal;
    if (absEdge < 0.03) {
        signal = 'neutral'; // Less than 3% edge - not actionable
    } else if (edge > 0) {
        signal = 'sell'; // Polymarket overpriced - sell / take under
    } else {
        signal = 'buy'; // Polymarket underpriced - buy / take over
    }
    // Determine confidence
    let confidence;
    if (absEdge > 0.10) {
        confidence = 'high'; // >10% edge
    } else if (absEdge > 0.05) {
        confidence = 'medium'; // 5-10% edge
    } else {
        confidence = 'low'; // <5% edge
    }
    return {
        edge,
        signal,
        confidence
    };
}
}),
"[project]/prediction_market_arb/app/api/crypto-arbitrage/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/prediction_market_arb/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$types$2f$crypto$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/prediction_market_arb/types/crypto.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$lib$2f$crypto$2d$math$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/prediction_market_arb/lib/crypto-math.ts [app-route] (ecmascript)");
;
;
;
/**
 * Crypto Arbitrage API Route
 * 
 * Compares Polymarket crypto price target markets against
 * options-implied probabilities from Deribit and z-score calculations.
 */ const GAMMA_API = 'https://gamma-api.polymarket.com';
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '100', 10);
        // Step 1: Fetch Polymarket markets
        const polymarketMarkets = await fetchPolymarketCryptoMarkets(limit);
        console.log(`Found ${polymarketMarkets.length} crypto price target markets`);
        if (polymarketMarkets.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                opportunities: [],
                totalCryptoMarkets: 0,
                supportedCryptos: Object.keys(__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$types$2f$crypto$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["COINGECKO_ID_MAP"]),
                lastUpdated: new Date(),
                message: 'No crypto price target markets found on Polymarket'
            });
        }
        // Step 2: Get unique cryptos we need prices for
        const cryptoSymbols = [
            ...new Set(polymarketMarkets.map((m)=>m.crypto))
        ];
        console.log(`Cryptos needed: ${cryptoSymbols.join(', ')}`);
        // Step 3: Fetch current prices from CoinGecko
        const pricesResponse = await fetch(`${getBaseUrl(request)}/api/crypto-prices?symbols=${cryptoSymbols.join(',')}`, {
            cache: 'no-store'
        });
        let prices = {};
        if (pricesResponse.ok) {
            const pricesData = await pricesResponse.json();
            prices = pricesData.prices;
        } else {
            console.warn('Failed to fetch crypto prices');
        }
        // Step 4: Fetch Deribit IV for BTC and ETH (if needed)
        const deribitData = {};
        for (const symbol of cryptoSymbols){
            if (__TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$types$2f$crypto$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DERIBIT_SUPPORTED"].includes(symbol)) {
                try {
                    const deribitResponse = await fetch(`${getBaseUrl(request)}/api/deribit?symbol=${symbol}`, {
                        cache: 'no-store'
                    });
                    if (deribitResponse.ok) {
                        deribitData[symbol] = await deribitResponse.json();
                        console.log(`Got Deribit data for ${symbol}: ATM IV = ${(deribitData[symbol].atmIv * 100).toFixed(1)}%`);
                    }
                } catch (e) {
                    console.warn(`Failed to fetch Deribit data for ${symbol}:`, e);
                }
            }
        }
        // Step 5: Calculate arbitrage opportunities
        const opportunities = [];
        for (const market of polymarketMarkets){
            const priceData = prices[market.crypto];
            if (!priceData) {
                console.warn(`No price data for ${market.crypto}, skipping market`);
                continue;
            }
            const currentPrice = priceData.currentPrice;
            if (!currentPrice || currentPrice <= 0) continue;
            // Get volatility data
            const volatility = getVolatilityData(market.crypto, deribitData);
            // Calculate time to expiry
            const timeYears = (0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$lib$2f$crypto$2d$math$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timeToExpiryYears"])(market.expiryDate);
            if (timeYears <= 0) {
                console.log(`Market expired: ${market.question}`);
                continue;
            }
            // Adjust target price for direction
            const effectiveTarget = market.direction === 'below' ? market.targetPrice // For "below" bets, probability calculation is different
             : market.targetPrice;
            // Calculate z-score probability
            let zscoreProb;
            if (market.betType === 'one-touch') {
                // One-touch function handles direction internally based on target vs current price
                zscoreProb = (0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$lib$2f$crypto$2d$math$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["calculateOneTouchProbability"])(currentPrice, effectiveTarget, volatility.volatility, timeYears);
            // No need to flip - the function already calculates the correct direction
            } else {
                // Binary bet: calculates P(settle above target)
                zscoreProb = (0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$lib$2f$crypto$2d$math$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["calculateZScoreProbability"])(currentPrice, effectiveTarget, volatility.volatility, timeYears);
                // For "below" direction, flip the probability
                if (market.direction === 'below') {
                    zscoreProb.probability = 1 - zscoreProb.probability;
                }
            }
            // Calculate Deribit-based probability (if available)
            let deribitProb;
            const deribit = deribitData[market.crypto];
            if (deribit && __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$types$2f$crypto$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DERIBIT_SUPPORTED"].includes(market.crypto)) {
                // Find the closest strike IV from Deribit options chain
                const ivData = findClosestStrikeIV(deribit, effectiveTarget, market.expiryDate);
                if (ivData && ivData.iv > 0) {
                    // Use the IV from the closest strike (captures vol smile/skew)
                    const strikeIv = ivData.iv;
                    // Calculate d1 for Black-Scholes delta
                    const sqrtT = Math.sqrt(timeYears);
                    const d1 = (Math.log(currentPrice / effectiveTarget) + 0.5 * strikeIv * strikeIv * timeYears) / (strikeIv * sqrtT);
                    // Call delta = Φ(d1) = P(settle above target)
                    const callDelta = (0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$lib$2f$crypto$2d$math$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["calculateCallDelta"])(currentPrice, effectiveTarget, strikeIv, timeYears);
                    const putDelta = 1 - callDelta;
                    let probability;
                    let formulaStr;
                    let stepsArr;
                    const isTargetAbove = effectiveTarget > currentPrice;
                    if (market.betType === 'one-touch') {
                        // For one-touch: P(touch) ≈ 2 × delta
                        const baseDelta = isTargetAbove ? callDelta : putDelta;
                        probability = Math.min(1.0, 2 * baseDelta);
                        formulaStr = isTargetAbove ? 'P(touch up) = min(1, 2 × Call Delta) = min(1, 2 × Φ(d1))' : 'P(touch down) = min(1, 2 × Put Delta) = min(1, 2 × (1 - Φ(d1)))';
                        stepsArr = [
                            `Current price (S): $${currentPrice.toLocaleString()}`,
                            `Target price (K): $${effectiveTarget.toLocaleString()}`,
                            `Strike IV from Deribit: ${(strikeIv * 100).toFixed(1)}%`,
                            `Time to expiry (T): ${timeYears.toFixed(4)} years (${Math.round(timeYears * 365)} days)`,
                            ``,
                            `Step 1: Calculate d1 (Black-Scholes)`,
                            `  d1 = [ln(S/K) + (σ²/2)T] / (σ√T)`,
                            `  d1 = [ln(${currentPrice}/${effectiveTarget}) + (${strikeIv.toFixed(3)}²/2)×${timeYears.toFixed(4)}] / (${strikeIv.toFixed(3)}×√${timeYears.toFixed(4)})`,
                            `  d1 = ${d1.toFixed(4)}`,
                            ``,
                            `Step 2: Calculate delta`,
                            `  Call Delta = Φ(d1) = Φ(${d1.toFixed(4)}) = ${callDelta.toFixed(4)}`,
                            `  Put Delta = 1 - Call Delta = ${putDelta.toFixed(4)}`,
                            ``,
                            `Step 3: Apply one-touch rule (2× multiplier)`,
                            `  Target is ${isTargetAbove ? 'ABOVE' : 'BELOW'} current → use ${isTargetAbove ? 'Call' : 'Put'} Delta`,
                            `  P(touch) = min(1, 2 × ${baseDelta.toFixed(4)}) = ${probability.toFixed(4)}`,
                            ``,
                            `Result: ${(probability * 100).toFixed(2)}% probability`
                        ];
                    } else {
                        // Binary bet: P(settle above/below)
                        const useCallDelta = market.direction === 'above';
                        probability = useCallDelta ? callDelta : putDelta;
                        formulaStr = useCallDelta ? 'P(settle above) = Call Delta = Φ(d1)' : 'P(settle below) = Put Delta = 1 - Φ(d1)';
                        stepsArr = [
                            `Current price (S): $${currentPrice.toLocaleString()}`,
                            `Target price (K): $${effectiveTarget.toLocaleString()}`,
                            `Strike IV from Deribit: ${(strikeIv * 100).toFixed(1)}%`,
                            `Time to expiry (T): ${timeYears.toFixed(4)} years (${Math.round(timeYears * 365)} days)`,
                            ``,
                            `Step 1: Calculate d1 (Black-Scholes)`,
                            `  d1 = [ln(S/K) + (σ²/2)T] / (σ√T)`,
                            `  d1 = ${d1.toFixed(4)}`,
                            ``,
                            `Step 2: Calculate delta`,
                            `  Call Delta = Φ(d1) = ${callDelta.toFixed(4)}`,
                            `  Put Delta = 1 - Φ(d1) = ${putDelta.toFixed(4)}`,
                            ``,
                            `Step 3: Select probability based on bet direction`,
                            `  Direction: ${market.direction}`,
                            `  P(settle ${market.direction}) = ${useCallDelta ? 'Call' : 'Put'} Delta = ${probability.toFixed(4)}`,
                            ``,
                            `Result: ${(probability * 100).toFixed(2)}% probability`
                        ];
                    }
                    // Only create Deribit probability if probability is reasonable
                    if (probability > 0 && probability < 1) {
                        deribitProb = {
                            method: 'deribit-delta',
                            probability,
                            volatilityUsed: strikeIv,
                            timeToExpiry: timeYears,
                            delta: isTargetAbove ? callDelta : putDelta,
                            mathBreakdown: {
                                formula: formulaStr,
                                steps: stepsArr,
                                result: probability
                            }
                        };
                    }
                }
            }
            // Calculate edge
            const polymarketProb = market.polymarketPrice;
            const zscoreEdge = (0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$lib$2f$crypto$2d$math$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["calculateEdge"])(polymarketProb, zscoreProb.probability);
            let deribitEdge;
            if (deribitProb) {
                deribitEdge = (0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$lib$2f$crypto$2d$math$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["calculateEdge"])(polymarketProb, deribitProb.probability);
            }
            // Determine overall signal and confidence
            // Prefer Deribit data when available
            const primaryEdge = deribitEdge || zscoreEdge;
            const opportunity = {
                market: {
                    ...market,
                    resolved: false
                },
                currentPrice: {
                    symbol: market.crypto,
                    price: currentPrice,
                    lastUpdated: new Date()
                },
                volatility,
                polymarketProb,
                zscoreProb,
                deribitProb,
                edgeVsZscore: zscoreEdge.edge,
                edgeVsDeribit: deribitEdge?.edge,
                signal: primaryEdge.signal,
                confidence: primaryEdge.confidence
            };
            opportunities.push(opportunity);
        }
        // Sort by absolute edge (highest edge first)
        opportunities.sort((a, b)=>{
            const aEdge = Math.abs(a.edgeVsDeribit ?? a.edgeVsZscore);
            const bEdge = Math.abs(b.edgeVsDeribit ?? b.edgeVsZscore);
            return bEdge - aEdge;
        });
        const result = {
            opportunities,
            totalCryptoMarkets: polymarketMarkets.length,
            supportedCryptos: cryptoSymbols,
            lastUpdated: new Date()
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(result);
    } catch (error) {
        console.error('Crypto arbitrage API error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to calculate crypto arbitrage',
            details: error instanceof Error ? error.message : 'Unknown error',
            opportunities: [],
            totalCryptoMarkets: 0,
            supportedCryptos: [],
            lastUpdated: new Date()
        }, {
            status: 500
        });
    }
}
/**
 * Fetch crypto price target markets from Polymarket
 */ async function fetchPolymarketCryptoMarkets(limit) {
    const markets = [];
    try {
        // Fetch active markets from Polymarket
        // We'll fetch more than needed and filter for crypto markets
        const response = await fetch(`${GAMMA_API}/markets?active=true&closed=false&limit=${limit * 3}&order=volume24hr&ascending=false`, {
            headers: {
                'Accept': 'application/json'
            },
            cache: 'no-store'
        });
        if (!response.ok) {
            throw new Error(`Polymarket API error: ${response.status}`);
        }
        const data = await response.json();
        for (const market of data){
            const question = market.question || '';
            const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$lib$2f$crypto$2d$math$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseCryptoMarketQuestion"])(question);
            if (!parsed) continue; // Not a crypto price target market
            if (!parsed.expiryDate) {
                // Try to use market end date if we couldn't parse from question
                if (market.endDate) {
                    parsed.expiryDate = new Date(market.endDate);
                } else {
                    continue; // Can't determine expiry
                }
            }
            // Get the price - handle different formats
            let polymarketPrice = 0;
            try {
                if (market.outcomePrices) {
                    const prices = typeof market.outcomePrices === 'string' ? JSON.parse(market.outcomePrices) : market.outcomePrices;
                    // First outcome is typically "Yes"
                    polymarketPrice = parseFloat(prices[0]) || 0;
                }
            } catch (e) {
                console.warn('Failed to parse outcome prices:', e);
            }
            // Skip if no valid price
            if (polymarketPrice <= 0 || polymarketPrice >= 1) continue;
            // Parse token IDs for trading
            let tokenIds = [];
            if (market.clobTokenIds) {
                try {
                    tokenIds = typeof market.clobTokenIds === 'string' ? JSON.parse(market.clobTokenIds) : market.clobTokenIds;
                } catch (e) {
                // Ignore parse errors
                }
            }
            markets.push({
                id: market.conditionId || market.id,
                question,
                slug: market.slug || market.id,
                description: market.description,
                crypto: parsed.crypto,
                targetPrice: parsed.targetPrice,
                expiryDate: parsed.expiryDate,
                betType: parsed.betType,
                direction: parsed.direction,
                polymarketPrice,
                volume: market.volumeNum?.toString() || market.volume?.toString(),
                liquidity: market.liquidity?.toString(),
                tokenIds
            });
        }
    } catch (error) {
        console.error('Error fetching Polymarket markets:', error);
    }
    return markets.slice(0, limit);
}
/**
 * Get volatility data for a crypto
 */ function getVolatilityData(symbol, deribitData) {
    const deribit = deribitData[symbol];
    if (deribit && deribit.atmIv > 0) {
        return {
            symbol,
            deribitIv: deribit.atmIv,
            deribitIvSource: `ATM IV from Deribit`,
            defaultVol: __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$types$2f$crypto$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_VOLATILITY"][symbol] || __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$types$2f$crypto$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_VOLATILITY"].DEFAULT,
            source: 'deribit',
            volatility: deribit.atmIv
        };
    }
    // Fall back to default volatility
    const defaultVol = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$types$2f$crypto$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_VOLATILITY"][symbol] || __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$types$2f$crypto$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_VOLATILITY"].DEFAULT;
    return {
        symbol,
        defaultVol,
        source: 'default',
        volatility: defaultVol
    };
}
/**
 * Find the closest strike IV from Deribit data
 * Returns IV and indicates we should calculate delta ourselves
 */ function findClosestStrikeIV(deribit, targetStrike, targetExpiry) {
    const ivByStrike = deribit.ivByStrike;
    if (!ivByStrike || Object.keys(ivByStrike).length === 0) {
        // Fall back to ATM IV, but don't assume delta - calculate it
        return {
            iv: deribit.atmIv,
            delta: null
        };
    }
    // Find the strike closest to our target
    const strikes = Object.keys(ivByStrike).map(Number);
    const closest = strikes.reduce((best, strike)=>Math.abs(strike - targetStrike) < Math.abs(best - targetStrike) ? strike : best);
    const data = ivByStrike[closest];
    if (!data) {
        return {
            iv: deribit.atmIv,
            delta: null
        };
    }
    // Only use the delta if the strike is close to our target (within 20%)
    // Otherwise, calculate it ourselves with the IV
    const strikeIsClose = Math.abs(closest - targetStrike) / targetStrike < 0.2;
    return {
        iv: data.callIv || deribit.atmIv,
        delta: strikeIsClose && data.callDelta && data.callDelta > 0 && data.callDelta < 1 ? data.callDelta : null
    };
}
/**
 * Get base URL for internal API calls
 */ function getBaseUrl(request) {
    // In production (Railway), use HTTP for internal calls to avoid SSL issues
    // Railway's internal networking doesn't need SSL for localhost calls
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const url = new URL(request.url);
    return `${url.protocol}//${url.host}`;
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__5680025b._.js.map