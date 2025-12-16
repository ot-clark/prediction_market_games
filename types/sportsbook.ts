// Types for sportsbook odds data

export interface SportsbookOdds {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Bookmaker[];
}

export interface Bookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: BookmakerMarket[];
}

export interface BookmakerMarket {
  key: string; // 'h2h' for moneyline, 'spreads', 'totals'
  last_update: string;
  outcomes: BookmakerOutcome[];
}

export interface BookmakerOutcome {
  name: string;
  price: number; // American odds or decimal
  point?: number; // For spreads/totals
}

// Converted to implied probability format
export interface NormalizedOdds {
  eventId: string;
  sportKey: string;
  sportTitle: string;
  commenceTime: string;
  homeTeam: string;
  awayTeam: string;
  eventName: string;
  bookmakers: NormalizedBookmaker[];
  bestOdds: {
    home: { probability: number; odds: number; bookmaker: string };
    away: { probability: number; odds: number; bookmaker: string };
    draw?: { probability: number; odds: number; bookmaker: string };
  };
}

export interface NormalizedBookmaker {
  key: string;
  name: string;
  lastUpdate: string;
  odds: {
    home: { probability: number; americanOdds: number };
    away: { probability: number; americanOdds: number };
    draw?: { probability: number; americanOdds: number };
  };
}

// Arbitrage opportunity
export interface ArbitrageOpportunity {
  polymarketEvent: {
    id: string;
    question: string;
    slug: string;
    outcomes: string[];
    prices: number[];
    bids: (number | undefined)[];
    asks: (number | undefined)[];
  };
  sportsbookEvent: NormalizedOdds;
  matchConfidence: number; // 0-1 how confident the match is
  comparison: OutcomeComparison[];
  arbitragePercent?: number; // Positive = profit opportunity
}

export interface OutcomeComparison {
  outcome: string;
  polymarketPrice: number;
  polymarketBid?: number;
  polymarketAsk?: number;
  bestSportsbookProb: number;
  bestSportsbookOdds: number;
  bestBookmaker: string;
  edgePercent: number; // Polymarket price - sportsbook prob (positive = poly overpriced)
}

// API response types
export interface SportsbookApiResponse {
  data: NormalizedOdds[];
  sports: { key: string; title: string }[];
  remainingCredits?: number;
  error?: string;
}

export interface ArbitrageApiResponse {
  opportunities: ArbitrageOpportunity[];
  totalPolymarketSports: number;
  totalSportsbookEvents: number;
  matchedEvents: number;
  error?: string;
}
