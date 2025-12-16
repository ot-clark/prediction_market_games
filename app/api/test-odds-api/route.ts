import { NextResponse } from 'next/server';

/**
 * Test endpoint to verify The Odds API key is working
 */
export async function GET() {
  const apiKey = process.env.ODDS_API_KEY?.trim();
  
  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: 'ODDS_API_KEY not found in environment variables',
      check: 'Make sure .env.local exists with ODDS_API_KEY=your_key',
    });
  }

  try {
    // Test with the sports endpoint (simplest endpoint)
    const testUrl = `https://api.the-odds-api.com/v4/sports?apiKey=${apiKey}`;
    console.log(`Testing API key (length: ${apiKey.length})...`);
    
    const response = await fetch(testUrl, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
    });

    const status = response.status;
    const headers = Object.fromEntries(response.headers.entries());
    
    let body: any = {};
    try {
      body = await response.json();
    } catch {
      body = { raw: await response.text() };
    }

    if (status === 401) {
      return NextResponse.json({
        success: false,
        status,
        error: '401 Unauthorized - Invalid API key',
        details: body,
        suggestion: 'Check your API key at https://the-odds-api.com/dashboard',
      });
    }

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        status,
        error: `API returned ${status}`,
        details: body,
      });
    }

    return NextResponse.json({
      success: true,
      status,
      message: 'API key is valid!',
      remainingCredits: headers['x-requests-remaining'],
      sportsCount: Array.isArray(body) ? body.length : 'unknown',
      sampleSports: Array.isArray(body) ? body.slice(0, 3).map((s: any) => s.title) : [],
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: String(error),
    }, { status: 500 });
  }
}
