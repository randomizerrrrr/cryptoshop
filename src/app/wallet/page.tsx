'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Navbar } from '@/components/layout/navbar';
import { Bitcoin, Euro, TrendingUp, TrendingDown, ArrowDownRight, ArrowUpRight, Copy, CheckCircle, Clock, AlertCircle, QrCode, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { QRCodeComponent } from '@/components/ui/qr-code';
import { useBitcoinConverter } from '@/hooks/use-bitcoin-price';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'payment';
  amount: { btc: number; eur: number };
  status: 'completed' | 'pending' | 'failed';
  date: string;
  txid: string;
  description: string;
  confirmations?: number;
}

interface WalletStats {
  totalBalance: { btc: number; eur: number };
  availableBalance: { btc: number; eur: number };
  pendingDeposits: { btc: number; eur: number };
  totalDeposits: { btc: number; eur: number };
  totalWithdrawals: { btc: number; eur: number };
  totalTransactions: number;
}

export default function WalletPage() {
  const [showBalance, setShowBalance] = useState(true);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalAddress, setWithdrawalAddress] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [btcAddress, setBtcAddress] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [walletStats, setWalletStats] = useState<WalletStats>({
    totalBalance: { btc: 0, eur: 0 },
    availableBalance: { btc: 0, eur: 0 },
    pendingDeposits: { btc: 0, eur: 0 },
    totalDeposits: { btc: 0, eur: 0 },
    totalWithdrawals: { btc: 0, eur: 0 },
    totalTransactions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { btcToEur, formatBtc, formatEur } = useBitcoinConverter();

  // Generate or load deposit address
  useEffect(() => {
    const loadWalletData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Generate deposit address for user
        const response = await fetch('/api/bitcoin/address', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'deposit',
            id: 'user_main', // In production, this would be the actual user ID
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setBtcAddress(data.address);
        } else {
          // Fallback to a static address for demo
          setBtcAddress('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh');
        }

        // Load address info and transactions
        await loadAddressInfo();
      } catch (err) {
        console.error('Error loading wallet data:', err);
        setError('Failed to load wallet data');
        // Fallback to static address
        setBtcAddress('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh');
      } finally {
        setLoading(false);
      }
    };

    loadWalletData();
  }, []);

  const loadAddressInfo = async () => {
    try {
      const response = await fetch(`/api/bitcoin/address?address=${btcAddress}`);
      if (response.ok) {
        const data = await response.json();
        
        // Update wallet stats based on real blockchain data
        const balance = data.balance || 0;
        const transactions = data.transactions || [];
        
        // Process transactions
        const processedTransactions: Transaction[] = transactions.map((tx: any, index: number) => {
          const amount = Math.abs(tx.result || 0); // tx.result can be negative for outgoing
          const isDeposit = tx.result > 0;
          
          return {
            id: tx.hash || `tx_${index}`,
            type: isDeposit ? 'deposit' : 'withdrawal',
            amount: {
              btc: amount,
              eur: btcToEur(amount),
            },
            status: 'completed', // In blockchain, if it's there, it's confirmed
            date: new Date(tx.time * 1000).toISOString(),
            txid: tx.hash,
            description: isDeposit ? 'Bitcoin deposit' : 'Bitcoin withdrawal',
            confirmations: data.confirmations || 0,
          };
        });

        // Calculate stats
        const deposits = processedTransactions.filter(t => t.type === 'deposit');
        const withdrawals = processedTransactions.filter(t => t.type === 'withdrawal');
        
        const totalDepositsBtc = deposits.reduce((sum, t) => sum + t.amount.btc, 0);
        const totalWithdrawalsBtc = withdrawals.reduce((sum, t) => sum + t.amount.btc, 0);
        
        const newStats: WalletStats = {
          totalBalance: {
            btc: balance,
            eur: btcToEur(balance),
          },
          availableBalance: {
            btc: balance,
            eur: btcToEur(balance),
          },
          pendingDeposits: {
            btc: 0, // No pending deposits in this simple implementation
            eur: 0,
          },
          totalDeposits: {
            btc: totalDepositsBtc,
            eur: btcToEur(totalDepositsBtc),
          },
          totalWithdrawals: {
            btc: totalWithdrawalsBtc,
            eur: btcToEur(totalWithdrawalsBtc),
          },
          totalTransactions: processedTransactions.length,
        };

        setTransactions(processedTransactions);
        setWalletStats(newStats);
      }
    } catch (err) {
      console.error('Error loading address info:', err);
    }
  };

  const refreshWalletData = async () => {
    setLoading(true);
    await loadAddressInfo();
    setLoading(false);
  };

  const copyToClipboard = async () => {
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(btcAddress);
        } catch (clipboardErr) {
          // Handle clipboard permissions error specifically
          if (clipboardErr.name === 'NotAllowedError' || clipboardErr.message.includes('permissions policy')) {
            console.warn('Clipboard API blocked by permissions policy, using fallback');
            throw new Error('Clipboard permissions denied');
          }
          throw clipboardErr;
        }
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = btcAddress;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
        } catch (execErr) {
          console.error('Failed to copy using execCommand: ', execErr);
          throw new Error('Copy to clipboard failed');
        } finally {
          document.body.removeChild(textArea);
        }
      }
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Show error message to user - only if it's not a permissions error (which is expected in some contexts)
      if (err.message !== 'Clipboard permissions denied') {
        alert('Failed to copy address. Please copy it manually.');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-600">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-600">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-600">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number, currency: 'btc' | 'eur') => {
    if (currency === 'btc') {
      return amount.toFixed(6);
    }
    return amount.toFixed(2);
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Wallet</h1>
                  <p className="text-muted-foreground">Manage your Bitcoin balance and transactions</p>
                  {error && (
                    <Alert className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  onClick={refreshWalletData} 
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="deposit">Deposit</TabsTrigger>
                <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Balance Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                      <Bitcoin className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {showBalance ? (
                          <div className="flex items-center gap-1">
                            <span>{formatCurrency(walletStats.totalBalance.btc, 'btc')}</span>
                            <span className="text-sm text-muted-foreground">BTC</span>
                          </div>
                        ) : (
                          <span>•••••• BTC</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {showBalance ? `€${formatCurrency(walletStats.totalBalance.eur, 'eur')}` : '••••••'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Available</CardTitle>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {showBalance ? (
                          <div className="flex items-center gap-1">
                            <span>{formatCurrency(walletStats.availableBalance.btc, 'btc')}</span>
                            <span className="text-sm text-muted-foreground">BTC</span>
                          </div>
                        ) : (
                          <span>•••••• BTC</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {showBalance ? `€${formatCurrency(walletStats.availableBalance.eur, 'eur')}` : '••••••'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pending</CardTitle>
                      <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {showBalance ? (
                          <div className="flex items-center gap-1">
                            <span>{formatCurrency(walletStats.pendingDeposits.btc, 'btc')}</span>
                            <span className="text-sm text-muted-foreground">BTC</span>
                          </div>
                        ) : (
                          <span>•••••• BTC</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {showBalance ? `€${formatCurrency(walletStats.pendingDeposits.eur, 'eur')}` : '••••••'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{walletStats.totalTransactions}</div>
                      <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Deposit</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-muted/50 rounded-lg text-center">
                        <QRCodeComponent 
                          value={`bitcoin:${btcAddress}`} 
                          size={128}
                          className="mx-auto mb-2"
                        />
                        <p className="text-sm font-mono mb-2">{btcAddress}</p>
                        <Button variant="outline" size="sm" onClick={copyToClipboard}>
                          {copied ? <CheckCircle className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                          {copied ? 'Copied!' : 'Copy Address'}
                        </Button>
                      </div>
                      <Button className="w-full" onClick={() => setActiveTab('deposit')}>
                        Deposit Funds
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Withdraw</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Withdrawals are processed instantly. Minimum withdrawal: 0.001 BTC
                        </AlertDescription>
                      </Alert>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Available Balance:</span>
                          <span className="font-medium">
                            {formatCurrency(walletStats.availableBalance.btc, 'btc')} BTC
                          </span>
                        </div>
                      </div>
                      <Button className="w-full" onClick={() => setActiveTab('withdraw')}>
                        Withdraw Funds
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Transactions */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Recent Transactions</CardTitle>
                      <Button variant="outline" size="sm" onClick={() => setActiveTab('history')}>
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {transactions.length > 0 ? (
                        transactions.slice(0, 5).map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full ${
                                transaction.type === 'deposit' ? 'bg-green-100 text-green-600' : 
                                transaction.type === 'withdrawal' ? 'bg-red-100 text-red-600' :
                                'bg-blue-100 text-blue-600'
                              }`}>
                                {transaction.type === 'deposit' && <ArrowDownRight className="h-4 w-4" />}
                                {transaction.type === 'withdrawal' && <ArrowUpRight className="h-4 w-4" />}
                                {transaction.type === 'payment' && <TrendingDown className="h-4 w-4" />}
                              </div>
                              <div>
                                <p className="font-medium">{transaction.description}</p>
                                <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
                                {transaction.confirmations !== undefined && transaction.confirmations < 3 && (
                                  <p className="text-xs text-yellow-600">
                                    {transaction.confirmations}/3 confirmations
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`font-medium ${
                                transaction.type === 'deposit' ? 'text-green-600' : 
                                transaction.type === 'withdrawal' ? 'text-red-600' :
                                'text-blue-600'
                              }`}>
                                {transaction.type === 'deposit' && '+'}
                                {transaction.type === 'withdrawal' && '-'}
                                {formatCurrency(transaction.amount.btc, 'btc')} BTC
                              </div>
                              <div className="text-xs text-muted-foreground">
                                €{formatCurrency(transaction.amount.eur, 'eur')}
                              </div>
                              {getStatusBadge(transaction.status)}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No transactions yet</p>
                          <p className="text-sm">Make a deposit to get started</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="deposit" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Deposit Bitcoin</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Send Bitcoin to the address below. Deposits are credited after 3 blockchain confirmations.
                      </AlertDescription>
                    </Alert>

                    <div className="text-center space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Your Deposit Address</label>
                        <div className="flex gap-2 max-w-md mx-auto">
                          <Input
                            value={btcAddress}
                            readOnly
                            className="font-mono text-sm"
                          />
                          <Button variant="outline" onClick={copyToClipboard}>
                            {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg inline-block">
                        <QRCodeComponent 
                          value={`bitcoin:${btcAddress}`} 
                          size={192}
                          className="mx-auto"
                        />
                      </div>

                      <div className="bg-muted/50 p-4 rounded-lg text-left max-w-md mx-auto">
                        <h4 className="font-medium mb-2">Important:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Only send Bitcoin (BTC) to this address</li>
                          <li>• Minimum deposit: 0.0001 BTC</li>
                          <li>• Deposits require 3 confirmations</li>
                          <li>• Double-check the address before sending</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="withdraw" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Withdraw Bitcoin</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Withdrawals are processed instantly. Network fees apply.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-4 max-w-md">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Available Balance</label>
                        <div className="text-lg font-bold">
                          {formatCurrency(walletStats.availableBalance.btc, 'btc')} BTC
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Withdrawal Amount</label>
                        <div className="relative">
                          <Input
                            type="number"
                            placeholder="0.000000"
                            value={withdrawalAmount}
                            onChange={(e) => setWithdrawalAmount(e.target.value)}
                            step="0.000001"
                            min="0.001"
                            max={walletStats.availableBalance.btc}
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                            BTC
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Destination Address</label>
                        <Input
                          placeholder="Enter Bitcoin address"
                          value={withdrawalAddress}
                          onChange={(e) => setWithdrawalAddress(e.target.value)}
                        />
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <p>• Minimum withdrawal: 0.001 BTC</p>
                        <p>• Network fee: 0.0001 BTC</p>
                        <p>• You will receive: {withdrawalAmount ? (parseFloat(withdrawalAmount) - 0.0001).toFixed(6) : '0.000000'} BTC</p>
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full" disabled={!withdrawalAmount || !withdrawalAddress}>
                            Withdraw
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Confirm Withdrawal</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to withdraw {withdrawalAmount} BTC to {withdrawalAddress}?
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                              <div className="flex justify-between">
                                <span>Amount:</span>
                                <span className="font-medium">{withdrawalAmount} BTC</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Network Fee:</span>
                                <span className="font-medium">0.0001 BTC</span>
                              </div>
                              <div className="flex justify-between">
                                <span>You will receive:</span>
                                <span className="font-medium">{(parseFloat(withdrawalAmount) - 0.0001).toFixed(6)} BTC</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" className="flex-1">
                                Cancel
                              </Button>
                              <Button className="flex-1">
                                Confirm Withdrawal
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {transactions.length > 0 ? (
                        transactions.map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg border">
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-full ${
                                transaction.type === 'deposit' ? 'bg-green-100 text-green-600' : 
                                transaction.type === 'withdrawal' ? 'bg-red-100 text-red-600' :
                                'bg-blue-100 text-blue-600'
                              }`}>
                                {transaction.type === 'deposit' && <ArrowDownRight className="h-5 w-5" />}
                                {transaction.type === 'withdrawal' && <ArrowUpRight className="h-5 w-5" />}
                                {transaction.type === 'payment' && <TrendingDown className="h-5 w-5" />}
                              </div>
                              <div>
                                <h3 className="font-medium">{transaction.description}</h3>
                                <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
                                <p className="text-xs font-mono text-muted-foreground">{transaction.txid}</p>
                                {transaction.confirmations !== undefined && transaction.confirmations < 3 && (
                                  <p className="text-xs text-yellow-600">
                                    {transaction.confirmations}/3 confirmations
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-lg font-semibold ${
                                transaction.type === 'deposit' ? 'text-green-600' : 
                                transaction.type === 'withdrawal' ? 'text-red-600' :
                                'text-blue-600'
                              }`}>
                                {transaction.type === 'deposit' && '+'}
                                {transaction.type === 'withdrawal' && '-'}
                                {formatCurrency(transaction.amount.btc, 'btc')} BTC
                              </div>
                              <div className="text-sm text-muted-foreground">
                                €{formatCurrency(transaction.amount.eur, 'eur')}
                              </div>
                              {getStatusBadge(transaction.status)}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg">No transactions found</p>
                          <p className="text-sm">Your transaction history will appear here</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Balance Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="fixed bottom-6 right-6 rounded-full shadow-lg"
            onClick={() => setShowBalance(!showBalance)}
          >
            {showBalance ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </Button>
        </main>
      </div>
  );
}
