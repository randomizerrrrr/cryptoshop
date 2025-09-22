'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Navbar } from '@/components/layout/navbar';
import { ProductCard } from '@/components/marketplace/product-card';
import { useProducts } from '@/hooks/use-products';
import { useBitcoinConverter } from '@/hooks/use-bitcoin-price';
import { useCartStore } from '@/store/cart-store';
import { Search, Filter, Grid, List, Bitcoin, Euro, Star, Package, Loader2 } from 'lucide-react';

const categories = [
  'Electronics',
  'Digital Goods',
  'Software',
  'Services',
  'Books',
  'Art & Design',
  'Gaming',
  'Other'
];

export default function MarketPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 1]);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Construire les filtres pour l'API
  const filters = {
    search: searchQuery || undefined,
    category: selectedCategories.length > 0 ? selectedCategories[0] : undefined,
    sortBy,
    sortOrder,
    page: currentPage,
    limit: 12,
  };

  const { data, loading, error, products, pagination, refetch } = useProducts(filters);
  const { addItem, isInCart } = useCartStore();
  const { btcToEur, formatBtc, formatEur } = useBitcoinConverter();

  const handleCategoryChange = (category: string, checked: boolean) => {
    setSelectedCategories(prev => 
      checked ? [category] : prev.filter(c => c !== category)
    );
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    const [sort, order] = value.split('-');
    setSortBy(sort);
    setSortOrder(order as 'asc' | 'desc');
    setCurrentPage(1);
  };

  const handleAddToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      addItem({
        productId: product.id,
        name: product.name,
        price: { 
          btc: product.priceBtc, 
          eur: product.priceEur 
        },
        image: product.images ? JSON.parse(product.images)[0] : '/placeholder.png',
        quantity: 1,
        seller: {
          id: product.seller.id,
          name: product.seller.storeName,
          verified: product.seller.verified,
        },
        category: product.category,
        digitalProduct: product.digitalProduct,
        deliveryTime: product.deliveryTime,
      });
    }
  };

  const handleViewDetails = (productId: string) => {
    // Rediriger vers la page de détail du produit
    window.location.href = `/product/${productId}`;
  };

  // Transformer les produits pour le composant ProductCard
  const transformedProducts = products.map(product => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: { 
      btc: product.priceBtc, 
      eur: btcToEur(product.priceBtc) // Utiliser le prix réel du Bitcoin
    },
    image: product.images ? JSON.parse(product.images)[0] : '/placeholder.png',
    seller: {
      name: product.seller.storeName,
      rating: product.seller.rating,
      verified: product.seller.verified,
    },
    category: product.category,
    rating: product.seller.rating,
    reviews: product.seller.totalSales,
    views: product.views,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div>
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
              <p className="text-muted-foreground">Discover amazing products with Bitcoin</p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={`${sortBy}-${sortOrder}`} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt-desc">Newest</SelectItem>
                    <SelectItem value="priceBtc-asc">Price: Low to High</SelectItem>
                    <SelectItem value="priceBtc-desc">Price: High to Low</SelectItem>
                    <SelectItem value="seller.rating-desc">Highest Rated</SelectItem>
                    <SelectItem value="seller.totalSales-desc">Most Popular</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <Filter className="h-4 w-4" />
                </Button>
                
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
              </div>
            </div>

            <div className="flex gap-6">
              {/* Filters Sidebar */}
              <div className={`w-80 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Filters</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Categories */}
                    <div>
                      <h4 className="font-medium mb-3">Categories</h4>
                      <div className="space-y-2">
                        {categories.map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <Checkbox
                              id={category}
                              checked={selectedCategories.includes(category)}
                              onCheckedChange={(checked) => 
                                handleCategoryChange(category, checked as boolean)
                              }
                            />
                            <label htmlFor={category} className="text-sm">
                              {category}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div>
                      <h4 className="font-medium mb-3">Price Range (BTC)</h4>
                      <div className="space-y-3">
                        <Slider
                          value={priceRange}
                          onValueChange={setPriceRange}
                          max={1}
                          min={0}
                          step={0.001}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{priceRange[0].toFixed(3)} BTC</span>
                          <span>{priceRange[1].toFixed(3)} BTC</span>
                        </div>
                      </div>
                    </div>

                    {/* Seller Verification */}
                    <div>
                      <h4 className="font-medium mb-3">Seller Status</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="verified" />
                          <label htmlFor="verified" className="text-sm">
                            Verified Sellers Only
                          </label>
                        </div>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setSelectedCategories([]);
                        setPriceRange([0, 1]);
                        setSearchQuery('');
                        setCurrentPage(1);
                      }}
                    >
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Products Grid */}
              <div className="flex-1">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-muted-foreground">
                    {loading ? 'Loading products...' : `${pagination?.total || 0} products found`}
                  </p>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Error loading products</h3>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Button onClick={refetch}>Try Again</Button>
                  </div>
                ) : transformedProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No products found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your filters or search terms
                    </p>
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {transformedProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        {...product}
                        onAddToCart={handleAddToCart}
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transformedProducts.map((product) => (
                      <Card key={product.id}>
                        <CardContent className="p-6">
                          <div className="flex gap-6">
                            <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-lg font-semibold">{product.name}</h3>
                                  <p className="text-muted-foreground line-clamp-2">
                                    {product.description}
                                  </p>
                                </div>
                                <Badge variant="secondary">{product.category}</Badge>
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span className="font-medium">{product.rating.toFixed(1)}</span>
                                  <span className="text-muted-foreground">({product.reviews})</span>
                                </div>
                                <div className="text-muted-foreground">
                                  by {product.seller.name}
                                  {product.seller.verified && (
                                    <Badge variant="outline" className="ml-1 text-xs">✓</Badge>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-1 text-lg font-bold text-primary">
                                    <Bitcoin className="h-5 w-5" />
                                    <span>{product.price.btc.toFixed(6)}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Euro className="h-4 w-4" />
                                    <span>€{product.price.eur.toFixed(2)}</span>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleViewDetails(product.id)}
                                  >
                                    View Details
                                  </Button>
                                  <Button 
                                    size="sm"
                                    onClick={() => handleAddToCart(product.id)}
                                  >
                                    <Package className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="flex justify-center mt-8 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4">
                      Page {currentPage} of {pagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                      disabled={currentPage === pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}