import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@cryptoshop.com',
      password: 'admin123', // In production, use bcrypt
      accessToken: 'cs_admin_' + Date.now() + '_1234567890abcdef',
      isAdmin: true,
      isVerified: true,
    },
  });

  // Create test users
  const user1 = await prisma.user.create({
    data: {
      username: 'cryptotrader',
      email: 'trader@example.com',
      accessToken: 'token1',
      isSeller: true,
      isVerified: true,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      username: 'techseller',
      email: 'seller@example.com',
      accessToken: 'token2',
      isSeller: true,
      isVerified: true,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      username: 'buyer123',
      email: 'buyer@example.com',
      accessToken: 'token3',
      isSeller: false,
      isVerified: true,
    },
  });

  // Create seller profiles
  const seller1 = await prisma.seller.create({
    data: {
      userId: user1.id,
      storeName: 'CryptoMaster',
      description: 'Premium cryptocurrency and digital goods',
      category: 'Digital Goods',
      rating: 4.8,
      reviewCount: 1247,
      totalSales: 2156,
      totalRevenue: 15420,
      responseTime: '2 hours',
      isOnline: true,
    },
  });

  const seller2 = await prisma.seller.create({
    data: {
      userId: user2.id,
      storeName: 'TechGuru',
      description: 'High-quality tech products and software',
      category: 'Software',
      rating: 4.6,
      reviewCount: 892,
      totalSales: 432,
      totalRevenue: 8765,
      responseTime: '1 hour',
      isOnline: true,
    },
  });

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        sellerId: seller1.id,
        name: 'Premium VPN Subscription',
        description: 'Lifetime access to premium VPN service with unlimited bandwidth and military-grade encryption.',
        priceBtc: 0.0025,
        priceEur: 89.99,
        images: JSON.stringify(['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop']),
        category: 'Services',
        tags: JSON.stringify(['vpn', 'privacy', 'security']),
        inStock: true,
        stockQuantity: 100,
        deliveryTime: 'Instant',
        digitalProduct: true,
        downloadUrl: 'https://example.com/vpn-download',
        viewCount: 15420,
        salesCount: 1247,
        rating: 4.8,
        reviewCount: 1247,
      },
    }),
    prisma.product.create({
      data: {
        sellerId: seller2.id,
        name: 'Adobe Creative Suite License',
        description: 'Genuine Adobe Creative Suite with all apps included. Lifetime license with updates.',
        priceBtc: 0.015,
        priceEur: 549.99,
        images: JSON.stringify(['https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=400&fit=crop']),
        category: 'Software',
        tags: JSON.stringify(['adobe', 'creative', 'design']),
        inStock: true,
        stockQuantity: 50,
        deliveryTime: '24 hours',
        digitalProduct: true,
        downloadUrl: 'https://example.com/adobe-download',
        viewCount: 8765,
        salesCount: 892,
        rating: 4.9,
        reviewCount: 892,
      },
    }),
    prisma.product.create({
      data: {
        sellerId: seller1.id,
        name: 'Cryptocurrency Trading Course',
        description: 'Complete cryptocurrency trading course with strategies, analysis, and practical examples.',
        priceBtc: 0.005,
        priceEur: 179.99,
        images: JSON.stringify(['https://images.unsplash.com/photo-1639762582714-0bcfe22d1ac0?w=400&h=400&fit=crop']),
        category: 'Digital Goods',
        tags: JSON.stringify(['trading', 'crypto', 'course']),
        inStock: true,
        stockQuantity: 200,
        deliveryTime: 'Instant',
        digitalProduct: true,
        downloadUrl: 'https://example.com/trading-course',
        viewCount: 32154,
        salesCount: 2156,
        rating: 4.7,
        reviewCount: 2156,
      },
    }),
    prisma.product.create({
      data: {
        sellerId: seller2.id,
        name: 'Gaming PC Setup Guide',
        description: 'Complete guide to building the ultimate gaming PC with component recommendations and tutorials.',
        priceBtc: 0.001,
        priceEur: 34.99,
        images: JSON.stringify(['https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=400&fit=crop']),
        category: 'Books',
        tags: JSON.stringify(['gaming', 'pc', 'guide']),
        inStock: true,
        stockQuantity: 500,
        deliveryTime: 'Instant',
        digitalProduct: true,
        downloadUrl: 'https://example.com/gaming-guide',
        viewCount: 5678,
        salesCount: 432,
        rating: 4.6,
        reviewCount: 432,
      },
    }),
    prisma.product.create({
      data: {
        sellerId: seller1.id,
        name: 'Custom Logo Design',
        description: 'Professional custom logo design with unlimited revisions and source files included.',
        priceBtc: 0.003,
        priceEur: 109.99,
        images: JSON.stringify(['https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=400&fit=crop']),
        category: 'Art & Design',
        tags: JSON.stringify(['logo', 'design', 'branding']),
        inStock: true,
        stockQuantity: 25,
        deliveryTime: '3-5 days',
        digitalProduct: false,
        viewCount: 23451,
        salesCount: 1876,
        rating: 4.9,
        reviewCount: 1876,
      },
    }),
    prisma.product.create({
      data: {
        sellerId: seller2.id,
        name: 'Premium WordPress Theme',
        description: 'Modern, responsive WordPress theme with drag-and-drop builder and premium plugins.',
        priceBtc: 0.0015,
        priceEur: 54.99,
        images: JSON.stringify(['https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=400&fit=crop']),
        category: 'Software',
        tags: JSON.stringify(['wordpress', 'theme', 'cms']),
        inStock: true,
        stockQuantity: 100,
        deliveryTime: 'Instant',
        digitalProduct: true,
        downloadUrl: 'https://example.com/wordpress-theme',
        viewCount: 4321,
        salesCount: 654,
        rating: 4.5,
        reviewCount: 654,
      },
    }),
  ]);

  // Create wallets
  await Promise.all([
    prisma.wallet.create({
      data: {
        userId: user1.id,
        balanceBtc: 0.5,
        balanceEur: 18000,
        address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      },
    }),
    prisma.wallet.create({
      data: {
        userId: user2.id,
        balanceBtc: 0.3,
        balanceEur: 10800,
        address: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
      },
    }),
    prisma.wallet.create({
      data: {
        userId: user3.id,
        balanceBtc: 0.1,
        balanceEur: 3600,
        address: '1CbErtneaX2QVyUfwU7JGB7Wezv4WjgSmN',
      },
    }),
  ]);

  console.log('Database seeded successfully!');
  console.log(`Created ${products.length} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });