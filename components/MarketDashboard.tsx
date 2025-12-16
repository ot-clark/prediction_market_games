'use client';

import { useEffect, useState, useCallback } from 'react';
import { PolymarketMarket } from '@/types/polymarket';
import MarketsTable from './MarketsTable';

export default function MarketDashboard() {
  const [markets, setMarkets] = useState<PolymarketMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [limit, setLimit] = useState(200); // Default to 200 markets

  const fetchMarkets = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`/api/markets?limit=${limit}&active=true`, {
        cache: 'no-store',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch markets');
      }

      const data = await response.json();
      const fetchedMarkets = data.data || [];
      setMarkets(fetchedMarkets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching markets:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchMarkets();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchMarkets, 60000);
    return () => clearInterval(interval);
  }, [fetchMarkets]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMarkets();
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setLoading(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-zinc-100 mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Loading markets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Polymarket Dashboard
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            {markets.length} active markets • Click any row to expand outcomes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={limit}
            onChange={(e) => handleLimitChange(Number(e.target.value))}
            className="px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={50}>50 markets</option>
            <option value={100}>100 markets</option>
            <option value={200}>200 markets</option>
            <option value={500}>500 markets</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <MarketsTable markets={markets} />
      </div>
      
      <div className="mt-4 text-center text-xs text-zinc-500 dark:text-zinc-500">
        Bid/Ask shown for primary outcome [in brackets] • Spread = Ask - Bid • Click rows to see all outcomes • Auto-refresh every 60s
      </div>
    </div>
  );
}
