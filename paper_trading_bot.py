"""
Paper Trading Bot

Runs 24/7 and trades based on edge between Polymarket and model probabilities.
This is a paper trading bot that simulates trades without using real money.
"""

import json
import os
import time
from datetime import datetime
from typing import Dict, List, Optional
from pathlib import Path
from arbitrage_calculator import calculate_arbitrage_opportunities

# ============================================================================
# CONFIGURATION
# ============================================================================

CONFIG = {
    'starting_balance': 1000,
    'min_edge_to_enter': 0.05,          # 5% edge to enter
    'max_edge_to_exit': 0.05,           # Exit when edge < 5%
    'base_position_size': 25,            # $25 base
    'edge_multiplier': 500,              # +$50 per 10% additional edge
    'max_position_size': 100,            # Max $100 per position
    'max_total_exposure': 500,           # Max $500 total exposure
    'poll_interval_seconds': 60,        # Check every 1 minute
    'max_positions_per_market': 1,
    'min_time_to_expiry_days': 1,        # Min 1 day to expiry
}

STATE_FILE = Path('data/bot_state.json')

# ============================================================================
# STATE MANAGEMENT
# ============================================================================

def load_state() -> Dict:
    """Load bot state from file"""
    try:
        if STATE_FILE.exists():
            with open(STATE_FILE, 'r') as f:
                state = json.load(f)
                # Convert date strings back to datetime objects where needed
                for position in state.get('open_positions', []):
                    if 'entry_timestamp' in position:
                        position['entry_timestamp'] = datetime.fromisoformat(position['entry_timestamp'])
                for position in state.get('closed_positions', []):
                    if 'entry_timestamp' in position:
                        position['entry_timestamp'] = datetime.fromisoformat(position['entry_timestamp'])
                    if 'close_timestamp' in position:
                        position['close_timestamp'] = datetime.fromisoformat(position['close_timestamp'])
                return state
    except Exception as e:
        print(f'Error loading state: {e}')
    
    # Return initial state
    return {
        'starting_balance': CONFIG['starting_balance'],
        'current_balance': CONFIG['starting_balance'],
        'total_pnl': 0,
        'open_positions': [],
        'closed_positions': [],
        'trades': [],
        'is_running': True,
        'last_update': datetime.now().isoformat(),
        'total_trades': 0,
        'winning_trades': 0,
        'losing_trades': 0,
        'win_rate': 0,
        'config': CONFIG,
    }

def save_state(state: Dict):
    """Save bot state to file"""
    try:
        STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
        
        # Convert datetime objects to strings for JSON
        state_copy = json.loads(json.dumps(state, default=str))
        
        with open(STATE_FILE, 'w') as f:
            json.dump(state_copy, f, indent=2)
    except Exception as e:
        print(f'Error saving state: {e}')

# ============================================================================
# TRADING LOGIC
# ============================================================================

def calculate_position_size(edge: float, config: Dict) -> float:
    """Calculate position size based on edge"""
    abs_edge = abs(edge)
    size = config['base_position_size'] + (abs_edge * config['edge_multiplier'])
    return min(size, config['max_position_size'])

def get_total_exposure(positions: List[Dict]) -> float:
    """Calculate total exposure from all positions"""
    return sum(p['size'] for p in positions)

def should_enter_position(opp: Dict, state: Dict, config: Dict) -> Dict:
    """Determine if we should enter a position"""
    # Use Deribit edge if available, otherwise Z-score
    edge = opp.get('edge_vs_deribit') or opp.get('edge_vs_zscore')
    abs_edge = abs(edge)
    
    # SAFETY CHECK 1: Skip essentially resolved markets (>99% or <1%)
    poly_price = opp['polymarket_prob']
    if poly_price > 0.99:
        return {'should_enter': False, 'side': 'long', 'edge': edge, 'reason': f'Market price {poly_price * 100:.1f}% > 99% (resolved)'}
    if poly_price < 0.01:
        return {'should_enter': False, 'side': 'long', 'edge': edge, 'reason': f'Market price {poly_price * 100:.1f}% < 1% (resolved)'}
    
    # SAFETY CHECK 2: For "dip" markets, verify the target hasn't been hit already
    current_crypto_price = opp['current_price']['price']
    target_price = opp['market']['target_price']
    direction = opp['market']['direction']
    bet_type = opp['market']['bet_type']
    
    if current_crypto_price and target_price and bet_type == 'one-touch':
        if direction == 'below' and current_crypto_price <= target_price:
            return {'should_enter': False, 'side': 'long', 'edge': edge, 'reason': f'Dip already happened: current ${current_crypto_price:,.0f} <= target ${target_price:,.0f}'}
        if direction == 'above' and current_crypto_price >= target_price:
            return {'should_enter': False, 'side': 'long', 'edge': edge, 'reason': f'Target already hit: current ${current_crypto_price:,.0f} >= target ${target_price:,.0f}'}
    
    # SAFETY CHECK 3: Sanity check model probability vs market price
    model_prob = opp.get('deribit_prob', {}).get('probability') or opp.get('zscore_prob', {}).get('probability')
    if model_prob:
        if model_prob > 0.90 and poly_price > 0.90:
            return {'should_enter': False, 'side': 'long', 'edge': edge, 'reason': f'Both model ({model_prob * 100:.0f}%) and market ({poly_price * 100:.0f}%) agree at high probability'}
        if model_prob < 0.10 and poly_price < 0.10:
            return {'should_enter': False, 'side': 'long', 'edge': edge, 'reason': f'Both model ({model_prob * 100:.0f}%) and market ({poly_price * 100:.0f}%) agree at low probability'}
    
    # Check minimum edge
    if abs_edge < config['min_edge_to_enter']:
        return {'should_enter': False, 'side': 'long', 'edge': edge, 'reason': f'Edge {abs_edge * 100:.1f}% < {config["min_edge_to_enter"] * 100}% threshold'}
    
    # Check time to expiry
    expiry_date = opp['market']['expiry_date']
    if isinstance(expiry_date, str):
        from dateutil.parser import parse
        expiry_date = parse(expiry_date)
    
    days_to_expiry = (expiry_date - datetime.now()).days
    if days_to_expiry < config['min_time_to_expiry_days']:
        return {'should_enter': False, 'side': 'long', 'edge': edge, 'reason': f'Only {days_to_expiry} days to expiry'}
    
    # Check if already have position in this market
    existing_position = next((p for p in state['open_positions'] if p['market_id'] == opp['market']['id']), None)
    if existing_position:
        return {'should_enter': False, 'side': 'long', 'edge': edge, 'reason': 'Already have position in this market'}
    
    # Check total exposure
    current_exposure = get_total_exposure(state['open_positions'])
    position_size = calculate_position_size(edge, config)
    if current_exposure + position_size > config['max_total_exposure']:
        return {'should_enter': False, 'side': 'long', 'edge': edge, 'reason': f'Would exceed max exposure (${current_exposure + position_size:.2f} > ${config["max_total_exposure"]})'}
    
    # Check available balance
    if position_size > state['current_balance']:
        return {'should_enter': False, 'side': 'long', 'edge': edge, 'reason': f'Insufficient balance (${state["current_balance"]:.2f} < ${position_size:.2f})'}
    
    # Determine side based on edge direction
    # Positive edge = Polymarket overpriced = SELL (short)
    # Negative edge = Polymarket underpriced = BUY (long)
    side = 'short' if edge > 0 else 'long'
    
    return {'should_enter': True, 'side': side, 'edge': edge}

def should_exit_position(position: Dict, opp: Optional[Dict], config: Dict) -> Dict:
    """Determine if we should exit a position"""
    # If market data not found, check if expired
    if not opp:
        expiry_date = position['expiry_date']
        if isinstance(expiry_date, str):
            from dateutil.parser import parse
            expiry_date = parse(expiry_date)
        
        if expiry_date < datetime.now():
            return {
                'should_exit': True,
                'reason': 'expired',
                'current_price': position['current_price'],
                'current_edge': 0
            }
        return {'should_exit': False, 'reason': '', 'current_price': position['current_price'], 'current_edge': position['current_edge']}
    
    current_price = opp['polymarket_prob']
    current_edge = opp.get('edge_vs_deribit') or opp.get('edge_vs_zscore')
    abs_edge = abs(current_edge)
    
    # Check if edge has aligned (dropped below threshold)
    if abs_edge < config['max_edge_to_exit']:
        return {
            'should_exit': True,
            'reason': 'edge_aligned',
            'current_price': current_price,
            'current_edge': current_edge
        }
    
    # Check if edge flipped
    new_side = 'short' if current_edge > 0 else 'long'
    if new_side != position['side'] and abs_edge >= config['min_edge_to_enter']:
        return {
            'should_exit': True,
            'reason': 'edge_aligned',  # Edge flipped significantly
            'current_price': current_price,
            'current_edge': current_edge
        }
    
    return {'should_exit': False, 'reason': '', 'current_price': current_price, 'current_edge': current_edge}

def open_position(opp: Dict, side: str, edge: float, state: Dict, config: Dict) -> Dict:
    """Open a new position"""
    size = calculate_position_size(edge, config)
    entry_price = opp['polymarket_prob']
    
    # Calculate shares
    # For long: buy YES shares at entryPrice, shares = size / entryPrice
    # For short: sell YES (buy NO) at (1 - entryPrice), shares = size / (1 - entryPrice)
    effective_price = entry_price if side == 'long' else (1 - entry_price)
    shares = size / effective_price
    
    position = {
        'id': f'pos_{int(time.time() * 1000)}_{os.urandom(4).hex()}',
        'market_id': opp['market']['id'],
        'market_question': opp['market']['question'],
        'crypto': opp['market']['crypto'],
        'target_price': opp['market']['target_price'],
        'direction': opp['market']['direction'],
        'bet_type': opp['market']['bet_type'],
        'expiry_date': opp['market']['expiry_date'],
        'side': side,
        'entry_price': entry_price,
        'size': size,
        'shares': shares,
        'entry_edge': edge,
        'entry_zscore_prob': opp['zscore_prob']['probability'],
        'entry_deribit_prob': opp.get('deribit_prob', {}).get('probability'),
        'entry_timestamp': datetime.now(),
        'current_price': entry_price,
        'current_edge': edge,
        'unrealized_pnl': 0,
        'status': 'open',
    }
    
    # Record trade
    trade = {
        'id': f'trade_{int(time.time() * 1000)}_{os.urandom(4).hex()}',
        'position_id': position['id'],
        'market_id': opp['market']['id'],
        'timestamp': datetime.now().isoformat(),
        'action': 'open',
        'side': side,
        'price': entry_price,
        'size': size,
        'shares': shares,
        'edge': edge,
        'zscore_prob': opp['zscore_prob']['probability'],
        'deribit_prob': opp.get('deribit_prob', {}).get('probability'),
        'crypto_price': opp['current_price']['price'],
    }
    
    state['trades'].append(trade)
    state['total_trades'] += 1
    state['current_balance'] -= size
    
    return position

def close_position(position: Dict, current_price: float, current_edge: float, reason: str, state: Dict):
    """Close a position"""
    # Calculate P&L
    # For long: bought YES at entryPrice, now worth currentPrice
    # P&L = shares * (currentPrice - entryPrice)
    # For short: sold YES at entryPrice, now worth currentPrice
    # P&L = shares * (entryPrice - currentPrice)
    if position['side'] == 'long':
        pnl = position['shares'] * (current_price - position['entry_price'])
    else:
        pnl = position['shares'] * (position['entry_price'] - current_price)
    
    # Update position
    position['status'] = 'closed'
    position['close_reason'] = reason
    position['close_price'] = current_price
    position['close_timestamp'] = datetime.now()
    position['realized_pnl'] = pnl
    position['current_price'] = current_price
    position['current_edge'] = current_edge
    
    # Record trade
    trade = {
        'id': f'trade_{int(time.time() * 1000)}_{os.urandom(4).hex()}',
        'position_id': position['id'],
        'market_id': position['market_id'],
        'timestamp': datetime.now().isoformat(),
        'action': 'close',
        'side': position['side'],
        'price': current_price,
        'size': position['size'],
        'shares': position['shares'],
        'edge': current_edge,
        'pnl': pnl,
    }
    
    state['trades'].append(trade)
    state['total_trades'] += 1
    
    # Update balance
    state['current_balance'] += position['size'] + pnl
    state['total_pnl'] += pnl
    
    # Update win/loss stats
    if pnl > 0:
        state['winning_trades'] += 1
    elif pnl < 0:
        state['losing_trades'] += 1
    
    state['win_rate'] = state['winning_trades'] / max(1, state['winning_trades'] + state['losing_trades'])
    
    # Move to closed positions
    state['open_positions'] = [p for p in state['open_positions'] if p['id'] != position['id']]
    state['closed_positions'].append(position)

def update_open_positions(opportunities: List[Dict], state: Dict):
    """Update unrealized P&L for all open positions"""
    for position in state['open_positions']:
        opp = next((o for o in opportunities if o['market']['id'] == position['market_id']), None)
        if opp:
            position['current_price'] = opp['polymarket_prob']
            position['current_edge'] = opp.get('edge_vs_deribit') or opp.get('edge_vs_zscore')
            
            # Calculate unrealized P&L
            if position['side'] == 'long':
                position['unrealized_pnl'] = position['shares'] * (position['current_price'] - position['entry_price'])
            else:
                position['unrealized_pnl'] = position['shares'] * (position['entry_price'] - position['current_price'])

# ============================================================================
# MAIN BOT LOOP
# ============================================================================

def run_bot_cycle(state: Dict):
    """Run one cycle of the bot"""
    print(f'\n{"="*60}')
    print(f'[{datetime.now().strftime("%Y-%m-%d %H:%M:%S")}] BOT CYCLE START')
    print(f'{"="*60}')
    
    try:
        # Fetch latest arbitrage data
        print('📊 Fetching arbitrage opportunities...')
        result = calculate_arbitrage_opportunities(limit=100)
        opportunities = result.get('opportunities', [])
        print(f'✓ Found {len(opportunities)} opportunities')
        
        if not opportunities:
            print('⚠ No opportunities found, skipping cycle')
            return
        
        # Update open positions
        print(f'\n📈 Updating {len(state["open_positions"])} open positions...')
        update_open_positions(opportunities, state)
        
        # Check for exits first
        positions_closed = 0
        for position in list(state['open_positions']):
            opp = next((o for o in opportunities if o['market']['id'] == position['market_id']), None)
            exit_check = should_exit_position(position, opp, CONFIG)
            
            if exit_check['should_exit']:
                positions_closed += 1
                print(f'\n🔴 CLOSING POSITION #{positions_closed}')
                print(f'   Market: {position["market_question"][:60]}')
                print(f'   Reason: {exit_check["reason"]}')
                print(f'   Entry Price: {position["entry_price"] * 100:.2f}%')
                print(f'   Exit Price: {exit_check["current_price"] * 100:.2f}%')
                print(f'   Position Size: ${position["size"]:.2f}')
                print(f'   Shares: {position["shares"]:.4f}')
                
                close_position(position, exit_check['current_price'], exit_check['current_edge'], exit_check['reason'], state)
                
                pnl = position.get('realized_pnl', 0)
                pnl_pct = (pnl / position['size'] * 100) if position['size'] > 0 else 0
                pnl_sign = '+' if pnl >= 0 else ''
                print(f'   💰 Realized P&L: {pnl_sign}${pnl:.2f} ({pnl_sign}{pnl_pct:.2f}%)')
        
        if positions_closed == 0:
            print('✓ No positions to close')
        
        # Check for new entries
        print(f'\n🔍 Scanning for new entry opportunities...')
        positions_opened = 0
        for opp in opportunities:
            entry_check = should_enter_position(opp, state, CONFIG)
            
            if entry_check['should_enter']:
                positions_opened += 1
                position = open_position(opp, entry_check['side'], entry_check['edge'], state, CONFIG)
                state['open_positions'].append(position)
                
                print(f'\n🟢 OPENING POSITION #{positions_opened}')
                print(f'   Market: {opp["market"]["question"][:60]}')
                print(f'   Side: {entry_check["side"].upper()}')
                print(f'   Edge: {entry_check["edge"] * 100:.2f}%')
                print(f'   Entry Price: {position["entry_price"] * 100:.2f}%')
                print(f'   Position Size: ${position["size"]:.2f}')
                print(f'   Shares: {position["shares"]:.4f}')
                print(f'   Crypto: {opp["market"]["crypto"]} @ ${opp["current_price"]["price"]:,.2f}')
        
        if positions_opened == 0:
            print('✓ No new entry opportunities')
        
        # Update state
        state['last_update'] = datetime.now().isoformat()
        state['last_error'] = None
        
        # Calculate returns
        total_unrealized_pnl = sum(p.get('unrealized_pnl', 0) for p in state['open_positions'])
        total_pnl = state['total_pnl'] + total_unrealized_pnl
        starting_balance = state.get('starting_balance', CONFIG['starting_balance'])
        current_equity = state['current_balance'] + sum(p.get('size', 0) for p in state['open_positions'])
        total_return = ((current_equity - starting_balance) / starting_balance * 100) if starting_balance > 0 else 0
        
        # Log summary
        print(f'\n{"="*60}')
        print(f'📊 PORTFOLIO SUMMARY')
        print(f'{"="*60}')
        print(f'💰 Balance: ${state["current_balance"]:.2f}')
        print(f'📈 Open Positions: {len(state["open_positions"])}')
        print(f'   Total Exposure: ${sum(p.get("size", 0) for p in state["open_positions"]):.2f}')
        print(f'   Unrealized P&L: ${total_unrealized_pnl:.2f}')
        print(f'💵 Realized P&L: ${state["total_pnl"]:.2f}')
        print(f'📊 Total P&L: ${total_pnl:.2f}')
        print(f'📉 Total Return: {total_return:+.2f}%')
        print(f'🎯 Win Rate: {state["win_rate"] * 100:.1f}% ({state["winning_trades"]}W / {state["losing_trades"]}L)')
        print(f'📝 Total Trades: {state["total_trades"]}')
        print(f'{"="*60}')
        
        # Show open positions detail
        if state['open_positions']:
            print(f'\n📋 OPEN POSITIONS DETAIL:')
            for i, pos in enumerate(state['open_positions'], 1):
                pnl = pos.get('unrealized_pnl', 0)
                pnl_pct = (pnl / pos['size'] * 100) if pos['size'] > 0 else 0
                pnl_sign = '+' if pnl >= 0 else ''
                print(f'   {i}. {pos["market_question"][:50]}')
                print(f'      {pos["side"].upper()} ${pos["size"]:.2f} @ {pos["entry_price"]*100:.2f}% → {pos.get("current_price", pos["entry_price"])*100:.2f}%')
                print(f'      P&L: {pnl_sign}${pnl:.2f} ({pnl_sign}{pnl_pct:.2f}%)')
        
    except Exception as error:
        print(f'\n❌ ERROR in bot cycle: {error}')
        import traceback
        traceback.print_exc()
        state['last_error'] = str(error)
    
    # Save state after each cycle
    save_state(state)
    print(f'\n💾 State saved to {STATE_FILE}')

def start_bot():
    """Start the bot"""
    print('\n' + '='*60)
    print('🚀 PAPER TRADING BOT - FORWARD TESTING MODE')
    print('='*60)
    print('\n📋 CONFIGURATION:')
    print(f'   Starting Balance: ${CONFIG["starting_balance"]:,.2f}')
    print(f'   Min Edge to Enter: {CONFIG["min_edge_to_enter"] * 100:.1f}%')
    print(f'   Max Edge to Exit: {CONFIG["max_edge_to_exit"] * 100:.1f}%')
    print(f'   Base Position Size: ${CONFIG["base_position_size"]:.2f}')
    print(f'   Max Position Size: ${CONFIG["max_position_size"]:.2f}')
    print(f'   Max Total Exposure: ${CONFIG["max_total_exposure"]:.2f}')
    print(f'   Poll Interval: {CONFIG["poll_interval_seconds"]} seconds')
    print(f'   Min Time to Expiry: {CONFIG["min_time_to_expiry_days"]} days')
    print('\n⚠️  MODE: Forward Testing (No Real Orders)')
    print('='*60)
    
    # Load existing state or create new
    state = load_state()
    state['is_running'] = True
    state['config'] = CONFIG
    
    # Show current state
    starting_balance = state.get('starting_balance', CONFIG['starting_balance'])
    current_equity = state['current_balance'] + sum(p.get('size', 0) for p in state['open_positions'])
    total_return = ((current_equity - starting_balance) / starting_balance * 100) if starting_balance > 0 else 0
    
    print('\n📊 CURRENT STATE:')
    print(f'   Balance: ${state["current_balance"]:.2f}')
    print(f'   Open Positions: {len(state["open_positions"])}')
    print(f'   Total Exposure: ${sum(p.get("size", 0) for p in state["open_positions"]):.2f}')
    print(f'   Realized P&L: ${state["total_pnl"]:.2f}')
    print(f'   Total Return: {total_return:+.2f}%')
    print(f'   Win Rate: {state["win_rate"] * 100:.1f}% ({state["winning_trades"]}W / {state["losing_trades"]}L)')
    print('='*60)
    
    # Run initial cycle
    run_bot_cycle(state)
    
    # Set up interval
    print(f'\n⏰ Bot will check for opportunities every {CONFIG["poll_interval_seconds"]} seconds')
    print('Press Ctrl+C to stop gracefully\n')
    
    try:
        cycle_count = 1
        while True:
            time.sleep(CONFIG['poll_interval_seconds'])
            cycle_count += 1
            run_bot_cycle(state)
    except KeyboardInterrupt:
        print('\n\n' + '='*60)
        print('🛑 SHUTTING DOWN BOT...')
        print('='*60)
        state = load_state()
        state['is_running'] = False
        save_state(state)
        
        # Final summary
        starting_balance = state.get('starting_balance', CONFIG['starting_balance'])
        current_equity = state['current_balance'] + sum(p.get('size', 0) for p in state['open_positions'])
        total_return = ((current_equity - starting_balance) / starting_balance * 100) if starting_balance > 0 else 0
        
        print(f'\n📊 FINAL SUMMARY:')
        print(f'   Starting Balance: ${starting_balance:.2f}')
        print(f'   Current Equity: ${current_equity:.2f}')
        print(f'   Total Return: {total_return:+.2f}%')
        print(f'   Realized P&L: ${state["total_pnl"]:.2f}')
        print(f'   Win Rate: {state["win_rate"] * 100:.1f}%')
        print(f'   Total Trades: {state["total_trades"]}')
        print(f'\n💾 State saved to {STATE_FILE}')
        print('👋 Goodbye!')
        print('='*60 + '\n')

if __name__ == '__main__':
    start_bot()

