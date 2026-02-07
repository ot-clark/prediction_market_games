"""
Crypto Arbitrage Math Library

Contains all probability calculation functions for comparing
Polymarket prices vs options-implied probabilities.

Based on the methodology from Moontower's article:
https://moontower.substack.com/p/from-everything-computer-to-everything
"""

import math
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime, timezone
from scipy.stats import norm

# ============================================================================
# STANDARD NORMAL DISTRIBUTION FUNCTIONS
# ============================================================================

def normal_cdf(x: float) -> float:
    """Standard Normal CDF using scipy"""
    return norm.cdf(x)

def normal_pdf(x: float) -> float:
    """Standard Normal PDF"""
    return norm.pdf(x)

def normal_inverse_cdf(p: float) -> float:
    """Inverse Standard Normal CDF (Quantile Function)"""
    if p <= 0:
        return float('-inf')
    if p >= 1:
        return float('inf')
    return norm.ppf(p)

# ============================================================================
# TIME CALCULATIONS
# ============================================================================

def _ensure_aware(dt):
    """Ensure datetime is timezone-aware (UTC). Naive datetimes treated as UTC."""
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


def time_to_expiry_years(expiry_date, from_date=None):
    """Calculate time to expiry in years"""
    if from_date is None:
        from_date = datetime.now(timezone.utc)
    
    if isinstance(expiry_date, str):
        from dateutil.parser import parse
        expiry_date = parse(expiry_date)
    if isinstance(from_date, str):
        from dateutil.parser import parse
        from_date = parse(from_date)
    
    expiry_date = _ensure_aware(expiry_date)
    from_date = _ensure_aware(from_date)
    diff_ms = (expiry_date - from_date).total_seconds() * 1000
    ms_per_year = 365.25 * 24 * 60 * 60 * 1000
    return max(0, diff_ms / ms_per_year)

def time_to_expiry_days(expiry_date, from_date=None):
    """Calculate time to expiry in days"""
    if from_date is None:
        from_date = datetime.now(timezone.utc)
    
    if isinstance(expiry_date, str):
        from dateutil.parser import parse
        expiry_date = parse(expiry_date)
    if isinstance(from_date, str):
        from dateutil.parser import parse
        from_date = parse(from_date)
    
    expiry_date = _ensure_aware(expiry_date)
    from_date = _ensure_aware(from_date)
    diff_ms = (expiry_date - from_date).total_seconds() * 1000
    ms_per_day = 24 * 60 * 60 * 1000
    return max(0, diff_ms / ms_per_day)

@dataclass
class ProbabilityEstimate:
    """Probability estimate with metadata"""
    method: str
    probability: float
    volatility_used: float
    time_to_expiry: float
    z_score: Optional[float] = None
    delta: Optional[float] = None
    math_breakdown: Optional[Dict] = None

# ============================================================================
# BLACK-76 MODEL (options on futures - matches Deribit)
# ============================================================================

def calculate_black76_d1_d2(
    forward: float,
    strike: float,
    volatility: float,
    time_years: float
) -> Tuple[float, float]:
    """
    Black-76 model d1 and d2 (options on futures).
    Deribit uses Black-76 with forward prices.

    d1 = [ln(F/K) + (σ²/2)T] / (σ√T)
    d2 = d1 - σ√T

    N(d2) = risk-neutral probability of expiring ITM (S_T > K for call).
    """
    if time_years <= 0 or volatility <= 0 or forward <= 0 or strike <= 0:
        return 0.0, 0.0

    sqrt_t = math.sqrt(time_years)
    d1 = (math.log(forward / strike) + 0.5 * volatility * volatility * time_years) / (volatility * sqrt_t)
    d2 = d1 - volatility * sqrt_t

    return d1, d2


def calculate_black76_probability_itm(
    forward: float,
    strike: float,
    volatility: float,
    time_years: float,
    direction: str = 'above'
) -> float:
    """
    Risk-neutral probability of expiring in the money using Black-76.
    Uses N(d2), not N(d1) - d2 gives P(S_T > K), d1 is for delta/hedge ratio.

    direction: 'above' -> P(S_T > K) = N(d2), 'below' -> P(S_T < K) = 1 - N(d2)
    """
    d1, d2 = calculate_black76_d1_d2(forward, strike, volatility, time_years)
    if direction == 'above':
        return normal_cdf(d2)
    else:
        return 1 - normal_cdf(d2)


# ============================================================================
# DELTA-BASED PROBABILITY (legacy Black-Scholes - kept for reference)
# ============================================================================

def calculate_d1_d2(
    current_price: float,
    strike_price: float,
    volatility: float,
    time_years: float,
    risk_free_rate: float = 0
) -> Tuple[float, float]:
    """
    Calculate Black-Scholes d1 and d2 values
    
    d1 = [ln(S/K) + (r + σ²/2)T] / (σ√T)
    d2 = d1 - σ√T
    """
    if time_years <= 0 or volatility <= 0:
        return 0.0, 0.0
    
    sqrt_t = math.sqrt(time_years)
    d1 = (math.log(current_price / strike_price) + (risk_free_rate + 0.5 * volatility * volatility) * time_years) / (volatility * sqrt_t)
    d2 = d1 - volatility * sqrt_t
    
    return d1, d2

def calculate_call_delta(
    current_price: float,
    strike_price: float,
    volatility: float,
    time_years: float
) -> float:
    """
    Calculate call option delta
    Delta = Φ(d1) for a call option
    """
    d1, _ = calculate_d1_d2(current_price, strike_price, volatility, time_years)
    return normal_cdf(d1)

# ============================================================================
# EDGE CALCULATION
# ============================================================================

def calculate_edge(
    polymarket_price: float,
    model_probability: float
) -> Dict:
    """
    Calculate the edge between Polymarket price and model probability
    
    Positive edge = Polymarket is overpriced (sell on Polymarket / buy options)
    Negative edge = Polymarket is underpriced (buy on Polymarket)
    """
    edge = polymarket_price - model_probability
    abs_edge = abs(edge)
    
    # Determine signal
    if abs_edge < 0.03:
        signal = 'neutral'  # Less than 3% edge - not actionable
    elif edge > 0:
        signal = 'sell'     # Polymarket overpriced - sell / take under
    else:
        signal = 'buy'      # Polymarket underpriced - buy / take over
    
    # Determine confidence
    if abs_edge > 0.10:
        confidence = 'high'   # >10% edge
    elif abs_edge > 0.05:
        confidence = 'medium' # 5-10% edge
    else:
        confidence = 'low'    # <5% edge
    
    return {
        'edge': edge,
        'signal': signal,
        'confidence': confidence
    }

# ============================================================================
# MARKET PARSING UTILITIES
# ============================================================================

def parse_crypto_market_question(question: str) -> Optional[Dict]:
    """
    Parse a Polymarket question to extract crypto target price info
    
    Examples:
    - "Will Bitcoin hit $200,000 by December 31, 2025?"
    - "BTC above $150k on Jan 1, 2026"
    - "Will Ethereum reach $10,000 before 2026?"
    """
    import re
    from datetime import datetime
    
    q = question.lower()

    # 1. Non-spot market indicators - skip FDV, market cap, TVL, etc.
    non_spot_patterns = [
        r'market\s*cap',
        r'marketcap',
        r'\bfdv\b',
        r'\btvl\b',
        r'\bmcap\b',
        r'fully\s*diluted',
        r'dominance',
        r'\bfee[s]?\b',
        r'\bgas\b',
        r'\bstaking\b',
        r'\bairdrop\b',
        r'\betf\b',
        r'\bhalving\b',
    ]
    for pattern in non_spot_patterns:
        if re.search(pattern, q):
            return None

    # 2. Compound/derivative tokens - must exclude BEFORE matching ETH/BTC
    # These contain "eth"/"btc" but are different assets (MegaETH, wETH, stETH, etc.)
    compound_token_patterns = [
        r'mega\s*eth',
        r'megaeth',
        r'\bweth\b',
        r'\bsteth\b',
        r'\breth\b',
        r'\bcbeth\b',
        r'\bwsteth\b',
        r'\bwbtc\b',
        r'\btbtc\b',
        r'\brbtc\b',
    ]
    for pattern in compound_token_patterns:
        if re.search(pattern, q):
            return None

    # 3. If question has FDV/mcap/market cap context but escaped above, extra guard
    if re.search(r'\$\d+[bm]\b', q) and re.search(r'(fdv|mcap|market\s*cap|valuation)', q):
        return None

    # Check if this is a crypto price market
    crypto_patterns = [
        (r'\bbitcoin\b|\bbtc\b', 'BTC'),
        (r'\bethereum\b|\beth\b(?!er)', 'ETH'),
        (r'\bsolana\b|\bsol\b(?!ar)', 'SOL'),
        (r'\bcardano\b|\bada\b', 'ADA'),
        (r'\bdogecoin\b|\bdoge\b', 'DOGE'),
        (r'\bxrp\b|\bripple\b', 'XRP'),
        (r'\bpolygon\b|\bmatic\b', 'MATIC'),
        (r'\bavalanche\b|\bavax\b', 'AVAX'),
        (r'\bchainlink\b|\blink\b', 'LINK'),
        (r'\bpolkadot\b|\bdot\b', 'DOT'),
        (r'\blitecoin\b|\bltc\b', 'LTC'),
    ]
    
    crypto = None
    for pattern, symbol in crypto_patterns:
        if re.search(pattern, question, re.IGNORECASE):
            crypto = symbol
            break
    
    if not crypto:
        return None
    
    # Check for price target keywords
    price_keywords = r'\bprice\b|\bhit\b|\breach\b|\babove\b|\bbelow\b|\bexceed\b|\bsurpass\b|\$|\bover\b|\bunder\b|\bdip\b'
    if not re.search(price_keywords, question, re.IGNORECASE):
        return None
    
    # Extract price target
    price_patterns = [
        (r'\$?([\d,]+(?:\.\d+)?)\s*k', lambda m: float(m.group(1).replace(',', '')) * 1000),
        (r'\$?([\d,]+(?:\.\d+)?)\s*(?:thousand)', lambda m: float(m.group(1).replace(',', '')) * 1000),
        (r'\$([\d,]+(?:\.\d+)?)', lambda m: float(m.group(1).replace(',', ''))),
        (r'([\d,]+(?:\.\d+)?)\s*(?:dollars?|usd)', lambda m: float(m.group(1).replace(',', ''))),
    ]
    
    target_price = None
    for pattern, extractor in price_patterns:
        match = re.search(pattern, question, re.IGNORECASE)
        if match:
            try:
                price = extractor(match)
                if price > 0:
                    target_price = price
                    break
            except:
                continue
    
    if not target_price:
        return None
    
    # Determine bet type
    one_touch_keywords = r'hit|reach|touch|surpass|exceed|dip|drop|crash'
    bet_type = 'one-touch' if re.search(one_touch_keywords, question, re.IGNORECASE) else 'binary'
    
    # Determine direction
    below_keywords = r'below|under|less than|fall|dip|drop|crash|sink|plunge|decline'
    direction = 'below' if re.search(below_keywords, question, re.IGNORECASE) else 'above'
    
    # Extract expiry date (simplified - would need more robust parsing)
    expiry_date = None
    # Try to parse year
    year_match = re.search(r'20\d{2}', question)
    if year_match:
        year = int(year_match.group())
        # Default to end of year
        expiry_date = datetime(year, 12, 31, 23, 59, 59)
    
    return {
        'crypto': crypto,
        'target_price': target_price,
        'expiry_date': expiry_date,
        'bet_type': bet_type,
        'direction': direction,
    }

