'use client';

import { useEffect, useState } from 'react';
import type { ArbitrageOpportunity } from '@/types/sportsbook';

interface ArbitrageApiResponse {
  opportunities: ArbitrageOpportunity[];
  totalPolymarketSports: number;
  totalSportsbookEvents: number;
  matchedEvents: number;
  error?: string;
}

export default function ArbitrageDashboard() {
  const [data, setData] = useState<ArbitrageApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const fetchData = async () => {
    try {
      setError(null);
      const response = await fetch('/api/arbitrage', { cache: 'no-store' });
      
      if (!response.ok) {
        throw new Error('Failed to fetch arbitrage data');
      }

      const result: ArbitrageApiResponse = await response.json();
      
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
    // Auto-refresh disabled by default to conserve API credits
    // Each refresh uses 4 credits (one per sport: NFL, NBA, NCAAB, NHL)
    // Enable auto-refresh only if you have a paid plan with sufficient credits
    // To enable: change DISABLE_AUTO_REFRESH to false below
    const DISABLE_AUTO_REFRESH = true; // Set to false to enable auto-refresh
    
    if (!DISABLE_AUTO_REFRESH) {
      // Refresh every 60 minutes (1 hour) = 4 credits/hour = 96 credits/day = ~2,880/month
      // Still exceeds free tier (500/month), so manual refresh recommended for free tier
      const interval = setInterval(fetchData, 3600000); // 60 minutes
      return () => clearInterval(interval);
    }
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
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const formatOdds = (odds: number) => {
    if (odds >= 0) return `+${odds}`;
    return odds.toString();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-zinc-100 mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Loading arbitrage data...</p>
          <p className="text-xs text-zinc-500 mt-2">Fetching Polymarket & sportsbook odds...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="text-center py-12">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 max-w-xl mx-auto">
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Configuration Required
          </h3>
          <p className="text-yellow-700 dark:text-yellow-300 mb-4">{error}</p>
          <div className="text-left bg-white dark:bg-zinc-900 rounded p-4 text-sm">
            <p className="font-medium mb-2">To enable sportsbook comparison:</p>
            <ol className="list-decimal list-inside space-y-2 text-zinc-600 dark:text-zinc-400">
              <li>Sign up for a free API key at <a href="https://the-odds-api.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">the-odds-api.com</a></li>
              <li>Create a <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">.env.local</code> file in your project root</li>
              <li>Add: <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">ODDS_API_KEY=your_api_key</code></li>
              <li>Restart the dev server</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  const opportunities = data?.opportunities || [];

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Sports Arbitrage Scanner
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            {data?.matchedEvents || 0} matched events • {data?.totalPolymarketSports || 0} Polymarket sports • {data?.totalSportsbookEvents || 0} sportsbook events
            {data?.remainingCredits !== undefined && (
              <span className="ml-2 text-xs">
                • {data.remainingCredits} API credits remaining
              </span>
            )}
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
        <div className={`mb-4 p-4 rounded-lg border text-sm ${
          error.includes('Out of API credits') || error.includes('credits')
            ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300'
            : error.includes('401') || error.includes('Invalid API key') || error.includes('Unauthorized')
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
            : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300'
        }`}>
          <div className="font-semibold mb-2">
            {error.includes('Out of API credits') ? 'Out of Credits' : 
             error.includes('401') || error.includes('Invalid API key') ? 'API Key Error' : 
             'Error'}
          </div>
          <div>{error}</div>
          {error.includes('Out of API credits') && (
            <div className="mt-3 pt-3 border-t border-orange-200 dark:border-orange-800">
              <p className="font-medium mb-2">Options:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Upgrade to a paid plan at <a href="https://the-odds-api.com/pricing" target="_blank" rel="noopener noreferrer" className="underline">the-odds-api.com/pricing</a></li>
                <li>Wait for monthly credit reset (free tier: 500 credits/month)</li>
                <li>Use a different API key with remaining credits</li>
              </ul>
            </div>
          )}
          {(error.includes('401') || error.includes('Invalid API key')) && !error.includes('credits') && (
            <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-800">
              <p className="font-medium mb-2">To fix this:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Verify your API key at <a href="https://the-odds-api.com" target="_blank" rel="noopener noreferrer" className="underline">the-odds-api.com</a></li>
                <li>Check that <code className="bg-red-100 dark:bg-red-900/50 px-1 rounded">ODDS_API_KEY</code> is set in <code className="bg-red-100 dark:bg-red-900/50 px-1 rounded">.env.local</code></li>
                <li>Ensure the key is valid and has remaining credits</li>
                <li>Restart your dev server after updating the key</li>
              </ol>
            </div>
          )}
        </div>
      )}

      {opportunities.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <p className="text-zinc-600 dark:text-zinc-400">
            No matched sports events found. This could mean:
          </p>
          <ul className="mt-4 text-sm text-zinc-500 space-y-1">
            <li>• No overlapping events between Polymarket and sportsbooks</li>
            <li>• Polymarket sports markets use different naming</li>
            <li>• Games have already started or completed</li>
          </ul>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b-2 border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
                  <th className="w-8 py-4 px-2"></th>
                  <th className="text-left py-4 px-4 font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                    Event
                  </th>
                  <th className="text-left py-4 px-4 font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                    Start Time
                  </th>
                  <th className="text-center py-4 px-4 font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                    Match Conf.
                  </th>
                  <th className="text-center py-4 px-4 font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                    Max Edge
                  </th>
                </tr>
              </thead>
              <tbody>
                {opportunities.map((opp) => {
                  const isExpanded = expandedRows.has(opp.polymarketEvent.id);
                  const maxEdge = Math.max(...opp.comparison.map(c => c.edgePercent));
                  const minEdge = Math.min(...opp.comparison.map(c => c.edgePercent));
                  const displayEdge = Math.abs(maxEdge) > Math.abs(minEdge) ? maxEdge : minEdge;

                  return (
                    <>
                      <tr
                        key={opp.polymarketEvent.id}
                        onClick={() => toggleRow(opp.polymarketEvent.id)}
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
                          <div>
                            <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                              {opp.sportsbookEvent.eventName}
                            </div>
                            <div className="text-xs text-zinc-500 mt-1">
                              {opp.sportsbookEvent.sportTitle}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-zinc-600 dark:text-zinc-400">
                          {formatDate(opp.sportsbookEvent.commenceTime)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            opp.matchConfidence >= 0.8
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : opp.matchConfidence >= 0.6
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {(opp.matchConfidence * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`text-sm font-bold ${
                            displayEdge > 5
                              ? 'text-green-600 dark:text-green-400'
                              : displayEdge < -5
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-zinc-600 dark:text-zinc-400'
                          }`}>
                            {formatPercent(displayEdge)}
                          </span>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr key={`${opp.polymarketEvent.id}-expanded`} className="bg-zinc-50 dark:bg-zinc-900/50">
                          <td colSpan={5} className="py-4 px-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Polymarket Side */}
                              <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
                                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
                                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                  Polymarket
                                </h4>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                                  {opp.polymarketEvent.question}
                                </p>
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="text-xs text-zinc-500 border-b border-zinc-200 dark:border-zinc-700">
                                      <th className="text-left py-2">Outcome</th>
                                      <th className="text-right py-2">Price</th>
                                      <th className="text-right py-2">Bid</th>
                                      <th className="text-right py-2">Ask</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {opp.comparison.map((comp, idx) => (
                                      <tr key={idx} className="border-b border-zinc-100 dark:border-zinc-800">
                                        <td className="py-2 font-medium">{comp.outcome}</td>
                                        <td className="py-2 text-right">{(comp.polymarketPrice * 100).toFixed(1)}%</td>
                                        <td className="py-2 text-right text-green-600 dark:text-green-400">
                                          {comp.polymarketBid ? (comp.polymarketBid * 100).toFixed(1) + '%' : 'N/A'}
                                        </td>
                                        <td className="py-2 text-right text-red-600 dark:text-red-400">
                                          {comp.polymarketAsk ? (comp.polymarketAsk * 100).toFixed(1) + '%' : 'N/A'}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              {/* Sportsbook Side */}
                              <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
                                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
                                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                  Pinnacle Sportsbook
                                </h4>
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="text-xs text-zinc-500 border-b border-zinc-200 dark:border-zinc-700">
                                      <th className="text-left py-2">Outcome</th>
                                      <th className="text-right py-2">Implied %</th>
                                      <th className="text-right py-2">Odds</th>
                                      <th className="text-right py-2">Edge</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {opp.comparison.map((comp, idx) => (
                                      <tr key={idx} className="border-b border-zinc-100 dark:border-zinc-800">
                                        <td className="py-2 font-medium">{comp.outcome}</td>
                                        <td className="py-2 text-right">{(comp.bestSportsbookProb * 100).toFixed(1)}%</td>
                                        <td className="py-2 text-right font-mono">{formatOdds(comp.bestSportsbookOdds)}</td>
                                        <td className={`py-2 text-right font-bold ${
                                          comp.edgePercent > 3
                                            ? 'text-green-600 dark:text-green-400'
                                            : comp.edgePercent < -3
                                            ? 'text-red-600 dark:text-red-400'
                                            : 'text-zinc-600 dark:text-zinc-400'
                                        }`}>
                                          {formatPercent(comp.edgePercent)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Edge Explanation */}
                            <div className="mt-4 p-3 bg-zinc-100 dark:bg-zinc-800 rounded text-xs text-zinc-600 dark:text-zinc-400">
                              <strong>Edge</strong> = Polymarket Price - Pinnacle Implied Probability. 
                              <span className="text-green-600 dark:text-green-400 ml-2">Positive edge</span> = Polymarket overpriced (bet Pinnacle).
                              <span className="text-red-600 dark:text-red-400 ml-2">Negative edge</span> = Polymarket underpriced (buy Polymarket).
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
        <div>Data from Polymarket and Pinnacle Sportsbook (via The Odds API) • Edge = Polymarket - Pinnacle implied probability</div>
        <div className="mt-1">
          Credits optimized: Only fetches sportsbook odds for sports that have Polymarket matches. Manual refresh only.
        </div>
      </div>
    </div>
  );
}
