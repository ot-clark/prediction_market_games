'use client';

import { useState } from 'react';
import Link from 'next/link';
import CryptoArbitrageDashboard from '@/components/CryptoArbitrageDashboard';
import CryptoBacktestDashboard from '@/components/CryptoBacktestDashboard';

type Tab = 'live' | 'backtest';

export default function CryptoArbitragePage() {
  const [activeTab, setActiveTab] = useState<Tab>('live');

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
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Crypto Options Arbitrage
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Compare Polymarket crypto bets vs options-implied probabilities
          </p>
        </div>

        {/* Concept Explanation */}
        <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <h2 className="font-bold text-amber-900 dark:text-amber-100 mb-2">The Arbitrage Concept</h2>
          <p className="text-amber-800 dark:text-amber-200 text-sm mb-3">
            Prediction markets like Polymarket price crypto targets (e.g., &quot;BTC hits $200k by Dec 2025&quot;) at some probability. 
            The options market implies a different probability based on volatility. When these differ significantly, there&apos;s an edge.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-white dark:bg-zinc-900 rounded p-3">
              <strong className="text-amber-900 dark:text-amber-100">Z-Score Method:</strong>
              <code className="block mt-1 text-zinc-600 dark:text-zinc-400 font-mono">
                z = ln(target/current) / (σ × √T)
                <br />
                P(above) = 1 - Φ(z)
              </code>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded p-3">
              <strong className="text-amber-900 dark:text-amber-100">One-Touch Rule:</strong>
              <code className="block mt-1 text-zinc-600 dark:text-zinc-400 font-mono">
                P(touch) ≈ 2 × P(settle above)
                <br />
                P(touch) ≈ 2 × Δ (option delta)
              </code>
            </div>
          </div>
          <p className="text-amber-700 dark:text-amber-300 text-xs mt-3 italic">
            Based on methodology from{' '}
            <a 
              href="https://moontower.substack.com/p/from-everything-computer-to-everything"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-amber-900 dark:hover:text-amber-100"
            >
              Moontower&apos;s &quot;Prediction Market Arbitrage&quot;
            </a>
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-zinc-200 dark:bg-zinc-800 p-1 rounded-lg mb-6 w-fit">
          <button
            onClick={() => setActiveTab('live')}
            className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all ${
              activeTab === 'live'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Live Scanner
          </button>
          <button
            onClick={() => setActiveTab('backtest')}
            className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all ${
              activeTab === 'backtest'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Backtest Results
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'live' && <CryptoArbitrageDashboard />}
        {activeTab === 'backtest' && <CryptoBacktestDashboard />}

        {/* Footer */}
        <div className="mt-8 p-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg text-sm text-zinc-600 dark:text-zinc-400">
          <h3 className="font-semibold mb-2">Data Sources</h3>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Polymarket:</strong> Crypto price target prediction markets via Gamma API</li>
            <li><strong>Deribit:</strong> BTC/ETH options implied volatility and delta (free public API)</li>
            <li><strong>CoinGecko:</strong> Current and historical crypto prices (free tier)</li>
          </ul>
          <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <p className="text-xs">
              <strong>Disclaimer:</strong> This tool is for educational purposes only. 
              Options-implied probabilities are approximations based on lognormal distribution assumptions.
              Always do your own research before trading.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
