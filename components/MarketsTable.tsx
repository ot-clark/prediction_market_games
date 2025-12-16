'use client';

import { useState } from 'react';
import { PolymarketMarket } from '@/types/polymarket';

interface MarketsTableProps {
  markets: PolymarketMarket[];
}

export default function MarketsTable({ markets }: MarketsTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

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

  const formatPrice = (price: number | string | undefined) => {
    if (price === undefined || price === null || price === '') return 'N/A';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return 'N/A';
    return (numPrice * 100).toFixed(1) + '¢';
  };

  const formatSpread = (spread: number | string | undefined) => {
    if (spread === undefined || spread === null || spread === '') return 'N/A';
    const numSpread = typeof spread === 'string' ? parseFloat(spread) : spread;
    if (isNaN(numSpread)) return 'N/A';
    return (numSpread * 100).toFixed(2) + '¢';
  };

  const formatCurrency = (value: string | undefined) => {
    if (!value) return 'N/A';
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'N/A';
    if (numValue >= 1000000) {
      return '$' + (numValue / 1000000).toFixed(2) + 'M';
    }
    if (numValue >= 1000) {
      return '$' + (numValue / 1000).toFixed(1) + 'K';
    }
    return '$' + numValue.toFixed(0);
  };

  const formatDate = (dateISO: string | undefined) => {
    if (!dateISO) return 'N/A';
    try {
      const date = new Date(dateISO);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  // Get bid/ask/spread for the primary outcome (first token, usually "Yes")
  // For binary markets: use cross-token calculation when direct bid/ask unavailable
  const getMarketBidAskSpread = (market: PolymarketMarket) => {
    if (!market.tokens) {
      return { bid: undefined, ask: undefined, spread: undefined };
    }

    const tokenEntries = Object.entries(market.tokens);
    if (tokenEntries.length === 0) {
      return { bid: undefined, ask: undefined, spread: undefined };
    }

    // For binary markets, show bid/ask for the first outcome
    const [primaryName, primaryToken] = tokenEntries[0];
    const [secondaryName, secondaryToken] = tokenEntries.length > 1 ? tokenEntries[1] : [null, null];

    let bid: number | undefined;
    let ask: number | undefined;

    // Primary token's direct bid
    if (primaryToken.bid) {
      bid = parseFloat(primaryToken.bid);
    }
    // Primary token's direct ask
    if (primaryToken.ask) {
      ask = parseFloat(primaryToken.ask);
    }

    // For binary markets, use cross-token calculation if direct values unavailable
    if (tokenEntries.length === 2 && secondaryToken) {
      // If no bid on primary, bid ≈ 1 - ask on secondary (selling primary = buying secondary)
      if (bid === undefined && secondaryToken.ask) {
        bid = 1 - parseFloat(secondaryToken.ask);
      }
      // If no ask on primary, ask ≈ 1 - bid on secondary (buying primary = selling secondary)
      if (ask === undefined && secondaryToken.bid) {
        ask = 1 - parseFloat(secondaryToken.bid);
      }
    }

    // Calculate spread
    const spread = (bid !== undefined && ask !== undefined) ? (ask - bid) : undefined;

    return {
      bid: bid !== undefined ? bid.toFixed(4) : undefined,
      ask: ask !== undefined ? ask.toFixed(4) : undefined,
      spread: spread !== undefined && spread >= 0 ? spread.toFixed(4) : undefined,
      primaryOutcome: primaryName,
    };
  };

  if (markets.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-600 dark:text-zinc-400">No markets to display</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-[1400px]">
        <thead>
          <tr className="border-b-2 border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
            <th className="w-8 py-4 px-2"></th>
            <th className="text-left py-4 px-4 font-bold text-zinc-900 dark:text-zinc-100 text-sm">
              Event Name
            </th>
            <th className="text-right py-4 px-4 font-bold text-zinc-900 dark:text-zinc-100 text-sm">
              Bid
            </th>
            <th className="text-right py-4 px-4 font-bold text-zinc-900 dark:text-zinc-100 text-sm">
              Ask
            </th>
            <th className="text-right py-4 px-4 font-bold text-zinc-900 dark:text-zinc-100 text-sm">
              Spread
            </th>
            <th className="text-right py-4 px-4 font-bold text-zinc-900 dark:text-zinc-100 text-sm">
              24h Vol
            </th>
            <th className="text-right py-4 px-4 font-bold text-zinc-900 dark:text-zinc-100 text-sm">
              Total Vol
            </th>
            <th className="text-right py-4 px-4 font-bold text-zinc-900 dark:text-zinc-100 text-sm">
              Liquidity
            </th>
            <th className="text-left py-4 px-4 font-bold text-zinc-900 dark:text-zinc-100 text-sm">
              End Date
            </th>
            <th className="text-left py-4 px-4 font-bold text-zinc-900 dark:text-zinc-100 text-sm">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {markets.map((market) => {
            const { bid, ask, spread, primaryOutcome } = getMarketBidAskSpread(market);
            const isExpanded = expandedRows.has(market.id);
            const hasTokens = market.tokens && Object.keys(market.tokens).length > 0;
            
            return (
              <>
                <tr
                  key={market.id}
                  onClick={() => hasTokens && toggleRow(market.id)}
                  className={`border-b border-zinc-200 dark:border-zinc-800 transition-colors ${
                    hasTokens ? 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/30' : ''
                  } ${isExpanded ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                >
                  <td className="py-4 px-2 text-center">
                    {hasTokens && (
                      <span className={`inline-block transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                        ▶
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="max-w-md">
                      <a
                        href={market.slug ? `https://polymarket.com/event/${market.slug}` : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {market.question || 'Untitled Market'}
                      </a>
                      {primaryOutcome && (
                        <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-500 capitalize">
                          [{primaryOutcome.replace(/-/g, ' ')}]
                        </span>
                      )}
                      {market.outcomes && market.outcomes.length > 2 && (
                        <span className="ml-1 text-xs text-zinc-400 dark:text-zinc-600">
                          ({market.outcomes.length} outcomes)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {formatPrice(bid)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {formatPrice(ask)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className={`text-sm font-semibold ${
                      spread && parseFloat(spread) < 0.05 
                        ? 'text-green-600 dark:text-green-400' 
                        : spread && parseFloat(spread) > 0.15
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-zinc-900 dark:text-zinc-100'
                    }`}>
                      {formatSpread(spread)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {formatCurrency(market.volume24h)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      {formatCurrency(market.volume)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      {formatCurrency(market.liquidity)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      {formatDate(market.endDateISO)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      market.closed || market.archived
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : market.acceptingOrders
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {market.closed ? 'Closed' : market.archived ? 'Archived' : market.acceptingOrders ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
                
                {/* Expanded row showing individual outcomes */}
                {isExpanded && hasTokens && (
                  <tr key={`${market.id}-expanded`} className="bg-zinc-50 dark:bg-zinc-900/50">
                    <td colSpan={10} className="py-2 px-4">
                      <div className="ml-8 mr-4">
                        <table className="w-full">
                          <thead>
                            <tr className="text-xs text-zinc-500 dark:text-zinc-500 border-b border-zinc-200 dark:border-zinc-700">
                              <th className="text-left py-2 px-3 font-medium">Outcome</th>
                              <th className="text-right py-2 px-3 font-medium">Price</th>
                              <th className="text-right py-2 px-3 font-medium">Bid</th>
                              <th className="text-right py-2 px-3 font-medium">Ask</th>
                              <th className="text-right py-2 px-3 font-medium">Spread</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(market.tokens!).map(([outcomeName, token]) => (
                              <tr 
                                key={outcomeName}
                                className="border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                              >
                                <td className="py-2 px-3">
                                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 capitalize">
                                    {outcomeName.replace(/-/g, ' ')}
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                    {formatPrice(token.price)}
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                    {formatPrice(token.bid)}
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                                    {formatPrice(token.ask)}
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <span className={`text-sm font-medium ${
                                    token.spread && parseFloat(token.spread) < 0.03 
                                      ? 'text-green-600 dark:text-green-400' 
                                      : 'text-zinc-600 dark:text-zinc-400'
                                  }`}>
                                    {formatSpread(token.spread)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
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
  );
}
