'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { 
  OrderBook, 
  Order, 
  Position, 
  MarketMakingConfig,
  SimulatedTrade,
  Quote,
} from '@/types/marketmaking';
import { 
  DEFAULT_MM_CONFIG, 
  calculateRewardScore, 
  calculateQuotes,
  calculateOptimalDistance,
} from '@/types/marketmaking';
import type { PolymarketMarket } from '@/types/polymarket';

interface MarketMakingDashboardProps {
  initialMarket?: PolymarketMarket;
}

interface OrderBookData {
  orderBook: OrderBook;
  metrics: {
    bestBid: number;
    bestAsk: number;
    midPrice: number;
    spread: number;
    spreadBps: number;
    bidLiquidity: string;
    askLiquidity: string;
  };
}

export default function MarketMakingDashboard({ initialMarket }: MarketMakingDashboardProps) {
  // State
  const [markets, setMarkets] = useState<PolymarketMarket[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<PolymarketMarket | null>(initialMarket || null);
  const [selectedOutcome, setSelectedOutcome] = useState<string>('');
  const [orderBookData, setOrderBookData] = useState<OrderBookData | null>(null);
  const [config, setConfig] = useState<MarketMakingConfig>(DEFAULT_MM_CONFIG);
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Practice trading state
  const [simulatedOrders, setSimulatedOrders] = useState<Order[]>([]);
  const [simulatedPositions, setSimulatedPositions] = useState<Position[]>([]);
  const [simulatedTrades, setSimulatedTrades] = useState<SimulatedTrade[]>([]);
  const [totalPnL, setTotalPnL] = useState(0);
  const [cashBalance, setCashBalance] = useState(1000); // Start with $1000 virtual
  
  // Manual order form
  const [manualOrderSide, setManualOrderSide] = useState<'BUY' | 'SELL'>('BUY');
  const [manualOrderPrice, setManualOrderPrice] = useState('');
  const [manualOrderSize, setManualOrderSize] = useState('10');
  
  // Quote calculation
  const [calculatedQuotes, setCalculatedQuotes] = useState<Quote | null>(null);

  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch markets
  useEffect(() => {
    async function fetchMarkets() {
      try {
        const response = await fetch('/api/markets?limit=50&active=true');
        const data = await response.json();
        if (data.data) {
          // Filter to markets with token IDs
          const marketsWithTokens = data.data.filter((m: PolymarketMarket) => 
            m.tokens && Object.keys(m.tokens).length > 0
          );
          setMarkets(marketsWithTokens);
        }
      } catch (err) {
        console.error('Failed to fetch markets:', err);
      }
    }
    fetchMarkets();
  }, []);

  // Fetch order book for selected market/outcome
  const fetchOrderBook = useCallback(async () => {
    if (!selectedMarket || !selectedOutcome) return;
    
    const token = selectedMarket.tokens?.[selectedOutcome];
    if (!token?.tokenId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/orderbook?tokenId=${token.tokenId}&depth=15`);
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setOrderBookData(data);
        
        // Calculate quotes based on mid price and config
        if (data.metrics) {
          const inventory = simulatedPositions.find(
            p => p.tokenId === token.tokenId
          )?.size || 0;
          
          const quotes = calculateQuotes(
            data.metrics.midPrice,
            config.spreadBps,
            inventory,
            config.maxPositionSize,
            config.inventorySkewFactor
          );
          
          const distanceFromMid = Math.abs(quotes.bidPrice - data.metrics.midPrice);
          const maxSpread = config.maxSpreadBps / 10000;
          
          setCalculatedQuotes({
            tokenId: token.tokenId,
            bidPrice: quotes.bidPrice,
            bidSize: config.orderSize,
            askPrice: quotes.askPrice,
            askSize: config.orderSize,
            distanceFromMid,
            estimatedRewardScore: calculateRewardScore(maxSpread, distanceFromMid),
          });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order book');
    } finally {
      setLoading(false);
    }
  }, [selectedMarket, selectedOutcome, config, simulatedPositions]);

  // Initial fetch and auto-refresh
  useEffect(() => {
    if (selectedMarket && selectedOutcome) {
      fetchOrderBook();
    }
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [selectedMarket, selectedOutcome, fetchOrderBook]);

  // Auto-refresh toggle
  useEffect(() => {
    if (isAutoRefresh && selectedMarket && selectedOutcome) {
      refreshIntervalRef.current = setInterval(fetchOrderBook, config.refreshIntervalMs);
    } else if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [isAutoRefresh, fetchOrderBook, config.refreshIntervalMs, selectedMarket, selectedOutcome]);

  // Handle market selection
  const handleMarketSelect = (market: PolymarketMarket) => {
    setSelectedMarket(market);
    setSelectedOutcome('');
    setOrderBookData(null);
    setCalculatedQuotes(null);
  };

  // Handle outcome selection
  const handleOutcomeSelect = (outcome: string) => {
    setSelectedOutcome(outcome);
  };

  // Simulate placing an order
  const placeSimulatedOrder = (side: 'BUY' | 'SELL', price: number, size: number) => {
    if (!selectedMarket || !selectedOutcome || !orderBookData) return;
    
    const token = selectedMarket.tokens?.[selectedOutcome];
    if (!token?.tokenId) return;
    
    const order: Order = {
      id: `sim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tokenId: token.tokenId,
      side,
      price,
      size,
      status: 'OPEN',
      createdAt: Date.now(),
      market: selectedMarket.question || '',
    };
    
    setSimulatedOrders(prev => [...prev, order]);
    
    // Check if order would be immediately filled
    const wouldFill = side === 'BUY' 
      ? price >= orderBookData.metrics.bestAsk
      : price <= orderBookData.metrics.bestBid;
    
    if (wouldFill) {
      // Simulate immediate fill
      const fillPrice = side === 'BUY' 
        ? orderBookData.metrics.bestAsk 
        : orderBookData.metrics.bestBid;
      
      simulateFill(order, fillPrice);
    }
  };

  // Simulate order fill
  const simulateFill = (order: Order, fillPrice: number) => {
    const cost = fillPrice * order.size;
    const fee = cost * 0.001; // 0.1% taker fee
    
    // Update order status
    setSimulatedOrders(prev => 
      prev.map(o => o.id === order.id 
        ? { ...o, status: 'FILLED', filledAt: Date.now(), filledSize: order.size }
        : o
      )
    );
    
    // Record trade
    const trade: SimulatedTrade = {
      id: `trade-${Date.now()}`,
      timestamp: Date.now(),
      market: order.market,
      tokenId: order.tokenId,
      side: order.side,
      price: fillPrice,
      size: order.size,
      fee,
      pnl: 0, // Will be calculated when position is closed
      isSimulated: true,
    };
    setSimulatedTrades(prev => [...prev, trade]);
    
    // Update position
    updatePosition(order.tokenId, order.side, order.size, fillPrice, order.market);
    
    // Update cash balance
    if (order.side === 'BUY') {
      setCashBalance(prev => prev - cost - fee);
    } else {
      setCashBalance(prev => prev + cost - fee);
    }
  };

  // Update position after fill
  const updatePosition = (
    tokenId: string, 
    side: 'BUY' | 'SELL', 
    size: number, 
    price: number,
    market: string
  ) => {
    setSimulatedPositions(prev => {
      const existing = prev.find(p => p.tokenId === tokenId);
      
      if (!existing) {
        // New position
        return [...prev, {
          tokenId,
          market,
          outcome: selectedOutcome,
          size: side === 'BUY' ? size : -size,
          averagePrice: price,
          currentPrice: price,
          unrealizedPnL: 0,
          realizedPnL: 0,
        }];
      }
      
      // Update existing position
      const deltaSize = side === 'BUY' ? size : -size;
      const newSize = existing.size + deltaSize;
      
      // If crossing zero, realize P&L
      if ((existing.size > 0 && newSize < 0) || (existing.size < 0 && newSize > 0)) {
        const closedSize = Math.min(Math.abs(existing.size), Math.abs(deltaSize));
        const pnl = (price - existing.averagePrice) * closedSize * (existing.size > 0 ? 1 : -1);
        
        setTotalPnL(current => current + pnl);
        
        return prev.map(p => p.tokenId === tokenId
          ? {
              ...p,
              size: newSize,
              averagePrice: newSize === 0 ? 0 : price,
              realizedPnL: p.realizedPnL + pnl,
            }
          : p
        );
      }
      
      // Same direction, update average price
      const newAvgPrice = newSize !== 0
        ? (existing.averagePrice * Math.abs(existing.size) + price * size) / Math.abs(newSize)
        : 0;
      
      return prev.map(p => p.tokenId === tokenId
        ? { ...p, size: newSize, averagePrice: newAvgPrice }
        : p
      );
    });
  };

  // Cancel simulated order
  const cancelOrder = (orderId: string) => {
    setSimulatedOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' } : o)
    );
  };

  // Handle manual order submit
  const handleManualOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(manualOrderPrice);
    const size = parseFloat(manualOrderSize);
    
    if (isNaN(price) || isNaN(size) || price <= 0 || size <= 0) {
      setError('Invalid price or size');
      return;
    }
    
    if (price > 0.99 || price < 0.01) {
      setError('Price must be between 0.01 and 0.99');
      return;
    }
    
    placeSimulatedOrder(manualOrderSide, price, size);
    setManualOrderPrice('');
  };

  // Place calculated quotes
  const placeCalculatedQuotes = () => {
    if (!calculatedQuotes) return;
    
    placeSimulatedOrder('BUY', calculatedQuotes.bidPrice, calculatedQuotes.bidSize);
    placeSimulatedOrder('SELL', calculatedQuotes.askPrice, calculatedQuotes.askSize);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Market Making Practice
          </h1>
          <p className="text-gray-400">
            Practice market making with simulated orders before deploying real capital
          </p>
        </header>

        {/* Virtual Balance */}
        <div className="bg-gray-900 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div>
            <span className="text-gray-400">Virtual Cash Balance:</span>
            <span className={`ml-2 text-xl font-bold ${cashBalance >= 1000 ? 'text-green-400' : 'text-red-400'}`}>
              ${cashBalance.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Total P&L:</span>
            <span className={`ml-2 text-xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)}
            </span>
          </div>
          <button
            onClick={() => {
              setCashBalance(1000);
              setTotalPnL(0);
              setSimulatedPositions([]);
              setSimulatedOrders([]);
              setSimulatedTrades([]);
            }}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
          >
            Reset Session
          </button>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Market Selector */}
          <div className="col-span-3">
            <div className="bg-gray-900 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">Select Market</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {markets.map((market) => (
                  <button
                    key={market.id}
                    onClick={() => handleMarketSelect(market)}
                    className={`w-full text-left p-3 rounded-lg text-sm transition ${
                      selectedMarket?.id === market.id
                        ? 'bg-blue-900/50 border border-blue-500'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    <div className="font-medium truncate">{market.question}</div>
                    <div className="text-gray-400 text-xs mt-1">
                      Vol: ${parseFloat(market.volume24h || '0').toLocaleString()}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Trading Area */}
          <div className="col-span-6">
            {selectedMarket ? (
              <>
                {/* Market Header */}
                <div className="bg-gray-900 rounded-lg p-4 mb-4">
                  <h2 className="text-lg font-semibold mb-2">{selectedMarket.question}</h2>
                  
                  {/* Outcome Selector */}
                  <div className="flex gap-2 mt-4">
                    {selectedMarket.tokens && Object.entries(selectedMarket.tokens).map(([outcome, data]) => (
                      <button
                        key={outcome}
                        onClick={() => handleOutcomeSelect(outcome)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                          selectedOutcome === outcome
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                      >
                        {outcome.toUpperCase()}
                        <span className="ml-2 text-gray-300">
                          {data.price ? `${(parseFloat(data.price) * 100).toFixed(1)}¢` : '—'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedOutcome && (
                  <>
                    {/* Order Book */}
                    <div className="bg-gray-900 rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Order Book</h3>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={isAutoRefresh}
                              onChange={(e) => setIsAutoRefresh(e.target.checked)}
                              className="rounded"
                            />
                            Auto-refresh
                          </label>
                          <button
                            onClick={fetchOrderBook}
                            disabled={loading}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm disabled:opacity-50"
                          >
                            {loading ? 'Loading...' : 'Refresh'}
                          </button>
                        </div>
                      </div>

                      {error && (
                        <div className="bg-red-900/50 text-red-300 p-3 rounded mb-4">
                          {error}
                        </div>
                      )}

                      {orderBookData && (
                        <>
                          {/* Metrics */}
                          <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                            <div className="bg-gray-800 p-3 rounded">
                              <div className="text-gray-400">Best Bid</div>
                              <div className="text-green-400 font-mono text-lg">
                                {orderBookData.metrics.bestBid.toFixed(3)}
                              </div>
                            </div>
                            <div className="bg-gray-800 p-3 rounded">
                              <div className="text-gray-400">Best Ask</div>
                              <div className="text-red-400 font-mono text-lg">
                                {orderBookData.metrics.bestAsk.toFixed(3)}
                              </div>
                            </div>
                            <div className="bg-gray-800 p-3 rounded">
                              <div className="text-gray-400">Mid Price</div>
                              <div className="text-white font-mono text-lg">
                                {orderBookData.metrics.midPrice.toFixed(3)}
                              </div>
                            </div>
                            <div className="bg-gray-800 p-3 rounded">
                              <div className="text-gray-400">Spread</div>
                              <div className="text-yellow-400 font-mono text-lg">
                                {orderBookData.metrics.spreadBps} bps
                              </div>
                            </div>
                          </div>

                          {/* Order Book Display */}
                          <div className="grid grid-cols-2 gap-4">
                            {/* Bids */}
                            <div>
                              <div className="text-sm text-gray-400 mb-2">
                                BIDS (${orderBookData.metrics.bidLiquidity})
                              </div>
                              <div className="space-y-1">
                                {orderBookData.orderBook.bids.slice(0, 8).map((bid, i) => (
                                  <div 
                                    key={i}
                                    className="flex justify-between bg-green-900/20 p-2 rounded text-sm font-mono"
                                  >
                                    <span className="text-green-400">{parseFloat(bid.price).toFixed(3)}</span>
                                    <span className="text-gray-300">{parseFloat(bid.size).toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {/* Asks */}
                            <div>
                              <div className="text-sm text-gray-400 mb-2">
                                ASKS (${orderBookData.metrics.askLiquidity})
                              </div>
                              <div className="space-y-1">
                                {orderBookData.orderBook.asks.slice(0, 8).map((ask, i) => (
                                  <div 
                                    key={i}
                                    className="flex justify-between bg-red-900/20 p-2 rounded text-sm font-mono"
                                  >
                                    <span className="text-red-400">{parseFloat(ask.price).toFixed(3)}</span>
                                    <span className="text-gray-300">{parseFloat(ask.size).toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Calculated Quotes */}
                    {calculatedQuotes && orderBookData && (
                      <div className="bg-gray-900 rounded-lg p-4 mb-4">
                        <h3 className="text-lg font-semibold mb-4">Suggested Quotes</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-green-900/30 p-4 rounded-lg">
                            <div className="text-sm text-gray-400 mb-1">BID</div>
                            <div className="text-2xl font-mono text-green-400">
                              {calculatedQuotes.bidPrice.toFixed(3)}
                            </div>
                            <div className="text-sm text-gray-400 mt-1">
                              Size: ${calculatedQuotes.bidSize}
                            </div>
                          </div>
                          <div className="bg-red-900/30 p-4 rounded-lg">
                            <div className="text-sm text-gray-400 mb-1">ASK</div>
                            <div className="text-2xl font-mono text-red-400">
                              {calculatedQuotes.askPrice.toFixed(3)}
                            </div>
                            <div className="text-sm text-gray-400 mt-1">
                              Size: ${calculatedQuotes.askSize}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
                          <span>
                            Distance from mid: {(calculatedQuotes.distanceFromMid * 100).toFixed(2)}%
                          </span>
                          <span>
                            Est. Reward Score: {(calculatedQuotes.estimatedRewardScore * 100).toFixed(1)}%
                          </span>
                        </div>
                        <button
                          onClick={placeCalculatedQuotes}
                          className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium"
                        >
                          Place Both Orders (Simulated)
                        </button>
                      </div>
                    )}

                    {/* Manual Order Form */}
                    <div className="bg-gray-900 rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-4">Manual Order</h3>
                      <form onSubmit={handleManualOrderSubmit} className="space-y-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setManualOrderSide('BUY')}
                            className={`flex-1 py-2 rounded font-medium ${
                              manualOrderSide === 'BUY'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-700 text-gray-300'
                            }`}
                          >
                            BUY
                          </button>
                          <button
                            type="button"
                            onClick={() => setManualOrderSide('SELL')}
                            className={`flex-1 py-2 rounded font-medium ${
                              manualOrderSide === 'SELL'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-700 text-gray-300'
                            }`}
                          >
                            SELL
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">
                              Price (0.01 - 0.99)
                            </label>
                            <input
                              type="number"
                              step="0.001"
                              min="0.01"
                              max="0.99"
                              value={manualOrderPrice}
                              onChange={(e) => setManualOrderPrice(e.target.value)}
                              placeholder={orderBookData?.metrics.midPrice.toFixed(3)}
                              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-400 mb-1">
                              Size ($)
                            </label>
                            <input
                              type="number"
                              step="1"
                              min="1"
                              value={manualOrderSize}
                              onChange={(e) => setManualOrderSize(e.target.value)}
                              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          className={`w-full py-3 rounded-lg font-medium ${
                            manualOrderSide === 'BUY'
                              ? 'bg-green-600 hover:bg-green-500'
                              : 'bg-red-600 hover:bg-red-500'
                          }`}
                        >
                          Place {manualOrderSide} Order (Simulated)
                        </button>
                      </form>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="bg-gray-900 rounded-lg p-8 text-center text-gray-400">
                Select a market from the left panel to start practicing
              </div>
            )}
          </div>

          {/* Right Panel - Orders, Positions, Config */}
          <div className="col-span-3 space-y-4">
            {/* Configuration */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Configuration</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Spread (bps)
                  </label>
                  <input
                    type="number"
                    value={config.spreadBps}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      spreadBps: parseInt(e.target.value) || 200 
                    }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Order Size ($)
                  </label>
                  <input
                    type="number"
                    value={config.orderSize}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      orderSize: parseFloat(e.target.value) || 10 
                    }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Inventory Skew (0-1)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={config.inventorySkewFactor}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      inventorySkewFactor: parseFloat(e.target.value) || 0.5 
                    }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Open Orders */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">
                Open Orders ({simulatedOrders.filter(o => o.status === 'OPEN').length})
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {simulatedOrders
                  .filter(o => o.status === 'OPEN')
                  .map((order) => (
                    <div 
                      key={order.id}
                      className="bg-gray-800 p-2 rounded text-sm flex justify-between items-center"
                    >
                      <div>
                        <span className={order.side === 'BUY' ? 'text-green-400' : 'text-red-400'}>
                          {order.side}
                        </span>
                        <span className="ml-2 font-mono">{order.price.toFixed(3)}</span>
                        <span className="ml-2 text-gray-400">${order.size}</span>
                      </div>
                      <button
                        onClick={() => cancelOrder(order.id)}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ))}
                {simulatedOrders.filter(o => o.status === 'OPEN').length === 0 && (
                  <div className="text-gray-500 text-sm">No open orders</div>
                )}
              </div>
            </div>

            {/* Positions */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Positions</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {simulatedPositions.filter(p => p.size !== 0).map((position) => (
                  <div 
                    key={position.tokenId}
                    className="bg-gray-800 p-3 rounded text-sm"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{position.outcome.toUpperCase()}</span>
                      <span className={position.size > 0 ? 'text-green-400' : 'text-red-400'}>
                        {position.size > 0 ? 'LONG' : 'SHORT'} {Math.abs(position.size).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-gray-400 mt-1">
                      Avg: {position.averagePrice.toFixed(3)}
                    </div>
                    <div className={`mt-1 ${position.realizedPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      Realized: {position.realizedPnL >= 0 ? '+' : ''}{position.realizedPnL.toFixed(2)}
                    </div>
                  </div>
                ))}
                {simulatedPositions.filter(p => p.size !== 0).length === 0 && (
                  <div className="text-gray-500 text-sm">No positions</div>
                )}
              </div>
            </div>

            {/* Recent Trades */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">
                Recent Trades ({simulatedTrades.length})
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {simulatedTrades.slice(-10).reverse().map((trade) => (
                  <div 
                    key={trade.id}
                    className="bg-gray-800 p-2 rounded text-xs"
                  >
                    <div className="flex justify-between">
                      <span className={trade.side === 'BUY' ? 'text-green-400' : 'text-red-400'}>
                        {trade.side}
                      </span>
                      <span className="font-mono">{trade.price.toFixed(3)}</span>
                    </div>
                    <div className="text-gray-400 mt-1">
                      ${trade.size} • Fee: ${trade.fee.toFixed(4)}
                    </div>
                  </div>
                ))}
                {simulatedTrades.length === 0 && (
                  <div className="text-gray-500 text-sm">No trades yet</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Education Section */}
        <div className="mt-8 bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">📚 Market Making Guide</h2>
          <div className="grid grid-cols-3 gap-6 text-sm">
            <div>
              <h3 className="font-semibold text-blue-400 mb-2">How It Works</h3>
              <ul className="space-y-1 text-gray-400">
                <li>• Place buy orders (bids) below mid price</li>
                <li>• Place sell orders (asks) above mid price</li>
                <li>• Earn the spread when both sides fill</li>
                <li>• Earn maker rewards from Polymarket</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-yellow-400 mb-2">Key Risks</h3>
              <ul className="space-y-1 text-gray-400">
                <li>• Inventory risk: accumulating losing positions</li>
                <li>• Adverse selection: informed traders picking you off</li>
                <li>• Price gaps: sudden moves before you can cancel</li>
                <li>• Event resolution: binary outcome risk</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-green-400 mb-2">Best Practices</h3>
              <ul className="space-y-1 text-gray-400">
                <li>• Start with wide spreads, tighten as you learn</li>
                <li>• Monitor your inventory and skew quotes</li>
                <li>• Avoid markets during high-impact news</li>
                <li>• Set strict position limits and stop-losses</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
