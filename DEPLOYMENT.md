# Production Deployment Guide

**Directory names:** The GitHub repo is **prediction_market_games**. This guide uses that name for the server directory (so paths match after `git clone`). Your local folder may be named **prediction_market_arb**; if you upload via SCP, the server will have whatever name you copied—either use `prediction_market_games` in the commands below or run `mv ~/prediction_market_arb ~/prediction_market_games` on the server after uploading.

## Deploying on AWS Lightsail (Step-by-Step)

This section walks you through deploying the bot on an **AWS Lightsail** instance (Lightsail is AWS’s simplified VPS; it uses EC2 under the hood but with a simpler UI and fixed plans).

### Part A: Create the Lightsail Instance

1. **Sign in to AWS**  
   Go to [https://lightsail.aws.amazon.com](https://lightsail.aws.amazon.com) and sign in (or create an account).

2. **Create an instance**  
   - Click **Create instance**.  
   - **Instance location**: Pick a region (e.g. `us-east-1`).  
   - **Pick a platform**: **Linux/Unix**.  
   - **Blueprint**: **OS only** → **Ubuntu 22.04 LTS** (or 20.04).  
   - **Instance plan**: Choose at least **$5/month** (512 MB RAM) or **$10/month** (1 GB RAM) for comfort. The bot needs ~1 GB RAM and a bit of disk; 512 MB can work but 1 GB is safer.  
   - **Name**: e.g. `prediction-bot`.  
   - Click **Create instance**.

3. **Wait for the instance**  
   Status should change to **Running** (green). Note the **public IP** shown on the instance card.

4. **Optional: attach a static IP**  
   So the IP doesn’t change on reboot:  
   - **Networking** tab → **Create static IP** → attach it to your instance. Use this IP for SSH from now on.

### Part B: Get SSH Access

5. **Download the default SSH key (first time only)**  
   - In Lightsail: **Account** (top right) → **Account** → **SSH keys** tab.  
   - Select your instance’s region.  
   - Click **Download** for the default key; save it (e.g. `lightsail-key.pem`).  
   - On your Mac/Linux, restrict permissions:
     ```bash
     chmod 400 ~/Downloads/lightsail-key.pem
     ```

   **Or use your own key:**  
   When creating the instance you can choose “Create new” or upload your public key; then use the matching private key locally.

6. **Find the default username**  
   Lightsail Ubuntu images use **ubuntu** as the default user (not `root`). So you will connect as:
   ```bash
   ssh -i /path/to/lightsail-key.pem ubuntu@YOUR_INSTANCE_IP
   ```
   Replace `YOUR_INSTANCE_IP` with the instance’s public IP (or static IP if you created one).

### Part C: Run the Bot Setup on the Instance

Once you can SSH in, follow the same steps as the generic “Server Setup” below, with these specifics for Lightsail:

- **User**: `ubuntu`  
- **Home directory**: `/home/ubuntu`  
- **Project path**: `/home/ubuntu/prediction_market_games`

So on the instance you will:

7. **Update system and install Python**
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y python3 python3-pip python3-venv build-essential git
   ```

8. **Deploy the code**  
   **Option 1 – Clone from Git (recommended)**  
   ```bash
   cd ~
   git clone https://github.com/YOUR_USERNAME/prediction_market_games.git
   cd prediction_market_games
   ```
   Replace `YOUR_USERNAME` and repo URL with your actual repo. If the repo is private, set up SSH keys or a deploy key on the instance.

   **Option 2 – Upload with SCP from your laptop**  
   From your **local machine** (not the server), upload your project folder (e.g. `prediction_market_arb` if that’s the name locally):
   ```bash
   scp -i /path/to/lightsail-key.pem -r /path/to/your/project/folder ubuntu@YOUR_INSTANCE_IP:~/prediction_market_games
   ```
   Then on the server: `cd ~/prediction_market_games`. (Uploading to `~/prediction_market_games` keeps paths in this guide correct.)

9. **Create venv and install dependencies**
   ```bash
   cd ~/prediction_market_games
   python3 -m venv venv
   source venv/bin/activate
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

10. **Optional: real trading**  
    If you ever run the real trading bot, put secrets in a `.env` file (e.g. `POLYMARKET_PRIVATE_KEY=...`). For paper trading you can skip this.

11. **Quick test**
    ```bash
    source venv/bin/activate
    python paper_trading_bot.py
    ```
    Let it run a cycle or two, then press **Ctrl+C**.

12. **Create logs directory**
    ```bash
    mkdir -p ~/prediction_market_games/logs
    ```

13. **Install and run as a systemd service**  
    Create the service file (use `ubuntu` and `/home/ubuntu`):
    ```bash
    sudo nano /etc/systemd/system/prediction-bot.service
    ```
    Paste (paths are for user `ubuntu` and repo name `prediction_market_games`):
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
    Then:
    ```bash
    sudo systemctl daemon-reload
    sudo systemctl enable prediction-bot
    sudo systemctl start prediction-bot
    sudo systemctl status prediction-bot
    ```

14. **Monitor**
    ```bash
    tail -f ~/prediction_market_games/logs/bot.log
    ```

**Lightsail firewall:**  
Lightsail instances only allow SSH (22) and optionally HTTP/80 by default. Your bot only needs outbound internet (APIs); no extra inbound ports are required. You can leave the firewall as-is.

**Summary checklist (Lightsail)**  
- [ ] Create Lightsail instance (Ubuntu 22.04, ≥1 GB RAM).  
- [ ] (Optional) Attach static IP.  
- [ ] Download or set up SSH key; connect as `ubuntu@<IP>`.  
- [ ] Update system, install Python/git.  
- [ ] Clone or SCP project to `~/prediction_market_games`.  
- [ ] Create venv, `pip install -r requirements.txt`.  
- [ ] Test run `python paper_trading_bot.py`.  
- [ ] Create `logs`, add systemd service, enable and start it.  
- [ ] Check `systemctl status prediction-bot` and `tail -f .../logs/bot.log`.

---

## Deploying on EC2 (Console / Launch Wizard)

If you launch an EC2 instance from the AWS Console (or a similar setup page), you typically only configure: **application/OS image**, **instance type**, **key pair**, **network settings**, and **storage**. Use the choices below, then SSH in and run the same app setup as **Lightsail Part C**.

### 1. Application and OS images

- **Application and OS images (Amazon Machine Image)**: Choose **Ubuntu**. Pick **Ubuntu Server 22.04 LTS** (or 20.04) so you get Python 3 and `apt`.  
- Leave any “Quick Start” / “Free tier” Ubuntu option selected if you see it.

### 2. Instance type

- **Instance type**: Pick **t3.micro** (1 vCPU, 1 GB RAM) for low cost; the bot runs fine on it.  
- If you prefer more headroom, use **t3.small** (2 vCPU, 2 GB RAM).

### 3. Key pair

- **Key pair**: Select your existing key (e.g. **polypair**).  
- Ensure you have the matching **private** key (e.g. `polypair.pem`) on your laptop.  
- If you haven’t created a key yet: create a new key pair, download the `.pem`, and keep it safe. Restrict permissions: `chmod 400 polypair.pem`.

### 4. Network settings

- **Network settings**:  
  - Allow **SSH (port 22)** from your IP (or from “My IP” if the UI offers it). The bot only needs outbound internet; no other inbound ports are required.  
  - If you use a **security group** (e.g. `sg-preview-1`): ensure that group has an inbound rule for SSH (22) from your IP or from `0.0.0.0/0` (less secure).  
- **Public IP**: Ensure the instance gets a **public IPv4** address (usually “Auto-assign public IP” or similar) so you can SSH from your machine.

### 5. Storage configuration

- **Storage**: The default **8 GB** root volume is enough for the bot and its venv.  
- You can leave it as-is or increase to 10–20 GB if you want extra space for logs. No separate volumes are required.

### 6. Launch and get the public IP

- Launch the instance. When it’s **Running**, note its **Public IPv4 address** (from the instance list or details).

### 7. SSH and run the bot setup

- **SSH user**: Ubuntu AMIs use **ubuntu**. Connect from your laptop:
  ```bash
  ssh -i /path/to/polypair.pem ubuntu@PUBLIC_IP
  ```
- On the instance, follow **Lightsail Part C** (steps 7–14): update system, install Python/git, clone or SCP the project to `~/prediction_market_games`, create venv, `pip install -r requirements.txt`, test run, create `logs`, then add the systemd service with **User=ubuntu** and **WorkingDirectory=/home/ubuntu/prediction_market_games**.

**Summary (EC2 console)**  
- [ ] **Image**: Ubuntu Server 22.04 LTS (or 20.04).  
- [ ] **Instance type**: t3.micro (or t3.small).  
- [ ] **Key pair**: polypair (or create/download and use `.pem`).  
- [ ] **Network**: SSH (22) from your IP; public IP enabled.  
- [ ] **Storage**: 8 GB default (or a bit more).  
- [ ] Launch → get public IP → `ssh -i polypair.pem ubuntu@PUBLIC_IP` → run Part C from Lightsail.

---

## Prerequisites (Generic VM)

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
git clone <your-repo-url> prediction_market_games
cd prediction_market_games
```

### Option B: Upload via SCP

From your local machine:

```bash
scp -r /path/to/your/project/folder user@your-vm-ip:~/prediction_market_games
```

Then on the server:

```bash
cd ~/prediction_market_games
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
WorkingDirectory=/home/your-username/prediction_market_games
Environment="PATH=/home/your-username/prediction_market_games/venv/bin"
ExecStart=/home/your-username/prediction_market_games/venv/bin/python /home/your-username/prediction_market_games/paper_trading_bot.py
Restart=always
RestartSec=10
StandardOutput=append:/home/your-username/prediction_market_games/logs/bot.log
StandardError=append:/home/your-username/prediction_market_games/logs/bot_error.log

[Install]
WantedBy=multi-user.target
```

**Replace**:
- `your-username` with your actual username
- Adjust paths if different

### Create logs directory

```bash
mkdir -p ~/prediction_market_games/logs
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
tail -f ~/prediction_market_games/logs/bot.log
```

### View error logs

```bash
tail -f ~/prediction_market_games/logs/bot_error.log
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
cd ~/prediction_market_games
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
cat ~/prediction_market_games/data/bot_state.json | python3 -m json.tool
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
cp ~/prediction_market_games/data/bot_state.json ~/prediction_market_games/data/bot_state_backup_$(date +%Y%m%d_%H%M%S).json
```

### Update bot code

```bash
cd ~/prediction_market_games
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
chmod 755 ~/prediction_market_games/data
chmod 644 ~/prediction_market_games/data/*.json
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
tail -100 ~/prediction_market_games/logs/bot.log
```

For issues, review:
- `BOT_DOCUMENTATION.md` for behavior details
- `README.md` for general usage

