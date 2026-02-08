"""
Data fetching functions for Polymarket, CoinGecko, and Deribit APIs
"""

import requests
from typing import Dict, List, Optional, Tuple
from datetime import datetime
from config import (
    GAMMA_API, CLOB_API, DERIBIT_API, COINGECKO_API,
    COINGECKO_ID_MAP, DERIBIT_SUPPORTED, DEFAULT_VOLATILITY
)

def fetch_polymarket_crypto_markets(limit: int = 100) -> List[Dict]:
    """
    Fetch crypto price target markets from Polymarket
    """
    markets = []
    
    try:
        response = requests.get(
            f'{GAMMA_API}/markets',
            params={
                'active': 'true',
                'closed': 'false',
                'limit': limit * 3,
                'order': 'volume24hr',
                'ascending': 'false',
            },
            headers={'Accept': 'application/json'},
            timeout=30
        )
        
        if not response.ok:
            print(f'Polymarket API error: {response.status_code}')
            return []
        
        data = response.json()
        
        from crypto_math import parse_crypto_market_question
        
        for market in data:
            question = market.get('question', '')
            parsed = parse_crypto_market_question(question)
            
            if not parsed:
                continue
            
            # Get expiry date
            if not parsed.get('expiry_date') and market.get('endDate'):
                try:
                    parsed['expiry_date'] = datetime.fromisoformat(market['endDate'].replace('Z', '+00:00'))
                except:
                    continue
            
            if not parsed.get('expiry_date'):
                continue
            
            # Get the price
            polymarket_price = 0
            try:
                if market.get('outcomePrices'):
                    prices = market['outcomePrices']
                    if isinstance(prices, str):
                        import json
                        prices = json.loads(prices)
                    polymarket_price = float(prices[0]) if prices else 0
            except:
                pass
            
            # Skip if no valid price
            if polymarket_price <= 0 or polymarket_price >= 1:
                continue
            
            # Parse token IDs
            token_ids = []
            if market.get('clobTokenIds'):
                try:
                    token_ids = market['clobTokenIds']
                    if isinstance(token_ids, str):
                        import json
                        token_ids = json.loads(token_ids)
                except:
                    pass
            
            markets.append({
                'id': market.get('conditionId') or market.get('id'),
                'question': question,
                'slug': market.get('slug') or market.get('id'),
                'description': market.get('description'),
                'crypto': parsed['crypto'],
                'target_price': parsed['target_price'],
                'expiry_date': parsed['expiry_date'],
                'bet_type': parsed['bet_type'],
                'direction': parsed['direction'],
                'polymarket_price': polymarket_price,
                'volume': str(market.get('volumeNum') or market.get('volume') or ''),
                'liquidity': str(market.get('liquidity') or ''),
                'token_ids': token_ids,
            })
    except Exception as e:
        print(f'Error fetching Polymarket markets: {e}')
    
    return markets[:limit]

def fetch_crypto_prices(symbols: List[str]) -> Dict[str, Dict]:
    """
    Fetch current prices for cryptocurrencies from CoinGecko
    """
    prices = {}
    
    # Map symbols to CoinGecko IDs
    coin_ids = []
    symbol_to_id = {}
    
    for symbol in symbols:
        gecko_id = COINGECKO_ID_MAP.get(symbol.upper())
        if gecko_id:
            coin_ids.append(gecko_id)
            symbol_to_id[gecko_id] = symbol.upper()
    
    if not coin_ids:
        return prices
    
    try:
        response = requests.get(
            f'{COINGECKO_API}/coins/markets',
            params={
                'vs_currency': 'usd',
                'ids': ','.join(coin_ids),
                'order': 'market_cap_desc',
                'per_page': 100,
                'page': 1,
                'sparkline': 'false',
                'price_change_percentage': '24h',
            },
            headers={'Accept': 'application/json'},
            timeout=30
        )
        
        if not response.ok:
            if response.status_code == 429:
                print('CoinGecko rate limit exceeded')
            else:
                print(f'CoinGecko API error: {response.status_code}')
            return prices
        
        data = response.json()
        
        for coin in data:
            symbol = symbol_to_id.get(coin['id'])
            if not symbol:
                continue
            
            prices[symbol] = {
                'symbol': symbol,
                'name': coin['name'],
                'current_price': coin.get('current_price', 0),
                'price_change_24h': coin.get('price_change_24h', 0),
                'price_change_percent_24h': coin.get('price_change_percentage_24h', 0),
                'market_cap': coin.get('market_cap', 0),
                'volume_24h': coin.get('total_volume', 0),
                'high_24h': coin.get('high_24h', coin.get('current_price', 0)),
                'low_24h': coin.get('low_24h', coin.get('current_price', 0)),
                'last_updated': datetime.now(),
            }
    except Exception as e:
        print(f'Error fetching crypto prices: {e}')
    
    return prices

def fetch_deribit_forward_price(
    symbol: str,
    expiry_date,
    strike: Optional[float] = None,
    deribit_data: Optional[Dict] = None,
) -> Optional[Dict]:
    """
    Get forward price F for Black-76 model.
    1. Prefer Deribit future expiring on same date as option/market
    2. Fallback: synthetic forward via put-call parity F = C - P + K

    Returns dict with 'forward', 'source' ('future' or 'synthetic'), or None.
    """
    if symbol.upper() not in DERIBIT_SUPPORTED:
        return None

    currency = symbol.upper()
    from datetime import timezone

    # Normalize expiry to timestamp (ms)
    if hasattr(expiry_date, 'timestamp'):
        target_ts = int(expiry_date.timestamp() * 1000)
    else:
        from dateutil.parser import parse
        exp = parse(expiry_date) if isinstance(expiry_date, str) else expiry_date
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        target_ts = int(exp.timestamp() * 1000)

    try:
        # 1. Try futures first
        instruments_response = requests.get(
            f'{DERIBIT_API}/get_instruments',
            params={'currency': currency, 'kind': 'future', 'expired': 'false'},
            timeout=30
        )
        if instruments_response.ok:
            instruments = instruments_response.json().get('result', [])
            # Exclude perpetual (huge expiration_timestamp)
            perpetual_ts_threshold = 32503680000000  # ~year 3000
            dated_futures = [i for i in instruments
                            if i.get('is_active') and i.get('expiration_timestamp', 0) < perpetual_ts_threshold]

            if dated_futures:
                # Find future with expiry closest to target (within 7 days)
                best = None
                best_diff = float('inf')
                for f in dated_futures:
                    exp_ts = f.get('expiration_timestamp', 0)
                    diff = abs(exp_ts - target_ts)
                    if diff < 7 * 24 * 60 * 60 * 1000 and diff < best_diff:
                        best_diff = diff
                        best = f

                if best:
                    ticker_response = requests.get(
                        f'{DERIBIT_API}/ticker',
                        params={'instrument_name': best['instrument_name']},
                        timeout=30
                    )
                    if ticker_response.ok:
                        ticker = ticker_response.json().get('result', {})
                        forward = ticker.get('mark_price')
                        if forward and forward > 0:
                            return {'forward': forward, 'source': 'future', 'instrument': best['instrument_name']}

        # 2. Fallback: synthetic forward F = C - P + K (put-call parity)
        if strike and strike > 0:
            inst_resp = requests.get(
                f'{DERIBIT_API}/get_instruments',
                params={'currency': currency, 'kind': 'option', 'expired': 'false'},
                timeout=30
            )
            if inst_resp.ok:
                options = inst_resp.json().get('result', [])
                active = [i for i in options if i.get('is_active') and i.get('strike')]
                # Options with strike within 20% of target
                nearby = [i for i in active if abs(i['strike'] - strike) / max(strike, 1e-9) < 0.2]
                # Unique strikes, sorted by distance to target
                unique_strikes = sorted(set(i['strike'] for i in nearby), key=lambda s: abs(s - strike))

                for k in unique_strikes[:5]:
                    call_inst = next((i for i in nearby if i['strike'] == k and i['option_type'] == 'call'), None)
                    put_inst = next((i for i in nearby if i['strike'] == k and i['option_type'] == 'put'), None)
                    if not call_inst or not put_inst:
                        continue
                    if abs(call_inst['expiration_timestamp'] - target_ts) > 14 * 24 * 60 * 60 * 1000:
                        continue

                    c_resp = requests.get(f'{DERIBIT_API}/ticker', params={'instrument_name': call_inst['instrument_name']}, timeout=30)
                    p_resp = requests.get(f'{DERIBIT_API}/ticker', params={'instrument_name': put_inst['instrument_name']}, timeout=30)
                    if not c_resp.ok or not p_resp.ok:
                        continue

                    c_ticker = c_resp.json().get('result', {})
                    p_ticker = p_resp.json().get('result', {})
                    c_price = c_ticker.get('mark_price') or c_ticker.get('last_price')
                    p_price = p_ticker.get('mark_price') or p_ticker.get('last_price')
                    if c_price is not None and p_price is not None:
                        forward = c_price - p_price + k
                        if forward > 0:
                            return {'forward': forward, 'source': 'synthetic', 'strike_used': k}
    except Exception as e:
        print(f'Error fetching Deribit forward for {symbol}: {e}')

    return None


def fetch_deribit_data(symbol: str) -> Optional[Dict]:
    """
    Fetch options data from Deribit for BTC or ETH
    """
    if symbol.upper() not in DERIBIT_SUPPORTED:
        return None
    
    currency = symbol.upper()
    
    try:
        # 1. Get current index price
        index_response = requests.get(
            f'{DERIBIT_API}/get_index_price',
            params={'index_name': f'{currency.lower()}_usd'},
            timeout=30
        )
        
        if not index_response.ok:
            return None
        
        index_data = index_response.json()
        underlying_price = index_data.get('result', {}).get('index_price')
        
        if not underlying_price:
            return None
        
        # 2. Get all active options instruments
        instruments_response = requests.get(
            f'{DERIBIT_API}/get_instruments',
            params={
                'currency': currency,
                'kind': 'option',
                'expired': 'false',
            },
            timeout=30
        )
        
        if not instruments_response.ok:
            return None
        
        instruments_data = instruments_response.json()
        instruments = instruments_data.get('result', [])
        
        # Filter active instruments
        active_instruments = [i for i in instruments if i.get('is_active', False)]
        
        # 3. Get ATM IV
        atm_iv = 0
        atm_strike = None
        
        # Find ATM strike
        strikes = sorted(set(i['strike'] for i in active_instruments))
        if strikes:
            atm_strike = min(strikes, key=lambda s: abs(s - underlying_price))
            
            # Get ATM call option
            atm_calls = [i for i in active_instruments 
                        if i['strike'] == atm_strike and i['option_type'] == 'call']
            
            if atm_calls:
                # Prefer nearest expiry
                nearest_atm = sorted(atm_calls, key=lambda i: i['expiration_timestamp'])[0]
                
                try:
                    ticker_response = requests.get(
                        f'{DERIBIT_API}/ticker',
                        params={'instrument_name': nearest_atm['instrument_name']},
                        timeout=30
                    )
                    
                    if ticker_response.ok:
                        ticker_data = ticker_response.json()
                        ticker = ticker_data.get('result', {})
                        # Deribit returns IV as percentage, convert to decimal
                        atm_iv = (ticker.get('mark_iv', 0) or 0) / 100
                except:
                    pass
        
        # Build IV by strike (simplified - just get a few key strikes)
        iv_by_strike = {}
        min_strike = underlying_price * 0.5
        max_strike = underlying_price * 2.0
        
        relevant_instruments = [i for i in active_instruments 
                               if min_strike <= i['strike'] <= max_strike]
        
        # Get unique strikes and sort by distance from ATM
        unique_strikes = sorted(set(i['strike'] for i in relevant_instruments),
                               key=lambda s: abs(s - underlying_price))[:10]
        
        for strike in unique_strikes:
            call_inst = next((i for i in relevant_instruments 
                            if i['strike'] == strike and i['option_type'] == 'call'), None)
            
            if call_inst:
                try:
                    ticker_response = requests.get(
                        f'{DERIBIT_API}/ticker',
                        params={'instrument_name': call_inst['instrument_name']},
                        timeout=30
                    )
                    
                    if ticker_response.ok:
                        ticker_data = ticker_response.json()
                        ticker = ticker_data.get('result', {})
                        
                        iv_by_strike[strike] = {
                            'strike': strike,
                            'call_iv': (ticker.get('mark_iv', 0) or 0) / 100,
                            'put_iv': 0,  # Would need to fetch put separately
                            'call_delta': ticker.get('delta', 0),
                            'put_delta': 0,
                        }
                except:
                    pass
        
        # If we didn't get ATM IV, estimate from strikes
        if atm_iv == 0 and iv_by_strike:
            iv_values = [d['call_iv'] for d in iv_by_strike.values() if d['call_iv'] > 0]
            if iv_values:
                atm_iv = sum(iv_values) / len(iv_values)

        # Store instruments for on-demand IV lookup (strike + expiry matched to market)
        return {
            'symbol': currency,
            'underlying_price': underlying_price,
            'atm_iv': atm_iv or DEFAULT_VOLATILITY.get(currency, DEFAULT_VOLATILITY['DEFAULT']),
            'instruments': relevant_instruments,
            'iv_by_strike': iv_by_strike,
            'last_updated': datetime.now(),
        }
    except Exception as e:
        print(f'Error fetching Deribit data for {symbol}: {e}')
        return None

def fetch_iv_for_market(
    symbol: str,
    target_strike: float,
    target_expiry,
    direction: str,
    deribit_data: Optional[Dict] = None,
) -> Optional[Dict]:
    """
    Fetch IV for the option that best matches the market:
    - PUT for 'below' (dip/crash), CALL for 'above' (rally)
    - Strike closest to target (from all available strikes)
    - Expiry closest to target (e.g. end of Feb for Feb markets)

    Returns dict with iv, instrument_name, strike, expiry_timestamp, option_type.
    """
    from datetime import timezone

    if symbol.upper() not in DERIBIT_SUPPORTED:
        return None

    # Get instruments
    instruments = []
    if deribit_data and deribit_data.get('instruments'):
        instruments = deribit_data['instruments']
    else:
        try:
            resp = requests.get(
                f'{DERIBIT_API}/get_instruments',
                params={'currency': symbol.upper(), 'kind': 'option', 'expired': 'false'},
                timeout=30
            )
            if resp.ok:
                instruments = [i for i in resp.json().get('result', []) if i.get('is_active')]
        except Exception:
            pass

    if not instruments:
        return None

    # Option type: PUT for below (downside bet), CALL for above (upside bet)
    option_type = 'put' if direction == 'below' else 'call'

    # Target expiry as timestamp (ms)
    if hasattr(target_expiry, 'timestamp'):
        target_ts = int(target_expiry.timestamp() * 1000)
    else:
        from dateutil.parser import parse
        exp = parse(target_expiry) if isinstance(target_expiry, str) else target_expiry
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        target_ts = int(exp.timestamp() * 1000)

    # Filter: option type, strike within 25% of target
    strike_band = 0.25
    candidates = [
        i for i in instruments
        if i.get('option_type') == option_type
        and i.get('strike')
        and abs(i['strike'] - target_strike) / max(target_strike, 1) <= strike_band
    ]

    if not candidates:
        return None

    # Sort by: 1) strike distance to target, 2) expiry distance to target
    def score(inst):
        strike_dist = abs(inst['strike'] - target_strike)
        expiry_dist = abs(inst.get('expiration_timestamp', 0) - target_ts)
        return (strike_dist, expiry_dist)

    best = min(candidates, key=score)

    try:
        ticker_resp = requests.get(
            f'{DERIBIT_API}/ticker',
            params={'instrument_name': best['instrument_name']},
            timeout=30
        )
        if not ticker_resp.ok:
            return None
        ticker = ticker_resp.json().get('result', {})
        iv_pct = ticker.get('mark_iv') or ticker.get('iv', 0)
        iv = (iv_pct or 0) / 100
        if iv <= 0:
            return None
        return {
            'iv': iv,
            'instrument_name': best['instrument_name'],
            'strike': best['strike'],
            'expiry_timestamp': best.get('expiration_timestamp'),
            'option_type': option_type,
        }
    except Exception:
        return None


def fetch_iv_smile_for_breeden(
    symbol: str,
    target_strike: float,
    target_expiry,
    option_type: str,
    deribit_data: Optional[Dict] = None,
    num_strikes: int = 7,
) -> Optional[Tuple[List[float], List[float]]]:
    """
    Fetch IV smile (strikes, ivs) for Breeden-Litzenberger.
    Picks expiry closest to target, returns strikes around target_strike.
    Returns (strike_grid, iv_grid) sorted by strike, or None.
    """
    from datetime import timezone

    if symbol.upper() not in DERIBIT_SUPPORTED:
        return None

    instruments = []
    if deribit_data and deribit_data.get('instruments'):
        instruments = deribit_data['instruments']
    else:
        try:
            resp = requests.get(
                f'{DERIBIT_API}/get_instruments',
                params={'currency': symbol.upper(), 'kind': 'option', 'expired': 'false'},
                timeout=30
            )
            if resp.ok:
                instruments = [i for i in resp.json().get('result', []) if i.get('is_active')]
        except Exception:
            pass

    if not instruments:
        return None

    target_ts = int(target_expiry.timestamp() * 1000) if hasattr(target_expiry, 'timestamp') else 0
    if target_ts == 0:
        from dateutil.parser import parse
        exp = parse(target_expiry) if isinstance(target_expiry, str) else target_expiry
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        target_ts = int(exp.timestamp() * 1000)

    strike_band = 0.25
    window_ms = 14 * 24 * 60 * 60 * 1000
    candidates = [
        i for i in instruments
        if i.get('option_type') == option_type
        and i.get('strike')
        and abs(i['strike'] - target_strike) / max(target_strike, 1) <= strike_band
        and abs(i.get('expiration_timestamp', 0) - target_ts) < window_ms
    ]

    if not candidates:
        return None

    # Pick expiry closest to target
    expiries = sorted(set(i['expiration_timestamp'] for i in candidates))
    best_exp_ts = min(expiries, key=lambda e: abs(e - target_ts))
    candidates = [i for i in candidates if i['expiration_timestamp'] == best_exp_ts]

    # Strikes around target, sorted by distance
    unique_strikes = sorted(
        set(i['strike'] for i in candidates),
        key=lambda s: abs(s - target_strike)
    )[:num_strikes]

    strike_grid = []
    iv_grid = []
    for strike in unique_strikes:
        inst = next((i for i in candidates if i['strike'] == strike), None)
        if not inst:
            continue
        try:
            ticker_resp = requests.get(
                f'{DERIBIT_API}/ticker',
                params={'instrument_name': inst['instrument_name']},
                timeout=30
            )
            if not ticker_resp.ok:
                continue
            ticker = ticker_resp.json().get('result', {})
            iv_pct = ticker.get('mark_iv') or ticker.get('iv', 0)
            iv = (iv_pct or 0) / 100
            if iv > 0:
                strike_grid.append(strike)
                iv_grid.append(iv)
        except Exception:
            continue

    if len(strike_grid) < 3:
        return None
    # Sort by strike for interpolation
    paired = sorted(zip(strike_grid, iv_grid))
    strike_grid = [p[0] for p in paired]
    iv_grid = [p[1] for p in paired]
    return (strike_grid, iv_grid)


def get_order_book(token_id: str) -> Optional[Dict]:
    """
    Get order book for a token from Polymarket CLOB API
    """
    try:
        response = requests.get(
            f'{CLOB_API}/book',
            params={'token_id': token_id},
            timeout=30
        )
        
        if not response.ok:
            return None
        
        book = response.json()
        
        # Polymarket API returns:
        # - bids sorted ASCENDING (lowest/worst first) → best bid is LAST
        # - asks sorted DESCENDING (highest/worst first) → best ask is LAST
        best_bid = 0
        best_ask = 1
        
        if book.get('bids') and len(book['bids']) > 0:
            best_bid = max(float(b['price']) for b in book['bids'])
        
        if book.get('asks') and len(book['asks']) > 0:
            best_ask = min(float(a['price']) for a in book['asks'])
        
        return {
            'best_bid': best_bid,
            'best_ask': best_ask,
        }
    except Exception as e:
        print(f'Error fetching order book: {e}')
        return None

