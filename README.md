# Polymarket Real-Time Data Dashboard

A Next.js application that displays real-time Polymarket prediction market data including bids, asks, volume, liquidity, event names, and resolution dates in a tabular format.

## Features

- Real-time Polymarket market data
- Comprehensive table view with:
  - Event names
  - Bids and asks
  - Spread calculations
  - Volume and liquidity
  - Resolution/expiry dates
  - Market status
- Auto-refresh every 30 seconds
- Clean, modern UI with dark mode support

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure MCP Server

The application uses the Polymarket MCP server to fetch data. You need to:

1. **Set up the MCP server in Cursor** (or your MCP client):
   
   Add this to your Cursor settings (`~/.cursor/mcp.json` or similar):
   
   ```json
   {
     "mcpServers": {
       "polymarket-mcp": {
         "command": "uv",
         "args": [
           "--directory",
           "/Users/{INSERT_USER}/YOUR/PATH/TO/polymarket-mcp",
           "run",
           "polymarket-mcp"
         ],
         "env": {
           "KEY": "<insert polymarket api key>",
           "FUNDER": "<insert polymarket wallet address>"
         }
       }
     }
   }
   ```

2. **Set Environment Variables**:
   
   Create a `.env.local` file in the project root:
   
   ```env
   POLYMARKET_MCP_PATH=/Users/owenclark/polymarket-mcp
   POLYMARKET_API_KEY=your_polymarket_api_key_here
   POLYMARKET_FUNDER=your_polymarket_wallet_address_here
   ```
   
   Or use `KEY` and `FUNDER` to match the MCP server configuration.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

## Project Structure

- `app/api/markets/route.ts` - API route that fetches data from MCP server
- `components/MarketDashboard.tsx` - Main dashboard component
- `components/MarketsTable.tsx` - Table component displaying market data
- `types/polymarket.ts` - TypeScript types for Polymarket data

## API Endpoints

### GET `/api/markets`

Fetches Polymarket market data.

**Query Parameters:**
- `limit` (optional): Maximum number of markets to return (default: 100)
- `active` (optional): Filter for active markets only (default: true)

**Example:**
```
GET /api/markets?limit=50&active=true
```

## Technologies

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Model Context Protocol (MCP) SDK

## Notes

- The application requires the `polymarket-mcp` server to be running and properly configured
- Data refreshes automatically every 30 seconds
- Make sure your Polymarket API key and wallet address are correctly configured
