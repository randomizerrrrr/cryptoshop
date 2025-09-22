# Guide Développeur

## Introduction

Ce guide est destiné aux développeurs qui travaillent sur la marketplace. Il couvre les conventions de codage, l'architecture, les bonnes pratiques et les processus de développement.

## Prérequis

### Environnement de Développement
- **Node.js**: Version 18 ou supérieure
- **npm**: Version 8 ou supérieure
- **Git**: Pour le contrôle de version
- **VS Code**: Recommandé avec les extensions TypeScript et Tailwind

### Connaissances Requises
- TypeScript (avancé)
- React/Next.js
- Tailwind CSS
- Prisma ORM
- Concepts de base des cryptomonnaies

## Configuration du Projet

### Installation
```bash
# Cloner le repository
git clone <repository-url>
cd marketplace

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local

# Initialiser la base de données
npx prisma generate
npx prisma db push

# Démarrer le serveur de développement
npm run dev
```

### Variables d'Environnement
```bash
# .env.local
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
DATABASE_URL="file:./dev.db"

# Bitcoin RPC (optionnel pour le développement)
BITCOIN_RPC_URL=http://localhost:8332
BITCOIN_RPC_USER=bitcoin
BITCOIN_RPC_PASSWORD=password

# API Keys (si nécessaire)
EXTERNAL_API_KEY=your-api-key
```

## Architecture du Code

### Structure des Composants

#### Composants UI (shadcn/ui)
```typescript
// Exemple: Button component
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

#### Composants Métier
```typescript
// Exemple: ProductCard component
'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Euro, Star, ShoppingCart } from "lucide-react"
import { Product } from "@/types/database"

interface ProductCardProps {
  product: Product
  onAddToCart: (productId: string) => void
  onViewDetails: (productId: string) => void
}

export function ProductCard({ product, onAddToCart, onViewDetails }: ProductCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
          <Badge variant={product.inStock ? "default" : "secondary"}>
            {product.inStock ? "In Stock" : "Out of Stock"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-lg font-bold text-primary">
            <Euro className="h-5 w-5" />
            <span>{product.price.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>4.8</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onViewDetails(product.id)}
          >
            View Details
          </Button>
          <Button 
            size="sm" 
            className="flex-1"
            onClick={() => onAddToCart(product.id)}
            disabled={!product.inStock}
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

### State Management

#### Zustand Stores
```typescript
// Exemple: Cart store
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product } from '@/types/database'

interface CartItem {
  productId: string
  name: string
  price: {
    btc: number
    eur: number
  }
  quantity: number
  image: string
}

interface CartStore {
  items: CartItem[]
  addItem: (product: Product, quantity: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotalBtc: () => number
  getTotalEur: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, quantity) => {
        set((state) => {
          const existingItem = state.items.find(item => item.productId === product.id)
          
          if (existingItem) {
            return {
              items: state.items.map(item =>
                item.productId === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              )
            }
          } else {
            const newItem: CartItem = {
              productId: product.id,
              name: product.name,
              price: product.price,
              quantity,
              image: product.image || ''
            }
            return { items: [...state.items, newItem] }
          }
        })
      },
      
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter(item => item.productId !== productId)
        }))
      },
      
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        
        set((state) => ({
          items: state.items.map(item =>
            item.productId === productId
              ? { ...item, quantity }
              : item
          )
        }))
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotalBtc: () => {
        const state = get()
        return state.items.reduce((total, item) => total + (item.price.btc * item.quantity), 0)
      },
      
      getTotalEur: () => {
        const state = get()
        return state.items.reduce((total, item) => total + (item.price.eur * item.quantity), 0)
      },
      
      getItemCount: () => {
        const state = get()
        return state.items.reduce((count, item) => count + item.quantity, 0)
      }
    }),
    {
      name: 'cart-storage',
    }
  )
)
```

#### TanStack Query
```typescript
// Exemple: Hook pour les produits
import { useQuery } from '@tanstack/react-query'
import { productsAPI } from '@/lib/api/products'

export const useProducts = (filters?: {
  category?: string
  search?: string
  minPrice?: number
  maxPrice?: number
}) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsAPI.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productsAPI.getProduct(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}
```

### API Routes

#### Structure des API Routes
```typescript
// Exemple: API route pour les paiements
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { paymentsAPI } from '@/lib/api/payments'
import { z } from 'zod'

const createPaymentSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().positive(),
  })),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createPaymentSchema.parse(body)

    const payment = await paymentsAPI.createPayment({
      userId: session.user.id,
      items: validatedData.items,
    })

    return NextResponse.json(payment)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Payment creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

#### API Bitcoin
```typescript
// Exemple: API pour les transactions Bitcoin
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { bitcoinAPI } from '@/lib/api/bitcoin'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, amount, address } = await request.json()

    switch (action) {
      case 'generate_address':
        const newAddress = await bitcoinAPI.generateAddress(session.user.id)
        return NextResponse.json({ address: newAddress })

      case 'topup':
        const topupTransaction = await bitcoinAPI.createTopupTransaction({
          userId: session.user.id,
          amount,
          address,
        })
        return NextResponse.json(topupTransaction)

      case 'cashout':
        const cashoutTransaction = await bitcoinAPI.createCashoutTransaction({
          userId: session.user.id,
          amount,
          address,
        })
        return NextResponse.json(cashoutTransaction)

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Bitcoin API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## Base de Données

### Schéma Prisma
```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  username  String   @unique
  avatar    String?
  balance   Decimal  @default(0) @db.Decimal(10, 2)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  orders     Order[]
  transactions BitcoinTransaction[]
  cartItems  CartItem[]

  @@map("users")
}

model Product {
  id          String   @id @default(cuid())
  name        String
  description String
  price       Decimal  @db.Decimal(10, 2)
  categoryId  String
  sellerId    String
  image       String?
  inStock     Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  category   Category  @relation(fields: [categoryId], references: [id])
  seller     User      @relation(fields: [sellerId], references: [id])
  orderItems OrderItem[]
  cartItems  CartItem[]

  @@map("products")
}

model Order {
  id         String      @id @default(cuid())
  userId     String
  status     OrderStatus @default(PENDING)
  totalAmount Decimal     @db.Decimal(10, 2)
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt

  user        User         @relation(fields: [userId], references: [id])
  orderItems  OrderItem[]
  payments    Payment[]

  @@map("orders")
}

model BitcoinTransaction {
  id           String               @id @default(cuid())
  userId       String
  type         TransactionType
  amountBtc    Decimal              @db.Decimal(18, 8)
  amountEur    Decimal              @db.Decimal(10, 2)
  address      String
  txHash       String?
  confirmations Int                 @default(0)
  status       TransactionStatus   @default(PENDING)
  createdAt    DateTime             @default(now())
  updatedAt    DateTime             @updatedAt

  user User @relation(fields: [userId], references: [id])

  @@map("bitcoin_transactions")
}

enum OrderStatus {
  PENDING
  PAID
  SHIPPED
  DELIVERED
  CANCELLED
}

enum TransactionType {
  TOPUP
  CASHOUT
}

enum TransactionStatus {
  PENDING
  CONFIRMED
  FAILED
}
```

### Migrations
```bash
# Créer une nouvelle migration
npx prisma migrate dev --name add_user_preferences

# Appliquer les migrations en production
npx prisma migrate deploy

# Réinitialiser la base de données
npx prisma migrate reset

# Générer le client Prisma
npx prisma generate
```

## Tests

### Tests Unitaires
```typescript
// Exemple: Test du cart store
import { renderHook, act } from '@testing-library/react'
import { useCartStore } from '@/store/cart-store'

describe('Cart Store', () => {
  it('should add item to cart', () => {
    const { result } = renderHook(() => useCartStore())
    
    const mockProduct = {
      id: '1',
      name: 'Test Product',
      price: { btc: 0.001, eur: 50 },
      image: 'test.jpg'
    }

    act(() => {
      result.current.addItem(mockProduct, 1)
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].productId).toBe('1')
    expect(result.current.getTotalEur()).toBe(50)
  })

  it('should update item quantity', () => {
    const { result } = renderHook(() => useCartStore())
    
    const mockProduct = {
      id: '1',
      name: 'Test Product',
      price: { btc: 0.001, eur: 50 },
      image: 'test.jpg'
    }

    act(() => {
      result.current.addItem(mockProduct, 1)
      result.current.updateQuantity('1', 3)
    })

    expect(result.current.items[0].quantity).toBe(3)
    expect(result.current.getTotalEur()).toBe(150)
  })
})
```

### Tests d'API
```typescript
// Exemple: Test des API routes
import { createMocks } from 'node-mocks-http'
import { POST } from '@/app/api/payments/route'

describe('Payments API', () => {
  it('should create payment successfully', async () => {
    const { req } = createMocks({
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: {
        items: [
          { productId: '1', quantity: 1 },
          { productId: '2', quantity: 2 }
        ]
      },
    })

    // Mock session utilisateur
    req.headers.cookie = 'next-auth.session-token=mock-token'

    const res = await POST(req)
    
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.id).toBeDefined()
  })

  it('should return error for invalid input', async () => {
    const { req } = createMocks({
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: {
        items: 'invalid'
      },
    })

    const res = await POST(req)
    
    expect(res.status).toBe(400)
  })
})
```

## Déploiement

### Build et Production
```bash
# Build pour production
npm run build

# Lancer en production
npm start

# Analyse du bundle
npm run analyze

# Linting
npm run lint

# Type checking
npx tsc --noEmit
```

### Configuration Vercel
```json
// vercel.json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXTAUTH_URL": "https://your-domain.com",
    "DATABASE_URL": "@database_url",
    "NEXTAUTH_SECRET": "@nextauth_secret"
  }
}
```

## Monitoring

### Performance Monitoring
```typescript
// Exemple: Monitoring des performances
export function reportWebVitals(metric: any) {
  if (metric.label === 'web-vital') {
    console.log(metric)
    // Envoyer à un service d'analyse
    // analytics.track('web-vital', metric)
  }
}
```

### Error Tracking
```typescript
// Exemple: Error boundary
'use client'

import { Component, ReactNode } from 'react'
import * as Sentry from '@sentry/nextjs'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    Sentry.captureException(error, { extra: errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-600">Something went wrong</h2>
          <p className="text-sm text-gray-600">
            {this.state.error?.message}
          </p>
        </div>
      )
    }

    return this.props.children
  }
}
```

## Bonnes Pratiques

### Code Style
- Utiliser TypeScript strict mode
- Suivre les conventions ESLint
- Écrire des composants purs quand possible
- Utiliser les hooks personnalisés pour la logique réutilisable
- Documenter le code avec JSDoc

### Performance
- Utiliser React.memo pour les composants coûteux
- Optimiser les images avec Next.js Image
- Utiliser le code splitting dynamique
- Implémenter le lazy loading
- Optimiser les bundles avec Webpack

### Sécurité
- Valider toutes les entrées utilisateur
- Utiliser HTTPS en production
- Implémenter le rate limiting
- Stocker les secrets de manière sécurisée
- Utiliser CSP headers

### Accessibilité
- Utiliser des composants ARIA-compliant
- Fournir des alternatives textuelles
- Supporter la navigation au clavier
- Tester avec des lecteurs d'écran
- Utiliser des couleurs contrastées

## Contribuer

### Processus de Contribution
1. Forker le repository
2. Créer une branche feature
3. Faire les changements
4. Ajouter des tests
5. Soumettre une pull request
6. Attendre la review
7. Merger si approuvé

### Commit Messages
```
feat: add bitcoin payment integration
fix: resolve hydration issue in badge component
docs: update payment system documentation
style: format code with prettier
refactor: simplify cart store logic
test: add unit tests for product card
chore: update dependencies
```

---

**Note**: Ce guide est un document vivant. Contribuez à l'améliorer en soumettant des pull requests avec des corrections ou des ajouts.