'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Package, Truck, CheckCircle, Clock, AlertCircle, Bitcoin, Euro, MessageSquare, Eye } from 'lucide-react';

type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

interface OrderCardProps {
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
  };
  price: {
    btc: number;
    eur: number;
  };
  quantity: number;
  orderDate: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  onViewDetails?: (id: string) => void;
  onContactSeller?: (sellerId: string) => void;
  onTrackOrder?: (id: string) => void;
}

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

export function OrderCard({
  id,
  orderNumber,
  status,
  product,
  seller,
  price,
  quantity,
  orderDate,
  estimatedDelivery,
  trackingNumber,
  onViewDetails,
  onContactSeller,
  onTrackOrder,
}: OrderCardProps) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold">Order #{orderNumber}</h3>
              <Badge className={`${config.color} text-white`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {config.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{orderDate}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-lg font-bold text-primary">
              <Bitcoin className="h-5 w-5" />
              <span>{(price.btc * quantity).toFixed(6)}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Euro className="h-4 w-4" />
              <span>€{(price.eur * quantity).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 rounded-lg overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="flex-1">
            <h4 className="font-medium line-clamp-1">{product.name}</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Avatar className="h-6 w-6">
                <AvatarImage src={seller.avatar} alt={seller.name} />
                <AvatarFallback className="text-xs">
                  {seller.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{seller.name}</span>
            </div>
            <p className="text-sm text-muted-foreground">Quantity: {quantity}</p>
          </div>
        </div>

        {estimatedDelivery && status !== 'cancelled' && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Estimated delivery:</span>
            <span className="font-medium">{estimatedDelivery}</span>
          </div>
        )}

        {trackingNumber && (status === 'shipped' || status === 'delivered') && (
          <div className="flex items-center gap-2 text-sm">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Tracking:</span>
            <span className="font-medium">{trackingNumber}</span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onViewDetails?.(id)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onContactSeller?.(seller.name)}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Contact
          </Button>
          {(status === 'shipped' || status === 'delivered') && trackingNumber && (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onTrackOrder?.(id)}
            >
              <Truck className="h-4 w-4 mr-1" />
              Track
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}