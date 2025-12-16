# Step-by-Step: Installing polymarket-mcp

## Step 1: Open Terminal

Open your terminal application (Terminal.app on Mac).

---

## Step 2: Navigate to Your Home Directory

```bash
cd ~
```

This takes you to `/Users/owenclark`

---

## Step 3: Check if You Have Required Tools

### Check for `git`:
```bash
git --version
```
If you see a version number, you're good! If not, install Git first.

### Check for `uv` (Python package manager):
```bash
uv --version
```

If you don't have `uv`, install it:
```bash
# On Mac with Homebrew:
brew install uv

# Or using the official installer:
curl -LsSf https://astral.sh/uv/install.sh | sh
```

---

## Step 4: Clone the Repository

Based on your configuration (which uses `uv`), you'll want the repository that supports `uv`. Let's try the most common one:

```bash
# Clone the repository
git clone https://github.com/berlinbra/polymarket-mcp.git ~/polymarket-mcp
```

**Alternative repositories to try if the above doesn't work:**
```bash
# Option 2:
git clone https://github.com/polysolmcp/polysolmcp.git ~/polymarket-mcp

# Option 3:
git clone https://github.com/CarlosIbCu/polymarket-mcp.git ~/polymarket-mcp
```

---

## Step 5: Navigate to the Directory

```bash
cd ~/polymarket-mcp
```

---

## Step 6: Check the Repository Structure

```bash
ls -la
```

You should see files like:
- `README.md` or `readme.md`
- `pyproject.toml` or `requirements.txt`
- `src/` directory or `polymarket_mcp/` directory

---

## Step 7: Install Dependencies

### If the repository uses `uv` (most likely based on your config):

```bash
# Install the package in editable mode
uv pip install -e .

# OR if there's a pyproject.toml:
uv sync
```

### If the repository uses `pip`:

```bash
pip install -r requirements.txt

# OR if there's a setup.py:
pip install -e .
```

---

## Step 8: Verify Installation

Try running the server to see if it works:

```bash
# For uv-based installation:
uv run polymarket-mcp

# OR:
uv run src/polymarket_mcp/server.py

# OR:
python -m polymarket_mcp.server
```

**Note:** It might fail because you haven't set the API key yet, but you should see an error message about missing credentials (not "command not found"), which means it's installed correctly.

Press `Ctrl+C` to stop it.

---

## Step 9: Check the README

Read the repository's README for specific instructions:

```bash
cat README.md
# OR
cat readme.md
```

This will tell you:
- Exact command to run
- Required environment variables
- Any additional setup steps

---

## Step 10: Verify the Path

Confirm the full path:

```bash
pwd
```

This should output: `/Users/owenclark/polymarket-mcp`

---

## Troubleshooting

### "Command not found: git"
Install Git: https://git-scm.com/download/mac

### "Command not found: uv"
Install uv:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
# Then restart your terminal or run:
source ~/.bashrc  # or ~/.zshrc
```

### "Repository not found" or "404"
The repository might have moved or been renamed. Try:
1. Search GitHub for "polymarket mcp"
2. Check the repository's README for the correct clone URL
3. Contact the repository maintainers

### "Permission denied"
Make sure you have write permissions:
```bash
ls -la ~
```

### "Directory already exists"
If `~/polymarket-mcp` already exists:
```bash
# Remove it first (be careful!)
rm -rf ~/polymarket-mcp
# Then clone again
```

---

## Next Steps

Once installed, update your `.env.local` file in the prediction_market_arb project with:
- `POLYMARKET_MCP_PATH=/Users/owenclark/polymarket-mcp` (should already be set)
- Your API key
- Your funder address

Then test the connection!
