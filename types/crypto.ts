// Crypto Arbitrage Types

export interface CryptoMarket {
  id: string;
  question: string;
  slug: string;
  description?: string;
  
  // Parsed from question
  crypto: string;           // BTC, ETH, SOL, etc.
  targetPrice: number;      // e.g., 200000 for "$200k"
  expiryDate: Date;         // When the market resolves
  betType: 'binary' | 'one-touch';  // "settle above" vs "touch at any point"
  direction: 'above' | 'below';     // Price direction
  
  // Polymarket data
  polymarketPrice: number;  // Current price (0-1)
  polymarketBid?: number;
  polymarketAsk?: number;
  volume?: string;
  liquidity?: string;
  
  // Resolved status
  resolved?: boolean;
  outcome?: boolean;        // true = hit target, false = didn't
}

export interface CryptoPrice {
  symbol: string;           // BTC, ETH, etc.
  price: number;            // Current USD price
  price24hAgo?: number;     // For calculating realized vol
  priceChange24h?: number;
  volume24h?: number;
  marketCap?: number;
  lastUpdated: Date;
}

export interface DeribitOption {
  instrumentName: string;
  underlyingPrice: number;
  strike: number;
  expiryTimestamp: number;
  markIv: number;           // Implied volatility as decimal (e.g., 0.55 for 55%)
  bidIv?: number;
  askIv?: number;
  delta?: number;
  optionType: 'call' | 'put';
}

export interface VolatilityData {
  symbol: string;
  // Deribit implied vol (if available)
  deribitIv?: number;
  deribitIvSource?: string;  // Which option/expiry used
  // Historical realized vol
  realizedVol30d?: number;
  realizedVol7d?: number;
  // Default assumption
  defaultVol: number;        // Fallback volatility assumption
  // Which source we're using
  source: 'deribit' | 'realized' | 'default';
  volatility: number;        // The actual vol we're using
}

export interface ProbabilityEstimate {
  method: 'zscore' | 'deribit-delta' | 'vertical-spread';
  probability: number;       // 0-1
  volatilityUsed: number;    // The vol input
  timeToExpiry: number;      // Years
  zScore?: number;           // For zscore method
  delta?: number;            // For delta method
  
  // Math breakdown for display
  mathBreakdown: {
    formula: string;
    steps: string[];
    result: number;
  };
}

export interface ArbitrageOpportunity {
  market: CryptoMarket;
  currentPrice: CryptoPrice;
  volatility: VolatilityData;
  
  // Probability estimates
  polymarketProb: number;
  zscoreProb: ProbabilityEstimate;
  deribitProb?: ProbabilityEstimate;  // Only if Deribit data available
  
  // Edge calculations
  edgeVsZscore: number;       // Polymarket - zscore estimate
  edgeVsDeribit?: number;     // Polymarket - deribit estimate
  
  // Recommendation
  signal: 'buy' | 'sell' | 'neutral';
  confidence: 'high' | 'medium' | 'low';
}

// Backtest types
export interface BacktestResult {
  market: CryptoMarket;
  
  // What we predicted at the time
  zscorePrediction: number;
  deribitPrediction?: number;
  polymarketPrice: number;
  
  // Actual outcome
  actualOutcome: boolean;    // true = hit target
  
  // Scores (0 = perfect prediction)
  zscoreBrierScore: number;
  deribitBrierScore?: number;
  polymarketBrierScore: number;
}

export interface BacktestSummary {
  totalMarkets: number;
  resolvedMarkets: number;
  
  // Brier scores (lower = better, 0 = perfect)
  zscoreAvgBrier: number;
  deribitAvgBrier?: number;
  polymarketAvgBrier: number;
  
  // Calibration stats
  zscoreCalibration: CalibrationBucket[];
  deribitCalibration?: CalibrationBucket[];
  polymarketCalibration: CalibrationBucket[];
  
  // Individual results
  results: BacktestResult[];
}

export interface CalibrationBucket {
  predictedRange: [number, number];  // e.g., [0.1, 0.2]
  actualRate: number;                // What % actually happened
  count: number;                     // Number of predictions in bucket
}

// API Response types
export interface CryptoArbitrageResponse {
  opportunities: ArbitrageOpportunity[];
  totalCryptoMarkets: number;
  supportedCryptos: string[];
  lastUpdated: Date;
  error?: string;
}

export interface CryptoBacktestResponse {
  summary: BacktestSummary;
  methodology: string;
  lastUpdated: Date;
  error?: string;
}

// Deribit API response types
export interface DeribitTickerResponse {
  result: {
    instrument_name: string;
    underlying_price: number;
    mark_iv: number;
    bid_iv: number;
    ask_iv: number;
    delta: number;
    gamma: number;
    vega: number;
    theta: number;
    mark_price: number;
    best_bid_price: number;
    best_ask_price: number;
    open_interest: number;
    timestamp: number;
  };
}

export interface DeribitInstrumentsResponse {
  result: Array<{
    instrument_name: string;
    strike: number;
    expiration_timestamp: number;
    option_type: 'call' | 'put';
    is_active: boolean;
  }>;
}

// CoinGecko API response types
export interface CoinGeckoPrice {
  [coinId: string]: {
    usd: number;
    usd_24h_change?: number;
    usd_24h_vol?: number;
    usd_market_cap?: number;
    last_updated_at?: number;
  };
}

// Mapping of Polymarket crypto names to standard symbols
export const CRYPTO_SYMBOL_MAP: Record<string, string> = {
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
  'ltc': 'LTC',
};

// CoinGecko ID mapping
export const COINGECKO_ID_MAP: Record<string, string> = {
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

// Deribit only supports BTC and ETH options
export const DERIBIT_SUPPORTED = ['BTC', 'ETH'];

// Default volatility assumptions for cryptos without options data
export const DEFAULT_VOLATILITY: Record<string, number> = {
  'BTC': 0.55,   // 55% annual vol
  'ETH': 0.65,   // 65% annual vol
  'SOL': 0.85,   // 85% annual vol - higher beta
  'ADA': 0.75,
  'DOGE': 1.00,  // Very high vol
  'XRP': 0.70,
  'MATIC': 0.80,
  'AVAX': 0.80,
  'LINK': 0.75,
  'DOT': 0.75,
  'LTC': 0.65,
  'DEFAULT': 0.70,  // Fallback
};
