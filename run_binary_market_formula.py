#!/usr/bin/env python3
"""Walk through the math for: Will Bitcoin be above $68,000 on February 8?"""

import math
from data_fetchers import (
    fetch_polymarket_crypto_markets,
    fetch_crypto_prices,
    fetch_deribit_data,
    fetch_deribit_forward_price,
    fetch_iv_smile_for_breeden,
)
from crypto_math import time_to_expiry_years
from breeden_litzenberger import (
    black76_call,
    black76_put,
    extract_risk_free_rate,
    interpolate_iv_variance_based,
    compute_expire_above_probability,
    get_strike_spacing,
)

def main():
    print("=" * 70)
    print("MATH WALKTHROUGH: Will Bitcoin be above $68,000 on February 8?")
    print("(Binary market - European expire-above, uses Breeden-Litzenberger)")
    print("=" * 70)

    # Fetch market data
    markets = fetch_polymarket_crypto_markets(limit=30)
    market = None
    for m in markets:
        if m["crypto"] == "BTC" and m["target_price"] == 68000 and "February 8" in m.get("question", ""):
            market = m
            break

    if not market:
        print("Market not found in API, using synthetic data...")
        from dateutil.parser import parse
        market = {
            "crypto": "BTC", "target_price": 68000, "direction": "above",
            "bet_type": "binary", "expiry_date": parse("2025-02-08T23:59:59Z"),
        }

    target_price = market["target_price"]
    direction = market["direction"]
    bet_type = market["bet_type"]
    expiry_date = market["expiry_date"]

    # Step 1: Get spot, forward, T
    prices = fetch_crypto_prices(["BTC"])
    current_price = prices.get("BTC", {}).get("current_price") or 95000
    deribit = fetch_deribit_data("BTC")
    spot = deribit.get("underlying_price") or current_price
    forward_data = fetch_deribit_forward_price("BTC", expiry_date, strike=target_price)
    forward = forward_data["forward"] if forward_data and forward_data.get("forward") else spot
    time_years = time_to_expiry_years(expiry_date)
    if time_years <= 0:
        # Expired or edge case: use ~2 days for demo
        time_years = 2 / 365.25
        print("   [Note: expiry passed or T≈0, using T=2/365 for demo]")

    print(f"\n1. INPUTS")
    print(f"   Spot (S):     ${spot:,.0f}")
    print(f"   Forward (F):  ${forward:,.0f}")
    print(f"   Target (K):   ${target_price:,.0f}")
    print(f"   T (years):    {time_years:.6f} (≈{(time_years*365):.1f} days)")
    print(f"   Direction:    {direction}")
    print(f"   Bet type:     {bet_type}")

    # Step 2: Risk-free rate
    r = extract_risk_free_rate(spot, forward, time_years)
    print(f"\n2. RISK-FREE RATE")
    print(f"   r = ln(F/S) / T = ln({forward:,.0f}/{spot:,.0f}) / {time_years:.6f}")
    print(f"   r = {r:.6f} ({r*100:.4f}%)")

    # Step 3: Option type and IV smile
    use_calls = target_price >= forward
    option_type = "call" if use_calls else "put"
    print(f"\n3. OPTION CHOICE")
    print(f"   K ({target_price:,.0f}) >= F ({forward:,.0f})? {target_price >= forward}")
    print(f"   Use {option_type.upper()}s (OTM for better liquidity)")

    smile_data = fetch_iv_smile_for_breeden("BTC", target_price, expiry_date, option_type, deribit)
    delta_K = get_strike_spacing(target_price, "BTC")

    if not smile_data or len(smile_data[0]) < 3:
        strike_iv = deribit.get("atm_iv", 0.55)
        strike_grid = [target_price - delta_K, target_price, target_price + delta_K]
        iv_grid = [strike_iv] * 3
        print(f"\n4. IV SMILE (fallback - flat ATM IV)")
    else:
        strike_grid, iv_grid = smile_data
        print(f"\n4. IV SMILE (from Deribit)")
    print(f"   strike_grid: {[f'${s:,.0f}' for s in strike_grid]}")
    print(f"   iv_grid:     {[f'{iv*100:.1f}%' for iv in iv_grid]}")
    print(f"   delta_K:     ${delta_K:,.0f}")

    iv_minus, iv_at_K, iv_plus = interpolate_iv_variance_based(
        target_price, strike_grid, iv_grid, time_years, delta_K
    )
    print(f"   Interpolated at K±ΔK: iv(K-ΔK)={iv_minus*100:.2f}%, iv(K)={iv_at_K*100:.2f}%, iv(K+ΔK)={iv_plus*100:.2f}%")

    # Step 5: Breeden-Litzenberger
    print(f"\n5. BREEDEN-LITZENBERGER (∂C/∂K or ∂P/∂K)")
    print(f"   Digital = -∂C/∂K (calls) or e^(-rT) - ∂P/∂K (puts)")
    print(f"   Finite difference: ∂C/∂K ≈ (C(K+ΔK) - C(K-ΔK)) / (2·ΔK)")

    if use_calls:
        C_upper = black76_call(F=forward, K=target_price + delta_K, T=time_years, r=r, sigma=iv_plus)
        C_lower = black76_call(F=forward, K=target_price - delta_K, T=time_years, r=r, sigma=iv_minus)
        print(f"\n   C(K+ΔK) = Black76_call(F={forward:,.0f}, K={target_price+delta_K:,.0f}, T={time_years:.4f}, r={r:.4f}, σ={iv_plus:.4f})")
        print(f"   C(K+ΔK) = ${C_upper:.4f}")
        print(f"   C(K-ΔK) = Black76_call(F={forward:,.0f}, K={target_price-delta_K:,.0f}, T={time_years:.4f}, r={r:.4f}, σ={iv_minus:.4f})")
        print(f"   C(K-ΔK) = ${C_lower:.4f}")
        digital_pv = -(C_upper - C_lower) / (2 * delta_K)
        print(f"\n   ∂C/∂K ≈ (C_upper - C_lower) / (2·ΔK) = ({C_upper:.4f} - {C_lower:.4f}) / {2*delta_K:,.0f} = {(C_upper-C_lower)/(2*delta_K):.8f}")
        print(f"   Digital_PV = -∂C/∂K = {-digital_pv:.8f}")
    else:
        P_upper = black76_put(F=forward, K=target_price + delta_K, T=time_years, r=r, sigma=iv_plus)
        P_lower = black76_put(F=forward, K=target_price - delta_K, T=time_years, r=r, sigma=iv_minus)
        print(f"\n   P(K+ΔK) = Black76_put(...) = ${P_upper:.4f}")
        print(f"   P(K-ΔK) = Black76_put(...) = ${P_lower:.4f}")
        digital_put_pv = (P_upper - P_lower) / (2 * delta_K)
        digital_pv = math.exp(-r * time_years) - digital_put_pv
        print(f"   ∂P/∂K ≈ (P_upper - P_lower) / (2·ΔK) = {digital_put_pv:.8f}")
        print(f"   Digital_Call_PV = e^(-rT) - Digital_Put_PV = e^(-{r:.4f}×{time_years:.4f}) - {digital_put_pv:.6f} = {digital_pv:.8f}")

    # Step 6: Convert to probability
    prob_expire_above = compute_expire_above_probability(
        spot=spot, futures=forward, strike_K=target_price, T=time_years,
        iv_at_K_minus=iv_minus, iv_at_K_plus=iv_plus, delta_K=delta_K, use_calls=use_calls,
    )
    print(f"\n6. PROBABILITY")
    print(f"   P(S_T > K) = Digital_PV × e^(rT)")
    print(f"   P(S_T > K) = Digital_PV × e^({r:.4f} × {time_years:.4f})")
    print(f"   P(S_T > K) = {prob_expire_above:.6f} = {prob_expire_above*100:.2f}%")

    # Direction and final
    prob_settle = prob_expire_above if direction == "above" else (1 - prob_expire_above)
    print(f"\n7. RESULT (direction={direction})")
    print(f"   P(expire {'above' if direction=='above' else 'below'} K) = {prob_settle:.4f} = {prob_settle*100:.2f}%")
    poly_pct = market.get("polymarket_price", 0) * 100 if market.get("polymarket_price") else 0
    print(f"\n8. COMPARISON")
    print(f"   Polymarket: {poly_pct:.1f}%")
    print(f"   Deribit:    {prob_settle*100:.1f}%")
    print(f"   Edge:       {(poly_pct/100 - prob_settle)*100:+.1f}%")
    print("=" * 70)

if __name__ == "__main__":
    main()
