"""
Validation tests for Breeden-Litzenberger implementation.
Per document: ATM ~50%, deep OTM→0, deep ITM→1, touch >= expire.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from breeden_litzenberger import (
    black76_call,
    black76_put,
    compute_expire_above_probability,
    compute_touch_probability,
    interpolate_iv_variance_based,
)


def test_black76_put_call_parity():
    """Verify Black-76 implementation satisfies put-call parity."""
    C = black76_call(F=65000, K=65000, T=0.25, r=0.05, sigma=0.50)
    P = black76_put(F=65000, K=65000, T=0.25, r=0.05, sigma=0.50)
    parity_lhs = C - P
    parity_rhs = 0  # e^(-rT) * (F - K) = 0 when F=K
    assert abs(parity_lhs - parity_rhs) < 0.01, "Put-call parity violated"


def test_atm_probability():
    """At-the-money should be ~50% for expire-above (or ~45% for lognormal ATM)."""
    prob = compute_expire_above_probability(
        spot=65000,
        futures=65000,
        strike_K=65000,
        T=0.25,
        iv_at_K_minus=0.50,
        iv_at_K_plus=0.50,
        delta_K=5000,
        use_calls=True,
    )
    assert 0.40 <= prob <= 0.55, f"ATM prob should be ~0.5, got {prob}"


def test_deep_otm():
    """Deep OTM should have probability near 0."""
    prob = compute_expire_above_probability(
        spot=65000,
        futures=65000,
        strike_K=100000,
        T=0.25,
        iv_at_K_minus=0.50,
        iv_at_K_plus=0.50,
        delta_K=5000,
        use_calls=True,
    )
    assert prob < 0.05, f"Deep OTM prob should be near 0, got {prob}"


def test_deep_itm():
    """Deep ITM should have probability near 1."""
    prob = compute_expire_above_probability(
        spot=65000,
        futures=65000,
        strike_K=40000,
        T=0.25,
        iv_at_K_minus=0.50,
        iv_at_K_plus=0.50,
        delta_K=5000,
        use_calls=False,
    )
    assert prob > 0.95, f"Deep ITM prob should be near 1, got {prob}"


def test_touch_vs_expire():
    """Touch probability must be >= expire-above probability."""
    prob_expire = compute_expire_above_probability(
        spot=65000,
        futures=65000,
        strike_K=70000,
        T=0.25,
        iv_at_K_minus=0.50,
        iv_at_K_plus=0.50,
        delta_K=5000,
        use_calls=True,
    )
    prob_touch = compute_touch_probability(
        spot=65000,
        futures=65000,
        barrier_B=70000,
        T=0.25,
        iv_at_barrier=0.50,
        direction='above',
    )
    assert prob_touch >= prob_expire, f"Touch {prob_touch} must be >= expire {prob_expire}"


def test_interpolate_iv_variance_based():
    """Variance-based interpolation returns valid IVs."""
    strike_grid = [55000, 60000, 65000, 70000]
    iv_grid = [0.55, 0.52, 0.50, 0.52]
    iv_minus, iv_at_K, iv_plus = interpolate_iv_variance_based(
        60000, strike_grid, iv_grid, T=0.25, delta_K=5000
    )
    assert iv_minus > 0 and iv_at_K > 0 and iv_plus > 0
    assert 0.3 < iv_minus < 1.0 and 0.3 < iv_at_K < 1.0 and 0.3 < iv_plus < 1.0


if __name__ == '__main__':
    test_black76_put_call_parity()
    test_atm_probability()
    test_deep_otm()
    test_deep_itm()
    test_touch_vs_expire()
    test_interpolate_iv_variance_based()
    print("All tests passed!")
