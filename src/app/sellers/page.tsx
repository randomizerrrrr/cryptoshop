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
import { SellerCard } from '@/components/marketplace/seller-card';
import { Search, Users, Star, TrendingUp, Package, CheckCircle, MessageSquare, Grid, List, ArrowUpDown } from 'lucide-react';

const mockSellers = [
  {
    id: '1',
    name: 'SecureNet',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    rating: 4.8,
    reviews: 1247,
    totalProducts: 45,
    totalSales: 8934,
    joinedDate: 'Jan 2021',
    isVerified: true,
    isOnline: true,
    responseTime: '2 hours',
    category: 'Services',
    monthlyRevenue: 45600,
  },
  {
    id: '2',
    name: 'SoftwarePro',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    rating: 4.9,
    reviews: 892,
    totalProducts: 23,
    totalSales: 5672,
    joinedDate: 'Mar 2021',
    isVerified: true,
    isOnline: true,
    responseTime: '1 hour',
    category: 'Software',
    monthlyRevenue: 78900,
  },
  {
    id: '3',
    name: 'CryptoMaster',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop',
    rating: 4.7,
    reviews: 2156,
    totalProducts: 67,
    totalSales: 12456,
    joinedDate: 'Dec 2020',
    isVerified: true,
    isOnline: false,
    responseTime: '3 hours',
    category: 'Digital Goods',
    monthlyRevenue: 92300,
  },
  {
    id: '4',
    name: 'TechGuru',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop',
    rating: 4.6,
    reviews: 432,
    totalProducts: 34,
    totalSales: 2341,
    joinedDate: 'Jun 2022',
    isVerified: false,
    isOnline: true,
    responseTime: '4 hours',
    category: 'Books',
    monthlyRevenue: 23400,
  },
  {
    id: '5',
    name: 'DesignStudio',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
    rating: 4.9,
    reviews: 1876,
    totalProducts: 89,
    totalSales: 8765,
    joinedDate: 'Sep 2021',
    isVerified: true,
    isOnline: true,
    responseTime: '30 minutes',
    category: 'Art & Design',
    monthlyRevenue: 56700,
  },
  {
    id: '6',
    name: 'GameZone',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    rating: 4.5,
    reviews: 567,
    totalProducts: 123,
    totalSales: 3456,
    joinedDate: 'Feb 2022',
    isVerified: true,
    isOnline: false,
    responseTime: '5 hours',
    category: 'Gaming',
    monthlyRevenue: 34500,
  },
];

const globalStats = {
  totalSellers: 342,
  activeSellers: 89,
  totalProducts: 2847,
  totalSales: 234567,
  averageRating: 4.7,
  totalRevenue: 2340000,
  newSellersThisMonth: 15,
};

const categories = ['All', 'Services', 'Software', 'Digital Goods', 'Books', 'Art & Design', 'Gaming', 'Other'];

export default function SellersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);

  const filteredSellers = mockSellers.filter(seller => {
    const matchesSearch = seller.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || seller.category === selectedCategory;
    const matchesVerified = !showVerifiedOnly || seller.isVerified;
    
    return matchesSearch && matchesCategory && matchesVerified;
  });

  const sortedSellers = [...filteredSellers].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'sales':
        return b.totalSales - a.totalSales;
      case 'products':
        return b.totalProducts - a.totalProducts;
      case 'revenue':
        return b.monthlyRevenue - a.monthlyRevenue;
      case 'reviews':
        return b.reviews - a.reviews;
      default:
        return 0;
    }
  });

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `€${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `€${(amount / 1000).toFixed(1)}K`;
    }
    return `€${amount}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Sellers</h1>
              <p className="text-muted-foreground">Discover trusted sellers and their products</p>
            </div>

            {/* Global Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sellers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{globalStats.totalSellers}</div>
                  <p className="text-xs text-muted-foreground">
                    +{globalStats.newSellersThisMonth} this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{globalStats.activeSellers}</div>
                  <p className="text-xs text-muted-foreground">Online sellers</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                  <Star className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{globalStats.averageRating}/5</div>
                  <p className="text-xs text-muted-foreground">Platform average</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(globalStats.totalRevenue)}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sellers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="products">Products</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="reviews">Reviews</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'bg-primary text-primary-foreground' : ''}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setViewMode('list')}
                    className={viewMode === 'list' ? 'bg-primary text-primary-foreground' : ''}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setViewMode('table')}
                    className={viewMode === 'table' ? 'bg-primary text-primary-foreground' : ''}
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Verified Filter */}
            <div className="mb-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showVerifiedOnly}
                  onChange={(e) => setShowVerifiedOnly(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium">Show verified sellers only</span>
              </label>
            </div>

            {/* Results */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-muted-foreground">
                {sortedSellers.length} seller{sortedSellers.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {/* Sellers Display */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedSellers.map((seller) => (
                  <SellerCard
                    key={seller.id}
                    {...seller}
                    onViewProfile={(id) => console.log('View profile:', id)}
                    onContact={(id) => console.log('Contact seller:', id)}
                  />
                ))}
              </div>
            )}

            {viewMode === 'list' && (
              <div className="space-y-4">
                {sortedSellers.map((seller) => (
                  <Card key={seller.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={seller.avatar} alt={seller.name} />
                            <AvatarFallback>{seller.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          {seller.isOnline && (
                            <div className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 rounded-full border-2 border-background" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold">{seller.name}</h3>
                            {seller.isVerified && (
                              <CheckCircle className="h-4 w-4 text-blue-500" />
                            )}
                            <Badge variant={seller.isOnline ? "default" : "secondary"}>
                              {seller.isOnline ? "Online" : "Offline"}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span>{seller.rating.toFixed(1)}</span>
                              <span>({seller.reviews})</span>
                            </div>
                            <span>•</span>
                            <span>{seller.category}</span>
                            <span>•</span>
                            <span>Member since {seller.joinedDate}</span>
                          </div>

                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Products</div>
                              <div className="font-semibold">{seller.totalProducts}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Sales</div>
                              <div className="font-semibold">{seller.totalSales.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Revenue</div>
                              <div className="font-semibold">{formatCurrency(seller.monthlyRevenue)}/mo</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            View Profile
                          </Button>
                          <Button size="sm">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Contact
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {viewMode === 'table' && (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Seller</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Products</TableHead>
                        <TableHead>Sales</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedSellers.map((seller) => (
                        <TableRow key={seller.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={seller.avatar} alt={seller.name} />
                                <AvatarFallback>{seller.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">{seller.name}</span>
                                  {seller.isVerified && (
                                    <CheckCircle className="h-3 w-3 text-blue-500" />
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Since {seller.joinedDate}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{seller.category}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span>{seller.rating.toFixed(1)}</span>
                              <span className="text-muted-foreground">({seller.reviews})</span>
                            </div>
                          </TableCell>
                          <TableCell>{seller.totalProducts}</TableCell>
                          <TableCell>{seller.totalSales.toLocaleString()}</TableCell>
                          <TableCell>{formatCurrency(seller.monthlyRevenue)}</TableCell>
                          <TableCell>
                            <Badge variant={seller.isOnline ? "default" : "secondary"}>
                              {seller.isOnline ? "Online" : "Offline"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                              <Button size="sm">
                                Contact
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {sortedSellers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No sellers found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search terms
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
  );
}
