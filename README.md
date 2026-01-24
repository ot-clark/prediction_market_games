# Crypto Volatility Trading Bot

A Python bot that **forward-tests** crypto volatility trading opportunities by comparing Polymarket crypto price target markets against model probabilities (z-score and Deribit options data).

## ⚠️ Important

**This bot is in FORWARD-TESTING MODE only. It does NOT place real orders.** It simulates trades to test the strategy's performance.

## Features

- **Crypto Price Target Markets**: Finds markets on Polymarket that bet on crypto price targets (e.g., "Will Bitcoin hit $200k by Dec 2025?")
- **Probability Calculations**: Uses z-score method and Deribit options data to calculate model probabilities
- **Edge Detection**: Compares Polymarket prices vs model probabilities to find trading edges
- **Forward Testing**: Simulates trades and tracks performance metrics
- **Real-time P&L Tracking**: Shows realized and unrealized P&L, total return, win rate

## Quick Start

### Local Testing

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Run the bot:
```bash
python paper_trading_bot.py
```

The bot will:
- Fetch arbitrage opportunities every 60 seconds
- Enter positions when edge > 5%
- Exit positions when edge < 5%
- Track P&L, returns, and win rate
- Save state to `data/bot_state.json`

### Production Deployment

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for complete production setup instructions.

Quick version:
```bash
# On your VM
git clone <repo> && cd prediction_market_arb
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python paper_trading_bot.py
```

## What the Bot Does

See **[BOT_DOCUMENTATION.md](BOT_DOCUMENTATION.md)** for detailed behavior.

**Summary:**
1. Fetches crypto price target markets from Polymarket
2. Gets current prices from CoinGecko
3. Gets options data from Deribit (for BTC/ETH)
4. Calculates model probabilities using z-score and Black-Scholes
5. Finds trading edges (Polymarket price vs model)
6. Enters positions when edge > 5%
7. Exits positions when edge < 5% or flips
8. Tracks all P&L and performance metrics

## Output Example

```
============================================================
[2024-01-15 14:30:00] BOT CYCLE START
============================================================
📊 Fetching crypto trading opportunities...
✓ Found 45 opportunities

🟢 OPENING POSITION #1
   Market: Will Bitcoin hit $200,000 by December 31, 2025?
   Side: LONG
   Edge: -8.45%
   Entry Price: 32.10%
   Position Size: $67.25

============================================================
📊 PORTFOLIO SUMMARY
============================================================
💰 Balance: $892.50
📈 Open Positions: 4
💵 Realized P&L: +$45.67
📊 Total P&L: +$58.01
📉 Total Return: +5.80%
🎯 Win Rate: 62.5% (5W / 3L)
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
    'edge_multiplier': 500,              # Edge scaling
    'max_position_size': 100,           # Max per position
    'max_total_exposure': 500,           # Max total exposure
    'poll_interval_seconds': 60,         # Check frequency
}
```

## Project Structure

```
.
├── config.py                 # Configuration constants
├── crypto_math.py            # Probability calculations
├── data_fetchers.py          # API fetching
├── arbitrage_calculator.py # Crypto volatility opportunity calculator
├── paper_trading_bot.py      # Forward-testing bot
├── requirements.txt          # Python dependencies
├── BOT_DOCUMENTATION.md      # Detailed behavior
├── DEPLOYMENT.md             # Production setup
└── data/                     # Bot state files
    └── bot_state.json        # Saved state
```

## Data Sources

- **Polymarket**: Crypto price target markets
- **CoinGecko**: Current crypto prices
- **Deribit**: Options IV for BTC and ETH

## Performance Metrics

The bot tracks:
- **Total Return**: Overall percentage return
- **Realized P&L**: Closed trade profits/losses
- **Unrealized P&L**: Open position mark-to-market
- **Win Rate**: Percentage of winning trades
- **Trade Count**: Total number of trades

## Documentation

- **[BOT_DOCUMENTATION.md](BOT_DOCUMENTATION.md)**: Detailed explanation of bot behavior
- **[DEPLOYMENT.md](DEPLOYMENT.md)**: Production deployment guide

## Notes

- Bot is in **forward-testing mode** - no real orders
- State persists across restarts
- Conservative position sizing and exposure limits
- All trades logged to state file

## License

MIT
