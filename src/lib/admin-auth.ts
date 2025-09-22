import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Admin authentication middleware
export async function requireAdmin(request: NextRequest) {
  try {
    console.log('requireAdmin called');
    
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    console.log('Auth header in requireAdmin:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Missing or invalid authorization header');
      return {
        success: false,
        error: 'Missing or invalid authorization header',
        status: 401
      };
    }

    const accessToken = authHeader.substring(7);
    console.log('Access token extracted:', accessToken.substring(0, 10) + '...');
    
    // Find user by access token
    const user = await db.user.findUnique({
      where: { accessToken },
      include: {
        sellerProfile: true,
        wallet: true,
      },
    });

    if (!user) {
      console.log('User not found for access token');
      return {
        success: false,
        error: 'Invalid access token',
        status: 401
      };
    }

    console.log('User found:', user.username, 'isAdmin:', user.isAdmin);

    // Check if user is admin
    if (!user.isAdmin) {
      console.log('User is not admin');
      return {
        success: false,
        error: 'Access denied. Admin privileges required.',
        status: 403
      };
    }

    console.log('Admin authentication successful');
    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        isSeller: user.isSeller,
        isVerified: user.isVerified,
        accessToken: user.accessToken,
        bitcoinAddress: user.bitcoinAddress,
      }
    };
  } catch (error) {
    console.error('Admin authentication error:', error);
    return {
      success: false,
      error: 'Internal server error',
      status: 500
    };
  }
}

// Middleware to protect admin routes
export async function adminMiddleware(request: NextRequest) {
  const authResult = await requireAdmin(request);
  
  if (!authResult.success) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }
  
  // Add user info to request headers for downstream use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', authResult.user.id);
  requestHeaders.set('x-user-username', authResult.user.username);
  requestHeaders.set('x-user-is-admin', authResult.user.isAdmin.toString());
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Helper function to get current admin user from request
export function getCurrentAdminUser(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  const username = request.headers.get('x-user-username');
  const isAdmin = request.headers.get('x-user-is-admin') === 'true';
  
  if (!userId || !username || !isAdmin) {
    return null;
  }
  
  return {
    id: userId,
    username: username,
    isAdmin: isAdmin,
  };
}

// Check if user has specific admin permissions
export function hasAdminPermission(user: any, permission: string) {
  if (!user || !user.isAdmin) {
    return false;
  }
  
  // Define admin permissions
  const adminPermissions = {
    'users:read': true,
    'users:write': true,
    'users:delete': true,
    'products:read': true,
    'products:write': true,
    'products:delete': true,
    'orders:read': true,
    'orders:write': true,
    'orders:delete': true,
    'support:read': true,
    'support:write': true,
    'analytics:read': true,
    'settings:read': true,
    'settings:write': true,
  };
  
  return adminPermissions[permission as keyof typeof adminPermissions] || false;
}