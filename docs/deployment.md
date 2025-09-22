# Deployment Guide

This guide covers different deployment strategies for CryptoShop, from development to production environments with **enterprise-grade production features**.

## Table of Contents

- [Deployment Options](#deployment-options)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Production Readiness Checklist](#production-readiness-checklist)
- [Vercel Deployment](#vercel-deployment)
- [Docker Deployment](#docker-deployment)
- [AWS Deployment](#aws-deployment)
- [DigitalOcean Deployment](#digitalocean-deployment)
- [Self-Hosted Deployment](#self-hosted-deployment)
- [Database Setup](#database-setup)
- [SSL/HTTPS Configuration](#ssl-https-configuration)
- [Monitoring and Logging](#monitoring-and-logging)
- [Backup and Recovery](#backup-and-recovery)
- [Performance Optimization](#performance-optimization)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)

## Deployment Options

CryptoShop can be deployed in several ways depending on your needs:

| Option | Best For | Difficulty | Cost | Scalability |
|--------|-----------|------------|------|-------------|
| **Vercel** | Quick deployment, serverless | Easy | $$ | High |
| **Docker** | Containerized deployment | Medium | $ | Medium |
| **AWS** | Enterprise-scale applications | Hard | $$$ | Very High |
| **DigitalOcean** | Affordable VPS hosting | Medium | $ | Medium |
| **Self-Hosted** | Full control over infrastructure | Hard | $ | Low |

## Prerequisites

Before deploying CryptoShop, ensure you have:

### System Requirements
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher
- **Git**: For version control
- **Database**: PostgreSQL 15+ (production), SQLite (development)

### Domain and SSL
- **Domain Name**: Registered domain for your application
- **SSL Certificate**: For HTTPS (Let's Encrypt recommended)

### External Services
- **Z-AI Web Dev SDK**: For real Bitcoin price and network data via web search
- **Bitcoin Libraries**: bitcoinjs-lib, bip39, bip32 for HD wallet management
- **WebSocket Service**: Socket.IO for real-time transaction notifications
- **Email Service**: For notifications (SendGrid, Mailgun, etc.)
- **Monitoring**: Application monitoring service (optional)

### Environment Variables
Prepare your environment variables for production:

```env
# Application
NODE_ENV=production
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=https://your-domain.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/cryptoshop

# Bitcoin - Real Integration Configuration with Z-AI SDK
BITCOIN_NETWORK=mainnet
BITCOIN_WALLET_SEED=your-hd-wallet-seed-phrase
BITCOIN_MASTER_PRIVATE_KEY=your-encrypted-master-private-key
BITCOIN_DERIVATION_PATH=m/44'/0'/0'/0/0

# Z-AI SDK Configuration
Z_AI_SDK_ENABLED=true
Z_AI_SDK_API_KEY=your-z-ai-api-key

# Bitcoin Transaction Monitoring
BITCOIN_MONITOR_INTERVAL=30000
BITCOIN_REQUIRED_CONFIRMATIONS=3
BITCOIN_ADDRESS_EXPIRY_MINUTES=15

# Bitcoin Security
BITCOIN_PRIVATE_KEY_ENCRYPTION_KEY=your-encryption-key
BITCOIN_COLD_STORAGE_ENABLED=true
BITCOIN_MAX_TRANSACTION_AMOUNT=0.5

# Email (optional)
EMAIL_FROM=noreply@your-domain.com
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASSWORD=your-smtp-password

# Monitoring (optional)
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

## Environment Setup

### 1. Clone and Prepare Repository

```bash
# Clone the repository
git clone https://github.com/your-username/cryptoshop.git
cd cryptoshop

# Install dependencies
npm install

# Create environment file
cp .env.example .env.production
```

### 2. Build the Application

```bash
# Build for production
npm run build

# Run linting
npm run lint

# Run tests (if available)
npm test
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

### 4. Bitcoin Integration Setup

```bash
# Install Bitcoin libraries
npm install bitcoinjs-lib bip39 bip32 tiny-secp256k1

# Generate HD wallet seed (secure environment)
node -e "const bip39 = require('bip39'); console.log(bip39.generateMnemonic());"

# Test Bitcoin integration
npm run test:bitcoin

# Verify blockchain API connectivity
npm run test:blockchain
```

## Production Readiness Checklist

Before deploying to production, ensure all the following enterprise-grade features are properly configured:

### 🔒 Security Configuration
- [ ] **Rate Limiting**: Multi-tier rate limiting configured
  - [ ] Authentication endpoints: 5 requests/minute
  - [ ] Bitcoin endpoints: 20 requests/minute  
  - [ ] Upload endpoints: 10 requests/minute
  - [ ] General API: 100 requests/minute
- [ ] **CSRF Protection**: Token-based CSRF protection enabled
- [ ] **Security Headers**: Complete security header configuration
  - [ ] Content Security Policy (CSP)
  - [ ] HTTP Strict Transport Security (HSTS)
  - [ ] XSS Protection
  - [ ] X-Content-Type-Options
  - [ ] X-Frame-Options
- [ ] **Input Validation**: All user inputs validated and sanitized
- [ ] **DDoS Protection**: IP-based protection enabled
- [ ] **Environment Variables**: All secrets properly configured

### 📊 Monitoring & Analytics
- [ ] **APM Integration**: Application Performance Monitoring configured
  - [ ] New Relic integration (optional)
  - [ ] DataDog integration (optional)
  - [ ] Custom monitoring service enabled
- [ ] **Distributed Tracing**: End-to-end request tracing enabled
- [ ] **Error Tracking**: Comprehensive error capture and analysis
- [ ] **Health Checks**: Multi-level health monitoring
  - [ ] Basic health endpoint (`/api/health`)
  - [ ] Detailed health endpoint (`/api/health/detailed`)
  - [ ] Component-specific health checks
- [ ] **Business Intelligence**: Analytics and reporting system
- [ ] **Real-time Analytics**: Live metrics and dashboards

### 📱 Mobile & PWA Features
- [ ] **PWA Manifest**: Progressive Web App manifest configured
- [ ] **Service Worker**: Offline functionality and caching enabled
- [ ] **Mobile Optimization**: Touch-optimized UI components
- [ ] **Responsive Design**: Mobile-first responsive design
- [ ] **Offline Support**: Offline data synchronization
- [ ] **Push Notifications**: Real-time notification system
- [ ] **Performance Optimization**: Mobile performance optimizations

### 🚀 Performance Optimization
- [ ] **Code Splitting**: Optimized bundle splitting
- [ ] **Lazy Loading**: Images and components lazy-loaded
- [ ] **Caching Strategy**: Multi-layer caching implemented
- [ ] **Database Optimization**: Query optimization and indexing
- [ ] **Asset Optimization**: Images, CSS, and JavaScript optimized
- [ ] **CDN Configuration**: Content Delivery Network setup
- [ ] **Compression**: Gzip/Brotli compression enabled

### 📈 Production Configuration
- [ ] **Environment Variables**: Production environment configured
- [ ] **Database**: Production database setup and optimized
- [ ] **Domain Configuration**: Custom domain and DNS configured
- [ ] **SSL/HTTPS**: SSL certificate installed and HTTPS enforced
- [ ] **Backup System**: Automated backup and recovery system
- [ ] **Logging**: Centralized logging system configured
- [ ] **Alerting**: System alerts and notifications configured

### 🧪 Pre-Deployment Testing
- [ ] **Security Audit**: Comprehensive security testing completed
- [ ] **Performance Testing**: Load testing and performance benchmarks
- [ ] **Integration Testing**: All integrations tested and verified
- [ ] **Bitcoin Integration**: Real Bitcoin transactions tested
- [ ] **Mobile Testing**: Cross-device and cross-browser testing
- [ ] **Accessibility**: WCAG compliance and accessibility testing
- [ ] **User Acceptance Testing**: UAT completed with stakeholder approval

### 📋 Deployment Checklist
- [ ] **Source Code**: Latest stable version tagged and ready
- [ ] **Dependencies**: All dependencies updated and secure
- [ ] **Configuration**: All production configurations verified
- [ ] **Database**: Database migrations run and tested
- [ ] **Backups**: Current backup verified and restoration tested
- [ ] **Monitoring**: All monitoring systems active and tested
- [ ] **Documentation**: Deployment documentation updated and complete
- [ ] **Team**: Team notified and deployment plan communicated

### 🚀 Post-Deployment Verification
- [ ] **Application Health**: All services running and healthy
- [ ] **Performance**: Performance metrics within acceptable ranges
- [ ] **Security**: Security measures active and functioning
- [ ] **User Experience**: All user-facing features working correctly
- [ ] **Bitcoin Integration**: Real Bitcoin payments processing correctly
- [ ] **Mobile Features**: PWA and mobile features functioning
- [ ] **Analytics**: Analytics and reporting systems operational
- [ ] **Alerting**: Alert systems tested and functioning

## Vercel Deployment

Vercel is the recommended deployment method for CryptoShop due to its seamless Next.js integration.

### 1. Install Vercel CLI

```bash
npm i -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy to Vercel

```bash
# Deploy to Vercel
vercel --prod

# Or link to existing project
vercel link
vercel --prod
```

### 4. Configure Environment Variables

```bash
# Set environment variables
vercel env add NEXTAUTH_SECRET
vercel env add DATABASE_URL

# Bitcoin Configuration
vercel env add BITCOIN_NETWORK
vercel env add BITCOIN_WALLET_SEED
vercel env add BITCOIN_MASTER_PRIVATE_KEY
vercel env add BITCOIN_DERIVATION_PATH

# Blockchain APIs
vercel env add BLOCKCHAIN_API_URL
vercel env add BLOCKCHAIN_API_KEY
vercel env add COINGECKO_API_URL
vercel env add BINANCE_API_URL

# Bitcoin Monitoring
vercel env add BITCOIN_MONITOR_INTERVAL
vercel env add BITCOIN_REQUIRED_CONFIRMATIONS
vercel env add BITCOIN_ADDRESS_EXPIRY_MINUTES

# Bitcoin Security
vercel env add BITCOIN_PRIVATE_KEY_ENCRYPTION_KEY
vercel env add BITCOIN_COLD_STORAGE_ENABLED
vercel env add BITCOIN_MAX_TRANSACTION_AMOUNT
```

### 5. Configure Domain

```bash
# Add custom domain
vercel domains add your-domain.com
```

### 6. Vercel Configuration

Create `vercel.json` in the root directory:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install"
}
```

### 7. Database Setup for Vercel

For production database on Vercel:

#### Option 1: Vercel Postgres
```bash
# Create Vercel Postgres database
vercel postgres create

# Get connection string
vercel env ls
```

#### Option 2: External PostgreSQL
```bash
# Set external database URL
vercel env add DATABASE_URL
```

## Docker Deployment

Docker provides a containerized deployment option for consistent environments.

### 1. Create Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/cryptoshop
      - NEXTAUTH_SECRET=your-super-secret-key-here
      - NEXTAUTH_URL=http://localhost:3000
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=cryptoshop
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### 3. Create nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    # HTTP redirect to HTTPS
    server {
        listen 80;
        server_name your-domain.com www.your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name your-domain.com www.your-domain.com;

        # SSL configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # Gzip compression
        gzip on;
        gzip_types
            text/plain
            text/css
            text/js
            text/xml
            text/javascript
            application/javascript
            application/xml+rss
            application/json;

        # Proxy to Next.js app
        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Static files
        location /_next/static/ {
            alias /app/.next/static/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### 4. Build and Run

```bash
# Build and start services
docker-compose up -d --build

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

## AWS Deployment

AWS provides a scalable enterprise-grade deployment option.

### 1. AWS EC2 Deployment

#### Create EC2 Instance
```bash
# Launch EC2 instance with Ubuntu 22.04
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --count 1 \
  --instance-type t3.medium \
  --key-name your-key-pair \
  --security-group-ids sg-1234567890abcdef0 \
  --subnet-id subnet-1234567890abcdef0
```

#### Connect to EC2
```bash
# Connect to EC2 instance
ssh -i your-key-pair.pem ubuntu@your-ec2-public-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install Nginx
sudo apt install nginx
```

#### Deploy Application
```bash
# Clone repository
git clone https://github.com/your-username/cryptoshop.git
cd cryptoshop

# Install dependencies
npm install

# Build application
npm run build

# Setup database
sudo -u postgres createdb cryptoshop
sudo -u postgres psql cryptoshop < schema.sql

# Configure environment
sudo nano .env.production

# Create systemd service
sudo nano /etc/systemd/system/cryptoshop.service
```

#### Create Systemd Service
```ini
[Unit]
Description=CryptoShop
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/cryptoshop
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=DATABASE_URL=postgresql://postgres:password@localhost:5432/cryptoshop
Environment=NEXTAUTH_SECRET=your-super-secret-key-here
Environment=NEXTAUTH_URL=https://your-domain.com

[Install]
WantedBy=multi-user.target
```

#### Start Service
```bash
# Start service
sudo systemctl start cryptoshop
sudo systemctl enable cryptoshop

# Check status
sudo systemctl status cryptoshop
```

### 2. AWS ECS Deployment (Containerized)

#### Create ECR Repository
```bash
# Create ECR repository
aws ecr create-repository --repository-name cryptoshop

# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com

# Build and push image
docker build -t cryptoshop .
docker tag cryptoshop:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/cryptoshop:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/cryptoshop:latest
```

#### Create ECS Task Definition
```json
{
  "family": "cryptoshop",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::123456789012:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "cryptoshop",
      "image": "123456789012.dkr.ecr.us-east-1.amazonaws.com/cryptoshop:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "DATABASE_URL",
          "value": "postgresql://user:pass@rds-endpoint:5432/cryptoshop"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/cryptoshop",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### Create ECS Service
```bash
# Create ECS service
aws ecs create-service \
  --cluster cryptoshop-cluster \
  --service-name cryptoshop-service \
  --task-definition cryptoshop:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-1234567890abcdef0,subnet-0987654321fedcba0],securityGroups=[sg-1234567890abcdef0],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/cryptoshop-target-group/1234567890abcdef0,containerName=cryptoshop,containerPort=3000"
```

## DigitalOcean Deployment

DigitalOcean provides an affordable VPS hosting solution.

### 1. Create Droplet

```bash
# Create Ubuntu 22.04 Droplet
doctl compute droplet create cryptoshop \
  --region nyc3 \
  --size s-2vcpu-2gb \
  --image ubuntu-22-04-x64 \
  --ssh-keys your-ssh-key-fingerprint
```

### 2. Connect and Setup

```bash
# Connect to Droplet
ssh root@your-droplet-ip

# Update system
apt update && apt upgrade -y

# Create user
adduser cryptoshop
usermod -aG sudo cryptoshop

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install Nginx
sudo apt install nginx
```

### 3. Deploy Application

```bash
# Switch to cryptoshop user
sudo -u cryptoshop -i

# Clone repository
git clone https://github.com/your-username/cryptoshop.git
cd cryptoshop

# Install dependencies
npm install

# Build application
npm run build
```

### 4. Database Setup

```bash
# Setup PostgreSQL
sudo -u postgres createdb cryptoshop
sudo -u postgres psql cryptoshop

# In PostgreSQL shell
CREATE USER cryptoshop WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE cryptoshop TO cryptoshop;
\q

# Run migrations
npx prisma migrate deploy
```

### 5. Configure PM2

```bash
# Install PM2
npm install -g pm2

# Create ecosystem.config.js
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'cryptoshop',
    script: 'npm',
    args: 'start',
    cwd: '/home/cryptoshop/cryptoshop',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://cryptoshop:your-password@localhost:5432/cryptoshop',
      NEXTAUTH_SECRET: 'your-super-secret-key-here',
      NEXTAUTH_URL: 'https://your-domain.com'
    }
  }]
};
EOF

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 6. Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/cryptoshop
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/cryptoshop /etc/nginx/sites-enabled/

# Test Nginx
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## Self-Hosted Deployment

For full control over infrastructure.

### 1. Server Requirements

- **CPU**: 2+ cores
- **RAM**: 4GB+ recommended
- **Storage**: 50GB+ SSD
- **OS**: Ubuntu 22.04 LTS or similar
- **Network**: Stable internet connection

### 2. System Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y curl wget git software-properties-common

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Redis (optional)
sudo apt install -y redis-server

# Install Nginx
sudo apt install -y nginx
```

### 3. Firewall Setup

```bash
# Configure UFW
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Or use iptables
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -A INPUT -j DROP
sudo iptables-save > /etc/iptables/rules.v4
```

### 4. Application Deployment

```bash
# Create application user
sudo useradd -m -s /bin/bash cryptoshop
sudo usermod -aG sudo cryptoshop

# Switch to application user
sudo -u cryptoshop -i

# Clone repository
git clone https://github.com/your-username/cryptoshop.git
cd cryptoshop

# Install dependencies
npm install

# Build application
npm run build
```

### 5. Database Configuration

```bash
# Setup PostgreSQL
sudo -u postgres createdb cryptoshop
sudo -u postgres psql cryptoshop

# Create database user
CREATE USER cryptoshop WITH PASSWORD 'secure-password';
GRANT ALL PRIVILEGES ON DATABASE cryptoshop TO cryptoshop;
ALTER USER cryptoshop CREATEDB;
\q

# Configure PostgreSQL access
sudo nano /etc/postgresql/15/main/postgresql.conf
```

```ini
# postgresql.conf
listen_addresses = 'localhost'
port = 5432
max_connections = 100
shared_buffers = 128MB
effective_cache_size = 4GB
```

```bash
# Configure pg_hba.conf
sudo nano /etc/postgresql/15/main/pg_hba.conf
```

```ini
# pg_hba.conf
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             all                                     peer
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

```bash
# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 6. SSL Configuration

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## Database Setup

### PostgreSQL Production Setup

#### 1. Install PostgreSQL

```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

#### 2. Configure PostgreSQL

```bash
# Edit postgresql.conf
sudo nano /etc/postgresql/15/main/postgresql.conf
```

```ini
# Connection settings
listen_addresses = 'localhost'
port = 5432
max_connections = 100

# Memory settings
shared_buffers = 256MB
effective_cache_size = 4GB
work_mem = 16MB
maintenance_work_mem = 64MB

# Security settings
ssl = on
ssl_cert_file = '/etc/ssl/certs/ssl-cert-snakeoil.pem'
ssl_key_file = '/etc/ssl/private/ssl-cert-snakeoil.key'
```

#### 3. Create Database and User

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE cryptoshop;
CREATE USER cryptoshop_user WITH PASSWORD 'secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE cryptoshop TO cryptoshop_user;
ALTER DATABASE cryptoshop OWNER TO cryptoshop_user;

# Create extensions
\c cryptoshop;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

#### 4. Run Migrations

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# View database status
npx prisma db pull
```

### Database Optimization

#### 1. Indexing Strategy

```sql
-- Create indexes for performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_price ON products(price_btc);
CREATE INDEX idx_products_created ON products(created_at);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_escrow_status ON escrow_transactions(status);
```

#### 2. Database Backup Strategy

```bash
# Create backup script
cat > /usr/local/bin/backup-db.sh << 'EOF'
#!/bin/bash

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/cryptoshop"
DB_NAME="cryptoshop"
DB_USER="cryptoshop_user"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
pg_dump -U $DB_USER -h localhost -d $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/backup_$DATE.sql.gz"
EOF

# Make script executable
chmod +x /usr/local/bin/backup-db.sh

# Add to crontab
echo "0 2 * * * /usr/local/bin/backup-db.sh" | crontab -
```

## SSL/HTTPS Configuration

### Let's Encrypt with Certbot

#### 1. Install Certbot

```bash
# Ubuntu/Debian
sudo apt install certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install certbot python3-certbot-nginx
```

#### 2. Obtain SSL Certificate

```bash
# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test certificate renewal
sudo certbot renew --dry-run
```

#### 3. Configure Auto-Renewal

```bash
# Test auto-renewal
sudo certbot renew --dry-run

# Add to crontab
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

### Nginx SSL Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/your-domain.com/chain.pem;

    # SSL security settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Proxy to Next.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# HTTP redirect to HTTPS
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## Monitoring and Logging

### Application Monitoring

#### 1. PM2 Monitoring

```bash
# Install PM2
npm install -g pm2

# Monitor application
pm2 monit

# View logs
pm2 logs cryptoshop

# Restart application
pm2 restart cryptoshop
```

#### 2. Health Check Endpoint

Create `/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check database connection
    await db.$queryRaw`SELECT 1`;
    
    // Check Bitcoin connection (if configured)
    const bitcoinConnected = process.env.BITCOIN_RPC_URL ? true : false;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      bitcoin: bitcoinConnected ? 'connected' : 'not configured',
      uptime: process.uptime()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error.message
    }, { status: 500 });
  }
}
```

### System Monitoring

#### 1. Install Monitoring Tools

```bash
# Install htop for system monitoring
sudo apt install htop

# Install iotop for disk I/O monitoring
sudo apt install iotop

# Install iftop for network monitoring
sudo apt install iftop
```

#### 2. Log Management

```bash
# Configure application logging
mkdir -p /var/log/cryptoshop
chown cryptoshop:cryptoshop /var/log/cryptoshop

# Create log rotation configuration
sudo nano /etc/logrotate.d/cryptoshop
```

```ini
# /etc/logrotate.d/cryptoshop
/var/log/cryptoshop/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 cryptoshop cryptoshop
}
```

### External Monitoring Services

#### 1. Sentry for Error Tracking

```bash
# Install Sentry
npm install @sentry/nextjs

# Configure Sentry
npx sentry-wizard --integration nextjs
```

#### 2. Datadog for Infrastructure Monitoring

```bash
# Install Datadog agent
DD_API_KEY=your-api-key bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_script_agent7.sh)"

# Configure Datadog
sudo nano /etc/datadog-agent/datadog.yaml
```

## Backup and Recovery

### Database Backup Strategy

#### 1. Automated Backups

```bash
# Create backup script
cat > /usr/local/bin/backup-cryptoshop.sh << 'EOF'
#!/bin/bash

# Configuration
DB_NAME="cryptoshop"
DB_USER="cryptoshop_user"
BACKUP_DIR="/var/backups/cryptoshop"
RETENTION_DAYS=7
S3_BUCKET="your-s3-bucket" # Optional for S3 backup

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup filename
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

# Create database backup
pg_dump -U $DB_USER -h localhost -d $DB_NAME > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Upload to S3 (optional)
if command -v aws &> /dev/null; then
    aws s3 cp $BACKUP_FILE.gz s3://$S3_BUCKET/backups/
fi

# Remove old backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# Log backup
echo "Backup completed: $BACKUP_FILE.gz" >> /var/log/cryptoshop/backup.log
EOF

# Make script executable
chmod +x /usr/local/bin/backup-cryptoshop.sh

# Add to crontab
echo "0 2 * * * /usr/local/bin/backup-cryptoshop.sh" | crontab -
```

#### 2. Application Backup

```bash
# Create application backup script
cat > /usr/local/bin/backup-app.sh << 'EOF'
#!/bin/bash

APP_DIR="/home/cryptoshop/cryptoshop"
BACKUP_DIR="/var/backups/cryptoshop"
DATE=$(date +%Y%m%d_%H%M%S)

# Create application backup
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz -C $APP_DIR .

# Keep only last 7 days of backups
find $BACKUP_DIR -name "app_backup_*.tar.gz" -mtime +7 -delete

echo "Application backup completed: $BACKUP_DIR/app_backup_$DATE.tar.gz" >> /var/log/cryptoshop/backup.log
EOF

# Make script executable
chmod +x /usr/local/bin/backup-app.sh
```

### Recovery Procedures

#### 1. Database Recovery

```bash
# Stop application
pm2 stop cryptoshop

# List available backups
ls -la /var/backups/cryptoshop/

# Restore from backup
gunzip -c /var/backups/cryptoshop/backup_20240101_020000.sql.gz | psql -U cryptoshop_user -d cryptoshop

# Run migrations
npx prisma migrate deploy

# Start application
pm2 start cryptoshop
```

#### 2. Application Recovery

```bash
# Stop application
pm2 stop cryptoshop

# Restore application backup
tar -xzf /var/backups/cryptoshop/app_backup_20240101_020000.tar.gz -C /home/cryptoshop/

# Install dependencies
cd /home/cryptoshop/cryptoshop
npm install

# Build application
npm run build

# Start application
pm2 start cryptoshop
```

## Performance Optimization

### Next.js Optimization

#### 1. Build Optimization

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features
  experimental: {
    optimizePackageImports: ['shadcn/ui', 'lucide-react'],
    serverActions: true,
    serverComponentsExternalPackages: []
  },
  
  // Standalone output for containerization
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Compression settings
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  
  // Image optimization
  images: {
    domains: ['your-domain.com', 'cdn.your-domain.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Webpack configuration for chunk optimization
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: {
            name: 'vendors',
            chunks: 'all',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
          },
          framework: {
            name: 'framework',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
            priority: 40,
            enforce: true,
          },
        },
      };
    }
    
    // Development optimizations to prevent ChunkLoadError
    if (dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
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
        },
      };
    }
    
    return config;
  },
};

export default nextConfig;
```

#### 2. Memory and Resource Optimization

```javascript
// package.json scripts with memory allocation
{
  "scripts": {
    "dev": "NODE_OPTIONS=\"--max-old-space-size=4096\" next dev",
    "build": "NODE_OPTIONS=\"--max-old-space-size=4096\" next build",
    "start": "NODE_OPTIONS=\"--max-old-space-size=4096\" next start",
    "analyze": "ANALYZE=true npm run build"
  }
}
```

#### 3. Bundle Analysis

```javascript
// next.config.js - Add bundle analyzer
const bundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  // ... other config
};

module.exports = bundleAnalyzer(nextConfig);
```

### Chunk Loading Optimization

#### 1. Preventing ChunkLoadError in Production

ChunkLoadError is a common issue in production environments. Here are the prevention strategies:

```javascript
// utils/chunk-loader.js
export class ChunkLoader {
  static async loadChunk(chunkName) {
    try {
      const chunk = await import(/* webpackChunkName: "[request]" */ `@/chunks/${chunkName}`);
      return chunk.default;
    } catch (error) {
      console.error(`Failed to load chunk ${chunkName}:`, error);
      
      // Retry logic
      for (let i = 0; i < 3; i++) {
        try {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          const retryChunk = await import(`@/chunks/${chunkName}`);
          return retryChunk.default;
        } catch (retryError) {
          console.warn(`Retry ${i + 1} failed for chunk ${chunkName}`);
        }
      }
      
      throw new Error(`Failed to load chunk ${chunkName} after retries`);
    }
  }
}
```

#### 2. Error Boundary Implementation

```javascript
// components/ErrorBoundary.jsx
'use client';

import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Send error to monitoring service
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="mt-4 text-2xl font-bold text-gray-900">Application Error</h2>
              <p className="mt-2 text-sm text-gray-600">
                {this.state.error?.message || 'Failed to load application components'}
              </p>
              <div className="mt-6">
                <button
                  onClick={this.handleReload}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Reload Application
                </button>
              </div>
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    Error Details
                  </summary>
                  <pre className="mt-2 text-xs text-gray-700 bg-gray-100 p-2 rounded overflow-auto">
                    {this.state.error?.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### 3. Progressive Loading Strategy

```javascript
// components/ProgressiveLoader.jsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';

export function ProgressiveLoader({ 
  children, 
  fallback, 
  errorFallback,
  retryCount = 3 
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);

  useEffect(() => {
    let isMounted = true;
    let timeoutId;

    const loadComponent = async () => {
      try {
        // Simulate loading time
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (isMounted) {
          setIsLoading(false);
          setHasError(false);
        }
      } catch (error) {
        console.error('Loading error:', error);
        
        if (isMounted && retryAttempt < retryCount) {
          // Retry with exponential backoff
          const delay = Math.pow(2, retryAttempt) * 1000;
          timeoutId = setTimeout(() => {
            setRetryAttempt(prev => prev + 1);
            loadComponent();
          }, delay);
        } else if (isMounted) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    loadComponent();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [retryAttempt, retryCount]);

  if (hasError) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load</h3>
          <p className="text-gray-600 mb-4">
            Unable to load component. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <>{fallback}</>;
  }

  return <Suspense fallback={fallback}>{children}</Suspense>;
}

// Usage example
function ProductList() {
  return (
    <ProgressiveLoader
      fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      }
      errorFallback={
        <div className="text-center py-12">
          <p className="text-gray-500">Failed to load products. Please try again.</p>
        </div>
      }
    >
      <ActualProductList />
    </ProgressiveLoader>
  );
}
```

### CDN and Asset Optimization

#### 1. CDN Configuration

```javascript
// next.config.js - CDN setup
const nextConfig = {
  // Asset prefix for CDN
  assetPrefix: process.env.NODE_ENV === 'production' 
    ? 'https://cdn.your-domain.com' 
    : '',
  
  // Image domains for CDN
  images: {
    domains: [
      'cdn.your-domain.com',
      'images.your-domain.com',
      'assets.your-domain.com'
    ],
  },
};
```

#### 2. Static Asset Optimization

```javascript
// public/robots.txt
User-agent: *
Allow: /

# Sitemap
Sitemap: https://your-domain.com/sitemap.xml

# Cache static assets
User-agent: *
Allow: /_next/static/
Allow: /images/
Allow: /favicon.ico

# Block dynamic routes
Disallow: /api/
Disallow: /auth/
Disallow: /cart/
Disallow: /checkout/
Disallow: /wallet/
```

#### 3. Service Worker for Caching

```javascript
// public/sw.js
const CACHE_NAME = 'cryptoshop-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/_next/static/css/app/layout.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

### Database Optimization

#### 1. Connection Pooling

```javascript
// lib/db.js - Production database configuration
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  
  // Connection pool settings for production
  connectionLimit: process.env.DB_CONNECTION_LIMIT || 10,
  pool: {
    min: process.env.DB_POOL_MIN || 2,
    max: process.env.DB_POOL_MAX || 10
  },
  
  // Query optimization
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
      // Connection timeout
      connection_timeout: 20,
      // Socket timeout
      socket_timeout: 20,
    }
  }
});

module.exports = prisma;
```

#### 2. Read Replicas

```javascript
// lib/db-read-replica.js
const { PrismaClient } = require('@prisma/client');

// Read replica for better performance
const readPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_READ_REPLICA_URL || process.env.DATABASE_URL
    }
  }
});

// Write instance
const writePrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

function getDb(readOnly = true) {
  return readOnly ? readPrisma : writePrisma;
}

module.exports = { getDb, readPrisma, writePrisma };
```

### Monitoring and Performance Tracking

#### 1. Performance Monitoring

```javascript
// lib/monitoring.js
export class PerformanceMonitor {
  static metrics = new Map();

  static startTimer(name) {
    const startTime = performance.now();
    return {
      end: () => {
        const duration = performance.now() - startTime;
        this.recordMetric(name, duration);
      }
    };
  }

  static recordMetric(name, duration) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const metrics = this.metrics.get(name);
    metrics.push(duration);
    
    // Keep only last 100 measurements
    if (metrics.length > 100) {
      metrics.shift();
    }
    
    // Send to monitoring service
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'performance_metric', {
        metric_name: name,
        value: Math.round(duration)
      });
    }
  }

  static getAverageMetric(name) {
    const metrics = this.metrics.get(name);
    if (!metrics || metrics.length === 0) return null;
    
    const sum = metrics.reduce((acc, val) => acc + val, 0);
    return sum / metrics.length;
  }
}
```

#### 2. Error Tracking

```javascript
// lib/error-tracking.js
export class ErrorTracker {
  static errors = [];

  static trackError(error, context = {}) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : 'server'
    };

    this.errors.push(errorData);
    
    // Keep only last 1000 errors
    if (this.errors.length > 1000) {
      this.errors = this.errors.slice(-1000);
    }
    
    // Send to error tracking service
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, {
        extra: context
      });
    }
    
    console.error('Tracked error:', errorData);
  }

  static getErrors() {
    return [...this.errors];
  }

  static clearErrors() {
    this.errors = [];
  }
}
```
  
  // Images
  images: {
    domains: ['your-domain.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },
  
  // Bundle analyzer
  bundleAnalyzer: {
    enabled: process.env.ANALYZE === 'true'
  }
};

module.exports = nextConfig;
```

#### 2. Caching Strategy

```javascript
// Cache configuration for API routes
export async function GET(request) {
  const cacheKey = `products:${JSON.stringify(filters)}`;
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    return NextResponse.json(JSON.parse(cached));
  }
  
  const data = await getProductsFromDB(filters);
  
  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(data));
  
  return NextResponse.json(data);
}
```

### Database Optimization

#### 1. Connection Pooling

```javascript
// lib/db.ts
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
    errorFormat: 'pretty',
    connectionPool: {
      min: 2,
      max: 10
    }
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
```

#### 2. Query Optimization

```javascript
// Efficient product listing with includes
const getProducts = async (filters) => {
  return await prisma.product.findMany({
    where: buildWhereClause(filters),
    include: {
      seller: {
        select: {
          id: true,
          storeName: true,
          rating: true,
          user: {
            select: {
              username: true,
              avatar: true
            }
          }
        }
      },
      _count: {
        select: {
          reviews: true,
          orderItems: true
        }
      }
    },
    orderBy: [
      { [filters.sortBy]: filters.sortOrder },
      { createdAt: 'desc' }
    ],
    skip: filters.skip,
    take: filters.limit
  });
};
```

### Server Optimization

#### 1. Nginx Optimization

```nginx
# nginx.conf
worker_processes auto;
worker_rlimit_nofile 65535;

events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
}

http {
    # Basic settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
    
    # Cache static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 2. PM2 Optimization

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'cryptoshop',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/cryptoshop',
      NEXTAUTH_SECRET: 'your-secret-key',
      NEXTAUTH_URL: 'https://your-domain.com'
    }
  }]
};
```

## Security Considerations

### Application Security

#### 1. Environment Variables Security

```bash
# Set proper file permissions
chmod 600 .env.production

# Use environment-specific secrets
echo "export NEXTAUTH_SECRET=$(openssl rand -hex 32)" >> ~/.bashrc
source ~/.bashrc
```

#### 2. Headers Security

```javascript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Remove powered by header
  response.headers.delete('x-powered-by');
  
  return response;
}
```

#### 3. Rate Limiting

```javascript
// lib/rate-limit.ts
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
```

### Server Security

#### 1. Firewall Configuration

```bash
# UFW configuration
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Fail2Ban for SSH protection
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

#### 2. SSH Security

```bash
# Configure SSH
sudo nano /etc/ssh/sshd_config
```

```ini
# sshd_config
Port 22
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
ChallengeResponseAuthentication no
UsePAM no
X11Forwarding no
PrintMotd no
AcceptEnv LANG LC_*
Subsystem sftp /usr/lib/openssh/sftp-server
```

```bash
# Restart SSH
sudo systemctl restart sshd
```

#### 3. System Updates

```bash
# Enable automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# Create update script
cat > /usr/local/bin/system-update.sh << 'EOF'
#!/bin/bash
apt update
apt upgrade -y
apt autoremove -y
apt autoclean
EOF

chmod +x /usr/local/bin/system-update.sh

# Add to crontab
echo "0 3 * * 0 /usr/local/bin/system-update.sh" | crontab -
```

#### 4. Bitcoin Security

```bash
# Secure Bitcoin private keys
chmod 600 /path/to/bitcoin/keys
chown appuser:appuser /path/to/bitcoin/keys

# Enable Bitcoin wallet encryption
bitcoin-cli encryptwallet "your-strong-encryption-password"

# Set up Bitcoin RPC access restrictions
sudo ufw allow from your-trusted-ip to any port 8332
sudo ufw deny 8332

# Monitor Bitcoin transactions
bitcoin-cli walletnotify "echo 'Transaction: %s' >> /var/log/bitcoin/transactions.log"

# Backup Bitcoin wallet regularly
bitcoin-cli backupwallet /backups/bitcoin/wallet-$(date +%Y%m%d).dat
```

#### 5. Bitcoin Configuration Security

```ini
# bitcoin.conf
server=1
rpcuser=your-secure-rpc-user
rpcpassword=your-very-strong-rpc-password
rpcallowip=127.0.0.1
rpcallowip=your-trusted-ip
disablewallet=0
keypool=1000
prune=550
txindex=1
```

## Troubleshooting

### Common Issues

#### 1. Application Won't Start

```bash
# Check PM2 status
pm2 status

# View application logs
pm2 logs cryptoshop

# Check Node.js version
node --version
npm --version

# Check environment variables
pm2 env cryptoshop
```

#### 2. Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test database connection
psql -U cryptoshop_user -d cryptoshop -h localhost -c "SELECT 1"

# Check database logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

#### 3. SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Test SSL configuration
sudo nginx -t

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Force renew certificate
sudo certbot renew --force-renewal
```

#### 4. Performance Issues

```bash
# Check system resources
htop
df -h
free -h

# Check application performance
pm2 monit

# Check database performance
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"

# Check Nginx performance
sudo nginx -T
```

### Debug Commands

#### 1. Application Debugging

```bash
# Start application in debug mode
NODE_ENV=development npm run dev

# Check Node.js heap usage
node --inspect your-app.js

# Profile with Chrome DevTools
# Open chrome://inspect in Chrome
```

#### 2. Database Debugging

```bash
# Enable query logging
npx prisma db pull --preview-feature

# View database statistics
sudo -u postgres psql -d cryptoshop -c "SELECT * FROM pg_stat_database;"

# Check slow queries
sudo -u postgres psql -d cryptoshop -c "SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

#### 3. Network Debugging

```bash
# Check network connections
netstat -tuln

# Check DNS resolution
nslookup your-domain.com

# Test SSL connection
openssl s_client -connect your-domain.com:443

# Check HTTP headers
curl -I https://your-domain.com
```

### Health Check Script

```bash
# Create health check script
cat > /usr/local/bin/health-check.sh << 'EOF'
#!/bin/bash

# Check application health
APP_HEALTH=$(curl -s http://localhost:3000/api/health | jq -r '.status')
if [ "$APP_HEALTH" != "healthy" ]; then
    echo "Application is unhealthy: $APP_HEALTH"
    pm2 restart cryptoshop
fi

# Check database health
DB_HEALTH=$(sudo -u postgres psql -d cryptoshop -c "SELECT 1" 2>/dev/null && echo "healthy" || echo "unhealthy")
if [ "$DB_HEALTH" != "healthy" ]; then
    echo "Database is unhealthy"
    sudo systemctl restart postgresql
fi

# Check Bitcoin integration health
BITCOIN_HEALTH=$(curl -s http://localhost:3000/api/bitcoin/health | jq -r '.status')
if [ "$BITCOIN_HEALTH" != "healthy" ]; then
    echo "Bitcoin integration is unhealthy: $BITCOIN_HEALTH"
    # Attempt to restart Bitcoin services
    pm2 restart cryptoshop
fi

# Check blockchain API connectivity
BLOCKCHAIN_API=$(curl -s https://blockchain.info/q/getblockcount | head -c 10)
if ! [[ "$BLOCKCHAIN_API" =~ ^[0-9]+$ ]]; then
    echo "Blockchain API connectivity issue detected"
    # Log to monitoring system
    logger "Blockchain API connectivity issue"
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 90 ]; then
    echo "Disk usage is critical: ${DISK_USAGE}%"
    # Send alert or cleanup
fi

# Check memory usage
MEMORY_USAGE=$(free | awk '/Mem/{printf("%.0f"), $3/$2*100}')
if [ "$MEMORY_USAGE" -gt 90 ]; then
    echo "Memory usage is critical: ${MEMORY_USAGE}%"
    # Send alert or restart services
fi
EOF

# Make script executable
chmod +x /usr/local/bin/health-check.sh

# Add to crontab
echo "*/5 * * * * /usr/local/bin/health-check.sh" | crontab -
```

### Bitcoin-Specific Monitoring

```bash
# Create Bitcoin monitoring script
cat > /usr/local/bin/bitcoin-monitor.sh << 'EOF'
#!/bin/bash

# Monitor Bitcoin transaction processing
LOG_FILE="/var/log/cryptoshop/bitcoin-monitor.log"
ALERT_EMAIL="admin@your-domain.com"

# Check for stuck transactions
STUCK_TRANSACTIONS=$(psql -U cryptoshop -d cryptoshop -c "SELECT COUNT(*) FROM orders WHERE payment_status = 'pending' AND created_at < NOW() - INTERVAL '30 minutes';" -t | xargs)

if [ "$STUCK_TRANSACTIONS" -gt 0 ]; then
    echo "Warning: $STUCK_TRANSACTIONS stuck transactions detected" | tee -a "$LOG_FILE"
    # Send alert
    echo "Subject: CryptoShop Alert - Stuck Transactions" | sendmail "$ALERT_EMAIL"
fi

# Check Bitcoin price feed updates
PRICE_UPDATE=$(psql -U cryptoshop -d cryptoshop -c "SELECT EXTRACT(EPOCH FROM (NOW() - last_updated)) < 300 FROM bitcoin_prices ORDER BY last_updated DESC LIMIT 1;" -t | xargs)

if [ "$PRICE_UPDATE" != "t" ]; then
    echo "Warning: Bitcoin price feed not updated recently" | tee -a "$LOG_FILE"
fi

# Monitor wallet balance changes
WALLET_ACTIVITY=$(psql -U cryptoshop -d cryptoshop -c "SELECT COUNT(*) FROM bitcoin_transactions WHERE created_at > NOW() - INTERVAL '1 hour';" -t | xargs)

echo "Bitcoin wallet activity in last hour: $WALLET_ACTIVITY transactions" | tee -a "$LOG_FILE"
EOF

# Make script executable
chmod +x /usr/local/bin/bitcoin-monitor.sh

# Add to crontab (every 10 minutes)
echo "*/10 * * * * /usr/local/bin/bitcoin-monitor.sh" | crontab -
```

This comprehensive deployment guide provides everything needed to deploy CryptoShop in various environments, from simple VPS hosting to enterprise-scale cloud infrastructure, with complete **real Bitcoin integration** support.