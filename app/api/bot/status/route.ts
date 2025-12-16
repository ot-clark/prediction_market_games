import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import type { BotState, BotStatusResponse } from '@/types/trading';
import { DEFAULT_BOT_CONFIG } from '@/types/trading';

const STATE_FILE = path.join(process.cwd(), 'data/bot-state.json');

function loadState(): BotState | null {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const data = fs.readFileSync(STATE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error loading bot state:', e);
  }
  return null;
}

/**
 * GET /api/bot/status
 * 
 * Returns the current bot state including positions, P&L, etc.
 */
export async function GET() {
  const state = loadState();
  
  if (!state) {
    // Return empty state if bot hasn't run yet
    const emptyState: BotState = {
      startingBalance: 1000,
      currentBalance: 1000,
      totalPnl: 0,
      openPositions: [],
      closedPositions: [],
      trades: [],
      isRunning: false,
      lastUpdate: new Date().toISOString(),
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      config: DEFAULT_BOT_CONFIG,
    };
    
    return NextResponse.json({
      state: emptyState,
      lastUpdated: new Date().toISOString(),
      message: 'Bot has not been started yet. Run: npx ts-node bot/trading-bot.ts',
    });
  }
  
  // Calculate some additional stats
  const totalUnrealizedPnl = state.openPositions.reduce(
    (sum, p) => sum + (p.unrealizedPnl || 0), 
    0
  );
  
  const totalExposure = state.openPositions.reduce(
    (sum, p) => sum + p.size, 
    0
  );
  
  const response: BotStatusResponse = {
    state,
    lastUpdated: new Date().toISOString(),
  };
  
  return NextResponse.json({
    ...response,
    stats: {
      totalUnrealizedPnl,
      totalExposure,
      availableBalance: state.currentBalance,
      totalEquity: state.currentBalance + totalUnrealizedPnl,
    },
  });
}
