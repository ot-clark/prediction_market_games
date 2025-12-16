'use client';

import { useEffect, useState } from 'react';
import type { CryptoBacktestResponse, BacktestResult, CalibrationBucket } from '@/types/crypto';

export default function CryptoBacktestDashboard() {
  const [data, setData] = useState<CryptoBacktestResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMethodology, setShowMethodology] = useState(false);

  const fetchData = async () => {
    try {
      setError(null);
      const response = await fetch('/api/crypto-backtest', { cache: 'no-store' });

      if (!response.ok) {
        throw new Error('Failed to fetch backtest data');
      }

      const result: CryptoBacktestResponse = await response.json();

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
  }, []);

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatBrier = (value: number) => {
    return value.toFixed(4);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-zinc-100 mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Running backtest analysis...</p>
          <p className="text-xs text-zinc-500 mt-2">Analyzing historical crypto markets...</p>
        </div>
      </div>
    );
  }

  const summary = data?.summary;
  const results = summary?.results || [];

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Backtest Results
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            {summary?.resolvedMarkets || 0} resolved markets analyzed
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowMethodology(!showMethodology)}
            className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors text-sm"
          >
            {showMethodology ? 'Hide' : 'Show'} Methodology
          </button>
          <button
            onClick={() => { setLoading(true); fetchData(); }}
            className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg border bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300 text-sm">
          <strong>Note:</strong> {error}
        </div>
      )}

      {showMethodology && data?.methodology && (
        <div className="mb-6 p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <div className="prose dark:prose-invert prose-sm max-w-none">
            <div className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap font-mono">
              {data.methodology}
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Z-Score Performance */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Z-Score Method</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-500 text-sm">Avg Brier Score:</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                {formatBrier(summary?.zscoreAvgBrier || 0)}
              </span>
            </div>
            <div className="text-xs text-zinc-500">
              (Lower is better. Random = 0.25)
            </div>
          </div>
        </div>

        {/* Deribit Performance */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Deribit IV Method</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-500 text-sm">Avg Brier Score:</span>
              <span className="font-mono font-bold text-green-600 dark:text-green-400">
                {formatBrier(summary?.deribitAvgBrier || 0)}
              </span>
            </div>
            <div className="text-xs text-zinc-500">
              (Uses options IV + 10% premium)
            </div>
          </div>
        </div>

        {/* Polymarket Performance */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Polymarket (Baseline)</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-500 text-sm">Avg Brier Score:</span>
              <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                {formatBrier(summary?.polymarketAvgBrier || 0)}
              </span>
            </div>
            <div className="text-xs text-zinc-500">
              (Crowd prediction accuracy)
            </div>
          </div>
        </div>
      </div>

      {/* Winner Announcement */}
      {summary && summary.resolvedMarkets > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mb-2">Backtest Winner</h3>
          <p className="text-zinc-700 dark:text-zinc-300">
            {getBestMethod(summary.zscoreAvgBrier, summary.deribitAvgBrier || Infinity, summary.polymarketAvgBrier)}
          </p>
        </div>
      )}

      {/* Calibration Charts */}
      {summary && summary.resolvedMarkets > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">Calibration Analysis</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <CalibrationChart 
              title="Z-Score Calibration" 
              buckets={summary.zscoreCalibration} 
              color="blue"
            />
            <CalibrationChart 
              title="Deribit IV Calibration" 
              buckets={summary.deribitCalibration || []} 
              color="green"
            />
            <CalibrationChart 
              title="Polymarket Calibration" 
              buckets={summary.polymarketCalibration} 
              color="purple"
            />
          </div>
        </div>
      )}

      {/* Individual Results Table */}
      {results.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Individual Market Results</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
                  <th className="text-left py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                    Market
                  </th>
                  <th className="text-center py-3 px-3 font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                    Outcome
                  </th>
                  <th className="text-center py-3 px-3 font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                    Z-Score Pred
                  </th>
                  <th className="text-center py-3 px-3 font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                    Deribit Pred
                  </th>
                  <th className="text-center py-3 px-3 font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                    Polymarket
                  </th>
                  <th className="text-center py-3 px-3 font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                    Best Pred
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, idx) => {
                  const bestPrediction = getBestPrediction(result);
                  return (
                    <tr 
                      key={idx}
                      className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/30"
                    >
                      <td className="py-3 px-4">
                        <div className="max-w-xs truncate text-sm">
                          {result.market.crypto} to ${result.market.targetPrice.toLocaleString()}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          result.actualOutcome 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {result.actualOutcome ? 'YES' : 'NO'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="font-mono text-sm">
                          {formatPercent(result.zscorePrediction)}
                        </div>
                        <div className="text-xs text-zinc-500">
                          Brier: {formatBrier(result.zscoreBrierScore)}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="font-mono text-sm">
                          {result.deribitPrediction !== undefined 
                            ? formatPercent(result.deribitPrediction) 
                            : 'N/A'}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {result.deribitBrierScore !== undefined 
                            ? `Brier: ${formatBrier(result.deribitBrierScore)}` 
                            : ''}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="font-mono text-sm">
                          {formatPercent(result.polymarketPrice)}
                        </div>
                        <div className="text-xs text-zinc-500">
                          Brier: {formatBrier(result.polymarketBrierScore)}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          bestPrediction === 'zscore' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            : bestPrediction === 'deribit'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                        }`}>
                          {bestPrediction === 'zscore' ? 'Z-Score' : bestPrediction === 'deribit' ? 'Deribit' : 'Polymarket'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {results.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <p className="text-zinc-600 dark:text-zinc-400">
            No resolved crypto price target markets found for backtesting.
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            This analysis requires historical resolved markets from Polymarket.
          </p>
        </div>
      )}

      <div className="mt-6 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm text-zinc-600 dark:text-zinc-400">
        <h4 className="font-semibold mb-2">Understanding Brier Scores</h4>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>0.00:</strong> Perfect prediction (always correct with 100% confidence)</li>
          <li><strong>0.25:</strong> Random guessing (50/50 on everything)</li>
          <li><strong>1.00:</strong> Worst possible (always wrong with 100% confidence)</li>
          <li>Lower scores indicate better calibrated predictions</li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Calibration Chart Component
 */
function CalibrationChart({ 
  title, 
  buckets, 
  color 
}: { 
  title: string; 
  buckets: CalibrationBucket[];
  color: 'blue' | 'green' | 'purple';
}) {
  const colorClasses = {
    blue: 'bg-blue-500 dark:bg-blue-400',
    green: 'bg-green-500 dark:bg-green-400',
    purple: 'bg-purple-500 dark:bg-purple-400',
  };

  const totalCount = buckets.reduce((sum, b) => sum + b.count, 0);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
      <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3">{title}</h4>
      <div className="space-y-2">
        {buckets.map((bucket, idx) => {
          const midpoint = (bucket.predictedRange[0] + bucket.predictedRange[1]) / 2;
          const deviation = bucket.count > 0 ? Math.abs(bucket.actualRate - midpoint) : 0;
          const isCalibrated = deviation < 0.15;

          return (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <span className="w-16 text-zinc-500">
                {(bucket.predictedRange[0] * 100).toFixed(0)}-{(bucket.predictedRange[1] * 100).toFixed(0)}%
              </span>
              <div className="flex-1 h-4 bg-zinc-100 dark:bg-zinc-800 rounded overflow-hidden relative">
                {/* Perfect calibration line */}
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-zinc-400 dark:bg-zinc-600"
                  style={{ left: `${midpoint * 100}%` }}
                />
                {/* Actual rate bar */}
                {bucket.count > 0 && (
                  <div 
                    className={`h-full ${colorClasses[color]} ${isCalibrated ? 'opacity-100' : 'opacity-60'}`}
                    style={{ width: `${bucket.actualRate * 100}%` }}
                  />
                )}
              </div>
              <span className="w-12 text-right text-zinc-500">
                n={bucket.count}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 text-xs text-zinc-500">
        Vertical line = expected rate. Bar = actual rate. 
        {totalCount > 0 ? ` Total predictions: ${totalCount}` : ' No data'}
      </div>
    </div>
  );
}

/**
 * Determine the best performing method
 */
function getBestMethod(zscoreBrier: number, deribitBrier: number, polymarketBrier: number): string {
  const scores = [
    { name: 'Z-Score', score: zscoreBrier },
    { name: 'Deribit IV', score: deribitBrier },
    { name: 'Polymarket', score: polymarketBrier },
  ].filter(s => s.score > 0 && s.score < Infinity);

  if (scores.length === 0) return 'Insufficient data to determine winner.';

  scores.sort((a, b) => a.score - b.score);
  const winner = scores[0];
  const runnerUp = scores[1];

  const improvement = runnerUp 
    ? ((runnerUp.score - winner.score) / runnerUp.score * 100).toFixed(1)
    : '0';

  return `${winner.name} performed best with Brier score ${winner.score.toFixed(4)}` +
    (runnerUp ? ` (${improvement}% better than ${runnerUp.name})` : '');
}

/**
 * Determine which method had the best prediction for a single market
 */
function getBestPrediction(result: BacktestResult): 'zscore' | 'deribit' | 'polymarket' {
  const scores = [
    { method: 'zscore' as const, score: result.zscoreBrierScore },
    { method: 'deribit' as const, score: result.deribitBrierScore ?? Infinity },
    { method: 'polymarket' as const, score: result.polymarketBrierScore },
  ];

  return scores.reduce((best, curr) => 
    curr.score < best.score ? curr : best
  ).method;
}
