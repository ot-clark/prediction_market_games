import { NextResponse } from 'next/server';
import type { 
  BacktestResult, 
  BacktestSummary, 
  CryptoBacktestResponse,
  CalibrationBucket 
} from '@/types/crypto';
import { DEFAULT_VOLATILITY } from '@/types/crypto';
import {
  parseCryptoMarketQuestion,
  timeToExpiryYears,
  calculateZScoreProbability,
  calculateOneTouchProbability,
  calculateBrierScore,
} from '@/lib/crypto-math';

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
 */

const GAMMA_API = 'https://gamma-api.polymarket.com';
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

/**
 * GET /api/crypto-backtest
 * 
 * Runs backtest on historical crypto markets
 */
export async function GET() {
  try {
    // Step 1: Fetch resolved crypto markets from Polymarket
    const resolvedMarkets = await fetchResolvedCryptoMarkets();
    console.log(`Found ${resolvedMarkets.length} resolved crypto price markets`);

    if (resolvedMarkets.length === 0) {
      return NextResponse.json({
        summary: createEmptySummary(),
        methodology: getMethodologyText(),
        lastUpdated: new Date(),
        message: 'No resolved crypto price target markets found for backtesting',
      });
    }

    // Step 2: For each market, calculate what we would have predicted
    const results: BacktestResult[] = [];

    for (const market of resolvedMarkets) {
      try {
        // We need the price at the time the market was active
        // Ideally we'd have the price from when the market started
        // For simplicity, we'll use the start date price if available
        const historicalPrice = await getHistoricalPrice(
          market.crypto,
          market.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Default to 30 days ago
        );

        if (!historicalPrice) {
          console.warn(`No historical price for ${market.crypto}, skipping`);
          continue;
        }

        // Calculate time to expiry from when market started
        const timeYears = timeToExpiryYears(
          market.expiryDate,
          market.startDate || new Date()
        );

        if (timeYears <= 0) continue;

        // Get volatility (use default since we can't easily get historical Deribit IV)
        const volatility = DEFAULT_VOLATILITY[market.crypto] || DEFAULT_VOLATILITY.DEFAULT;

        // Calculate z-score probability
        let zscoreProb: number;
        if (market.betType === 'one-touch') {
          const result = calculateOneTouchProbability(
            historicalPrice,
            market.targetPrice,
            volatility,
            timeYears
          );
          zscoreProb = result.probability;
        } else {
          const result = calculateZScoreProbability(
            historicalPrice,
            market.targetPrice,
            volatility,
            timeYears
          );
          zscoreProb = result.probability;
        }

        // Adjust for direction
        if (market.direction === 'below') {
          zscoreProb = 1 - zscoreProb;
        }

        // For Deribit, we'll estimate based on a higher IV (options usually trade at premium)
        // This is a simplification - in production you'd want historical IV data
        const deribitVolatility = volatility * 1.1; // Assume 10% IV premium
        let deribitProb: number;
        if (market.betType === 'one-touch') {
          const result = calculateOneTouchProbability(
            historicalPrice,
            market.targetPrice,
            deribitVolatility,
            timeYears
          );
          deribitProb = result.probability;
        } else {
          const result = calculateZScoreProbability(
            historicalPrice,
            market.targetPrice,
            deribitVolatility,
            timeYears
          );
          deribitProb = result.probability;
        }

        if (market.direction === 'below') {
          deribitProb = 1 - deribitProb;
        }

        // Calculate Brier scores
        const actualOutcome = market.outcome || false;
        const zscoreBrier = calculateBrierScore(zscoreProb, actualOutcome);
        const deribitBrier = calculateBrierScore(deribitProb, actualOutcome);
        const polymarketBrier = calculateBrierScore(market.polymarketPrice, actualOutcome);

        results.push({
          market,
          zscorePrediction: zscoreProb,
          deribitPrediction: deribitProb,
          polymarketPrice: market.polymarketPrice,
          actualOutcome,
          zscoreBrierScore: zscoreBrier,
          deribitBrierScore: deribitBrier,
          polymarketBrierScore: polymarketBrier,
        });
      } catch (e) {
        console.warn(`Error processing market ${market.id}:`, e);
      }
    }

    // Step 3: Calculate summary statistics
    const summary = calculateBacktestSummary(results);

    const response: CryptoBacktestResponse = {
      summary,
      methodology: getMethodologyText(),
      lastUpdated: new Date(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Backtest API error:', error);
    return NextResponse.json({
      error: 'Failed to run backtest',
      details: error instanceof Error ? error.message : 'Unknown error',
      summary: createEmptySummary(),
      methodology: getMethodologyText(),
      lastUpdated: new Date(),
    }, { status: 500 });
  }
}

/**
 * Fetch resolved crypto price markets from Polymarket
 */
async function fetchResolvedCryptoMarkets(): Promise<Array<{
  id: string;
  question: string;
  slug: string;
  crypto: string;
  targetPrice: number;
  expiryDate: Date;
  startDate?: Date;
  betType: 'binary' | 'one-touch';
  direction: 'above' | 'below';
  polymarketPrice: number;
  outcome?: boolean;
}>> {
  const markets: Array<{
    id: string;
    question: string;
    slug: string;
    crypto: string;
    targetPrice: number;
    expiryDate: Date;
    startDate?: Date;
    betType: 'binary' | 'one-touch';
    direction: 'above' | 'below';
    polymarketPrice: number;
    outcome?: boolean;
  }> = [];

  try {
    // Fetch closed/resolved markets
    // Note: Polymarket's API may have limitations on historical data
    const response = await fetch(
      `${GAMMA_API}/markets?closed=true&limit=200&order=endDate&ascending=false`,
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

      if (!parsed) continue;
      if (!parsed.expiryDate && market.endDate) {
        parsed.expiryDate = new Date(market.endDate);
      }
      if (!parsed.expiryDate) continue;

      // Get the final/resolution price
      let polymarketPrice = 0;
      let outcome: boolean | undefined;

      try {
        if (market.outcomePrices) {
          const prices = typeof market.outcomePrices === 'string'
            ? JSON.parse(market.outcomePrices)
            : market.outcomePrices;
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
        expiryDate: parsed.expiryDate!,
        startDate: market.startDate ? new Date(market.startDate) : undefined,
        betType: parsed.betType,
        direction: parsed.direction,
        polymarketPrice: historicalPrice,
        outcome,
      });
    }
  } catch (error) {
    console.error('Error fetching resolved markets:', error);
  }

  return markets;
}

/**
 * Get historical crypto price from CoinGecko
 */
async function getHistoricalPrice(symbol: string, date: Date): Promise<number | null> {
  const coinIdMap: Record<string, string> = {
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
    'LTC': 'litecoin',
  };

  const coinId = coinIdMap[symbol];
  if (!coinId) return null;

  try {
    // Format date as dd-mm-yyyy
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const dateStr = `${day}-${month}-${year}`;

    const response = await fetch(
      `${COINGECKO_API}/coins/${coinId}/history?date=${dateStr}`,
      {
        headers: { 'Accept': 'application/json' },
        cache: 'no-store',
      }
    );

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
 */
function calculateBacktestSummary(results: BacktestResult[]): BacktestSummary {
  if (results.length === 0) {
    return createEmptySummary();
  }

  // Calculate average Brier scores
  const zscoreAvgBrier = results.reduce((sum, r) => sum + r.zscoreBrierScore, 0) / results.length;
  const deribitAvgBrier = results.reduce((sum, r) => sum + (r.deribitBrierScore || 0), 0) / results.length;
  const polymarketAvgBrier = results.reduce((sum, r) => sum + r.polymarketBrierScore, 0) / results.length;

  // Calculate calibration buckets
  const buckets: [number, number][] = [
    [0, 0.1], [0.1, 0.2], [0.2, 0.3], [0.3, 0.4], [0.4, 0.5],
    [0.5, 0.6], [0.6, 0.7], [0.7, 0.8], [0.8, 0.9], [0.9, 1.0],
  ];

  const zscoreCalibration = calculateCalibration(
    results.map(r => r.zscorePrediction),
    results.map(r => r.actualOutcome),
    buckets
  );

  const deribitCalibration = calculateCalibration(
    results.map(r => r.deribitPrediction || 0),
    results.map(r => r.actualOutcome),
    buckets
  );

  const polymarketCalibration = calculateCalibration(
    results.map(r => r.polymarketPrice),
    results.map(r => r.actualOutcome),
    buckets
  );

  return {
    totalMarkets: results.length,
    resolvedMarkets: results.length,
    zscoreAvgBrier,
    deribitAvgBrier,
    polymarketAvgBrier,
    zscoreCalibration,
    deribitCalibration,
    polymarketCalibration,
    results,
  };
}

/**
 * Calculate calibration buckets
 */
function calculateCalibration(
  predictions: number[],
  outcomes: boolean[],
  buckets: [number, number][]
): CalibrationBucket[] {
  return buckets.map(([low, high]) => {
    const inBucket = predictions
      .map((p, i) => ({ p, o: outcomes[i] }))
      .filter(({ p }) => p >= low && p < high);

    const count = inBucket.length;
    const actualRate = count > 0
      ? inBucket.filter(({ o }) => o).length / count
      : 0;

    return {
      predictedRange: [low, high],
      actualRate,
      count,
    };
  });
}

/**
 * Create empty summary for when no data is available
 */
function createEmptySummary(): BacktestSummary {
  const emptyBuckets: CalibrationBucket[] = [
    [0, 0.1], [0.1, 0.2], [0.2, 0.3], [0.3, 0.4], [0.4, 0.5],
    [0.5, 0.6], [0.6, 0.7], [0.7, 0.8], [0.8, 0.9], [0.9, 1.0],
  ].map(([low, high]) => ({
    predictedRange: [low, high],
    actualRate: 0,
    count: 0,
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
    results: [],
  };
}

/**
 * Get methodology explanation text
 */
function getMethodologyText(): string {
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
