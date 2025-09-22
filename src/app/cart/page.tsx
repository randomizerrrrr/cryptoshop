'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Navbar } from '@/components/layout/navbar';
import { useCartStore } from '@/store/cart-store';
import { useBitcoinConverter } from '@/hooks/use-bitcoin-price';
import { Bitcoin, Euro, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Shield, Truck } from 'lucide-react';

const promoCodes = [
  { code: 'WELCOME10', discount: 10, description: '10% off for new users' },
  { code: 'SAVE20', discount: 20, description: '20% off orders over 0.05 BTC' },
];

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart, getTotalBtc } = useCartStore();
  const { btcToEur, formatBtc, formatEur } = useBitcoinConverter();
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  const applyPromoCode = () => {
    const validCode = promoCodes.find(p => p.code.toLowerCase() === promoCode.toLowerCase());
    if (validCode) {
      setAppliedPromo(validCode.code);
    } else {
      setAppliedPromo(null);
    }
  };

  const subtotal = getTotalBtc();
  const subtotalEur = btcToEur(subtotal);
  const discount = appliedPromo ? promoCodes.find(p => p.code === appliedPromo)!.discount / 100 * subtotal : 0;
  const discountEur = btcToEur(discount);
  const total = subtotal - discount;
  const totalEur = subtotalEur - discountEur;

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-16">
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
              <p className="text-muted-foreground mb-6">
                Looks like you haven't added any items to your cart yet.
              </p>
              <Button size="lg" onClick={() => router.push('/market')}>
                Browse Products
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
            <p className="text-muted-foreground">
              {items.length} item{items.length !== 1 ? 's' : ''} in your cart
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">Sold by {item.seller.name}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                              className="w-16 text-center"
                              min={1}
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="text-right">
                            <div className="flex items-center gap-1 text-lg font-bold text-primary">
                              <Bitcoin className="h-5 w-5" />
                              <span>{formatBtc(item.price.btc * item.quantity)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Euro className="h-4 w-4" />
                              <span>{formatEur(btcToEur(item.price.btc * item.quantity))}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Truck className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Delivery: {item.deliveryTime}
                            </span>
                          </div>
                          {item.seller.verified && (
                            <Badge variant="secondary" className="text-xs">Verified Seller</Badge>
                          )}
                          {item.digitalProduct && (
                            <Badge variant="outline" className="text-xs">Digital Product</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.name} × {item.quantity}
                        </span>
                        <div className="flex items-center gap-1">
                          <Bitcoin className="h-3 w-3" />
                          <span>{formatBtc(item.price.btc * item.quantity)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <div className="flex items-center gap-1">
                        <Bitcoin className="h-4 w-4" />
                        <span>{formatBtc(subtotal)}</span>
                      </div>
                    </div>
                    
                    {appliedPromo && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({promoCodes.find(p => p.code === appliedPromo)?.discount}%)</span>
                        <div className="flex items-center gap-1">
                          <Bitcoin className="h-4 w-4" />
                          <span>-{formatBtc(discount)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <div className="flex items-center gap-1 text-primary">
                      <Bitcoin className="h-5 w-5" />
                      <span>{formatBtc(total)}</span>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    ≈ {formatEur(totalEur)}
                  </div>

                  {/* Promo Code */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Promo Code</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                      />
                      <Button variant="outline" onClick={applyPromoCode}>
                        Apply
                      </Button>
                    </div>
                    {appliedPromo && (
                      <Badge variant="secondary" className="text-xs">
                        {appliedPromo} applied
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>Escrow protected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      <span>Instant delivery for digital products</span>
                    </div>
                  </div>

                  <Button 
                    size="lg" 
                    className="w-full"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>

                  <div className="text-center">
                    <Button variant="link" onClick={() => router.push('/market')}>
                      Continue Shopping
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}