/**
 * Real Trading Bot
 * 
 * Trades real USDC on Polymarket based on arbitrage opportunities.
 * 
 * IMPORTANT: This uses REAL MONEY. Use with caution.
 * 
 * Environment Variables Required:
 * - POLYMARKET_PRIVATE_KEY: Your wallet private key
 * 
 * Run with: npm run bot:real
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// TYPES (inline to avoid path issues)
// ============================================================================

interface RealBotConfig {
  maxTotalExposure: number;      // Max $10
  minEdgeToEnter: number;        // 5%
  maxEdgeToExit: number;         // 5%
  basePositionSize: number;      // Base size
  edgeMultiplier: number;        // Scale with edge
  maxPositionSize: number;       // Max per position
  pollIntervalMs: number;        // Check interval
  minTimeToExpiry: number;       // Days
  dryRun: boolean;               // If true, simulate orders
}

interface RealPosition {
  id: string;
  marketId: string;
  marketQuestion: string;
  tokenId: string;
  side: 'long' | 'short';
  entryPrice: number;
  size: number;
  shares: number;
  entryEdge: number;
  entryTimestamp: string;
  orderId?: string;
  status: 'open' | 'closed';
  closePrice?: number;
  realizedPnl?: number;
}

interface RealBotState {
  maxExposure: number;
  currentExposure: number;
  totalPnl: number;
  openPositions: RealPosition[];
  closedPositions: RealPosition[];
  isRunning: boolean;
  lastUpdate: string;
  lastError?: string;
  config: RealBotConfig;
}

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
    tokenIds?: string[];
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
}

// ============================================================================
// CONFIGURATION - $10 MAX EXPOSURE
// ============================================================================

const CONFIG: RealBotConfig = {
  maxTotalExposure: 10,          // HARD LIMIT: $10 max
  minEdgeToEnter: 0.05,          // 5% edge to enter
  maxEdgeToExit: 0.05,           // Exit when edge < 5%
  basePositionSize: 1,           // $1 base position
  edgeMultiplier: 20,            // +$2 per 10% additional edge
  maxPositionSize: 5,            // Max $5 per position (half of total)
  pollIntervalMs: 120000,        // Check every 2 minutes (avoid rate limits)
  minTimeToExpiry: 1,            // At least 1 day to expiry
  dryRun: true,                  // START IN DRY RUN MODE - set to false for real trading
};

const STATE_FILE = process.env.NODE_ENV === 'production'
  ? path.join(process.cwd(), 'data/real-bot-state.json')
  : path.join(__dirname, '../data/real-bot-state.json');

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000';

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

function loadState(): RealBotState {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const data = fs.readFileSync(STATE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error loading state:', e);
  }
  
  return {
    maxExposure: CONFIG.maxTotalExposure,
    currentExposure: 0,
    totalPnl: 0,
    openPositions: [],
    closedPositions: [],
    isRunning: true,
    lastUpdate: new Date().toISOString(),
    config: CONFIG,
  };
}

function saveState(state: RealBotState): void {
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

function calculatePositionSize(edge: number, config: RealBotConfig, remainingExposure: number): number {
  const absEdge = Math.abs(edge);
  // Linear scaling: base + (edge * multiplier)
  let size = config.basePositionSize + (absEdge * config.edgeMultiplier);
  
  // Cap at max position size
  size = Math.min(size, config.maxPositionSize);
  
  // Cap at remaining exposure
  size = Math.min(size, remainingExposure);
  
  // Round to 2 decimal places
  return Math.round(size * 100) / 100;
}

function shouldEnterPosition(
  opp: ArbitrageOpportunity,
  state: RealBotState,
  config: RealBotConfig
): { shouldEnter: boolean; side: 'long' | 'short'; edge: number; size: number; reason?: string } {
  const edge = opp.edgeVsDeribit ?? opp.edgeVsZscore;
  const absEdge = Math.abs(edge);
  const polyPrice = opp.polymarketProb;
  
  // SAFETY: Skip essentially resolved markets (>99% or <1%)
  if (polyPrice > 0.99) {
    return { shouldEnter: false, side: 'long', edge, size: 0, reason: `Price ${(polyPrice * 100).toFixed(1)}% > 99% (resolved)` };
  }
  if (polyPrice < 0.01) {
    return { shouldEnter: false, side: 'long', edge, size: 0, reason: `Price ${(polyPrice * 100).toFixed(1)}% < 1% (resolved)` };
  }
  
  // SAFETY: Check if event already happened
  const currentCryptoPrice = opp.currentPrice?.price;
  const targetPrice = opp.market.targetPrice;
  const direction = opp.market.direction;
  
  if (currentCryptoPrice && targetPrice && opp.market.betType === 'one-touch') {
    if (direction === 'below' && currentCryptoPrice <= targetPrice) {
      return { shouldEnter: false, side: 'long', edge, size: 0, reason: 'Dip already happened' };
    }
    if (direction === 'above' && currentCryptoPrice >= targetPrice) {
      return { shouldEnter: false, side: 'long', edge, size: 0, reason: 'Target already hit' };
    }
  }
  
  // Check minimum edge
  if (absEdge < config.minEdgeToEnter) {
    return { shouldEnter: false, side: 'long', edge, size: 0, reason: `Edge ${(absEdge * 100).toFixed(1)}% < threshold` };
  }
  
  // Check time to expiry
  const expiryDate = new Date(opp.market.expiryDate);
  const daysToExpiry = (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (daysToExpiry < config.minTimeToExpiry) {
    return { shouldEnter: false, side: 'long', edge, size: 0, reason: `Only ${daysToExpiry.toFixed(1)} days to expiry` };
  }
  
  // Check if already have position
  const existingPosition = state.openPositions.find(p => p.marketId === opp.market.id);
  if (existingPosition) {
    return { shouldEnter: false, side: 'long', edge, size: 0, reason: 'Already have position' };
  }
  
  // Calculate remaining exposure
  const remainingExposure = config.maxTotalExposure - state.currentExposure;
  if (remainingExposure < 0.50) {  // Min $0.50 to trade
    return { shouldEnter: false, side: 'long', edge, size: 0, reason: `Only $${remainingExposure.toFixed(2)} remaining exposure` };
  }
  
  // Calculate position size
  const size = calculatePositionSize(edge, config, remainingExposure);
  if (size < 0.50) {
    return { shouldEnter: false, side: 'long', edge, size: 0, reason: `Position size $${size.toFixed(2)} too small` };
  }
  
  // Determine side
  const side: 'long' | 'short' = edge > 0 ? 'short' : 'long';
  
  return { shouldEnter: true, side, edge, size };
}

// ============================================================================
// ORDER EXECUTION (Simulated for now - set dryRun: false for real orders)
// ============================================================================

async function executeOrder(
  opp: ArbitrageOpportunity,
  side: 'long' | 'short',
  size: number,
  config: RealBotConfig
): Promise<{ success: boolean; orderId?: string; filledPrice?: number }> {
  
  if (config.dryRun) {
    console.log(`  [DRY RUN] Would ${side === 'long' ? 'BUY' : 'SELL'} $${size.toFixed(2)} on "${opp.market.question.substring(0, 40)}..."`);
    return { 
      success: true, 
      orderId: `dry_${Date.now()}`,
      filledPrice: opp.polymarketProb,
    };
  }
  
  // REAL ORDER EXECUTION
  // This requires proper Polymarket CLOB integration
  // For safety, we'll log and return false until fully tested
  console.log(`  [REAL] Would place order - NOT IMPLEMENTED YET`);
  console.log(`  Market: ${opp.market.question.substring(0, 50)}...`);
  console.log(`  Side: ${side}, Size: $${size.toFixed(2)}`);
  
  // TODO: Implement actual order placement using polymarket-client.ts
  // const client = getPolymarketClient();
  // await client.initialize();
  // const tokens = await client.getMarketTokens(opp.market.id);
  // const tokenId = side === 'long' ? tokens.tokens[0].token_id : tokens.tokens[1].token_id;
  // const order = await client.placeOrder({ ... });
  
  return { success: false, orderId: undefined };
}

// ============================================================================
// MAIN BOT LOOP
// ============================================================================

async function runBotCycle(state: RealBotState): Promise<void> {
  console.log(`\n[${new Date().toISOString()}] Running REAL trading cycle...`);
  console.log(`  Mode: ${CONFIG.dryRun ? 'DRY RUN' : 'LIVE TRADING'}`);
  console.log(`  Exposure: $${state.currentExposure.toFixed(2)} / $${CONFIG.maxTotalExposure}`);
  
  try {
    const opportunities = await fetchArbitrageData();
    console.log(`  Fetched ${opportunities.length} opportunities`);
    
    if (opportunities.length === 0) {
      return;
    }
    
    // Look for entry opportunities
    for (const opp of opportunities) {
      const check = shouldEnterPosition(opp, state, CONFIG);
      
      if (check.shouldEnter) {
        console.log(`  SIGNAL: ${check.side.toUpperCase()} ${opp.market.crypto} - Edge: ${(check.edge * 100).toFixed(1)}%`);
        
        const result = await executeOrder(opp, check.side, check.size, CONFIG);
        
        if (result.success) {
          const position: RealPosition = {
            id: `pos_${Date.now()}`,
            marketId: opp.market.id,
            marketQuestion: opp.market.question,
            tokenId: '',
            side: check.side,
            entryPrice: result.filledPrice || opp.polymarketProb,
            size: check.size,
            shares: check.size / (check.side === 'long' ? opp.polymarketProb : (1 - opp.polymarketProb)),
            entryEdge: check.edge,
            entryTimestamp: new Date().toISOString(),
            orderId: result.orderId,
            status: 'open',
          };
          
          state.openPositions.push(position);
          state.currentExposure += check.size;
          
          console.log(`  OPENED: $${check.size.toFixed(2)} ${check.side} @ ${(position.entryPrice * 100).toFixed(1)}%`);
        }
      }
    }
    
    // TODO: Add exit logic (similar to paper trading bot)
    
    state.lastUpdate = new Date().toISOString();
    
  } catch (error) {
    console.error('  Error in bot cycle:', error);
    state.lastError = error instanceof Error ? error.message : 'Unknown error';
  }
  
  saveState(state);
}

async function startBot(): Promise<void> {
  console.log('========================================');
  console.log('  REAL Trading Bot Starting');
  console.log('========================================');
  console.log('');
  console.log('  *** WARNING: This bot trades REAL USDC ***');
  console.log('');
  console.log(`  Mode: ${CONFIG.dryRun ? 'DRY RUN (no real orders)' : 'LIVE TRADING'}`);
  console.log(`  Max Exposure: $${CONFIG.maxTotalExposure}`);
  console.log(`  Min Edge: ${(CONFIG.minEdgeToEnter * 100)}%`);
  console.log(`  Position Size: $${CONFIG.basePositionSize} base + edge scaling`);
  console.log(`  Max Position: $${CONFIG.maxPositionSize}`);
  console.log(`  Poll Interval: ${CONFIG.pollIntervalMs / 1000}s`);
  console.log('');
  
  const state = loadState();
  state.isRunning = true;
  state.config = CONFIG;
  
  console.log(`Current state:`);
  console.log(`  Exposure: $${state.currentExposure.toFixed(2)} / $${CONFIG.maxTotalExposure}`);
  console.log(`  Open positions: ${state.openPositions.length}`);
  console.log(`  Total P&L: $${state.totalPnl.toFixed(2)}`);
  console.log('');
  
  // Run initial cycle
  await runBotCycle(state);
  
  // Set up interval
  setInterval(async () => {
    await runBotCycle(state);
  }, CONFIG.pollIntervalMs);
  
  console.log(`\nBot running. Press Ctrl+C to stop.\n`);
}

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\n\nShutting down...');
  const state = loadState();
  state.isRunning = false;
  saveState(state);
  process.exit(0);
});

startBot().catch(console.error);
