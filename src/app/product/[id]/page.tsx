'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navbar } from '@/components/layout/navbar';
import { Bitcoin, Euro, Star, ShoppingCart, Package, Shield, CheckCircle, MessageSquare, Heart, Share2, Camera } from 'lucide-react';

const mockProduct = {
  id: '1',
  name: 'Premium VPN Subscription',
  description: 'Experience true online freedom with our premium VPN service. This lifetime subscription offers unlimited bandwidth, military-grade encryption, and access to servers in over 50 countries. Perfect for streaming, gaming, and maintaining your privacy online.\n\nKey Features:\n• Unlimited bandwidth and speed\n• Military-grade AES-256 encryption\n• 5000+ servers in 60+ countries\n• No-logs policy\n• 24/7 customer support\n• Up to 10 simultaneous connections\n• Kill switch and DNS leak protection\n• Split tunneling support\n• Works on all devices (Windows, Mac, iOS, Android, Linux)',
  price: { btc: 0.0025, eur: 89.99 },
  images: [
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop',
  ],
  seller: {
    id: 'seller1',
    name: 'SecureNet',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    rating: 4.8,
    reviews: 1247,
    verified: true,
    memberSince: '2021',
    responseTime: '2 hours',
  },
  category: 'Services',
  rating: 4.8,
  reviews: 1247,
  views: 15420,
  inStock: true,
  deliveryTime: 'Instant',
  tags: ['VPN', 'Privacy', 'Security', 'Lifetime'],
  specifications: {
    'Subscription Type': 'Lifetime',
    'Devices': 'Up to 10',
    'Servers': '5000+',
    'Countries': '60+',
    'Encryption': 'AES-256',
    'Protocol': 'OpenVPN, IKEv2, WireGuard',
    'Logging': 'No-logs policy',
    'Support': '24/7 Live Chat',
  },
};

const mockReviews = [
  {
    id: '1',
    user: {
      name: 'John Doe',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    },
    rating: 5,
    date: '2024-01-15',
    content: 'Excellent VPN service! Fast speeds and great customer support. Worth every satoshi.',
    helpful: 24,
  },
  {
    id: '2',
    user: {
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
    },
    rating: 4,
    date: '2024-01-10',
    content: 'Good overall experience. The app is user-friendly and connections are stable.',
    helpful: 18,
  },
  {
    id: '3',
    user: {
      name: 'Mike Johnson',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    },
    rating: 5,
    date: '2024-01-05',
    content: 'Best VPN I\'ve ever used. Lifetime access is an amazing deal!',
    helpful: 31,
  },
];

export default function ProductPage() {
  const params = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');

  const handleAddToCart = () => {
    console.log('Added to cart:', { productId: params.id, quantity });
  };

  const handleSubmitReview = () => {
    console.log('Review submitted:', { rating: reviewRating, content: reviewContent });
    setReviewContent('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <a href="/market" className="hover:text-primary">Market</a>
              <span>/</span>
              <a href={`/market?category=${mockProduct.category}`} className="hover:text-primary">
                {mockProduct.category}
              </a>
              <span>/</span>
              <span className="text-foreground">{mockProduct.name}</span>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Image Gallery */}
              <div className="space-y-4">
                <div className="relative aspect-square rounded-lg overflow-hidden">
                  <Image
                    src={mockProduct.images[selectedImage]}
                    alt={mockProduct.name}
                    fill
                    className="object-cover"
                  />
                  {mockProduct.inStock && (
                    <Badge className="absolute top-4 left-4 bg-green-600">In Stock</Badge>
                  )}
                </div>
                
                <div className="flex gap-2 overflow-x-auto">
                  {mockProduct.images.map((image, index) => (
                    <button
                      key={index}
                      className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 ${
                        selectedImage === index ? 'border-primary' : 'border-border'
                      }`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <Image
                        src={image}
                        alt={`${mockProduct.name} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h1 className="text-3xl font-bold">{mockProduct.name}</h1>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Heart className="h-5 w-5" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Share2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{mockProduct.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground">({mockProduct.reviews} reviews)</span>
                    </div>
                    <Badge variant="secondary">{mockProduct.category}</Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Package className="h-4 w-4" />
                      <span>{mockProduct.views} views</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-1 text-3xl font-bold text-primary">
                      <Bitcoin className="h-8 w-8" />
                      <span>{mockProduct.price.btc.toFixed(6)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-lg text-muted-foreground">
                      <Euro className="h-5 w-5" />
                      <span>€{mockProduct.price.eur.toFixed(2)}</span>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-6 whitespace-pre-line">
                    {mockProduct.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {mockProduct.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Quantity and Add to Cart */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Quantity:</span>
                      <Select value={quantity.toString()} onValueChange={(value) => setQuantity(parseInt(value))}>
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      size="lg" 
                      className="flex-1"
                      onClick={handleAddToCart}
                      disabled={!mockProduct.inStock}
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Add to Cart
                    </Button>
                  </div>

                  {/* Delivery Info */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Package className="h-4 w-4" />
                      <span>Delivery: {mockProduct.deliveryTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield className="h-4 w-4" />
                      <span>Escrow Protected</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Specifications */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Specifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(mockProduct.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-2 border-b">
                          <span className="font-medium">{key}</span>
                          <span className="text-muted-foreground">{value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Seller Info */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Seller Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={mockProduct.seller.avatar} alt={mockProduct.seller.name} />
                        <AvatarFallback>{mockProduct.seller.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{mockProduct.seller.name}</h3>
                          {mockProduct.seller.verified && (
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{mockProduct.seller.rating.toFixed(1)}</span>
                          <span className="text-muted-foreground">({mockProduct.seller.reviews})</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Member since</span>
                        <span>{mockProduct.seller.memberSince}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Response time</span>
                        <span>{mockProduct.seller.responseTime}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        View Profile
                      </Button>
                      <Button size="sm" className="flex-1">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Contact
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Add Review */}
                  <div className="mb-8 p-6 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold mb-4">Write a Review</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Rating</label>
                        <Select value={reviewRating.toString()} onValueChange={(value) => setReviewRating(parseInt(value))}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[5, 4, 3, 2, 1].map((rating) => (
                              <SelectItem key={rating} value={rating.toString()}>
                                {rating} Star{rating !== 1 ? 's' : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Your Review</label>
                        <Textarea
                          placeholder="Share your experience with this product..."
                          value={reviewContent}
                          onChange={(e) => setReviewContent(e.target.value)}
                          rows={4}
                        />
                      </div>
                      <Button onClick={handleSubmitReview}>
                        Submit Review
                      </Button>
                    </div>
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-6">
                    {mockReviews.map((review) => (
                      <div key={review.id} className="border-b pb-6 last:border-b-0">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={review.user.avatar} alt={review.user.name} />
                            <AvatarFallback>{review.user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{review.user.name}</h4>
                                <div className="flex items-center gap-1">
                                  {[...Array(review.rating)].map((_, i) => (
                                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  ))}
                                </div>
                              </div>
                              <span className="text-sm text-muted-foreground">{review.date}</span>
                            </div>
                            <p className="text-muted-foreground mb-2">{review.content}</p>
                            <Button variant="ghost" size="sm" className="text-xs">
                              Helpful ({review.helpful})
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
  );
}