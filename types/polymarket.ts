export interface PolymarketMarket {
  id: string;
  question: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  active?: boolean;
  archived?: boolean;
  closed?: boolean;
  acceptingOrders?: boolean;
  liquidity?: string;
  volume?: string;
  volume24h?: string;
  outcomes?: string[];
  outcomePrices?: string[] | Record<string, string>;
  endDateISO?: string;
  startDateISO?: string;
  conditionId?: string;
  questionId?: string;
  tokens?: {
    [key: string]: {
      price?: string;
      bid?: string;
      ask?: string;
      spread?: string;
      volume24h?: string;
      liquidity?: string;
      tokenId?: string;
    };
  };
}

export interface PolymarketResponse {
  data?: PolymarketMarket[];
  count?: number;
  error?: string;
  details?: string;
}
