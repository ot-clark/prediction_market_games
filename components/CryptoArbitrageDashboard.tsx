'use client';

import { useEffect, useState } from 'react';
import type { CryptoArbitrageResponse, ArbitrageOpportunity } from '@/types/crypto';

export default function CryptoArbitrageDashboard() {
  const [data, setData] = useState<CryptoArbitrageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const fetchData = async () => {
    try {
      setError(null);
      const response = await fetch('/api/crypto-arbitrage', { cache: 'no-store' });

      if (!response.ok) {
        throw new Error('Failed to fetch crypto arbitrage data');
      }

      const result: CryptoArbitrageResponse = await response.json();

      if (result.error) {
        setError(result.error);
      }

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatEdge = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${(value * 100).toFixed(1)}%`;
  };

  const formatPrice = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}k`;
    }
    return `$${value.toFixed(2)}`;
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getSignalBadge = (opp: ArbitrageOpportunity) => {
    const signal = opp.signal;
    const confidence = opp.confidence;

    const colorMap = {
      buy: {
        high: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        medium: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-500',
        low: 'bg-green-50/50 text-green-600 dark:bg-green-900/10 dark:text-green-600',
      },
      sell: {
        high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        medium: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-500',
        low: 'bg-red-50/50 text-red-600 dark:bg-red-900/10 dark:text-red-600',
      },
      neutral: {
        high: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
        medium: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
        low: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
      },
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colorMap[signal][confidence]}`}>
        {signal === 'buy' ? 'BUY' : signal === 'sell' ? 'SELL' : 'HOLD'}
        <span className="ml-1 opacity-75">({confidence})</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-zinc-100 mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Loading crypto arbitrage data...</p>
          <p className="text-xs text-zinc-500 mt-2">Fetching Polymarket, prices, and options data...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-xl mx-auto">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Error Loading Data
          </h3>
          <p className="text-red-700 dark:text-red-300">{error}</p>
          <button
            onClick={() => { setLoading(true); fetchData(); }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const opportunities = data?.opportunities || [];

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Live Arbitrage Scanner
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            {opportunities.length} crypto price target markets • {data?.supportedCryptos?.length || 0} cryptos tracked
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchData(); }}
          className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg border bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300 text-sm">
          <strong>Warning:</strong> {error}
        </div>
      )}

      {opportunities.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <p className="text-zinc-600 dark:text-zinc-400">
            No crypto price target markets found on Polymarket.
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Try refreshing or check back later for new markets.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b-2 border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
                  <th className="w-8 py-4 px-2"></th>
                  <th className="text-left py-4 px-4 font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                    Market
                  </th>
                  <th className="text-center py-4 px-3 font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                    Polymarket
                  </th>
                  <th className="text-center py-4 px-3 font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                    Z-Score
                  </th>
                  <th className="text-center py-4 px-3 font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                    Deribit
                  </th>
                  <th className="text-center py-4 px-3 font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                    Edge
                  </th>
                  <th className="text-center py-4 px-3 font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                    Signal
                  </th>
                </tr>
              </thead>
              <tbody>
                {opportunities.map((opp) => {
                  const isExpanded = expandedRows.has(opp.market.id);
                  const primaryEdge = opp.edgeVsDeribit ?? opp.edgeVsZscore;

                  return (
                    <>
                      <tr
                        key={opp.market.id}
                        onClick={() => toggleRow(opp.market.id)}
                        className={`border-b border-zinc-200 dark:border-zinc-800 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors ${
                          isExpanded ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                        }`}
                      >
                        <td className="py-4 px-2 text-center">
                          <span className={`inline-block transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                            ▶
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="max-w-md">
                            <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm truncate">
                              {opp.market.crypto} to {formatPrice(opp.market.targetPrice)}
                            </div>
                            <div className="text-xs text-zinc-500 mt-1">
                              by {formatDate(opp.market.expiryDate)} • {opp.market.betType === 'one-touch' ? 'Touch' : 'Settle'} {opp.market.direction}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-3 text-center">
                          <span className="font-mono text-sm font-medium">
                            {formatPercent(opp.polymarketProb)}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-center">
                          <span className="font-mono text-sm">
                            {formatPercent(opp.zscoreProb.probability)}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-center">
                          {opp.deribitProb ? (
                            <span className="font-mono text-sm">
                              {formatPercent(opp.deribitProb.probability)}
                            </span>
                          ) : (
                            <span className="text-zinc-400 text-xs">N/A</span>
                          )}
                        </td>
                        <td className="py-4 px-3 text-center">
                          <span className={`font-mono text-sm font-bold ${
                            Math.abs(primaryEdge) > 0.1
                              ? primaryEdge > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                              : Math.abs(primaryEdge) > 0.05
                              ? primaryEdge > 0 ? 'text-red-500' : 'text-green-500'
                              : 'text-zinc-600 dark:text-zinc-400'
                          }`}>
                            {formatEdge(primaryEdge)}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-center">
                          {getSignalBadge(opp)}
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr key={`${opp.market.id}-expanded`} className="bg-zinc-50 dark:bg-zinc-900/50">
                          <td colSpan={7} className="py-4 px-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                              {/* Market Info */}
                              <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
                                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
                                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                  Market Details
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <span className="text-zinc-500">Question:</span>
                                    <p className="text-zinc-900 dark:text-zinc-100">{opp.market.question}</p>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-zinc-500">Current Price:</span>
                                    <span className="font-mono">{formatPrice(opp.currentPrice.price)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-zinc-500">Target Price:</span>
                                    <span className="font-mono">{formatPrice(opp.market.targetPrice)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-zinc-500">Distance:</span>
                                    <span className="font-mono">
                                      {formatPercent((opp.market.targetPrice - opp.currentPrice.price) / opp.currentPrice.price)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-zinc-500">Expiry:</span>
                                    <span>{formatDate(opp.market.expiryDate)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-zinc-500">Bet Type:</span>
                                    <span className="capitalize">{opp.market.betType}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Edge Analysis */}
                              <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
                                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
                                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                  Edge Analysis
                                </h4>
                                <div className="space-y-3 text-sm">
                                  <div className="flex justify-between items-center">
                                    <span className="text-zinc-500">Polymarket:</span>
                                    <span className="font-mono font-bold">{formatPercent(opp.polymarketProb)}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-zinc-500">Z-Score Model:</span>
                                    <span className="font-mono">{formatPercent(opp.zscoreProb.probability)}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-zinc-500">Edge vs Z-Score:</span>
                                    <span className={`font-mono font-bold ${
                                      opp.edgeVsZscore > 0 ? 'text-red-600' : 'text-green-600'
                                    }`}>
                                      {formatEdge(opp.edgeVsZscore)}
                                    </span>
                                  </div>
                                  {opp.deribitProb && (
                                    <>
                                      <hr className="border-zinc-200 dark:border-zinc-700" />
                                      <div className="flex justify-between items-center">
                                        <span className="text-zinc-500">Deribit Model:</span>
                                        <span className="font-mono">{formatPercent(opp.deribitProb.probability)}</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-zinc-500">Edge vs Deribit:</span>
                                        <span className={`font-mono font-bold ${
                                          (opp.edgeVsDeribit || 0) > 0 ? 'text-red-600' : 'text-green-600'
                                        }`}>
                                          {formatEdge(opp.edgeVsDeribit || 0)}
                                        </span>
                                      </div>
                                    </>
                                  )}
                                  <hr className="border-zinc-200 dark:border-zinc-700" />
                                  <div className="p-2 rounded bg-zinc-100 dark:bg-zinc-900">
                                    <p className="text-xs">
                                      <strong>Interpretation:</strong>{' '}
                                      {opp.signal === 'buy' 
                                        ? 'Polymarket is UNDERPRICED. Buy YES on Polymarket.'
                                        : opp.signal === 'sell'
                                        ? 'Polymarket is OVERPRICED. Sell YES / Buy NO on Polymarket.'
                                        : 'No significant edge. Stay neutral.'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Math Breakdowns - Full Width */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {/* Z-Score Math */}
                              <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
                                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
                                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                  Z-Score Model
                                </h4>
                                <div className="text-xs text-zinc-500 mb-2">
                                  Uses {opp.volatility.source === 'deribit' ? 'Deribit ATM IV' : 'default volatility'}: <strong>{formatPercent(opp.zscoreProb.volatilityUsed)}</strong>
                                </div>
                                <div className="text-xs font-mono bg-zinc-100 dark:bg-zinc-900 rounded p-3 overflow-x-auto max-h-64 overflow-y-auto">
                                  <pre className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                                    {opp.zscoreProb.mathBreakdown.steps.join('\n')}
                                  </pre>
                                </div>
                              </div>

                              {/* Deribit Math */}
                              <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
                                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
                                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                  Deribit Model
                                </h4>
                                {opp.deribitProb ? (
                                  <>
                                    <div className="text-xs text-zinc-500 mb-2">
                                      Uses strike-specific IV from options chain: <strong>{formatPercent(opp.deribitProb.volatilityUsed)}</strong>
                                    </div>
                                    <div className="text-xs font-mono bg-zinc-100 dark:bg-zinc-900 rounded p-3 overflow-x-auto max-h-64 overflow-y-auto">
                                      <pre className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                                        {opp.deribitProb.mathBreakdown.steps.join('\n')}
                                      </pre>
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-sm text-zinc-500">
                                    Deribit options data not available for {opp.market.crypto}.
                                    Only BTC and ETH are supported.
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
        <div>
          Prices from CoinGecko • Options data from Deribit • Markets from Polymarket
        </div>
        <div className="mt-1">
          Edge = Polymarket Price - Model Probability • 
          <span className="text-green-600 dark:text-green-400 mx-1">Negative edge = BUY</span> • 
          <span className="text-red-600 dark:text-red-400 mx-1">Positive edge = SELL</span>
        </div>
      </div>
    </div>
  );
}
