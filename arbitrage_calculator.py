"""
Crypto Volatility Opportunity Calculator

Calculates crypto volatility trading opportunities by comparing Polymarket crypto price target markets
against model probabilities (z-score and Deribit options data).

This module focuses exclusively on crypto volatility markets - markets that bet on whether
a crypto will reach a certain price target by a certain date.
"""

import math
from typing import List, Dict, Optional
from datetime import datetime
from data_fetchers import (
    fetch_polymarket_crypto_markets,
    fetch_crypto_prices,
    fetch_deribit_data,
)
from crypto_math import (
    calculate_z_score_probability,
    calculate_one_touch_probability,
    calculate_call_delta,
    calculate_edge,
    time_to_expiry_years,
)
from config import DEFAULT_VOLATILITY, DERIBIT_SUPPORTED

def calculate_arbitrage_opportunities(limit: int = 100) -> Dict:
    """
    Main function to calculate all crypto volatility trading opportunities
    
    This function:
    - Fetches crypto price target markets from Polymarket
    - Calculates model probabilities using z-score and Deribit options data
    - Finds edges between Polymarket prices and model probabilities
    - Returns opportunities sorted by edge magnitude
    """
    # Step 1: Fetch Polymarket markets
    polymarket_markets = fetch_polymarket_crypto_markets(limit)
    print(f'Found {len(polymarket_markets)} crypto price target markets')
    
    if not polymarket_markets:
        return {
            'opportunities': [],
            'total_crypto_markets': 0,
            'supported_cryptos': list(DEFAULT_VOLATILITY.keys()),
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
        price_data = prices.get(market['crypto'])
        if not price_data:
            continue
        
        current_price = price_data['current_price']
        if not current_price or current_price <= 0:
            continue
        
        # Get volatility data
        volatility = get_volatility_data(market['crypto'], deribit_data)
        
        # Calculate time to expiry
        expiry_date = market['expiry_date']
        if isinstance(expiry_date, str):
            from dateutil.parser import parse
            expiry_date = parse(expiry_date)
        
        time_years = time_to_expiry_years(expiry_date)
        if time_years <= 0:
            continue
        
        # Calculate z-score probability
        target_price = market['target_price']
        direction = market['direction']
        bet_type = market['bet_type']
        
        if bet_type == 'one-touch':
            zscore_prob = calculate_one_touch_probability(
                current_price,
                target_price,
                volatility['volatility'],
                time_years
            )
        else:
            zscore_prob = calculate_z_score_probability(
                current_price,
                target_price,
                volatility['volatility'],
                time_years
            )
            # For "below" direction, flip the probability
            if direction == 'below':
                zscore_prob.probability = 1 - zscore_prob.probability
        
        # Calculate Deribit-based probability (if available)
        deribit_prob = None
        deribit = deribit_data.get(market['crypto'])
        
        if deribit and market['crypto'] in DERIBIT_SUPPORTED:
            # Find the closest strike IV from Deribit options chain
            iv_data = find_closest_strike_iv(deribit, target_price, expiry_date)
            
            if iv_data and iv_data['iv'] > 0:
                strike_iv = iv_data['iv']
                
                # Calculate d1 for Black-Scholes delta
                sqrt_t = (time_years ** 0.5)
                d1 = (math.log(current_price / target_price) + (0.5 * strike_iv * strike_iv) * time_years) / (strike_iv * sqrt_t)
                
                # Call delta = Φ(d1) = P(settle above target)
                call_delta = calculate_call_delta(current_price, target_price, strike_iv, time_years)
                put_delta = 1 - call_delta
                
                is_target_above = target_price > current_price
                
                if bet_type == 'one-touch':
                    # For one-touch: P(touch) ≈ 2 × delta
                    base_delta = call_delta if is_target_above else put_delta
                    probability = min(1.0, 2 * base_delta)
                else:
                    # Binary bet: P(settle above/below)
                    use_call_delta = direction == 'above'
                    probability = call_delta if use_call_delta else put_delta
                
                # Only create Deribit probability if probability is reasonable
                if 0 < probability < 1:
                    from crypto_math import ProbabilityEstimate
                    deribit_prob = ProbabilityEstimate(
                        method='deribit-delta',
                        probability=probability,
                        volatility_used=strike_iv,
                        time_to_expiry=time_years,
                        delta=call_delta if is_target_above else put_delta,
                        math_breakdown={
                            'formula': f'P({"touch" if bet_type == "one-touch" else "settle"}) = {"2 × " if bet_type == "one-touch" else ""}Δ',
                            'steps': [
                                f'Current price (S): ${current_price:,.0f}',
                                f'Target price (K): ${target_price:,.0f}',
                                f'Strike IV from Deribit: {strike_iv * 100:.1f}%',
                                f'Time to expiry (T): {time_years:.4f} years ({int(time_years * 365)} days)',
                                f'Call Delta = Φ(d1) = {call_delta:.4f}',
                                f'Put Delta = 1 - Call Delta = {put_delta:.4f}',
                                f'Result: {probability * 100:.2f}% probability',
                            ],
                            'result': probability,
                        }
                    )
        
        # Calculate edge
        polymarket_prob = market['polymarket_price']
        zscore_edge = calculate_edge(polymarket_prob, zscore_prob.probability)
        
        deribit_edge = None
        if deribit_prob:
            deribit_edge = calculate_edge(polymarket_prob, deribit_prob.probability)
        
        # Determine overall signal and confidence
        # Prefer Deribit data when available
        primary_edge = deribit_edge or zscore_edge
        
        opportunity = {
            'market': market,
            'current_price': {
                'symbol': market['crypto'],
                'price': current_price,
                'last_updated': datetime.now(),
            },
            'volatility': volatility,
            'polymarket_prob': polymarket_prob,
            'zscore_prob': {
                'method': zscore_prob.method,
                'probability': zscore_prob.probability,
                'volatility_used': zscore_prob.volatility_used,
                'time_to_expiry': zscore_prob.time_to_expiry,
                'z_score': zscore_prob.z_score,
            },
            'deribit_prob': {
                'method': deribit_prob.method,
                'probability': deribit_prob.probability,
                'volatility_used': deribit_prob.volatility_used,
                'time_to_expiry': deribit_prob.time_to_expiry,
                'delta': deribit_prob.delta,
            } if deribit_prob else None,
            'edge_vs_zscore': zscore_edge['edge'],
            'edge_vs_deribit': deribit_edge['edge'] if deribit_edge else None,
            'signal': primary_edge['signal'],
            'confidence': primary_edge['confidence'],
        }
        
        opportunities.append(opportunity)
    
    # Sort by absolute edge (highest edge first)
    opportunities.sort(
        key=lambda o: abs(o['edge_vs_deribit'] or o['edge_vs_zscore']),
        reverse=True
    )
    
    return {
        'opportunities': opportunities,
        'total_crypto_markets': len(polymarket_markets),
        'supported_cryptos': crypto_symbols,
        'last_updated': datetime.now(),
    }

def get_volatility_data(symbol: str, deribit_data: Dict) -> Dict:
    """
    Get volatility data for a crypto
    """
    deribit = deribit_data.get(symbol)
    
    if deribit and deribit.get('atm_iv', 0) > 0:
        return {
            'symbol': symbol,
            'deribit_iv': deribit['atm_iv'],
            'deribit_iv_source': 'ATM IV from Deribit',
            'default_vol': DEFAULT_VOLATILITY.get(symbol, DEFAULT_VOLATILITY['DEFAULT']),
            'source': 'deribit',
            'volatility': deribit['atm_iv'],
        }
    
    # Fall back to default volatility
    default_vol = DEFAULT_VOLATILITY.get(symbol, DEFAULT_VOLATILITY['DEFAULT'])
    return {
        'symbol': symbol,
        'default_vol': default_vol,
        'source': 'default',
        'volatility': default_vol,
    }

def find_closest_strike_iv(deribit: Dict, target_strike: float, target_expiry) -> Optional[Dict]:
    """
    Find the closest strike IV from Deribit data
    """
    import math
    
    iv_by_strike = deribit.get('iv_by_strike', {})
    if not iv_by_strike:
        # Fall back to ATM IV
        return {
            'iv': deribit.get('atm_iv', DEFAULT_VOLATILITY.get('BTC', 0.55)),
            'delta': None,
        }
    
    # Find the strike closest to our target
    strikes = list(iv_by_strike.keys())
    closest = min(strikes, key=lambda s: abs(s - target_strike))
    
    data = iv_by_strike[closest]
    if not data:
        return {
            'iv': deribit.get('atm_iv', DEFAULT_VOLATILITY.get('BTC', 0.55)),
            'delta': None,
        }
    
    # Only use the delta if the strike is close to our target (within 20%)
    strike_is_close = abs(closest - target_strike) / target_strike < 0.2
    
    return {
        'iv': data.get('call_iv') or deribit.get('atm_iv', DEFAULT_VOLATILITY.get('BTC', 0.55)),
        'delta': data.get('call_delta') if strike_is_close and data.get('call_delta') else None,
    }

