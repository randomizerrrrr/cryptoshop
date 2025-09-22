'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Package, CheckCircle, TrendingUp, MessageSquare } from 'lucide-react';

interface SellerCardProps {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviews: number;
  totalProducts: number;
  totalSales: number;
  joinedDate: string;
  isVerified: boolean;
  isOnline: boolean;
  responseTime: string;
  onViewProfile?: (id: string) => void;
  onContact?: (id: string) => void;
}

export function SellerCard({
  id,
  name,
  avatar,
  rating,
  reviews,
  totalProducts,
  totalSales,
  joinedDate,
  isVerified,
  isOnline,
  responseTime,
  onViewProfile,
  onContact,
}: SellerCardProps) {
  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={avatar} alt={name} />
                <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              {isOnline && (
                <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{name}</h3>
                {isVerified && (
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                )}
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{rating.toFixed(1)}</span>
                <span className="text-muted-foreground">({reviews})</span>
              </div>
            </div>
          </div>
          <Badge variant={isOnline ? "default" : "secondary"}>
            {isOnline ? "Online" : "Offline"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>Products</span>
            </div>
            <p className="font-semibold">{totalProducts}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Sales</span>
            </div>
            <p className="font-semibold">{totalSales}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Member since</span>
            <span>{joinedDate}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Response time</span>
            <span className="font-medium">{responseTime}</span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onViewProfile?.(id)}
          >
            View Profile
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onContact?.(id)}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Contact
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}