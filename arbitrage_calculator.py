"""
Crypto Volatility Opportunity Calculator

Calculates crypto volatility trading opportunities by comparing Polymarket crypto price target markets
against model probabilities from Deribit options (Breeden-Litzenberger + Black-76).

This module focuses exclusively on crypto volatility markets - markets that bet on whether
a crypto will reach a certain price target by a certain date. Only BTC and ETH are supported
(derivatives of Deribit options).
"""

from typing import List, Dict, Optional
from datetime import datetime
from data_fetchers import (
    fetch_polymarket_crypto_markets,
    fetch_crypto_prices,
    fetch_deribit_data,
    fetch_deribit_forward_price,
    fetch_iv_smile_for_breeden,
)
from crypto_math import (
    calculate_edge,
    time_to_expiry_years,
    ProbabilityEstimate,
)
from breeden_litzenberger import (
    interpolate_iv_variance_based,
    compute_expire_above_probability,
    compute_expire_probability_gbm,
    get_strike_spacing,
)
from config import DEFAULT_VOLATILITY, DERIBIT_SUPPORTED

def calculate_arbitrage_opportunities(limit: int = 100) -> Dict:
    """
    Main function to calculate all crypto volatility trading opportunities
    
    This function:
    - Fetches crypto price target markets from Polymarket
    - Calculates model probabilities using Deribit options (Breeden-Litzenberger)
    - Finds edges between Polymarket prices and model probabilities
    - Returns opportunities sorted by edge magnitude (BTC/ETH only)
    """
    # Step 1: Fetch Polymarket markets
    polymarket_markets = fetch_polymarket_crypto_markets(limit)
    print(f'Found {len(polymarket_markets)} crypto price target markets')
    
    if not polymarket_markets:
        return {
            'opportunities': [],
            'total_crypto_markets': 0,
            'supported_cryptos': list(DERIBIT_SUPPORTED),
            'last_updated': datetime.now(),
        }
    
    # Step 2: Get unique cryptos we need prices for
    crypto_symbols = list(set(m['crypto'] for m in polymarket_markets))
    print(f'Cryptos needed: {", ".join(crypto_symbols)}')
    
    # Step 3: Fetch current prices from CoinGecko
    prices = fetch_crypto_prices(crypto_symbols)
    
    # Step 4: Fetch Deribit IV for BTC and ETH (if needed)
    deribit_data = {}
    for symbol in crypto_symbols:
        if symbol in DERIBIT_SUPPORTED:
            try:
                data = fetch_deribit_data(symbol)
                if data:
                    deribit_data[symbol] = data
                    print(f'Got Deribit data for {symbol}: ATM IV = {data["atm_iv"] * 100:.1f}%')
            except Exception as e:
                print(f'Failed to fetch Deribit data for {symbol}: {e}')
    
    # Step 5: Calculate arbitrage opportunities
    opportunities = []
    
    for market in polymarket_markets:
        # Only process BTC and ETH (Deribit-supported)
        if market['crypto'] not in DERIBIT_SUPPORTED:
            continue
        
        price_data = prices.get(market['crypto'])
        if not price_data:
            continue
        
        current_price = price_data['current_price']
        if not current_price or current_price <= 0:
            continue
        
        deribit = deribit_data.get(market['crypto'])
        if not deribit:
            continue
        
        # Calculate time to expiry
        expiry_date = market['expiry_date']
        if isinstance(expiry_date, str):
            from dateutil.parser import parse
            expiry_date = parse(expiry_date)
        
        time_years = time_to_expiry_years(expiry_date)
        if time_years <= 0:
            continue
        
        target_price = market['target_price']
        direction = market['direction']
        bet_type = market['bet_type']
        deribit_prob = None

        # Get spot and forward (futures) for Breeden-Litzenberger
        spot = deribit.get('underlying_price') or current_price
        forward_data = fetch_deribit_forward_price(
            market['crypto'], expiry_date, strike=target_price
        )
        if forward_data and forward_data.get('forward'):
            forward = forward_data['forward']
            f_source = forward_data.get('source', 'unknown')
        else:
            forward = spot
            f_source = 'spot_fallback'

        # Use calls when K >= F (OTM call), puts when K < F (OTM put)
        use_calls = target_price >= forward
        option_type = 'call' if use_calls else 'put'

        # Fetch IV smile for Breeden-Litzenberger
        smile_data = fetch_iv_smile_for_breeden(
            market['crypto'], target_price, expiry_date, option_type, deribit
        )
        delta_K = get_strike_spacing(target_price, market['crypto'])
        if not smile_data or len(smile_data[0]) < 3:
            # Fallback: flat IV from ATM
            strike_iv = deribit.get('atm_iv') or DEFAULT_VOLATILITY.get(market['crypto'], 0.55)
            strike_grid = [target_price - delta_K, target_price, target_price + delta_K]
            iv_grid = [strike_iv, strike_iv, strike_iv]
            smile_data = (strike_grid, iv_grid)

        strike_grid, iv_grid = smile_data
        iv_minus, iv_at_K, iv_plus = interpolate_iv_variance_based(
            target_price, strike_grid, iv_grid, time_years, delta_K
        )

        if iv_minus <= 0 or iv_plus <= 0:
            continue

        # Breeden-Litzenberger for European expire-above probability
        prob_expire_above = compute_expire_above_probability(
            spot=spot,
            futures=forward,
            strike_K=target_price,
            T=time_years,
            iv_at_K_minus=iv_minus,
            iv_at_K_plus=iv_plus,
            delta_K=delta_K,
            use_calls=use_calls,
        )

        # P(S_T > K) for above, P(S_T < K) = 1 - P(S_T > K) for below
        if direction == 'below':
            prob_settle = 1.0 - prob_expire_above
        else:
            prob_settle = prob_expire_above

        if bet_type == 'one-touch':
            touch_dir = 'above' if direction == 'above' else 'below'
            p_expiry_gbm = compute_expire_probability_gbm(
                spot=spot,
                futures=forward,
                strike_K=target_price,
                T=time_years,
                sigma=iv_at_K,
                direction=touch_dir,
            )
            probability = min(1.0, 2.0 * p_expiry_gbm)
        else:
            probability = prob_settle

        if 0 < probability < 1:
            deribit_prob = ProbabilityEstimate(
                method='deribit-breeden-litzenberger',
                probability=probability,
                volatility_used=iv_at_K,
                time_to_expiry=time_years,
                delta=prob_settle,
                math_breakdown={
                    'formula': f'P = {"2 × P_expiry_GBM (one-touch)" if bet_type == "one-touch" else "Breeden-Litzenberger expire-above"}',
                    'steps': [
                        f'Spot (S): ${spot:,.0f}, Forward (F): ${forward:,.0f} (source: {f_source})',
                        f'Target (K): ${target_price:,.0f}, T: {time_years:.4f} years',
                        f'r = ln(F/S)/T from futures-spot',
                        f'IV smile: interpolated at K±{delta_K:.0f} (variance-based)',
                        f'P_BL (expire {"above" if direction == "above" else "below"} K) = {prob_settle:.4f}',
                        (f'P(touch) = 2 × P_expiry_GBM = {probability:.4f}' if bet_type == 'one-touch' else f'P(settle) = {probability:.4f}'),
                        f'Result: {probability * 100:.2f}%',
                    ],
                    'result': probability,
                }
            )
        
        # Only add opportunity if we have valid Deribit probability
        if not deribit_prob:
            continue
        
        # Calculate edge
        polymarket_prob = market['polymarket_price']
        deribit_edge = calculate_edge(polymarket_prob, deribit_prob.probability)
        
        opportunity = {
            'market': market,
            'current_price': {
                'symbol': market['crypto'],
                'price': current_price,
                'last_updated': datetime.now(),
            },
            'polymarket_prob': polymarket_prob,
            'deribit_prob': {
                'method': deribit_prob.method,
                'probability': deribit_prob.probability,
                'volatility_used': deribit_prob.volatility_used,
                'time_to_expiry': deribit_prob.time_to_expiry,
                'delta': deribit_prob.delta,
            },
            'edge_vs_deribit': deribit_edge['edge'],
            'signal': deribit_edge['signal'],
            'confidence': deribit_edge['confidence'],
        }
        
        opportunities.append(opportunity)
    
    # Sort by absolute edge (highest edge first)
    opportunities.sort(key=lambda o: abs(o['edge_vs_deribit']), reverse=True)
    
    return {
        'opportunities': opportunities,
        'total_crypto_markets': len(polymarket_markets),
        'supported_cryptos': crypto_symbols,
        'last_updated': datetime.now(),
    }


