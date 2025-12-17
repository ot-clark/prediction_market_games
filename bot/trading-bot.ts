/**
 * Paper Trading Bot
 * 
 * Runs 24/7 and trades based on edge between Polymarket and model probabilities.
 * 
 * Run with: npm run bot
 * Or with PM2: npm run bot:start
 */

import * as fs from 'fs';
import * as path from 'path';

// Types (inline to avoid path resolution issues with ts-node)
interface BotConfig {
  startingBalance: number;
  minEdgeToEnter: number;
  maxEdgeToExit: number;
  basePositionSize: number;
  edgeMultiplier: number;
  maxPositionSize: number;
  maxTotalExposure: number;
  pollIntervalMs: number;
  maxPositionsPerMarket: number;
  minTimeToExpiry: number;
}

interface Position {
  id: string;
  marketId: string;
  marketQuestion: string;
  crypto: string;
  targetPrice: number;
  direction: 'above' | 'below';
  betType: 'binary' | 'one-touch';
  expiryDate: string;
  side: 'long' | 'short';
  entryPrice: number;
  size: number;
  shares: number;
  entryEdge: number;
  entryZscoreProb: number;
  entryDeribitProb?: number;
  entryTimestamp: string;
  currentPrice: number;
  currentEdge: number;
  unrealizedPnl: number;
  status: 'open' | 'closed' | 'expired';
  closeReason?: 'edge_aligned' | 'expired' | 'manual';
  closePrice?: number;
  closeTimestamp?: string;
  realizedPnl?: number;
}

interface Trade {
  id: string;
  positionId: string;
  marketId: string;
  timestamp: string;
  action: 'open' | 'close';
  side: 'long' | 'short';
  price: number;
  size: number;
  shares: number;
  edge: number;
  zscoreProb: number;
  deribitProb?: number;
  cryptoPrice: number;
  pnl?: number;
}

interface BotState {
  startingBalance: number;
  currentBalance: number;
  totalPnl: number;
  openPositions: Position[];
  closedPositions: Position[];
  trades: Trade[];
  isRunning: boolean;
  lastUpdate: string;
  lastError?: string;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  config: BotConfig;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG: BotConfig = {
  startingBalance: 1000,
  minEdgeToEnter: 0.05,          // 5% edge to enter
  maxEdgeToExit: 0.05,           // Exit when edge < 5%
  basePositionSize: 25,          // $25 base
  edgeMultiplier: 500,           // +$50 per 10% additional edge
  maxPositionSize: 100,          // Max $100 per position
  maxTotalExposure: 500,         // Max $500 total exposure
  pollIntervalMs: 60000,         // Check every 1 minute
  maxPositionsPerMarket: 1,
  minTimeToExpiry: 1,            // Min 1 day to expiry
};

// Handle path differently for dev vs prod
const STATE_FILE = process.env.NODE_ENV === 'production'
  ? path.join(process.cwd(), 'data/bot-state.json')
  : path.join(__dirname, '../data/bot-state.json');
const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000';

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

function loadState(): BotState {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const data = fs.readFileSync(STATE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error loading state:', e);
  }
  
  // Return initial state
  return {
    startingBalance: CONFIG.startingBalance,
    currentBalance: CONFIG.startingBalance,
    totalPnl: 0,
    openPositions: [],
    closedPositions: [],
    trades: [],
    isRunning: true,
    lastUpdate: new Date().toISOString(),
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    winRate: 0,
    config: CONFIG,
  };
}

function saveState(state: BotState): void {
  try {
    const dir = path.dirname(STATE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (e) {
    console.error('Error saving state:', e);
  }
}

// ============================================================================
// DATA FETCHING
// ============================================================================

interface ArbitrageOpportunity {
  market: {
    id: string;
    question: string;
    crypto: string;
    targetPrice: number;
    direction: 'above' | 'below';
    betType: 'binary' | 'one-touch';
    expiryDate: string;
    polymarketPrice: number;
  };
  currentPrice: {
    price: number;
  };
  polymarketProb: number;
  zscoreProb: {
    probability: number;
  };
  deribitProb?: {
    probability: number;
  };
  edgeVsZscore: number;
  edgeVsDeribit?: number;
  signal: 'buy' | 'sell' | 'neutral';
  confidence: 'high' | 'medium' | 'low';
}

async function fetchArbitrageData(): Promise<ArbitrageOpportunity[]> {
  try {
    const response = await fetch(`${API_BASE}/api/crypto-arbitrage`, {
      headers: { 'Accept': 'application/json' },
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json() as { opportunities?: ArbitrageOpportunity[] };
    return data.opportunities || [];
  } catch (e) {
    console.error('Error fetching arbitrage data:', e);
    return [];
  }
}

// ============================================================================
// TRADING LOGIC
// ============================================================================

function calculatePositionSize(edge: number, config: BotConfig): number {
  // Size = base + (edge * multiplier)
  const absEdge = Math.abs(edge);
  const size = config.basePositionSize + (absEdge * config.edgeMultiplier);
  return Math.min(size, config.maxPositionSize);
}

function getTotalExposure(positions: Position[]): number {
  return positions.reduce((sum, p) => sum + p.size, 0);
}

function shouldEnterPosition(
  opp: ArbitrageOpportunity,
  state: BotState,
  config: BotConfig
): { shouldEnter: boolean; side: 'long' | 'short'; edge: number; reason?: string } {
  // Use Deribit edge if available, otherwise Z-score
  const edge = opp.edgeVsDeribit ?? opp.edgeVsZscore;
  const absEdge = Math.abs(edge);
  
  // SAFETY CHECK 1: Skip markets with extreme prices (already resolved or near-certain)
  const polyPrice = opp.polymarketProb;
  if (polyPrice > 0.95) {
    return { shouldEnter: false, side: 'long', edge, reason: `Market price ${(polyPrice * 100).toFixed(1)}% > 95% (likely resolved)` };
  }
  if (polyPrice < 0.05) {
    return { shouldEnter: false, side: 'long', edge, reason: `Market price ${(polyPrice * 100).toFixed(1)}% < 5% (likely resolved)` };
  }
  
  // SAFETY CHECK 2: For "dip" markets, verify the target hasn't been hit already
  // If current price is below target and direction is "below", the dip already happened
  const currentCryptoPrice = opp.currentPrice?.price;
  const targetPrice = opp.market.targetPrice;
  const direction = opp.market.direction;
  const betType = opp.market.betType;
  
  if (currentCryptoPrice && targetPrice && betType === 'one-touch') {
    if (direction === 'below' && currentCryptoPrice <= targetPrice) {
      return { shouldEnter: false, side: 'long', edge, reason: `Dip already happened: current $${currentCryptoPrice.toLocaleString()} <= target $${targetPrice.toLocaleString()}` };
    }
    if (direction === 'above' && currentCryptoPrice >= targetPrice) {
      return { shouldEnter: false, side: 'long', edge, reason: `Target already hit: current $${currentCryptoPrice.toLocaleString()} >= target $${targetPrice.toLocaleString()}` };
    }
  }
  
  // SAFETY CHECK 3: Sanity check model probability vs market price
  // If model says 95%+ and market says 95%+, there's no real edge to trade
  const modelProb = opp.deribitProb?.probability ?? opp.zscoreProb?.probability;
  if (modelProb && modelProb > 0.90 && polyPrice > 0.90) {
    return { shouldEnter: false, side: 'long', edge, reason: `Both model (${(modelProb * 100).toFixed(0)}%) and market (${(polyPrice * 100).toFixed(0)}%) agree at high probability` };
  }
  if (modelProb && modelProb < 0.10 && polyPrice < 0.10) {
    return { shouldEnter: false, side: 'long', edge, reason: `Both model (${(modelProb * 100).toFixed(0)}%) and market (${(polyPrice * 100).toFixed(0)}%) agree at low probability` };
  }
  
  // Check minimum edge
  if (absEdge < config.minEdgeToEnter) {
    return { shouldEnter: false, side: 'long', edge, reason: `Edge ${(absEdge * 100).toFixed(1)}% < ${(config.minEdgeToEnter * 100)}% threshold` };
  }
  
  // Check time to expiry
  const expiryDate = new Date(opp.market.expiryDate);
  const daysToExpiry = (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (daysToExpiry < config.minTimeToExpiry) {
    return { shouldEnter: false, side: 'long', edge, reason: `Only ${daysToExpiry.toFixed(1)} days to expiry` };
  }
  
  // Check if already have position in this market
  const existingPosition = state.openPositions.find(p => p.marketId === opp.market.id);
  if (existingPosition) {
    return { shouldEnter: false, side: 'long', edge, reason: 'Already have position in this market' };
  }
  
  // Check total exposure
  const currentExposure = getTotalExposure(state.openPositions);
  const positionSize = calculatePositionSize(edge, config);
  if (currentExposure + positionSize > config.maxTotalExposure) {
    return { shouldEnter: false, side: 'long', edge, reason: `Would exceed max exposure ($${currentExposure + positionSize} > $${config.maxTotalExposure})` };
  }
  
  // Check available balance
  if (positionSize > state.currentBalance) {
    return { shouldEnter: false, side: 'long', edge, reason: `Insufficient balance ($${state.currentBalance.toFixed(2)} < $${positionSize.toFixed(2)})` };
  }
  
  // Determine side based on edge direction
  // Positive edge = Polymarket overpriced = SELL (short)
  // Negative edge = Polymarket underpriced = BUY (long)
  const side: 'long' | 'short' = edge > 0 ? 'short' : 'long';
  
  return { shouldEnter: true, side, edge };
}

function shouldExitPosition(
  position: Position,
  opp: ArbitrageOpportunity | undefined,
  config: BotConfig
): { shouldExit: boolean; reason: string; currentPrice: number; currentEdge: number } {
  // If market data not found, check if expired
  if (!opp) {
    const expiryDate = new Date(position.expiryDate);
    if (expiryDate < new Date()) {
      return { 
        shouldExit: true, 
        reason: 'expired', 
        currentPrice: position.currentPrice,
        currentEdge: 0 
      };
    }
    return { shouldExit: false, reason: '', currentPrice: position.currentPrice, currentEdge: position.currentEdge };
  }
  
  const currentPrice = opp.polymarketProb;
  const currentEdge = opp.edgeVsDeribit ?? opp.edgeVsZscore;
  const absEdge = Math.abs(currentEdge);
  
  // Check if edge has aligned (dropped below threshold)
  if (absEdge < config.maxEdgeToExit) {
    return { 
      shouldExit: true, 
      reason: 'edge_aligned',
      currentPrice,
      currentEdge
    };
  }
  
  // Check if edge flipped (we were long but now should be short, or vice versa)
  const newSide = currentEdge > 0 ? 'short' : 'long';
  if (newSide !== position.side && absEdge >= config.minEdgeToEnter) {
    return {
      shouldExit: true,
      reason: 'edge_aligned', // Edge flipped significantly
      currentPrice,
      currentEdge
    };
  }
  
  return { shouldExit: false, reason: '', currentPrice, currentEdge };
}

function openPosition(
  opp: ArbitrageOpportunity,
  side: 'long' | 'short',
  edge: number,
  state: BotState,
  config: BotConfig
): Position {
  const size = calculatePositionSize(edge, config);
  const entryPrice = opp.polymarketProb;
  
  // Calculate shares
  // For long: buy YES shares at entryPrice, shares = size / entryPrice
  // For short: sell YES (buy NO) at (1 - entryPrice), shares = size / (1 - entryPrice)
  const effectivePrice = side === 'long' ? entryPrice : (1 - entryPrice);
  const shares = size / effectivePrice;
  
  const position: Position = {
    id: `pos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    marketId: opp.market.id,
    marketQuestion: opp.market.question,
    crypto: opp.market.crypto,
    targetPrice: opp.market.targetPrice,
    direction: opp.market.direction,
    betType: opp.market.betType,
    expiryDate: opp.market.expiryDate,
    side,
    entryPrice,
    size,
    shares,
    entryEdge: edge,
    entryZscoreProb: opp.zscoreProb.probability,
    entryDeribitProb: opp.deribitProb?.probability,
    entryTimestamp: new Date().toISOString(),
    currentPrice: entryPrice,
    currentEdge: edge,
    unrealizedPnl: 0,
    status: 'open',
  };
  
  // Record trade
  const trade: Trade = {
    id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    positionId: position.id,
    marketId: opp.market.id,
    timestamp: new Date().toISOString(),
    action: 'open',
    side,
    price: entryPrice,
    size,
    shares,
    edge,
    zscoreProb: opp.zscoreProb.probability,
    deribitProb: opp.deribitProb?.probability,
    cryptoPrice: opp.currentPrice.price,
  };
  
  state.trades.push(trade);
  state.totalTrades++;
  state.currentBalance -= size;
  
  return position;
}

function closePosition(
  position: Position,
  currentPrice: number,
  currentEdge: number,
  reason: string,
  state: BotState
): void {
  // Calculate P&L
  // For long: bought YES at entryPrice, now worth currentPrice
  // P&L = shares * (currentPrice - entryPrice)
  // For short: sold YES at entryPrice, now worth currentPrice
  // P&L = shares * (entryPrice - currentPrice)
  let pnl: number;
  if (position.side === 'long') {
    pnl = position.shares * (currentPrice - position.entryPrice);
  } else {
    pnl = position.shares * (position.entryPrice - currentPrice);
  }
  
  // Update position
  position.status = 'closed';
  position.closeReason = reason as 'edge_aligned' | 'expired' | 'manual';
  position.closePrice = currentPrice;
  position.closeTimestamp = new Date().toISOString();
  position.realizedPnl = pnl;
  position.currentPrice = currentPrice;
  position.currentEdge = currentEdge;
  
  // Record trade
  const trade: Trade = {
    id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    positionId: position.id,
    marketId: position.marketId,
    timestamp: new Date().toISOString(),
    action: 'close',
    side: position.side,
    price: currentPrice,
    size: position.size,
    shares: position.shares,
    edge: currentEdge,
    zscoreProb: 0, // Not tracked on close
    cryptoPrice: 0,
    pnl,
  };
  
  state.trades.push(trade);
  state.totalTrades++;
  
  // Update balance
  // Return original investment + P&L
  state.currentBalance += position.size + pnl;
  state.totalPnl += pnl;
  
  // Update win/loss stats
  if (pnl > 0) {
    state.winningTrades++;
  } else if (pnl < 0) {
    state.losingTrades++;
  }
  state.winRate = state.winningTrades / Math.max(1, state.winningTrades + state.losingTrades);
  
  // Move to closed positions
  state.openPositions = state.openPositions.filter(p => p.id !== position.id);
  state.closedPositions.push(position);
}

function updateOpenPositions(
  opportunities: ArbitrageOpportunity[],
  state: BotState
): void {
  // Update unrealized P&L for all open positions
  for (const position of state.openPositions) {
    const opp = opportunities.find(o => o.market.id === position.marketId);
    if (opp) {
      position.currentPrice = opp.polymarketProb;
      position.currentEdge = opp.edgeVsDeribit ?? opp.edgeVsZscore;
      
      // Calculate unrealized P&L
      if (position.side === 'long') {
        position.unrealizedPnl = position.shares * (position.currentPrice - position.entryPrice);
      } else {
        position.unrealizedPnl = position.shares * (position.entryPrice - position.currentPrice);
      }
    }
  }
}

// ============================================================================
// MAIN BOT LOOP
// ============================================================================

async function runBotCycle(state: BotState): Promise<void> {
  console.log(`\n[${new Date().toISOString()}] Running bot cycle...`);
  
  try {
    // Fetch latest arbitrage data
    const opportunities = await fetchArbitrageData();
    console.log(`  Fetched ${opportunities.length} opportunities`);
    
    if (opportunities.length === 0) {
      console.log('  No opportunities found, skipping cycle');
      return;
    }
    
    // Update open positions
    updateOpenPositions(opportunities, state);
    
    // Check for exits first
    for (const position of [...state.openPositions]) {
      const opp = opportunities.find(o => o.market.id === position.marketId);
      const exitCheck = shouldExitPosition(position, opp, CONFIG);
      
      if (exitCheck.shouldExit) {
        console.log(`  CLOSING position in ${position.marketQuestion.substring(0, 40)}...`);
        console.log(`    Reason: ${exitCheck.reason}`);
        console.log(`    Entry: ${(position.entryPrice * 100).toFixed(1)}% -> Exit: ${(exitCheck.currentPrice * 100).toFixed(1)}%`);
        
        closePosition(position, exitCheck.currentPrice, exitCheck.currentEdge, exitCheck.reason, state);
        
        console.log(`    P&L: $${position.realizedPnl?.toFixed(2)}`);
      }
    }
    
    // Check for new entries
    for (const opp of opportunities) {
      const entryCheck = shouldEnterPosition(opp, state, CONFIG);
      
      if (entryCheck.shouldEnter) {
        const position = openPosition(opp, entryCheck.side, entryCheck.edge, state, CONFIG);
        state.openPositions.push(position);
        
        console.log(`  OPENING ${entryCheck.side.toUpperCase()} position in ${opp.market.question.substring(0, 40)}...`);
        console.log(`    Edge: ${(entryCheck.edge * 100).toFixed(1)}%`);
        console.log(`    Size: $${position.size.toFixed(2)} (${position.shares.toFixed(2)} shares @ ${(position.entryPrice * 100).toFixed(1)}%)`);
      }
    }
    
    // Update state
    state.lastUpdate = new Date().toISOString();
    state.lastError = undefined;
    
    // Log summary
    const totalUnrealizedPnl = state.openPositions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
    console.log(`  Summary:`);
    console.log(`    Balance: $${state.currentBalance.toFixed(2)}`);
    console.log(`    Open positions: ${state.openPositions.length}`);
    console.log(`    Unrealized P&L: $${totalUnrealizedPnl.toFixed(2)}`);
    console.log(`    Total realized P&L: $${state.totalPnl.toFixed(2)}`);
    console.log(`    Win rate: ${(state.winRate * 100).toFixed(1)}% (${state.winningTrades}W / ${state.losingTrades}L)`);
    
  } catch (error) {
    console.error('  Error in bot cycle:', error);
    state.lastError = error instanceof Error ? error.message : 'Unknown error';
  }
  
  // Save state after each cycle
  saveState(state);
}

async function startBot(): Promise<void> {
  console.log('========================================');
  console.log('  Paper Trading Bot Starting');
  console.log('========================================');
  console.log(`Config:`);
  console.log(`  Starting balance: $${CONFIG.startingBalance}`);
  console.log(`  Min edge to enter: ${(CONFIG.minEdgeToEnter * 100)}%`);
  console.log(`  Max edge to exit: ${(CONFIG.maxEdgeToExit * 100)}%`);
  console.log(`  Poll interval: ${CONFIG.pollIntervalMs / 1000}s`);
  console.log(`  Max position size: $${CONFIG.maxPositionSize}`);
  console.log(`  Max total exposure: $${CONFIG.maxTotalExposure}`);
  console.log('');
  
  // Load existing state or create new
  const state = loadState();
  state.isRunning = true;
  state.config = CONFIG;
  
  console.log(`Loaded state:`);
  console.log(`  Current balance: $${state.currentBalance.toFixed(2)}`);
  console.log(`  Open positions: ${state.openPositions.length}`);
  console.log(`  Total P&L: $${state.totalPnl.toFixed(2)}`);
  console.log('');
  
  // Run initial cycle
  await runBotCycle(state);
  
  // Set up interval
  setInterval(async () => {
    await runBotCycle(state);
  }, CONFIG.pollIntervalMs);
  
  console.log(`\nBot running. Checking every ${CONFIG.pollIntervalMs / 1000} seconds...`);
  console.log('Press Ctrl+C to stop.\n');
}

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\n\nShutting down bot...');
  const state = loadState();
  state.isRunning = false;
  saveState(state);
  console.log('State saved. Goodbye!');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\nReceived SIGTERM, shutting down...');
  const state = loadState();
  state.isRunning = false;
  saveState(state);
  process.exit(0);
});

// Start the bot
startBot().catch(console.error);
