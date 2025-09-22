'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bitcoin, Shield, Zap, Users, Star, ArrowRight, CheckCircle, TrendingUp, Lock, MessageSquare } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { FadeIn, SlideIn, StaggerContainer, StaggerItem } from '@/components/ui/motion-wrapper';

export default function Home() {
  const features = [
    {
      icon: Shield,
      title: '100% Anonymous',
      description: 'Shop with complete privacy. No personal information required.',
    },
    {
      icon: Bitcoin,
      title: 'Bitcoin Payments',
      description: 'Fast, secure, and decentralized cryptocurrency transactions.',
    },
    {
      icon: Lock,
      title: 'Escrow Protection',
      description: 'Your funds are secured until you receive your order.',
    },
    {
      icon: Zap,
      title: 'Instant Delivery',
      description: 'Digital products delivered instantly upon payment confirmation.',
    },
  ];

  const testimonials = [
    {
      name: 'Alex Thompson',
      role: 'Digital Artist',
      content: 'Finally, a marketplace that respects privacy. The escrow system gives me peace of mind.',
      rating: 5,
    },
    {
      name: 'Sarah Chen',
      role: 'Software Developer',
      content: 'Bitcoin payments are seamless. Love the anonymity and security features.',
      rating: 5,
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Content Creator',
      content: 'Best platform for digital goods. Fast, secure, and completely private.',
      rating: 5,
    },
  ];

  const stats = [
    { label: 'Active Users', value: '50K+', icon: Users },
    { label: 'Transactions', value: '2M+', icon: TrendingUp },
    { label: 'Success Rate', value: '99.8%', icon: CheckCircle },
    { label: 'Support Rating', value: '4.9/5', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <FadeIn delay={0.2}>
              <div className="space-y-8">
                <div className="space-y-4">
                  <Badge variant="secondary" className="text-sm">
                    🚀 New Era of E-commerce
                  </Badge>
                  <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-foreground to-primary/60 bg-clip-text text-transparent">
                    Shop Anonymously with Bitcoin
                  </h1>
                  <p className="text-xl text-muted-foreground max-w-2xl">
                    Experience the future of decentralized commerce. Complete privacy, 
                    secure escrow, and instant Bitcoin payments. No KYC, no limits.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="motion-safe">
                    <Button size="lg" className="text-lg px-8 py-6">
                      Start Shopping
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                  <div className="motion-safe">
                    <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                      Become a Seller
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">No Registration Required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">100% Anonymous</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">Instant Setup</span>
                  </div>
                </div>
              </div>
            </FadeIn>

            <SlideIn direction="right" delay={0.4}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-2xl blur-3xl"></div>
                <Card className="relative bg-background/80 backdrop-blur-sm border-2 border-primary/20">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div className="text-center">
                        <Bitcoin className="h-16 w-16 mx-auto mb-4 text-primary" />
                        <h3 className="text-2xl font-bold mb-2">Live Statistics</h3>
                      </div>
                      <StaggerContainer>
                        <div className="grid grid-cols-2 gap-4">
                          {stats.map((stat, index) => (
                            <StaggerItem key={index}>
                              <div className="text-center p-4 rounded-lg bg-background/50">
                                <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <div className="text-sm text-muted-foreground">{stat.label}</div>
                              </div>
                            </StaggerItem>
                          ))}
                        </div>
                      </StaggerContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </SlideIn>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <FadeIn delay={0.6}>
            <div className="text-center space-y-4 mb-16">
              <Badge variant="secondary">Why Choose Us</Badge>
              <h2 className="text-3xl lg:text-4xl font-bold">
                Revolutionary Features
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Built for the future of decentralized commerce with privacy and security at its core.
              </p>
            </div>
          </FadeIn>

          <StaggerContainer>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <StaggerItem key={index}>
                  <div className="hover:shadow-lg transition-shadow">
                    <Card className="text-center p-6">
                      <CardContent className="space-y-4">
                        <div className="motion-safe">
                          <feature.icon className="h-12 w-12 mx-auto text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                </StaggerItem>
              ))}
            </div>
          </StaggerContainer>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <FadeIn delay={0.8}>
            <div className="text-center space-y-4 mb-16">
              <Badge variant="secondary">Trusted by Thousands</Badge>
              <h2 className="text-3xl lg:text-4xl font-bold">
                What Our Users Say
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of satisfied users who have embraced the future of anonymous shopping.
              </p>
            </div>
          </FadeIn>

          <StaggerContainer>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <StaggerItem key={index}>
                  <div className="hover:shadow-lg transition-shadow">
                    <Card className="p-6">
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-1">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-yellow-400" style={{ fill: 'currentColor' }} />
                          ))}
                        </div>
                        <p className="text-muted-foreground italic">
                          "{testimonial.content}"
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="font-semibold text-sm">
                              {testimonial.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{testimonial.name}</div>
                            <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </StaggerItem>
              ))}
            </div>
          </StaggerContainer>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary to-blue-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              Ready to Experience the Future?
            </h2>
            <p className="text-xl text-white/90">
              Join thousands of users who have already embraced anonymous shopping with Bitcoin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                Start Shopping Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-primary">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Bitcoin className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold">CryptoShop</span>
              </div>
              <p className="text-muted-foreground">
                The future of anonymous decentralized commerce.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Marketplace</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Browse Products</a></li>
                <li><a href="#" className="hover:text-primary">Become a Seller</a></li>
                <li><a href="#" className="hover:text-primary">How it Works</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Help Center</a></li>
                <li><a href="#" className="hover:text-primary">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary">Security</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Legal</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary">Disclaimer</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 CryptoShop. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}