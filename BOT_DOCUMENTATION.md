# Bot Documentation - Detailed Behavior

## Overview

This bot is a **forward-testing arbitrage trading system** that identifies and simulates trades on crypto price target markets on Polymarket. It does NOT place real orders - it only simulates trading to test the strategy.

## What the Bot Does

### 1. **Data Collection Phase** (Every 60 seconds)

The bot performs the following steps:

1. **Fetches Polymarket Markets**
   - Queries Polymarket API for active crypto price target markets
   - Filters for markets that bet on crypto prices (e.g., "Will Bitcoin hit $200k by Dec 2025?")
   - Extracts: crypto symbol, target price, expiry date, bet type (binary vs one-touch), direction (above/below)

2. **Fetches Current Crypto Prices**
   - Gets real-time prices from CoinGecko API
   - Supports: BTC, ETH, SOL, ADA, DOGE, XRP, MATIC, AVAX, LINK, DOT, LTC

3. **Fetches Options Data** (for BTC and ETH only)
   - Queries Deribit API for implied volatility (IV) data
   - Gets at-the-money (ATM) IV and IV by strike price
   - Falls back to default volatility assumptions for other cryptos

4. **Calculates Model Probabilities**
   - **Z-Score Method**: Uses lognormal distribution to calculate probability of price reaching target
     - Formula: `z = ln(target/current) / (σ × √T)`
     - Probability = 1 - Φ(z) for "above" bets
   - **Deribit Method** (when available): Uses Black-Scholes delta from options data
     - More accurate for BTC/ETH as it uses market-implied volatility
   - **One-Touch Adjustments**: For "touch" bets, multiplies probability by 2x (path-dependent)

5. **Calculates Arbitrage Edge**
   - Edge = Polymarket Price - Model Probability
   - Positive edge = Polymarket overpriced (sell signal)
   - Negative edge = Polymarket underpriced (buy signal)
   - Confidence levels: High (>10%), Medium (5-10%), Low (<5%)

### 2. **Position Management Phase**

#### Entry Logic

The bot enters a position when ALL of the following conditions are met:

- **Edge Threshold**: Absolute edge ≥ 5% (configurable)
- **Market Not Resolved**: Polymarket price between 1% and 99%
- **Event Not Happened**: For one-touch bets, verifies target hasn't been hit yet
- **Time to Expiry**: At least 1 day remaining
- **No Existing Position**: Doesn't already have a position in this market
- **Exposure Limits**: 
  - Position size ≤ $100 (configurable)
  - Total exposure ≤ $500 (configurable)
- **Sufficient Balance**: Has enough balance to cover position size

**Position Sizing**:
- Base size: $25
- Scales with edge: +$50 per 10% additional edge
- Formula: `size = base + (abs(edge) × multiplier)`
- Capped at max position size

**Side Selection**:
- Positive edge → SHORT (Polymarket overpriced, bet against)
- Negative edge → LONG (Polymarket underpriced, bet for)

#### Exit Logic

The bot exits a position when ANY of the following occurs:

- **Edge Aligned**: Absolute edge drops below 5% (configurable)
- **Edge Flipped**: Edge sign changes (was long, now should be short, or vice versa)
- **Market Expired**: Expiry date has passed

**P&L Calculation**:
- For LONG: `P&L = shares × (exit_price - entry_price)`
- For SHORT: `P&L = shares × (entry_price - exit_price)`

### 3. **Portfolio Tracking**

The bot tracks:

- **Balance**: Available cash (starting $1000)
- **Open Positions**: Active positions with unrealized P&L
- **Closed Positions**: Historical trades with realized P&L
- **Total P&L**: Sum of realized + unrealized
- **Total Return**: Percentage return on starting balance
- **Win Rate**: Percentage of profitable trades
- **Trade Count**: Total number of trades executed

### 4. **State Persistence**

- All state saved to `data/bot_state.json` after each cycle
- Survives bot restarts
- Tracks full trade history

## Output Format

Each cycle produces:

```
============================================================
[2024-01-15 14:30:00] BOT CYCLE START
============================================================
📊 Fetching arbitrage opportunities...
✓ Found 45 opportunities

📈 Updating 3 open positions...

🔴 CLOSING POSITION #1
   Market: Will Bitcoin hit $200,000 by December 31, 2025?
   Reason: edge_aligned
   Entry Price: 45.23%
   Exit Price: 48.50%
   Position Size: $35.00
   Shares: 77.38
   💰 Realized P&L: +$2.53 (+7.23%)

🟢 OPENING POSITION #1
   Market: Will Ethereum reach $10,000 before 2026?
   Side: LONG
   Edge: -8.45%
   Entry Price: 32.10%
   Position Size: $67.25
   Shares: 209.66
   Crypto: ETH @ $3,450.23

============================================================
📊 PORTFOLIO SUMMARY
============================================================
💰 Balance: $892.50
📈 Open Positions: 4
   Total Exposure: $245.00
   Unrealized P&L: +$12.34
💵 Realized P&L: +$45.67
📊 Total P&L: +$58.01
📉 Total Return: +5.80%
🎯 Win Rate: 62.5% (5W / 3L)
📝 Total Trades: 8
============================================================
```

## Configuration

Edit `CONFIG` in `paper_trading_bot.py`:

```python
CONFIG = {
    'starting_balance': 1000,           # Starting capital
    'min_edge_to_enter': 0.05,         # 5% minimum edge
    'max_edge_to_exit': 0.05,          # Exit when edge < 5%
    'base_position_size': 25,           # Base position size
    'edge_multiplier': 500,             # Edge scaling factor
    'max_position_size': 100,          # Max per position
    'max_total_exposure': 500,          # Max total exposure
    'poll_interval_seconds': 60,        # Check frequency
    'min_time_to_expiry_days': 1,      # Min days to expiry
}
```

## Safety Features

1. **No Real Orders**: Bot is in forward-testing mode only
2. **Exposure Limits**: Hard caps on position and total exposure
3. **Market Validation**: Skips resolved markets and already-happened events
4. **Balance Checks**: Won't enter if insufficient balance
5. **State Persistence**: Can restart without losing data

## Performance Metrics

The bot reports:
- **Total Return**: Overall percentage return
- **Realized P&L**: Closed trade profits/losses
- **Unrealized P&L**: Open position mark-to-market
- **Win Rate**: Percentage of winning trades
- **Sharpe Ratio**: (Can be calculated from trade history)

## Limitations

1. **No Real Execution**: This is forward-testing only
2. **Assumes Perfect Execution**: Simulates fills at market prices
3. **No Slippage**: Doesn't account for bid-ask spreads
4. **No Fees**: Doesn't subtract trading fees
5. **Limited to Crypto Markets**: Only trades crypto price target markets

