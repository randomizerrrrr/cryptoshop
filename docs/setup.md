# Setup Guide

This guide will help you set up CryptoShop for development and production with **real Bitcoin integration** and **enterprise-grade production features**.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Bitcoin Configuration](#bitcoin-configuration)
- [Production Features Setup](#production-features-setup)
- [Security Configuration](#security-configuration)
- [Monitoring Setup](#monitoring-setup)
- [Mobile & PWA Setup](#mobile--pwa-setup)
- [Running the Application](#running-the-application)
- [Verification Steps](#verification-steps)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher
- **Git**: For version control
- **Operating System**: Windows, macOS, or Linux
- **Internet Connection**: Required for Bitcoin blockchain APIs

### Development Tools (Recommended)
- **VS Code**: With recommended extensions
- **Git GUI**: SourceTree, GitKraken, or similar
- **Database Tool**: Prisma Studio, DBeaver, or similar
- **API Testing**: Postman or Insomnia
- **Bitcoin Wallet**: For testing real transactions (optional)

## Installation

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/your-username/cryptoshop.git

# Navigate to the project directory
cd cryptoshop
```

### 2. Install Dependencies

```bash
# Install all npm dependencies
npm install
```

This will install:
- Next.js and React
- TypeScript and type definitions
- Tailwind CSS and shadcn/ui
- Prisma and database client
- **Bitcoin libraries**: bitcoinjs-lib, bip39, tiny-secp256k1
- **Real-time communication**: Socket.IO
- All other required packages

### 3. Verify Installation

```bash
# Check Node.js version
node --version  # Should be 18.0 or higher

# Check npm version
npm --version   # Should be 8.0 or higher

# Test if packages installed correctly
npm run lint    # Should run without errors

# Verify Bitcoin libraries are installed
npm list bitcoinjs-lib bip39 tiny-secp256k1 socket.io
```

## Environment Configuration

### 1. Create Environment File

```bash
# Copy the example environment file
cp .env.example .env
```

### 2. Configure Environment Variables

Edit the `.env` file with your configuration:

```env
# =================================================================
# Application Configuration
# =================================================================

# Next.js Configuration
NEXTAUTH_SECRET="your-super-secret-nextauth-key-here"
NEXTAUTH_URL="http://localhost:3000"

# =================================================================
# Database Configuration
# =================================================================

# Database URL (SQLite for development, PostgreSQL for production)
DATABASE_URL="file:./dev.db"

# =================================================================
# Bitcoin Configuration (REAL BITCOIN INTEGRATION)
# =================================================================

# Bitcoin Network Configuration
BITCOIN_NETWORK="mainnet"        # Options: "mainnet", "testnet", "regtest"
BITCOIN_NETWORK_EXPLORER="https://blockchain.info"  # Blockchain explorer API

# Bitcoin HD Wallet Configuration
BITCOIN_WALLET_MNEMONIC=""        # Leave empty for auto-generation in development
BITCOIN_WALLET_DERIVATION="m/44'/0'/0'/0"  # BIP44 derivation path

# Blockchain API Configuration
BLOCKCHAIN_API_URL="https://blockchain.info"
BLOCKCHAIN_API_TIMEOUT="30000"    # 30 seconds timeout

# =================================================================
# Real-time Configuration
# =================================================================

# Socket.IO Configuration
SOCKET_IO_CORS_ORIGIN="http://localhost:3000"
SOCKET_IO_PATH="/api/socketio"

# Blockchain Monitor Configuration
BLOCKCHAIN_MONITOR_INTERVAL="30000"  # Check every 30 seconds
BLOCKCHAIN_CONFIRMATIONS_REQUIRED="3"   # Require 3 confirmations

# =================================================================
# Optional Configuration
# =================================================================

# Application Name
NEXT_PUBLIC_APP_NAME="CryptoShop"

# Support Email
NEXT_PUBLIC_SUPPORT_EMAIL="support@cryptoshop.com"

# Price Feed Configuration
COINGECKO_API_URL="https://api.coingecko.com/api/v3"
BINANCE_API_URL="https://api.binance.com/api/v3"

# =================================================================
# Development Configuration
# =================================================================

# Enable development features
NEXT_PUBLIC_DEV_MODE="true"

# Debug mode
NODE_ENV="development"

# Enable verbose logging
DEBUG="cryptoshop:*"
```

### 3. Generate Required Secrets

```bash
# Generate NextAuth secret
node -e "console.log(crypto.randomBytes(32).toString('hex'))"

# Generate JWT secret (if needed)
node -e "console.log(crypto.randomBytes(64).toString('hex'))"

# Generate Bitcoin wallet mnemonic (optional - will auto-generate if empty)
node -e "const bip39 = require('bip39'); console.log(bip39.generateMnemonic())"
```

## Database Setup

### 1. Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# (Optional) Run database seed for initial data
npm run db:seed
```

### 2. Verify Database Setup

```bash
# Open Prisma Studio to view database
npx prisma studio

# This should open http://localhost:5555 in your browser
```

### 3. Database Schema Overview

The database includes the following main models:

- **Users**: Anonymous user accounts with access tokens
- **Sellers**: Seller profiles and stores
- **Products**: Marketplace items with specifications
- **Orders**: Customer orders and items
- **Escrow**: Secure transaction management
- **Wallet**: Bitcoin wallet management with real transaction tracking
- **Reviews**: Product and seller ratings
- **Support**: Customer support tickets and messages

### 4. Production Database (Optional)

For production, consider using PostgreSQL:

```env
# Update DATABASE_URL in .env
DATABASE_URL="postgresql://username:password@localhost:5432/cryptoshop"
```

```bash
# Install PostgreSQL driver
npm install pg

# Generate migration
npx prisma migrate dev --name init

# Run migration
npx prisma migrate deploy
```

## Bitcoin Configuration

### Overview

CryptoShop uses **real Bitcoin integration** with the following components:

- **HD Wallet System**: Hierarchical Deterministic wallets using BIP32/BIP39
- **Real Address Generation**: Unique Bitcoin addresses for each transaction
- **Blockchain Monitoring**: Real-time transaction tracking via Blockchain.com API
- **Automatic Confirmations**: 3+ confirmation system with automatic status updates
- **Real-time Notifications**: Socket.IO notifications for payment events

### Development Setup (Ready for Real Bitcoin)

The application comes with **real Bitcoin integration** out of the box. No mock setup required.

### Bitcoin Libraries

The application uses industry-standard Bitcoin libraries:

```bash
# Verify Bitcoin libraries are installed
npm list bitcoinjs-lib bip39 tiny-secp256k1

# Libraries details:
# - bitcoinjs-lib: Bitcoin library for address generation and transaction handling
# - bip39: BIP39 mnemonic implementation for HD wallets
# - tiny-secp256k1: secp256k1 library for cryptographic operations
```

### Bitcoin Network Configuration

#### Mainnet (Real Bitcoin)
```env
# For production with real Bitcoin
BITCOIN_NETWORK="mainnet"
BITCOIN_NETWORK_EXPLORER="https://blockchain.info"
```

#### Testnet (Testing Bitcoin)
```env
# For testing with testnet Bitcoin
BITCOIN_NETWORK="testnet"
BITCOIN_NETWORK_EXPLORER="https://blockchain.info"
```

#### Regtest (Local Testing)
```env
# For local development with regtest
BITCOIN_NETWORK="regtest"
BITCOIN_NETWORK_EXPLORER="http://localhost:3001"
```

### HD Wallet Configuration

The application uses BIP32/BIP39 HD wallets for security:

```typescript
// Example HD wallet derivation path
BITCOIN_WALLET_DERIVATION="m/44'/0'/0'/0"

// This generates:
// m / purpose' / coin_type' / account' / change / address_index
```

### Blockchain API Configuration

The application integrates with Blockchain.com API for real blockchain data:

```env
# Blockchain API Configuration
BLOCKCHAIN_API_URL="https://blockchain.info"
BLOCKCHAIN_API_TIMEOUT="30000"
```

### Real-time Monitoring Configuration

```env
# Blockchain Monitor Configuration
BLOCKCHAIN_MONITOR_INTERVAL="30000"  # Check every 30 seconds
BLOCKCHAIN_CONFIRMATIONS_REQUIRED="3"   # Require 3 confirmations
```

### Testing Bitcoin Integration

#### Test Bitcoin Address Generation
```bash
# Test Bitcoin address generation API
curl -X POST http://localhost:3000/api/bitcoin/address \
  -H "Content-Type: application/json" \
  -d '{"type":"deposit","id":"test_user"}'

# Should return a real Bitcoin address
```

#### Test Blockchain Monitoring
```bash
# Test blockchain monitoring API
curl -X POST http://localhost:3000/api/blockchain/monitor \
  -H "Content-Type: application/json" \
  -d '{"action":"start"}'

# Should return success status
```

#### Test Address Information
```bash
# Test getting address information
curl "http://localhost:3000/api/bitcoin/address?address=1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"

# Should return real blockchain data
```

### Bitcoin Wallet Integration Features

The application supports:

- **HD Wallet**: Hierarchical Deterministic wallets with BIP32/BIP39
- **Real Address Generation**: Unique Bitcoin addresses for each transaction
- **Blockchain Monitoring**: Real-time transaction tracking
- **Automatic Confirmations**: 3+ confirmation system
- **Real-time Notifications**: Instant notifications for payment events
- **QR Code Generation**: Valid Bitcoin QR codes for payments
- **Balance Tracking**: Real balance from blockchain
- **Transaction History**: Complete transaction history from blockchain

## Production Features Setup

### Overview

CryptoShop includes **enterprise-grade production features** that enhance security, monitoring, mobile experience, and analytics. These features are designed for production deployment and can be configured based on your needs.

### 🔒 Security Configuration

#### Rate Limiting Setup
```bash
# Rate limiting is automatically enabled with the following tiers:
# - Authentication endpoints: 5 requests/minute
# - Bitcoin endpoints: 20 requests/minute
# - Upload endpoints: 10 requests/minute
# - General API: 100 requests/minute

# Test rate limiting
curl -I http://localhost:3000/api/auth/login
```

#### CSRF Protection
```typescript
// CSRF protection is automatically enabled for all state-changing operations
// CSRF tokens are generated and validated automatically
```

#### Security Headers
```typescript
// Security headers are automatically configured:
// - Content Security Policy (CSP)
// - HTTP Strict Transport Security (HSTS)
// - XSS Protection
// - X-Content-Type-Options
// - X-Frame-Options
```

### 📊 Monitoring Setup

#### APM Integration (Optional)
```env
# New Relic Integration (Optional)
NEW_RELIC_LICENSE_KEY="your-new-relic-license-key"
NEW_RELIC_APP_NAME="CryptoShop"

# DataDog Integration (Optional)
DATADOG_API_KEY="your-datadog-api-key"
DATADOG_APP_KEY="your-datadog-app-key"
```

#### Health Check System
```bash
# Test basic health check
curl http://localhost:3000/api/health

# Test detailed health check
curl http://localhost:3000/api/health/detailed

# Expected response:
# {
#   "status": "healthy",
#   "timestamp": 1640995200000,
#   "uptime": 3600,
#   "memory": { "used": 134217728, "total": 17179869184 },
#   "checks": [
#     { "name": "database", "status": "healthy" },
#     { "name": "redis", "status": "healthy" },
#     { "name": "bitcoin_api", "status": "healthy" }
#   ]
# }
```

#### Business Intelligence Analytics
```bash
# Access analytics dashboard (when deployed)
# Navigate to /admin/analytics in your browser

# Test analytics API
curl http://localhost:3000/api/analytics/revenue?period=month
```

### 📱 Mobile & PWA Setup

#### PWA Configuration
```json
// public/manifest.json (automatically configured)
{
  "name": "CryptoShop",
  "short_name": "CryptoShop",
  "description": "Anonymous Bitcoin Marketplace",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

#### Service Worker Setup
```javascript
// public/sw.js (automatically generated)
// Service worker handles:
// - Offline caching
// - Background sync
// - Push notifications
// - Network-first strategy
```

#### Mobile Testing
```bash
# Test PWA features
1. Open http://localhost:3000 in Chrome
2. Open DevTools > Application > Manifest
3. Verify PWA features are working
4. Test offline functionality by disconnecting network

# Test mobile responsiveness
1. Use Chrome DevTools device emulation
2. Test on various screen sizes
3. Verify touch interactions work
4. Test gesture-based navigation
```

### 🚀 Performance Optimization

#### Code Splitting & Lazy Loading
```typescript
// Automatic code splitting is enabled
// Components are automatically lazy-loaded
// Images are optimized with Next.js Image component
```

#### Caching Strategy
```typescript
// Multi-layer caching is automatically configured:
// - Browser cache (static assets)
// - CDN cache (when deployed)
// - Database cache (frequent queries)
// - Redis cache (session data)
```

#### Asset Optimization
```bash
# Build optimized assets
npm run build

# Check bundle sizes
npm run analyze

# Expected output:
// - Main bundle: < 500KB
// - Vendor bundle: < 1MB
// - Total initial load: < 2MB
```

## Running the Application

### Development Mode

```bash
# Start development server with real Bitcoin integration
npm run dev
```

The application will be available at:
- **Main Application**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/docs (if enabled)
- **Prisma Studio**: http://localhost:5555 (for database)
- **Socket.IO Server**: ws://localhost:3000/api/socketio

### Production Mode

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Docker Setup (Optional)

```bash
# Build Docker image
docker build -t cryptoshop .

# Run container with Bitcoin integration
docker run -p 3000:3000 \
  -e DATABASE_URL="file:./dev.db" \
  -e NEXTAUTH_SECRET="your-secret" \
  -e BITCOIN_NETWORK="mainnet" \
  -e BLOCKCHAIN_API_URL="https://blockchain.info" \
  cryptoshop
```

### Docker Compose (Recommended for Production)

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/cryptoshop
      - NEXTAUTH_SECRET=your-secret
      - BITCOIN_NETWORK=mainnet
      - BLOCKCHAIN_API_URL=https://blockchain.info
      - BLOCKCHAIN_MONITOR_INTERVAL=30000
      - BLOCKCHAIN_CONFIRMATIONS_REQUIRED=3
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=cryptoshop
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

```bash
# Start with Docker Compose
docker-compose up -d
```

## Production Deployment

### Overview

CryptoShop is **production-ready** with enterprise-grade features. This section covers the essential steps for deploying to production.

### Pre-Deployment Checklist

Before deploying to production, complete this checklist:

```bash
# 1. Build and test the application
npm run build
npm run lint

# 2. Verify all environment variables are set
cat .env.production

# 3. Test database migrations
npx prisma migrate deploy

# 4. Test Bitcoin integration in production mode
npm run test:bitcoin:integration

# 5. Verify health checks
curl http://localhost:3000/api/health
curl http://localhost:3000/api/health/detailed
```

### Production Environment Variables

```env
# =================================================================
# Production Configuration
# =================================================================

# Application
NODE_ENV=production
NEXTAUTH_SECRET=your-super-secret-production-key-here
NEXTAUTH_URL=https://your-domain.com

# Database (Production PostgreSQL recommended)
DATABASE_URL=postgresql://user:password@localhost:5432/cryptoshop_production

# Bitcoin Production Configuration
BITCOIN_NETWORK=mainnet
BITCOIN_WALLET_MNEMONIC=your-production-wallet-mnemonic-phrase
BITCOIN_WALLET_DERIVATION=m/44'/0'/0'/0
BLOCKCHAIN_API_URL=https://blockchain.info
BLOCKCHAIN_MONITOR_INTERVAL=30000
BLOCKCHAIN_CONFIRMATIONS_REQUIRED=3

# Security (Production)
CSRF_SECRET=your-csrf-secret-key
RATE_LIMIT_AUTH=5
RATE_LIMIT_BITCOIN=20
RATE_LIMIT_UPLOAD=10
RATE_LIMIT_API=100

# Monitoring (Optional - Production Recommended)
NEW_RELIC_LICENSE_KEY=your-new-relic-license-key
DATADOG_API_KEY=your-datadog-api-key
SENTRY_DSN=your-sentry-dsn

# Email (Production)
EMAIL_FROM=noreply@your-domain.com
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASSWORD=your-smtp-password
```

### Production Deployment Options

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Configure environment variables in Vercel dashboard
# Add all production environment variables
```

#### Docker Production
```bash
# Build production Docker image
docker build -t cryptoshop:latest .

# Run with production environment
docker run -d \
  --name cryptoshop-production \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL="postgresql://user:pass@db:5432/cryptoshop" \
  -e NEXTAUTH_SECRET="your-secret" \
  -e BITCOIN_NETWORK=mainnet \
  -v $(pwd)/data:/app/data \
  cryptoshop:latest
```

#### Traditional Server
```bash
# Build application
npm run build

# Start production server
npm start

# Or use PM2 for process management
npm install -g pm2
pm2 start ecosystem.config.js
```

### Post-Deployment Verification

After deployment, verify all production features:

```bash
# Test health endpoints
curl https://your-domain.com/api/health
curl https://your-domain.com/api/health/detailed

# Test Bitcoin integration
curl -X POST https://your-domain.com/api/bitcoin/address \
  -H "Content-Type: application/json" \
  -d '{"type":"deposit","id":"test_user"}'

# Test rate limiting
for i in {1..6}; do
  curl -X POST https://your-domain.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"test"}'
done

# Test PWA features
# 1. Open https://your-domain.com in Chrome
# 2. Check DevTools > Application > Manifest
# 3. Verify installable as PWA
# 4. Test offline functionality

# Test mobile responsiveness
# Use browser dev tools to test various screen sizes
```

### Production Monitoring Setup

```bash
# Set up monitoring dashboards
1. Configure New Relic/DataDog if using
2. Set up alerting for critical metrics
3. Configure log aggregation
4. Set up uptime monitoring

# Monitor key metrics:
# - Response times (< 500ms average)
# - Error rates (< 1%)
# - Uptime (> 99.9%)
# - Bitcoin API latency (< 5s)
# - Database performance (< 100ms query time)
```

### Production Security Checklist

- [ ] SSL/HTTPS properly configured
- [ ] Security headers implemented
- [ ] Rate limiting active and tested
- [ ] CSRF protection enabled
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] Bitcoin wallet keys secured
- [ ] Backup system configured
- [ ] Monitoring and alerting active
- [ ] Access controls implemented

## Verification Steps

### 1. Check Application Status

```bash
# Test if application is running
curl http://localhost:3000

# Should return HTML content
```

### 2. Test Database Connection

```bash
# Check if database file exists
ls -la dev.db

# Test Prisma commands
npx prisma db pull
```

### 3. Test Bitcoin Integration

```bash
# Test Bitcoin address generation
curl -X POST http://localhost:3000/api/bitcoin/address \
  -H "Content-Type: application/json" \
  -d '{"type":"deposit","id":"test_user"}'

# Expected response:
# {
#   "success": true,
#   "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
#   "privateKey": "...",
#   "publicKey": "...",
#   "derivationPath": "m/44'/0'/0'/0/0"
# }

# Test blockchain monitoring
curl -X POST http://localhost:3000/api/blockchain/monitor \
  -H "Content-Type: application/json" \
  -d '{"action":"start"}'

# Expected response:
# {
#   "success": true,
#   "message": "Blockchain monitor started"
# }
```

### 4. Test API Endpoints

```bash
# Test health check
curl http://localhost:3000/api/health

# Test products API
curl http://localhost:3000/api/products

# Test sellers API
curl http://localhost:3000/api/sellers

# Test wallet API (should show real Bitcoin integration)
curl http://localhost:3000/api/wallet
```

### 5. Test Real-time Features

```bash
# Test Socket.IO connection
curl -I http://localhost:3000/api/socketio

# Should return:
# HTTP/1.1 101 Switching Protocols
```

### 6. Browser Testing

1. **Open** http://localhost:3000 in your browser
2. **Verify** all pages load correctly
3. **Test** Bitcoin wallet page (should show real blockchain data)
4. **Test** checkout process (should generate real Bitcoin addresses)
5. **Check** real-time notifications (try making a test payment)
6. **Verify** QR codes are valid Bitcoin addresses
7. **Test** responsive design on different screen sizes

### 7. Bitcoin Integration Testing

#### Test Address Generation
1. Navigate to **Wallet** page
2. Click **Deposit** tab
3. Verify a real Bitcoin address is generated
4. Scan the QR code with a Bitcoin wallet app
5. Confirm the address matches

#### Test Transaction Monitoring
1. Send a small test amount to the generated address
2. Monitor the wallet page for balance updates
3. Check for real-time notifications
4. Verify transaction history updates

#### Test Real-time Notifications
1. Open browser developer tools
2. Go to Network tab and filter for WebSocket
3. Make a test payment to a generated address
4. Observe real-time notifications
5. Check console for notification events

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

#### 2. Database Connection Issues

```bash
# Reset database
npm run db:reset

# Regenerate Prisma client
npm run db:generate

# Check database file permissions
ls -la dev.db
chmod 644 dev.db
```

#### 3. Missing Dependencies

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Specifically install Bitcoin libraries
npm install bitcoinjs-lib bip39 tiny-secp256k1 socket.io
```

#### 4. Bitcoin Integration Issues

##### Blockchain API Connection Problems
```bash
# Check internet connectivity
curl https://blockchain.info/q/addressbalance/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa

# Verify Bitcoin wallet functionality
curl http://localhost:3000/api/bitcoin/address -X POST -H "Content-Type: application/json" -d '{"type":"deposit","id":"test"}'
```

##### Address Generation Failures
```bash
# Check Bitcoin libraries are installed
npm list bitcoinjs-lib bip39 tiny-secp256k1

# Reinstall if missing
npm install bitcoinjs-lib bip39 tiny-secp256k1

# Test library functionality
node -e "
const bitcoin = require('bitcoinjs-lib');
const bip39 = require('bip39');
console.log('Bitcoin libraries working correctly');
console.log('Generated mnemonic:', bip39.generateMnemonic());
"
```

##### Real-time Notifications Not Working
```bash
# Check Socket.IO server status
curl -I http://localhost:3000/api/socketio

# Verify blockchain monitor is running
curl http://localhost:3000/api/blockchain/monitor

# Check server logs for WebSocket errors
tail -f dev.log | grep -i socket
```

#### 5. TypeScript Errors

```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

#### 6. Environment Variables Not Loading

```bash
# Verify .env file exists
ls -la .env

# Check syntax
cat .env

# Restart application
npm run dev

# Test environment variables
node -e "console.log('Network:', process.env.BITCOIN_NETWORK)"
```

### Debug Mode

Enable debug logging:

```bash
# Enable debug mode
DEBUG=cryptoshop:* npm run dev

# Or set in .env
DEBUG=cryptoshop:*
```

### Log Files

Check application logs:

```bash
# Development logs
tail -f dev.log

# Production logs
tail -f server.log

# System logs
journalctl -u your-service-name

# Bitcoin-specific logs
tail -f dev.log | grep -i bitcoin
tail -f dev.log | grep -i blockchain
```

### Performance Issues

```bash
# Check Node.js memory usage
node --inspect your-app.js

# Profile with Chrome DevTools
# Open chrome://inspect in Chrome

# Monitor blockchain API calls
curl -w "@\nTime: %{time_total}s\nSize: %{size_download} bytes\n" \
  -o /dev/null -s https://blockchain.info/q/addressbalance/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
```

### ChunkLoadError: Loading chunk app/page failed

This is a common Next.js error that occurs when the application cannot load specific JavaScript chunks. Here's how to resolve it:

#### 1. Clear Next.js Cache
```bash
# Remove Next.js build artifacts
rm -rf .next

# Rebuild the application
npm run build

# Restart development server
npm run dev
```

#### 2. Increase Memory Allocation
Chunk loading errors often occur due to insufficient memory:

```bash
# Check current memory usage
free -h

# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dev

# Or permanently update package.json
# "dev": "NODE_OPTIONS=\"--max-old-space-size=4096\" next dev"
```

#### 3. Disable Code Splitting (Development Only)
Create or update `next.config.ts`:

```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['shadcn/ui']
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Simplify chunk splitting for development
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: 'framework',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
            priority: 40,
            enforce: true,
          },
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
            priority: 20,
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;
```

#### 4. Bitcoin-Specific Issues

##### Blockchain API Rate Limiting
```bash
# Check if you're being rate limited
curl -I https://blockchain.info/q/addressbalance/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa

# If rate limited, increase request interval
# Update BLOCKCHAIN_MONITOR_INTERVAL in .env
BLOCKCHAIN_MONITOR_INTERVAL="60000"  # Check every 60 seconds
```

##### Network Configuration Issues
```bash
# Test direct access to blockchain APIs
curl https://blockchain.info/q/addressbalance/1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa

# Check if proxy is interfering
# Temporarily disable proxy settings
unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy
npm run dev
```

##### HD Wallet Issues
```bash
# Test HD wallet generation
node -e "
const bip39 = require('bip39');
const BIP32 = require('bip32');
const tinysecp = require('tiny-secp256k1');
const bip32 = BIP32.BIP32Factory(tinysecp);

const mnemonic = bip39.generateMnemonic();
const seed = bip39.mnemonicToSeedSync(mnemonic);
const root = bip32.fromSeed(seed);

console.log('Mnemonic:', mnemonic);
console.log('Master Key:', root.toBase58());
console.log('HD Wallet working correctly');
"
```

### Prevention Strategies

To prevent issues in the future:

1. **Regular maintenance**: Clear cache regularly
2. **Monitor resources**: Keep an eye on memory usage
3. **Update dependencies**: Keep packages up to date
4. **Use proper build tools**: Ensure correct Node.js version
5. **Implement error boundaries**: Add error handling in components
6. **Monitor blockchain APIs**: Check API status and rate limits
7. **Test Bitcoin integration**: Regularly test with small amounts
8. **Backup wallet mnemonics**: Store mnemonics securely

## Next Steps

After successful setup:

1. **Explore the Application**: Browse through all pages
2. **Test Bitcoin Features**: Try wallet, deposits, and real transactions
3. **Test Real-time Notifications**: Monitor payment confirmations
4. **Customize**: Modify branding and features
5. **Deploy**: Prepare for production deployment
6. **Contribute**: Report issues or submit pull requests

### Testing Bitcoin Integration

1. **Generate a deposit address** in the wallet
2. **Send a small test amount** (0.0001 BTC) to the address
3. **Monitor real-time updates** in the wallet
4. **Verify transaction confirmations** (3+ confirmations)
5. **Test notification system** for payment events
6. **Check QR code functionality** with mobile wallet apps

### Production Considerations

1. **Security**: Use mainnet for production, secure wallet mnemonics
2. **Monitoring**: Set up monitoring for blockchain API status
3. **Backups**: Regular backups of wallet mnemonics and database
4. **Rate Limiting**: Monitor and adjust blockchain API request rates
5. **Performance**: Optimize blockchain monitoring intervals

For more information, see the [Architecture Guide](./architecture.md) and [Deployment Guide](./deployment.md).

If you encounter Bitcoin integration issues or other problems, refer to the troubleshooting section above or check the [comprehensive troubleshooting guide](../troubleshooting.md).