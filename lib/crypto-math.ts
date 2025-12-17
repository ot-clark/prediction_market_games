/**
 * Crypto Arbitrage Math Library
 * 
 * Contains all probability calculation functions for comparing
 * Polymarket prices vs options-implied probabilities.
 * 
 * Based on the methodology from Moontower's article:
 * https://moontower.substack.com/p/from-everything-computer-to-everything
 */

import type { ProbabilityEstimate, CryptoMarket, VolatilityData } from '@/types/crypto';

// ============================================================================
// STANDARD NORMAL DISTRIBUTION FUNCTIONS
// ============================================================================

/**
 * Standard Normal CDF (Cumulative Distribution Function)
 * Uses the Abramowitz and Stegun approximation (error < 7.5e-8)
 * 
 * @param x - The z-score
 * @returns Probability that a standard normal variable is less than x
 */
export function normalCDF(x: number): number {
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
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}

/**
 * Standard Normal PDF (Probability Density Function)
 * 
 * @param x - The z-score
 * @returns The probability density at x
 */
export function normalPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

/**
 * Inverse Standard Normal CDF (Quantile Function)
 * Uses the Beasley-Springer-Moro algorithm
 * 
 * @param p - Probability (0-1)
 * @returns The z-score corresponding to probability p
 */
export function normalInverseCDF(p: number): number {
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

  let q: number, r: number;

  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
}

// ============================================================================
// TIME CALCULATIONS
// ============================================================================

/**
 * Calculate time to expiry in years
 * 
 * @param expiryDate - The expiry date
 * @param fromDate - The start date (defaults to now)
 * @returns Time in years (can be fractional)
 */
export function timeToExpiryYears(expiryDate: Date, fromDate: Date = new Date()): number {
  const msPerYear = 365.25 * 24 * 60 * 60 * 1000;
  const diffMs = expiryDate.getTime() - fromDate.getTime();
  return Math.max(0, diffMs / msPerYear);
}

/**
 * Calculate time to expiry in days
 */
export function timeToExpiryDays(expiryDate: Date, fromDate: Date = new Date()): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const diffMs = expiryDate.getTime() - fromDate.getTime();
  return Math.max(0, diffMs / msPerDay);
}

// ============================================================================
// Z-SCORE METHOD (from Moontower article)
// ============================================================================

/**
 * Calculate the z-score (number of standard deviations) for a price target
 * 
 * Formula: z = ln(target/current) / (σ × √T)
 * 
 * Where:
 *   - target = target price
 *   - current = current price  
 *   - σ = annualized volatility (as decimal, e.g., 0.55 for 55%)
 *   - T = time to expiry in years
 * 
 * @param currentPrice - Current asset price
 * @param targetPrice - Target price to reach
 * @param volatility - Annualized volatility (decimal)
 * @param timeYears - Time to expiry in years
 * @returns The z-score
 */
export function calculateZScore(
  currentPrice: number,
  targetPrice: number,
  volatility: number,
  timeYears: number
): number {
  if (currentPrice <= 0 || targetPrice <= 0 || volatility <= 0 || timeYears <= 0) {
    return targetPrice > currentPrice ? Infinity : -Infinity;
  }
  
  const logReturn = Math.log(targetPrice / currentPrice);
  const scaledVol = volatility * Math.sqrt(timeYears);
  
  return logReturn / scaledVol;
}

/**
 * Calculate probability of price exceeding target using z-score method
 * (Binary "settle above" bet)
 * 
 * This assumes lognormal distribution of returns.
 * 
 * @param currentPrice - Current asset price
 * @param targetPrice - Target price
 * @param volatility - Annualized volatility (decimal)
 * @param timeYears - Time to expiry in years
 * @returns ProbabilityEstimate with full breakdown
 */
export function calculateZScoreProbability(
  currentPrice: number,
  targetPrice: number,
  volatility: number,
  timeYears: number
): ProbabilityEstimate {
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
      `Result: ${(probability * 100).toFixed(2)}% probability of exceeding target`,
    ],
    result: probability,
  };

  return {
    method: 'zscore',
    probability,
    volatilityUsed: volatility,
    timeToExpiry: timeYears,
    zScore,
    mathBreakdown,
  };
}

// ============================================================================
// ONE-TOUCH PROBABILITY (path-dependent)
// ============================================================================

/**
 * Calculate probability of price touching target at any point before expiry
 * (One-touch bet)
 * 
 * Trader's rule of thumb: P(touch) ≈ 2 × Delta of vanilla option
 * 
 * For upward touch (target > current): P(touch) ≈ 2 × P(settle above) = 2 × (1 - Φ(z))
 * For downward touch (target < current): P(touch) ≈ 2 × P(settle below) = 2 × Φ(z)
 * 
 * @param currentPrice - Current asset price
 * @param targetPrice - Target price to touch
 * @param volatility - Annualized volatility (decimal)
 * @param timeYears - Time to expiry in years
 * @returns ProbabilityEstimate with full breakdown
 */
export function calculateOneTouchProbability(
  currentPrice: number,
  targetPrice: number,
  volatility: number,
  timeYears: number
): ProbabilityEstimate {
  const zScore = calculateZScore(currentPrice, targetPrice, volatility, timeYears);
  
  // Determine if this is upward or downward touch
  const isUpward = targetPrice > currentPrice;
  
  // For upward: P(touch) = 2 × P(settle above) = 2 × (1 - Φ(z))
  // For downward: P(touch) = 2 × P(settle below) = 2 × Φ(z)
  const binaryProb = isUpward ? (1 - normalCDF(zScore)) : normalCDF(zScore);
  
  // One-touch approximation: 2 × binary probability, capped at 1.0
  const oneTouchProb = Math.min(1.0, 2 * binaryProb);
  
  const direction = isUpward ? 'upward' : 'downward';
  const settleDirection = isUpward ? 'above' : 'below';
  
  const mathBreakdown = {
    formula: isUpward 
      ? 'P(touch up) ≈ 2 × P(S_T > K) = 2 × (1 - Φ(z))'
      : 'P(touch down) ≈ 2 × P(S_T < K) = 2 × Φ(z)',
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
      isUpward
        ? `  P(settle above) = 1 - Φ(${zScore.toFixed(4)}) = ${binaryProb.toFixed(4)}`
        : `  P(settle below) = Φ(${zScore.toFixed(4)}) = ${binaryProb.toFixed(4)}`,
      ``,
      `Step 3: Apply one-touch rule (2x multiplier)`,
      `  P(touch) ≈ 2 × ${binaryProb.toFixed(4)} = ${(2 * binaryProb).toFixed(4)}`,
      oneTouchProb < 2 * binaryProb ? `  Capped at 100%` : '',
      ``,
      `Result: ${(oneTouchProb * 100).toFixed(2)}% probability of touching $${targetPrice.toLocaleString()}`,
    ].filter(s => s !== ''),
    result: oneTouchProb,
  };

  return {
    method: 'zscore',
    probability: oneTouchProb,
    volatilityUsed: volatility,
    timeToExpiry: timeYears,
    zScore,
    mathBreakdown,
  };
}

// ============================================================================
// DELTA-BASED PROBABILITY (using Deribit data)
// ============================================================================

/**
 * Calculate Black-Scholes d1 and d2 values
 * 
 * d1 = [ln(S/K) + (r + σ²/2)T] / (σ√T)
 * d2 = d1 - σ√T
 * 
 * For crypto, we assume r = 0 (no risk-free rate / cost of carry)
 */
export function calculateD1D2(
  currentPrice: number,
  strikePrice: number,
  volatility: number,
  timeYears: number,
  riskFreeRate: number = 0
): { d1: number; d2: number } {
  if (timeYears <= 0 || volatility <= 0) {
    return { d1: 0, d2: 0 };
  }
  
  const sqrtT = Math.sqrt(timeYears);
  const d1 = (Math.log(currentPrice / strikePrice) + (riskFreeRate + 0.5 * volatility * volatility) * timeYears) 
             / (volatility * sqrtT);
  const d2 = d1 - volatility * sqrtT;
  
  return { d1, d2 };
}

/**
 * Calculate call option delta
 * Delta = Φ(d1) for a call option
 * 
 * Delta represents the probability (risk-neutral) of the option expiring ITM
 */
export function calculateCallDelta(
  currentPrice: number,
  strikePrice: number,
  volatility: number,
  timeYears: number
): number {
  const { d1 } = calculateD1D2(currentPrice, strikePrice, volatility, timeYears);
  return normalCDF(d1);
}

/**
 * Calculate probability using Deribit option delta
 * 
 * For binary bets: Use delta directly
 * For one-touch bets: Delta × 2
 * 
 * @param delta - The option delta from Deribit
 * @param betType - 'binary' or 'one-touch'
 * @returns ProbabilityEstimate
 */
export function calculateDeribitProbability(
  delta: number,
  betType: 'binary' | 'one-touch',
  volatility: number,
  timeYears: number
): ProbabilityEstimate {
  const probability = betType === 'binary' 
    ? delta 
    : Math.min(1.0, 2 * delta);

  const mathBreakdown = {
    formula: betType === 'binary' 
      ? 'P(S_T > K) ≈ Δ (option delta)'
      : 'P(touch K) ≈ 2 × Δ',
    steps: [
      `Deribit option delta: ${delta.toFixed(4)}`,
      `Bet type: ${betType}`,
      ``,
      betType === 'binary'
        ? `For binary (settle above): P = Δ = ${delta.toFixed(4)}`
        : `For one-touch: P = 2 × Δ = 2 × ${delta.toFixed(4)} = ${Math.min(1.0, 2 * delta).toFixed(4)}`,
      ``,
      `Result: ${(probability * 100).toFixed(2)}% probability`,
    ],
    result: probability,
  };

  return {
    method: 'deribit-delta',
    probability,
    volatilityUsed: volatility,
    timeToExpiry: timeYears,
    delta,
    mathBreakdown,
  };
}

// ============================================================================
// VERTICAL SPREAD PROBABILITY
// ============================================================================

/**
 * Calculate probability from vertical spread prices
 * 
 * P(S_T > K) ≈ Spread Price / Strike Width
 * 
 * For a call spread: Buy call at K1, sell call at K2 (K2 > K1)
 * Spread value at expiry = max(0, S_T - K1) - max(0, S_T - K2)
 * If S_T > K2: value = K2 - K1 (max payout)
 * If S_T < K1: value = 0
 * 
 * @param spreadPrice - Current price of the spread
 * @param strikeWidth - Distance between strikes (K2 - K1)
 * @param midStrike - The middle strike we're estimating probability for
 */
export function calculateVerticalSpreadProbability(
  spreadPrice: number,
  strikeWidth: number,
  midStrike: number,
  currentPrice: number,
  volatility: number,
  timeYears: number
): ProbabilityEstimate {
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
      `Result: ${(probability * 100).toFixed(2)}% probability`,
    ],
    result: probability,
  };

  return {
    method: 'vertical-spread',
    probability,
    volatilityUsed: volatility,
    timeToExpiry: timeYears,
    mathBreakdown,
  };
}

// ============================================================================
// REALIZED VOLATILITY CALCULATION
// ============================================================================

/**
 * Calculate annualized realized volatility from price history
 * 
 * σ = std(daily_returns) × √252
 * 
 * @param prices - Array of historical prices (most recent last)
 * @returns Annualized volatility as decimal
 */
export function calculateRealizedVolatility(prices: number[]): number {
  if (prices.length < 2) return 0;
  
  // Calculate log returns
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > 0 && prices[i - 1] > 0) {
      returns.push(Math.log(prices[i] / prices[i - 1]));
    }
  }
  
  if (returns.length < 2) return 0;
  
  // Calculate standard deviation
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returns.length - 1);
  const dailyVol = Math.sqrt(variance);
  
  // Annualize (assuming 365 days for crypto which trades 24/7)
  return dailyVol * Math.sqrt(365);
}

// ============================================================================
// BRIER SCORE (for backtesting)
// ============================================================================

/**
 * Calculate Brier Score for a probability prediction
 * 
 * Brier Score = (prediction - outcome)²
 * 
 * Lower is better (0 = perfect prediction)
 * 
 * @param prediction - Predicted probability (0-1)
 * @param outcome - Actual outcome (0 or 1)
 * @returns Brier score
 */
export function calculateBrierScore(prediction: number, outcome: boolean): number {
  const outcomeNum = outcome ? 1 : 0;
  return Math.pow(prediction - outcomeNum, 2);
}

/**
 * Calculate average Brier Score for multiple predictions
 */
export function calculateAverageBrierScore(
  predictions: number[], 
  outcomes: boolean[]
): number {
  if (predictions.length !== outcomes.length || predictions.length === 0) {
    return 0;
  }
  
  const totalScore = predictions.reduce((sum, pred, i) => {
    return sum + calculateBrierScore(pred, outcomes[i]);
  }, 0);
  
  return totalScore / predictions.length;
}

// ============================================================================
// MARKET PARSING UTILITIES
// ============================================================================

/**
 * Parse a Polymarket question to extract crypto target price info
 * 
 * Examples:
 * - "Will Bitcoin hit $200,000 by December 31, 2025?"
 * - "BTC above $150k on Jan 1, 2026"
 * - "Will Ethereum reach $10,000 before 2026?"
 * 
 * @param question - The market question
 * @returns Parsed info or null if not a crypto price market
 */
export function parseCryptoMarketQuestion(question: string): {
  crypto: string;
  targetPrice: number;
  expiryDate: Date | null;
  betType: 'binary' | 'one-touch';
  direction: 'above' | 'below';
} | null {
  const q = question.toLowerCase();
  
  // EXCLUSION PATTERNS - Skip markets that aren't about crypto spot prices
  const exclusionPatterns = [
    /market\s*cap/i,           // "MegaETH market cap" - not a price target
    /\bfdv\b/i,                // Fully diluted valuation
    /\btvl\b/i,                // Total value locked
    /\bmcap\b/i,               // Market cap abbreviation
    /dominance/i,              // "BTC dominance"
    /\bfee[s]?\b/i,            // "ETH fees"
    /\bgas\b/i,                // "ETH gas"
    /\bstaking\b/i,            // Staking related
    /\bairdrop\b/i,            // Airdrop related
    /\betf\b/i,                // ETF related
    /\bhalving\b/i,            // Halving events
    /mega\s*eth/i,             // MegaETH (different project)
    /\bweth\b/i,               // Wrapped ETH
    /\bsteth\b/i,              // Staked ETH
    /\breth\b/i,               // Rocket Pool ETH
    /\bcbeth\b/i,              // Coinbase ETH
  ];
  
  for (const pattern of exclusionPatterns) {
    if (pattern.test(question)) {
      return null;
    }
  }
  
  // Check if this is a crypto price market
  // Use word boundaries to avoid matching "MegaETH" when looking for "ETH"
  const cryptoPatterns = [
    { pattern: /\bbitcoin\b|\bbtc\b/i, symbol: 'BTC' },
    { pattern: /\bethereum\b|\beth\b(?!er)/i, symbol: 'ETH' },
    { pattern: /\bsolana\b|\bsol\b(?!ar)/i, symbol: 'SOL' },
    { pattern: /\bcardano\b|\bada\b/i, symbol: 'ADA' },
    { pattern: /\bdogecoin\b|\bdoge\b/i, symbol: 'DOGE' },
    { pattern: /\bxrp\b|\bripple\b/i, symbol: 'XRP' },
    { pattern: /\bpolygon\b|\bmatic\b/i, symbol: 'MATIC' },
    { pattern: /\bavalanche\b|\bavax\b/i, symbol: 'AVAX' },
    { pattern: /\bchainlink\b|\blink\b/i, symbol: 'LINK' },
    { pattern: /\bpolkadot\b|\bdot\b/i, symbol: 'DOT' },
    { pattern: /\blitecoin\b|\bltc\b/i, symbol: 'LTC' },
  ];
  
  let crypto: string | null = null;
  for (const { pattern, symbol } of cryptoPatterns) {
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
    /\$?([\d,]+(?:\.\d+)?)\s*k/i,           // $200k or 200k
    /\$?([\d,]+(?:\.\d+)?)\s*(?:thousand)/i, // 200 thousand
    /\$([\d,]+(?:\.\d+)?)/,                  // $200,000
    /([\d,]+(?:\.\d+)?)\s*(?:dollars?|usd)/i, // 200000 dollars
  ];
  
  let targetPrice: number | null = null;
  for (const pattern of pricePatterns) {
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
  const betType: 'binary' | 'one-touch' = oneTouchKeywords.test(question) ? 'one-touch' : 'binary';
  
  // Determine direction
  // "dip", "drop", "crash", "fall", "below", "under" = below/down direction
  const belowKeywords = /below|under|less than|fall|dip|drop|crash|sink|plunge|decline/i;
  const direction: 'above' | 'below' = belowKeywords.test(question) ? 'below' : 'above';
  
  // Extract expiry date
  const expiryDate = parseDateFromQuestion(question);
  
  return {
    crypto,
    targetPrice,
    expiryDate,
    betType,
    direction,
  };
}

/**
 * Parse a date from a market question
 */
function parseDateFromQuestion(question: string): Date | null {
  const months: Record<string, number> = {
    'january': 0, 'jan': 0,
    'february': 1, 'feb': 1,
    'march': 2, 'mar': 2,
    'april': 3, 'apr': 3,
    'may': 4,
    'june': 5, 'jun': 5,
    'july': 6, 'jul': 6,
    'august': 7, 'aug': 7,
    'september': 8, 'sep': 8, 'sept': 8,
    'october': 9, 'oct': 9,
    'november': 10, 'nov': 10,
    'december': 11, 'dec': 11,
  };
  
  // Pattern: "December 31, 2025" or "Dec 31 2025" or "31 December 2025"
  const datePatterns = [
    /(\w+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s*(\d{4})/i,  // Month Day, Year
    /(\d{1,2})(?:st|nd|rd|th)?\s+(\w+),?\s*(\d{4})/i,  // Day Month Year
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/,                    // MM/DD/YYYY
    /by\s+(?:end\s+of\s+)?(\d{4})/i,                    // by 2025 / by end of 2025
    /before\s+(\d{4})/i,                                 // before 2026
    /in\s+(\d{4})/i,                                     // in 2025
  ];
  
  for (const pattern of datePatterns) {
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

// ============================================================================
// EDGE CALCULATION
// ============================================================================

/**
 * Calculate the edge between Polymarket price and model probability
 * 
 * Positive edge = Polymarket is overpriced (sell on Polymarket / buy options)
 * Negative edge = Polymarket is underpriced (buy on Polymarket)
 */
export function calculateEdge(
  polymarketPrice: number,
  modelProbability: number
): { 
  edge: number; 
  signal: 'buy' | 'sell' | 'neutral';
  confidence: 'high' | 'medium' | 'low';
} {
  const edge = polymarketPrice - modelProbability;
  const absEdge = Math.abs(edge);
  
  // Determine signal
  let signal: 'buy' | 'sell' | 'neutral';
  if (absEdge < 0.03) {
    signal = 'neutral';  // Less than 3% edge - not actionable
  } else if (edge > 0) {
    signal = 'sell';     // Polymarket overpriced - sell / take under
  } else {
    signal = 'buy';      // Polymarket underpriced - buy / take over
  }
  
  // Determine confidence
  let confidence: 'high' | 'medium' | 'low';
  if (absEdge > 0.10) {
    confidence = 'high';   // >10% edge
  } else if (absEdge > 0.05) {
    confidence = 'medium'; // 5-10% edge
  } else {
    confidence = 'low';    // <5% edge
  }
  
  return { edge, signal, confidence };
}
