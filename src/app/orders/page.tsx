'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Navbar } from '@/components/layout/navbar';
import { OrderCard } from '@/components/marketplace/order-card';
import { Search, Package, Truck, CheckCircle, Clock, AlertCircle, Filter, Calendar, TrendingUp, Download, MessageSquare } from 'lucide-react';

type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  product: {
    id: string;
    name: string;
    image: string;
  };
  seller: {
    name: string;
    avatar: string;
    id: string;
  };
  price: {
    btc: number;
    eur: number;
  };
  quantity: number;
  orderDate: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  totalAmount: {
    btc: number;
    eur: number;
  };
  paymentMethod: 'bitcoin';
  shippingAddress?: string;
  notes?: string;
}

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'CS-2024-001',
    status: 'delivered',
    product: {
      id: '1',
      name: 'Premium VPN Subscription',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop',
    },
    seller: {
      name: 'SecureNet',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      id: 'seller1',
    },
    price: { btc: 0.0025, eur: 89.99 },
    quantity: 1,
    orderDate: '2024-01-15T14:30:00Z',
    estimatedDelivery: '2024-01-15',
    totalAmount: { btc: 0.0025, eur: 89.99 },
    paymentMethod: 'bitcoin',
    notes: 'Digital product delivered instantly',
  },
  {
    id: '2',
    orderNumber: 'CS-2024-002',
    status: 'shipped',
    product: {
      id: '2',
      name: 'Adobe Creative Suite License',
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=100&h=100&fit=crop',
    },
    seller: {
      name: 'SoftwarePro',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      id: 'seller2',
    },
    price: { btc: 0.015, eur: 549.99 },
    quantity: 1,
    orderDate: '2024-01-12T09:15:00Z',
    estimatedDelivery: '2024-01-20',
    trackingNumber: 'TRK123456789',
    totalAmount: { btc: 0.015, eur: 549.99 },
    paymentMethod: 'bitcoin',
  },
  {
    id: '3',
    orderNumber: 'CS-2024-003',
    status: 'paid',
    product: {
      id: '3',
      name: 'Cryptocurrency Trading Course',
      image: 'https://images.unsplash.com/photo-1639762582714-0bcfe22d1ac0?w=100&h=100&fit=crop',
    },
    seller: {
      name: 'CryptoMaster',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop',
      id: 'seller3',
    },
    price: { btc: 0.005, eur: 179.99 },
    quantity: 2,
    orderDate: '2024-01-10T16:45:00Z',
    estimatedDelivery: '2024-01-10',
    totalAmount: { btc: 0.01, eur: 359.98 },
    paymentMethod: 'bitcoin',
    notes: 'Digital course access granted',
  },
  {
    id: '4',
    orderNumber: 'CS-2024-004',
    status: 'pending',
    product: {
      id: '4',
      name: 'Gaming PC Setup Guide',
      image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=100&h=100&fit=crop',
    },
    seller: {
      name: 'TechGuru',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop',
      id: 'seller4',
    },
    price: { btc: 0.001, eur: 34.99 },
    quantity: 1,
    orderDate: '2024-01-08T11:20:00Z',
    estimatedDelivery: '2024-01-08',
    totalAmount: { btc: 0.001, eur: 34.99 },
    paymentMethod: 'bitcoin',
  },
  {
    id: '5',
    orderNumber: 'CS-2024-005',
    status: 'cancelled',
    product: {
      id: '5',
      name: 'Custom Logo Design',
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=100&h=100&fit=crop',
    },
    seller: {
      name: 'DesignStudio',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
      id: 'seller5',
    },
    price: { btc: 0.003, eur: 109.99 },
    quantity: 1,
    orderDate: '2024-01-05T13:00:00Z',
    totalAmount: { btc: 0.003, eur: 109.99 },
    paymentMethod: 'bitcoin',
    notes: 'Cancelled by customer request',
  },
];

const orderStats = {
  total: 24,
  pending: 3,
  paid: 5,
  shipped: 8,
  delivered: 7,
  cancelled: 1,
  totalSpent: { btc: 0.1234, eur: 4442.4 },
};

const statusConfig = {
  pending: {
    label: 'Pending Payment',
    color: 'bg-yellow-500',
    icon: Clock,
  },
  paid: {
    label: 'Paid',
    color: 'bg-blue-500',
    icon: CheckCircle,
  },
  shipped: {
    label: 'Shipped',
    color: 'bg-purple-500',
    icon: Truck,
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-green-500',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-500',
    icon: AlertCircle,
  },
};

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [activeTab, setActiveTab] = useState('all');

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.seller.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
      case 'date-asc':
        return new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime();
      case 'amount-desc':
        return b.totalAmount.btc - a.totalAmount.btc;
      case 'amount-asc':
        return a.totalAmount.btc - b.totalAmount.btc;
      default:
        return 0;
    }
  });

  const getOrdersByStatus = (status: OrderStatus | 'all') => {
    if (status === 'all') return sortedOrders;
    return sortedOrders.filter(order => order.status === status);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number, currency: 'btc' | 'eur') => {
    if (currency === 'btc') {
      return amount.toFixed(6);
    }
    return amount.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">My Orders</h1>
              <p className="text-muted-foreground">Track your orders and manage purchases</p>
            </div>

            {/* Order Stats */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{orderStats.total}</div>
                  <p className="text-xs text-muted-foreground">All orders</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{orderStats.pending}</div>
                  <p className="text-xs text-muted-foreground">Awaiting payment</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Paid</CardTitle>
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{orderStats.paid}</div>
                  <p className="text-xs text-muted-foreground">Payment confirmed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Shipped</CardTitle>
                  <Truck className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{orderStats.shipped}</div>
                  <p className="text-xs text-muted-foreground">In transit</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Delivered</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{orderStats.delivered}</div>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold">
                    {formatCurrency(orderStats.totalSpent.btc, 'btc')} BTC
                  </div>
                  <p className="text-xs text-muted-foreground">
                    €{formatCurrency(orderStats.totalSpent.eur, 'eur')}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | 'all')}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Newest First</SelectItem>
                    <SelectItem value="date-asc">Oldest First</SelectItem>
                    <SelectItem value="amount-desc">Highest Amount</SelectItem>
                    <SelectItem value="amount-asc">Lowest Amount</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Results */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-muted-foreground">
                {sortedOrders.length} order{sortedOrders.length !== 1 ? 's' : ''} found
              </p>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>

            {/* Orders Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="all">All ({getOrdersByStatus('all').length})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({getOrdersByStatus('pending').length})</TabsTrigger>
                <TabsTrigger value="paid">Paid ({getOrdersByStatus('paid').length})</TabsTrigger>
                <TabsTrigger value="shipped">Shipped ({getOrdersByStatus('shipped').length})</TabsTrigger>
                <TabsTrigger value="delivered">Delivered ({getOrdersByStatus('delivered').length})</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled ({getOrdersByStatus('cancelled').length})</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                <div className="space-y-4">
                  {getOrdersByStatus(activeTab as OrderStatus | 'all').map((order) => (
                    <OrderCard
                      key={order.id}
                      {...order}
                      onViewDetails={(id) => console.log('View order details:', id)}
                      onContactSeller={(sellerId) => console.log('Contact seller:', sellerId)}
                      onTrackOrder={(id) => console.log('Track order:', id)}
                    />
                  ))}
                </div>

                {getOrdersByStatus(activeTab as OrderStatus | 'all').length === 0 && (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                    <p className="text-muted-foreground mb-4">
                      {activeTab === 'all' 
                        ? "You haven't placed any orders yet." 
                        : `You don't have any ${activeTab} orders.`
                      }
                    </p>
                    <Button onClick={() => window.location.href = '/market'}>
                      Browse Products
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
  );
}