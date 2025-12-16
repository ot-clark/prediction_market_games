#!/bin/bash

# Start Next.js server in background
npm run start &

# Wait for server to be ready
sleep 10

# Start the trading bot
node bot/dist/trading-bot.js
