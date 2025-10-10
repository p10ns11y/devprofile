import { NextRequest, NextResponse } from 'next/server';
import { deleteUserData } from '@/lib/intelli-insights-data';

// Simple audit log store - in production, use proper logging
let auditLog: any[] = [];

function logDeletion(userId: string, result: any, ip: string): void {
  auditLog.push({
    timestamp: Date.now(),
    action: 'data_deletion',
    userId,
    result,
    ip,
    userAgent: 'api-request' // In production, get from request headers
  });
}

function validateDeletionRequest(body: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!body.userId || typeof body.userId !== 'string') {
    errors.push('userId is required and must be a string');
  }

  if (!body.confirmation || typeof body.confirmation !== 'string') {
    errors.push('confirmation is required and must be a string');
  }

  // Require specific confirmation text for GDPR compliance
  if (body.confirmation !== 'DELETE_ALL_MY_DATA') {
    errors.push('confirmation must be exactly "DELETE_ALL_MY_DATA"');
  }

  if (body.verificationToken && typeof body.verificationToken !== 'string') {
    errors.push('verificationToken must be a string if provided');
  }

  return { isValid: errors.length === 0, errors };
}

function verifyUserIdentity(userId: string, verificationToken?: string): boolean {
  // In production, implement proper user verification
  // This could involve checking JWT tokens, email verification codes, etc.

  if (!verificationToken) {
    // For demo purposes, allow deletion without token
    // In production, this should require verification
    return true;
  }

  // Simple token verification (in production, use proper JWT or similar)
  return verificationToken === `verify-${userId}`;
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const clientIP = request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    'unknown';

    // Validate request
    const validation = validateDeletionRequest(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Invalid deletion request', details: validation.errors },
        { status: 400 }
      );
    }

    const { userId, verificationToken } = body;

    // Verify user identity
    if (!verifyUserIdentity(userId, verificationToken)) {
      return NextResponse.json(
        { error: 'User verification failed' },
        { status: 403 }
      );
    }

    // Perform secure deletion
    const deletionResult = deleteUserData(userId);

    // Log the deletion for audit purposes
    logDeletion(userId, deletionResult, clientIP);

    // In production, also:
    // - Queue data for permanent deletion from backups
    // - Notify relevant systems
    // - Send confirmation email to user

    return NextResponse.json({
      success: true,
      message: 'User data deletion completed',
      deleted: deletionResult,
      auditId: `audit-${Date.now()}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Intelli Insights data deletion API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for checking deletion status (optional)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const auditId = searchParams.get('auditId');

    if (!auditId) {
      return NextResponse.json(
        { error: 'auditId parameter is required' },
        { status: 400 }
      );
    }

    // Find audit log entry
    const auditEntry = auditLog.find(entry => `audit-${entry.timestamp}` === auditId);

    if (!auditEntry) {
      return NextResponse.json(
        { error: 'Audit record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      auditId,
      status: 'completed',
      timestamp: new Date(auditEntry.timestamp).toISOString(),
      action: auditEntry.action,
      result: auditEntry.result
    });

  } catch (error) {
    console.error('Intelli Insights deletion status API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}