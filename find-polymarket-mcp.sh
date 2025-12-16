#!/bin/bash

# Helper script to find polymarket-mcp installation

echo "🔍 Searching for polymarket-mcp directory..."
echo ""

# Search in common locations
SEARCH_PATHS=(
  "$HOME/polymarket-mcp"
  "$HOME/Documents/polymarket-mcp"
  "$HOME/Projects/polymarket-mcp"
  "$HOME/Code/polymarket-mcp"
  "$HOME/Development/polymarket-mcp"
)

# Check common locations first
for path in "${SEARCH_PATHS[@]}"; do
  if [ -d "$path" ]; then
    echo "✅ Found: $path"
    echo "   Full path: $(cd "$path" && pwd)"
    exit 0
  fi
done

# If not found, do a broader search
echo "Searching in your home directory (this may take a moment)..."
FOUND=$(find "$HOME" -type d -name "polymarket-mcp" 2>/dev/null | head -1)

if [ -n "$FOUND" ]; then
  echo "✅ Found: $FOUND"
  echo "   Full path: $(cd "$FOUND" && pwd)"
else
  echo "❌ polymarket-mcp directory not found"
  echo ""
  echo "You may need to:"
  echo "1. Clone the polymarket-mcp repository"
  echo "2. Install it using the method specified in its documentation"
  echo ""
  echo "Once installed, run this script again to find it."
fi
