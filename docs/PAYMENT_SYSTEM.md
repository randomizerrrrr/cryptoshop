# Système de Paiement

## Vue d'ensemble

Notre marketplace utilise un système de paiement hybride qui sépare clairement les achats de produits des transactions en cryptomonnaie.

## Concepts Clés

### 1. Balance (Solde du Compte)
- **Devise**: Euro (€)
- **Usage**: Achats de produits et services sur la marketplace
- **Avantages**: 
  - Transactions instantanées
  - Pas de frais de transaction
  - Interface utilisateur simple
  - Pas de volatilité pendant les achats

### 2. Bitcoin (BTC)
- **Usage**: Uniquement pour recharger (topup) et retirer (cashout) des fonds
- **Avantages**:
  - Décentralisé et sécurisé
  - Transactions internationales sans frais bancaires
  - Protection de la vie privée
  - Conversion en EUR au moment des transactions

## Flux de Paiement

### Processus d'Achat
```
1. Utilisateur navigue vers un produit
2. Ajoute au panier
3. Procède au checkout
4. Paiement depuis la balance (€)
5. Confirmation instantanée
6. Accès au produit/service
```

### Processus de Recharge (Topup)
```
1. Utilisateur va dans Wallet
2. Clique sur "Top Up Balance"
3. Génère une adresse Bitcoin
4. Envoie du BTC
5. Confirmation blockchain
6. Conversion en EUR et ajout à la balance
```

### Processus de Retrait (Cashout)
```
1. Utilisateur va dans Wallet
2. Clique sur "Cash Out"
3. Spécifie le montant en EUR
4. Fournit une adresse Bitcoin
5. Conversion EUR → BTC
6. Envoi du BTC
7. Confirmation blockchain
```

## Avantages du Système

### Pour les Utilisateurs
- **Simplicité**: Pas besoin de gérer le BTC lors des achats
- **Stabilité**: Prix fixes en EUR, pas de volatilité crypto
- **Vitesse**: Transactions instantanées depuis la balance
- **Flexibilité**: Peut recharger/retirer en BTC quand souhaité

### Pour la Marketplace
- **Comptabilité simplifiée**: Toutes les transactions en EUR
- **Expérience utilisateur améliorée**: Interface d'achat traditionnelle
- **Réduction des frais**: Moins de transactions on-chain
- **Conformité**: Plus facile à gérer réglementairement

## Sécurité

### Protection des Fonds
- Les fonds en BTC sont sécurisés par le réseau Bitcoin
- La balance est protégée par l'authentification utilisateur
- Transactions de topup/cashout avec confirmations blockchain

### Escrow pour les Achats
- Les fonds sont placés en escrow lors des achats
- Libération automatique après confirmation du service
- Système de médiation pour les litiges

## Intégration Technique

### Structure des Composants
```
src/
├── app/
│   ├── checkout/page.tsx          # Paiement par balance
│   ├── wallet/page.tsx            # Gestion BTC (topup/cashout)
│   └── product/[id]/page.tsx      # Pages produits
├── components/
│   ├── layout/
│   │   └── navbar.tsx             # Navigation balance/BTC
│   └── ui/
│       └── badge.tsx              # Composants UI partagés
└── lib/
    ├── api/
    │   ├── payments.ts            # API paiements balance
    │   └── bitcoin.ts             # API transactions BTC
    └── utils/
        └── currency.ts             # Utilitaires conversion
```

### API Endpoints
- `POST /api/payments/balance` - Paiement depuis balance
- `POST /api/bitcoin/topup` - Recharge BTC → EUR
- `POST /api/bitcoin/cashout` - Retrait EUR → BTC
- `GET /api/bitcoin/rate` - Taux de conversion BTC/EUR

## Cas d'Usage

### Scénario Typique
1. **Nouvel utilisateur**: Recharge son portefeuille avec 100€ de BTC
2. **Achat**: Achète un VPN pour 89.99€ depuis sa balance
3. **Solde restant**: 10.01€ disponibles pour prochains achats
4. **Recharge**: Recharge à nouveau quand solde bas

### Utilisateur Avancé
1. **Multiple recharges**: Gère plusieurs recharges BTC
2. **Achats fréquents**: Utilise balance pour achats rapides
3. **Retraits**: Retire les bénéfices en BTC
4. **Arbitrage**: Profite des taux de change favorables

## Bonnes Pratiques

### Pour les Développeurs
- Toujours afficher les montants en EUR pour les achats
- Montrer les équivalents BTC uniquement pour topup/cashout
- Valider le solde avant chaque paiement
- Utiliser des taux de conversion en temps réel

### Pour les Utilisateurs
- Garder un solde suffisant pour les achats prévus
- Surveiller les taux de change pour les recharges optimales
- Utiliser l'escrow pour les transactions importantes
- Vérifier les adresses BTC avant envoi

## Évolution Future

### Améliorations Prévues
1. **Multi-devises**: Support USD, GBP en plus de EUR
2. **Stablecoins**: Ajout d'USDT, USDC pour les recharges
3. **Lightning Network**: Transactions BTC instantanées
4. **API Trading**: Intégration avec exchanges externes

### Sécurité Renforcée
1. **2FA**: Authentification à deux facteurs
2. **Multi-sig**: Portefeuilles multi-signatures
3. **Cold Storage**: Stockage à froid pour gros montants
4. **Audit**: Audits de sécurité réguliers

---

**Note**: Ce système combine le meilleur des deux mondes - la simplicité des paiements traditionnels avec la flexibilité et la sécurité des cryptomonnaies.