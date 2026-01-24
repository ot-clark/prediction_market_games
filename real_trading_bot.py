"""
Real Trading Bot

Trades real USDC on Polymarket based on arbitrage opportunities.

IMPORTANT: This uses REAL MONEY. Use with caution.

Environment Variables Required:
- POLYMARKET_PRIVATE_KEY: Your wallet private key
"""

import json
import os
import time
from datetime import datetime
from typing import Dict, List, Optional
from pathlib import Path
from dotenv import load_dotenv
from arbitrage_calculator import calculate_arbitrage_opportunities
from data_fetchers import get_order_book

# Load environment variables
load_dotenv()

# ============================================================================
# CONFIGURATION - $10 MAX EXPOSURE
# ============================================================================

CONFIG = {
    'max_total_exposure': 10,          # HARD LIMIT: $10 max
    'min_edge_to_enter': 0.05,         # 5% edge to enter
    'max_edge_to_exit': 0.03,          # Exit when edge < 3%
    'base_position_size': 1,            # $1 base position
    'edge_multiplier': 20,              # +$2 per 10% additional edge
    'max_position_size': 5,             # Max $5 per position
    'poll_interval_seconds': 120,       # Check every 2 minutes
    'min_time_to_expiry_days': 1,       # At least 1 day to expiry
    'dry_run': True,                     # FORWARD TESTING MODE (No real orders)
}

STATE_FILE = Path('data/real_bot_state.json')

# ============================================================================
# STATE MANAGEMENT
# ============================================================================

def load_state() -> Dict:
    """Load bot state from file"""
    try:
        if STATE_FILE.exists():
            with open(STATE_FILE, 'r') as f:
                return json.load(f)
    except Exception as e:
        print(f'Error loading state: {e}')
    
    return {
        'max_exposure': CONFIG['max_total_exposure'],
        'current_exposure': 0,
        'total_pnl': 0,
        'open_positions': [],
        'closed_positions': [],
        'is_running': True,
        'last_update': datetime.now().isoformat(),
        'config': CONFIG,
    }

def save_state(state: Dict):
    """Save bot state to file"""
    try:
        STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(STATE_FILE, 'w') as f:
            json.dump(state, f, indent=2, default=str)
    except Exception as e:
        print(f'Error saving state: {e}')

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
    edge = opp.get('edge_vs_deribit') or opp.get('edge_vs_zscore')
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
    
    days_to_expiry = (expiry_date - datetime.now()).days
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
    
    current_edge = opp.get('edge_vs_deribit') or opp.get('edge_vs_zscore')
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
        print(f'  Fetched {len(opportunities)} opportunities')
        
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
        
        # STEP 2: Check for exit signals
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
        
        state['open_positions'] = [p for p in state['open_positions'] if p['id'] not in positions_to_exit]
        
        # STEP 3: Look for new entry opportunities
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

