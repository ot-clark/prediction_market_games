"""
Breeden-Litzenberger probability extraction and one-touch formulas.

Implements risk-neutral probabilities from Deribit options using:
- Breeden-Litzenberger for European (expire-above) probabilities
- Proper one-touch formula for path-dependent contracts
- Variance-based IV interpolation for volatility smile

Reference: Document on fundamental formulas (triple-checked).
"""

import math
from typing import Dict, List, Optional, Tuple
from scipy.stats import norm


def black76_call(F: float, K: float, T: float, r: float, sigma: float) -> float:
    """Black-76 call option price on futures."""
    if T <= 0 or sigma <= 0 or F <= 0 or K <= 0:
        return 0.0
    sqrt_t = math.sqrt(T)
    d1 = (math.log(F / K) + 0.5 * sigma**2 * T) / (sigma * sqrt_t)
    d2 = d1 - sigma * sqrt_t
    return math.exp(-r * T) * (F * norm.cdf(d1) - K * norm.cdf(d2))


def black76_put(F: float, K: float, T: float, r: float, sigma: float) -> float:
    """Black-76 put option price on futures."""
    if T <= 0 or sigma <= 0 or F <= 0 or K <= 0:
        return 0.0
    sqrt_t = math.sqrt(T)
    d1 = (math.log(F / K) + 0.5 * sigma**2 * T) / (sigma * sqrt_t)
    d2 = d1 - sigma * sqrt_t
    return math.exp(-r * T) * (K * norm.cdf(-d2) - F * norm.cdf(-d1))


def extract_risk_free_rate(spot: float, futures: float, T: float) -> float:
    """r = (1/T) * ln(F/S). Futures = Spot * e^(rT) in Black-76."""
    if T <= 0 or spot <= 0:
        return 0.0
    if futures <= 0:
        return 0.0
    return math.log(futures / spot) / T


def interpolate_iv_variance_based(
    strike_K: float,
    strike_grid: List[float],
    iv_grid: List[float],
    T: float,
    delta_K: float,
) -> Tuple[float, float, float]:
    """
    Interpolate IV at K-delta_K, K, K+delta_K using variance (σ²T).
    Returns (iv_at_K_minus, iv_at_K, iv_at_K_plus).
    """
    if not strike_grid or not iv_grid or len(strike_grid) != len(iv_grid):
        return 0.0, 0.0, 0.0
    if T <= 0:
        return 0.0, 0.0, 0.0

    K_minus = strike_K - delta_K
    K_plus = strike_K + delta_K

    variance_grid = [iv**2 * T for iv in iv_grid]

    def interp_var(k: float) -> float:
        if k <= min(strike_grid):
            return variance_grid[0]
        if k >= max(strike_grid):
            return variance_grid[-1]
        for i in range(len(strike_grid) - 1):
            if strike_grid[i] <= k <= strike_grid[i + 1]:
                t = (k - strike_grid[i]) / (strike_grid[i + 1] - strike_grid[i])
                return variance_grid[i] + t * (variance_grid[i + 1] - variance_grid[i])
        return variance_grid[0]

    var_minus = interp_var(K_minus)
    var_K = interp_var(strike_K)
    var_plus = interp_var(K_plus)

    iv_minus = math.sqrt(var_minus / T) if var_minus > 0 else 0
    iv_K = math.sqrt(var_K / T) if var_K > 0 else 0
    iv_plus = math.sqrt(var_plus / T) if var_plus > 0 else 0

    return iv_minus, iv_K, iv_plus


def compute_expire_above_probability(
    spot: float,
    futures: float,
    strike_K: float,
    T: float,
    iv_at_K_minus: float,
    iv_at_K_plus: float,
    delta_K: float,
    use_calls: bool,
) -> float:
    """
    P(S_T > K) using Breeden-Litzenberger.
    use_calls=True when K >= F (OTM call), use_calls=False when K < F (OTM put).
    """
    r = extract_risk_free_rate(spot, futures, T)

    if use_calls:
        C_upper = black76_call(F=futures, K=strike_K + delta_K, T=T, r=r, sigma=iv_at_K_plus)
        C_lower = black76_call(F=futures, K=strike_K - delta_K, T=T, r=r, sigma=iv_at_K_minus)
        digital_pv = -(C_upper - C_lower) / (2 * delta_K)
    else:
        P_upper = black76_put(F=futures, K=strike_K + delta_K, T=T, r=r, sigma=iv_at_K_plus)
        P_lower = black76_put(F=futures, K=strike_K - delta_K, T=T, r=r, sigma=iv_at_K_minus)
        digital_put_pv = (P_upper - P_lower) / (2 * delta_K)
        digital_pv = math.exp(-r * T) - digital_put_pv

    prob = digital_pv * math.exp(r * T)
    return max(0.0, min(1.0, prob))


def compute_expire_probability_gbm(
    spot: float,
    futures: float,
    strike_K: float,
    T: float,
    sigma: float,
    direction: str = 'above',
) -> float:
    """
    European (binary) probability under GBM: P(S_T > K) or P(S_T < K).
    Black-76: N(d2) for above, 1-N(d2) for below.
    """
    if T <= 0 or sigma <= 0 or futures <= 0 or strike_K <= 0:
        return 0.0
    sqrt_t = math.sqrt(T)
    d1 = (math.log(futures / strike_K) + 0.5 * sigma**2 * T) / (sigma * sqrt_t)
    d2 = d1 - sigma * sqrt_t
    prob_above = norm.cdf(d2)
    return prob_above if direction == 'above' else (1.0 - prob_above)


def compute_touch_probability(
    spot: float,
    futures: float,
    barrier_B: float,
    T: float,
    iv_at_barrier: float,
    direction: str = 'below',
) -> float:
    """
    One-touch probability under GBM: P(price touches barrier B before expiry).
    direction='above' -> up-touch (S < B), direction='below' -> down-touch (S > B).
    Formula: λ = [r + 0.5σ²] / σ², P(touch) = (S/B)^λ (up) or (B/S)^λ (down).
    """
    if T <= 0 or iv_at_barrier <= 0:
        return 0.0
    r = extract_risk_free_rate(spot, futures, T)
    sigma = iv_at_barrier

    if direction == 'above':
        if spot >= barrier_B:
            return 1.0
        lambda_param = (r + 0.5 * sigma**2) / (sigma**2)
        touch_prob = (spot / barrier_B) ** lambda_param
    else:
        if spot <= barrier_B:
            return 1.0
        lambda_param = (r + 0.5 * sigma**2) / (sigma**2)
        touch_prob = (barrier_B / spot) ** lambda_param

    return max(0.0, min(1.0, touch_prob))


def compute_touch_probability_skew_adjusted(
    spot: float,
    futures: float,
    barrier_B: float,
    T: float,
    iv_at_barrier: float,
    direction: str,
    prob_expire_bl: float,
) -> float:
    """
    Pro-Desk Touch-to-Binary adjustment: one-touch inherits skew from Breeden-Litzenberger.

    P_BL = prob_expire_bl (European from B-L, has skew from Deribit order book).
    Ratio = P_Touch_GBM / P_Expiry_GBM (touch-to-binary ratio under GBM).
    Final = P_BL × Ratio.

    This ensures the one-touch estimate inherits the skew/fear data from the smile.
    """
    if T <= 0 or iv_at_barrier <= 0 or prob_expire_bl <= 0:
        return 0.0

    touch_dir = 'above' if direction == 'above' else 'below'
    p_expiry_gbm = compute_expire_probability_gbm(
        spot, futures, barrier_B, T, iv_at_barrier, touch_dir
    )
    p_touch_gbm = compute_touch_probability(
        spot, futures, barrier_B, T, iv_at_barrier, touch_dir
    )

    if p_expiry_gbm <= 0:
        return max(0.0, min(1.0, p_touch_gbm))

    ratio = p_touch_gbm / p_expiry_gbm
    prob = prob_expire_bl * ratio
    return max(0.0, min(1.0, prob))


def get_strike_spacing(strike_K: float, symbol: str = 'BTC') -> float:
    """Deribit strike spacing: ~$5000 for BTC at these levels."""
    if symbol == 'BTC':
        if strike_K >= 100000:
            return 10000
        return 5000
    if symbol == 'ETH':
        return 500
    return max(1, strike_K * 0.05)
