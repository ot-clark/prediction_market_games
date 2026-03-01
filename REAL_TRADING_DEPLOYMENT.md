# Deploying the Real Trading Bot ($100 Live Test)

This guide covers running the **real trading bot** with **$100** on the same Ubuntu AWS infrastructure you use for the paper bot. The real bot uses the same rules (edge thresholds, exit logic) and now has **live portfolio logs** (state file, daily returns, Sharpe, win rate).

---

## Step-by-step: Fund and set up (start here)

Follow these in order. Steps 1–4 are on your **computer / wallet**. Steps 5–9 are on your **Ubuntu AWS server**.

---

### Step 1: Create or choose a wallet for the bot

- **Option A – New wallet (recommended):** Create a new MetaMask (or other) wallet used only for this $100 test. That way if the key is ever exposed, only this balance is at risk.
- **Option B – Existing wallet:** Use an existing wallet that you’re okay using for Polymarket. You will export its private key in Step 4.

If using MetaMask: install the [MetaMask extension](https://metamask.io), create a new wallet, write down the seed phrase and store it safely. You’ll add Polygon and USDC next.

---

### Step 2: Add Polygon and get USDC on Polygon

1. **Add Polygon to your wallet**
   - In MetaMask: click the network dropdown (top) → “Add network” or “Add a network manually”.
   - Use [Polygon’s official info](https://polygon.technology): Network name **Polygon Mainnet**, RPC `https://polygon-rpc.com`, Chain ID **137**, Currency **MATIC**, Block explorer `https://polygonscan.com`. Save and switch to Polygon.

2. **Get USDC on Polygon**
   - **Bridge:** Send USDC (or ETH) from Ethereum mainnet to Polygon using [Polygon Bridge](https://wallet.polygon.technology/polygon/bridge) or a bridge from your exchange.
   - **Or buy on Polygon:** Use a CEX that supports Polygon withdrawals (e.g. send USDC to your wallet on Polygon), or swap MATIC → USDC on a Polygon DEX (e.g. Uniswap on Polygon, QuickSwap).
   - You need at least **$100 USDC** on Polygon (a bit more to cover gas in MATIC is useful).

---

### Step 3: Deposit $100 into Polymarket

1. Go to **[polymarket.com](https://polymarket.com)** and connect the wallet you funded (e.g. MetaMask → Connect Wallet).
2. Open **Account** or **Portfolio** (or the deposit/balance area).
3. Choose **Deposit** and select **USDC on Polygon**. Enter **100** (or your chosen amount) and confirm. Approve the transaction in your wallet.
4. Wait for the deposit to confirm. Your Polymarket balance should show about **$100** available for trading.

---

### Step 4: Export the wallet private key (for the bot)

- **MetaMask:** Click the three dots (⋮) → Account details → Export Private Key. Enter your password and copy the key (starts with `0x`). Store it somewhere secure temporarily; you’ll put it in the server `.env` in Step 7.
- **Security:** Use a wallet that holds only the funds you’re testing with. Never commit this key to git or share it.

*(If you only want to run in **dry run** first—no real orders—you can skip putting the key on the server and leave `.env` without `POLYMARKET_PRIVATE_KEY`. The bot will still run and log portfolio state.)*

---

### Step 5: SSH into your Ubuntu AWS server

From your laptop (use your key path and server IP):

```bash
ssh -i /path/to/your-key.pem ubuntu@YOUR_SERVER_IP
```

Example:

```bash
ssh -i ~/Projects/prediction_market_arb/polypair.pem ubuntu@3.145.110.50
```

---

### Step 6: Ensure the repo is up to date and has the real bot

```bash
cd ~/prediction_market_games
git pull
# Or, if you deploy without git: upload/copy the latest real_trading_bot.py and any changed files.
```

Check that the real bot exists and has the $100 config:

```bash
grep -A2 "starting_balance" real_trading_bot.py
# You should see starting_balance: 100 and max_total_exposure: 50
```

Create the logs directory if it doesn’t exist:

```bash
mkdir -p logs
```

---

### Step 7: Create `.env` with your private key (or leave empty for dry run)

```bash
cd ~/prediction_market_games
nano .env
```

Paste this line and replace the value with your **actual** private key (the one you exported in Step 4):

```
POLYMARKET_PRIVATE_KEY=0x_your_64_character_hex_key_here
```

Save and exit (`Ctrl+O`, Enter, `Ctrl+X`). Restrict permissions:

```bash
chmod 600 .env
```

- For **dry run only** you can leave the file empty or set `POLYMARKET_PRIVATE_KEY=` (empty). The bot will still run and log; it won’t send real orders.

---

### Step 8: Install and start the real bot as a systemd service

Create the service file:

```bash
sudo nano /etc/systemd/system/real-prediction-bot.service
```

Paste the following block exactly (paths assume user `ubuntu` and repo in `~/prediction_market_games`):

```ini
[Unit]
Description=Real Trading Bot ($100 live test)
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/prediction_market_games
Environment="PATH=/home/ubuntu/prediction_market_games/venv/bin"
EnvironmentFile=/home/ubuntu/prediction_market_games/.env
ExecStart=/home/ubuntu/prediction_market_games/venv/bin/python /home/ubuntu/prediction_market_games/real_trading_bot.py
Restart=always
RestartSec=10
StandardOutput=append:/home/ubuntu/prediction_market_games/logs/real_bot.log
StandardError=append:/home/ubuntu/prediction_market_games/logs/real_bot_error.log

[Install]
WantedBy=multi-user.target
```

Save and exit. Then run:

```bash
sudo systemctl daemon-reload
sudo systemctl enable real-prediction-bot
sudo systemctl start real-prediction-bot
sudo systemctl status real-prediction-bot
```

You should see `active (running)`. If you see failed, check:

```bash
journalctl -u real-prediction-bot -n 50 --no-pager
```

---

### Step 9: Verify it’s running and see live portfolio logs

1. **Watch the log (cycle-by-cycle output):**
   ```bash
   tail -f ~/prediction_market_games/logs/real_bot.log
   ```
   You should see lines like “Running REAL trading cycle…”, “PORTFOLIO SUMMARY”, balance, exposure, P&L. Press `Ctrl+C` to stop following.

2. **Inspect state (positions, P&L, daily returns, win rate):**
   ```bash
   cat ~/prediction_market_games/data/real_bot_state.json | python3 -m json.tool
   ```

3. **Daily returns CSV (once a new day has rolled):**
   ```bash
   cat ~/prediction_market_games/data/real_daily_returns.csv
   ```

Done. The real bot is funded (Polymarket has your $100), configured for $100, and running with live portfolio logs. It runs in **dry run** by default (no real orders sent until order execution is implemented and you set `dry_run: False`).

---

## 1. What’s Already Done in Code

- **Config** is set for $100: `starting_balance: 100`, `max_total_exposure: 50`, `base_position_size: 2.5`, `max_position_size: 10`, same edge rules as paper.
- **Portfolio logging**: `data/real_bot_state.json` and `data/real_daily_returns.csv` record balance, positions, P&L, daily returns, win rate, and the bot prints a portfolio summary each cycle.
- **Default is still dry run**: `dry_run: True` so no real orders are sent until you enable live execution.

---

## 2. Steps to Deploy

### 2.1 Fund Polymarket with $100

1. Use a wallet you control (e.g. MetaMask) on **Polygon**.
2. Bridge or buy **USDC on Polygon** (Polymarket uses Polygon USDC).
3. Go to [Polymarket](https://polymarket.com), connect that wallet, and deposit **$100 USDC** into your Polymarket account (so it’s available for trading).

### 2.2 Wallet and Private Key

- The bot needs the **private key** of the wallet that holds the Polymarket funds.
- **Security**: Never commit the key. Use a dedicated wallet for the bot with only the $100 (or small amount) you’re testing with.

### 2.3 Environment Variables on the Server

On the Ubuntu server (e.g. in `~/prediction_market_games`):

```bash
cd ~/prediction_market_games
nano .env
```

Add (replace with your real key for live trading):

```bash
# Required for real trading (leave empty or omit for dry run only)
POLYMARKET_PRIVATE_KEY=your_hex_private_key_here
```

Save and restrict permissions:

```bash
chmod 600 .env
```

- If you only run in **dry run**, you can leave `POLYMARKET_PRIVATE_KEY` unset or empty; the bot will still log portfolio state and daily returns using simulated fills.

### 2.4 Config Check (Already $100)

In `real_trading_bot.py`, `CONFIG` is already set for $100:

- `starting_balance`: 100  
- `max_total_exposure`: 50  
- `base_position_size`: 2.5  
- `max_position_size`: 10  
- `min_edge_to_enter` / `max_edge_to_exit`: same as paper (5% / 3%)  
- `dry_run`: **True** by default (no real orders)

To **enable real orders** once you have order execution working, set:

```python
'dry_run': False,
```

**Note:** The codebase’s real order path (EIP-712 signing and Polymarket CLOB submission) is not fully implemented yet. Until it is, keep `dry_run: True` to test logic and logs; you’ll get full portfolio logs and state without sending orders.

### 2.5 Same Ubuntu AWS Server – Run Real Bot as a Second Service

Keep the existing **paper** bot as-is. Run the **real** bot as a **separate** systemd service so you can start/stop/log them independently.

Create the real-bot service file:

```bash
sudo nano /etc/systemd/system/real-prediction-bot.service
```

Paste (adjust paths if your repo or user differ):

```ini
[Unit]
Description=Real Trading Bot ($100 live test)
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/prediction_market_games
Environment="PATH=/home/ubuntu/prediction_market_games/venv/bin"
EnvironmentFile=/home/ubuntu/prediction_market_games/.env
ExecStart=/home/ubuntu/prediction_market_games/venv/bin/python /home/ubuntu/prediction_market_games/real_trading_bot.py
Restart=always
RestartSec=10
StandardOutput=append:/home/ubuntu/prediction_market_games/logs/real_bot.log
StandardError=append:/home/ubuntu/prediction_market_games/logs/real_bot_error.log

[Install]
WantedBy=multi-user.target
```

Then:

```bash
sudo systemctl daemon-reload
sudo systemctl enable real-prediction-bot
sudo systemctl start real-prediction-bot
sudo systemctl status real-prediction-bot
```

- **Paper bot** stays: `prediction-bot.service` → `paper_trading_bot.py` → `logs/bot.log`  
- **Real bot** uses: `real-prediction-bot.service` → `real_trading_bot.py` → `logs/real_bot.log`

### 2.6 Live Portfolio Logs – Where to Look

- **State (positions, P&L, daily returns, win rate):**  
  `~/prediction_market_games/data/real_bot_state.json`

- **Daily returns CSV:**  
  `~/prediction_market_games/data/real_daily_returns.csv`

- **Console output (cycle-by-cycle summary):**  
  `~/prediction_market_games/logs/real_bot.log`

Example: view state and tail log:

```bash
cd ~/prediction_market_games
cat data/real_bot_state.json | python3 -m json.tool
tail -f logs/real_bot.log
```

From your laptop (replace key path and host):

```bash
scp -i /path/to/your-key.pem ubuntu@YOUR_SERVER_IP:~/prediction_market_games/data/real_bot_state.json ./
```

---

## 3. Summary Checklist

- [ ] Polymarket funded with $100 USDC (Polygon).
- [ ] Dedicated wallet for bot; private key stored only in `.env` on server (or leave unset for dry run).
- [ ] `.env` has `POLYMARKET_PRIVATE_KEY` (if using live orders later); `chmod 600 .env`.
- [ ] Repo on server is up to date (real bot has $100 config and portfolio logging).
- [ ] `real-prediction-bot.service` installed and enabled; logs go to `logs/real_bot.log` and `logs/real_bot_error.log`.
- [ ] `dry_run` left `True` until order execution (EIP-712) is implemented; then set `dry_run: False` when ready for real orders.
- [ ] Monitor with `data/real_bot_state.json`, `data/real_daily_returns.csv`, and `tail -f logs/real_bot.log`.

---

## 4. Order Execution Note

The real bot’s `execute_order` path currently **does not** place live orders on Polymarket (EIP-712 signing and CLOB submission are not implemented). With `dry_run: True` it:

- Uses the same entry/exit rules and position sizing.
- Simulates fills at the current Polymarket price.
- Updates state and writes **real_bot_state.json** and **real_daily_returns.csv** as if trades had happened.

So you can:

- Run the real bot in dry run on the same server with $100 config and get **full live portfolio logs** (state + daily returns + Sharpe + win rate).
- When you add or integrate real order placement (eIP-712 + Polymarket API), set `dry_run: False` and add your key to `.env` to switch to real $100 execution without changing infrastructure or log locations.
