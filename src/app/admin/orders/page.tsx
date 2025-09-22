'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminLayout } from '@/components/layout/admin-layout';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Package, 
  Bitcoin, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Truck, 
  AlertTriangle,
  User,
  Calendar,
  BarChart3,
  MoreHorizontal,
  RefreshCw,
  MapPin,
  CreditCard,
  FileText
} from 'lucide-react';

// Mock data pour les commandes
const mockOrders = [
  {
    id: 'ORD-001',
    buyerId: 1,
    buyer: {
      username: 'johndoe',
      email: 'john@example.com',
      avatar: '/avatars/user1.png'
    },
    status: 'PENDING',
    totalBtc: 0.05,
    totalEur: 1250,
    paymentHash: 'tx123456789abcdef',
    paymentConfirmed: false,
    createdAt: '2024-01-20T10:30:00Z',
    updatedAt: '2024-01-20T10:30:00Z',
    completedAt: null,
    items: [
      {
        id: 1,
        productId: 'P001',
        name: 'Bitcoin Mining Guide',
        quantity: 1,
        priceBtc: 0.05,
        priceEur: 1250,
        seller: {
          id: 1,
          name: 'CryptoExpert',
          username: 'crypto_expert'
        }
      }
    ],
    escrowTransaction: {
      id: 'ESC-001',
      amountBtc: 0.05,
      amountEur: 1250,
      status: 'PENDING',
      disputeRaised: false
    }
  },
  {
    id: 'ORD-002',
    buyerId: 2,
    buyer: {
      username: 'alice_smith',
      email: 'alice@example.com',
      avatar: '/avatars/user2.png'
    },
    status: 'PAID',
    totalBtc: 0.1,
    totalEur: 2500,
    paymentHash: 'tx987654321fedcba',
    paymentConfirmed: true,
    createdAt: '2024-01-19T14:15:00Z',
    updatedAt: '2024-01-19T14:20:00Z',
    completedAt: null,
    items: [
      {
        id: 2,
        productId: 'P002',
        name: 'Trading Bot Pro',
        quantity: 1,
        priceBtc: 0.1,
        priceEur: 2500,
        seller: {
          id: 2,
          name: 'BotMaster',
          username: 'bot_master'
        }
      }
    ],
    escrowTransaction: {
      id: 'ESC-002',
      amountBtc: 0.1,
      amountEur: 2500,
      status: 'FUNDED',
      disputeRaised: false
    }
  },
  {
    id: 'ORD-003',
    buyerId: 3,
    buyer: {
      username: 'crypto_expert',
      email: 'expert@crypto.com',
      avatar: '/avatars/user3.png'
    },
    status: 'CONFIRMED',
    totalBtc: 0.05,
    totalEur: 1250,
    paymentHash: 'txabcdef123456789',
    paymentConfirmed: true,
    createdAt: '2024-01-18T09:00:00Z',
    updatedAt: '2024-01-18T09:30:00Z',
    completedAt: null,
    items: [
      {
        id: 3,
        productId: 'P003',
        name: 'VPN Premium',
        quantity: 1,
        priceBtc: 0.05,
        priceEur: 1250,
        seller: {
          id: 3,
          name: 'PrivacyFirst',
          username: 'privacy_first'
        }
      }
    ],
    escrowTransaction: {
      id: 'ESC-003',
      amountBtc: 0.05,
      amountEur: 1250,
      status: 'CONFIRMED',
      disputeRaised: false
    }
  },
  {
    id: 'ORD-004',
    buyerId: 4,
    buyer: {
      username: 'bob_wilson',
      email: 'bob@example.com',
      avatar: '/avatars/user4.png'
    },
    status: 'SHIPPED',
    totalBtc: 0.15,
    totalEur: 3750,
    paymentHash: 'tx456789abcdef123',
    paymentConfirmed: true,
    createdAt: '2024-01-17T16:45:00Z',
    updatedAt: '2024-01-18T10:00:00Z',
    completedAt: null,
    items: [
      {
        id: 4,
        productId: 'P004',
        name: 'Crypto Course',
        quantity: 1,
        priceBtc: 0.05,
        priceEur: 1250,
        seller: {
          id: 4,
          name: 'EduCrypto',
          username: 'edu_crypto'
        }
      },
      {
        id: 5,
        productId: 'P005',
        name: 'Security Tools',
        quantity: 2,
        priceBtc: 0.05,
        priceEur: 1250,
        seller: {
          id: 5,
          name: 'SecureDev',
          username: 'secure_dev'
        }
      }
    ],
    escrowTransaction: {
      id: 'ESC-004',
      amountBtc: 0.15,
      amountEur: 3750,
      status: 'CONFIRMED',
      disputeRaised: false
    }
  },
  {
    id: 'ORD-005',
    buyerId: 5,
    buyer: {
      username: 'emma_davis',
      email: 'emma@example.com',
      avatar: '/avatars/user5.png'
    },
    status: 'DELIVERED',
    totalBtc: 0.08,
    totalEur: 2000,
    paymentHash: 'tx789123456cdefab',
    paymentConfirmed: true,
    createdAt: '2024-01-15T11:20:00Z',
    updatedAt: '2024-01-16T15:30:00Z',
    completedAt: '2024-01-16T15:30:00Z',
    items: [
      {
        id: 6,
        productId: 'P006',
        name: 'Advanced Trading Strategies',
        quantity: 1,
        priceBtc: 0.08,
        priceEur: 2000,
        seller: {
          id: 1,
          name: 'CryptoExpert',
          username: 'crypto_expert'
        }
      }
    ],
    escrowTransaction: {
      id: 'ESC-005',
      amountBtc: 0.08,
      amountEur: 2000,
      status: 'RELEASED',
      disputeRaised: false
    }
  },
];

function OrderStatusBadge({ status }) {
  const statusConfig = {
    PENDING: { label: 'En attente', variant: 'secondary', icon: Clock },
    PAID: { label: 'Payée', variant: 'default', icon: CreditCard },
    CONFIRMED: { label: 'Confirmée', variant: 'default', icon: CheckCircle },
    SHIPPED: { label: 'Expédiée', variant: 'default', icon: Truck },
    DELIVERED: { label: 'Livrée', variant: 'default', icon: Package },
    CANCELLED: { label: 'Annulée', variant: 'destructive', icon: XCircle },
    REFUNDED: { label: 'Remboursée', variant: 'outline', icon: RefreshCw },
  };

  const config = statusConfig[status] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center space-x-1">
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </Badge>
  );
}

function PaymentStatusBadge({ paymentConfirmed }) {
  return (
    <Badge variant={paymentConfirmed ? "default" : "secondary"}>
      {paymentConfirmed ? (
        <>
          <CheckCircle className="h-3 w-3 mr-1" />
          Confirmé
        </>
      ) : (
        <>
          <Clock className="h-3 w-3 mr-1" />
          En attente
        </>
      )}
    </Badge>
  );
}

function OrderTableRow({ order, onView, onEdit, onDelete }) {
  return (
    <tr className="hover:bg-muted/50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium">{order.id}</div>
        <div className="text-sm text-muted-foreground">
          {new Date(order.createdAt).toLocaleDateString('fr-FR')}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center mr-3">
            {order.buyer.avatar ? (
              <img src={order.buyer.avatar} alt={order.buyer.username} className="w-8 h-8 rounded-full" />
            ) : (
              <span className="text-sm font-medium">
                {order.buyer.username.substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <div className="text-sm font-medium">{order.buyer.username}</div>
            <div className="text-sm text-muted-foreground">{order.buyer.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm">
          <div className="flex items-center space-x-1">
            <Bitcoin className="h-3 w-3 text-orange-500" />
            <span className="font-medium">{order.totalBtc} BTC</span>
          </div>
          <div className="text-muted-foreground">€{order.totalEur.toLocaleString()}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="space-y-1">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge paymentConfirmed={order.paymentConfirmed} />
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm">
          <div className="flex items-center space-x-1">
            <Package className="h-3 w-3" />
            <span>{order.items.length} article(s)</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {order.items.map(item => item.name).join(', ')}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-muted-foreground">
          {order.paymentHash && (
            <div className="font-mono text-xs bg-muted p-1 rounded">
              {order.paymentHash.substring(0, 10)}...
            </div>
          )}
          {order.completedAt && (
            <div className="text-xs">
              Terminé: {new Date(order.completedAt).toLocaleDateString('fr-FR')}
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          <Button variant="ghost" size="sm" onClick={() => onView(order)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(order)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(order)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState(mockOrders);
  const [filteredOrders, setFilteredOrders] = useState(mockOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Filtrage des commandes
  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.buyer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.buyer.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (paymentFilter !== 'all') {
      filtered = filtered.filter(order => 
        paymentFilter === 'confirmed' ? order.paymentConfirmed : !order.paymentConfirmed
      );
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, paymentFilter]);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    console.log('View order:', order);
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    console.log('Edit order:', order);
  };

  const handleDeleteOrder = (order) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la commande ${order.id} ?`)) {
      setOrders(orders.filter(o => o.id !== order.id));
    }
  };

  const handleExportOrders = () => {
    console.log('Export orders');
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
        : order
    ));
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    paid: orders.filter(o => o.status === 'PAID').length,
    confirmed: orders.filter(o => o.status === 'CONFIRMED').length,
    shipped: orders.filter(o => o.status === 'SHIPPED').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
    totalRevenue: orders.reduce((sum, o) => sum + o.totalEur, 0),
    totalBtc: orders.reduce((sum, o) => sum + o.totalBtc, 0),
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold">Gestion des commandes</h1>
            <p className="text-muted-foreground">
              Gérez toutes les commandes de la marketplace
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleExportOrders}>
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-4 w-4 text-blue-500" />
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
                <Clock className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">En attente</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.paid}</p>
                  <p className="text-xs text-muted-foreground">Payées</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.confirmed}</p>
                  <p className="text-xs text-muted-foreground">Confirmées</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Truck className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.shipped}</p>
                  <p className="text-xs text-muted-foreground">Expédiées</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.delivered}</p>
                  <p className="text-xs text-muted-foreground">Livrées</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Bitcoin className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalBtc.toFixed(2)}</p>
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
                    placeholder="Rechercher par ID, client ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Statut commande" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="PENDING">En attente</SelectItem>
                  <SelectItem value="PAID">Payées</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmées</SelectItem>
                  <SelectItem value="SHIPPED">Expédiées</SelectItem>
                  <SelectItem value="DELIVERED">Livrées</SelectItem>
                  <SelectItem value="CANCELLED">Annulées</SelectItem>
                  <SelectItem value="REFUNDED">Remboursées</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Statut paiement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les paiements</SelectItem>
                  <SelectItem value="confirmed">Confirmés</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des commandes</CardTitle>
            <CardDescription>
              {filteredOrders.length} commande(s) trouvée(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Commande
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Articles
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Paiement
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredOrders.map((order) => (
                    <OrderTableRow
                      key={order.id}
                      order={order}
                      onView={handleViewOrder}
                      onEdit={handleEditOrder}
                      onDelete={handleDeleteOrder}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredOrders.length === 0 && (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune commande trouvée</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Details Modal (placeholder) */}
        {selectedOrder && (
          <Card>
            <CardHeader>
              <CardTitle>Détails de la commande {selectedOrder.id}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Informations client</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Nom:</span> {selectedOrder.buyer.username}</div>
                    <div><span className="font-medium">Email:</span> {selectedOrder.buyer.email}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Informations commande</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Statut:</span> <OrderStatusBadge status={selectedOrder.status} /></div>
                    <div><span className="font-medium">Paiement:</span> <PaymentStatusBadge paymentConfirmed={selectedOrder.paymentConfirmed} /></div>
                    <div><span className="font-medium">Créée le:</span> {new Date(selectedOrder.createdAt).toLocaleString('fr-FR')}</div>
                    <div><span className="font-medium">Montant:</span> {selectedOrder.totalBtc} BTC (€{selectedOrder.totalEur.toLocaleString()})</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Articles commandés</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">Vendeur: {item.seller.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{item.quantity} x {item.priceBtc} BTC</div>
                        <div className="text-sm text-muted-foreground">€{item.priceEur.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}