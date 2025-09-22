'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AdminLayout } from '@/components/layout/admin-layout';
import { 
  Users, 
  ShoppingCart, 
  Bitcoin, 
  TrendingUp, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Shield,
  DollarSign,
  Package,
  Headphones,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

// Mock data pour le dashboard
const mockStats = {
  totalUsers: 1234,
  activeUsers: 856,
  totalOrders: 567,
  pendingOrders: 23,
  totalRevenue: 45231,
  monthlyRevenue: 12350,
  bitcoinVolume: 12.5,
  pendingTransactions: 2,
  totalProducts: 234,
  activeProducts: 189,
  supportTickets: 45,
  pendingTickets: 12,
};

const recentActivity = [
  {
    id: 1,
    type: 'order',
    title: 'Nouvelle commande',
    description: 'Commande #1234 de 0.5 BTC',
    user: 'John Doe',
    time: 'Il y a 5 minutes',
    status: 'pending',
    amount: '0.5 BTC'
  },
  {
    id: 2,
    type: 'payment',
    title: 'Paiement confirmé',
    description: 'Transaction tx123...confirmée',
    user: 'Alice Smith',
    time: 'Il y a 12 minutes',
    status: 'confirmed',
    amount: '1.2 BTC'
  },
  {
    id: 3,
    type: 'support',
    title: 'Nouveau ticket support',
    description: 'Problème de livraison',
    user: 'Bob Johnson',
    time: 'Il y a 25 minutes',
    status: 'open',
    amount: null
  },
  {
    id: 4,
    type: 'user',
    title: 'Nouveau vendeur',
    description: 'Vendeur vérifié',
    user: 'Emma Wilson',
    time: 'Il y a 1 heure',
    status: 'verified',
    amount: null
  },
  {
    id: 5,
    type: 'product',
    title: 'Nouveau produit',
    description: 'Produit ajouté',
    user: 'Mike Brown',
    time: 'Il y a 2 heures',
    status: 'active',
    amount: null
  },
];

const systemAlerts = [
  {
    id: 1,
    type: 'warning',
    title: 'Transaction en attente',
    description: 'Transaction tx789... en attente de confirmation',
    time: 'Il y a 15 minutes',
    severity: 'medium'
  },
  {
    id: 2,
    type: 'info',
    title: 'Serveur blockchain synchronisé',
    description: 'Dernier bloc: 800000',
    time: 'Il y a 2 minutes',
    severity: 'low'
  },
  {
    id: 3,
    type: 'error',
    title: 'Espace disque faible',
    description: 'Espace disque restant: 15%',
    time: 'Il y a 1 heure',
    severity: 'high'
  },
];

const topProducts = [
  {
    id: 1,
    name: 'Bitcoin Mining Guide',
    sales: 45,
    revenue: '2.25 BTC',
    rating: 4.8,
    seller: 'CryptoExpert'
  },
  {
    id: 2,
    name: 'Trading Bot Pro',
    sales: 32,
    revenue: '3.2 BTC',
    rating: 4.9,
    seller: 'BotMaster'
  },
  {
    id: 3,
    name: 'VPN Premium',
    sales: 28,
    revenue: '1.4 BTC',
    rating: 4.7,
    seller: 'PrivacyFirst'
  },
  {
    id: 4,
    name: 'Crypto Course',
    sales: 24,
    revenue: '1.2 BTC',
    rating: 4.6,
    seller: 'EduCrypto'
  },
  {
    id: 5,
    name: 'Security Tools',
    sales: 18,
    revenue: '0.9 BTC',
    rating: 4.5,
    seller: 'SecureDev'
  },
];

function StatCard({ title, value, change, changeType, icon: Icon, description, color = 'primary' }) {
  const colorClasses = {
    primary: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    orange: 'text-orange-600 bg-orange-50',
    red: 'text-red-600 bg-red-50',
    purple: 'text-purple-600 bg-purple-50',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          {change && (
            <>
              {changeType === 'positive' ? (
                <ArrowUpRight className="h-3 w-3 text-green-500" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500" />
              )}
              <span className={changeType === 'positive' ? 'text-green-500' : 'text-red-500'}>
                {change}
              </span>
            </>
          )}
          <span>{description}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityItem({ activity }) {
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500',
      confirmed: 'bg-green-500',
      open: 'bg-blue-500',
      verified: 'bg-green-500',
      active: 'bg-green-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: 'En attente', variant: 'secondary' },
      confirmed: { label: 'Confirmé', variant: 'default' },
      open: { label: 'Ouvert', variant: 'outline' },
      verified: { label: 'Vérifié', variant: 'default' },
      active: { label: 'Actif', variant: 'default' },
    };
    return badges[status] || { label: status, variant: 'secondary' };
  };

  const getIcon = (type) => {
    const icons = {
      order: ShoppingCart,
      payment: Bitcoin,
      support: Headphones,
      user: Users,
      product: Package,
    };
    return icons[type] || Activity;
  };

  const Icon = getIcon(activity.type);
  const statusBadge = getStatusBadge(activity.status);

  return (
    <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div className={`w-2 h-2 rounded-full ${getStatusColor(activity.status)}`} />
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium truncate">{activity.title}</p>
          <Badge variant={statusBadge.variant} className="text-xs">
            {statusBadge.label}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-muted-foreground">{activity.user}</p>
          <div className="flex items-center space-x-2">
            {activity.amount && (
              <span className="text-xs font-medium text-orange-600">{activity.amount}</span>
            )}
            <span className="text-xs text-muted-foreground">{activity.time}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertItem({ alert }) {
  const getSeverityColor = (severity) => {
    const colors = {
      low: 'bg-blue-500',
      medium: 'bg-yellow-500',
      high: 'bg-red-500',
    };
    return colors[severity] || 'bg-gray-500';
  };

  const getSeverityBadge = (severity) => {
    const badges = {
      low: { label: 'Basse', variant: 'secondary' },
      medium: { label: 'Moyenne', variant: 'outline' },
      high: { label: 'Haute', variant: 'destructive' },
    };
    return badges[severity] || { label: severity, variant: 'secondary' };
  };

  const severityBadge = getSeverityBadge(alert.severity);

  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div className={`w-2 h-2 rounded-full mt-2 ${getSeverityColor(alert.severity)}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{alert.title}</p>
          <Badge variant={severityBadge.variant} className="text-xs">
            {severityBadge.label}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
        <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [bitcoinPrice, setBitcoinPrice] = useState<{ eur: number; usd: number }>({ eur: 42000, usd: 45000 });
  const [networkStats, setNetworkStats] = useState<{ blocks: number; difficulty: number }>({ blocks: 820000, difficulty: 72000000000000 });

  const refreshData = async () => {
    setLoading(true);
    try {
      // Fetch real Bitcoin data
      const [priceResponse, networkResponse] = await Promise.all([
        fetch('/api/bitcoin?type=price'),
        fetch('/api/bitcoin?type=network')
      ]);

      if (priceResponse.ok) {
        const priceData = await priceResponse.json();
        setBitcoinPrice({
          eur: priceData.bitcoin?.eur || 42000,
          usd: priceData.bitcoin?.usd || 45000
        });
      }

      if (networkResponse.ok) {
        const networkData = await networkResponse.json();
        setNetworkStats({
          blocks: networkData.blocks || 820000,
          difficulty: networkData.difficulty || 72000000000000
        });
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching Bitcoin data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    refreshData();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold">Tableau de bord</h1>
            <p className="text-muted-foreground">
              Vue d'ensemble de votre marketplace CryptoShop
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filtres
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
            <Button onClick={refreshData} disabled={loading} size="sm">
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Utilisateurs"
            value={mockStats.totalUsers.toLocaleString()}
            change="+12%"
            changeType="positive"
            icon={Users}
            description="par rapport au mois dernier"
            color="blue"
          />
          <StatCard
            title="Commandes"
            value={mockStats.totalOrders.toLocaleString()}
            change="+8%"
            changeType="positive"
            icon={ShoppingCart}
            description="par rapport au mois dernier"
            color="green"
          />
          <StatCard
            title="Volume Bitcoin"
            value={`${mockStats.bitcoinVolume} BTC`}
            change="+23%"
            changeType="positive"
            icon={Bitcoin}
            description="par rapport au mois dernier"
            color="orange"
          />
          <StatCard
            title="Revenus"
            value={`€${mockStats.totalRevenue.toLocaleString()}`}
            change="+15%"
            changeType="positive"
            icon={DollarSign}
            description="par rapport au mois dernier"
            color="purple"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Utilisateurs actifs"
            value={mockStats.activeUsers.toLocaleString()}
            icon={Activity}
            description="utilisateurs actifs ce mois"
            color="green"
          />
          <StatCard
            title="Commandes en attente"
            value={mockStats.pendingOrders.toString()}
            icon={Clock}
            description="commandes à traiter"
            color="orange"
          />
          <StatCard
            title="Produits actifs"
            value={mockStats.activeProducts.toString()}
            icon={Package}
            description="produits disponibles"
            color="blue"
          />
          <StatCard
            title="Tickets en attente"
            value={mockStats.pendingTickets.toString()}
            icon={Headphones}
            description="tickets à traiter"
            color="red"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Activité récente</CardTitle>
                <CardDescription>
                  Dernières activités sur la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentActivity.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm" className="w-full">
                    Voir toute l'activité
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>Produits populaires</CardTitle>
                <CardDescription>
                  Les produits les plus vendus ce mois
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.seller}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{product.revenue}</p>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{product.rating}</span>
                          <span>•</span>
                          <span>{product.sales} ventes</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Bitcoin Network Status */}
            <Card>
              <CardHeader>
                <CardTitle>Bitcoin Network</CardTitle>
                <CardDescription>
                  Real-time Bitcoin network status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Current Block</span>
                    <span className="font-medium">{networkStats.blocks.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Network Difficulty</span>
                    <span className="font-medium">{(networkStats.difficulty / 1e15).toFixed(2)} P</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">BTC Price (EUR)</span>
                    <span className="font-medium">€{bitcoinPrice.eur.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">BTC Price (USD)</span>
                    <span className="font-medium">${bitcoinPrice.usd.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last Updated</span>
                    <span className="text-xs text-muted-foreground">
                      {lastUpdated.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Alertes système</CardTitle>
                <CardDescription>
                  Notifications et alertes importantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {systemAlerts.map((alert) => (
                    <AlertItem key={alert.id} alert={alert} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
                <CardDescription>
                  Accès rapide aux fonctions courantes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Gérer les utilisateurs
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Package className="mr-2 h-4 w-4" />
                  Vérifier les produits
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Traiter les commandes
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Headphones className="mr-2 h-4 w-4" />
                  Répondre aux tickets
                </Button>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle>État du système</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Serveur web</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">En ligne</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Base de données</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Connectée</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Blockchain</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Synchronisée</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Bitcoin</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Opérationnelle</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-center text-sm text-muted-foreground">
          Dernière mise à jour: {lastUpdated.toLocaleString('fr-FR')}
        </div>
      </div>
    </AdminLayout>
  );
}