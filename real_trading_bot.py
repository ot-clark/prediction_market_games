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

# Load environment variables
load_dotenv()

# ============================================================================
# CONFIGURATION - $100 LIVE TEST
# Scaled from paper $1000: ~1/10 exposure/sizes; same edge rules.
# ============================================================================

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
    'dry_run': True,                    # Set False when order execution is live
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
    if size < 0.50:
        return {'should_enter': False, 'side': 'long', 'edge': edge, 'size': 0, 'reason': f'Position size ${size:.2f} too small'}
    
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

def execute_order(opp: Dict, side: str, size: float, config: Dict) -> Dict:
    """
    Execute an order on Polymarket
    
    NOTE: This is a placeholder. Full implementation requires:
    - EIP-712 signing for Polymarket orders
    - USDC approval on Polygon
    - Proper error handling and order confirmation
    
    For now, this simulates the order execution.
    """
    if config['dry_run']:
        print(f'  [DRY RUN] Would {side.upper()} ${size:.2f} on "{opp["market"]["question"][:40]}..."')
        return {
            'success': True,
            'order_id': f'dry_{int(time.time() * 1000)}',
            'filled_price': opp['polymarket_prob'],
        }
    
    # Get token IDs
    token_ids = opp['market'].get('token_ids', [])
    if not token_ids or len(token_ids) < 2:
        print(f'  [ERROR] No token IDs for market')
        return {'success': False}
    
    token_id = token_ids[0] if side == 'long' else token_ids[1]
    
    # Get order book
    book = get_order_book(token_id)
    if not book:
        print(f'  [ERROR] Could not get order book')
        return {'success': False}
    
    price = book['best_ask']
    shares = size / price
    
    print(f'  [REAL] Would place order...')
    print(f'    Token: {token_id[:20]}...')
    print(f'    Side: BUY ({side})')
    print(f'    Size: ${size:.2f} = {shares:.4f} shares @ {price * 100:.1f}%')
    print(f'  [WARNING] Real order execution not implemented - requires EIP-712 signing')
    
    # TODO: Implement actual order placement using web3.py and EIP-712 signing
    # This requires:
    # 1. Initialize web3 with Polygon RPC
    # 2. Create wallet from private key
    # 3. Check/set USDC allowance
    # 4. Sign EIP-712 order message
    # 5. Post order to Polymarket CLOB API
    
    return {'success': False, 'reason': 'Order execution not implemented'}

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
                    position['unrealized_pnl'] = (entry - current_price) * shares
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
                
                # TODO: Execute sell order
                result = execute_order(
                    next((o for o in opportunities if o['market']['id'] == position['market_id']), None),
                    position['side'],
                    position['size'],
                    CONFIG
                )
                
                if result.get('success'):
                    usdc_received = result.get('usdc_received', position['size'])
                    pnl = usdc_received - position['size']
                    
                    print(f'  CLOSED: ${usdc_received:.2f} received | P&L: ${pnl:.2f}')
                    
                    position['status'] = 'closed'
                    position['close_price'] = result.get('filled_price', exit_check.get('current_price'))
                    position['realized_pnl'] = pnl
                    state['closed_positions'].append(position)
                    positions_to_exit.append(position['id'])
                    
                    state['total_pnl'] += pnl
                    state['current_exposure'] -= position['size']
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
        print(f'{"="*60}\n')
        
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
    start_bot()

