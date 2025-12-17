/**
 * Polymarket CLOB Client
 * 
 * Handles authentication and order placement on Polymarket's CLOB API.
 * 
 * Requires environment variables:
 * - POLYMARKET_PRIVATE_KEY: Your wallet's private key
 * - POLYMARKET_API_KEY: Your API key (optional, for API key auth)
 * - POLYMARKET_API_SECRET: Your API secret (optional)
 * - POLYMARKET_PASSPHRASE: Your API passphrase (optional)
 */

import { ethers } from 'ethers';

const CLOB_API = 'https://clob.polymarket.com';
const GAMMA_API = 'https://gamma-api.polymarket.com';

// Chain ID for Polygon
const POLYGON_CHAIN_ID = 137;

export interface OrderRequest {
  tokenId: string;       // The token ID (YES or NO outcome)
  side: 'BUY' | 'SELL';
  size: number;          // Amount in shares
  price: number;         // Price per share (0-1)
  type: 'GTC' | 'FOK' | 'GTD';  // Good til cancelled, Fill or Kill, Good til date
}

export interface Order {
  id: string;
  status: 'LIVE' | 'MATCHED' | 'CANCELLED';
  tokenId: string;
  side: 'BUY' | 'SELL';
  size: string;
  price: string;
  filledSize: string;
  createdAt: string;
}

export interface MarketTokens {
  conditionId: string;
  questionId: string;
  tokens: {
    token_id: string;
    outcome: string;  // "Yes" or "No"
    price: number;
  }[];
}

export class PolymarketClient {
  private wallet: ethers.Wallet | null = null;
  private apiKey: string | null = null;
  private apiSecret: string | null = null;
  private passphrase: string | null = null;
  private isInitialized = false;

  constructor() {
    // Will be initialized when needed
  }

  /**
   * Initialize the client with credentials
   */
  async initialize(): Promise<boolean> {
    const privateKey = process.env.POLYMARKET_PRIVATE_KEY;
    
    if (!privateKey) {
      console.error('POLYMARKET_PRIVATE_KEY not set');
      return false;
    }

    try {
      // Create wallet from private key
      this.wallet = new ethers.Wallet(privateKey);
      console.log(`Polymarket wallet initialized: ${this.wallet.address}`);
      
      // Optional API credentials
      this.apiKey = process.env.POLYMARKET_API_KEY || null;
      this.apiSecret = process.env.POLYMARKET_API_SECRET || null;
      this.passphrase = process.env.POLYMARKET_PASSPHRASE || null;
      
      this.isInitialized = true;
      return true;
    } catch (e) {
      console.error('Failed to initialize Polymarket client:', e);
      return false;
    }
  }

  /**
   * Get wallet address
   */
  getAddress(): string | null {
    return this.wallet?.address || null;
  }

  /**
   * Create L1 authentication headers (wallet signature)
   */
  private async createAuthHeaders(): Promise<Record<string, string>> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = Math.floor(Math.random() * 1000000).toString();
    
    // Create message to sign
    const message = `${timestamp}${nonce}`;
    const signature = await this.wallet.signMessage(message);

    return {
      'POLY_ADDRESS': this.wallet.address,
      'POLY_SIGNATURE': signature,
      'POLY_TIMESTAMP': timestamp,
      'POLY_NONCE': nonce,
    };
  }

  /**
   * Get market token IDs for a given condition ID
   */
  async getMarketTokens(conditionId: string): Promise<MarketTokens | null> {
    try {
      const response = await fetch(`${GAMMA_API}/markets/${conditionId}`);
      if (!response.ok) {
        console.error('Failed to fetch market tokens:', response.status);
        return null;
      }
      
      const data = await response.json();
      
      // Parse token IDs from clobTokenIds
      let tokenIds: string[] = [];
      if (data.clobTokenIds) {
        try {
          tokenIds = JSON.parse(data.clobTokenIds);
        } catch {
          tokenIds = [data.clobTokenIds];
        }
      }
      
      return {
        conditionId: data.conditionId,
        questionId: data.questionId,
        tokens: [
          { token_id: tokenIds[0], outcome: 'Yes', price: data.outcomePrices?.[0] || 0.5 },
          { token_id: tokenIds[1], outcome: 'No', price: data.outcomePrices?.[1] || 0.5 },
        ],
      };
    } catch (e) {
      console.error('Error fetching market tokens:', e);
      return null;
    }
  }

  /**
   * Get current order book for a token
   */
  async getOrderBook(tokenId: string): Promise<{ bids: any[]; asks: any[] } | null> {
    try {
      const response = await fetch(`${CLOB_API}/book?token_id=${tokenId}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (e) {
      console.error('Error fetching order book:', e);
      return null;
    }
  }

  /**
   * Get best bid/ask prices
   */
  async getBestPrices(tokenId: string): Promise<{ bestBid: number; bestAsk: number } | null> {
    const book = await this.getOrderBook(tokenId);
    if (!book) return null;

    const bestBid = book.bids?.[0]?.price ? parseFloat(book.bids[0].price) : 0;
    const bestAsk = book.asks?.[0]?.price ? parseFloat(book.asks[0].price) : 1;

    return { bestBid, bestAsk };
  }

  /**
   * Place an order on Polymarket
   * 
   * NOTE: This is a simplified implementation. Full implementation requires
   * proper EIP-712 signing according to Polymarket's specifications.
   */
  async placeOrder(order: OrderRequest): Promise<Order | null> {
    if (!this.isInitialized || !this.wallet) {
      console.error('Client not initialized');
      return null;
    }

    try {
      console.log(`Placing ${order.side} order: ${order.size} shares @ ${order.price}`);
      
      // Get auth headers
      const authHeaders = await this.createAuthHeaders();
      
      // Create order payload
      const orderPayload = {
        tokenID: order.tokenId,
        side: order.side,
        size: order.size.toString(),
        price: order.price.toString(),
        type: order.type,
        feeRateBps: '0',  // No additional fee
      };

      const response = await fetch(`${CLOB_API}/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Order placement failed:', response.status, errorText);
        return null;
      }

      const result = await response.json();
      console.log('Order placed:', result);
      return result;
    } catch (e) {
      console.error('Error placing order:', e);
      return null;
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string): Promise<boolean> {
    if (!this.isInitialized || !this.wallet) {
      return false;
    }

    try {
      const authHeaders = await this.createAuthHeaders();
      
      const response = await fetch(`${CLOB_API}/order/${orderId}`, {
        method: 'DELETE',
        headers: authHeaders,
      });

      return response.ok;
    } catch (e) {
      console.error('Error cancelling order:', e);
      return false;
    }
  }

  /**
   * Get user's open orders
   */
  async getOpenOrders(): Promise<Order[]> {
    if (!this.isInitialized || !this.wallet) {
      return [];
    }

    try {
      const authHeaders = await this.createAuthHeaders();
      
      const response = await fetch(`${CLOB_API}/orders?status=LIVE`, {
        headers: authHeaders,
      });

      if (!response.ok) return [];
      return await response.json();
    } catch (e) {
      console.error('Error fetching orders:', e);
      return [];
    }
  }

  /**
   * Get user's positions
   */
  async getPositions(): Promise<any[]> {
    if (!this.isInitialized || !this.wallet) {
      return [];
    }

    try {
      const authHeaders = await this.createAuthHeaders();
      
      const response = await fetch(`${CLOB_API}/positions`, {
        headers: authHeaders,
      });

      if (!response.ok) return [];
      return await response.json();
    } catch (e) {
      console.error('Error fetching positions:', e);
      return [];
    }
  }
}

// Singleton instance
let clientInstance: PolymarketClient | null = null;

export function getPolymarketClient(): PolymarketClient {
  if (!clientInstance) {
    clientInstance = new PolymarketClient();
  }
  return clientInstance;
}
