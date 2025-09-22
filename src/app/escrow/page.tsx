'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Navbar } from '@/components/layout/navbar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bitcoin, Euro, Shield, Clock, CheckCircle, AlertTriangle, Eye, MessageSquare, Search, Filter, Download, Upload, Users } from 'lucide-react';

type EscrowStatus = 'PENDING' | 'FUNDED' | 'CONFIRMED' | 'RELEASED' | 'REFUNDED' | 'DISPUTED';

interface EscrowTransaction {
  id: string;
  orderId: string;
  amountBtc: number;
  amountEur: number;
  status: EscrowStatus;
  releaseCode: string;
  createdAt: string;
  updatedAt: string;
  disputeReason?: string;
  disputeRaised: boolean;
  disputeResolved: boolean;
  order: {
    id: string;
    buyer: {
      username: string;
      avatar: string;
    };
    orderItems: {
      id: string;
      quantity: number;
      product: {
        id: string;
        name: string;
        seller: {
          id: string;
          name: string;
          user: {
            username: string;
            avatar: string;
          };
        };
      };
    }[];
  };
  participants: {
    id: string;
    userId: string;
    role: 'BUYER' | 'SELLER';
    agreedAt: string;
    user: {
      username: string;
      avatar: string;
    };
  }[];
}

const mockEscrowTransactions: EscrowTransaction[] = [
  {
    id: '1',
    orderId: 'order1',
    amountBtc: 0.0025,
    amountEur: 89.99,
    status: 'FUNDED',
    releaseCode: 'ABC123',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    disputeRaised: false,
    disputeResolved: false,
    order: {
      id: 'order1',
      buyer: {
        username: 'crypto_buyer',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      },
      orderItems: [
        {
          id: 'item1',
          quantity: 1,
          product: {
            id: 'product1',
            name: 'Premium VPN Subscription',
            seller: {
              id: 'seller1',
              name: 'SecureNet',
              user: {
                username: 'securenet',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
              },
            },
          },
        },
      ],
    },
    participants: [
      {
        id: 'p1',
        userId: 'user1',
        role: 'BUYER',
        agreedAt: '2024-01-15T10:30:00Z',
        user: {
          username: 'crypto_buyer',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
        },
      },
      {
        id: 'p2',
        userId: 'user2',
        role: 'SELLER',
        agreedAt: '2024-01-15T11:00:00Z',
        user: {
          username: 'securenet',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        },
      },
    ],
  },
  {
    id: '2',
    orderId: 'order2',
    amountBtc: 0.005,
    amountEur: 175.00,
    status: 'CONFIRMED',
    releaseCode: 'DEF456',
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-14T16:45:00Z',
    disputeRaised: false,
    disputeResolved: false,
    order: {
      id: 'order2',
      buyer: {
        username: 'bitcoin_user',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
      },
      orderItems: [
        {
          id: 'item2',
          quantity: 1,
          product: {
            id: 'product2',
            name: 'Software Development Tools',
            seller: {
              id: 'seller2',
              name: 'SoftwarePro',
              user: {
                username: 'softwarepro',
                avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop',
              },
            },
          },
        },
      ],
    },
    participants: [
      {
        id: 'p3',
        userId: 'user3',
        role: 'BUYER',
        agreedAt: '2024-01-14T14:20:00Z',
        user: {
          username: 'bitcoin_user',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
        },
      },
      {
        id: 'p4',
        userId: 'user4',
        role: 'SELLER',
        agreedAt: '2024-01-14T15:30:00Z',
        user: {
          username: 'softwarepro',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop',
        },
      },
    ],
  },
  {
    id: '3',
    orderId: 'order3',
    amountBtc: 0.001,
    amountEur: 35.50,
    status: 'DISPUTED',
    releaseCode: 'GHI789',
    createdAt: '2024-01-13T09:15:00Z',
    updatedAt: '2024-01-13T18:20:00Z',
    disputeReason: 'Product not as described',
    disputeRaised: true,
    disputeResolved: false,
    order: {
      id: 'order3',
      buyer: {
        username: 'satoshi_fan',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop',
      },
      orderItems: [
        {
          id: 'item3',
          quantity: 2,
          product: {
            id: 'product3',
            name: 'E-book Collection',
            seller: {
              id: 'seller3',
              name: 'DigitalBooks',
              user: {
                username: 'digitalbooks',
                avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
              },
            },
          },
        },
      ],
    },
    participants: [
      {
        id: 'p5',
        userId: 'user5',
        role: 'BUYER',
        agreedAt: '2024-01-13T09:15:00Z',
        user: {
          username: 'satoshi_fan',
          avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop',
        },
      },
      {
        id: 'p6',
        userId: 'user6',
        role: 'SELLER',
        agreedAt: '2024-01-13T10:45:00Z',
        user: {
          username: 'digitalbooks',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
        },
      },
    ],
  },
];

const globalStats = {
  totalEscrow: 1247,
  activeEscrow: 89,
  totalValueBtc: 12.345,
  totalValueEur: 445670,
  disputedEscrow: 5,
  resolvedDisputes: 98,
  averageResolutionTime: '2.5 days',
};

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  FUNDED: 'bg-blue-100 text-blue-800',
  CONFIRMED: 'bg-purple-100 text-purple-800',
  RELEASED: 'bg-green-100 text-green-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
  DISPUTED: 'bg-red-100 text-red-800',
};

const statusIcons = {
  PENDING: Clock,
  FUNDED: Upload,
  CONFIRMED: Shield,
  RELEASED: CheckCircle,
  REFUNDED: Download,
  DISPUTED: AlertTriangle,
};

export default function EscrowPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EscrowStatus | 'ALL'>('ALL');
  const [selectedTransaction, setSelectedTransaction] = useState<EscrowTransaction | null>(null);
  const [showReleaseDialog, setShowReleaseDialog] = useState(false);
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);
  const [releaseCode, setReleaseCode] = useState('');
  const [disputeReason, setDisputeReason] = useState('');

  const filteredTransactions = mockEscrowTransactions.filter(transaction => {
    const matchesSearch = 
      transaction.order.buyer.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.order.orderItems[0].product.seller.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.order.orderItems[0].product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || transaction.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number, currency: 'BTC' | 'EUR') => {
    if (currency === 'BTC') {
      return `${amount.toFixed(6)} BTC`;
    }
    return `€${amount.toFixed(2)}`;
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

  const handleReleaseFunds = () => {
    if (selectedTransaction && releaseCode === selectedTransaction.releaseCode) {
      console.log('Funds released for transaction:', selectedTransaction.id);
      setShowReleaseDialog(false);
      setReleaseCode('');
      setSelectedTransaction(null);
    } else {
      console.error('Invalid release code');
    }
  };

  const handleRaiseDispute = () => {
    if (selectedTransaction && disputeReason.trim()) {
      console.log('Dispute raised for transaction:', selectedTransaction.id, 'Reason:', disputeReason);
      setShowDisputeDialog(false);
      setDisputeReason('');
      setSelectedTransaction(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Escrow Management</h1>
              <p className="text-muted-foreground">Manage your secure transactions and dispute resolution</p>
            </div>

            {/* Global Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Escrow</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{globalStats.totalEscrow}</div>
                  <p className="text-xs text-muted-foreground">
                    {globalStats.activeEscrow} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                  <Bitcoin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(globalStats.totalValueBtc, 'BTC')}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(globalStats.totalValueEur, 'EUR')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Disputes</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{globalStats.disputedEscrow}</div>
                  <p className="text-xs text-muted-foreground">
                    {globalStats.resolvedDisputes}% resolved
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Resolution Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{globalStats.averageResolutionTime}</div>
                  <p className="text-xs text-muted-foreground">Average</p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as EscrowStatus | 'ALL')}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="FUNDED">Funded</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="RELEASED">Released</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                    <SelectItem value="DISPUTED">Disputed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="transactions" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="disputes">Dispute Resolution</TabsTrigger>
              </TabsList>

              <TabsContent value="transactions" className="space-y-4">
                {/* Results */}
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-muted-foreground">
                    {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} found
                  </p>
                </div>

                {/* Transactions Table */}
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Transaction ID</TableHead>
                          <TableHead>Parties</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTransactions.map((transaction) => {
                          const StatusIcon = statusIcons[transaction.status];
                          return (
                            <TableRow key={transaction.id}>
                              <TableCell className="font-mono text-sm">
                                {transaction.id.slice(0, 8)}...
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={transaction.order.buyer.avatar} />
                                    <AvatarFallback className="text-xs">
                                      {transaction.order.buyer.username.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">{transaction.order.buyer.username}</span>
                                  <span className="text-muted-foreground">→</span>
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={transaction.order.orderItems[0].product.seller.user.avatar} />
                                    <AvatarFallback className="text-xs">
                                      {transaction.order.orderItems[0].product.seller.user.username.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">{transaction.order.orderItems[0].product.seller.user.username}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1 text-sm">
                                    <Bitcoin className="h-3 w-3" />
                                    <span>{formatCurrency(transaction.amountBtc, 'BTC')}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Euro className="h-3 w-3" />
                                    <span>{formatCurrency(transaction.amountEur, 'EUR')}</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={statusColors[transaction.status]}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {transaction.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {formatDate(transaction.createdAt)}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedTransaction(transaction)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {transaction.status === 'CONFIRMED' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedTransaction(transaction);
                                        setShowReleaseDialog(true);
                                      }}
                                    >
                                      Release
                                    </Button>
                                  )}
                                  {transaction.status !== 'DISPUTED' && transaction.status !== 'RELEASED' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedTransaction(transaction);
                                        setShowDisputeDialog(true);
                                      }}
                                    >
                                      Dispute
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="disputes" className="space-y-4">
                <div className="grid gap-4">
                  {mockEscrowTransactions.filter(t => t.disputeRaised).map((transaction) => (
                    <Card key={transaction.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Dispute Case #{transaction.id.slice(0, 8)}</CardTitle>
                          <Badge className="bg-red-100 text-red-800">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Under Review
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium mb-2">Transaction Details</h4>
                              <div className="space-y-1 text-sm">
                                <div>Amount: {formatCurrency(transaction.amountBtc, 'BTC')}</div>
                                <div>Created: {formatDate(transaction.createdAt)}</div>
                                <div>Status: {transaction.status}</div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Dispute Information</h4>
                              <div className="space-y-1 text-sm">
                                <div>Reason: {transaction.disputeReason}</div>
                                <div>Raised: {formatDate(transaction.updatedAt)}</div>
                                <div>Resolution: {transaction.disputeResolved ? 'Resolved' : 'Pending'}</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-muted/50 p-4 rounded-lg">
                            <h4 className="font-medium mb-2">Involved Parties</h4>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={transaction.order.buyer.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {transaction.order.buyer.username.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium text-sm">{transaction.order.buyer.username}</div>
                                  <div className="text-xs text-muted-foreground">Buyer</div>
                                </div>
                              </div>
                              <span className="text-muted-foreground">vs</span>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={transaction.order.orderItems[0].product.seller.user.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {transaction.order.orderItems[0].product.seller.user.username.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium text-sm">{transaction.order.orderItems[0].product.seller.user.username}</div>
                                  <div className="text-xs text-muted-foreground">Seller</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Contact Support
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        
        {/* Release Funds Dialog */}
        <Dialog open={showReleaseDialog} onOpenChange={setShowReleaseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Release Funds</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Releasing funds will transfer the Bitcoin to the seller. This action cannot be undone.
              </AlertDescription>
            </Alert>
            
            {selectedTransaction && (
              <div className="space-y-2">
                <div className="text-sm">
                  <strong>Transaction:</strong> {selectedTransaction.id}
                </div>
                <div className="text-sm">
                  <strong>Amount:</strong> {formatCurrency(selectedTransaction.amountBtc, 'BTC')}
                </div>
                <div className="text-sm">
                  <strong>Seller:</strong> {selectedTransaction.order.orderItems[0].product.seller.user.username}
                </div>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium mb-2 block">Release Code</label>
              <Input
                placeholder="Enter release code"
                value={releaseCode}
                onChange={(e) => setReleaseCode(e.target.value)}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter the release code provided by the seller
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowReleaseDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleReleaseFunds}
                disabled={!releaseCode.trim()}
              >
                Release Funds
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Raise Dispute Dialog */}
      <Dialog open={showDisputeDialog} onOpenChange={setShowDisputeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Raise Dispute</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Raising a dispute will freeze the funds and initiate a review process. This should only be done if you have a serious issue with the transaction.
              </AlertDescription>
            </Alert>
            
            {selectedTransaction && (
              <div className="space-y-2">
                <div className="text-sm">
                  <strong>Transaction:</strong> {selectedTransaction.id}
                </div>
                <div className="text-sm">
                  <strong>Amount:</strong> {formatCurrency(selectedTransaction.amountBtc, 'BTC')}
                </div>
                <div className="text-sm">
                  <strong>Product:</strong> {selectedTransaction.order.orderItems[0].product.name}
                </div>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium mb-2 block">Dispute Reason</label>
              <textarea
                className="w-full p-2 border rounded-md min-h-[100px]"
                placeholder="Please describe the issue in detail..."
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Provide as much detail as possible to help resolve the dispute quickly
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDisputeDialog(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleRaiseDispute}
                disabled={!disputeReason.trim()}
              >
                Raise Dispute
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
  );
}