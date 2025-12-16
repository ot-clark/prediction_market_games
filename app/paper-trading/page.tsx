'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { BotState, Position, Trade } from '@/types/trading';

interface BotStatusResponse {
  state: BotState;
  lastUpdated: string;
  message?: string;
  stats?: {
    totalUnrealizedPnl: number;
    totalExposure: number;
    availableBalance: number;
    totalEquity: number;
  };
}

export default function PaperTradingPage() {
  const [data, setData] = useState<BotStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'positions' | 'trades'>('overview');

  const fetchData = async () => {
    try {
      setError(null);
      const response = await fetch('/api/bot/status', { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to fetch bot status');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset the bot? This will clear all positions and history.')) {
      return;
    }
    
    try {
      const response = await fetch('/api/bot/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startingBalance: 1000 }),
      });
      
      if (!response.ok) throw new Error('Failed to reset bot');
      
      await fetchData();
      alert('Bot reset successfully!');
    } catch (err) {
      alert('Failed to reset bot: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds
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
                Paper Trading Bot
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                Automated crypto arbitrage trading with $1,000 paper money
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
              >
                Refresh
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reset Bot
              </button>
            </div>
          </div>
        </div>

        {data?.message && !state?.isRunning && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">Bot Not Running</h3>
            <p className="text-amber-800 dark:text-amber-200 text-sm mb-3">{data.message}</p>
            <div className="bg-zinc-900 dark:bg-black rounded p-3 font-mono text-sm text-green-400">
              <p>$ cd {'{project-root}'}</p>
              <p>$ npx ts-node bot/trading-bot.ts</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
            <div className="text-sm text-zinc-500 mb-1">Total Equity</div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {formatCurrency(stats?.totalEquity || state?.currentBalance || 1000)}
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
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
            <div className="text-sm text-zinc-500 mb-1">Unrealized P&L</div>
            <div className={`text-2xl font-bold ${
              (stats?.totalUnrealizedPnl || 0) >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {formatCurrency(stats?.totalUnrealizedPnl || 0)}
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
            <div className="text-sm text-zinc-500 mb-1">Win Rate</div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {formatPercent(state?.winRate || 0)}
            </div>
            <div className="text-xs text-zinc-500">
              {state?.winningTrades || 0}W / {state?.losingTrades || 0}L
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 text-center">
            <div className="text-xs text-zinc-500">Available</div>
            <div className="font-bold text-zinc-900 dark:text-zinc-100">
              {formatCurrency(state?.currentBalance || 1000)}
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 text-center">
            <div className="text-xs text-zinc-500">Exposure</div>
            <div className="font-bold text-zinc-900 dark:text-zinc-100">
              {formatCurrency(stats?.totalExposure || 0)}
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 text-center">
            <div className="text-xs text-zinc-500">Open Positions</div>
            <div className="font-bold text-zinc-900 dark:text-zinc-100">
              {state?.openPositions?.length || 0}
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 text-center">
            <div className="text-xs text-zinc-500">Total Trades</div>
            <div className="font-bold text-zinc-900 dark:text-zinc-100">
              {state?.totalTrades || 0}
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 text-center">
            <div className="text-xs text-zinc-500">Status</div>
            <div className={`font-bold ${state?.isRunning ? 'text-green-600' : 'text-red-600'}`}>
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
            Positions ({state?.openPositions?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('trades')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'trades'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Trade History ({state?.trades?.length || 0})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Bot Configuration</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-zinc-500">Starting Balance</div>
                <div className="font-mono">${state?.config?.startingBalance || 1000}</div>
              </div>
              <div>
                <div className="text-sm text-zinc-500">Min Edge to Enter</div>
                <div className="font-mono">{((state?.config?.minEdgeToEnter || 0.05) * 100).toFixed(0)}%</div>
              </div>
              <div>
                <div className="text-sm text-zinc-500">Max Edge to Exit</div>
                <div className="font-mono">{((state?.config?.maxEdgeToExit || 0.05) * 100).toFixed(0)}%</div>
              </div>
              <div>
                <div className="text-sm text-zinc-500">Base Position Size</div>
                <div className="font-mono">${state?.config?.basePositionSize || 25}</div>
              </div>
              <div>
                <div className="text-sm text-zinc-500">Max Position Size</div>
                <div className="font-mono">${state?.config?.maxPositionSize || 100}</div>
              </div>
              <div>
                <div className="text-sm text-zinc-500">Max Total Exposure</div>
                <div className="font-mono">${state?.config?.maxTotalExposure || 500}</div>
              </div>
              <div>
                <div className="text-sm text-zinc-500">Poll Interval</div>
                <div className="font-mono">{(state?.config?.pollIntervalMs || 60000) / 1000}s</div>
              </div>
              <div>
                <div className="text-sm text-zinc-500">Min Days to Expiry</div>
                <div className="font-mono">{state?.config?.minTimeToExpiry || 1} day(s)</div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Position Sizing Formula</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 font-mono">
                Size = Base (${state?.config?.basePositionSize || 25}) + (Edge × Multiplier ({state?.config?.edgeMultiplier || 500}))
              </p>
              <p className="text-xs text-zinc-500 mt-2">
                Example: 10% edge = ${state?.config?.basePositionSize || 25} + (0.10 × {state?.config?.edgeMultiplier || 500}) = ${(state?.config?.basePositionSize || 25) + (0.10 * (state?.config?.edgeMultiplier || 500))}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'positions' && (
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            {state?.openPositions && state.openPositions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
                      <th className="text-left py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100 text-sm">Market</th>
                      <th className="text-center py-3 px-3 font-bold text-zinc-900 dark:text-zinc-100 text-sm">Side</th>
                      <th className="text-center py-3 px-3 font-bold text-zinc-900 dark:text-zinc-100 text-sm">Entry</th>
                      <th className="text-center py-3 px-3 font-bold text-zinc-900 dark:text-zinc-100 text-sm">Current</th>
                      <th className="text-center py-3 px-3 font-bold text-zinc-900 dark:text-zinc-100 text-sm">Size</th>
                      <th className="text-center py-3 px-3 font-bold text-zinc-900 dark:text-zinc-100 text-sm">P&L</th>
                      <th className="text-center py-3 px-3 font-bold text-zinc-900 dark:text-zinc-100 text-sm">Edge</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.openPositions.map((pos) => (
                      <tr key={pos.id} className="border-b border-zinc-100 dark:border-zinc-800">
                        <td className="py-3 px-4">
                          <div className="max-w-xs">
                            <div className="text-sm font-medium truncate">{pos.marketQuestion}</div>
                            <div className="text-xs text-zinc-500">{pos.crypto} • Expires {formatDate(pos.expiryDate)}</div>
                          </div>
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
                          {formatPercent(pos.currentPrice)}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-sm">
                          {formatCurrency(pos.size)}
                        </td>
                        <td className={`py-3 px-3 text-center font-mono text-sm font-bold ${
                          (pos.unrealizedPnl || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(pos.unrealizedPnl || 0)}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-sm">
                          {formatPercent(pos.currentEdge)}
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

        {activeTab === 'trades' && (
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            {state?.trades && state.trades.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
                      <th className="text-left py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100 text-sm">Time</th>
                      <th className="text-center py-3 px-3 font-bold text-zinc-900 dark:text-zinc-100 text-sm">Action</th>
                      <th className="text-center py-3 px-3 font-bold text-zinc-900 dark:text-zinc-100 text-sm">Side</th>
                      <th className="text-center py-3 px-3 font-bold text-zinc-900 dark:text-zinc-100 text-sm">Price</th>
                      <th className="text-center py-3 px-3 font-bold text-zinc-900 dark:text-zinc-100 text-sm">Size</th>
                      <th className="text-center py-3 px-3 font-bold text-zinc-900 dark:text-zinc-100 text-sm">Edge</th>
                      <th className="text-center py-3 px-3 font-bold text-zinc-900 dark:text-zinc-100 text-sm">P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...state.trades].reverse().map((trade) => (
                      <tr key={trade.id} className="border-b border-zinc-100 dark:border-zinc-800">
                        <td className="py-3 px-4 text-sm">
                          {formatDate(trade.timestamp)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            trade.action === 'open'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400'
                          }`}>
                            {trade.action.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`text-xs font-medium ${
                            trade.side === 'long' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {trade.side.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-sm">
                          {formatPercent(trade.price)}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-sm">
                          {formatCurrency(trade.size)}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-sm">
                          {formatPercent(trade.edge)}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-sm">
                          {trade.pnl !== undefined ? (
                            <span className={trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {formatCurrency(trade.pnl)}
                            </span>
                          ) : (
                            <span className="text-zinc-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-500">
                No trades yet. The bot will record trades here when it opens and closes positions.
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg text-sm text-zinc-600 dark:text-zinc-400">
          <h4 className="font-semibold mb-2">How to Run 24/7</h4>
          <div className="space-y-2 font-mono text-xs">
            <p>1. Install PM2 globally: <code className="bg-zinc-200 dark:bg-zinc-800 px-1 rounded">npm install -g pm2</code></p>
            <p>2. Start the bot: <code className="bg-zinc-200 dark:bg-zinc-800 px-1 rounded">pm2 start bot/trading-bot.ts --interpreter ./node_modules/.bin/ts-node --name "paper-trader"</code></p>
            <p>3. View logs: <code className="bg-zinc-200 dark:bg-zinc-800 px-1 rounded">pm2 logs paper-trader</code></p>
            <p>4. Stop: <code className="bg-zinc-200 dark:bg-zinc-800 px-1 rounded">pm2 stop paper-trader</code></p>
            <p>5. Auto-start on reboot: <code className="bg-zinc-200 dark:bg-zinc-800 px-1 rounded">pm2 startup && pm2 save</code></p>
          </div>
        </div>
      </main>
    </div>
  );
}
