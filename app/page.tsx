'use client';

import { useState } from 'react';
import Link from 'next/link';
import MarketDashboard from '@/components/MarketDashboard';
import ArbitrageDashboard from '@/components/ArbitrageDashboard';

type Tab = 'markets' | 'arbitrage';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('markets');

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
        {/* Tab Navigation */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex gap-1 bg-zinc-200 dark:bg-zinc-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('markets')}
              className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'markets'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              All Markets
            </button>
            <button
              onClick={() => setActiveTab('arbitrage')}
              className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'arbitrage'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Sports Arbitrage
            </button>
          </div>
          
          {/* Crypto Arbitrage Link */}
          <Link
            href="/crypto-arbitrage"
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
          >
            Crypto Arbitrage
          </Link>
          
          {/* Paper Trading Link */}
          <Link
            href="/paper-trading"
            className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
          >
            Paper Trading
          </Link>
          
          {/* Market Making Link */}
          <Link
            href="/market-making"
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
          >
            Market Making Practice
          </Link>
        </div>

        {/* Tab Content */}
        {activeTab === 'markets' && <MarketDashboard />}
        {activeTab === 'arbitrage' && <ArbitrageDashboard />}
      </main>
    </div>
  );
}
