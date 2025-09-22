# Documentation de la Marketplace

Bienvenue dans la documentation officielle de notre marketplace Bitcoin/Euro. Cette documentation couvre tous les aspects de la plateforme, de l'utilisation quotidienne au développement technique.

## 📚 Table des Matières

### 🚀 Démarrage Rapide
- [Guide Utilisateur](USER_GUIDE.md) - Pour les utilisateurs de la plateforme
- [Concepts de Base](#concepts-de-base) - Comprendre le système de paiement

### 💡 Concepts Clés
- [Système de Paiement](PAYMENT_SYSTEM.md) - Fonctionnement balance/BTC
- [Architecture Technique](TECHNICAL_ARCHITECTURE.md) - Structure de l'application
- [Guide Développeur](DEVELOPER_GUIDE.md) - Pour les contributeurs

### 🔧 Documentation Technique
- [API Reference](#api-reference) - Endpoints et schémas
- [Base de Données](#base-de-données) - Schéma et migrations
- [Déploiement](#déploiement) - Configuration et mise en production

## 🎯 Concepts de Base

### Notre Approche Innovante

Notre marketplace utilise un système hybride unique qui combine la simplicité des paiements traditionnels avec la flexibilité des cryptomonnaies :

#### 💰 Balance (Solde en EUR)
- **Usage**: Acheter des produits et services
- **Avantages**: Transactions instantanées, pas de frais, interface simple
- **Expérience**: Comme un portefeuille numérique traditionnel

#### ₿ Bitcoin (BTC)
- **Usage**: Uniquement pour recharger (topup) et retirer (cashout)
- **Avantages**: Décentralisé, sécurisé, transactions internationales
- **Conversion**: Automatique en EUR au taux du marché

### Pourquoi ce Système ?

1. **Simplicité pour l'utilisateur**: Pas besoin de gérer le BTC pendant les achats
2. **Stabilité des prix**: Prix fixes en EUR, pas de volatilité crypto
3. **Vitesse**: Transactions instantanées depuis la balance
4. **Flexibilité**: Peut recharger/retirer en BTC quand souhaité
5. **Conformité**: Plus facile à gérer réglementairement

## 🚀 Démarrage Rapide

### Pour les Utilisateurs

1. **Créez un compte** sur la plateforme
2. **Rechargez votre balance** avec du Bitcoin
3. **Achetez des produits** depuis votre balance
4. **Retirez vos fonds** en Bitcoin si nécessaire

[→ Guide Utilisateur Complet](USER_GUIDE.md)

### Pour les Développeurs

1. **Clonez le repository**
2. **Configurez l'environnement**
3. **Installez les dépendances**
4. **Lancez le serveur de développement**

```bash
git clone <repository>
cd marketplace
npm install
cp .env.example .env.local
npx prisma generate
npm run dev
```

[→ Guide Développeur Complet](DEVELOPER_GUIDE.md)

## 🏗️ Architecture

### Frontend
- **Next.js 15** avec App Router
- **TypeScript 5** pour la sécurité des types
- **Tailwind CSS 4** pour le styling
- **shadcn/ui** pour les composants
- **Zustand** pour le state management

### Backend
- **API Routes** Next.js
- **Prisma ORM** avec SQLite
- **NextAuth.js** pour l'authentification
- **WebSocket/Socket.io** pour le temps réel

### Infrastructure
- **Vercel** pour le déploiement
- **SQLite** pour la base de données
- **Bitcoin RPC** pour les transactions crypto

[→ Architecture Technique Détaillée](TECHNICAL_ARCHITECTURE.md)

## 💳 Système de Paiement

### Flux d'Achat Typique
```
1. Recharge BTC → EUR (Topup)
2. Navigation sur la marketplace
3. Ajout au panier
4. Paiement depuis la balance (EUR)
5. Confirmation instantanée
6. Accès au produit/service
```

### Flux de Recharge/Retrait
```
Recharge: BTC → Balance (EUR)
Retrait: Balance (EUR) → BTC
```

### Avantages
- **Instantané**: Les paiements depuis la balance sont immédiats
- **Économique**: Moins de transactions on-chain = moins de frais
- **Simple**: Interface utilisateur traditionnelle
- **Sécurisé**: Bitcoin pour les fonds, EUR pour les achats

[→ Documentation Complète du Système de Paiement](PAYMENT_SYSTEM.md)

## 🛠️ Développement

### Convention de Codage
- **TypeScript**: Mode strict activé
- **ESLint**: Configuration personnalisée
- **Prettier**: Formatage automatique
- **Husky**: Git hooks pour la qualité

### Structure des Dossiers
```
src/
├── app/          # Pages Next.js
├── components/   # Composants réutilisables
├── lib/          # Bibliothèques utilitaires
├── hooks/        # Hooks personnalisés
├── types/        # Définitions de types
└── constants/    # Constantes de l'application
```

### Tests
- **Jest** pour les tests unitaires
- **Testing Library** pour les tests d'intégration
- **Playwright** pour les tests E2E

[→ Guide Développeur Complet](DEVELOPER_GUIDE.md)

## 🚀 Déploiement

### Environment
- **Développement**: `npm run dev`
- **Build**: `npm run build`
- **Production**: `npm start`
- **Lint**: `npm run lint`

### Configuration
- **Variables d'environnement**: `.env.local`
- **Base de données**: Prisma avec SQLite
- **Authentification**: NextAuth.js
- **Déploiement**: Vercel recommandé

## 🔍 Surveillance

### Performance
- **Web Vitals**: Monitoring des performances
- **Bundle Analysis**: Optimisation des bundles
- **Cache Strategy**: Mise en cache intelligente

### Sécurité
- **Authentication**: JWT avec NextAuth.js
- **Validation**: Zod pour la validation des données
- **Rate Limiting**: Protection contre les abus
- **CORS**: Configuration sécurisée

## 📊 API Reference

### Endpoints Principaux

#### Authentication
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `POST /api/auth/logout` - Déconnexion

#### Paiements
- `POST /api/payments/create` - Créer un paiement
- `GET /api/payments/history` - Historique des paiements
- `POST /api/payments/confirm` - Confirmer un paiement

#### Bitcoin
- `POST /api/bitcoin/topup` - Recharger la balance
- `POST /api/bitcoin/cashout` - Retirer des fonds
- `GET /api/bitcoin/rate` - Taux de change
- `POST /api/bitcoin/address` - Générer une adresse

#### Produits
- `GET /api/products` - Liste des produits
- `GET /api/products/[id]` - Détails d'un produit
- `POST /api/products` - Créer un produit
- `PUT /api/products/[id]` - Mettre à jour un produit

### Schémas de Données

#### User
```typescript
interface User {
  id: string
  email: string
  username: string
  avatar?: string
  balance: number // EUR
  createdAt: Date
  updatedAt: Date
}
```

#### Product
```typescript
interface Product {
  id: string
  name: string
  description: string
  price: {
    eur: number
    btc?: number
  }
  categoryId: string
  sellerId: string
  inStock: boolean
  createdAt: Date
  updatedAt: Date
}
```

## 🗄️ Base de Données

### Schéma Principal
- **Users**: Informations des utilisateurs et balance
- **Products**: Catalogue des produits
- **Orders**: Commandes des utilisateurs
- **BitcoinTransactions**: Transactions BTC
- **Payments**: Paiements depuis la balance

### Migrations
```bash
# Créer une migration
npx prisma migrate dev --name migration_name

# Appliquer en production
npx prisma migrate deploy

# Générer le client
npx prisma generate
```

## 🔧 Dépannage

### Problèmes Courants

#### Erreur d'Hydration
```typescript
// Problème: Classes CSS générées dynamiquement
// Solution: Utiliser des classes statiques ou server components
```

#### Balance Non Mise à Jour
- Vérifier les confirmations blockchain
- Vérifier la configuration du RPC Bitcoin
- Consulter les logs du serveur

#### Paiement Échoué
- Vérifier le solde suffisant
- Vérifier la validation des données
- Consulter les erreurs dans la console

## 🤝 Contribuer

### Comment Contribuer
1. Forker le repository
2. Créer une branche feature
3. Faire les changements
4. Ajouter des tests
5. Soumettre une pull request

### Normes de Contribution
- Suivre la convention de commit
- Ajouter des tests pour les nouvelles fonctionnalités
- Mettre à jour la documentation
- Respecter les guidelines de code style

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](../LICENSE) pour plus de détails.

## 📞 Support

### Support Technique
- **Email**: support@marketplace.com
- **GitHub Issues**: [Signaler un bug](https://github.com/your-repo/issues)
- **Documentation**: [Consulter les guides](#table-des-matières)

### Communauté
- **Discord**: Rejoignez notre serveur
- **Twitter**: Suivez-nous pour les mises à jour
- **Blog**: Articles et tutoriels

---

## 📖 Prochaines Étapes

### Pour les Utilisateurs
1. Lisez le [Guide Utilisateur](USER_GUIDE.md)
2. Créez votre compte
3. Rechargez votre balance
4. Explorez la marketplace

### Pour les Développeurs
1. Lisez le [Guide Développeur](DEVELOPER_GUIDE.md)
2. Configurez votre environnement
3. Explorez le code source
4. Contribuez au projet

### Pour les Partenaires
1. Contactez-nous pour l'intégration
2. Explorez notre [API](#api-reference)
3. Devenez vendeur sur la plateforme
4. Intégrez nos services

---

**Dernière mise à jour**: Décembre 2024

**Version**: 1.0.0

**Mainteneurs**: Équipe de développement de la marketplace