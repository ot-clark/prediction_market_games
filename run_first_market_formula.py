#!/usr/bin/env python3
"""Run the full formula for the first market: Will Bitcoin reach $150,000 in February?"""

from data_fetchers import (
    fetch_polymarket_crypto_markets,
    fetch_crypto_prices,
    fetch_deribit_data,
    fetch_deribit_forward_price,
    fetch_iv_smile_for_breeden,
)
from crypto_math import time_to_expiry_years
from breeden_litzenberger import (
    extract_risk_free_rate,
    interpolate_iv_variance_based,
    compute_expire_above_probability,
    compute_expire_probability_gbm,
    compute_touch_probability,
    compute_touch_probability_skew_adjusted,
    get_strike_spacing,
)

def main():
    print("=" * 70)
    print("FORMULA BREAKDOWN: Will Bitcoin reach $150,000 in February?")
    print("=" * 70)

    # Fetch markets and find first one
    markets = fetch_polymarket_crypto_markets(limit=20)
    market = None
    for m in markets:
        if m["crypto"] == "BTC" and m["target_price"] == 150000 and m["direction"] == "above":
            market = m
            break
    if not market:
        print("Market not found, using hardcoded params...")
        from dateutil.parser import parse
        market = {
            "crypto": "BTC",
            "target_price": 150000,
            "direction": "above",
            "bet_type": "one-touch",
            "expiry_date": parse("2025-02-28T23:59:59Z"),
        }

    target_price = market["target_price"]
    direction = market["direction"]
    bet_type = market["bet_type"]
    expiry_date = market["expiry_date"]

    # Step 1: Get spot and forward
    prices = fetch_crypto_prices(["BTC"])
    current_price = prices.get("BTC", {}).get("current_price") or 95000

    deribit = fetch_deribit_data("BTC")
    spot = deribit.get("underlying_price") or current_price

    forward_data = fetch_deribit_forward_price("BTC", expiry_date, strike=target_price)
    forward = forward_data["forward"] if forward_data and forward_data.get("forward") else spot

    time_years = time_to_expiry_years(expiry_date)

    print(f"\n1. INPUTS")
    print(f"   Spot (S):     ${spot:,.0f}")
    print(f"   Forward (F):  ${forward:,.0f}")
    print(f"   Target (K):   ${target_price:,.0f}")
    print(f"   T (years):    {time_years:.4f}")
    print(f"   Direction:    {direction}")
    print(f"   Bet type:     {bet_type}")

    # Step 2: Risk-free rate
    r = extract_risk_free_rate(spot, forward, time_years)
    print(f"\n2. RISK-FREE RATE")
    print(f"   r = ln(F/S)/T = ln({forward:.0f}/{spot:.0f})/{time_years:.4f}")
    print(f"   r = {r:.6f} ({r*100:.4f}%)")

    # Step 3: IV smile
    use_calls = target_price >= forward
    option_type = "call" if use_calls else "put"
    smile_data = fetch_iv_smile_for_breeden("BTC", target_price, expiry_date, option_type, deribit)

    delta_K = get_strike_spacing(target_price, "BTC")

    if not smile_data or len(smile_data[0]) < 3:
        strike_iv = deribit.get("atm_iv", 0.55)
        strike_grid = [target_price - delta_K, target_price, target_price + delta_K]
        iv_grid = [strike_iv] * 3
        print(f"\n3. IV SMILE (fallback - flat ATM)")
    else:
        strike_grid, iv_grid = smile_data
        print(f"\n3. IV SMILE")
    print(f"   strike_grid: {[f'${s:,.0f}' for s in strike_grid]}")
    print(f"   iv_grid:     {[f'{iv*100:.1f}%' for iv in iv_grid]}")
    print(f"   delta_K:     ${delta_K:,.0f}")

    iv_minus, iv_at_K, iv_plus = interpolate_iv_variance_based(
        target_price, strike_grid, iv_grid, time_years, delta_K
    )
    print(f"   Interpolated: iv(K-ΔK)={iv_minus*100:.1f}%, iv(K)={iv_at_K*100:.1f}%, iv(K+ΔK)={iv_plus*100:.1f}%")

    # Step 4: Breeden-Litzenberger (European expire-above)
    prob_expire_above = compute_expire_above_probability(
        spot=spot, futures=forward, strike_K=target_price, T=time_years,
        iv_at_K_minus=iv_minus, iv_at_K_plus=iv_plus, delta_K=delta_K, use_calls=use_calls,
    )
    print(f"\n4. BREEDEN-LITZENBERGER (P(S_T > K))")
    print(f"   P(expire above K) = {prob_expire_above:.6f} ({prob_expire_above*100:.2f}%)")

    # Step 5: prob_settle (P_BL)
    prob_settle = prob_expire_above if direction == "above" else (1 - prob_expire_above)
    print(f"\n5. P_BL (prob_settle for direction={direction})")
    print(f"   P_BL = {prob_settle:.6f} ({prob_settle*100:.2f}%)")

    # Step 6: GBM Expiry and Touch (for Pro-Desk ratio)
    touch_dir = "above" if direction == "above" else "below"
    p_expiry_gbm = compute_expire_probability_gbm(
        spot, forward, target_price, time_years, iv_at_K, touch_dir
    )
    p_touch_gbm = compute_touch_probability(
        spot, forward, target_price, time_years, iv_at_K, touch_dir
    )
    print(f"\n6. GBM PROBABILITIES (single IV σ={iv_at_K*100:.1f}%)")
    print(f"   P(Expiry)_GBM = {p_expiry_gbm:.6f} ({p_expiry_gbm*100:.2f}%)")
    print(f"   P(Touch)_GBM  = {p_touch_gbm:.6f} ({p_touch_gbm*100:.2f}%)")

    # Step 7: Ratio and Final
    ratio = p_touch_gbm / p_expiry_gbm if p_expiry_gbm > 0 else 0
    probability = compute_touch_probability_skew_adjusted(
        spot, forward, target_price, time_years, iv_at_K, touch_dir, prob_settle
    )
    print(f"\n7. PRO-DESK TOUCH-TO-BINARY ADJUSTMENT")
    print(f"   Ratio = P_Touch_GBM / P_Expiry_GBM = {p_touch_gbm:.4f} / {p_expiry_gbm:.4f} = {ratio:.4f}")
    print(f"   Final = P_BL × Ratio = {prob_settle:.4f} × {ratio:.4f} = {probability:.4f}")
    print(f"   Final probability: {probability*100:.2f}%")

    # Polymarket comparison
    poly_pct = market.get("polymarket_price", 0) * 100 if market.get("polymarket_price") else 0
    print(f"\n8. COMPARISON")
    print(f"   Polymarket: {poly_pct:.1f}%")
    print(f"   Deribit:    {probability*100:.1f}%")
    print(f"   Edge:       {(poly_pct/100 - probability)*100:+.1f}%")
    print("=" * 70)

if __name__ == "__main__":
    main()
