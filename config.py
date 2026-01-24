"""
Configuration constants for the prediction market arbitrage bot
"""

# CoinGecko ID mapping
COINGECKO_ID_MAP = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'SOL': 'solana',
    'ADA': 'cardano',
    'DOGE': 'dogecoin',
    'XRP': 'ripple',
    'MATIC': 'matic-network',
    'AVAX': 'avalanche-2',
    'LINK': 'chainlink',
    'DOT': 'polkadot',
    'LTC': 'litecoin',
}

# Deribit only supports BTC and ETH options
DERIBIT_SUPPORTED = ['BTC', 'ETH']

# Default volatility assumptions for cryptos without options data
DEFAULT_VOLATILITY = {
    'BTC': 0.55,   # 55% annual vol
    'ETH': 0.65,   # 65% annual vol
    'SOL': 0.85,   # 85% annual vol - higher beta
    'ADA': 0.75,
    'DOGE': 1.00,  # Very high vol
    'XRP': 0.70,
    'MATIC': 0.80,
    'AVAX': 0.80,
    'LINK': 0.75,
    'DOT': 0.75,
    'LTC': 0.65,
    'DEFAULT': 0.70,  # Fallback
}

# API endpoints
GAMMA_API = 'https://gamma-api.polymarket.com'
CLOB_API = 'https://clob.polymarket.com'
DERIBIT_API = 'https://www.deribit.com/api/v2/public'
COINGECKO_API = 'https://api.coingecko.com/api/v3'

# Polygon network
POLYGON_CHAIN_ID = 137
POLYGON_RPC = 'https://polygon-rpc.com'

# USDC addresses on Polygon
USDC_E_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'  # USDC.e (bridged) - 6 decimals
USDC_NATIVE_ADDRESS = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359'  # Native USDC - 6 decimals

# Polymarket contracts
CTF_EXCHANGE = '0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E'
NEG_RISK_CTF_EXCHANGE = '0xC5d563A36AE78145C45a50134d48A1215220f80a'
CTF_CONTRACT = '0x4D97DCd97eC945f40cF65F87097ACe5EA0476045'
QUICKSWAP_ROUTER = '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff'

