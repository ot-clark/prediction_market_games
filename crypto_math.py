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
from datetime import datetime
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

def time_to_expiry_years(expiry_date, from_date=None):
    """Calculate time to expiry in years"""
    if from_date is None:
        from_date = datetime.now()
    
    if isinstance(expiry_date, str):
        from dateutil.parser import parse
        expiry_date = parse(expiry_date)
    if isinstance(from_date, str):
        from dateutil.parser import parse
        from_date = parse(from_date)
    
    diff_ms = (expiry_date - from_date).total_seconds() * 1000
    ms_per_year = 365.25 * 24 * 60 * 60 * 1000
    return max(0, diff_ms / ms_per_year)

def time_to_expiry_days(expiry_date, from_date=None):
    """Calculate time to expiry in days"""
    if from_date is None:
        from_date = datetime.now()
    
    if isinstance(expiry_date, str):
        from dateutil.parser import parse
        expiry_date = parse(expiry_date)
    if isinstance(from_date, str):
        from dateutil.parser import parse
        from_date = parse(from_date)
    
    diff_ms = (expiry_date - from_date).total_seconds() * 1000
    ms_per_day = 24 * 60 * 60 * 1000
    return max(0, diff_ms / ms_per_day)

# ============================================================================
# Z-SCORE METHOD
# ============================================================================

def calculate_z_score(current_price: float, target_price: float, volatility: float, time_years: float) -> float:
    """
    Calculate the z-score (number of standard deviations) for a price target
    
    Formula: z = ln(target/current) / (σ × √T)
    """
    if current_price <= 0 or target_price <= 0 or volatility <= 0 or time_years <= 0:
        return float('inf') if target_price > current_price else float('-inf')
    
    log_return = math.log(target_price / current_price)
    scaled_vol = volatility * math.sqrt(time_years)
    
    return log_return / scaled_vol

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

def calculate_z_score_probability(
    current_price: float,
    target_price: float,
    volatility: float,
    time_years: float
) -> ProbabilityEstimate:
    """
    Calculate probability of price exceeding target using z-score method
    (Binary "settle above" bet)
    """
    z_score = calculate_z_score(current_price, target_price, volatility, time_years)
    
    # P(price > target) = 1 - Φ(z)
    probability = 1 - normal_cdf(z_score)
    
    # Build math breakdown
    log_return = math.log(target_price / current_price)
    scaled_vol = volatility * math.sqrt(time_years)
    
    math_breakdown = {
        'formula': 'P(S_T > K) = 1 - Φ(z), where z = ln(K/S) / (σ√T)',
        'steps': [
            f'Current price (S): ${current_price:,.0f}',
            f'Target price (K): ${target_price:,.0f}',
            f'Volatility (σ): {volatility * 100:.1f}%',
            f'Time to expiry (T): {time_years:.4f} years ({int(time_years * 365)} days)',
            '',
            'Step 1: Calculate log return',
            f'  ln(K/S) = ln({target_price}/{current_price}) = {log_return:.4f}',
            '',
            'Step 2: Scale volatility by √T',
            f'  σ√T = {volatility:.3f} × √{time_years:.4f} = {scaled_vol:.4f}',
            '',
            'Step 3: Calculate z-score',
            f'  z = {log_return:.4f} / {scaled_vol:.4f} = {z_score:.4f}',
            '',
            'Step 4: Convert to probability',
            f'  P(S > K) = 1 - Φ({z_score:.4f}) = 1 - {normal_cdf(z_score):.4f} = {probability:.4f}',
            '',
            f'Result: {probability * 100:.2f}% probability of exceeding target',
        ],
        'result': probability,
    }
    
    return ProbabilityEstimate(
        method='zscore',
        probability=probability,
        volatility_used=volatility,
        time_to_expiry=time_years,
        z_score=z_score,
        math_breakdown=math_breakdown
    )

def calculate_one_touch_probability(
    current_price: float,
    target_price: float,
    volatility: float,
    time_years: float
) -> ProbabilityEstimate:
    """
    Calculate probability of price touching target at any point before expiry
    (One-touch bet)
    
    Trader's rule of thumb: P(touch) ≈ 2 × Delta of vanilla option
    """
    z_score = calculate_z_score(current_price, target_price, volatility, time_years)
    
    # Determine if this is upward or downward touch
    is_upward = target_price > current_price
    
    # For upward: P(touch) = 2 × P(settle above) = 2 × (1 - Φ(z))
    # For downward: P(touch) = 2 × P(settle below) = 2 × Φ(z)
    binary_prob = (1 - normal_cdf(z_score)) if is_upward else normal_cdf(z_score)
    
    # One-touch approximation: 2 × binary probability, capped at 1.0
    one_touch_prob = min(1.0, 2 * binary_prob)
    
    direction = 'upward' if is_upward else 'downward'
    settle_direction = 'above' if is_upward else 'below'
    
    math_breakdown = {
        'formula': f'P(touch {"up" if is_upward else "down"}) ≈ 2 × P(S_T {" > " if is_upward else " < "} K)',
        'steps': [
            f'Current price (S): ${current_price:,.0f}',
            f'Target price (K): ${target_price:,.0f}',
            f'Direction: {direction} (target {" > " if is_upward else " < "} current)',
            f'Volatility (σ): {volatility * 100:.1f}%',
            f'Time to expiry (T): {time_years:.4f} years ({int(time_years * 365)} days)',
            '',
            'Step 1: Calculate z-score',
            f'  z = ln(K/S) / (σ√T) = {z_score:.4f}',
            '',
            f'Step 2: Calculate binary probability (settle {settle_direction})',
            f'  P(settle {settle_direction}) = {binary_prob:.4f}',
            '',
            'Step 3: Apply one-touch rule (2x multiplier)',
            f'  P(touch) ≈ 2 × {binary_prob:.4f} = {2 * binary_prob:.4f}',
            f'  Capped at 100%' if one_touch_prob < 2 * binary_prob else '',
            '',
            f'Result: {one_touch_prob * 100:.2f}% probability of touching ${target_price:,.0f}',
        ],
        'result': one_touch_prob,
    }
    
    # Filter out empty strings
    math_breakdown['steps'] = [s for s in math_breakdown['steps'] if s]
    
    return ProbabilityEstimate(
        method='zscore',
        probability=one_touch_prob,
        volatility_used=volatility,
        time_to_expiry=time_years,
        z_score=z_score,
        math_breakdown=math_breakdown
    )

# ============================================================================
# DELTA-BASED PROBABILITY (using Deribit data)
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
    
    # Exclusion patterns - skip markets that aren't about crypto spot prices
    exclusion_patterns = [
        r'market\s*cap',
        r'\bfdv\b',
        r'\btvl\b',
        r'\bmcap\b',
        r'dominance',
        r'\bfee[s]?\b',
        r'\bgas\b',
        r'\bstaking\b',
        r'\bairdrop\b',
        r'\betf\b',
        r'\bhalving\b',
        r'mega\s*eth',
        r'\bweth\b',
        r'\bsteth\b',
        r'\breth\b',
        r'\bcbeth\b',
    ]
    
    for pattern in exclusion_patterns:
        if re.search(pattern, question, re.IGNORECASE):
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

