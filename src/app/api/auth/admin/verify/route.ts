import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    console.log('Admin verification request received');
    
    const authHeader = request.headers.get('authorization');
    console.log('Authorization header:', authHeader ? 'Present' : 'Missing');
    
    const authResult = await requireAdmin(request);
    
    if (!authResult.success) {
      console.log('Admin verification failed:', authResult.error);
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    console.log('Admin verification successful for user:', authResult.user.username);
    
    return NextResponse.json({
      success: true,
      user: authResult.user
    });

  } catch (error) {
    console.error('Admin verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}