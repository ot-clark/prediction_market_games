import { NextResponse } from 'next/server';

/**
 * Deribit API Route
 * 
 * Fetches options data from Deribit exchange for BTC and ETH.
 * Deribit is the primary crypto options exchange with deep liquidity.
 * 
 * Public API docs: https://docs.deribit.com/
 * No authentication required for public market data.
 */

const DERIBIT_API = 'https://www.deribit.com/api/v2/public';

interface DeribitInstrument {
  instrument_name: string;
  strike: number;
  expiration_timestamp: number;
  option_type: 'call' | 'put';
  is_active: boolean;
  underlying_index: string;
}

interface DeribitTicker {
  instrument_name: string;
  underlying_price: number;
  mark_iv: number;        // Implied volatility as percentage (e.g., 55 for 55%)
  bid_iv: number;
  ask_iv: number;
  delta: number;
  gamma: number;
  vega: number;
  theta: number;
  mark_price: number;     // In BTC/ETH terms
  best_bid_price: number;
  best_ask_price: number;
  open_interest: number;
  volume: number;
}

export interface DeribitOptionsData {
  symbol: string;                 // BTC or ETH
  underlyingPrice: number;        // Current spot price
  atmIv: number;                  // At-the-money implied volatility (decimal)
  ivByStrike: Record<number, {
    strike: number;
    callIv: number;
    putIv: number;
    callDelta: number;
    putDelta: number;
    expiry: Date;
    daysToExpiry: number;
  }>;
  expirations: Array<{
    date: Date;
    timestamp: number;
    daysToExpiry: number;
    instruments: string[];
  }>;
  lastUpdated: Date;
}

/**
 * GET /api/deribit
 * 
 * Query params:
 * - symbol: BTC or ETH (default: BTC)
 * - expiry: specific expiry date to fetch (optional)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = (searchParams.get('symbol') || 'BTC').toUpperCase();
    const targetExpiry = searchParams.get('expiry'); // Optional: specific expiry to focus on

    if (!['BTC', 'ETH'].includes(symbol)) {
      return NextResponse.json({
        error: `Unsupported symbol: ${symbol}. Deribit only supports BTC and ETH options.`,
      }, { status: 400 });
    }

    const currency = symbol;
    
    // 1. Get current index price
    const indexResponse = await fetch(
      `${DERIBIT_API}/get_index_price?index_name=${currency.toLowerCase()}_usd`,
      { cache: 'no-store' }
    );
    
    if (!indexResponse.ok) {
      throw new Error(`Failed to fetch index price: ${indexResponse.status}`);
    }
    
    const indexData = await indexResponse.json();
    const underlyingPrice = indexData.result?.index_price;
    
    if (!underlyingPrice) {
      throw new Error('Could not get underlying price from Deribit');
    }

    // 2. Get all active options instruments
    const instrumentsResponse = await fetch(
      `${DERIBIT_API}/get_instruments?currency=${currency}&kind=option&expired=false`,
      { cache: 'no-store' }
    );
    
    if (!instrumentsResponse.ok) {
      throw new Error(`Failed to fetch instruments: ${instrumentsResponse.status}`);
    }
    
    const instrumentsData = await instrumentsResponse.json();
    const instruments: DeribitInstrument[] = instrumentsData.result || [];
    
    // Group instruments by expiration
    const expirationMap = new Map<number, DeribitInstrument[]>();
    instruments.forEach(inst => {
      if (!inst.is_active) return;
      const expTs = inst.expiration_timestamp;
      if (!expirationMap.has(expTs)) {
        expirationMap.set(expTs, []);
      }
      expirationMap.get(expTs)!.push(inst);
    });

    // Sort expirations by date
    const sortedExpirations = Array.from(expirationMap.entries())
      .sort((a, b) => a[0] - b[0]);

    // Build expirations array
    const now = Date.now();
    const expirations = sortedExpirations.map(([timestamp, insts]) => ({
      date: new Date(timestamp),
      timestamp,
      daysToExpiry: Math.max(0, (timestamp - now) / (1000 * 60 * 60 * 24)),
      instruments: insts.map(i => i.instrument_name),
    }));

    // 3. Fetch ticker data for options near ATM to get IV
    // We'll get options across several expirations to build an IV surface
    const ivByStrike: Record<number, {
      strike: number;
      callIv: number;
      putIv: number;
      callDelta: number;
      putDelta: number;
      expiry: Date;
      daysToExpiry: number;
    }> = {};

    // Find ATM strike (closest to current price)
    const allStrikes = [...new Set(instruments.map(i => i.strike))].sort((a, b) => a - b);
    const atmStrike = allStrikes.reduce((closest, strike) => 
      Math.abs(strike - underlyingPrice) < Math.abs(closest - underlyingPrice) ? strike : closest
    , allStrikes[0]);

    // Get strikes around ATM (±30% range for building IV surface)
    const minStrike = underlyingPrice * 0.5;
    const maxStrike = underlyingPrice * 2.0;
    const relevantStrikes = allStrikes.filter(s => s >= minStrike && s <= maxStrike);

    // Fetch ticker for ATM options to get ATM IV
    let atmIv = 0;
    const atmInstruments = instruments.filter(i => 
      i.strike === atmStrike && 
      i.option_type === 'call' &&
      i.is_active
    );

    // Prefer nearest expiry for ATM IV
    if (atmInstruments.length > 0) {
      const nearestAtm = atmInstruments.sort((a, b) => 
        a.expiration_timestamp - b.expiration_timestamp
      )[0];

      try {
        const tickerResponse = await fetch(
          `${DERIBIT_API}/ticker?instrument_name=${nearestAtm.instrument_name}`,
          { cache: 'no-store' }
        );
        
        if (tickerResponse.ok) {
          const tickerData = await tickerResponse.json();
          const ticker: DeribitTicker = tickerData.result;
          // Deribit returns IV as percentage, convert to decimal
          atmIv = (ticker.mark_iv || 0) / 100;
        }
      } catch (e) {
        console.warn('Failed to fetch ATM ticker:', e);
      }
    }

    // Fetch tickers for a selection of strikes to build IV smile
    // Limit to avoid rate limits - get ~10-15 key strikes per expiry
    const nearestExpiries = sortedExpirations.slice(0, 3); // First 3 expirations
    
    for (const [expTimestamp, expInstruments] of nearestExpiries) {
      const expDate = new Date(expTimestamp);
      const daysToExpiry = Math.max(0, (expTimestamp - now) / (1000 * 60 * 60 * 24));
      
      // Get unique strikes for this expiry, focus on strikes near ATM
      const expStrikes = [...new Set(expInstruments.map(i => i.strike))]
        .filter(s => s >= minStrike && s <= maxStrike)
        .sort((a, b) => Math.abs(a - underlyingPrice) - Math.abs(b - underlyingPrice))
        .slice(0, 10); // Limit to 10 strikes per expiry

      for (const strike of expStrikes) {
        const callInst = expInstruments.find(i => i.strike === strike && i.option_type === 'call');
        const putInst = expInstruments.find(i => i.strike === strike && i.option_type === 'put');

        if (callInst) {
          try {
            const tickerResponse = await fetch(
              `${DERIBIT_API}/ticker?instrument_name=${callInst.instrument_name}`,
              { cache: 'no-store' }
            );
            
            if (tickerResponse.ok) {
              const tickerData = await tickerResponse.json();
              const ticker: DeribitTicker = tickerData.result;
              
              ivByStrike[strike] = {
                strike,
                callIv: (ticker.mark_iv || 0) / 100,
                putIv: 0, // Will fill in below
                callDelta: ticker.delta || 0,
                putDelta: 0,
                expiry: expDate,
                daysToExpiry,
              };
            }
          } catch (e) {
            console.warn(`Failed to fetch ticker for ${callInst.instrument_name}:`, e);
          }
        }

        // Fetch put IV if we have the call data
        if (putInst && ivByStrike[strike]) {
          try {
            const tickerResponse = await fetch(
              `${DERIBIT_API}/ticker?instrument_name=${putInst.instrument_name}`,
              { cache: 'no-store' }
            );
            
            if (tickerResponse.ok) {
              const tickerData = await tickerResponse.json();
              const ticker: DeribitTicker = tickerData.result;
              
              ivByStrike[strike].putIv = (ticker.mark_iv || 0) / 100;
              ivByStrike[strike].putDelta = ticker.delta || 0;
            }
          } catch (e) {
            console.warn(`Failed to fetch put ticker for ${putInst.instrument_name}:`, e);
          }
        }
      }
    }

    // If we didn't get ATM IV from ticker, estimate from the ivByStrike data
    if (atmIv === 0 && Object.keys(ivByStrike).length > 0) {
      const ivValues = Object.values(ivByStrike).map(d => d.callIv).filter(iv => iv > 0);
      if (ivValues.length > 0) {
        atmIv = ivValues.reduce((a, b) => a + b, 0) / ivValues.length;
      }
    }

    const result: DeribitOptionsData = {
      symbol,
      underlyingPrice,
      atmIv: atmIv || 0.55, // Default to 55% if we couldn't get it
      ivByStrike,
      expirations,
      lastUpdated: new Date(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Deribit API error:', error);
    return NextResponse.json({
      error: 'Failed to fetch Deribit options data',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * Helper function to get IV for a specific strike and expiry
 * Called by the crypto-arbitrage route
 */
export async function getIvForStrike(
  symbol: 'BTC' | 'ETH',
  strike: number,
  expiryTimestamp: number
): Promise<{ iv: number; delta: number } | null> {
  try {
    // Construct instrument name: BTC-31DEC25-100000-C
    const expDate = new Date(expiryTimestamp);
    const day = expDate.getUTCDate();
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const month = months[expDate.getUTCMonth()];
    const year = expDate.getUTCFullYear().toString().slice(-2);
    
    const instrumentName = `${symbol}-${day}${month}${year}-${strike}-C`;
    
    const response = await fetch(
      `${DERIBIT_API}/ticker?instrument_name=${instrumentName}`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const ticker = data.result;
    
    return {
      iv: (ticker.mark_iv || 0) / 100,
      delta: ticker.delta || 0,
    };
  } catch (e) {
    return null;
  }
}
