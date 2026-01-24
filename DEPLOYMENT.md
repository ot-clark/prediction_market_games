# Production Deployment Guide

## Prerequisites

- Linux VM (Ubuntu 20.04+ recommended)
- Python 3.9+
- Internet connection
- At least 1GB RAM, 10GB disk space

## Step 1: Server Setup

### SSH into your VM

```bash
ssh user@your-vm-ip
```

### Update system packages

```bash
sudo apt update
sudo apt upgrade -y
```

### Install Python and pip

```bash
sudo apt install -y python3 python3-pip python3-venv
```

### Install system dependencies (optional, for better performance)

```bash
sudo apt install -y build-essential
```

## Step 2: Deploy Bot Code

### Option A: Clone from Git

```bash
cd ~
git clone <your-repo-url> prediction_market_arb
cd prediction_market_arb
```

### Option B: Upload via SCP

From your local machine:

```bash
scp -r /path/to/prediction_market_arb user@your-vm-ip:~/
```

Then on the server:

```bash
cd ~/prediction_market_arb
```

## Step 3: Set Up Python Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

## Step 4: Configure Environment

```bash
# Create .env file (optional, for real trading bot)
nano .env
```

Add if needed (for real trading bot only):
```
POLYMARKET_PRIVATE_KEY=your_private_key_here
```

**Note**: For forward-testing, you don't need this.

## Step 5: Test Run

```bash
# Make sure you're in the virtual environment
source venv/bin/activate

# Test that everything works
python paper_trading_bot.py
```

Press Ctrl+C after a few cycles to verify it's working.

## Step 6: Set Up as Systemd Service (Recommended)

### Create service file

```bash
sudo nano /etc/systemd/system/prediction-bot.service
```

Add the following content:

```ini
[Unit]
Description=Crypto Volatility Trading Bot
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/home/your-username/prediction_market_arb
Environment="PATH=/home/your-username/prediction_market_arb/venv/bin"
ExecStart=/home/your-username/prediction_market_arb/venv/bin/python /home/your-username/prediction_market_arb/paper_trading_bot.py
Restart=always
RestartSec=10
StandardOutput=append:/home/your-username/prediction_market_arb/logs/bot.log
StandardError=append:/home/your-username/prediction_market_arb/logs/bot_error.log

[Install]
WantedBy=multi-user.target
```

**Replace**:
- `your-username` with your actual username
- Adjust paths if different

### Create logs directory

```bash
mkdir -p ~/prediction_market_arb/logs
```

### Enable and start service

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable prediction-bot

# Start the service
sudo systemctl start prediction-bot

# Check status
sudo systemctl status prediction-bot
```

## Step 7: Monitor the Bot

### View logs in real-time

```bash
tail -f ~/prediction_market_arb/logs/bot.log
```

### View error logs

```bash
tail -f ~/prediction_market_arb/logs/bot_error.log
```

### Check service status

```bash
sudo systemctl status prediction-bot
```

### View recent output

```bash
journalctl -u prediction-bot -n 50 --no-pager
```

## Step 8: Manage the Bot

### Stop the bot

```bash
sudo systemctl stop prediction-bot
```

### Start the bot

```bash
sudo systemctl start prediction-bot
```

### Restart the bot

```bash
sudo systemctl restart prediction-bot
```

### Disable auto-start on boot

```bash
sudo systemctl disable prediction-bot
```

## Alternative: Using screen/tmux (Simpler)

If you prefer not to use systemd:

### Install screen

```bash
sudo apt install -y screen
```

### Start bot in screen session

```bash
cd ~/prediction_market_arb
source venv/bin/activate
screen -S prediction-bot
python paper_trading_bot.py
```

### Detach from screen

Press: `Ctrl+A` then `D`

### Reattach to screen

```bash
screen -r prediction-bot
```

### List screen sessions

```bash
screen -ls
```

## Monitoring and Maintenance

### Check bot state

```bash
cat ~/prediction_market_arb/data/bot_state.json | python3 -m json.tool
```

### View portfolio summary

```bash
python3 -c "
import json
with open('data/bot_state.json') as f:
    state = json.load(f)
    equity = state['current_balance'] + sum(p.get('size', 0) for p in state['open_positions'])
    starting = state.get('starting_balance', 1000)
    return_pct = ((equity - starting) / starting * 100) if starting > 0 else 0
    print(f'Balance: \${state[\"current_balance\"]:.2f}')
    print(f'Open Positions: {len(state[\"open_positions\"])}')
    print(f'Total Return: {return_pct:+.2f}%')
    print(f'Win Rate: {state[\"win_rate\"] * 100:.1f}%')
"
```

### Backup state

```bash
# Create backup
cp ~/prediction_market_arb/data/bot_state.json ~/prediction_market_arb/data/bot_state_backup_$(date +%Y%m%d_%H%M%S).json
```

### Update bot code

```bash
cd ~/prediction_market_arb
source venv/bin/activate

# Pull latest code (if using git)
git pull

# Restart service
sudo systemctl restart prediction-bot
```

## Troubleshooting

### Bot not starting

```bash
# Check logs
sudo journalctl -u prediction-bot -n 100

# Check Python errors
python3 paper_trading_bot.py
```

### Permission errors

```bash
# Fix data directory permissions
chmod 755 ~/prediction_market_arb/data
chmod 644 ~/prediction_market_arb/data/*.json
```

### API rate limits

If you see rate limit errors:
- Increase `poll_interval_seconds` in config
- The bot will automatically retry on next cycle

### Out of memory

```bash
# Check memory
free -h

# If needed, add swap space
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## Security Considerations

1. **Don't expose private keys**: Keep `.env` file secure
2. **Firewall**: Only allow SSH access
3. **Regular updates**: Keep system and Python packages updated
4. **Backups**: Regularly backup `data/bot_state.json`

## Performance Tuning

### Adjust poll interval

Edit `paper_trading_bot.py`:
```python
'poll_interval_seconds': 120,  # Check every 2 minutes instead of 1
```

### Limit API calls

The bot already limits:
- Polymarket: 100 markets per cycle
- CoinGecko: Only fetches needed cryptos
- Deribit: Only for BTC/ETH

## Next Steps

1. Monitor for 24-48 hours to ensure stability
2. Review logs for any errors
3. Check portfolio performance
4. Adjust configuration as needed
5. Consider setting up alerts (email/Slack) for errors

## Support

Check logs first:
```bash
tail -100 ~/prediction_market_arb/logs/bot.log
```

For issues, review:
- `BOT_DOCUMENTATION.md` for behavior details
- `README.md` for general usage

