import { NextResponse } from 'next/server';
import type { 
  CryptoMarket, 
  ArbitrageOpportunity, 
  CryptoArbitrageResponse,
  VolatilityData,
  ProbabilityEstimate 
} from '@/types/crypto';
import { DEFAULT_VOLATILITY, DERIBIT_SUPPORTED, COINGECKO_ID_MAP } from '@/types/crypto';
import {
  parseCryptoMarketQuestion,
  timeToExpiryYears,
  calculateZScoreProbability,
  calculateOneTouchProbability,
  calculateDeribitProbability,
  calculateEdge,
  calculateCallDelta,
} from '@/lib/crypto-math';
import type { DeribitOptionsData } from '@/app/api/deribit/route';
import type { CryptoPricesResponse } from '@/app/api/crypto-prices/route';

/**
 * Crypto Arbitrage API Route
 * 
 * Compares Polymarket crypto price target markets against
 * options-implied probabilities from Deribit and z-score calculations.
 */

const GAMMA_API = 'https://gamma-api.polymarket.com';

/**
 * GET /api/crypto-arbitrage
 * 
 * Fetches all crypto price target markets from Polymarket,
 * calculates model probabilities, and returns arbitrage opportunities.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    // Step 1: Fetch Polymarket markets
    const polymarketMarkets = await fetchPolymarketCryptoMarkets(limit);
    console.log(`Found ${polymarketMarkets.length} crypto price target markets`);

    if (polymarketMarkets.length === 0) {
      return NextResponse.json({
        opportunities: [],
        totalCryptoMarkets: 0,
        supportedCryptos: Object.keys(COINGECKO_ID_MAP),
        lastUpdated: new Date(),
        message: 'No crypto price target markets found on Polymarket',
      });
    }

    // Step 2: Get unique cryptos we need prices for
    const cryptoSymbols = [...new Set(polymarketMarkets.map(m => m.crypto))];
    console.log(`Cryptos needed: ${cryptoSymbols.join(', ')}`);

    // Step 3: Fetch current prices from CoinGecko
    const pricesResponse = await fetch(
      `${getBaseUrl(request)}/api/crypto-prices?symbols=${cryptoSymbols.join(',')}`,
      { cache: 'no-store' }
    );
    
    let prices: Record<string, { currentPrice: number }> = {};
    if (pricesResponse.ok) {
      const pricesData: CryptoPricesResponse = await pricesResponse.json();
      prices = pricesData.prices;
    } else {
      console.warn('Failed to fetch crypto prices');
    }

    // Step 4: Fetch Deribit IV for BTC and ETH (if needed)
    const deribitData: Record<string, DeribitOptionsData> = {};
    for (const symbol of cryptoSymbols) {
      if (DERIBIT_SUPPORTED.includes(symbol)) {
        try {
          const deribitResponse = await fetch(
            `${getBaseUrl(request)}/api/deribit?symbol=${symbol}`,
            { cache: 'no-store' }
          );
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
    const opportunities: ArbitrageOpportunity[] = [];

    for (const market of polymarketMarkets) {
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
      const timeYears = timeToExpiryYears(market.expiryDate);
      if (timeYears <= 0) {
        console.log(`Market expired: ${market.question}`);
        continue;
      }

      // Adjust target price for direction
      const effectiveTarget = market.direction === 'below' 
        ? market.targetPrice  // For "below" bets, probability calculation is different
        : market.targetPrice;

      // Calculate z-score probability
      let zscoreProb: ProbabilityEstimate;
      if (market.betType === 'one-touch') {
        // One-touch function handles direction internally based on target vs current price
        zscoreProb = calculateOneTouchProbability(
          currentPrice,
          effectiveTarget,
          volatility.volatility,
          timeYears
        );
        // No need to flip - the function already calculates the correct direction
      } else {
        // Binary bet: calculates P(settle above target)
        zscoreProb = calculateZScoreProbability(
          currentPrice,
          effectiveTarget,
          volatility.volatility,
          timeYears
        );
        // For "below" direction, flip the probability
        if (market.direction === 'below') {
          zscoreProb.probability = 1 - zscoreProb.probability;
        }
      }

      // Calculate Deribit-based probability (if available)
      let deribitProb: ProbabilityEstimate | undefined;
      const deribit = deribitData[market.crypto];
      
      if (deribit && DERIBIT_SUPPORTED.includes(market.crypto)) {
        // Find the closest strike IV from Deribit options chain
        const ivData = findClosestStrikeIV(deribit, effectiveTarget, market.expiryDate);
        
        if (ivData && ivData.iv > 0) {
          // Use the IV from the closest strike (captures vol smile/skew)
          const strikeIv = ivData.iv;
          
          // Calculate d1 for Black-Scholes delta
          const sqrtT = Math.sqrt(timeYears);
          const d1 = (Math.log(currentPrice / effectiveTarget) + (0.5 * strikeIv * strikeIv) * timeYears) / (strikeIv * sqrtT);
          
          // Call delta = Φ(d1) = P(settle above target)
          const callDelta = calculateCallDelta(currentPrice, effectiveTarget, strikeIv, timeYears);
          const putDelta = 1 - callDelta;
          
          let probability: number;
          let formulaStr: string;
          let stepsArr: string[];
          
          const isTargetAbove = effectiveTarget > currentPrice;
          
          if (market.betType === 'one-touch') {
            // For one-touch: P(touch) ≈ 2 × delta
            const baseDelta = isTargetAbove ? callDelta : putDelta;
            probability = Math.min(1.0, 2 * baseDelta);
            
            formulaStr = isTargetAbove
              ? 'P(touch up) = min(1, 2 × Call Delta) = min(1, 2 × Φ(d1))'
              : 'P(touch down) = min(1, 2 × Put Delta) = min(1, 2 × (1 - Φ(d1)))';
            
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
              `Result: ${(probability * 100).toFixed(2)}% probability`,
            ];
          } else {
            // Binary bet: P(settle above/below)
            const useCallDelta = market.direction === 'above';
            probability = useCallDelta ? callDelta : putDelta;
            
            formulaStr = useCallDelta
              ? 'P(settle above) = Call Delta = Φ(d1)'
              : 'P(settle below) = Put Delta = 1 - Φ(d1)';
            
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
              `Result: ${(probability * 100).toFixed(2)}% probability`,
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
                result: probability,
              },
            };
          }
        }
      }

      // Calculate edge
      const polymarketProb = market.polymarketPrice;
      const zscoreEdge = calculateEdge(polymarketProb, zscoreProb.probability);
      
      let deribitEdge: { edge: number; signal: 'buy' | 'sell' | 'neutral'; confidence: 'high' | 'medium' | 'low' } | undefined;
      if (deribitProb) {
        deribitEdge = calculateEdge(polymarketProb, deribitProb.probability);
      }

      // Determine overall signal and confidence
      // Prefer Deribit data when available
      const primaryEdge = deribitEdge || zscoreEdge;

      const opportunity: ArbitrageOpportunity = {
        market: {
          ...market,
          resolved: false,
        },
        currentPrice: {
          symbol: market.crypto,
          price: currentPrice,
          lastUpdated: new Date(),
        },
        volatility,
        polymarketProb,
        zscoreProb,
        deribitProb,
        edgeVsZscore: zscoreEdge.edge,
        edgeVsDeribit: deribitEdge?.edge,
        signal: primaryEdge.signal,
        confidence: primaryEdge.confidence,
      };

      opportunities.push(opportunity);
    }

    // Sort by absolute edge (highest edge first)
    opportunities.sort((a, b) => {
      const aEdge = Math.abs(a.edgeVsDeribit ?? a.edgeVsZscore);
      const bEdge = Math.abs(b.edgeVsDeribit ?? b.edgeVsZscore);
      return bEdge - aEdge;
    });

    const result: CryptoArbitrageResponse = {
      opportunities,
      totalCryptoMarkets: polymarketMarkets.length,
      supportedCryptos: cryptoSymbols,
      lastUpdated: new Date(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Crypto arbitrage API error:', error);
    return NextResponse.json({
      error: 'Failed to calculate crypto arbitrage',
      details: error instanceof Error ? error.message : 'Unknown error',
      opportunities: [],
      totalCryptoMarkets: 0,
      supportedCryptos: [],
      lastUpdated: new Date(),
    }, { status: 500 });
  }
}

/**
 * Fetch crypto price target markets from Polymarket
 */
async function fetchPolymarketCryptoMarkets(limit: number): Promise<CryptoMarket[]> {
  const markets: CryptoMarket[] = [];
  
  try {
    // Fetch active markets from Polymarket
    // We'll fetch more than needed and filter for crypto markets
    const response = await fetch(
      `${GAMMA_API}/markets?active=true&closed=false&limit=${limit * 3}&order=volume24hr&ascending=false`,
      {
        headers: { 'Accept': 'application/json' },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.status}`);
    }

    const data = await response.json();
    
    for (const market of data) {
      const question = market.question || '';
      const parsed = parseCryptoMarketQuestion(question);
      
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
          const prices = typeof market.outcomePrices === 'string' 
            ? JSON.parse(market.outcomePrices) 
            : market.outcomePrices;
          // First outcome is typically "Yes"
          polymarketPrice = parseFloat(prices[0]) || 0;
        }
      } catch (e) {
        console.warn('Failed to parse outcome prices:', e);
      }

      // Skip if no valid price
      if (polymarketPrice <= 0 || polymarketPrice >= 1) continue;

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
      });
    }
  } catch (error) {
    console.error('Error fetching Polymarket markets:', error);
  }

  return markets.slice(0, limit);
}

/**
 * Get volatility data for a crypto
 */
function getVolatilityData(
  symbol: string, 
  deribitData: Record<string, DeribitOptionsData>
): VolatilityData {
  const deribit = deribitData[symbol];
  
  if (deribit && deribit.atmIv > 0) {
    return {
      symbol,
      deribitIv: deribit.atmIv,
      deribitIvSource: `ATM IV from Deribit`,
      defaultVol: DEFAULT_VOLATILITY[symbol] || DEFAULT_VOLATILITY.DEFAULT,
      source: 'deribit',
      volatility: deribit.atmIv,
    };
  }

  // Fall back to default volatility
  const defaultVol = DEFAULT_VOLATILITY[symbol] || DEFAULT_VOLATILITY.DEFAULT;
  return {
    symbol,
    defaultVol,
    source: 'default',
    volatility: defaultVol,
  };
}

/**
 * Find the closest strike IV from Deribit data
 * Returns IV and indicates we should calculate delta ourselves
 */
function findClosestStrikeIV(
  deribit: DeribitOptionsData,
  targetStrike: number,
  targetExpiry: Date
): { iv: number; delta: number | null } | null {
  const ivByStrike = deribit.ivByStrike;
  if (!ivByStrike || Object.keys(ivByStrike).length === 0) {
    // Fall back to ATM IV, but don't assume delta - calculate it
    return {
      iv: deribit.atmIv,
      delta: null, // Signal to calculate delta ourselves
    };
  }

  // Find the strike closest to our target
  const strikes = Object.keys(ivByStrike).map(Number);
  const closest = strikes.reduce((best, strike) => 
    Math.abs(strike - targetStrike) < Math.abs(best - targetStrike) ? strike : best
  );

  const data = ivByStrike[closest];
  if (!data) {
    return {
      iv: deribit.atmIv,
      delta: null,
    };
  }

  // Only use the delta if the strike is close to our target (within 20%)
  // Otherwise, calculate it ourselves with the IV
  const strikeIsClose = Math.abs(closest - targetStrike) / targetStrike < 0.2;
  
  return {
    iv: data.callIv || deribit.atmIv,
    delta: (strikeIsClose && data.callDelta && data.callDelta > 0 && data.callDelta < 1) 
      ? data.callDelta 
      : null,
  };
}

/**
 * Get base URL for internal API calls
 */
function getBaseUrl(request: Request): string {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}
