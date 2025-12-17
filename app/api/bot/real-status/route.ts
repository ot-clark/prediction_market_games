import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const STATE_FILE = path.join(process.cwd(), 'data/real-bot-state.json');

interface RealBotState {
  maxExposure: number;
  currentExposure: number;
  totalPnl: number;
  openPositions: any[];
  closedPositions: any[];
  isRunning: boolean;
  lastUpdate: string;
  lastError?: string;
  config: any;
}

function loadState(): RealBotState | null {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const data = fs.readFileSync(STATE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error loading real bot state:', e);
  }
  return null;
}

/**
 * GET /api/bot/real-status
 * 
 * Returns the current real trading bot state
 */
export async function GET() {
  const state = loadState();
  
  if (!state) {
    return NextResponse.json({
      state: {
        maxExposure: 10,
        currentExposure: 0,
        totalPnl: 0,
        openPositions: [],
        closedPositions: [],
        isRunning: false,
        lastUpdate: new Date().toISOString(),
        config: {
          maxTotalExposure: 10,
          minEdgeToEnter: 0.05,
          dryRun: true,
        },
      },
      lastUpdated: new Date().toISOString(),
      message: 'Real trading bot has not been started yet.',
    });
  }
  
  // Calculate stats
  const totalUnrealizedPnl = state.openPositions.reduce(
    (sum: number, p: any) => sum + (p.unrealizedPnl || 0), 
    0
  );
  
  return NextResponse.json({
    state,
    lastUpdated: new Date().toISOString(),
    stats: {
      totalUnrealizedPnl,
      availableExposure: state.maxExposure - state.currentExposure,
      totalEquity: state.maxExposure + state.totalPnl,
    },
  });
}
