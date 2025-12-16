import { NextResponse } from 'next/server';
import type { OrderBook, OrderBookLevel } from '@/types/marketmaking';

const CLOB_API = 'https://clob.polymarket.com';

/**
 * API Route to fetch order book data from Polymarket CLOB API
 * 
 * Query parameters:
 * - tokenId: The token ID to fetch order book for (required)
 * - depth: Number of levels to fetch (optional, default 10)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenId = searchParams.get('tokenId');
    const depth = parseInt(searchParams.get('depth') || '10', 10);

    if (!tokenId) {
      return NextResponse.json(
        { error: 'tokenId parameter is required' },
        { status: 400 }
      );
    }

    // Fetch order book from CLOB API
    const response = await fetch(`${CLOB_API}/book?token_id=${tokenId}`, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch order book: ${response.status}` },
        { status: response.status }
      );
    }

    const book = await response.json();

    // Parse and sort bids (highest first)
    const bids: OrderBookLevel[] = (book.bids || [])
      .map((b: any) => ({
        price: b.price,
        size: b.size,
      }))
      .sort((a: OrderBookLevel, b: OrderBookLevel) => 
        parseFloat(b.price) - parseFloat(a.price)
      )
      .slice(0, depth);

    // Parse and sort asks (lowest first)
    const asks: OrderBookLevel[] = (book.asks || [])
      .map((a: any) => ({
        price: a.price,
        size: a.size,
      }))
      .sort((a: OrderBookLevel, b: OrderBookLevel) => 
        parseFloat(a.price) - parseFloat(b.price)
      )
      .slice(0, depth);

    const orderBook: OrderBook = {
      bids,
      asks,
      timestamp: Date.now(),
      tokenId,
    };

    // Calculate spread and mid price
    const bestBid = bids.length > 0 ? parseFloat(bids[0].price) : 0;
    const bestAsk = asks.length > 0 ? parseFloat(asks[0].price) : 1;
    const midPrice = (bestBid + bestAsk) / 2;
    const spread = bestAsk - bestBid;
    const spreadBps = midPrice > 0 ? (spread / midPrice) * 10000 : 0;

    // Calculate total liquidity
    const bidLiquidity = bids.reduce((sum, b) => 
      sum + parseFloat(b.price) * parseFloat(b.size), 0
    );
    const askLiquidity = asks.reduce((sum, a) => 
      sum + parseFloat(a.price) * parseFloat(a.size), 0
    );

    return NextResponse.json({
      orderBook,
      metrics: {
        bestBid,
        bestAsk,
        midPrice,
        spread,
        spreadBps: Math.round(spreadBps),
        bidLiquidity: bidLiquidity.toFixed(2),
        askLiquidity: askLiquidity.toFixed(2),
        bidLevels: bids.length,
        askLevels: asks.length,
      },
    });
  } catch (error) {
    console.error('Error fetching order book:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch order book',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Fetch multiple order books in parallel
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tokenIds, depth = 10 } = body;

    if (!tokenIds || !Array.isArray(tokenIds)) {
      return NextResponse.json(
        { error: 'tokenIds array is required' },
        { status: 400 }
      );
    }

    // Fetch all order books in parallel
    const orderBooks: Record<string, any> = {};
    
    await Promise.all(
      tokenIds.map(async (tokenId: string) => {
        try {
          const response = await fetch(`${CLOB_API}/book?token_id=${tokenId}`, {
            headers: { 'Accept': 'application/json' },
            cache: 'no-store',
          });

          if (response.ok) {
            const book = await response.json();
            
            const bids: OrderBookLevel[] = (book.bids || [])
              .map((b: any) => ({ price: b.price, size: b.size }))
              .sort((a: OrderBookLevel, b: OrderBookLevel) => 
                parseFloat(b.price) - parseFloat(a.price)
              )
              .slice(0, depth);

            const asks: OrderBookLevel[] = (book.asks || [])
              .map((a: any) => ({ price: a.price, size: a.size }))
              .sort((a: OrderBookLevel, b: OrderBookLevel) => 
                parseFloat(a.price) - parseFloat(b.price)
              )
              .slice(0, depth);

            const bestBid = bids.length > 0 ? parseFloat(bids[0].price) : 0;
            const bestAsk = asks.length > 0 ? parseFloat(asks[0].price) : 1;
            const midPrice = (bestBid + bestAsk) / 2;
            const spread = bestAsk - bestBid;

            orderBooks[tokenId] = {
              orderBook: { bids, asks, timestamp: Date.now(), tokenId },
              metrics: {
                bestBid,
                bestAsk,
                midPrice,
                spread,
                spreadBps: midPrice > 0 ? Math.round((spread / midPrice) * 10000) : 0,
              },
            };
          }
        } catch (e) {
          console.error(`Failed to fetch order book for ${tokenId}:`, e);
        }
      })
    );

    return NextResponse.json({ orderBooks });
  } catch (error) {
    console.error('Error fetching order books:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch order books',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
