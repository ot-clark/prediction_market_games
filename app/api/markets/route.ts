import { NextResponse } from 'next/server';
import type { PolymarketMarket } from '@/types/polymarket';

/**
 * API Route to fetch Polymarket data using MCP server
 * 
 * This route fetches real-time Polymarket data including:
 * - Bids and asks
 * - Volume and liquidity
 * - Event names
 * - Resolution/expiry dates
 * 
 * The MCP server should be configured in your Cursor settings:
 * {
 *   "mcpServers": {
 *     "polymarket-mcp": {
 *       "command": "uv",
 *       "args": [
 *         "--directory",
 *         "/Users/{USER}/YOUR/PATH/TO/polymarket-mcp",
 *         "run",
 *         "polymarket-mcp"
 *       ],
 *       "env": {
 *         "KEY": "<polymarket api key>",
 *         "FUNDER": "<polymarket wallet address>"
 *       }
 *     }
 *   }
 * }
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const active = searchParams.get('active') !== 'false';

    // Try MCP server first, fallback to direct API if it fails
    let markets: PolymarketMarket[] = [];
    
    try {
      markets = await fetchMarketsFromMCP(limit, active);
    } catch (mcpError) {
      console.warn('MCP server failed, trying direct API:', mcpError);
      // Fallback to direct Polymarket API
      markets = await fetchMarketsDirectly(limit, active);
    }
    
    // If MCP returned empty array, try direct API
    if (markets.length === 0) {
      console.log('MCP returned no markets, trying direct API');
      markets = await fetchMarketsDirectly(limit, active);
    }
    
    return NextResponse.json({
      data: markets,
      count: markets.length,
    });
  } catch (error) {
    console.error('Error fetching Polymarket data:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch markets',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Fetch markets from MCP server using MCP SDK
 * 
 * This uses the @modelcontextprotocol/sdk to connect to the polymarket-mcp server
 * Make sure to install: npm install @modelcontextprotocol/sdk
 */
async function fetchMarketsFromMCP(limit: number, active: boolean): Promise<PolymarketMarket[]> {
  try {
    // Dynamic import to avoid issues if SDK is not installed
    let Client, StdioClientTransport;
    try {
      const clientModule = await import('@modelcontextprotocol/sdk/client/index.js');
      Client = clientModule.Client;
      const stdioModule = await import('@modelcontextprotocol/sdk/client/stdio.js');
      StdioClientTransport = stdioModule.StdioClientTransport;
    } catch (importError) {
      console.warn('MCP SDK not installed. Install with: npm install @modelcontextprotocol/sdk');
      console.warn('Falling back to empty data. Please configure MCP server.');
      console.warn('Import error:', importError);
      return [];
    }

    // Get MCP server configuration from environment variables
    // These should match your Cursor MCP server configuration
    const mcpPath = process.env.POLYMARKET_MCP_PATH || '/Users/owenclark/polymarket-mcp';
    const apiKey = process.env.POLYMARKET_API_KEY || process.env.KEY;
    const funderAddress = process.env.POLYMARKET_FUNDER || process.env.FUNDER;

    if (!apiKey || !funderAddress) {
      console.warn('Polymarket API key or funder address not configured in environment variables');
      return [];
    }

    // Create transport
    const transport = new StdioClientTransport({
      command: 'uv',
      args: [
        '--directory',
        mcpPath,
        'run',
        'src/polymarket_mcp/server.py',
      ],
      env: {
        ...process.env,
        PATH: `${process.env.HOME}/.local/bin:${process.env.PATH || ''}`,
        KEY: apiKey,
        FUNDER: funderAddress,
      },
    });

    // Create MCP client (transport is passed to connect(), not constructor)
    const client = new Client(
      {
        name: 'polymarket-nextjs-api',
        version: '1.0.0',
      }
    );

    // Connect with transport - this will automatically start the transport
    await client.connect(transport);

    try {
      // The polymarket-mcp server uses tools, not resources
      // Call the list-markets tool to get market data
      const toolResult = await client.callTool({
        name: 'list-markets',
        arguments: {
          status: active ? 'active' : undefined,
          limit: limit,
          offset: 0,
        },
      });

      console.log('Tool result type:', typeof toolResult);
      console.log('Tool result:', JSON.stringify(toolResult, null, 2));

      // Check if the tool result is an error
      if (toolResult.isError) {
        const content = toolResult.content as Array<{ text?: string }> | undefined;
        const errorText = content?.[0]?.text || 'Unknown error';
        console.error('MCP tool returned error:', errorText);
        
        // If it's an authentication/hex error, throw to trigger fallback
        if (errorText.includes('hexadecimal') || errorText.includes('Non-hex')) {
          throw new Error('MCP server requires private key, not API key. Falling back to direct API.');
        }
        
        // For other errors, return empty array
        return [];
      }

      // The tool returns text content, we need to parse it
      // The server returns formatted text like:
      // "ID: market-123\nTitle: ...\nStatus: ...\n---\n..."
      let mcpData: any[] = [];
      
      if (toolResult.content) {
        // toolResult.content is an array of content items
        const contentItems = Array.isArray(toolResult.content) 
          ? toolResult.content 
          : [toolResult.content];
        
        // Extract text from content items
        const textContent = contentItems
          .map((item: any) => {
            if (typeof item === 'string') return item;
            if (item.type === 'text' && item.text) return item.text;
            return '';
          })
          .join('\n');
        
        console.log('Parsed text content length:', textContent.length);
        
        // Parse the formatted text into market objects
        // Format: "ID: ...\nTitle: ...\nStatus: ...\nVolume: ...\n---\n"
        const marketBlocks = textContent.split('---\n').filter(block => block.trim());
        
        mcpData = marketBlocks.map((block: string) => {
          const lines = block.split('\n').filter(line => line.trim());
          const market: any = {};
          
          lines.forEach((line: string) => {
            const colonIndex = line.indexOf(':');
            if (colonIndex > 0) {
              const key = line.substring(0, colonIndex).trim().toLowerCase().replace(/\s+/g, '_');
              const value = line.substring(colonIndex + 1).trim();
              
              // Map the server's text format to our data structure
              if (key === 'condition_id') market.condition_id = value;
              else if (key === 'description') market.description = value;
              else if (key === 'category') market.category = value;
              else if (key === 'tokens') market.tokens = value;
              else if (key === 'question') market.question = value;
              else if (key === 'active') market.active = value === 'true' || value === 'True';
              else if (key === 'closed') market.closed = value === 'true' || value === 'True';
              else if (key === 'slug') market.market_slug = value;
              else if (key === 'end date') market.end_date_iso = value;
              else if (key === 'start time') market.game_start_time = value;
              else if (key === 'volume') {
                // Remove $ and commas, convert to number string
                market.volume = value.replace(/[$,]/g, '');
              }
              else if (key === 'liquidity') {
                market.liquidity = value.replace(/[$,]/g, '');
              }
              // Store other fields as-is
              else if (value !== 'N/A') {
                market[key] = value;
              }
            }
          });
          
          // Set ID from condition_id if available
          if (market.condition_id && !market.id) {
            market.id = market.condition_id;
          }
          
          return market;
        }).filter((m: any) => m.condition_id || m.id); // Only include markets with IDs
      }
      
      console.log(`Parsed ${mcpData.length} markets from tool result`);

      // Transform parsed market data to our format
      let markets = mcpData.map((market: any) => {
        // The parsed data from text has different field names
        // Map them to our PolymarketMarket format
        return {
          id: market.condition_id || market.id || '',
          question: market.description || market.question || market.title || '',
          slug: market.slug || market.market_slug || market.id || '',
          description: market.description,
          active: market.active === true || market.active === 'true' || market.status === 'active',
          closed: market.closed === true || market.closed === 'true' || market.status === 'closed',
          acceptingOrders: market.active === true || market.active === 'true',
          liquidity: market.liquidity?.toString(),
          volume: market.volume?.toString(),
          endDateISO: market.end_date_iso || market.endDateISO,
          startDateISO: market.game_start_time || market.startDateISO,
          conditionId: market.condition_id || market.id,
        };
      });

      // Apply filters
      if (active) {
        markets = markets.filter(
          (m) => m.acceptingOrders && !m.closed
        );
      }

      // Apply limit
      if (limit > 0) {
        markets = markets.slice(0, limit);
      }

      return markets;
    } catch (error) {
      console.error('Error during MCP communication:', error);
      throw error;
    } finally {
      try {
        await client.close();
      } catch (closeError) {
        console.error('Error closing MCP client:', closeError);
      }
      try {
        await transport.close();
      } catch (closeError) {
        console.error('Error closing transport:', closeError);
      }
    }
  } catch (error) {
    console.error('Error fetching from MCP:', error);
    // Throw error to trigger fallback to direct API
    throw error;
  }
}

/**
 * Fetch markets directly from Polymarket Gamma API (fallback when MCP server fails)
 * Gamma API returns current active markets, while CLOB API is used for order book data
 */
async function fetchMarketsDirectly(limit: number, active: boolean): Promise<PolymarketMarket[]> {
  try {
    console.log('Fetching markets from Polymarket Gamma API...');
    const GAMMA_API = 'https://gamma-api.polymarket.com';
    const CLOB_API = 'https://clob.polymarket.com';
    
    // Gamma API has a max of 100 per request, so we need to paginate
    const pageSize = 100;
    const numPages = Math.ceil(limit / pageSize);
    let allMarkets: any[] = [];
    
    for (let page = 0; page < numPages && allMarkets.length < limit; page++) {
      const offset = page * pageSize;
      const currentLimit = Math.min(pageSize, limit - allMarkets.length);
      
      // Build query params for Gamma API
      const params = new URLSearchParams();
      if (active) {
        params.set('active', 'true');
        params.set('closed', 'false');
      }
      params.set('limit', currentLimit.toString());
      params.set('offset', offset.toString());
      params.set('order', 'volume24hr'); // Sort by recent volume for most active markets
      params.set('ascending', 'false'); // Highest volume first
      
      // Fetch markets from Gamma API (returns current active markets)
      const response = await fetch(
        `${GAMMA_API}/markets?${params.toString()}`,
        {
          headers: {
            'Accept': 'application/json',
          },
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        console.error(`Gamma API returned ${response.status} for page ${page}`);
        break;
      }

      const pageMarkets = await response.json();
      if (!Array.isArray(pageMarkets) || pageMarkets.length === 0) {
        break; // No more markets
      }
      
      allMarkets = allMarkets.concat(pageMarkets);
      console.log(`Fetched page ${page + 1}: ${pageMarkets.length} markets (total: ${allMarkets.length})`);
      
      // If we got fewer than requested, we've reached the end
      if (pageMarkets.length < currentLimit) {
        break;
      }
    }
    
    const markets = allMarkets.slice(0, limit);
    console.log(`Total fetched: ${markets.length} markets from Gamma API`);
    
    // Debug: Show sample market structure
    if (markets.length > 0) {
      const sample = markets[0];
      console.log('Sample market:', {
        question: sample.question?.substring(0, 50),
        active: sample.active,
        closed: sample.closed,
        endDate: sample.endDate,
        volume24hr: sample.volume24hr,
        clobTokenIds: sample.clobTokenIds,
      });
    }
    
    // Parse clobTokenIds and fetch order book data for bids/asks
    const tokenOrderBooks: Record<string, { bestBid?: string; bestAsk?: string; spread?: string }> = {};
    const allTokenIds: string[] = [];
    
    markets.forEach((market: any) => {
      if (market.clobTokenIds) {
        try {
          // clobTokenIds is a JSON string like '["tokenId1", "tokenId2"]'
          const tokenIds = typeof market.clobTokenIds === 'string' 
            ? JSON.parse(market.clobTokenIds) 
            : market.clobTokenIds;
          if (Array.isArray(tokenIds)) {
            tokenIds.forEach((id: string) => {
              if (id && !allTokenIds.includes(id)) {
                allTokenIds.push(id);
              }
            });
          }
        } catch (e) {
          console.warn('Failed to parse clobTokenIds:', market.clobTokenIds);
        }
      }
    });
    
    // Fetch order book data for tokens to get best bid/ask
    if (allTokenIds.length > 0) {
      console.log(`Fetching order books for ${allTokenIds.length} tokens...`);
      
      // Fetch order books in parallel batches
      const batchSize = 10;
      for (let i = 0; i < allTokenIds.length; i += batchSize) {
        const batch = allTokenIds.slice(i, i + batchSize);
        
        const bookPromises = batch.map(async (tokenId) => {
          try {
            const bookResponse = await fetch(`${CLOB_API}/book?token_id=${tokenId}`, {
              headers: { 'Accept': 'application/json' },
              cache: 'no-store',
            });
            
            if (bookResponse.ok) {
              const book = await bookResponse.json();
              
              // Get best bid (highest bid price)
              const bestBid = book.bids && book.bids.length > 0
                ? book.bids.reduce((max: any, b: any) => 
                    parseFloat(b.price) > parseFloat(max.price) ? b : max
                  ).price
                : undefined;
              
              // Get best ask (lowest ask price)
              const bestAsk = book.asks && book.asks.length > 0
                ? book.asks.reduce((min: any, a: any) => 
                    parseFloat(a.price) < parseFloat(min.price) ? a : min
                  ).price
                : undefined;
              
              // Calculate spread
              const spread = bestBid && bestAsk
                ? (parseFloat(bestAsk) - parseFloat(bestBid)).toFixed(4)
                : undefined;
              
              tokenOrderBooks[tokenId] = { bestBid, bestAsk, spread };
            }
          } catch (e) {
            // Silently fail individual requests
          }
        });
        
        await Promise.all(bookPromises);
      }
      
      console.log(`Fetched order books for ${Object.keys(tokenOrderBooks).length} tokens`);
    }
    
    // Transform to our format
    return markets.map((market: any) => {
      // Parse token IDs and outcomes
      let tokenIds: string[] = [];
      let outcomes: string[] = [];
      let outcomePrices: string[] = [];
      
      try {
        if (market.clobTokenIds) {
          tokenIds = typeof market.clobTokenIds === 'string' 
            ? JSON.parse(market.clobTokenIds) 
            : market.clobTokenIds;
        }
        if (market.outcomes) {
          outcomes = typeof market.outcomes === 'string'
            ? JSON.parse(market.outcomes)
            : market.outcomes;
        }
        if (market.outcomePrices) {
          outcomePrices = typeof market.outcomePrices === 'string'
            ? JSON.parse(market.outcomePrices)
            : market.outcomePrices;
        }
      } catch (e) {
        console.warn('Failed to parse market arrays:', e);
      }
      
      // Build tokens object with bid/ask data
      const tokens: Record<string, any> = {};
      outcomes.forEach((outcome: string, index: number) => {
        const tokenId = tokenIds[index];
        const price = outcomePrices[index];
        const orderBook = tokenId ? tokenOrderBooks[tokenId] : undefined;
        const key = outcome.toLowerCase().replace(/\s+/g, '-');
        
        tokens[key] = {
          price: price || '0',
          bid: orderBook?.bestBid,
          ask: orderBook?.bestAsk,
          spread: orderBook?.spread,
          tokenId: tokenId,
        };
      });
      
      return {
        id: market.conditionId || market.id,
        question: market.question || '',
        slug: market.slug || market.id,
        description: market.description,
        image: market.image,
        icon: market.icon,
        active: market.active === true,
        closed: market.closed === true,
        archived: market.archived === true,
        acceptingOrders: market.enableOrderBook === true && market.active === true && !market.closed,
        liquidity: market.liquidity?.toString(),
        volume: market.volumeNum?.toString() || market.volume?.toString(),
        volume24h: market.volume24hr?.toString(),
        outcomes: outcomes,
        outcomePrices: outcomePrices,
        endDateISO: market.endDate || market.endDateIso,
        startDateISO: market.startDate || market.startDateIso,
        conditionId: market.conditionId || market.id,
        questionId: market.questionID,
        tokens: Object.keys(tokens).length > 0 ? tokens : undefined,
      };
    });
  } catch (error) {
    console.error('Error fetching markets from Gamma API:', error);
    return [];
  }
}

