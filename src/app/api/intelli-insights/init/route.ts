import { NextRequest, NextResponse } from 'next/server';
import { initializeIntelliInsights, isInitialized } from '@/lib/init';

function authenticateAdmin(request: NextRequest): boolean {
  // Simple API key authentication - in production, use JWT
  const apiKey = request.headers.get('x-api-key');
  const expectedKey = process.env.INTELLI_INSIGHTS_ADMIN_KEY || 'admin-key-123';

  return apiKey === expectedKey;
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    if (!authenticateAdmin(request)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    if (isInitialized()) {
      return NextResponse.json({
        success: true,
        message: 'Intelli Insights already initialized',
        initialized: true
      });
    }

    await initializeIntelliInsights();

    return NextResponse.json({
      success: true,
      message: 'Intelli Insights initialized successfully',
      initialized: true
    });

  } catch (error) {
    console.error('Intelli Insights initialization error:', error);
    return NextResponse.json(
      {
        error: 'Initialization failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    if (!authenticateAdmin(request)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      initialized: isInitialized(),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Intelli Insights status check error:', error);
    return NextResponse.json(
      { error: 'Status check failed' },
      { status: 500 }
    );
  }
}