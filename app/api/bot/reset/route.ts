import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import type { BotState } from '@/types/trading';
import { DEFAULT_BOT_CONFIG } from '@/types/trading';

const STATE_FILE = path.join(process.cwd(), 'data/bot-state.json');

/**
 * POST /api/bot/reset
 * 
 * Resets the bot state to initial values.
 * WARNING: This will clear all positions and trade history!
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const startingBalance = body.startingBalance || 1000;
    
    const newState: BotState = {
      startingBalance,
      currentBalance: startingBalance,
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
      config: {
        ...DEFAULT_BOT_CONFIG,
        startingBalance,
      },
    };
    
    // Ensure directory exists
    const dir = path.dirname(STATE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write new state
    fs.writeFileSync(STATE_FILE, JSON.stringify(newState, null, 2));
    
    return NextResponse.json({
      success: true,
      message: `Bot reset with $${startingBalance} starting balance`,
      state: newState,
    });
  } catch (error) {
    console.error('Error resetting bot:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to reset bot',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
