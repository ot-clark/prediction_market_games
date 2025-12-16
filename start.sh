#!/bin/bash
echo "=== Starting application ==="

# Start Next.js server in background
echo "Starting Next.js on port ${PORT:-3000}..."
npx next start -p ${PORT:-3000} &
NEXTJS_PID=$!

# Wait for server to be ready
echo "Waiting for Next.js to be ready..."
sleep 15

# Check if bot exists
echo "Checking for bot..."
ls -la bot/dist/ 2>/dev/null || echo "bot/dist directory listing failed"

if [ -f "bot/dist/trading-bot.js" ]; then
  echo "Starting trading bot..."
  export API_BASE_URL="http://localhost:${PORT:-3000}"
  node bot/dist/trading-bot.js &
  BOT_PID=$!
  echo "Bot started with PID $BOT_PID"
  
  # Wait for both processes
  wait $NEXTJS_PID $BOT_PID
else
  echo "ERROR: bot/dist/trading-bot.js not found!"
  ls -la bot/
  # Keep container running even if bot fails
  wait $NEXTJS_PID
fi
