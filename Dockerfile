# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm run bot:build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy necessary files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/bot/dist ./bot/dist
COPY --from=builder /app/ecosystem.config.js ./

# Create data directory
RUN mkdir -p /app/data /app/logs

# Expose port
EXPOSE 3000

# Start both Next.js and the trading bot
CMD ["sh", "-c", "npm start & sleep 10 && node bot/dist/trading-bot.js"]
