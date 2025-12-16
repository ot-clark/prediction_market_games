// Market Making Types for Polymarket

export interface OrderBookLevel {
  price: string;
  size: string;
}

export interface OrderBook {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  timestamp: number;
  tokenId: string;
}

export interface Order {
  id: string;
  tokenId: string;
  side: 'BUY' | 'SELL';
  price: number;
  size: number;
  status: 'PENDING' | 'OPEN' | 'FILLED' | 'CANCELLED' | 'EXPIRED';
  createdAt: number;
  filledAt?: number;
  filledSize?: number;
  market: string;
}

export interface Position {
  tokenId: string;
  market: string;
  outcome: string;
  size: number;
  averagePrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  realizedPnL: number;
}

export interface MarketMakingConfig {
  // Spread settings
  spreadBps: number;           // Spread in basis points (100 = 1%)
  minSpreadBps: number;        // Minimum spread to maintain
  maxSpreadBps: number;        // Maximum spread to widen to
  
  // Position limits
  maxPositionSize: number;     // Maximum position per side
  maxTotalExposure: number;    // Maximum total capital at risk
  
  // Order settings
  orderSize: number;           // Default order size in dollars
  numLevels: number;           // Number of price levels to quote
  levelSpacing: number;        // Spacing between levels (in cents)
  
  // Risk settings
  inventorySkewFactor: number; // How much to skew quotes based on inventory (0-1)
  maxLossPerMarket: number;    // Stop-loss per market
  
  // Timing
  refreshIntervalMs: number;   // How often to refresh quotes
  cooldownMs: number;          // Minimum time between order updates
}

export interface MarketMakingState {
  market: {
    id: string;
    question: string;
    slug: string;
    outcomes: string[];
    tokenIds: string[];
  };
  orderBooks: Record<string, OrderBook>;  // tokenId -> OrderBook
  positions: Position[];
  openOrders: Order[];
  config: MarketMakingConfig;
  
  // Calculated values
  midPrice: Record<string, number>;       // tokenId -> mid price
  theoreticalValue: Record<string, number>; // Your estimate of fair value
  
  // Performance tracking
  totalPnL: number;
  totalVolume: number;
  makerRewardsEarned: number;
  orderCount: number;
  fillRate: number;
}

export interface Quote {
  tokenId: string;
  bidPrice: number;
  bidSize: number;
  askPrice: number;
  askSize: number;
  distanceFromMid: number;
  estimatedRewardScore: number;  // Based on Polymarket formula
}

// Polymarket maker reward calculation
// Formula: S = ((v - s) / v)^2 where v = max_spread, s = distance from mid
export function calculateRewardScore(maxSpread: number, distanceFromMid: number): number {
  if (distanceFromMid >= maxSpread) return 0;
  const ratio = (maxSpread - distanceFromMid) / maxSpread;
  return Math.pow(ratio, 2);
}

// Calculate optimal distance from mid for reward/fill probability balance
// At ~15% of max_spread, you get good rewards with reasonable fill probability
export function calculateOptimalDistance(maxSpread: number, aggressiveness: number = 0.15): number {
  return maxSpread * aggressiveness;
}

// Calculate quote prices with inventory skew
export function calculateQuotes(
  midPrice: number,
  spreadBps: number,
  inventory: number,
  maxInventory: number,
  inventorySkewFactor: number = 0.5
): { bidPrice: number; askPrice: number } {
  const halfSpread = (spreadBps / 10000) / 2;
  
  // Skew quotes based on inventory
  // If long (positive inventory), lower bid and ask to reduce position
  // If short (negative inventory), raise bid and ask to reduce position
  const inventoryRatio = maxInventory > 0 ? inventory / maxInventory : 0;
  const skew = inventoryRatio * inventorySkewFactor * halfSpread;
  
  return {
    bidPrice: Math.max(0.01, midPrice - halfSpread - skew),
    askPrice: Math.min(0.99, midPrice + halfSpread - skew),
  };
}

// Default configuration for conservative market making
export const DEFAULT_MM_CONFIG: MarketMakingConfig = {
  spreadBps: 200,              // 2% spread
  minSpreadBps: 100,           // 1% minimum
  maxSpreadBps: 500,           // 5% maximum (during volatility)
  maxPositionSize: 100,        // $100 max per side
  maxTotalExposure: 500,       // $500 total
  orderSize: 10,               // $10 per order
  numLevels: 3,                // 3 price levels
  levelSpacing: 1,             // 1 cent between levels
  inventorySkewFactor: 0.5,    // Medium inventory skew
  maxLossPerMarket: 50,        // $50 stop loss
  refreshIntervalMs: 5000,     // 5 second refresh
  cooldownMs: 30000,           // 30 second cooldown (matches the bot)
};

// Simulated trade for practice
export interface SimulatedTrade {
  id: string;
  timestamp: number;
  market: string;
  tokenId: string;
  side: 'BUY' | 'SELL';
  price: number;
  size: number;
  fee: number;
  pnl: number;
  isSimulated: boolean;
}

export interface PracticeSession {
  id: string;
  startTime: number;
  endTime?: number;
  markets: string[];
  trades: SimulatedTrade[];
  positions: Position[];
  totalPnL: number;
  totalVolume: number;
  winRate: number;
  averageTradeSize: number;
}
