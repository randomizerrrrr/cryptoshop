import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { traceRequest, captureError, recordMetric } from '@/lib/monitoring';

export const GET = traceRequest(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId');
    const period = searchParams.get('period') || '30d'; // 7d, 30d, 90d, 1y
    const type = searchParams.get('type') || 'overview'; // overview, sales, products, customers

    if (!sellerId) {
      return NextResponse.json(
        { error: 'Seller ID is required' },
        { status: 400 }
      );
    }

    // Verify seller exists and belongs to the authenticated user
    const seller = await db.seller.findUnique({
      where: { id: sellerId },
      include: {
        user: true,
        products: true,
        orders: {
          include: {
            buyer: true
          }
        }
      }
    });

    if (!seller) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }

    // Calculate date range based on period
    const now = new Date();
    const startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    let analytics;

    switch (type) {
      case 'overview':
        analytics = await getOverviewAnalytics(seller, startDate, now);
        break;
      case 'sales':
        analytics = await getSalesAnalytics(seller, startDate, now);
        break;
      case 'products':
        analytics = await getProductsAnalytics(seller, startDate, now);
        break;
      case 'customers':
        analytics = await getCustomersAnalytics(seller, startDate, now);
        break;
      default:
        analytics = await getOverviewAnalytics(seller, startDate, now);
    }

    recordMetric('analytics.request', 1, { type, period, sellerId });

    return NextResponse.json({
      success: true,
      data: analytics,
      metadata: {
        sellerId,
        period,
        type,
        generatedAt: now.toISOString(),
        dateRange: {
          start: startDate.toISOString(),
          end: now.toISOString()
        }
      }
    });

  } catch (error) {
    captureError(error as Error, { 
      endpoint: '/api/analytics', 
      method: 'GET',
      params: Object.fromEntries(new URL(request.url).searchParams)
    });
    
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
});

async function getOverviewAnalytics(seller: any, startDate: Date, endDate: Date) {
  // Get orders within the date range
  const orders = seller.orders.filter((order: any) => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= startDate && orderDate <= endDate;
  });

  // Calculate basic metrics
  const totalOrders = orders.length;
  const completedOrders = orders.filter((order: any) => order.status === 'completed').length;
  const totalRevenue = orders
    .filter((order: any) => order.status === 'completed')
    .reduce((sum: number, order: any) => sum + Number(order.totalEur || 0), 0);
  
  const averageOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;

  // Get product performance
  const productStats = seller.products.map((product: any) => {
    const productOrders = orders.filter((order: any) => 
      order.items?.some((item: any) => item.productId === product.id)
    );
    
    return {
      productId: product.id,
      productName: product.name,
      totalSold: productOrders.length,
      revenue: productOrders
        .filter((order: any) => order.status === 'completed')
        .reduce((sum: number, order: any) => {
          const item = order.items?.find((i: any) => i.productId === product.id);
          return sum + (Number(item?.priceEur || 0) * (item?.quantity || 1));
        }, 0),
      views: product.viewCount || 0,
      conversionRate: product.viewCount > 0 ? (productOrders.length / product.viewCount) * 100 : 0
    };
  });

  // Calculate growth rates
  const previousStartDate = new Date(startDate);
  const previousEndDate = new Date(startDate);
  previousStartDate.setDate(previousStartDate.getDate() - (endDate.getDate() - startDate.getDate()));

  const previousOrders = seller.orders.filter((order: any) => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= previousStartDate && orderDate <= previousEndDate;
  });

  const previousRevenue = previousOrders
    .filter((order: any) => order.status === 'completed')
    .reduce((sum: number, order: any) => sum + Number(order.totalEur || 0), 0);

  const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
  const ordersGrowth = previousOrders.length > 0 ? ((totalOrders - previousOrders.length) / previousOrders.length) * 100 : 0;

  return {
    summary: {
      totalOrders,
      completedOrders,
      totalRevenue,
      averageOrderValue,
      conversionRate: seller.products.length > 0 ? 
        (orders.length / seller.products.reduce((sum: number, p: any) => sum + (p.viewCount || 0), 1)) * 100 : 0
    },
    growth: {
      revenueGrowth,
      ordersGrowth
    },
    topProducts: productStats
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5),
    performance: {
      completionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
      averageRating: seller.rating || 0,
      activeProducts: seller.products.filter((p: any) => p.isActive).length
    }
  };
}

async function getSalesAnalytics(seller: any, startDate: Date, endDate: Date) {
  const orders = seller.orders.filter((order: any) => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= startDate && orderDate <= endDate;
  });

  // Group sales by day
  const salesByDay = {};
  const dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  for (let i = 0; i < dayCount; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateKey = date.toISOString().split('T')[0];
    salesByDay[dateKey] = {
      date: dateKey,
      orders: 0,
      revenue: 0,
      completedOrders: 0
    };
  }

  orders.forEach((order: any) => {
    const dateKey = new Date(order.createdAt).toISOString().split('T')[0];
    if (salesByDay[dateKey]) {
      salesByDay[dateKey].orders++;
      salesByDay[dateKey].revenue += Number(order.totalEur || 0);
      if (order.status === 'completed') {
        salesByDay[dateKey].completedOrders++;
      }
    }
  });

  // Calculate sales by product category
  const salesByCategory = {};
  seller.products.forEach((product: any) => {
    if (!salesByCategory[product.category]) {
      salesByCategory[product.category] = {
        category: product.category,
        orders: 0,
        revenue: 0,
        products: []
      };
    }
    
    const productOrders = orders.filter((order: any) => 
      order.items?.some((item: any) => item.productId === product.id)
    );
    
    salesByCategory[product.category].orders += productOrders.length;
    salesByCategory[product.category].revenue += productOrders
      .filter((order: any) => order.status === 'completed')
      .reduce((sum: number, order: any) => {
        const item = order.items?.find((i: any) => i.productId === product.id);
        return sum + (Number(item?.priceEur || 0) * (item?.quantity || 1));
      }, 0);
  });

  // Payment method breakdown
  const paymentMethods = {};
  orders.forEach((order: any) => {
    const method = order.paymentMethod || 'unknown';
    if (!paymentMethods[method]) {
      paymentMethods[method] = { count: 0, revenue: 0 };
    }
    paymentMethods[method].count++;
    paymentMethods[method].revenue += Number(order.totalEur || 0);
  });

  return {
    dailySales: Object.values(salesByDay),
    salesByCategory: Object.values(salesByCategory),
    paymentMethods: Object.entries(paymentMethods).map(([method, data]: [string, any]) => ({
      method,
      ...data
    })),
    totalSales: {
      orders: orders.length,
      revenue: orders.reduce((sum: number, order: any) => sum + Number(order.totalEur || 0), 0),
      completedOrders: orders.filter((order: any) => order.status === 'completed').length
    }
  };
}

async function getProductsAnalytics(seller: any, startDate: Date, endDate: Date) {
  const orders = seller.orders.filter((order: any) => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= startDate && orderDate <= endDate;
  });

  const productAnalytics = seller.products.map((product: any) => {
    const productOrders = orders.filter((order: any) => 
      order.items?.some((item: any) => item.productId === product.id)
    );

    const totalSold = productOrders.reduce((sum: number, order: any) => {
      const item = order.items?.find((i: any) => i.productId === product.id);
      return sum + (item?.quantity || 1);
    }, 0);

    const revenue = productOrders
      .filter((order: any) => order.status === 'completed')
      .reduce((sum: number, order: any) => {
        const item = order.items?.find((i: any) => i.productId === product.id);
        return sum + (Number(item?.priceEur || 0) * (item?.quantity || 1));
      }, 0);

    const views = product.viewCount || 0;
    const conversionRate = views > 0 ? (productOrders.length / views) * 100 : 0;

    // Calculate trend (simple comparison with previous period)
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - (endDate.getDate() - startDate.getDate()));
    
    const previousOrders = seller.orders.filter((order: any) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= previousStartDate && orderDate < startDate;
    }).filter((order: any) => 
      order.items?.some((item: any) => item.productId === product.id)
    );

    const trend = previousOrders.length > 0 ? 
      ((productOrders.length - previousOrders.length) / previousOrders.length) * 100 : 0;

    return {
      productId: product.id,
      name: product.name,
      category: product.category,
      price: {
        btc: product.priceBtc,
        eur: product.priceEur
      },
      inStock: product.inStock,
      stockQuantity: product.stockQuantity,
      isActive: product.isActive,
      metrics: {
        views,
        orders: productOrders.length,
        totalSold,
        revenue,
        conversionRate,
        averageRating: product.rating || 0,
        reviewCount: product.reviewCount || 0
      },
      trend: {
        value: trend,
        direction: trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable'
      }
    };
  });

  // Category performance
  const categoryPerformance = {};
  productAnalytics.forEach((product: any) => {
    if (!categoryPerformance[product.category]) {
      categoryPerformance[product.category] = {
        category: product.category,
        products: 0,
        totalViews: 0,
        totalOrders: 0,
        totalRevenue: 0,
        averageRating: 0,
        averageConversionRate: 0
      };
    }
    
    const cat = categoryPerformance[product.category];
    cat.products++;
    cat.totalViews += product.metrics.views;
    cat.totalOrders += product.metrics.orders;
    cat.totalRevenue += product.metrics.revenue;
  });

  // Calculate averages for categories
  Object.values(categoryPerformance).forEach((cat: any) => {
    cat.averageRating = productAnalytics
      .filter(p => p.category === cat.category)
      .reduce((sum: number, p: any) => sum + p.metrics.averageRating, 0) / 
      productAnalytics.filter(p => p.category === cat.category).length;
    
    cat.averageConversionRate = cat.totalViews > 0 ? 
      (cat.totalOrders / cat.totalViews) * 100 : 0;
  });

  return {
    products: productAnalytics,
    categoryPerformance: Object.values(categoryPerformance),
    summary: {
      totalProducts: seller.products.length,
      activeProducts: seller.products.filter((p: any) => p.isActive).length,
      totalViews: productAnalytics.reduce((sum: number, p: any) => sum + p.metrics.views, 0),
      totalOrders: productAnalytics.reduce((sum: number, p: any) => sum + p.metrics.orders, 0),
      totalRevenue: productAnalytics.reduce((sum: number, p: any) => sum + p.metrics.revenue, 0),
      averageConversionRate: productAnalytics.reduce((sum: number, p: any) => sum + p.metrics.conversionRate, 0) / productAnalytics.length
    }
  };
}

async function getCustomersAnalytics(seller: any, startDate: Date, endDate: Date) {
  const orders = seller.orders.filter((order: any) => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= startDate && orderDate <= endDate;
  });

  // Customer analytics
  const customers = {};
  orders.forEach((order: any) => {
    if (!customers[order.buyerId]) {
      customers[order.buyerId] = {
        customerId: order.buyerId,
        username: order.buyer?.username || 'Anonymous',
        firstOrder: order.createdAt,
        lastOrder: order.createdAt,
        totalOrders: 0,
        totalSpent: 0,
        completedOrders: 0,
        favoriteCategories: new Set(),
        averageOrderValue: 0
      };
    }
    
    const customer = customers[order.buyerId];
    customer.totalOrders++;
    customer.totalSpent += Number(order.totalEur || 0);
    customer.lastOrder = order.createdAt;
    
    if (order.status === 'completed') {
      customer.completedOrders++;
    }

    // Track favorite categories from order items
    order.items?.forEach((item: any) => {
      const product = seller.products.find((p: any) => p.id === item.productId);
      if (product) {
        customer.favoriteCategories.add(product.category);
      }
    });
  });

  // Convert to array and calculate averages
  const customerList = Object.values(customers).map((customer: any) => {
    customer.favoriteCategories = Array.from(customer.favoriteCategories);
    customer.averageOrderValue = customer.totalOrders > 0 ? customer.totalSpent / customer.totalOrders : 0;
    return customer;
  });

  // Customer segmentation
  const newCustomers = customerList.filter((c: any) => {
    const firstOrderDate = new Date(c.firstOrder);
    return firstOrderDate >= startDate;
  });

  const returningCustomers = customerList.filter((c: any) => {
    const firstOrderDate = new Date(c.firstOrder);
    return firstOrderDate < startDate;
  });

  // Customer value segments
  const highValueCustomers = customerList.filter((c: any) => c.totalSpent > 1000);
  const mediumValueCustomers = customerList.filter((c: any) => c.totalSpent > 100 && c.totalSpent <= 1000);
  const lowValueCustomers = customerList.filter((c: any) => c.totalSpent <= 100);

  // Geographic distribution (if available)
  const geographicData = {};
  customerList.forEach((customer: any) => {
    // This would require location data from user profiles
    // For now, we'll use a placeholder
    const region = 'Unknown';
    if (!geographicData[region]) {
      geographicData[region] = { region, customers: 0, revenue: 0 };
    }
    geographicData[region].customers++;
    geographicData[region].revenue += customer.totalSpent;
  });

  return {
    customers: customerList.sort((a: any, b: any) => b.totalSpent - a.totalSpent),
    segmentation: {
      newCustomers: newCustomers.length,
      returningCustomers: returningCustomers.length,
      customerRetentionRate: customerList.length > 0 ? 
        (returningCustomers.length / customerList.length) * 100 : 0,
      highValueCustomers: highValueCustomers.length,
      mediumValueCustomers: mediumValueCustomers.length,
      lowValueCustomers: lowValueCustomers.length
    },
    geographicDistribution: Object.values(geographicData),
    summary: {
      totalCustomers: customerList.length,
      averageOrdersPerCustomer: customerList.length > 0 ? 
        orders.length / customerList.length : 0,
      averageSpentPerCustomer: customerList.length > 0 ? 
        customerList.reduce((sum: number, c: any) => sum + c.totalSpent, 0) / customerList.length : 0,
      totalRevenue: orders.reduce((sum: number, order: any) => sum + Number(order.totalEur || 0), 0)
    }
  };
}