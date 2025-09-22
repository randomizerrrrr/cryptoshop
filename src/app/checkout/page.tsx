'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/layout/navbar';
import { Wallet, CheckCircle, Clock, AlertCircle, Euro, ArrowRight } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const [currentBalance, setCurrentBalance] = useState(150.75); // Solde en EUR
  const [paymentAmount, setPaymentAmount] = useState(89.99);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const remainingBalance = currentBalance - paymentAmount;

  const handlePayment = () => {
    if (remainingBalance < 0) {
      setError('Insufficient balance. Please top up your account.');
      return;
    }
    setShowConfirm(true);
  };

  const confirmPayment = () => {
    setLoading(true);
    setTimeout(() => {
      setCurrentBalance(remainingBalance);
      alert('Payment completed successfully!');
      router.push('/orders');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Checkout</h1>
            <p className="text-muted-foreground">Complete your purchase using your account balance</p>
            {error && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Alert>
                    <Wallet className="h-4 w-4" />
                    <AlertDescription>
                      This purchase will be deducted from your account balance. 
                      Bitcoin is only used for topping up and cashing out funds.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-primary" />
                        <span className="font-medium">Current Balance</span>
                      </div>
                      <div className="flex items-center gap-1 text-lg font-bold">
                        <Euro className="h-5 w-5" />
                        <span>{currentBalance.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-5 w-5 text-red-500" />
                        <span className="font-medium">Payment Amount</span>
                      </div>
                      <div className="flex items-center gap-1 text-lg font-bold text-red-500">
                        <Euro className="h-5 w-5" />
                        <span>{paymentAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-700">Remaining Balance</span>
                      </div>
                      <div className="flex items-center gap-1 text-lg font-bold text-green-600">
                        <Euro className="h-5 w-5" />
                        <span>{remainingBalance.toFixed(2)}</span>
                      </div>
                    </div>

                    {remainingBalance < 0 && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <AlertDescription className="text-red-700">
                          Insufficient balance. Please <a href="/wallet" className="underline font-medium">top up your account</a> to complete this purchase.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex gap-2">
                      <Button 
                        onClick={() => router.push('/wallet')}
                        variant="outline"
                        className="flex-1"
                      >
                        <Wallet className="h-4 w-4 mr-2" />
                        Top Up Balance
                      </Button>
                      <Button 
                        onClick={handlePayment}
                        className="flex-1"
                        size="lg"
                        disabled={loading || remainingBalance < 0}
                      >
                        {loading ? 'Processing...' : 'Pay with Balance'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {showConfirm && (
                <Card className="border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-blue-700">Confirm Payment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <Clock className="h-4 w-4" />
                      <AlertDescription>
                        Are you sure you want to pay <strong>€{paymentAmount.toFixed(2)}</strong> from your account balance?
                        After payment, your remaining balance will be <strong>€{remainingBalance.toFixed(2)}</strong>.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => setShowConfirm(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={confirmPayment}
                        className="flex-1"
                        disabled={loading}
                      >
                        {loading ? 'Processing...' : 'Confirm Payment'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div>
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Premium VPN Subscription × 1</span>
                      <span>€89.99</span>
                    </div>
                  </div>

                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <div className="flex items-center gap-1 text-primary">
                      <Euro className="h-5 w-5" />
                      <span>{paymentAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <Badge variant="secondary" className="mr-2">Balance Payment</Badge>
                    No additional fees
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Instant processing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-blue-600" />
                      <span>Secure balance payment</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Need more funds?</span>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-sm"
                        onClick={() => router.push('/wallet')}
                      >
                        Top Up Now
                      </Button>
                    </div>
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