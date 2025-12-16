"use strict";
/**
 * Paper Trading Bot
 *
 * Runs 24/7 and trades based on edge between Polymarket and model probabilities.
 *
 * Run with: npm run bot
 * Or with PM2: npm run bot:start
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// ============================================================================
// CONFIGURATION
// ============================================================================
const CONFIG = {
    startingBalance: 1000,
    minEdgeToEnter: 0.05, // 5% edge to enter
    maxEdgeToExit: 0.05, // Exit when edge < 5%
    basePositionSize: 25, // $25 base
    edgeMultiplier: 500, // +$50 per 10% additional edge
    maxPositionSize: 100, // Max $100 per position
    maxTotalExposure: 500, // Max $500 total exposure
    pollIntervalMs: 60000, // Check every 1 minute
    maxPositionsPerMarket: 1,
    minTimeToExpiry: 1, // Min 1 day to expiry
};
// Handle path differently for dev vs prod
const STATE_FILE = process.env.NODE_ENV === 'production'
    ? path.join(process.cwd(), 'data/bot-state.json')
    : path.join(__dirname, '../data/bot-state.json');
const API_BASE = process.env.API_BASE_URL || 'http://localhost:3000';
// ============================================================================
// STATE MANAGEMENT
// ============================================================================
function loadState() {
    try {
        if (fs.existsSync(STATE_FILE)) {
            const data = fs.readFileSync(STATE_FILE, 'utf-8');
            return JSON.parse(data);
        }
    }
    catch (e) {
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
function saveState(state) {
    try {
        const dir = path.dirname(STATE_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    }
    catch (e) {
        console.error('Error saving state:', e);
    }
}
async function fetchArbitrageData() {
    try {
        const response = await fetch(`${API_BASE}/api/crypto-arbitrage`, {
            headers: { 'Accept': 'application/json' },
        });
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        return data.opportunities || [];
    }
    catch (e) {
        console.error('Error fetching arbitrage data:', e);
        return [];
    }
}
// ============================================================================
// TRADING LOGIC
// ============================================================================
function calculatePositionSize(edge, config) {
    // Size = base + (edge * multiplier)
    const absEdge = Math.abs(edge);
    const size = config.basePositionSize + (absEdge * config.edgeMultiplier);
    return Math.min(size, config.maxPositionSize);
}
function getTotalExposure(positions) {
    return positions.reduce((sum, p) => sum + p.size, 0);
}
function shouldEnterPosition(opp, state, config) {
    // Use Deribit edge if available, otherwise Z-score
    const edge = opp.edgeVsDeribit ?? opp.edgeVsZscore;
    const absEdge = Math.abs(edge);
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
    const side = edge > 0 ? 'short' : 'long';
    return { shouldEnter: true, side, edge };
}
function shouldExitPosition(position, opp, config) {
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
function openPosition(opp, side, edge, state, config) {
    const size = calculatePositionSize(edge, config);
    const entryPrice = opp.polymarketProb;
    // Calculate shares
    // For long: buy YES shares at entryPrice, shares = size / entryPrice
    // For short: sell YES (buy NO) at (1 - entryPrice), shares = size / (1 - entryPrice)
    const effectivePrice = side === 'long' ? entryPrice : (1 - entryPrice);
    const shares = size / effectivePrice;
    const position = {
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
    const trade = {
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
function closePosition(position, currentPrice, currentEdge, reason, state) {
    // Calculate P&L
    // For long: bought YES at entryPrice, now worth currentPrice
    // P&L = shares * (currentPrice - entryPrice)
    // For short: sold YES at entryPrice, now worth currentPrice
    // P&L = shares * (entryPrice - currentPrice)
    let pnl;
    if (position.side === 'long') {
        pnl = position.shares * (currentPrice - position.entryPrice);
    }
    else {
        pnl = position.shares * (position.entryPrice - currentPrice);
    }
    // Update position
    position.status = 'closed';
    position.closeReason = reason;
    position.closePrice = currentPrice;
    position.closeTimestamp = new Date().toISOString();
    position.realizedPnl = pnl;
    position.currentPrice = currentPrice;
    position.currentEdge = currentEdge;
    // Record trade
    const trade = {
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
    }
    else if (pnl < 0) {
        state.losingTrades++;
    }
    state.winRate = state.winningTrades / Math.max(1, state.winningTrades + state.losingTrades);
    // Move to closed positions
    state.openPositions = state.openPositions.filter(p => p.id !== position.id);
    state.closedPositions.push(position);
}
function updateOpenPositions(opportunities, state) {
    // Update unrealized P&L for all open positions
    for (const position of state.openPositions) {
        const opp = opportunities.find(o => o.market.id === position.marketId);
        if (opp) {
            position.currentPrice = opp.polymarketProb;
            position.currentEdge = opp.edgeVsDeribit ?? opp.edgeVsZscore;
            // Calculate unrealized P&L
            if (position.side === 'long') {
                position.unrealizedPnl = position.shares * (position.currentPrice - position.entryPrice);
            }
            else {
                position.unrealizedPnl = position.shares * (position.entryPrice - position.currentPrice);
            }
        }
    }
}
// ============================================================================
// MAIN BOT LOOP
// ============================================================================
async function runBotCycle(state) {
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
    }
    catch (error) {
        console.error('  Error in bot cycle:', error);
        state.lastError = error instanceof Error ? error.message : 'Unknown error';
    }
    // Save state after each cycle
    saveState(state);
}
async function startBot() {
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
