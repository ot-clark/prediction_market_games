# Bot Summary Report

## What the Bot Does (Detailed)

### Core Functionality

The bot is a **forward-testing crypto volatility trading system** that:

1. **Scans Polymarket** every 60 seconds for crypto price target markets
   - Examples: "Will Bitcoin hit $200k by Dec 2025?", "Will Ethereum reach $10k before 2026?"
   - Filters for active, unresolved markets with valid price data

2. **Calculates Model Probabilities** using two methods:
   - **Z-Score Method**: Uses lognormal distribution with volatility assumptions
   - **Deribit Method** (BTC/ETH only): Uses Black-Scholes delta from options market data
   - Accounts for bet type (binary vs one-touch) and direction (above vs below)

3. **Finds Trading Edges**:
   - Edge = Polymarket Price - Model Probability
   - Positive edge = Polymarket overpriced (sell signal)
   - Negative edge = Polymarket underpriced (buy signal)

4. **Simulates Trades** (NO REAL ORDERS):
   - **Enters** when edge ≥ 5% and all safety checks pass
   - **Exits** when edge < 5% or flips sign
   - Tracks all positions, P&L, and performance metrics

5. **Reports Results** in real-time:
   - Portfolio balance and equity
   - Open positions with unrealized P&L
   - Closed positions with realized P&L
   - Total return percentage
   - Win rate and trade statistics

### Trading Logic

**Entry Conditions** (ALL must be true):
- Edge ≥ 5% (absolute value)
- Market price between 1% and 99% (not resolved)
- Event hasn't happened yet (for one-touch bets)
- At least 1 day to expiry
- No existing position in same market
- Within exposure limits ($500 max total, $100 max per position)
- Sufficient balance

**Exit Conditions** (ANY triggers exit):
- Edge drops below 5%
- Edge flips sign (was long, now should be short)
- Market expires

**Position Sizing**:
- Base: $25
- Scales with edge: +$50 per 10% additional edge
- Example: 8% edge → $25 + (0.08 × 500) = $65 position

### Output Format

Each cycle (every 60 seconds) shows:

```
============================================================
[2024-01-15 14:30:00] BOT CYCLE START
============================================================
📊 Fetching crypto trading opportunities...
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

### Key Metrics Tracked

- **Total Return**: Percentage gain/loss on starting balance
- **Realized P&L**: Profits/losses from closed trades
- **Unrealized P&L**: Mark-to-market value of open positions
- **Win Rate**: Percentage of profitable trades
- **Trade Count**: Total number of trades executed

## How to Run

### Local Testing

```bash
# Install dependencies
pip install -r requirements.txt

# Run the bot
python paper_trading_bot.py
```

### Production Deployment (VM)

**Quick Start:**

```bash
# 1. SSH into your VM
ssh user@your-vm-ip

# 2. Clone/upload code
cd ~
git clone <repo-url> prediction_market_arb
cd prediction_market_arb

# 3. Set up Python environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 4. Test run
python paper_trading_bot.py
```

**Production Setup (systemd service):**

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for complete instructions.

Quick version:
```bash
# Create systemd service
sudo nano /etc/systemd/system/prediction-bot.service
# (Copy service file from DEPLOYMENT.md)

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable prediction-bot
sudo systemctl start prediction-bot

# Monitor
tail -f ~/prediction_market_arb/logs/bot.log
```

**Alternative (screen/tmux):**

```bash
# Start in screen session
screen -S prediction-bot
source venv/bin/activate
python paper_trading_bot.py

# Detach: Ctrl+A then D
# Reattach: screen -r prediction-bot
```

## Configuration

Edit `CONFIG` in `paper_trading_bot.py`:

```python
CONFIG = {
    'starting_balance': 1000,           # Starting capital
    'min_edge_to_enter': 0.05,          # 5% minimum edge
    'max_edge_to_exit': 0.05,           # Exit when edge < 5%
    'base_position_size': 25,            # Base position size
    'edge_multiplier': 500,              # Edge scaling factor
    'max_position_size': 100,           # Max per position
    'max_total_exposure': 500,           # Max total exposure
    'poll_interval_seconds': 60,         # Check every 60 seconds
    'min_time_to_expiry_days': 1,       # Min 1 day to expiry
}
```

## State Management

- State saved to `data/bot_state.json` after each cycle
- Survives bot restarts
- Contains: balance, positions, trades, P&L, win rate

## Safety Features

✅ **No Real Orders**: Forward-testing only
✅ **Exposure Limits**: Hard caps on position and total exposure
✅ **Market Validation**: Skips resolved markets and invalid events
✅ **Balance Checks**: Won't over-leverage
✅ **State Persistence**: Can restart without losing data

## Monitoring

### View Logs
```bash
# Real-time
tail -f logs/bot.log

# Last 100 lines
tail -100 logs/bot.log
```

### Check State
```bash
# View current state
cat data/bot_state.json | python3 -m json.tool

# Quick summary
python3 -c "
import json
with open('data/bot_state.json') as f:
    state = json.load(f)
    equity = state['current_balance'] + sum(p.get('size', 0) for p in state['open_positions'])
    starting = state.get('starting_balance', 1000)
    return_pct = ((equity - starting) / starting * 100) if starting > 0 else 0
    print(f'Return: {return_pct:+.2f}%')
    print(f'Win Rate: {state[\"win_rate\"] * 100:.1f}%')
"
```

### Service Management
```bash
# Status
sudo systemctl status prediction-bot

# Restart
sudo systemctl restart prediction-bot

# Stop
sudo systemctl stop prediction-bot
```

## Next Steps

1. **Deploy to VM** using DEPLOYMENT.md
2. **Monitor for 24-48 hours** to ensure stability
3. **Review performance** metrics
4. **Adjust configuration** as needed
5. **Set up alerts** (optional) for errors

## Documentation

- **[BOT_DOCUMENTATION.md](BOT_DOCUMENTATION.md)**: Detailed behavior explanation
- **[DEPLOYMENT.md](DEPLOYMENT.md)**: Complete production setup guide
- **[README.md](README.md)**: Quick reference

## Important Notes

⚠️ **This bot does NOT place real orders** - it's in forward-testing mode
⚠️ **Assumes perfect execution** - doesn't account for slippage or fees
⚠️ **Limited to crypto markets** - only trades crypto price target markets
⚠️ **State persists** - can restart without losing data

