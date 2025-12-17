'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface RealPosition {
  id: string;
  marketId: string;
  marketQuestion: string;
  side: 'long' | 'short';
  entryPrice: number;
  size: number;
  shares: number;
  entryEdge: number;
  entryTimestamp: string;
  status: 'open' | 'closed';
  closePrice?: number;
  realizedPnl?: number;
  unrealizedPnl?: number;
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
  config: {
    maxTotalExposure: number;
    minEdgeToEnter: number;
    maxPositionSize: number;
    basePositionSize: number;
    edgeMultiplier: number;
    dryRun: boolean;
  };
}

interface BotStatusResponse {
  state: RealBotState;
  lastUpdated: string;
  message?: string;
  stats?: {
    totalUnrealizedPnl: number;
    availableExposure: number;
    totalEquity: number;
  };
}

export default function RealTradingPage() {
  const [data, setData] = useState<BotStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'positions' | 'history'>('overview');

  const fetchData = async () => {
    try {
      setError(null);
      const response = await fetch('/api/bot/real-status', { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to fetch bot status');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: number) => {
    const sign = value >= 0 ? '' : '-';
    return `${sign}$${Math.abs(value).toFixed(2)}`;
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-zinc-100 mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Loading bot status...</p>
        </div>
      </div>
    );
  }

  const state = data?.state;
  const stats = data?.stats;
  const isDryRun = state?.config?.dryRun !== false;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mb-4 text-sm"
          >
            ← Back to Dashboard
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Real Trading Bot
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                Live USDC trading on Polymarket • Max exposure: $10
              </p>
            </div>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Mode Banner */}
        {isDryRun ? (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">DRY RUN MODE</h3>
            <p className="text-amber-800 dark:text-amber-200 text-sm">
              The bot is simulating trades. No real orders are being placed.
              To enable real trading, set <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded">dryRun: false</code> in the config.
            </p>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">LIVE TRADING</h3>
            <p className="text-green-800 dark:text-green-200 text-sm">
              Real USDC orders are being placed on Polymarket.
            </p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
            <div className="text-sm text-zinc-500 mb-1">Max Exposure</div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {formatCurrency(state?.maxExposure || 10)}
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
            <div className="text-sm text-zinc-500 mb-1">Current Exposure</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(state?.currentExposure || 0)}
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
            <div className="text-sm text-zinc-500 mb-1">Available</div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {formatCurrency(stats?.availableExposure || (state?.maxExposure || 10) - (state?.currentExposure || 0))}
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
            <div className="text-sm text-zinc-500 mb-1">Total P&L</div>
            <div className={`text-2xl font-bold ${
              (state?.totalPnl || 0) >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {formatCurrency(state?.totalPnl || 0)}
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 text-center">
            <div className="text-xs text-zinc-500">Open Positions</div>
            <div className="font-bold text-zinc-900 dark:text-zinc-100">
              {state?.openPositions?.length || 0}
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 text-center">
            <div className="text-xs text-zinc-500">Closed Trades</div>
            <div className="font-bold text-zinc-900 dark:text-zinc-100">
              {state?.closedPositions?.length || 0}
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 text-center">
            <div className="text-xs text-zinc-500">Min Edge</div>
            <div className="font-bold text-zinc-900 dark:text-zinc-100">
              {formatPercent(state?.config?.minEdgeToEnter || 0.05)}
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 text-center">
            <div className="text-xs text-zinc-500">Status</div>
            <div className={`font-bold ${state?.isRunning ? 'text-green-600' : 'text-zinc-500'}`}>
              {state?.isRunning ? 'Running' : 'Stopped'}
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 text-center">
            <div className="text-xs text-zinc-500">Last Update</div>
            <div className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">
              {state?.lastUpdate ? new Date(state.lastUpdate).toLocaleTimeString() : 'N/A'}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-200 dark:bg-zinc-800 p-1 rounded-lg mb-6 w-fit">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Config
          </button>
          <button
            onClick={() => setActiveTab('positions')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'positions'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Open Positions ({state?.openPositions?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            History ({state?.closedPositions?.length || 0})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Bot Configuration</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-zinc-500">Max Total Exposure</div>
                <div className="font-mono">${state?.config?.maxTotalExposure || 10}</div>
              </div>
              <div>
                <div className="text-sm text-zinc-500">Min Edge to Enter</div>
                <div className="font-mono">{formatPercent(state?.config?.minEdgeToEnter || 0.05)}</div>
              </div>
              <div>
                <div className="text-sm text-zinc-500">Base Position Size</div>
                <div className="font-mono">${state?.config?.basePositionSize || 1}</div>
              </div>
              <div>
                <div className="text-sm text-zinc-500">Edge Multiplier</div>
                <div className="font-mono">{state?.config?.edgeMultiplier || 20}</div>
              </div>
              <div>
                <div className="text-sm text-zinc-500">Max Per Position</div>
                <div className="font-mono">${state?.config?.maxPositionSize || 5}</div>
              </div>
              <div>
                <div className="text-sm text-zinc-500">Mode</div>
                <div className={`font-mono ${isDryRun ? 'text-amber-600' : 'text-green-600'}`}>
                  {isDryRun ? 'DRY RUN' : 'LIVE'}
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Position Sizing Formula</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 font-mono">
                Size = ${state?.config?.basePositionSize || 1} + (Edge × {state?.config?.edgeMultiplier || 20})
              </p>
              <p className="text-xs text-zinc-500 mt-2">
                Example: 10% edge = ${state?.config?.basePositionSize || 1} + (0.10 × {state?.config?.edgeMultiplier || 20}) = ${(state?.config?.basePositionSize || 1) + (0.10 * (state?.config?.edgeMultiplier || 20))}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'positions' && (
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            {state?.openPositions && state.openPositions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
                      <th className="text-left py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100 text-sm">Market</th>
                      <th className="text-center py-3 px-3 font-bold text-zinc-900 dark:text-zinc-100 text-sm">Side</th>
                      <th className="text-center py-3 px-3 font-bold text-zinc-900 dark:text-zinc-100 text-sm">Entry</th>
                      <th className="text-center py-3 px-3 font-bold text-zinc-900 dark:text-zinc-100 text-sm">Size</th>
                      <th className="text-center py-3 px-3 font-bold text-zinc-900 dark:text-zinc-100 text-sm">Edge</th>
                      <th className="text-center py-3 px-3 font-bold text-zinc-900 dark:text-zinc-100 text-sm">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.openPositions.map((pos) => (
                      <tr key={pos.id} className="border-b border-zinc-100 dark:border-zinc-800">
                        <td className="py-3 px-4">
                          <div className="max-w-xs truncate text-sm">{pos.marketQuestion}</div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            pos.side === 'long'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {pos.side.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-sm">
                          {formatPercent(pos.entryPrice)}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-sm">
                          {formatCurrency(pos.size)}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-sm">
                          {formatPercent(pos.entryEdge)}
                        </td>
                        <td className="py-3 px-3 text-center text-xs text-zinc-500">
                          {formatDate(pos.entryTimestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-500">
                No open positions. The bot will open positions when edge exceeds 5%.
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            {state?.closedPositions && state.closedPositions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
                      <th className="text-left py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100 text-sm">Market</th>
                      <th className="text-center py-3 px-3 font-bold text-zinc-900 dark:text-zinc-100 text-sm">Side</th>
                      <th className="text-center py-3 px-3 font-bold text-zinc-900 dark:text-zinc-100 text-sm">Entry</th>
                      <th className="text-center py-3 px-3 font-bold text-zinc-900 dark:text-zinc-100 text-sm">Exit</th>
                      <th className="text-center py-3 px-3 font-bold text-zinc-900 dark:text-zinc-100 text-sm">Size</th>
                      <th className="text-center py-3 px-3 font-bold text-zinc-900 dark:text-zinc-100 text-sm">P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...state.closedPositions].reverse().map((pos) => (
                      <tr key={pos.id} className="border-b border-zinc-100 dark:border-zinc-800">
                        <td className="py-3 px-4">
                          <div className="max-w-xs truncate text-sm">{pos.marketQuestion}</div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            pos.side === 'long'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {pos.side.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-sm">
                          {formatPercent(pos.entryPrice)}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-sm">
                          {pos.closePrice ? formatPercent(pos.closePrice) : '-'}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-sm">
                          {formatCurrency(pos.size)}
                        </td>
                        <td className={`py-3 px-3 text-center font-mono text-sm font-bold ${
                          (pos.realizedPnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {pos.realizedPnl !== undefined ? formatCurrency(pos.realizedPnl) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-500">
                No closed trades yet.
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {state?.lastError && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">Last Error</h3>
            <p className="text-red-800 dark:text-red-200 text-sm font-mono">{state.lastError}</p>
          </div>
        )}
      </main>
    </div>
  );
}
