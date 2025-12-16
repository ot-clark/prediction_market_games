import { NextResponse } from 'next/server';
import type { SportsbookOdds, NormalizedOdds, NormalizedBookmaker } from '@/types/sportsbook';

const ODDS_API_BASE = 'https://api.the-odds-api.com/v4';

// Sports we want to fetch (major US sports + soccer)
// Reduced list to conserve API credits (free tier = 500/month)
// Each sport = 1 credit per request
const SPORTS_TO_FETCH = [
  'americanfootball_nfl',      // Most popular
  'basketball_nba',            // Most popular
  'basketball_ncaab',          // March Madness season
  'icehockey_nhl',            // Popular
  // Removed to save credits:
  // 'americanfootball_ncaaf',  // College football (seasonal)
  // 'baseball_mlb',            // Off-season
  // 'soccer_usa_mls',          // Lower priority
  // 'soccer_epl',              // Lower priority
  // 'soccer_uefa_champs_league', // Lower priority
  // 'mma_mixed_martial_arts',  // Lower priority
  // 'boxing_boxing',           // Lower priority
];

/**
 * Convert American odds to implied probability
 */
function americanToProb(odds: number): number {
  if (odds > 0) {
    return 100 / (odds + 100);
  } else {
    return Math.abs(odds) / (Math.abs(odds) + 100);
  }
}

/**
 * Convert decimal odds to implied probability
 */
function decimalToProb(odds: number): number {
  return 1 / odds;
}

/**
 * Normalize odds from The Odds API format - Pinnacle only
 */
function normalizeOdds(event: SportsbookOdds, oddsFormat: string): NormalizedOdds | null {
  // Filter to only Pinnacle bookmaker
  const pinnacleBookmaker = event.bookmakers.find(
    (bm) => bm.key.toLowerCase() === 'pinnacle' || bm.title.toLowerCase().includes('pinnacle')
  );

  if (!pinnacleBookmaker) {
    return null; // Skip events without Pinnacle odds
  }

  const h2hMarket = pinnacleBookmaker.markets.find((m) => m.key === 'h2h');
  if (!h2hMarket) return null;

  const homeOutcome = h2hMarket.outcomes.find((o) => o.name === event.home_team);
  const awayOutcome = h2hMarket.outcomes.find((o) => o.name === event.away_team);
  const drawOutcome = h2hMarket.outcomes.find((o) => o.name === 'Draw');

  if (!homeOutcome || !awayOutcome) return null;

  const convertProb = oddsFormat === 'decimal' ? decimalToProb : americanToProb;
  
  const homeProb = convertProb(homeOutcome.price);
  const awayProb = convertProb(awayOutcome.price);
  const drawProb = drawOutcome ? convertProb(drawOutcome.price) : undefined;

  const normalized: NormalizedBookmaker = {
    key: pinnacleBookmaker.key,
    name: pinnacleBookmaker.title,
    lastUpdate: pinnacleBookmaker.last_update,
    odds: {
      home: { probability: homeProb, americanOdds: homeOutcome.price },
      away: { probability: awayProb, americanOdds: awayOutcome.price },
      ...(drawProb !== undefined && { draw: { probability: drawProb, americanOdds: drawOutcome!.price } }),
    },
  };

  return {
    eventId: event.id,
    sportKey: event.sport_key,
    sportTitle: event.sport_title,
    commenceTime: event.commence_time,
    homeTeam: event.home_team,
    awayTeam: event.away_team,
    eventName: `${event.away_team} @ ${event.home_team}`,
    bookmakers: [normalized],
    bestOdds: {
      home: { probability: homeProb, odds: homeOutcome.price, bookmaker: pinnacleBookmaker.title },
      away: { probability: awayProb, odds: awayOutcome.price, bookmaker: pinnacleBookmaker.title },
      ...(drawProb !== undefined && { draw: { probability: drawProb, odds: drawOutcome!.price, bookmaker: pinnacleBookmaker.title } }),
    },
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get('sport'); // Optional: filter to specific sport (single)
    const sportsParam = searchParams.get('sports'); // Optional: comma-separated list of sports
    const apiKey = process.env.ODDS_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json({
        data: [],
        sports: [],
        error: 'ODDS_API_KEY not configured. Get a free key at https://the-odds-api.com',
      });
    }

    // Debug: Log API key status (without exposing the key)
    console.log(`API Key configured: ${apiKey ? 'Yes' : 'No'}, Length: ${apiKey?.length || 0}`);

    // Determine which sports to fetch
    let sportsToFetch: string[];
    if (sportsParam) {
      // Comma-separated list from arbitrage route (optimized - only sports with Polymarket matches)
      sportsToFetch = sportsParam.split(',').map(s => s.trim()).filter(Boolean);
      console.log(`Fetching only requested sports: ${sportsToFetch.join(', ')}`);
    } else if (sport) {
      // Single sport parameter
      sportsToFetch = [sport];
    } else {
      // Default: all sports (for direct API access)
      sportsToFetch = SPORTS_TO_FETCH;
    }
    const allEvents: NormalizedOdds[] = [];
    const availableSports: { key: string; title: string }[] = [];
    let remainingCredits: number | undefined;

    // Test API key first with a simple request
    try {
      const testUrl = `${ODDS_API_BASE}/sports?apiKey=${apiKey}`;
      const testResponse = await fetch(testUrl, {
        headers: { 'Accept': 'application/json' },
        cache: 'no-store',
      });
      
      if (testResponse.status === 401) {
        const testError = await testResponse.json().catch(() => ({}));
        console.error('API Key test failed:', testError);
        return NextResponse.json({
          data: [],
          sports: [],
          error: `API key authentication failed. Status: ${testResponse.status}. Error: ${JSON.stringify(testError)}. Please verify your ODDS_API_KEY is correct and has not expired.`,
          details: testError,
        }, { status: 401 });
      }
      
      if (!testResponse.ok) {
        console.warn(`API key test returned ${testResponse.status}`);
      } else {
        console.log('API key test passed');
      }
    } catch (testError) {
      console.error('Error testing API key:', testError);
    }

    // Fetch odds for each sport
    for (const sportKey of sportsToFetch) {
      try {
        const url = new URL(`${ODDS_API_BASE}/sports/${sportKey}/odds`);
        url.searchParams.set('apiKey', apiKey);
        url.searchParams.set('regions', 'us,us2,uk,au'); // Multiple regions to find Pinnacle
        url.searchParams.set('markets', 'h2h'); // Moneyline/head-to-head
        url.searchParams.set('oddsFormat', 'american');
        // Note: The Odds API doesn't support filtering by bookmaker in the request,
        // so we filter in normalizeOdds function

        const response = await fetch(url.toString(), {
          headers: { 'Accept': 'application/json' },
          cache: 'no-store',
        });

        // Get remaining credits from headers
        const creditsHeader = response.headers.get('x-requests-remaining');
        if (creditsHeader) {
          remainingCredits = parseInt(creditsHeader, 10);
          // If we're out of credits, The Odds API returns 401
          if (remainingCredits === 0 && response.status === 401) {
            return NextResponse.json({
              data: [],
              sports: [],
              error: 'Out of API credits. Your free tier (500/month) has been exhausted. Please upgrade at https://the-odds-api.com or wait for monthly reset.',
              remainingCredits: 0,
            }, { status: 401 });
          }
        }

        if (!response.ok) {
          // Handle 401 specifically (unauthorized - invalid API key OR out of credits)
          if (response.status === 401) {
            let errorData: any = {};
            try {
              const text = await response.text();
              errorData = JSON.parse(text);
            } catch {
              // Not JSON, use as text
            }
            
            console.error(`401 Unauthorized for ${sportKey}:`, {
              status: response.status,
              statusText: response.statusText,
              errorData,
              url: url.toString().replace(apiKey, 'REDACTED'),
            });
            
            return NextResponse.json({
              data: [],
              sports: [],
              error: `Invalid API key. The Odds API returned 401 Unauthorized for ${sportKey}. Error: ${errorData.message || errorData.error || 'Authentication failed'}. Please verify your ODDS_API_KEY in .env.local is correct and restart the server.`,
              details: errorData,
            }, { status: 401 });
          }
          
          // Handle other errors
          let errorText = 'Unknown error';
          try {
            const text = await response.text();
            errorText = text;
          } catch {}
          console.warn(`Failed to fetch ${sportKey}: ${response.status} - ${errorText}`);
          continue;
        }

        const events: SportsbookOdds[] = await response.json();
        
        if (events.length > 0) {
          availableSports.push({ 
            key: sportKey, 
            title: events[0].sport_title 
          });
          
          events.forEach((event) => {
            const normalized = normalizeOdds(event, 'american');
            if (normalized) {
              allEvents.push(normalized);
            }
          });
        }

        console.log(`Fetched ${events.length} events for ${sportKey}`);
      } catch (error) {
        console.warn(`Error fetching ${sportKey}:`, error);
      }
    }

    // Sort by commence time
    allEvents.sort((a, b) => 
      new Date(a.commenceTime).getTime() - new Date(b.commenceTime).getTime()
    );

    console.log(`Total sportsbook events: ${allEvents.length}`);

    return NextResponse.json({
      data: allEvents,
      sports: availableSports,
      remainingCredits,
    });
  } catch (error) {
    console.error('Error fetching sportsbook odds:', error);
    return NextResponse.json(
      {
        data: [],
        sports: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
