# Troubleshooting Guide

This comprehensive guide covers common issues, errors, and solutions for CryptoShop. If you're experiencing problems with your application, start here.

## Table of Contents

- [Common Errors](#common-errors)
  - [ChunkLoadError: Loading chunk app/page failed](#chunkloaderror-loading-chunk-apppage-failed)
  - [Module Not Found Errors](#module-not-found-errors)
  - [TypeScript Compilation Errors](#typescript-compilation-errors)
  - [Database Connection Issues](#database-connection-issues)
  - [Port Already in Use](#port-already-in-use)
  - [Memory Issues](#memory-issues)
- [Development Environment Issues](#development-environment-issues)
  - [Hot Reload Not Working](#hot-reload-not-working)
  - [Environment Variables Not Loading](#environment-variables-not-loading)
  - [Dependency Conflicts](#dependency-conflicts)
- [Production Issues](#production-issues)
  - [Build Failures](#build-failures)
  - [Runtime Errors](#runtime-errors)
  - [Performance Problems](#performance-problems)
- [Browser-Specific Issues](#browser-specific-issues)
  - [Chrome Issues](#chrome-issues)
  - [Firefox Issues](#firefox-issues)
  - [Safari Issues](#safari-issues)
- [Operating System Issues](#operating-system-issues)
  - [Linux Issues](#linux-issues)
  - [macOS Issues](#macos-issues)
  - [Windows Issues](#windows-issues)
- [Docker Issues](#docker-issues)
- [Network and Proxy Issues](#network-and-proxy-issues)
- [Debugging Tools and Techniques](#debugging-tools-and-techniques)
- [Getting Help](#getting-help)

## Common Errors

### ChunkLoadError: Loading chunk app/page failed

This is the most common error in Next.js applications. It occurs when the browser cannot load specific JavaScript chunks required for the application.

#### Symptoms
- White screen or partial page load
- Error in browser console: "ChunkLoadError: Loading chunk app/page failed"
- Application appears to be stuck loading
- Some parts of the application work while others don't

#### Root Causes
1. **Network Issues**: Poor internet connection, CDN problems, or proxy interference
2. **Memory Issues**: Insufficient memory causing chunk generation failures
3. **Build Problems**: Incomplete or corrupted build artifacts
4. **Browser Extensions**: Ad blockers or privacy extensions blocking chunk loading
5. **File Permissions**: Incorrect file permissions preventing access to chunk files
6. **Caching Issues**: Browser or CDN cache serving old/incomplete chunks

#### Solutions

##### 1. Immediate Fixes

**Clear Next.js Cache:**
```bash
# Remove all build artifacts
rm -rf .next

# Clean npm cache
npm cache clean --force

# Rebuild the application
npm run build

# Restart development server
npm run dev
```

**Increase Memory Allocation:**
```bash
# Check current memory usage
free -h  # Linux/macOS
wmic OS get TotalVisibleMemorySize,FreePhysicalMemory  # Windows

# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dev

# Or add to package.json scripts
{
  "scripts": {
    "dev": "NODE_OPTIONS=\"--max-old-space-size=4096\" next dev",
    "build": "NODE_OPTIONS=\"--max-old-space-size=4096\" next build",
    "start": "NODE_OPTIONS=\"--max-old-space-size=4096\" next start"
  }
}
```

**Check and Fix File Permissions:**
```bash
# Ensure proper permissions
chmod -R 755 .
find . -name "*.js" -exec chmod 644 {} \;
find . -name "*.ts" -exec chmod 644 {} \;
find . -name "*.tsx" -exec chmod 644 {} \;

# Fix ownership if needed
sudo chown -R $USER:$USER .
```

##### 2. Browser-Specific Fixes

**Clear Browser Cache:**
- Chrome: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Firefox: `Ctrl+F5` or `Ctrl+Shift+R`
- Safari: `Cmd+Option+R`

**Disable Browser Extensions:**
- Ad blockers (uBlock Origin, AdBlock Plus)
- Privacy extensions (Privacy Badger, Ghostery)
- Security extensions (NoScript, HTTPS Everywhere)
- Developer extensions that modify network requests

**Try Incognito/Private Mode:**
- Chrome: `Ctrl+Shift+N` (Windows/Linux) or `Cmd+Shift+N` (Mac)
- Firefox: `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
- Safari: `Cmd+Shift+N`

##### 3. Configuration Fixes

**Update next.config.ts:**
```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['shadcn/ui', 'lucide-react'],
    serverComponentsExternalPackages: []
  },
  webpack: (config, { dev, isServer }) => {
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
    
    if (!dev && !isServer) {
      // Production optimizations
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
        },
      };
    }
    
    return config;
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
};

export default nextConfig;
```

**Add Error Boundary:**
```typescript
// components/ErrorBoundary.tsx
'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-6">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || 'Failed to load application components'}
            </p>
            <button
              onClick={this.handleReload}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage in layout
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}
```

##### 4. Network and Proxy Fixes

**Check Network Connectivity:**
```bash
# Test local server
curl http://localhost:3000

# Test with different headers
curl -H "Accept-Encoding: gzip" http://localhost:3000

# Check for proxy interference
unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy
npm run dev
```

**Configure CORS (if needed):**
```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};
```

##### 5. Advanced Solutions

**Implement Chunk Loading Retry Logic:**
```typescript
// utils/chunk-loader.ts
export class ChunkLoader {
  private static retryAttempts = 3;
  private static retryDelay = 1000; // 1 second

  static async loadChunk<T>(chunkName: string): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const chunk = await import(/* webpackChunkName: "[request]" */ `@/chunks/${chunkName}`);
        return chunk.default as T;
      } catch (error) {
        lastError = error as Error;
        console.warn(`Attempt ${attempt} failed for chunk ${chunkName}:`, error.message);
        
        if (attempt < this.retryAttempts) {
          const delay = this.retryDelay * attempt;
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(`Failed to load chunk ${chunkName} after ${this.retryAttempts} attempts. Last error: ${lastError?.message}`);
  }
}

// Usage
try {
  const module = await ChunkLoader.loadChunk('heavy-component');
  // Use the module
} catch (error) {
  console.error('Failed to load chunk:', error);
  // Show fallback UI
}
```

**Implement Service Worker for Offline Support:**
```typescript
// public/sw.js
const CACHE_NAME = 'cryptoshop-v1';
const urlsToCache = [
  '/',
  '/_next/static/css/app/layout.css',
  '/favicon.ico'
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
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // If both cache and network fail, show offline page
        if (event.request.destination === 'document') {
          return caches.match('/offline');
        }
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

### Module Not Found Errors

#### Symptoms
- Error messages like "Module not found: Can't resolve 'module-name'"
- Build failures during npm run build or npm run dev
- TypeScript errors about missing modules

#### Solutions

**Check Dependencies:**
```bash
# Verify package installation
npm list

# Check for missing dependencies
npm audit

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Check Import Paths:**
```typescript
// Correct import paths
import { Button } from '@/components/ui/button';  // Correct
import { Button } from 'components/ui/button';     // Wrong (missing @)

// Check file extensions
import { utils } from '@/lib/utils';        // utils.ts or utils.js
import { utils } from '@/lib/utils.ts';     // Wrong (include extension)
```

**Update TypeScript Configuration:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### TypeScript Compilation Errors

#### Common Errors
- Type 'X' is missing the following properties from type 'Y'
- Property 'X' does not exist on type 'Y'
- Cannot find module 'X' or its corresponding type declarations

#### Solutions

**Install Type Definitions:**
```bash
# Install missing type definitions
npm install --save-dev @types/node @types/react @types/react-dom

# Install specific library types
npm install --save-dev @types/library-name
```

**Update TypeScript Configuration:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Fix Type Errors:**
```typescript
// Use proper typing
interface User {
  id: string;
  username: string;
  email?: string;  // Optional property
}

// Use type guards
function isUser(obj: any): obj is User {
  return obj && typeof obj.id === 'string' && typeof obj.username === 'string';
}

// Use proper typing for API responses
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### Database Connection Issues

#### Symptoms
- Error: "Can't reach database server"
- Prisma errors during migration or seeding
- Application fails to start with database connection errors

#### Solutions

**Check Database Configuration:**
```bash
# Verify database file exists
ls -la dev.db

# Check database permissions
chmod 644 dev.db

# Test database connection
npx prisma db push --dry-run
```

**Update Environment Variables:**
```env
# .env.local
DATABASE_URL="file:./dev.db"

# For PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/cryptoshop"

# For MySQL
DATABASE_URL="mysql://username:password@localhost:3306/cryptoshop"
```

**Reset Database:**
```bash
# Reset database (development only)
npx prisma migrate reset

# Regenerate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push
```

**Check Database Service:**
```bash
# For PostgreSQL
sudo systemctl status postgresql
sudo systemctl start postgresql

# For MySQL
sudo systemctl status mysql
sudo systemctl start mysql

# For SQLite (no service needed)
# Just ensure file permissions are correct
```

### Port Already in Use

#### Symptoms
- Error: "Port 3000 is already in use"
- Application fails to start with port conflicts
- Multiple instances of the same application

#### Solutions

**Find Process Using Port:**
```bash
# Linux/macOS
lsof -ti:3000
netstat -tulpn | grep :3000

# Windows
netstat -ano | findstr :3000
tasklist | findstr "PID"
```

**Kill Process:**
```bash
# Linux/macOS
kill -9 <PID>

# Windows
taskkill /PID <PID> /F
```

**Use Different Port:**
```bash
# Start on different port
PORT=3001 npm run dev

# Or set in .env
PORT=3001
```

**Update Package.json Scripts:**
```json
{
  "scripts": {
    "dev": "next dev -p 3001",
    "dev:3002": "next dev -p 3002"
  }
}
```

### Memory Issues

#### Symptoms
- Application crashes with out-of-memory errors
- Slow performance and high CPU usage
- ChunkLoadError due to insufficient memory

#### Solutions

**Increase Node.js Memory:**
```bash
# Temporary increase
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dev

# Permanent in package.json
{
  "scripts": {
    "dev": "NODE_OPTIONS=\"--max-old-space-size=4096\" next dev",
    "build": "NODE_OPTIONS=\"--max-old-space-size=4096\" next build"
  }
}
```

**Monitor Memory Usage:**
```bash
# Linux/macOS
htop
free -h
vmstat

# Windows
tasklist | findstr node
wmic process where "name='node.exe'" get ProcessId,PageFileUsage
```

**Optimize Application:**
```typescript
// Use dynamic imports for large components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>,
  ssr: false
});

// Use React.memo for expensive components
const ExpensiveComponent = React.memo(function ExpensiveComponent({ data }) {
  return <div>{/* expensive rendering */}</div>;
});

// Use useMemo for expensive calculations
function MyComponent({ data }) {
  const processedData = useMemo(() => {
    return expensiveProcessing(data);
  }, [data]);
  
  return <div>{processedData}</div>;
}
```

## Development Environment Issues

### Hot Reload Not Working

#### Symptoms
- Changes to files don't reflect in the browser
- Need to manually refresh to see changes
- Slow or inconsistent hot reload behavior

#### Solutions

**Check File System:**
```bash
# Ensure proper file system events (Linux/macOS)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# For Windows, ensure WSL2 is properly configured
wsl --update
```

**Update Development Configuration:**
```typescript
// next.config.ts
const nextConfig = {
  webpackDevMiddleware: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
};
```

**Clear Cache and Restart:**
```bash
rm -rf .next
npm run dev
```

### Environment Variables Not Loading

#### Symptoms
- Application behaves as if environment variables are missing
- Default values are used instead of environment-specific values
- Configuration errors related to missing environment variables

#### Solutions

**Check Environment File:**
```bash
# Verify .env file exists
ls -la .env*

# Check file format
cat .env.local

# Ensure proper line endings (Windows)
dos2unix .env.local
```

**Update Environment Loading:**
```typescript
// next.config.ts
const nextConfig = {
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};
```

**Use dotenv for Additional Loading:**
```bash
npm install dotenv
```

```typescript
// Load environment variables early
require('dotenv').config({ path: '.env.local' });
```

### Dependency Conflicts

#### Symptoms
- npm install fails with conflict errors
- Multiple versions of the same package
- Unexpected behavior from third-party libraries

#### Solutions

**Check Dependency Tree:**
```bash
# Check for duplicate packages
npm ls

# Find specific package conflicts
npm ls package-name

# Check for outdated packages
npm outdated
```

**Resolve Conflicts:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Force specific version
npm install package-name@version

# Use npm dedupe
npm dedupe
```

**Update Package.json:**
```json
{
  "resolutions": {
    "package-name": "specific-version"
  }
}
```

## Production Issues

### Build Failures

#### Symptoms
- npm run build fails with errors
- Production build works differently from development
- Missing files or incorrect paths in production build

#### Solutions

**Check Build Requirements:**
```bash
# Ensure all dependencies are installed
npm ci --only=production

# Check Node.js version
node --version
npm --version

# Ensure compatible versions
```

**Debug Build Process:**
```bash
# Verbose build output
npm run build --verbose

# Analyze bundle size
npm install --save-dev @next/bundle-analyzer
npm run analyze
```

**Fix Common Build Issues:**
```typescript
// next.config.ts
const nextConfig = {
  // Handle transpilation for specific packages
  transpilePackages: ['some-package'],
  
  // Handle external modules
  webpack: (config) => {
    config.externals = config.externals || [];
    config.externals.push({
      'some-module': 'some-module',
    });
    return config;
  },
};
```

### Runtime Errors

#### Symptoms
- Application works in development but fails in production
- Console errors in production environment
- Features not working as expected in production

#### Solutions

**Check Production Configuration:**
```bash
# Set production environment
NODE_ENV=production npm run build

# Check production environment variables
printenv | grep NODE_ENV
```

**Enable Production Debugging:**
```typescript
// next.config.ts
const nextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};
```

**Add Error Monitoring:**
```typescript
// lib/error-monitoring.ts
export class ErrorMonitor {
  static init() {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        this.reportError(event.error);
      });

      window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        this.reportError(event.reason);
      });
    }
  }

  static reportError(error: Error) {
    // Send to error tracking service
    console.error('Error reported:', error);
  }
}

// Initialize in app
ErrorMonitor.init();
```

### Performance Problems

#### Symptoms
- Slow page load times
- High memory usage in production
- Poor user experience with laggy interactions

#### Solutions

**Optimize Images:**
```typescript
// next.config.ts
const nextConfig = {
  images: {
    domains: ['your-domain.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};
```

**Implement Caching:**
```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

**Optimize Bundle:**
```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
      },
    };
    return config;
  },
};
```

## Browser-Specific Issues

### Chrome Issues

#### Common Problems
- DevTools conflicts with hot reload
- Extension interference with application behavior
- CORS issues in development

#### Solutions

**Chrome DevTools Settings:**
- Disable "Disable cache" in DevTools
- Check "Disable JavaScript" is not enabled
- Clear browser cache and cookies

**Chrome Extensions:**
- Disable extensions one by one to identify conflicts
- Use Chrome's incognito mode for testing
- Whitelist localhost in extension settings

### Firefox Issues

#### Common Problems
- Strict CORS policies
- Different CSS rendering behavior
- WebExtension conflicts

#### Solutions

**Firefox Configuration:**
- Disable strict CORS in about:config (development only)
- Check about:cache for caching issues
- Use Firefox Developer Edition for better debugging

### Safari Issues

#### Common Problems
- Different JavaScript engine behavior
- CSS rendering differences
- IndexedDB quota issues

#### Solutions

**Safari Debugging:**
- Enable Develop menu in Safari preferences
- Use Safari Web Inspector for debugging
- Test on both desktop and mobile Safari

## Operating System Issues

### Linux Issues

#### Common Problems
- File permission issues
- Different file system behavior
- Package manager conflicts

#### Solutions

**File Permissions:**
```bash
# Fix file ownership
sudo chown -R $USER:$USER /path/to/project

# Fix executable permissions
chmod +x node_modules/.bin/next

# Check file system case sensitivity
```

**Package Manager:**
```bash
# Use nvm for Node.js version management
nvm install 18
nvm use 18

# Clear npm cache
npm cache clean --force
```

### macOS Issues

#### Common Problems
- Gatekeeper blocking applications
- Different file system behavior (case-insensitive)
- Homebrew conflicts

#### Solutions

**macOS Configuration:**
```bash
# Allow applications from anywhere (development only)
sudo spctl --master-disable

# Fix file permissions
xattr -dr com.apple.quarantine node_modules

# Use Homebrew for consistent package management
brew install node
```

### Windows Issues

#### Common Problems
- Path length limitations
- Different line endings (CRLF vs LF)
- PowerShell execution policy

#### Solutions

**Windows Configuration:**
```powershell
# Enable long paths in Windows 10
Set-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1

# Set PowerShell execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Configure Git for proper line endings
git config --global core.autocrlf input
```

**Windows Subsystem for Linux (WSL):**
```bash
# Update WSL
wsl --update

# Use WSL2 for better performance
wsl --set-default-version 2
```

## Docker Issues

### Common Problems
- Container build failures
- Port mapping conflicts
- Volume mounting issues

#### Solutions

**Docker Configuration:**
```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/cryptoshop
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - db
```

**Dockerfile Optimization:**
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

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

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

## Network and Proxy Issues

### Common Problems
- Corporate proxy blocking requests
- DNS resolution issues
- Firewall blocking ports

#### Solutions

**Proxy Configuration:**
```bash
# Set proxy environment variables
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080
export NO_PROXY=localhost,127.0.0.1

# Configure npm for proxy
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
```

**DNS Configuration:**
```bash
# Flush DNS cache
sudo dscacheutil -flushcache  # macOS
sudo systemd-resolve --flush-caches  # Linux
ipconfig /flushdns  # Windows

# Use custom DNS
echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf
```

**Firewall Configuration:**
```bash
# Check firewall status
sudo ufw status  # Ubuntu
sudo firewall-cmd --list-all  # CentOS

# Allow port 3000
sudo ufw allow 3000  # Ubuntu
sudo firewall-cmd --permanent --add-port=3000/tcp  # CentOS
```

## Debugging Tools and Techniques

### Browser Developer Tools

**Console Debugging:**
```javascript
// Advanced console logging
console.group('Product Loading');
console.log('Loading products...');
console.warn('Potential performance issue detected');
console.error('Failed to load products:', error);
console.groupEnd();

// Performance monitoring
console.time('ProductFetch');
fetch('/api/products')
  .then(() => console.timeEnd('ProductFetch'));

// Table logging for complex data
console.table(products);
```

**Network Tab Analysis:**
- Check for failed requests
- Analyze request/response headers
- Monitor loading times and bottlenecks
- Verify CORS headers

### Node.js Debugging

**Built-in Debugger:**
```bash
# Start Node.js with debugger
node --inspect-brk server.js

# Use Chrome DevTools for debugging
# Open chrome://inspect and connect to the Node.js process
```

**Environment Variables for Debugging:**
```bash
# Enable debug logging
DEBUG=cryptoshop:* npm run dev

# Enable verbose logging
NODE_DEBUG=http npm run dev

# Enable V8 logging
NODE_V8_OPTIONS="--trace-warnings" npm run dev
```

### Performance Profiling

**Chrome DevTools Performance Tab:**
- Record performance while using the application
- Analyze flame charts for bottlenecks
- Check memory leaks and garbage collection
- Monitor CPU usage and frame rates

**Bundle Analysis:**
```bash
# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Analyze bundle
npm run analyze

# Check bundle size impact
npm install --save-dev webpack-bundle-analyzer
```

## Getting Help

### Resources

**Official Documentation:**
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

**Community Support:**
- [GitHub Issues](https://github.com/vercel/next.js/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/next.js)
- [Discord Communities](https://nextjs.org/discord)
- [Reddit r/nextjs](https://www.reddit.com/r/nextjs/)

**Professional Support:**
- [Next.js Enterprise Support](https://vercel.com/enterprise)
- [Prisma Cloud](https://prisma.io/cloud)
- [Third-party consulting services](https://vercel.com/partners)

### Reporting Issues

When reporting issues, include:

1. **Environment Information:**
   ```bash
   node --version
   npm --version
   next --version
   operating system
   browser version
   ```

2. **Error Messages:**
   - Full error stack traces
   - Browser console logs
   - Server logs

3. **Steps to Reproduce:**
   - Clear, step-by-step instructions
   - Expected vs actual behavior
   - Screenshots or recordings if applicable

4. **Code Samples:**
   - Minimal reproducible example
   - Relevant configuration files
   - Package.json content

### Best Practices

**Preventive Measures:**
- Regular dependency updates
- Code reviews and testing
- Performance monitoring
- Error tracking and logging

**Development Workflow:**
- Use version control effectively
- Implement CI/CD pipelines
- Test in multiple environments
- Monitor production performance

**Documentation:**
- Keep documentation up to date
- Document known issues and workarounds
- Create troubleshooting checklists
- Share knowledge with team members

---

This troubleshooting guide should help you resolve most common issues with CryptoShop. Remember that systematic debugging and understanding the root cause is key to effective problem-solving.