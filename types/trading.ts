/**
 * Paper Trading Types
 */

export interface Position {
  id: string;
  marketId: string;
  marketQuestion: string;
  crypto: string;
  targetPrice: number;
  direction: 'above' | 'below';
  betType: 'binary' | 'one-touch';
  expiryDate: string;
  
  // Position details
  side: 'long' | 'short';  // long = bought YES, short = sold YES (bought NO)
  entryPrice: number;      // Polymarket price when entered (0-1)
  size: number;            // Dollar amount invested
  shares: number;          // Number of shares (size / entryPrice for long)
  
  // Entry conditions
  entryEdge: number;       // Edge when position was opened
  entryZscoreProb: number;
  entryDeribitProb?: number;
  entryTimestamp: string;
  
  // Current state
  currentPrice: number;
  currentEdge: number;
  unrealizedPnl: number;
  
  // Status
  status: 'open' | 'closed' | 'expired';
  closeReason?: 'edge_aligned' | 'expired' | 'manual';
  closePrice?: number;
  closeTimestamp?: string;
  realizedPnl?: number;
}

export interface Trade {
  id: string;
  positionId: string;
  marketId: string;
  timestamp: string;
  
  action: 'open' | 'close';
  side: 'long' | 'short';
  price: number;
  size: number;
  shares: number;
  
  // Conditions at time of trade
  edge: number;
  zscoreProb: number;
  deribitProb?: number;
  cryptoPrice: number;
  
  // For close trades
  pnl?: number;
}

export interface BotState {
  // Account
  startingBalance: number;
  currentBalance: number;
  totalPnl: number;
  
  // Positions
  openPositions: Position[];
  closedPositions: Position[];
  
  // Trades
  trades: Trade[];
  
  // Bot status
  isRunning: boolean;
  lastUpdate: string;
  lastError?: string;
  
  // Stats
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  
  // Config
  config: BotConfig;
}

export interface BotConfig {
  // Capital
  startingBalance: number;
  
  // Entry conditions
  minEdgeToEnter: number;        // Minimum edge to open position (e.g., 0.05 for 5%)
  
  // Exit conditions
  maxEdgeToExit: number;         // Close when edge drops below this (e.g., 0.05 for 5%)
  
  // Position sizing
  // Size = basePositionSize + (edge * edgeMultiplier)
  // e.g., 5% edge with base=50 and multiplier=500 = $50 + ($25) = $75
  basePositionSize: number;      // Base position size in dollars
  edgeMultiplier: number;        // Multiplier for edge (size increases with edge)
  maxPositionSize: number;       // Maximum single position size
  maxTotalExposure: number;      // Maximum total exposure (sum of all positions)
  
  // Timing
  pollIntervalMs: number;        // How often to check markets (e.g., 60000 for 1 min)
  
  // Risk
  maxPositionsPerMarket: number; // Max positions in same market
  minTimeToExpiry: number;       // Don't enter if < X days to expiry
}

export const DEFAULT_BOT_CONFIG: BotConfig = {
  startingBalance: 1000,
  minEdgeToEnter: 0.05,          // 5% edge to enter
  maxEdgeToExit: 0.05,           // Exit when edge < 5%
  basePositionSize: 25,          // $25 base
  edgeMultiplier: 500,           // +$50 per 10% edge
  maxPositionSize: 100,          // Max $100 per position
  maxTotalExposure: 500,         // Max $500 total
  pollIntervalMs: 60000,         // Check every 1 minute
  maxPositionsPerMarket: 1,      // 1 position per market
  minTimeToExpiry: 1,            // At least 1 day to expiry
};

// API Response types
export interface BotStatusResponse {
  state: BotState;
  lastUpdated: string;
}

export interface BotActionResponse {
  success: boolean;
  message: string;
  state?: BotState;
}
