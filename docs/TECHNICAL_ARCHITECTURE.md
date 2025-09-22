# Architecture Technique

## Vue d'Ensemble

Notre marketplace est construite avec Next.js 15, TypeScript et une architecture moderne basée sur les composants. Le système sépare clairement la logique de paiement en balance (EUR) des transactions cryptomonnaies (BTC).

## Stack Technique

### Frontend
- **Framework**: Next.js 15 avec App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **State Management**: Zustand pour le client, TanStack Query pour le serveur
- **Components**: Bibliothèque complète shadcn/ui (New York style)

### Backend
- **API**: API Routes Next.js
- **Database**: Prisma ORM avec SQLite
- **Authentication**: NextAuth.js v4
- **Caching**: Mémoire locale
- **Real-time**: WebSocket/Socket.io

### Infrastructure
- **Deployment**: Vercel (recommandé)
- **Environment**: Node.js 18+
- **Package Manager**: npm/yarn
- **Type Checking**: TypeScript strict mode

## Structure des Dossiers

```
src/
├── app/                          # Pages Next.js (App Router)
│   ├── (auth)/                   # Routes protégées
│   │   ├── checkout/             # Page de paiement
│   │   ├── wallet/               # Gestion portefeuille
│   │   ├── orders/               # Historique commandes
│   │   ├── market/               # Marketplace
│   │   └── product/[id]/         # Détails produit
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication
│   │   ├── payments/             # Paiements balance
│   │   ├── bitcoin/              # Transactions BTC
│   │   ├── blockchain/           # Monitoring blockchain
│   │   └── products/             # Gestion produits
│   └── globals.css              # Styles globaux
├── components/                   # Composants réutilisables
│   ├── layout/                  # Composants de layout
│   │   ├── navbar.tsx           # Barre de navigation
│   │   └── sidebar.tsx          # Sidebar (si utilisé)
│   ├── ui/                      # Composants UI shadcn/ui
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...                  # Tous les composants UI
│   ├── marketplace/             # Composants spécifiques
│   │   ├── product-card.tsx
│   │   ├── order-card.tsx
│   │   └── ...
│   └── forms/                   # Composants de formulaires
├── lib/                         # Bibliothèques utilitaires
│   ├── api/                     # Clients API
│   │   ├── auth.ts
│   │   ├── payments.ts
│   │   ├── bitcoin.ts
│   │   └── ...
│   ├── db/                      # Base de données
│   │   ├── index.ts             # Client Prisma
│   │   └── migrations/          # Migrations
│   ├── utils/                   # Fonctions utilitaires
│   │   ├── currency.ts         # Conversion devises
│   │   ├── validation.ts       # Validation schémas
│   │   └── security.ts         # Fonctions sécurité
│   └── store/                  # Stores Zustand
│       ├── cart-store.ts        # Panier utilisateur
│       ├── user-store.ts        # État utilisateur
│       └── ...
├── hooks/                       # Hooks personnalisés
│   ├── use-bitcoin-price.ts     # Prix BTC en temps réel
│   ├── use-balance.ts           # Solde utilisateur
│   └── ...
├── types/                       # Définitions de types
│   ├── api.ts                   # Types API
│   ├── database.ts              # Types base de données
│   └── ...
└── constants/                   # Constantes de l'application
    ├── routes.ts                # Routes de l'application
    ├── currencies.ts            # Devises supportées
    └── ...
```

## Architecture des Composants

### Composants UI (shadcn/ui)
- **Base**: Composants Radix UI avec styling Tailwind
- **Thème**: Support light/dark mode avec next-themes
- **Accessibilité**: Composants ARIA-compliant
- **Customisation**: Variants CVA pour une flexibilité maximale

### Composants Métier
- **ProductCard**: Affichage des produits avec prix en EUR
- **OrderCard**: Suivi des commandes et statuts
- **BalanceDisplay**: Affichage du solde avec options de recharge
- **BitcoinConverter**: Conversion BTC ↔ EUR en temps réel

## Architecture des Données

### Schéma de Base de Données
```sql
-- Utilisateurs
User {
  id: String (primary)
  email: String (unique)
  username: String (unique)
  avatar: String?
  balance: Decimal (EUR)
  createdAt: DateTime
  updatedAt: DateTime
}

-- Produits
Product {
  id: String (primary)
  name: String
  description: String
  price: Decimal (EUR)
  categoryId: String
  sellerId: String
  inStock: Boolean
  createdAt: DateTime
  updatedAt: DateTime
}

-- Commandes
Order {
  id: String (primary)
  userId: String
  status: Enum (pending, paid, shipped, delivered, cancelled)
  totalAmount: Decimal (EUR)
  createdAt: DateTime
  updatedAt: DateTime
}

-- Transactions Bitcoin
BitcoinTransaction {
  id: String (primary)
  userId: String
  type: Enum (topup, cashout)
  amountBtc: Decimal
  amountEur: Decimal
  address: String
  txHash: String?
  confirmations: Int
  status: Enum (pending, confirmed, failed)
  createdAt: DateTime
  updatedAt: DateTime
}
```

## Flux de Données

### Frontend State Management
```
Zustand Stores (Client)
├── cartStore: Panier utilisateur
├── userStore: Informations utilisateur
├── uiStore: État de l'interface
└── ...

TanStack Query (Server)
├── useProducts: Liste des produits
├── useOrders: Commandes utilisateur
├── useBalance: Solde en temps réel
└── ...
```

### API Architecture
```
API Routes
├── Authentication
│   ├── POST /api/auth/login
│   ├── POST /api/auth/register
│   └── POST /api/auth/logout
├── Payments
│   ├── POST /api/payments/create
│   ├── GET /api/payments/history
│   └── POST /api/payments/confirm
├── Bitcoin
│   ├── POST /api/bitcoin/topup
│   ├── POST /api/bitcoin/cashout
│   ├── GET /api/bitcoin/rate
│   └── POST /api/bitcoin/address
└── Products
    ├── GET /api/products
    ├── POST /api/products
    ├── GET /api/products/[id]
    └── PUT /api/products/[id]
```

## Sécurité

### Authentication
- **NextAuth.js**: Gestion des sessions et JWT
- **Middleware**: Protection des routes authentifiées
- **CSRF Protection**: Jetons CSRF pour les formulaires
- **Rate Limiting**: Limitation des requêtes API

### Validation des Données
- **Zod**: Validation des schémas en entrée/sortie
- **TypeScript**: Types stricts pour toute l'application
- **Prisma**: Validation au niveau de la base de données
- **Sanitization**: Nettoyage des entrées utilisateur

### Sécurité Bitcoin
- **Address Generation**: Adresses uniques par transaction
- **Blockchain Monitoring**: Surveillance des confirmations
- **Multi-sig**: Portefeuilles multi-signatures pour gros montants
- **Cold Storage**: Stockage à froid pour les fonds de l'entreprise

## Performance

### Optimisations Frontend
- **Code Splitting**: Division automatique du code avec Next.js
- **Image Optimization**: Optimisation des images avec Next.js Image
- **Bundle Analysis**: Analyse et optimisation des bundles
- **Caching**: Cache stratégique avec TanStack Query

### Optimisations Backend
- **Database Indexing**: Indexation optimisée des requêtes
- **Connection Pooling**: Pool de connexions Prisma
- **API Caching**: Cache des réponses API fréquemment accédées
- **Background Jobs**: Traitement asynchrone des tâches lourdes

## Déploiement

### Environment Configuration
```bash
# Variables d'environnement
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
DATABASE_URL="file:./dev.db"
BITCOIN_RPC_URL=https://bitcoin-rpc.example.com
BITCOIN_RPC_USER=your-rpc-user
BITCOIN_RPC_PASSWORD=your-rpc-password
```

### Build Process
```bash
# Développement
npm run dev

# Build production
npm run build

# Start production
npm start

# Linting
npm run lint

# Type checking
npx tsc --noEmit
```

## Monitoring

### Application Monitoring
- **Error Tracking**: Sentry ou équivalent
- **Performance**: Web Vitals et monitoring API
- **User Analytics**: Suivi des actions utilisateurs
- **Health Checks**: Vérification de l'état des services

### Bitcoin Monitoring
- **Transaction Monitoring**: Surveillance des transactions BTC
- **Balance Tracking**: Suivi des soldes en temps réel
- **Rate Alerts**: Alertes sur les changements de taux
- **Security Monitoring**: Détection d'activités suspectes

---

**Note**: Cette architecture est conçue pour évoluer avec l'application, en maintenant une séparation claire des préoccupations et une scalabilité optimale.