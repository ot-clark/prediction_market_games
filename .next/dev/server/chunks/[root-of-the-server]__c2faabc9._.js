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
    // Binary probability (settle above)
    const binaryProb = 1 - normalCDF(zScore);
    // One-touch approximation: 2 × binary probability
    // This is capped at 1.0
    const oneTouchProb = Math.min(1.0, 2 * binaryProb);
    const mathBreakdown = {
        formula: 'P(touch K) ≈ 2 × Δ ≈ 2 × P(S_T > K)',
        steps: [
            `Current price (S): $${currentPrice.toLocaleString()}`,
            `Target price (K): $${targetPrice.toLocaleString()}`,
            `Volatility (σ): ${(volatility * 100).toFixed(1)}%`,
            `Time to expiry (T): ${timeYears.toFixed(4)} years`,
            ``,
            `Step 1: Calculate binary probability (settle above)`,
            `  z = ln(K/S) / (σ√T) = ${zScore.toFixed(4)}`,
            `  P(settle above) = 1 - Φ(z) = ${binaryProb.toFixed(4)}`,
            ``,
            `Step 2: Apply one-touch rule of thumb`,
            `  P(touch) ≈ 2 × P(settle above) = 2 × ${binaryProb.toFixed(4)} = ${(2 * binaryProb).toFixed(4)}`,
            oneTouchProb < 2 * binaryProb ? `  Capped at 100%` : '',
            ``,
            `Result: ${(oneTouchProb * 100).toFixed(2)}% probability of touching target`,
            ``,
            `Note: "Touch" is always ≥ "Settle above" since touching includes all`,
            `cases where price ends above target, plus cases where it touched and fell back.`
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
    // Check if this is a crypto price market
    const cryptoPatterns = [
        {
            pattern: /bitcoin|btc/i,
            symbol: 'BTC'
        },
        {
            pattern: /ethereum|eth(?!er)/i,
            symbol: 'ETH'
        },
        {
            pattern: /solana|sol(?!ar)/i,
            symbol: 'SOL'
        },
        {
            pattern: /cardano|ada/i,
            symbol: 'ADA'
        },
        {
            pattern: /dogecoin|doge/i,
            symbol: 'DOGE'
        },
        {
            pattern: /xrp|ripple/i,
            symbol: 'XRP'
        },
        {
            pattern: /polygon|matic/i,
            symbol: 'MATIC'
        },
        {
            pattern: /avalanche|avax/i,
            symbol: 'AVAX'
        },
        {
            pattern: /chainlink|link/i,
            symbol: 'LINK'
        },
        {
            pattern: /polkadot|dot/i,
            symbol: 'DOT'
        },
        {
            pattern: /litecoin|ltc/i,
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
    const priceKeywords = /price|hit|reach|above|below|exceed|surpass|\$|over|under/i;
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
    // "hit" / "reach" / "touch" = one-touch (path-dependent)
    // "above" / "end" / "close" / "on" = binary (settle above)
    const oneTouchKeywords = /hit|reach|touch|surpass|exceed/i;
    const betType = oneTouchKeywords.test(question) ? 'one-touch' : 'binary';
    // Determine direction
    const belowKeywords = /below|under|less than|fall/i;
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
"[project]/prediction_market_arb/app/api/crypto-backtest/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
 * Crypto Backtest API Route
 * 
 * Analyzes historical accuracy of different probability estimation methods:
 * 1. Z-score method (lognormal assumption with default vol)
 * 2. Deribit IV method (using historical implied volatility)
 * 3. Polymarket prices (as a baseline)
 * 
 * The backtest uses resolved Polymarket markets and reconstructs
 * what each method would have predicted.
 */ const GAMMA_API = 'https://gamma-api.polymarket.com';
const COINGECKO_API = 'https://api.coingecko.com/api/v3';
async function GET() {
    try {
        // Step 1: Fetch resolved crypto markets from Polymarket
        const resolvedMarkets = await fetchResolvedCryptoMarkets();
        console.log(`Found ${resolvedMarkets.length} resolved crypto price markets`);
        if (resolvedMarkets.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                summary: createEmptySummary(),
                methodology: getMethodologyText(),
                lastUpdated: new Date(),
                message: 'No resolved crypto price target markets found for backtesting'
            });
        }
        // Step 2: For each market, calculate what we would have predicted
        const results = [];
        for (const market of resolvedMarkets){
            try {
                // We need the price at the time the market was active
                // Ideally we'd have the price from when the market started
                // For simplicity, we'll use the start date price if available
                const historicalPrice = await getHistoricalPrice(market.crypto, market.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Default to 30 days ago
                );
                if (!historicalPrice) {
                    console.warn(`No historical price for ${market.crypto}, skipping`);
                    continue;
                }
                // Calculate time to expiry from when market started
                const timeYears = (0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$lib$2f$crypto$2d$math$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timeToExpiryYears"])(market.expiryDate, market.startDate || new Date());
                if (timeYears <= 0) continue;
                // Get volatility (use default since we can't easily get historical Deribit IV)
                const volatility = __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$types$2f$crypto$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_VOLATILITY"][market.crypto] || __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$types$2f$crypto$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DEFAULT_VOLATILITY"].DEFAULT;
                // Calculate z-score probability
                let zscoreProb;
                if (market.betType === 'one-touch') {
                    const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$lib$2f$crypto$2d$math$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["calculateOneTouchProbability"])(historicalPrice, market.targetPrice, volatility, timeYears);
                    zscoreProb = result.probability;
                } else {
                    const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$lib$2f$crypto$2d$math$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["calculateZScoreProbability"])(historicalPrice, market.targetPrice, volatility, timeYears);
                    zscoreProb = result.probability;
                }
                // Adjust for direction
                if (market.direction === 'below') {
                    zscoreProb = 1 - zscoreProb;
                }
                // For Deribit, we'll estimate based on a higher IV (options usually trade at premium)
                // This is a simplification - in production you'd want historical IV data
                const deribitVolatility = volatility * 1.1; // Assume 10% IV premium
                let deribitProb;
                if (market.betType === 'one-touch') {
                    const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$lib$2f$crypto$2d$math$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["calculateOneTouchProbability"])(historicalPrice, market.targetPrice, deribitVolatility, timeYears);
                    deribitProb = result.probability;
                } else {
                    const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$lib$2f$crypto$2d$math$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["calculateZScoreProbability"])(historicalPrice, market.targetPrice, deribitVolatility, timeYears);
                    deribitProb = result.probability;
                }
                if (market.direction === 'below') {
                    deribitProb = 1 - deribitProb;
                }
                // Calculate Brier scores
                const actualOutcome = market.outcome || false;
                const zscoreBrier = (0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$lib$2f$crypto$2d$math$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["calculateBrierScore"])(zscoreProb, actualOutcome);
                const deribitBrier = (0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$lib$2f$crypto$2d$math$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["calculateBrierScore"])(deribitProb, actualOutcome);
                const polymarketBrier = (0, __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$lib$2f$crypto$2d$math$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["calculateBrierScore"])(market.polymarketPrice, actualOutcome);
                results.push({
                    market,
                    zscorePrediction: zscoreProb,
                    deribitPrediction: deribitProb,
                    polymarketPrice: market.polymarketPrice,
                    actualOutcome,
                    zscoreBrierScore: zscoreBrier,
                    deribitBrierScore: deribitBrier,
                    polymarketBrierScore: polymarketBrier
                });
            } catch (e) {
                console.warn(`Error processing market ${market.id}:`, e);
            }
        }
        // Step 3: Calculate summary statistics
        const summary = calculateBacktestSummary(results);
        const response = {
            summary,
            methodology: getMethodologyText(),
            lastUpdated: new Date()
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(response);
    } catch (error) {
        console.error('Backtest API error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$prediction_market_arb$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to run backtest',
            details: error instanceof Error ? error.message : 'Unknown error',
            summary: createEmptySummary(),
            methodology: getMethodologyText(),
            lastUpdated: new Date()
        }, {
            status: 500
        });
    }
}
/**
 * Fetch resolved crypto price markets from Polymarket
 */ async function fetchResolvedCryptoMarkets() {
    const markets = [];
    try {
        // Fetch closed/resolved markets
        // Note: Polymarket's API may have limitations on historical data
        const response = await fetch(`${GAMMA_API}/markets?closed=true&limit=200&order=endDate&ascending=false`, {
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
            if (!parsed) continue;
            if (!parsed.expiryDate && market.endDate) {
                parsed.expiryDate = new Date(market.endDate);
            }
            if (!parsed.expiryDate) continue;
            // Get the final/resolution price
            let polymarketPrice = 0;
            let outcome;
            try {
                if (market.outcomePrices) {
                    const prices = typeof market.outcomePrices === 'string' ? JSON.parse(market.outcomePrices) : market.outcomePrices;
                    polymarketPrice = parseFloat(prices[0]) || 0;
                    // If market is resolved, the price should be 0 or 1
                    if (polymarketPrice >= 0.99) {
                        outcome = true;
                    } else if (polymarketPrice <= 0.01) {
                        outcome = false;
                    }
                }
                // Check for resolution outcome in other fields
                if (outcome === undefined && market.resolution !== undefined) {
                    outcome = market.resolution === 'Yes' || market.resolution === true;
                }
            } catch (e) {
                console.warn('Failed to parse market data:', e);
            }
            // Skip if we can't determine the outcome
            if (outcome === undefined) continue;
            // For backtesting, we want the price BEFORE resolution
            // We'll use volume-weighted average or mid-point if available
            // For now, just use the resolution price (0 or 1)
            // In a real backtest, you'd want historical price data
            const historicalPrice = market.volumeWeightedAvgPrice || 0.5;
            markets.push({
                id: market.conditionId || market.id,
                question,
                slug: market.slug || market.id,
                crypto: parsed.crypto,
                targetPrice: parsed.targetPrice,
                expiryDate: parsed.expiryDate,
                startDate: market.startDate ? new Date(market.startDate) : undefined,
                betType: parsed.betType,
                direction: parsed.direction,
                polymarketPrice: historicalPrice,
                outcome
            });
        }
    } catch (error) {
        console.error('Error fetching resolved markets:', error);
    }
    return markets;
}
/**
 * Get historical crypto price from CoinGecko
 */ async function getHistoricalPrice(symbol, date) {
    const coinIdMap = {
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
    const coinId = coinIdMap[symbol];
    if (!coinId) return null;
    try {
        // Format date as dd-mm-yyyy
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const dateStr = `${day}-${month}-${year}`;
        const response = await fetch(`${COINGECKO_API}/coins/${coinId}/history?date=${dateStr}`, {
            headers: {
                'Accept': 'application/json'
            },
            cache: 'no-store'
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data.market_data?.current_price?.usd || null;
    } catch (e) {
        console.warn(`Failed to get historical price for ${symbol}:`, e);
        return null;
    }
}
/**
 * Calculate backtest summary statistics
 */ function calculateBacktestSummary(results) {
    if (results.length === 0) {
        return createEmptySummary();
    }
    // Calculate average Brier scores
    const zscoreAvgBrier = results.reduce((sum, r)=>sum + r.zscoreBrierScore, 0) / results.length;
    const deribitAvgBrier = results.reduce((sum, r)=>sum + (r.deribitBrierScore || 0), 0) / results.length;
    const polymarketAvgBrier = results.reduce((sum, r)=>sum + r.polymarketBrierScore, 0) / results.length;
    // Calculate calibration buckets
    const buckets = [
        [
            0,
            0.1
        ],
        [
            0.1,
            0.2
        ],
        [
            0.2,
            0.3
        ],
        [
            0.3,
            0.4
        ],
        [
            0.4,
            0.5
        ],
        [
            0.5,
            0.6
        ],
        [
            0.6,
            0.7
        ],
        [
            0.7,
            0.8
        ],
        [
            0.8,
            0.9
        ],
        [
            0.9,
            1.0
        ]
    ];
    const zscoreCalibration = calculateCalibration(results.map((r)=>r.zscorePrediction), results.map((r)=>r.actualOutcome), buckets);
    const deribitCalibration = calculateCalibration(results.map((r)=>r.deribitPrediction || 0), results.map((r)=>r.actualOutcome), buckets);
    const polymarketCalibration = calculateCalibration(results.map((r)=>r.polymarketPrice), results.map((r)=>r.actualOutcome), buckets);
    return {
        totalMarkets: results.length,
        resolvedMarkets: results.length,
        zscoreAvgBrier,
        deribitAvgBrier,
        polymarketAvgBrier,
        zscoreCalibration,
        deribitCalibration,
        polymarketCalibration,
        results
    };
}
/**
 * Calculate calibration buckets
 */ function calculateCalibration(predictions, outcomes, buckets) {
    return buckets.map(([low, high])=>{
        const inBucket = predictions.map((p, i)=>({
                p,
                o: outcomes[i]
            })).filter(({ p })=>p >= low && p < high);
        const count = inBucket.length;
        const actualRate = count > 0 ? inBucket.filter(({ o })=>o).length / count : 0;
        return {
            predictedRange: [
                low,
                high
            ],
            actualRate,
            count
        };
    });
}
/**
 * Create empty summary for when no data is available
 */ function createEmptySummary() {
    const emptyBuckets = [
        [
            0,
            0.1
        ],
        [
            0.1,
            0.2
        ],
        [
            0.2,
            0.3
        ],
        [
            0.3,
            0.4
        ],
        [
            0.4,
            0.5
        ],
        [
            0.5,
            0.6
        ],
        [
            0.6,
            0.7
        ],
        [
            0.7,
            0.8
        ],
        [
            0.8,
            0.9
        ],
        [
            0.9,
            1.0
        ]
    ].map(([low, high])=>({
            predictedRange: [
                low,
                high
            ],
            actualRate: 0,
            count: 0
        }));
    return {
        totalMarkets: 0,
        resolvedMarkets: 0,
        zscoreAvgBrier: 0,
        deribitAvgBrier: 0,
        polymarketAvgBrier: 0,
        zscoreCalibration: emptyBuckets,
        deribitCalibration: emptyBuckets,
        polymarketCalibration: emptyBuckets,
        results: []
    };
}
/**
 * Get methodology explanation text
 */ function getMethodologyText() {
    return `
## Backtest Methodology

### Goal
Compare the accuracy of three probability estimation methods for crypto price target predictions:

1. **Z-Score Method** (Lognormal Assumption)
   - Formula: z = ln(K/S) / (σ√T)
   - P(S > K) = 1 - Φ(z)
   - Uses default volatility assumptions (BTC: 55%, ETH: 65%, etc.)
   - For one-touch: P(touch) ≈ 2 × P(settle above)

2. **Deribit IV Method**
   - Same formula but uses implied volatility from options market
   - Simulated with 10% IV premium over default (approximating historical IV)
   - More accurate for assets with liquid options markets

3. **Polymarket** (Baseline)
   - Volume-weighted average price before resolution
   - Represents "wisdom of the crowd"

### Metrics

**Brier Score** = (prediction - outcome)²
- Range: 0 (perfect) to 1 (worst)
- Lower is better
- Random guessing = 0.25

**Calibration**
- Predictions bucketed by probability range
- Compare predicted probability vs actual outcome rate
- Perfect calibration: 30% predictions should resolve true 30% of time

### Limitations

1. Limited historical Polymarket data availability
2. Historical IV data not readily available (using simulated premium)
3. Small sample sizes may not be statistically significant
4. Price at market creation time estimated from CoinGecko historical data

### Interpretation

- If Z-score has lower Brier score than Polymarket → Market is inefficient
- If Deribit has lower Brier score than Z-score → Options IV adds value
- Compare calibration curves to see systematic biases
`.trim();
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__c2faabc9._.js.map