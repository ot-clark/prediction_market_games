#!/bin/bash

echo "🔍 Verifying Polymarket MCP Setup..."
echo ""

# Check if .env.local exists
if [ -f .env.local ]; then
    echo "✅ .env.local file exists"
    # Check if all required vars are set
    source .env.local
    if [ -n "$POLYMARKET_MCP_PATH" ] && [ -n "$POLYMARKET_API_KEY" ] && [ -n "$POLYMARKET_FUNDER" ]; then
        echo "✅ All environment variables are set"
    else
        echo "❌ Missing environment variables"
    fi
else
    echo "❌ .env.local file not found"
fi

echo ""

# Check if MCP directory exists
if [ -d "$POLYMARKET_MCP_PATH" ] || [ -d "/Users/owenclark/polymarket-mcp" ]; then
    echo "✅ MCP directory exists"
else
    echo "❌ MCP directory not found"
fi

echo ""

# Check if uv is available
export PATH="$HOME/.local/bin:$PATH"
if command -v uv &> /dev/null; then
    echo "✅ uv is installed: $(uv --version)"
else
    echo "❌ uv not found in PATH"
    echo "   Add this to your ~/.zshrc:"
    echo "   export PATH=\"\$HOME/.local/bin:\$PATH\""
fi

echo ""

# Check if polymarket-mcp server file exists
MCP_PATH="${POLYMARKET_MCP_PATH:-/Users/owenclark/polymarket-mcp}"
if [ -f "$MCP_PATH/src/polymarket_mcp/server.py" ]; then
    echo "✅ MCP server file found"
else
    echo "❌ MCP server file not found at $MCP_PATH/src/polymarket_mcp/server.py"
fi

echo ""
echo "📋 Configuration Summary:"
echo "   MCP Path: ${POLYMARKET_MCP_PATH:-/Users/owenclark/polymarket-mcp}"
echo "   API Key: ${POLYMARKET_API_KEY:0:10}... (hidden)"
echo "   Funder: ${POLYMARKET_FUNDER:-not set}"
echo ""
echo "✅ Setup verification complete!"
