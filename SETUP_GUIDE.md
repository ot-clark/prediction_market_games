# Setup Guide: Finding Your Polymarket MCP Configuration

This guide will help you find the three required values for the Polymarket MCP server configuration.

## 1. Finding the Path to `polymarket-mcp`

The path is the location where you cloned or installed the `polymarket-mcp` server on your computer.

### Option A: If you already have it installed

Run this command in your terminal to find it:

```bash
# Search for the polymarket-mcp directory
find ~ -type d -name "polymarket-mcp" 2>/dev/null

# Or search in common locations
ls -la ~/polymarket-mcp
ls -la ~/Documents/polymarket-mcp
ls -la ~/Projects/polymarket-mcp
```

### Option B: If you need to install it

1. **Clone the repository** (if it's on GitHub):
   ```bash
   git clone <polymarket-mcp-repo-url> ~/polymarket-mcp
   cd ~/polymarket-mcp
   ```

2. **Or install it** using the method specified in the polymarket-mcp documentation

3. **Get the full path**:
   ```bash
   cd ~/polymarket-mcp
   pwd
   # This will output something like: /Users/owenclark/polymarket-mcp
   ```

### Common Path Examples:
- `/Users/owenclark/polymarket-mcp`
- `/Users/owenclark/Documents/polymarket-mcp`
- `/Users/owenclark/Projects/polymarket-mcp`
- `~/polymarket-mcp` (which expands to `/Users/owenclark/polymarket-mcp`)

---

## 2. Finding Your Polymarket API Key

### Step 1: Sign in to Polymarket
1. Go to [polymarket.com](https://polymarket.com)
2. Sign in to your account

### Step 2: Access Builder Profile
1. Click on your **profile image** in the top right corner
2. Select **"Builders"** from the dropdown menu
3. This will take you to your builder profile settings

### Step 3: Create or View API Keys
1. In the **"Builder Keys"** section, you'll see existing API keys
2. Click **"+ Create New"** to generate a new API key
3. You'll receive:
   - `apiKey`: Your builder API key identifier (this is what you need)
   - `secret`: Secret key for signing requests
   - `passphrase`: Additional authentication passphrase

### Important Notes:
- **Store these securely** - never commit them to git
- The API key is what you'll use for the `KEY` environment variable
- You can create multiple keys for different environments

### Documentation:
- Full guide: [Polymarket Builder Profile Documentation](https://docs.polymarket.com/developers/builders/builder-profile)

---

## 3. Finding Your Polymarket Wallet Address (FUNDER)

The funder address is your Polymarket wallet address that will be used for transactions.

### Option A: From Polymarket Website
1. Sign in to [polymarket.com](https://polymarket.com)
2. Go to your **profile/wallet** section
3. Your wallet address should be displayed there
4. It will look like: `0x1234567890abcdef1234567890abcdef12345678`

### Option B: From Your Wallet Extension
If you're using MetaMask, WalletConnect, or another wallet:
1. Open your wallet extension
2. Copy your wallet address
3. Make sure this is the address you use on Polymarket

### Option C: Check Your Account Settings
1. In Polymarket, go to **Settings** or **Account**
2. Look for **"Wallet Address"** or **"Connected Wallet"**
3. Copy the address shown

### Format:
- Ethereum address format: `0x` followed by 40 hexadecimal characters
- Example: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb`

---

## 4. Setting Up Environment Variables

Once you have all three values, create a `.env.local` file in your project root:

```bash
cd /Users/owenclark/prediction_market_arb
touch .env.local
```

Then add your values:

```env
# Path to polymarket-mcp directory (use the full path from step 1)
POLYMARKET_MCP_PATH=/Users/owenclark/polymarket-mcp

# Your Polymarket API key (from step 2)
POLYMARKET_API_KEY=your_api_key_here

# Your Polymarket wallet address (from step 3)
POLYMARKET_FUNDER=0xYourWalletAddressHere
```

---

## 5. Verifying Your Setup

### Test the Path:
```bash
# Replace with your actual path
ls -la /Users/owenclark/polymarket-mcp

# Should show the polymarket-mcp directory contents
```

### Test the MCP Server:
```bash
cd /Users/owenclark/polymarket-mcp
uv run polymarket-mcp
```

If this runs without errors, your path is correct!

---

## Troubleshooting

### "Path not found"
- Make sure you're using the **full absolute path** (starting with `/Users/...`)
- Verify the directory exists: `ls -la /path/to/polymarket-mcp`

### "API key invalid"
- Double-check you copied the entire API key
- Make sure there are no extra spaces
- Verify the key is active in your Polymarket builder profile

### "Funder address invalid"
- Ensure it's a valid Ethereum address (starts with `0x`, 42 characters total)
- Make sure it's the address associated with your Polymarket account

---

## Quick Reference

| Value | Where to Find |
|-------|---------------|
| **Path** | Run `find ~ -name "polymarket-mcp"` or check where you cloned it |
| **API Key** | Polymarket.com → Profile → Builders → Builder Keys → Create New |
| **Wallet Address** | Polymarket.com → Profile/Wallet or your connected wallet extension |

---

## Need Help?

- Polymarket API Docs: https://docs.polymarket.com
- Check the polymarket-mcp repository for specific setup instructions
- Verify your MCP server is working: `cd /path/to/polymarket-mcp && uv run polymarket-mcp`
