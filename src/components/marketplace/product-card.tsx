'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart, Bitcoin, Euro, Eye } from 'lucide-react';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: {
    btc: number;
    eur: number;
  };
  image: string;
  seller: {
    name: string;
    rating: number;
    verified: boolean;
  };
  category: string;
  rating: number;
  reviews: number;
  views: number;
  onAddToCart?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

export function ProductCard({
  id,
  name,
  description,
  price,
  image,
  seller,
  category,
  rating,
  reviews,
  views,
  onAddToCart,
  onViewDetails,
}: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    onAddToCart?.(id);
    setIsAdding(false);
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg">
        <div className="relative aspect-square overflow-hidden">
          <motion.img
            src={image}
            alt={name}
            fill
            className="object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          />
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="text-xs">
              {category}
            </Badge>
          </div>
          {seller.verified && (
            <div className="absolute top-2 right-2">
              <Badge variant="default" className="text-xs bg-green-600">
                ✓ Verified
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg line-clamp-1">{name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
            
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{rating.toFixed(1)}</span>
              </div>
              <span className="text-muted-foreground">({reviews} reviews)</span>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>{views}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-lg font-bold text-primary">
                <Bitcoin className="h-5 w-5" />
                <span>{price.btc.toFixed(6)}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Euro className="h-4 w-4" />
                <span>€{price.eur.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">by</span>
              <span className="font-medium">{seller.name}</span>
              {seller.verified && (
                <Badge variant="outline" className="text-xs">
                  ✓
                </Badge>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex gap-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onViewDetails?.(id)}
            >
              View Details
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
            <Button
              size="sm"
              className="w-full"
              onClick={handleAddToCart}
              disabled={isAdding}
            >
              {isAdding ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                />
              ) : (
                <ShoppingCart className="h-4 w-4" />
              )}
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}