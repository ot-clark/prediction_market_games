"""
Crypto Volatility Opportunity Calculator

Calculates crypto volatility trading opportunities by comparing Polymarket crypto price target markets
against model probabilities from Deribit options data (Black-76).

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
    fetch_iv_for_market,
)
from crypto_math import (
    calculate_black76_probability_itm,
    calculate_black76_d1_d2,
    calculate_edge,
    time_to_expiry_years,
    ProbabilityEstimate,
    normal_cdf,
)
from config import DEFAULT_VOLATILITY, DERIBIT_SUPPORTED

def calculate_arbitrage_opportunities(limit: int = 100) -> Dict:
    """
    Main function to calculate all crypto volatility trading opportunities
    
    This function:
    - Fetches crypto price target markets from Polymarket
    - Calculates model probabilities using Deribit options data (Black-76)
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
        
        # Calculate Deribit-based probability (Black-76 model with N(d2))
        # Uses forward price F (from Deribit future or synthetic F=C-P+K), not spot
        # IV from PUT for 'below' (dip), CALL for 'above'; strike + expiry matched to market
        deribit_prob = None
        iv_data = fetch_iv_for_market(
            market['crypto'], target_price, expiry_date, direction, deribit
        )
        if iv_data and iv_data.get('iv', 0) > 0:
            strike_iv = iv_data['iv']
            iv_source = f"{iv_data.get('option_type', 'option').upper()} {iv_data.get('instrument_name', '')}"
        else:
            # Fallback: ATM IV from deribit
            strike_iv = deribit.get('atm_iv') or DEFAULT_VOLATILITY.get(market['crypto'], 0.55)
            iv_source = 'ATM fallback'

        # Get forward F: prefer Deribit future, else synthetic F=C-P+K, else fallback to spot
        forward_data = fetch_deribit_forward_price(
            market['crypto'], expiry_date, strike=target_price
        )
        if forward_data and forward_data.get('forward'):
            forward = forward_data['forward']
            f_source = forward_data.get('source', 'unknown')
        else:
            forward = current_price  # Fallback: F ≈ S for short-dated
            f_source = 'spot_fallback'

        # Black-76: d1 = [ln(F/K) + (σ²/2)T] / (σ√T), d2 = d1 - σ√T
        # Use N(d2) = Φ(d2) for probability (NOT d2 - d2 is in std-dev units)
        d1, d2 = calculate_black76_d1_d2(forward, target_price, strike_iv, time_years)
        n_d2 = normal_cdf(d2)  # N(d2) = Φ(d2) = risk-neutral P(S_T > K)

        # Binary probability: N(d2) for "above", 1-N(d2) for "below"
        binary_prob = calculate_black76_probability_itm(
            forward, target_price, strike_iv, time_years, direction
        )

        if bet_type == 'one-touch':
            probability = min(1.0, 2 * binary_prob)
        else:
            probability = binary_prob

        # Time extrapolation: we always use T = market expiry (not option expiry)
        # When option expires before market, P(touch by T_market) > P(touch by T_option)
        option_expiry_ts = iv_data.get('expiry_timestamp') if iv_data else None
        option_expires_before_market = False
        if option_expiry_ts and expiry_date:
            from datetime import timezone
            if hasattr(expiry_date, 'timestamp'):
                market_ts = int(expiry_date.timestamp() * 1000)
            else:
                from dateutil.parser import parse
                exp = parse(expiry_date) if isinstance(expiry_date, str) else expiry_date
                if exp.tzinfo is None:
                    exp = exp.replace(tzinfo=timezone.utc)
                market_ts = int(exp.timestamp() * 1000)
            if option_expiry_ts < market_ts:
                option_expires_before_market = True

        if 0 < probability < 1:
            extrap_note = ''
            if option_expires_before_market:
                extrap_note = '\n  (Option expires before market; using market T → higher P(touch) with extra time)'
            deribit_prob = ProbabilityEstimate(
                method='deribit-black76',
                probability=probability,
                volatility_used=strike_iv,
                time_to_expiry=time_years,
                delta=binary_prob,  # P(ITM) for our direction
                math_breakdown={
                    'formula': f'P = {"2 × " if bet_type == "one-touch" else ""}N(d2), where N(d2)=Φ(d2) is the CDF (probability), not d2',
                    'steps': [
                        f'Forward (F): ${forward:,.0f} (source: {f_source})',
                        f'Target (K): ${target_price:,.0f}',
                        f'Strike IV: {strike_iv * 100:.1f}% (source: {iv_source})',
                        f'Time (T): {time_years:.4f} years (market expiry)',
                        f'd1 = [ln(F/K) + (σ²/2)T] / (σ√T) = {d1:.4f}',
                        f'd2 = d1 - σ√T = {d2:.4f} (std-dev units)',
                        f'N(d2) = Φ(d2) = {n_d2:.4f} (P(S_T > K) for call)',
                        f'P(settle) = {"1 - " if direction == "below" else ""}N(d2) = {binary_prob:.4f}',
                        (f'P(touch) ≈ 2 × P(settle) = {probability:.4f}' if bet_type == 'one-touch' else f'P(settle) = {probability:.4f}'),
                        f'Result: {probability * 100:.2f}%' + extrap_note,
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


