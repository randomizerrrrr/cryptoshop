'use client';

import { TrendingUp, Package, DollarSign, Users, ShoppingCart, Star, Clock, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SidebarStatsProps {
  currentPage: string;
}

export function Sidebar({ currentPage }: SidebarStatsProps) {
  const getStatsForPage = () => {
    switch (currentPage) {
      case 'market':
        return [
          {
            title: 'Total Products',
            value: '2,847',
            description: '+12% from last week',
            icon: Package,
            trend: 'up',
          },
          {
            title: 'Active Sellers',
            value: '342',
            description: '+8% from last week',
            icon: Users,
            trend: 'up',
          },
          {
            title: 'Avg. Price',
            value: '0.0234 BTC',
            description: '-2% from last week',
            icon: DollarSign,
            trend: 'down',
          },
          {
            title: 'Top Category',
            value: 'Electronics',
            description: '45% of sales',
            icon: TrendingUp,
            trend: 'up',
          },
        ];
      case 'wallet':
        return [
          {
            title: 'BTC Balance',
            value: '1.2345 BTC',
            description: '+0.05 BTC today',
            icon: DollarSign,
            trend: 'up',
          },
          {
            title: 'EUR Value',
            value: '€45,678',
            description: '+€1,234 today',
            icon: TrendingUp,
            trend: 'up',
          },
          {
            title: 'Pending Deposits',
            value: '0.0000 BTC',
            description: 'All deposits confirmed',
            icon: Clock,
            trend: 'stable',
          },
          {
            title: 'Total Transactions',
            value: '156',
            description: 'This month',
            icon: CheckCircle,
            trend: 'up',
          },
        ];
      case 'orders':
        return [
          {
            title: 'Total Orders',
            value: '24',
            description: 'All time',
            icon: ShoppingCart,
            trend: 'up',
          },
          {
            title: 'Pending',
            value: '3',
            description: 'Awaiting payment',
            icon: Clock,
            trend: 'stable',
          },
          {
            title: 'Completed',
            value: '18',
            description: 'Successfully delivered',
            icon: CheckCircle,
            trend: 'up',
          },
          {
            title: 'Issues',
            value: '3',
            description: 'Need attention',
            icon: AlertCircle,
            trend: 'down',
          },
        ];
      case 'sellers':
        return [
          {
            title: 'Total Sellers',
            value: '342',
            description: '+15 this week',
            icon: Users,
            trend: 'up',
          },
          {
            title: 'Top Rated',
            value: '4.8/5',
            description: 'Average rating',
            icon: Star,
            trend: 'up',
          },
          {
            title: 'Total Sales',
            value: '€2.3M',
            description: 'This month',
            icon: DollarSign,
            trend: 'up',
          },
          {
            title: 'Active Now',
            value: '89',
            description: 'Online sellers',
            icon: CheckCircle,
            trend: 'up',
          },
        ];
      case 'support':
        return [
          {
            title: 'Open Tickets',
            value: '12',
            description: 'Awaiting response',
            icon: AlertCircle,
            trend: 'down',
          },
          {
            title: 'Avg Response',
            value: '2.3h',
            description: 'Response time',
            icon: Clock,
            trend: 'down',
          },
          {
            title: 'Satisfaction',
            value: '94%',
            description: 'Customer satisfaction',
            icon: Star,
            trend: 'up',
          },
          {
            title: 'Resolved Today',
            value: '8',
            description: 'Tickets closed',
            icon: CheckCircle,
            trend: 'up',
          },
        ];
      case 'escrow':
        return [
          {
            title: 'Active Escrow',
            value: '89',
            description: 'Transactions in progress',
            icon: Shield,
            trend: 'up',
          },
          {
            title: 'Total Value',
            value: '12.3 BTC',
            description: 'Currently secured',
            icon: DollarSign,
            trend: 'up',
          },
          {
            title: 'Disputes',
            value: '5',
            description: 'Under review',
            icon: AlertCircle,
            trend: 'down',
          },
          {
            title: 'Success Rate',
            value: '98%',
            description: 'Successfully resolved',
            icon: CheckCircle,
            trend: 'up',
          },
        ];
      default:
        return [
          {
            title: 'Platform Stats',
            value: '24/7',
            description: 'Always available',
            icon: CheckCircle,
            trend: 'stable',
          },
          {
            title: 'Security',
            value: '100%',
            description: 'Secure transactions',
            icon: CheckCircle,
            trend: 'stable',
          },
          {
            title: 'Anonymity',
            value: '✓',
            description: 'Private & secure',
            icon: CheckCircle,
            trend: 'stable',
          },
          {
            title: 'Support',
            value: '24/7',
            description: 'Always here to help',
            icon: CheckCircle,
            trend: 'stable',
          },
        ];
    }
  };

  const stats = getStatsForPage();

  return (
    <div className="w-80 bg-background border-r p-6 space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold tracking-tight">Statistics</h2>
        <p className="text-sm text-muted-foreground">
          {currentPage === 'market' && 'Market overview and trends'}
          {currentPage === 'wallet' && 'Your wallet statistics'}
          {currentPage === 'orders' && 'Your order status overview'}
          {currentPage === 'sellers' && 'Seller platform statistics'}
          {currentPage === 'support' && 'Support ticket metrics'}
          {currentPage === 'escrow' && 'Escrow transaction security'}
          {currentPage === 'product' && 'Product performance'}
          {currentPage === 'cart' && 'Shopping cart summary'}
          {currentPage === 'checkout' && 'Checkout process'}
          {currentPage === 'register' && 'Registration stats'}
          {currentPage === 'login' && 'Login security'}
        </p>
      </div>

      <div className="space-y-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  {stat.description}
                  {stat.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                  {stat.trend === 'down' && <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}