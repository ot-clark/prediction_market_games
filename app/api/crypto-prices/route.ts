import { NextResponse } from 'next/server';
import { COINGECKO_ID_MAP } from '@/types/crypto';

/**
 * Crypto Prices API Route
 * 
 * Fetches current prices for cryptocurrencies from CoinGecko.
 * Free tier: 10-50 calls/minute depending on endpoint.
 * 
 * API docs: https://www.coingecko.com/en/api/documentation
 */

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

export interface CryptoPriceData {
  symbol: string;
  name: string;
  currentPrice: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  marketCap: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  ath: number;
  athDate: string;
  atl: number;
  atlDate: string;
  lastUpdated: Date;
}

export interface CryptoPricesResponse {
  prices: Record<string, CryptoPriceData>;
  lastUpdated: Date;
  error?: string;
}

/**
 * GET /api/crypto-prices
 * 
 * Query params:
 * - symbols: comma-separated list of symbols (e.g., BTC,ETH,SOL)
 *           If not provided, returns all supported cryptos
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get('symbols');
    
    // Determine which symbols to fetch
    let symbols: string[];
    if (symbolsParam) {
      symbols = symbolsParam.split(',').map(s => s.trim().toUpperCase());
    } else {
      // Default to all supported symbols
      symbols = Object.keys(COINGECKO_ID_MAP);
    }

    // Map symbols to CoinGecko IDs
    const coinIds: string[] = [];
    const symbolToId: Record<string, string> = {};
    
    for (const symbol of symbols) {
      const geckoId = COINGECKO_ID_MAP[symbol];
      if (geckoId) {
        coinIds.push(geckoId);
        symbolToId[geckoId] = symbol;
      }
    }

    if (coinIds.length === 0) {
      return NextResponse.json({
        error: 'No valid symbols provided',
        supportedSymbols: Object.keys(COINGECKO_ID_MAP),
      }, { status: 400 });
    }

    // Fetch market data from CoinGecko
    const response = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=${coinIds.join(',')}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`,
      {
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      // Handle rate limiting
      if (response.status === 429) {
        return NextResponse.json({
          error: 'CoinGecko rate limit exceeded. Please try again in a minute.',
        }, { status: 429 });
      }
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform to our format
    const prices: Record<string, CryptoPriceData> = {};
    
    for (const coin of data) {
      const symbol = symbolToId[coin.id];
      if (!symbol) continue;

      prices[symbol] = {
        symbol,
        name: coin.name,
        currentPrice: coin.current_price,
        priceChange24h: coin.price_change_24h || 0,
        priceChangePercent24h: coin.price_change_percentage_24h || 0,
        marketCap: coin.market_cap || 0,
        volume24h: coin.total_volume || 0,
        high24h: coin.high_24h || coin.current_price,
        low24h: coin.low_24h || coin.current_price,
        ath: coin.ath || coin.current_price,
        athDate: coin.ath_date || '',
        atl: coin.atl || 0,
        atlDate: coin.atl_date || '',
        lastUpdated: new Date(coin.last_updated || Date.now()),
      };
    }

    const result: CryptoPricesResponse = {
      prices,
      lastUpdated: new Date(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Crypto prices API error:', error);
    return NextResponse.json({
      error: 'Failed to fetch crypto prices',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * Get historical prices for volatility calculation
 * This is a separate endpoint to avoid complicating the main price fetch
 */
export async function getHistoricalPrices(
  symbol: string,
  days: number = 30
): Promise<number[]> {
  try {
    const geckoId = COINGECKO_ID_MAP[symbol];
    if (!geckoId) return [];

    const response = await fetch(
      `${COINGECKO_API}/coins/${geckoId}/market_chart?vs_currency=usd&days=${days}&interval=daily`,
      {
        headers: { 'Accept': 'application/json' },
        cache: 'no-store',
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    // data.prices is array of [timestamp, price] pairs
    return (data.prices || []).map((p: [number, number]) => p[1]);
  } catch (e) {
    console.error('Error fetching historical prices:', e);
    return [];
  }
}
