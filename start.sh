#!/bin/bash
echo "=== Starting application ==="

# Start Next.js server in background
echo "Starting Next.js..."
npm run start &
NEXTJS_PID=$!

# Wait for server to be ready
echo "Waiting for Next.js to be ready..."
sleep 15

# Check if bot exists
echo "Checking for bot..."
if [ -f "bot/dist/trading-bot.js" ]; then
  echo "Starting trading bot..."
  node bot/dist/trading-bot.js
else
  echo "ERROR: bot/dist/trading-bot.js not found!"
  ls -la bot/
  ls -la bot/dist/ 2>/dev/null || echo "bot/dist directory does not exist"
  # Keep container running even if bot fails
  wait $NEXTJS_PID
fi
