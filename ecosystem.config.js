/**
 * PM2 Configuration for Paper Trading Bot
 * 
 * Run with: pm2 start ecosystem.config.js
 */

module.exports = {
  apps: [
    {
      name: 'paper-trader',
      script: 'bot/trading-bot.ts',
      interpreter: './node_modules/.bin/ts-node',
      interpreter_args: '--project bot/tsconfig.json',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        API_BASE_URL: 'http://localhost:3000',
      },
      // Log configuration
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: 'logs/paper-trader-error.log',
      out_file: 'logs/paper-trader-out.log',
      merge_logs: true,
      // Cron restart (optional - restart every day at 4am)
      // cron_restart: '0 4 * * *',
    },
    {
      name: 'nextjs-app',
      script: 'npm',
      args: 'run dev',
      watch: false,
      autorestart: true,
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      // For production, use:
      // script: 'npm',
      // args: 'start',
      // env: { NODE_ENV: 'production' }
    },
  ],
};
