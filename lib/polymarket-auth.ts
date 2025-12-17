/**
 * Polymarket CLOB L2 Authentication
 * 
 * This module handles proper API key generation and HMAC signing
 * for Polymarket's CLOB API.
 * 
 * Flow:
 * 1. Sign a message with wallet to create API credentials
 * 2. Store API key, secret, passphrase
 * 3. Use HMAC-SHA256 for request signing
 */

import { ethers } from 'ethers';
import * as crypto from 'crypto';

const CLOB_API = 'https://clob.polymarket.com';

// Polygon chain ID
const CHAIN_ID = 137;

interface ApiCredentials {
  apiKey: string;
  apiSecret: string;
  passphrase: string;
}

interface ClobAuthConfig {
  key: string;
  secret: string;
  passphrase: string;
}

/**
 * Generate the EIP-712 domain and types for API key creation
 */
function getApiKeyCreationDomain() {
  return {
    name: 'ClobAuthDomain',
    version: '1',
    chainId: CHAIN_ID,
  };
}

function getApiKeyCreationTypes() {
  return {
    ClobAuth: [
      { name: 'address', type: 'address' },
      { name: 'timestamp', type: 'string' },
      { name: 'nonce', type: 'uint256' },
      { name: 'message', type: 'string' },
    ],
  };
}

/**
 * Create API credentials by signing with wallet
 */
export async function createApiCredentials(wallet: ethers.Wallet): Promise<ApiCredentials | null> {
  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = 0;
    const message = 'This message attests that I control the given wallet';

    const domain = getApiKeyCreationDomain();
    const types = getApiKeyCreationTypes();
    const value = {
      address: wallet.address,
      timestamp,
      nonce,
      message,
    };

    // Sign the typed data
    const signature = await wallet._signTypedData(domain, types, value);

    // Request API key from CLOB
    const response = await fetch(`${CLOB_API}/auth/api-key`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: wallet.address,
        timestamp,
        nonce,
        message,
        signature,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to create API key:', response.status, errorText);
      return null;
    }

    const result = await response.json() as ApiCredentials;
    console.log('API credentials created successfully');
    return result;
  } catch (e) {
    console.error('Error creating API credentials:', e);
    return null;
  }
}

/**
 * Derive API credentials from existing ones (for subsequent uses)
 */
export async function deriveApiCredentials(wallet: ethers.Wallet): Promise<ApiCredentials | null> {
  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = 0;
    const message = 'This message attests that I control the given wallet';

    const domain = getApiKeyCreationDomain();
    const types = getApiKeyCreationTypes();
    const value = {
      address: wallet.address,
      timestamp,
      nonce,
      message,
    };

    const signature = await wallet._signTypedData(domain, types, value);

    // Derive existing API key
    const response = await fetch(`${CLOB_API}/auth/derive-api-key`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: wallet.address,
        timestamp,
        nonce,
        message,
        signature,
      }),
    });

    if (!response.ok) {
      // If derive fails, try creating new credentials
      console.log('Derive failed, creating new API key...');
      return await createApiCredentials(wallet);
    }

    const result = await response.json() as ApiCredentials;
    return result;
  } catch (e) {
    console.error('Error deriving API credentials:', e);
    return null;
  }
}

/**
 * Create HMAC signature for L2 authentication
 */
export function createL2Signature(
  secret: string,
  timestamp: string,
  method: string,
  path: string,
  body: string = ''
): string {
  const message = timestamp + method + path + body;
  const hmac = crypto.createHmac('sha256', Buffer.from(secret, 'base64'));
  hmac.update(message);
  return hmac.digest('base64');
}

/**
 * Create L2 authentication headers
 */
export function createL2Headers(
  credentials: ClobAuthConfig,
  method: string,
  path: string,
  body: string = ''
): Record<string, string> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = createL2Signature(credentials.secret, timestamp, method, path, body);

  return {
    'POLY_ADDRESS': '',  // Not needed for L2
    'POLY_API_KEY': credentials.key,
    'POLY_SIGNATURE': signature,
    'POLY_TIMESTAMP': timestamp,
    'POLY_PASSPHRASE': credentials.passphrase,
  };
}

/**
 * Full authentication flow
 */
export class PolymarketAuth {
  private wallet: ethers.Wallet | null = null;
  private credentials: ApiCredentials | null = null;
  private isInitialized = false;

  async initialize(privateKey: string): Promise<boolean> {
    try {
      this.wallet = new ethers.Wallet(privateKey);
      console.log(`Wallet initialized: ${this.wallet.address}`);

      // Try to derive existing credentials, or create new ones
      this.credentials = await deriveApiCredentials(this.wallet);
      
      if (!this.credentials) {
        console.error('Failed to get API credentials');
        return false;
      }

      console.log('Polymarket L2 auth initialized');
      this.isInitialized = true;
      return true;
    } catch (e) {
      console.error('Auth initialization failed:', e);
      return false;
    }
  }

  getWalletAddress(): string | null {
    return this.wallet?.address || null;
  }

  createHeaders(method: string, path: string, body: string = ''): Record<string, string> {
    if (!this.credentials) {
      throw new Error('Auth not initialized');
    }
    return createL2Headers(
      {
        key: this.credentials.apiKey,
        secret: this.credentials.apiSecret,
        passphrase: this.credentials.passphrase,
      },
      method,
      path,
      body
    );
  }

  isReady(): boolean {
    return this.isInitialized && this.credentials !== null;
  }
}

// Singleton
let authInstance: PolymarketAuth | null = null;

export function getPolymarketAuth(): PolymarketAuth {
  if (!authInstance) {
    authInstance = new PolymarketAuth();
  }
  return authInstance;
}
