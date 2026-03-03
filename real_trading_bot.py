"""
Crypto Volatility Real Trading Bot

Trades real USDC on Polymarket based on crypto volatility opportunities.

This bot focuses exclusively on crypto price target markets (e.g., "Will Bitcoin hit $200k by Dec 2025?").

IMPORTANT: This uses REAL MONEY. Use with caution.

Environment Variables Required:
- POLYMARKET_PRIVATE_KEY: Your wallet private key
"""

import json
import math
import os
import time
from datetime import datetime, timezone
from typing import Dict, List, Optional
from pathlib import Path
from dotenv import load_dotenv
from arbitrage_calculator import calculate_arbitrage_opportunities
from data_fetchers import get_order_book
from config import CLOB_API, POLYGON_CHAIN_ID

# Load environment variables
load_dotenv()

# Lazy-initialized Polymarket CLOB client (for real order execution)
_clob_client = None


def _get_clob_client():
    """Build and cache ClobClient from env. Returns None if POLYMARKET_PRIVATE_KEY not set."""
    global _clob_client
    if _clob_client is not None:
        return _clob_client
    key = os.environ.get('POLYMARKET_PRIVATE_KEY', '').strip()
    if not key or key.startswith('0x') and len(key) < 66:
        return None
    try:
        from py_clob_client.client import ClobClient
        host = CLOB_API
        chain_id = int(os.environ.get('POLYGON_CHAIN_ID', POLYGON_CHAIN_ID))
        signature_type = int(os.environ.get('POLYMARKET_SIGNATURE_TYPE', '0'))
        funder = os.environ.get('POLYMARKET_FUNDER', '').strip() or None
        client = ClobClient(
            host,
            key=key,
            chain_id=chain_id,
            signature_type=signature_type,
            funder=funder if funder else None,
        )
        creds = client.create_or_derive_api_creds()
        client.set_api_creds(creds)
        _clob_client = client
        return _clob_client
    except Exception as e:
        print(f'  [ERROR] Failed to create CLOB client: {e}')
        return None


def _get_wallet_address() -> Optional[str]:
    """Derive wallet address from POLYMARKET_PRIVATE_KEY. Returns None if not set or invalid."""
    key = os.environ.get('POLYMARKET_PRIVATE_KEY', '').strip()
    if not key or (key.startswith('0x') and len(key) < 66):
        return None
    try:
        from web3 import Web3
        acc = Web3().eth.account.from_key(key if key.startswith('0x') else '0x' + key)
        return acc.address
    except Exception:
        return None


def _get_outcome_token_balance(token_id: str, wallet_address: str) -> Optional[float]:
    """
    Return the wallet's outcome-token balance (in shares) for the given token_id
    by querying the CTF contract on Polygon. Returns None on error or if not available.
    """
    try:
        from web3 import Web3
        rpc = os.environ.get('POLYGON_RPC_URL', '').strip() or 'https://polygon-rpc.com'
        w3 = Web3(Web3.HTTPProvider(rpc, request_kwargs={'timeout': 10}))
        try:
            from web3.middleware import geth_poa_middleware
            w3.middleware_onion.inject(geth_poa_middleware, layer=0)
        except Exception:
            try:
                from web3.middleware import ExtraDataToPOAMiddleware
                w3.middleware_onion.inject(ExtraDataToPOAMiddleware, layer=0)
            except Exception:
                pass
        if not w3.is_connected():
            return None
        ctf = w3.eth.contract(address=Web3.to_checksum_address(CTF_ADDRESS), abi=ERC1155_BALANCE_OF_ABI)
        # token_id from CLOB can be decimal string or int; ERC1155 id is uint256
        if isinstance(token_id, int):
            tid = token_id
        else:
            s = str(token_id).strip()
            tid = int(s, 16) if s.startswith('0x') else int(s, 10)
        raw = ctf.functions.balanceOf(Web3.to_checksum_address(wallet_address), tid).call()
        return float(raw) / (10 ** CTF_DECIMALS)
    except Exception:
        return None


# ============================================================================
# CONFIGURATION - $100 LIVE TEST
# Scaled from paper $1000: ~1/10 exposure/sizes; same edge rules.
# ============================================================================

# Polymarket CLOB expects order size in outcome-token (shares), not USDC. Min notional $1.
POLY_MIN_ORDER_USD = 1.0

# CTF (Conditional Token Framework) on Polygon - for reading outcome token balance
CTF_ADDRESS = '0x4D97DCd97eC945f40cF65F87097ACe5EA0476045'
# ERC1155 balanceOf(account, id) - returns raw units; Polymarket uses 6 decimals per share
ERC1155_BALANCE_OF_ABI = [{'inputs': [{'internalType': 'address', 'name': 'account', 'type': 'address'}, {'internalType': 'uint256', 'name': 'id', 'type': 'uint256'}], 'name': 'balanceOf', 'outputs': [{'internalType': 'uint256', 'name': '', 'type': 'uint256'}], 'stateMutability': 'view', 'type': 'function'}]
CTF_DECIMALS = 6

CONFIG = {
    'starting_balance': 100,            # Live test capital
    'max_total_exposure': 50,           # Max $50 deployed at once
    'min_edge_to_enter': 0.05,          # 5% edge (same as paper)
    'max_edge_to_exit': 0.03,           # Exit when edge < 3%
    'base_position_size': 2.5,          # $2.50 base
    'edge_multiplier': 50,              # +$5 per 10% additional edge
    'max_position_size': 10,            # Max $10 per position
    'poll_interval_seconds': 120,       # Check every 2 minutes
    'min_time_to_expiry_days': 1,       # At least 1 day to expiry
    'dry_run': False,                   # True = simulate only; False = attempt real orders (requires order execution implemented)
}

STATE_FILE = Path('data/real_bot_state.json')
DAILY_RETURNS_FILE = Path('data/real_daily_returns.csv')

# ============================================================================
# STATE MANAGEMENT
# ============================================================================

def load_state() -> Dict:
    """Load bot state from file"""
    try:
        if STATE_FILE.exists():
            with open(STATE_FILE, 'r') as f:
                state = json.load(f)
            # Ensure portfolio-logging fields exist (for older state files)
            state.setdefault('starting_balance', CONFIG['starting_balance'])
            state.setdefault('current_balance', state['starting_balance'] - state.get('current_exposure', 0) + state.get('total_pnl', 0))
            state.setdefault('daily_equity_log', {})
            state.setdefault('daily_returns', [])
            state.setdefault('last_recorded_date', None)
            state.setdefault('winning_trades', 0)
            state.setdefault('losing_trades', 0)
            state.setdefault('total_trades', 0)
            state.setdefault('win_rate', 0.0)
            return state
    except Exception as e:
        print(f'Error loading state: {e}')
    
    return {
        'starting_balance': CONFIG['starting_balance'],
        'current_balance': CONFIG['starting_balance'],
        'current_exposure': 0,
        'total_pnl': 0,
        'open_positions': [],
        'closed_positions': [],
        'is_running': True,
        'last_update': datetime.now().isoformat(),
        'config': CONFIG,
        'daily_equity_log': {},
        'daily_returns': [],
        'last_recorded_date': None,
        'winning_trades': 0,
        'losing_trades': 0,
        'total_trades': 0,
        'win_rate': 0.0,
    }

def save_state(state: Dict):
    """Save bot state to file"""
    try:
        STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(STATE_FILE, 'w') as f:
            json.dump(state, f, indent=2, default=str)
    except Exception as e:
        print(f'Error saving state: {e}')


def sync_state_from_chain() -> bool:
    """
    Rebuild open_positions from on-chain wallet balances. For each crypto market we fetch,
    check wallet balance for both outcome tokens; if balance > 0, add position with
    shares from chain and size/entry from current book (so unrealized = 0 at sync time).
    Preserves starting_balance, total_pnl, win/loss stats. Returns True on success.
    """
    wallet = _get_wallet_address()
    if not wallet:
        print('  [ERROR] No wallet (POLYMARKET_PRIVATE_KEY not set or invalid)')
        return False
    try:
        result = calculate_arbitrage_opportunities(limit=200)
        opportunities = result.get('opportunities', [])
    except Exception as e:
        print(f'  [ERROR] Failed to fetch opportunities: {e}')
        return False
    positions = []
    for opp in opportunities:
        market = opp.get('market', {})
        token_ids = market.get('token_ids', [])
        if not token_ids or len(token_ids) < 2:
            continue
        market_id = market.get('id', '')
        question = market.get('question', '') or market.get('title', '')
        for i, token_id in enumerate(token_ids):
            balance = _get_outcome_token_balance(token_id, wallet)
            if balance is None or balance < 0.01:
                continue
            book = get_order_book(token_id)
            if not book:
                continue
            # Use best_bid as current price (what we'd get if we sold)
            try:
                price = float(book.get('best_bid') or book.get('mid') or 0.5)
            except (TypeError, ValueError):
                price = 0.5
            price = max(0.01, min(0.99, price))
            side = 'long' if i == 0 else 'short'
            size = round(balance * price, 2)
            positions.append({
                'id': f'pos_sync_{int(time.time() * 1000)}_{len(positions)}',
                'market_id': market_id,
                'market_question': question,
                'token_id': str(token_id),
                'side': side,
                'entry_price': price,
                'size': size,
                'shares': round(balance, 4),
                'entry_edge': 0,
                'entry_timestamp': datetime.now().isoformat(),
                'status': 'open',
                'current_price': price,
                'unrealized_pnl': 0,
            })
    state = load_state()
    state['open_positions'] = positions
    state['current_exposure'] = sum(p['size'] for p in positions)
    state['current_balance'] = state['starting_balance'] - state['current_exposure'] + state.get('total_pnl', 0)
    state['last_update'] = datetime.now().isoformat()
    save_state(state)
    print(f'  Synced {len(positions)} positions from chain. Exposure: ${state["current_exposure"]:.2f}')
    return True


def get_mark_to_market_equity(state: Dict) -> float:
    """Mark-to-market equity: cash + deployed capital + unrealized P&L."""
    equity = state.get('current_balance', state['starting_balance'])
    for p in state.get('open_positions', []):
        equity += p.get('size', 0) + p.get('unrealized_pnl', 0)
    return equity


def record_daily_return(state: Dict, current_equity: float):
    """Record daily equity and append daily return when day rolls (consecutive days only)."""
    now = datetime.now(timezone.utc)
    current_date = now.strftime('%Y-%m-%d')
    last_date = state.get('last_recorded_date')
    state.setdefault('daily_equity_log', {})
    state.setdefault('daily_returns', [])
    state['daily_equity_log'][current_date] = current_equity
    if last_date is None:
        state['last_recorded_date'] = current_date
        return
    if current_date == last_date:
        return
    try:
        from datetime import datetime as _dt
        last_d = _dt.strptime(last_date, '%Y-%m-%d')
        curr_d = _dt.strptime(current_date, '%Y-%m-%d')
        days_gap = (curr_d - last_d).days
    except (ValueError, TypeError):
        days_gap = 1
    prev_equity = state['daily_equity_log'].get(last_date)
    if prev_equity is not None and prev_equity > 0 and days_gap == 1:
        daily_return = (current_equity - prev_equity) / prev_equity
        state['daily_returns'].append({
            'date': last_date,
            'equity': current_equity,
            'prev_equity': prev_equity,
            'daily_return': daily_return,
        })
        try:
            DAILY_RETURNS_FILE.parent.mkdir(parents=True, exist_ok=True)
            file_exists = DAILY_RETURNS_FILE.exists()
            with open(DAILY_RETURNS_FILE, 'a') as f:
                if not file_exists:
                    f.write('date,prev_equity,equity,daily_return_pct\n')
                f.write(f'{last_date},{prev_equity:.2f},{current_equity:.2f},{daily_return * 100:.4f}\n')
        except Exception as e:
            print(f'Warning: Could not write daily returns log: {e}')
        print(f'\n📅 DAILY RETURN RECORDED: {last_date} → {daily_return * 100:+.2f}%')
    state['last_recorded_date'] = current_date


def calculate_sharpe_ratio(daily_returns: List[Dict], risk_free_rate: float = 0) -> Optional[float]:
    """Annualized Sharpe from daily returns; None if < 2 returns."""
    if not daily_returns:
        return None
    sorted_returns = sorted(
        (r for r in daily_returns if isinstance(r.get('daily_return'), (int, float))),
        key=lambda x: x.get('date', ''),
    )
    if len(sorted_returns) < 2:
        return None
    returns = [r['daily_return'] for r in sorted_returns]
    mean_r = sum(returns) / len(returns)
    variance = sum((r - mean_r) ** 2 for r in returns) / (len(returns) - 1)
    std_r = math.sqrt(variance)
    if std_r == 0:
        return None
    sharpe_daily = (mean_r - risk_free_rate / 252) / std_r
    return sharpe_daily * math.sqrt(252)


# ============================================================================
# TRADING LOGIC
# ============================================================================

def calculate_position_size(edge: float, config: Dict, remaining_exposure: float) -> float:
    """Calculate position size based on edge"""
    abs_edge = abs(edge)
    size = config['base_position_size'] + (abs_edge * config['edge_multiplier'])
    size = min(size, config['max_position_size'])
    size = min(size, remaining_exposure)
    return round(size, 2)

def should_enter_position(opp: Dict, state: Dict, config: Dict) -> Dict:
    """Determine if we should enter a position"""
    edge = opp.get('edge_vs_deribit')
    if edge is None:
        return {'should_enter': False, 'side': 'long', 'edge': 0, 'size': 0, 'reason': 'No Deribit edge available'}
    abs_edge = abs(edge)
    poly_price = opp['polymarket_prob']
    
    # SAFETY: Skip essentially resolved markets
    if poly_price > 0.99:
        return {'should_enter': False, 'side': 'long', 'edge': edge, 'size': 0, 'reason': f'Price {poly_price * 100:.1f}% > 99% (resolved)'}
    if poly_price < 0.01:
        return {'should_enter': False, 'side': 'long', 'edge': edge, 'size': 0, 'reason': f'Price {poly_price * 100:.1f}% < 1% (resolved)'}
    
    # SAFETY: Check if event already happened
    current_crypto_price = opp['current_price']['price']
    target_price = opp['market']['target_price']
    direction = opp['market']['direction']
    
    if current_crypto_price and target_price and opp['market']['bet_type'] == 'one-touch':
        if direction == 'below' and current_crypto_price <= target_price:
            return {'should_enter': False, 'side': 'long', 'edge': edge, 'size': 0, 'reason': 'Dip already happened'}
        if direction == 'above' and current_crypto_price >= target_price:
            return {'should_enter': False, 'side': 'long', 'edge': edge, 'size': 0, 'reason': 'Target already hit'}
    
    # Check minimum edge
    if abs_edge < config['min_edge_to_enter']:
        return {'should_enter': False, 'side': 'long', 'edge': edge, 'size': 0, 'reason': f'Edge {abs_edge * 100:.1f}% < threshold'}
    
    # Check time to expiry
    expiry_date = opp['market']['expiry_date']
    if isinstance(expiry_date, str):
        from dateutil.parser import parse
        expiry_date = parse(expiry_date)
    if expiry_date.tzinfo is None:
        expiry_date = expiry_date.replace(tzinfo=timezone.utc)
    now_utc = datetime.now(timezone.utc)
    days_to_expiry = (expiry_date - now_utc).days
    if days_to_expiry < config['min_time_to_expiry_days']:
        return {'should_enter': False, 'side': 'long', 'edge': edge, 'size': 0, 'reason': f'Only {days_to_expiry} days to expiry'}
    
    # Check if already have position
    existing_position = next((p for p in state['open_positions'] if p['market_id'] == opp['market']['id']), None)
    if existing_position:
        return {'should_enter': False, 'side': 'long', 'edge': edge, 'size': 0, 'reason': 'Already have position'}
    
    # Calculate remaining exposure
    remaining_exposure = config['max_total_exposure'] - state['current_exposure']
    if remaining_exposure < 0.50:
        return {'should_enter': False, 'side': 'long', 'edge': edge, 'size': 0, 'reason': f'Only ${remaining_exposure:.2f} remaining exposure'}
    
    # Calculate position size
    size = calculate_position_size(edge, config, remaining_exposure)
    if size < POLY_MIN_ORDER_USD:
        return {'should_enter': False, 'side': 'long', 'edge': edge, 'size': 0, 'reason': f'Position size ${size:.2f} below Polymarket min ${POLY_MIN_ORDER_USD}'}
    
    # Determine side
    side = 'short' if edge > 0 else 'long'
    
    return {'should_enter': True, 'side': side, 'edge': edge, 'size': size}

def should_exit_position(position: Dict, opportunities: List[Dict], config: Dict) -> Dict:
    """Determine if we should exit a position"""
    opp = next((o for o in opportunities if o['market']['id'] == position['market_id']), None)
    
    if not opp:
        return {'should_exit': False, 'reason': 'No opportunity data available'}
    
    current_edge = opp.get('edge_vs_deribit')
    abs_current_edge = abs(current_edge)
    current_price = opp['polymarket_prob']
    
    # Exit if edge has dropped below threshold
    if abs_current_edge < config['max_edge_to_exit']:
        return {
            'should_exit': True,
            'reason': f'Edge dropped to {abs_current_edge * 100:.1f}% (< {config["max_edge_to_exit"] * 100}% threshold)',
            'current_edge': current_edge,
            'current_price': current_price,
        }
    
    # Exit if edge has flipped sign
    entry_edge_sign = 1 if position['entry_edge'] > 0 else -1
    current_edge_sign = 1 if current_edge > 0 else -1
    
    if entry_edge_sign != current_edge_sign and abs_current_edge >= config['max_edge_to_exit']:
        return {
            'should_exit': True,
            'reason': f'Edge flipped sign: entry {position["entry_edge"] * 100:.1f}% → now {current_edge * 100:.1f}%',
            'current_edge': current_edge,
            'current_price': current_price,
        }
    
    return {'should_exit': False, 'reason': 'Edge still favorable', 'current_edge': current_edge, 'current_price': current_price}

def _round_to_tick(price: float, tick_size: float) -> float:
    """Round price to market tick size."""
    if tick_size <= 0:
        return round(price, 4)
    n = max(0, -int(round(math.log10(tick_size))))
    return round(round(price / tick_size) * tick_size, n)


def execute_order(
    opp: Dict,
    side: str,
    size: float,
    config: Dict,
    shares_to_sell: Optional[float] = None,
) -> Dict:
    """
    Execute an order on Polymarket via py-clob-client (EIP-712).
    - Entry: BUY token (size = dollars). side is 'long' or 'short' (which token).
    - Exit: SELL token (shares_to_sell = shares to sell). size still passed but not used for SELL.
    """
    if config['dry_run']:
        print(f'  [DRY RUN] Would {side.upper()} ${size:.2f} on "{opp["market"]["question"][:40]}..."')
        return {
            'success': True,
            'order_id': f'dry_{int(time.time() * 1000)}',
            'filled_price': opp['polymarket_prob'],
        }
    
    token_ids = opp['market'].get('token_ids', [])
    if not token_ids or len(token_ids) < 2:
        print(f'  [ERROR] No token IDs for market')
        return {'success': False}
    
    token_id = token_ids[0] if side == 'long' else token_ids[1]
    book = get_order_book(token_id)
    if not book:
        print(f'  [ERROR] Could not get order book')
        return {'success': False}
    
    client = _get_clob_client()
    if not client:
        print(f'  [ERROR] No CLOB client (set POLYMARKET_PRIVATE_KEY in .env)')
        return {'success': False, 'reason': 'No CLOB client'}
    
    # get_tick_size can return dict from API (e.g. {"minimum_tick_size": 0.01}) or a string
    try:
        raw_tick = client.get_tick_size(token_id)
        if isinstance(raw_tick, dict):
            tick_size = float(raw_tick.get('minimum_tick_size') or raw_tick.get('tick_size') or 0.01)
        else:
            tick_size = float(raw_tick or 0.01)
    except Exception:
        tick_size = 0.01
    try:
        raw_neg = client.get_neg_risk(token_id)
        neg_risk = bool(
            raw_neg if not isinstance(raw_neg, dict) else raw_neg.get('neg_risk', False)
        )
    except Exception:
        neg_risk = False
    
    # Library expects PartialCreateOrderOptions (object with .tick_size), NOT a dict
    tick_str = str(tick_size)
    if tick_str not in ('0.1', '0.01', '0.001', '0.0001'):
        tick_str = '0.01'
    
    is_sell = shares_to_sell is not None and shares_to_sell > 0
    if is_sell:
        price = _round_to_tick(book['best_bid'], tick_size)
        order_side = 'SELL'
        requested = round(float(shares_to_sell), 4)
        size_arg = requested
        # At sell time, use actual wallet balance so we never try to sell more than we hold (e.g. partial fills on buy).
        wallet = _get_wallet_address()
        if wallet:
            balance_shares = _get_outcome_token_balance(token_id, wallet)
            if balance_shares is not None:
                if balance_shares < 0.01:
                    print(f'  [ERROR] Wallet has ~0 shares of this token; nothing to sell')
                    return {'success': False, 'reason': 'No balance'}
                if balance_shares < size_arg:
                    size_arg = round(balance_shares, 4)
                    print(f'  [INFO] Selling {size_arg:.4f} shares (wallet balance); state had {requested:.4f}')
        if size_arg <= 0:
            print(f'  [ERROR] Invalid sell size: {shares_to_sell}')
            return {'success': False, 'reason': 'Invalid sell size'}
        if price > 0 and size_arg * price < POLY_MIN_ORDER_USD:
            print(f'  [ERROR] Sell notional ${size_arg * price:.2f} below min ${POLY_MIN_ORDER_USD}')
            return {'success': False, 'reason': f'Sell below min notional ${POLY_MIN_ORDER_USD}'}
        print(f'  [REAL] Placing SELL {size_arg:.4f} shares @ {price * 100:.1f}%...')
    else:
        price = _round_to_tick(book['best_ask'], tick_size)
        order_side = 'BUY'
        # CLOB expects size in outcome tokens (shares). Notional = size * price must be >= $1.
        size_dollars = float(size)
        if size_dollars < POLY_MIN_ORDER_USD:
            print(f'  [ERROR] Order size ${size_dollars:.2f} below Polymarket min ${POLY_MIN_ORDER_USD}')
            return {'success': False, 'reason': f'Order below min ${POLY_MIN_ORDER_USD}'}
        if price <= 0:
            print(f'  [ERROR] Invalid price for BUY: {price}')
            return {'success': False, 'reason': 'Invalid price'}
        size_arg = size_dollars / price  # shares to achieve this USDC notional
        print(f'  [REAL] Placing BUY ${size_dollars:.2f} ({size_arg:.4f} shares) @ {price * 100:.1f}%...')
    
    try:
        from py_clob_client.clob_types import OrderArgs, OrderType, PartialCreateOrderOptions
        from py_clob_client.order_builder.constants import BUY, SELL
        side_enum = SELL if is_sell else BUY
        order_args = OrderArgs(
            token_id=token_id,
            price=price,
            size=size_arg,
            side=side_enum,
        )
        options = PartialCreateOrderOptions(tick_size=tick_str, neg_risk=neg_risk)
        try:
            signed = client.create_order(order_args, options=options)
        except AttributeError as ae:
            if "'dict' object has no attribute 'tick_size'" in str(ae) or "tick_size" in str(ae):
                # Older code path or wrong type: let the library resolve tick_size/neg_risk
                signed = client.create_order(order_args, options=None)
            else:
                raise
        resp = client.post_order(signed, OrderType.GTC)
    except Exception as e:
        print(f'  [ERROR] Order failed: {e}')
        return {'success': False, 'reason': str(e)}
    
    if not resp or not resp.get('success', False):
        err = resp.get('errorMsg', resp.get('reason', 'Unknown error')) if isinstance(resp, dict) else str(resp)
        print(f'  [ERROR] CLOB rejected order: {err}')
        return {'success': False, 'reason': err}
    
    order_id = resp.get('orderID', resp.get('orderId', ''))
    status = resp.get('status', '')
    print(f'  [OK] Order placed: {order_id} status={status}')
    filled_price = price
    if is_sell:
        usdc_received = size_arg * price
        return {
            'success': True,
            'order_id': order_id,
            'filled_price': filled_price,
            'usdc_received': usdc_received,
            'sold_shares': size_arg,
        }
    return {
        'success': True,
        'order_id': order_id,
        'filled_price': filled_price,
        'token_id': token_id,
    }

def check_market_resolution(position: Dict) -> Dict:
    """Check if a market has been resolved"""
    # TODO: Implement market resolution check
    # This would query Polymarket API to check if market is closed
    return {'resolved': False, 'winner': False}

# ============================================================================
# MAIN BOT LOOP
# ============================================================================

def run_bot_cycle(state: Dict):
    """Run one cycle of the bot"""
    print(f'\n[{datetime.now().isoformat()}] Running REAL trading cycle...')
    print(f'  Mode: {"DRY RUN" if CONFIG["dry_run"] else "LIVE TRADING"}')
    print(f'  Exposure: ${state["current_exposure"]:.2f} / ${CONFIG["max_total_exposure"]}')
    print(f'  Open positions: {len(state["open_positions"])}')
    
    try:
        result = calculate_arbitrage_opportunities(limit=100)
        opportunities = result.get('opportunities', [])
        print(f'  Fetched {len(opportunities)} crypto opportunities')
        
        # STEP 1: Check for market resolutions
        positions_to_remove = []
        for position in state['open_positions']:
            resolution = check_market_resolution(position)
            if resolution['resolved']:
                payout = resolution.get('payout', 0)
                pnl = payout - position['size']
                
                print(f'  RESOLVED: "{position["market_question"][:40]}..."')
                print(f'    Winner: {"YES ✓" if resolution["winner"] else "NO ✗"}')
                print(f'    Payout: ${payout:.2f} | P&L: ${pnl:.2f}')
                
                position['status'] = 'closed'
                position['close_price'] = 1.0 if resolution['winner'] else 0.0
                position['realized_pnl'] = pnl
                state['closed_positions'].append(position)
                positions_to_remove.append(position['id'])
                
                state['total_pnl'] += pnl
                state['current_exposure'] -= position['size']
        
        state['open_positions'] = [p for p in state['open_positions'] if p['id'] not in positions_to_remove]
        for pos in positions_to_remove:
            state['total_trades'] = state.get('total_trades', 0) + 1
            if pos.get('realized_pnl', 0) > 0:
                state['winning_trades'] = state.get('winning_trades', 0) + 1
            else:
                state['losing_trades'] = state.get('losing_trades', 0) + 1
        if state.get('winning_trades', 0) + state.get('losing_trades', 0) > 0:
            state['win_rate'] = state['winning_trades'] / (state['winning_trades'] + state['losing_trades'])
        
        # STEP 2: Update open positions with current price and unrealized P&L (for portfolio log)
        for position in state['open_positions']:
            opp = next((o for o in opportunities if o['market']['id'] == position['market_id']), None)
            if opp:
                current_price = opp['polymarket_prob']
                position['current_price'] = current_price
                shares = position.get('shares', position['size'] / position.get('entry_price', 1))
                entry = position.get('entry_price', 0)
                if position.get('side') == 'long':
                    position['unrealized_pnl'] = (current_price - entry) * shares
                else:
                    # Short: we hold NO token; its price is 1 - YES_price
                    current_no = 1.0 - current_price
                    position['unrealized_pnl'] = (current_no - entry) * shares
            else:
                position['unrealized_pnl'] = position.get('unrealized_pnl', 0)
        
        state['current_balance'] = state['starting_balance'] - state['current_exposure'] + state['total_pnl']
        
        # STEP 3: Check for exit signals
        positions_to_exit = []
        for position in state['open_positions']:
            exit_check = should_exit_position(position, opportunities, CONFIG)
            
            if exit_check['should_exit']:
                print(f'  EXIT SIGNAL: "{position["market_question"][:40]}..."')
                print(f'    Reason: {exit_check["reason"]}')
                
                opp_exit = next((o for o in opportunities if o['market']['id'] == position['market_id']), None)
                if not opp_exit:
                    print(f'  [WARNING] No opportunity data for position, skipping exit')
                    continue
                # Sell: we pass full position shares; execute_order caps to actual wallet balance and sells that.
                result = execute_order(
                    opp_exit,
                    position['side'],
                    position['size'],
                    CONFIG,
                    shares_to_sell=position.get('shares'),
                )
                
                if not result.get('success'):
                    reason = result.get('reason', '') or str(result)
                    # No liquidity (best bid 0): API rejects price < 0.001. Close position for $0 and book the loss.
                    if 'min: 0.001' in reason and ('price (0.0)' in reason or 'price (0)' in reason or '0.0)' in reason):
                        usdc_received = 0.0
                        size_closed = position['size']
                        pnl = usdc_received - size_closed
                        print(f'  CLOSED (no liquidity, cashed out for $0): P&L: ${pnl:.2f}')
                        position['status'] = 'closed'
                        position['close_price'] = 0.0
                        position['realized_pnl'] = pnl
                        state['closed_positions'].append(position)
                        positions_to_exit.append(position['id'])
                        state['total_pnl'] += pnl
                        state['current_exposure'] -= size_closed
                        state['total_trades'] = state.get('total_trades', 0) + 1
                        state['losing_trades'] = state.get('losing_trades', 0) + 1
                    else:
                        print(f'  [WARNING] Exit failed: {reason[:120]}')
                elif result.get('success'):
                    filled_price = result.get('filled_price', exit_check.get('current_price'))
                    usdc_received = result.get('usdc_received', position['size'])
                    # We may have sold fewer shares than state (capped to wallet balance); close proportionally
                    sold_shares = result.get('sold_shares')  # set by execute_order when we cap
                    pos_shares = position.get('shares') or 0
                    if sold_shares is not None and pos_shares and sold_shares < pos_shares:
                        size_closed = position['size'] * (sold_shares / pos_shares)
                    else:
                        size_closed = position['size']
                    pnl = usdc_received - size_closed
                    
                    print(f'  CLOSED: ${usdc_received:.2f} received | P&L: ${pnl:.2f}')
                    
                    position['status'] = 'closed'
                    position['close_price'] = filled_price
                    position['realized_pnl'] = pnl
                    state['closed_positions'].append(position)
                    positions_to_exit.append(position['id'])
                    
                    state['total_pnl'] += pnl
                    state['current_exposure'] -= size_closed
                    state['total_trades'] = state.get('total_trades', 0) + 1
                    if pnl > 0:
                        state['winning_trades'] = state.get('winning_trades', 0) + 1
                    else:
                        state['losing_trades'] = state.get('losing_trades', 0) + 1
        
        state['open_positions'] = [p for p in state['open_positions'] if p['id'] not in positions_to_exit]
        if state.get('winning_trades', 0) + state.get('losing_trades', 0) > 0:
            state['win_rate'] = state['winning_trades'] / (state['winning_trades'] + state['losing_trades'])
        
        # STEP 4: Look for new entry opportunities
        for opp in opportunities:
            check = should_enter_position(opp, state, CONFIG)
            
            if check['should_enter']:
                print(f'  ENTRY SIGNAL: {check["side"].upper()} {opp["market"]["crypto"]} - Edge: {check["edge"] * 100:.1f}%')
                
                result = execute_order(opp, check['side'], check['size'], CONFIG)
                
                if result.get('success'):
                    filled_price = result.get('filled_price', opp['polymarket_prob'])
                    position = {
                        'id': f'pos_{int(time.time() * 1000)}',
                        'market_id': opp['market']['id'],
                        'market_question': opp['market']['question'],
                        'token_id': result.get('token_id', ''),
                        'side': check['side'],
                        'entry_price': filled_price,
                        'size': check['size'],
                        'shares': check['size'] / filled_price,
                        'entry_edge': check['edge'],
                        'entry_timestamp': datetime.now().isoformat(),
                        'order_id': result.get('order_id'),
                        'status': 'open',
                    }
                    
                    state['open_positions'].append(position)
                    state['current_exposure'] += check['size']
                    
                    print(f'  OPENED: ${check["size"]:.2f} {check["side"]} @ {filled_price * 100:.1f}%')
        
        state['last_update'] = datetime.now().isoformat()
        state['current_balance'] = state['starting_balance'] - state['current_exposure'] + state['total_pnl']
        
        # Live portfolio log: daily returns and summary
        current_equity = get_mark_to_market_equity(state)
        record_daily_return(state, current_equity)
        total_unrealized = sum(p.get('unrealized_pnl', 0) for p in state['open_positions'])
        total_pnl_all = state['total_pnl'] + total_unrealized
        start = state.get('starting_balance', CONFIG['starting_balance'])
        total_return_pct = ((current_equity - start) / start * 100) if start > 0 else 0
        sharpe = calculate_sharpe_ratio(state.get('daily_returns', []))
        n_days = len([r for r in state.get('daily_returns', []) if isinstance(r.get('daily_return'), (int, float))])
        win_rate_pct = (state.get('win_rate', 0) * 100) if state.get('win_rate') else 0
        
        print(f'\n{"="*60}')
        print(f'📊 REAL BOT PORTFOLIO SUMMARY')
        print(f'{"="*60}')
        print(f'💰 Balance (cash): ${state["current_balance"]:.2f}')
        print(f'📈 Open Positions: {len(state["open_positions"])}')
        print(f'   Exposure: ${state["current_exposure"]:.2f} / ${CONFIG["max_total_exposure"]}')
        print(f'   Unrealized P&L: ${total_unrealized:.2f}')
        print(f'   Mark-to-Market Equity: ${current_equity:.2f}')
        print(f'💵 Realized P&L: ${state["total_pnl"]:.2f}')
        print(f'📊 Total P&L: ${total_pnl_all:.2f}')
        print(f'📉 Total Return: {total_return_pct:+.2f}%')
        if sharpe is not None:
            days_lbl = f', {n_days} days' if n_days < 90 else ''
            print(f'📈 Sharpe (ann.{days_lbl}): {sharpe:.2f}')
        print(f'🎯 Win Rate: {win_rate_pct:.1f}% ({state.get("winning_trades", 0)}W / {state.get("losing_trades", 0)}L)')
        print(f'📝 Total Trades: {state.get("total_trades", 0)}')
        print(f'📅 Daily Returns: {n_days} days recorded')
        print(f'{"="*60}')
        if state['open_positions']:
            print(f'\n📋 OPEN POSITIONS:')
            for i, pos in enumerate(state['open_positions'], 1):
                pnl = pos.get('unrealized_pnl', 0)
                pnl_pct = (pnl / pos['size'] * 100) if pos.get('size', 0) > 0 else 0
                pnl_sign = '+' if pnl >= 0 else ''
                curr = pos.get('current_price', pos.get('entry_price', 0))
                print(f'   {i}. {pos.get("market_question", "")[:52]}')
                print(f'      {pos.get("side", "").upper()} ${pos.get("size", 0):.2f} @ {pos.get("entry_price", 0)*100:.1f}% → {curr*100:.1f}%  P&L: {pnl_sign}${pnl:.2f} ({pnl_sign}{pnl_pct:.1f}%)')
        print()
        
    except Exception as error:
        print(f'  Error in bot cycle: {error}')
        state['last_error'] = str(error)
    
    save_state(state)

def start_bot():
    """Start the bot"""
    print('========================================')
    print('  REAL Trading Bot Starting')
    print('========================================')
    print('')
    print('  *** WARNING: This bot trades REAL USDC ***')
    print('')
    print(f'  Mode: {"DRY RUN (no real orders)" if CONFIG["dry_run"] else "LIVE TRADING"}')
    print(f'  Starting Balance: ${CONFIG["starting_balance"]}')
    print(f'  Max Exposure: ${CONFIG["max_total_exposure"]}')
    print(f'  Min Edge: {CONFIG["min_edge_to_enter"] * 100}%')
    print(f'  Position Size: ${CONFIG["base_position_size"]} base + edge scaling')
    print(f'  Max Position: ${CONFIG["max_position_size"]}')
    print(f'  Poll Interval: {CONFIG["poll_interval_seconds"]}s')
    print('')
    
    state = load_state()
    state['is_running'] = True
    state['config'] = CONFIG
    
    print('Current state:')
    print(f'  Exposure: ${state["current_exposure"]:.2f} / ${CONFIG["max_total_exposure"]}')
    print(f'  Open positions: {len(state["open_positions"])}')
    print(f'  Total P&L: ${state["total_pnl"]:.2f}')
    print('')
    
    # Run initial cycle
    run_bot_cycle(state)
    
    # Set up interval
    print(f'\nBot running. Press Ctrl+C to stop.\n')
    
    try:
        while True:
            time.sleep(CONFIG['poll_interval_seconds'])
            run_bot_cycle(state)
    except KeyboardInterrupt:
        print('\n\nShutting down...')
        state = load_state()
        state['is_running'] = False
        save_state(state)
        print('State saved.')

if __name__ == '__main__':
    import sys
    if '--sync-from-chain' in sys.argv:
        print('Syncing real bot state from on-chain wallet balances...')
        ok = sync_state_from_chain()
        sys.exit(0 if ok else 1)
    start_bot()

