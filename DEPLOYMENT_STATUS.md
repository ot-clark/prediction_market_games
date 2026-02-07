# Deployment Status & Next Steps

## What Has Been Done So Far

### 1. **EC2 instance**
- You launched an Ubuntu EC2 instance (e.g. “Poly Arb Instance”) with your `polypair` key and connected via SSH as `ubuntu@<public-IP>`.

### 2. **Code on the server**
- The bot code lives in **`/home/ubuntu/prediction_market_games`** (from cloning the GitHub repo `prediction_market_games`).

### 3. **Python environment**
- On the server you created a venv, upgraded pip, and installed dependencies from `requirements.txt`. The bot runs when you execute `python paper_trading_bot.py` manually.

### 4. **Two issues still present on the server**
- **Datetime bug:** When the bot runs a cycle, it crashes with  
  `TypeError: can't subtract offset-naive and offset-aware datetimes` in `crypto_math.py`.  
  This is **fixed in your local repo** (timezone-aware handling in `time_to_expiry_years` / `time_to_expiry_days`), but the **server still has the old `crypto_math.py`** until you deploy the updated file.
- **Systemd service path:** The systemd unit **`prediction-bot.service`** is still configured for **`/home/ubuntu/prediction_market_arb`** (wrong directory). Your app is in **`prediction_market_games`**, so the service fails with exit code 203 (path not found). You also created **`~/prediction_market_arb/logs`**; logs for this app should be under **`~/prediction_market_games/logs`**.

---

## Next Steps to Run the Bot Autonomously in the Cloud

Do these **in order**, from your Mac and then on the server.

### Step A: Deploy the datetime fix to the server (from your Mac)

Copy the fixed `crypto_math.py` from your local project (e.g. `prediction_market_arb`) to the server’s project folder (`prediction_market_games`). Replace `<PUBLIC_IP>` with your instance’s public IP (e.g. `3.145.110.50`).

```bash
scp -i /Users/owenclark/Projects/prediction_market_arb/polypair.pem \
  /Users/owenclark/Projects/prediction_market_arb/crypto_math.py \
  ubuntu@<PUBLIC_IP>:~/prediction_market_games/
```

### Step B: On the server — fix the systemd service and paths

1. **SSH in** (if not already):
   ```bash
   ssh -i /Users/owenclark/Projects/prediction_market_arb/polypair.pem ubuntu@<PUBLIC_IP>
   ```

2. **Create the correct logs directory:**
   ```bash
   mkdir -p ~/prediction_market_games/logs
   ```

3. **Edit the systemd service** so every path uses **prediction_market_games** (not prediction_market_arb):
   ```bash
   sudo nano /etc/systemd/system/prediction-bot.service
   ```
   Set the **entire** file to exactly this (all paths under `prediction_market_games`):

   ```ini
   [Unit]
   Description=Crypto Volatility Trading Bot
   After=network.target

   [Service]
   Type=simple
   User=ubuntu
   WorkingDirectory=/home/ubuntu/prediction_market_games
   Environment="PATH=/home/ubuntu/prediction_market_games/venv/bin"
   ExecStart=/home/ubuntu/prediction_market_games/venv/bin/python /home/ubuntu/prediction_market_games/paper_trading_bot.py
   Restart=always
   RestartSec=10
   StandardOutput=append:/home/ubuntu/prediction_market_games/logs/bot.log
   StandardError=append:/home/ubuntu/prediction_market_games/logs/bot_error.log

   [Install]
   WantedBy=multi-user.target
   ```
   Save and exit (Ctrl+O, Enter, Ctrl+X).

4. **Reload systemd and start the service:**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl restart prediction-bot
   ```

5. **Verify it’s running (no more 203/EXEC, and no datetime crash):**
   ```bash
   sudo systemctl status prediction-bot
   ```
   You want `Active: active (running)`. If it’s `active (running)` and stays that way for a minute, the datetime fix and paths are correct.

6. **Optional quick sanity check** — after a cycle (e.g. 60 seconds), check that the bot is logging:
   ```bash
   tail -20 ~/prediction_market_games/logs/bot.log
   ```
   You should see cycle output and no stack trace. Errors would also appear in `~/prediction_market_games/logs/bot_error.log`.

At this point the bot is **running autonomously** in the cloud: it will restart on reboot (`systemctl enable` was already run) and will restart on failure (`Restart=always`).

---

## Next Steps to Monitor Performance

### 1. **Watch logs in real time**
- **Main log (stdout):**
  ```bash
  tail -f ~/prediction_market_games/logs/bot.log
  ```
- **Error log:**
  ```bash
  tail -f ~/prediction_market_games/logs/bot_error.log
  ```

### 2. **Check service health**
- **Status:**
  ```bash
  sudo systemctl status prediction-bot
  ```
- **Recent systemd messages:**
  ```bash
  journalctl -u prediction-bot -n 50 --no-pager
  ```

### 3. **Inspect bot state and performance**
- **Full state (balance, positions, P&L, win rate):**
  ```bash
  cat ~/prediction_market_games/data/bot_state.json | python3 -m json.tool
  ```
- **Quick portfolio summary** (run from the project directory):
  ```bash
  cd ~/prediction_market_games
  python3 -c "
  import json
  with open('data/bot_state.json') as f:
      state = json.load(f)
  equity = state['current_balance'] + sum(p.get('size', 0) for p in state['open_positions'])
  starting = state.get('starting_balance', 1000)
  return_pct = ((equity - starting) / starting * 100) if starting > 0 else 0
  print('Balance: \$%.2f' % state['current_balance'])
  print('Open Positions: %d' % len(state['open_positions']))
  print('Total Return: %+.2f%%' % return_pct)
  print('Win Rate: %.1f%%' % (state['win_rate'] * 100))
  "
  ```

### 4. **Back up state periodically**
- **One-off backup:**
  ```bash
  cp ~/prediction_market_games/data/bot_state.json \
     ~/prediction_market_games/data/bot_state_backup_$(date +%Y%m%d_%H%M%S).json
  ```

### 5. **Control the bot**
- **Stop:**
  ```bash
  sudo systemctl stop prediction-bot
  ```
- **Start:**
  ```bash
  sudo systemctl start prediction-bot
  ```
- **Restart (e.g. after pulling new code):**
  ```bash
  cd ~/prediction_market_games && git pull && sudo systemctl restart prediction-bot
  ```

---

## Deploy Latest Changes (Deribit-only model + Reset State)

Use this when pushing the Deribit-only update and resetting `bot_state.json`:

### 1. From your Mac — push code to git

```bash
cd /Users/owenclark/Projects/prediction_market_arb
git add -A
git status   # review changes
git commit -m "Deribit-only model, remove z-score, reset bot state"
git push origin main
```

### 2. On the server — pull, reset state, restart

Replace `<PUBLIC_IP>` with your instance IP, then run:

```bash
# SSH in
ssh -i /Users/owenclark/Projects/prediction_market_arb/polypair.pem ubuntu@<PUBLIC_IP>

# Pull latest code, reset bot_state.json, restart
cd ~/prediction_market_games
git pull
sudo systemctl stop prediction-bot
cat > data/bot_state.json << 'EOF'
{
  "starting_balance": 1000,
  "current_balance": 1000,
  "total_pnl": 0,
  "open_positions": [],
  "closed_positions": [],
  "trades": [],
  "is_running": true,
  "last_update": null,
  "total_trades": 0,
  "winning_trades": 0,
  "losing_trades": 0,
  "win_rate": 0,
  "config": {
    "starting_balance": 1000,
    "min_edge_to_enter": 0.05,
    "max_edge_to_exit": 0.05,
    "base_position_size": 25,
    "edge_multiplier": 500,
    "max_position_size": 100,
    "max_total_exposure": 500,
    "poll_interval_seconds": 60,
    "max_positions_per_market": 1,
    "min_time_to_expiry_days": 1
  },
  "daily_equity_log": {},
  "daily_returns": [],
  "last_recorded_date": null
}
EOF
sudo systemctl start prediction-bot

# Verify
sudo systemctl status prediction-bot
tail -30 ~/prediction_market_games/logs/bot.log
```

**Alternative (if you deploy via SCP instead of git):** Upload the changed files, then reset state and restart:

```bash
# From Mac — upload changed files
scp -i /Users/owenclark/Projects/prediction_market_arb/polypair.pem \
  /Users/owenclark/Projects/prediction_market_arb/{arbitrage_calculator.py,crypto_math.py,paper_trading_bot.py,real_trading_bot.py} \
  ubuntu@<PUBLIC_IP>:~/prediction_market_games/

# Then on server: reset bot_state.json, restart (same commands as above)
```

---

## Summary Checklist

- [ ] Copy updated `crypto_math.py` to server (`scp` to `~/prediction_market_games/`).
- [ ] On server: `mkdir -p ~/prediction_market_games/logs`.
- [ ] On server: Edit `prediction-bot.service` so all paths use `prediction_market_games`.
- [ ] On server: `sudo systemctl daemon-reload && sudo systemctl restart prediction-bot`.
- [ ] Confirm: `sudo systemctl status prediction-bot` shows `active (running)` and `tail -20 ~/prediction_market_games/logs/bot.log` shows normal cycles.
- [ ] Use logs, `bot_state.json`, and the portfolio summary script above to monitor performance.
