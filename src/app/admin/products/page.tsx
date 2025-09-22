'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminLayout } from '@/components/layout/admin-layout';
import { 
  Package, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Star, 
  DollarSign, 
  Bitcoin, 
  ShoppingCart, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp,
  Image,
  Tag,
  Category,
  User,
  Calendar,
  BarChart3,
  MoreHorizontal,
  AlertTriangle
} from 'lucide-react';

// Mock data pour les produits
const mockProducts = [
  {
    id: 1,
    name: 'Bitcoin Mining Guide',
    description: 'Guide complet pour miner du Bitcoin efficacement',
    priceBtc: 0.05,
    priceEur: 1250,
    category: 'Éducation',
    tags: ['bitcoin', 'mining', 'guide'],
    images: ['https://images.unsplash.com/photo-1639762592881-6166a9b8475a?w=400'],
    inStock: true,
    stockQuantity: 999,
    deliveryTime: 'Instant',
    digitalProduct: true,
    downloadUrl: 'https://example.com/guide.pdf',
    viewCount: 1234,
    salesCount: 45,
    rating: 4.8,
    reviewCount: 23,
    isActive: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-20',
    seller: {
      id: 1,
      name: 'CryptoExpert',
      username: 'crypto_expert',
      avatar: '/avatars/user1.png',
      rating: 4.9,
      isVerified: true
    }
  },
  {
    id: 2,
    name: 'Trading Bot Pro',
    description: 'Bot de trading automatisé pour crypto-monnaies',
    priceBtc: 0.1,
    priceEur: 2500,
    category: 'Outils',
    tags: ['trading', 'bot', 'automatisation'],
    images: ['https://images.unsplash.com/photo-1639762592881-6166a9b8475a?w=400'],
    inStock: true,
    stockQuantity: 50,
    deliveryTime: 'Instant',
    digitalProduct: true,
    downloadUrl: 'https://example.com/bot.zip',
    viewCount: 892,
    salesCount: 32,
    rating: 4.9,
    reviewCount: 18,
    isActive: true,
    createdAt: '2024-01-08',
    updatedAt: '2024-01-18',
    seller: {
      id: 2,
      name: 'BotMaster',
      username: 'bot_master',
      avatar: '/avatars/user2.png',
      rating: 4.8,
      isVerified: true
    }
  },
  {
    id: 3,
    name: 'VPN Premium',
    description: 'Service VPN premium avec cryptage militaire',
    priceBtc: 0.05,
    priceEur: 1250,
    category: 'Sécurité',
    tags: ['vpn', 'sécurité', 'privacy'],
    images: ['https://images.unsplash.com/photo-1639762592881-6166a9b8475a?w=400'],
    inStock: true,
    stockQuantity: 100,
    deliveryTime: 'Instant',
    digitalProduct: true,
    downloadUrl: 'https://example.com/vpn-setup.zip',
    viewCount: 756,
    salesCount: 28,
    rating: 4.7,
    reviewCount: 15,
    isActive: true,
    createdAt: '2024-01-12',
    updatedAt: '2024-01-19',
    seller: {
      id: 3,
      name: 'PrivacyFirst',
      username: 'privacy_first',
      avatar: '/avatars/user3.png',
      rating: 4.7,
      isVerified: true
    }
  },
  {
    id: 4,
    name: 'Crypto Course',
    description: 'Cours complet sur les crypto-monnaies et la blockchain',
    priceBtc: 0.05,
    priceEur: 1250,
    category: 'Éducation',
    tags: ['crypto', 'blockchain', 'cours'],
    images: ['https://images.unsplash.com/photo-1639762592881-6166a9b8475a?w=400'],
    inStock: false,
    stockQuantity: 0,
    deliveryTime: 'Instant',
    digitalProduct: true,
    downloadUrl: 'https://example.com/course.zip',
    viewCount: 623,
    salesCount: 24,
    rating: 4.6,
    reviewCount: 12,
    isActive: false,
    createdAt: '2024-01-05',
    updatedAt: '2024-01-15',
    seller: {
      id: 4,
      name: 'EduCrypto',
      username: 'edu_crypto',
      avatar: '/avatars/user4.png',
      rating: 4.6,
      isVerified: true
    }
  },
  {
    id: 5,
    name: 'Security Tools',
    description: 'Outils de sécurité avancés pour protéger vos crypto',
    priceBtc: 0.05,
    priceEur: 1250,
    category: 'Sécurité',
    tags: ['sécurité', 'outils', 'protection'],
    images: ['https://images.unsplash.com/photo-1639762592881-6166a9b8475a?w=400'],
    inStock: true,
    stockQuantity: 75,
    deliveryTime: 'Instant',
    digitalProduct: true,
    downloadUrl: 'https://example.com/tools.zip',
    viewCount: 445,
    salesCount: 18,
    rating: 4.5,
    reviewCount: 9,
    isActive: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    seller: {
      id: 5,
      name: 'SecureDev',
      username: 'secure_dev',
      avatar: '/avatars/user5.png',
      rating: 4.5,
      isVerified: false
    }
  },
];

function ProductStatusBadge({ isActive, inStock }) {
  if (!isActive) {
    return (
      <Badge variant="destructive">
        <XCircle className="h-3 w-3 mr-1" />
        Inactif
      </Badge>
    );
  } else if (!inStock) {
    return (
      <Badge variant="secondary">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Rupture de stock
      </Badge>
    );
  } else {
    return (
      <Badge variant="default">
        <CheckCircle className="h-3 w-3 mr-1" />
        Actif
      </Badge>
    );
  }
}

function ProductTypeBadge({ digitalProduct }) {
  return (
    <Badge variant={digitalProduct ? "default" : "outline"}>
      {digitalProduct ? (
        <>
          <Download className="h-3 w-3 mr-1" />
          Numérique
        </>
      ) : (
        <>
          <Package className="h-3 w-3 mr-1" />
          Physique
        </>
      )}
    </Badge>
  );
}

function ProductTableRow({ product, onView, onEdit, onDelete }) {
  return (
    <tr className="hover:bg-muted/50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-muted rounded-lg mr-3 flex-shrink-0">
            {product.images && product.images.length > 0 ? (
              <img 
                src={product.images[0]} 
                alt={product.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <Package className="w-8 h-8 m-2 text-muted-foreground" />
            )}
          </div>
          <div>
            <div className="text-sm font-medium">{product.name}</div>
            <div className="text-sm text-muted-foreground">{product.category}</div>
            <div className="flex items-center space-x-1 mt-1">
              <ProductTypeBadge digitalProduct={product.digitalProduct} />
              <ProductStatusBadge isActive={product.isActive} inStock={product.inStock} />
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm">
          <div className="flex items-center space-x-1">
            <Bitcoin className="h-3 w-3 text-orange-500" />
            <span className="font-medium">{product.priceBtc} BTC</span>
          </div>
          <div className="text-muted-foreground">€{product.priceEur.toLocaleString()}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm">
          <div className="flex items-center space-x-1">
            <User className="h-3 w-3" />
            <span>{product.seller.name}</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{product.seller.rating}</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm">
          <div className="flex items-center space-x-1">
            <ShoppingCart className="h-3 w-3" />
            <span>{product.salesCount}</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <BarChart3 className="h-3 w-3" />
            <span>{product.viewCount} vues</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm">
          <div className="flex items-center space-x-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{product.rating}</span>
          </div>
          <div className="text-xs text-muted-foreground">{product.reviewCount} avis</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-muted-foreground">
          <div>{new Date(product.createdAt).toLocaleDateString('fr-FR')}</div>
          <div className="text-xs">Stock: {product.stockQuantity}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          <Button variant="ghost" size="sm" onClick={() => onView(product)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(product)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(product)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState(mockProducts);
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Filtrage des produits
  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.seller.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(product => product.isActive && product.inStock);
      } else if (statusFilter === 'inactive') {
        filtered = filtered.filter(product => !product.isActive);
      } else if (statusFilter === 'out_of_stock') {
        filtered = filtered.filter(product => !product.inStock);
      }
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, categoryFilter, statusFilter]);

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    console.log('View product:', product);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    console.log('Edit product:', product);
  };

  const handleDeleteProduct = (product) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le produit "${product.name}" ?`)) {
      setProducts(products.filter(p => p.id !== product.id));
    }
  };

  const handleExportProducts = () => {
    console.log('Export products');
  };

  // Get unique categories
  const categories = [...new Set(products.map(p => p.category))];

  const stats = {
    total: products.length,
    active: products.filter(p => p.isActive && p.inStock).length,
    inactive: products.filter(p => !p.isActive).length,
    outOfStock: products.filter(p => !p.inStock).length,
    digital: products.filter(p => p.digitalProduct).length,
    totalSales: products.reduce((sum, p) => sum + p.salesCount, 0),
    totalRevenue: products.reduce((sum, p) => sum + (p.salesCount * p.priceBtc), 0),
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold">Gestion des produits</h1>
            <p className="text-muted-foreground">
              Gérez tous les produits de la marketplace
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleExportProducts}>
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un produit
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.active}</p>
                  <p className="text-xs text-muted-foreground">Actifs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.inactive}</p>
                  <p className="text-xs text-muted-foreground">Inactifs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.outOfStock}</p>
                  <p className="text-xs text-muted-foreground">Rupture</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Download className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.digital}</p>
                  <p className="text-xs text-muted-foreground">Numériques</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Bitcoin className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">BTC total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom, description ou vendeur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actifs</SelectItem>
                  <SelectItem value="inactive">Inactifs</SelectItem>
                  <SelectItem value="out_of_stock">Rupture de stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des produits</CardTitle>
            <CardDescription>
              {filteredProducts.length} produit(s) trouvé(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Produit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Prix
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Vendeur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Ventes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Notes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProducts.map((product) => (
                    <ProductTableRow
                      key={product.id}
                      product={product}
                      onView={handleViewProduct}
                      onEdit={handleEditProduct}
                      onDelete={handleDeleteProduct}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucun produit trouvé</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Details Modal (placeholder) */}
        {selectedProduct && (
          <Card>
            <CardHeader>
              <CardTitle>Détails du produit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Informations générales</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Nom:</span> {selectedProduct.name}</div>
                    <div><span className="font-medium">Description:</span> {selectedProduct.description}</div>
                    <div><span className="font-medium">Catégorie:</span> {selectedProduct.category}</div>
                    <div><span className="font-medium">Tags:</span> {selectedProduct.tags.join(', ')}</div>
                    <div><span className="font-medium">Type:</span> {selectedProduct.digitalProduct ? 'Numérique' : 'Physique'}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Informations de vente</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Prix BTC:</span> {selectedProduct.priceBtc} BTC</div>
                    <div><span className="font-medium">Prix EUR:</span> €{selectedProduct.priceEur.toLocaleString()}</div>
                    <div><span className="font-medium">Stock:</span> {selectedProduct.stockQuantity}</div>
                    <div><span className="font-medium">Livraison:</span> {selectedProduct.deliveryTime}</div>
                    <div><span className="font-medium">Vues:</span> {selectedProduct.viewCount}</div>
                    <div><span className="font-medium">Ventes:</span> {selectedProduct.salesCount}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}