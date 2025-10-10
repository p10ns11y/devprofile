import { NextRequest, NextResponse } from 'next/server';
import { ConsentSettings } from '@/utils/analytics-tracker';
import { addConsent, consentStore } from '@/lib/intelli-insights-data';

function validateConsentRequest(body: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (typeof body.analytics !== 'boolean') {
    errors.push('analytics must be a boolean');
  }

  if (typeof body.marketing !== 'boolean') {
    errors.push('marketing must be a boolean');
  }

  if (typeof body.security !== 'boolean') {
    errors.push('security must be a boolean');
  }

  if (!body.version || typeof body.version !== 'string') {
    errors.push('version is required and must be a string');
  }

  if (body.userId && typeof body.userId !== 'string') {
    errors.push('userId must be a string if provided');
  }

  return { isValid: errors.length === 0, errors };
}

function setConsentCookie(response: NextResponse, consent: ConsentSettings): void {
  const consentData = {
    analytics: consent.analytics,
    marketing: consent.marketing,
    security: consent.security,
    timestamp: consent.timestamp,
    version: consent.version
  };

  // Set secure, httpOnly cookie with 1 year expiration
  const cookieValue = Buffer.from(JSON.stringify(consentData)).toString('base64');
  const maxAge = 365 * 24 * 60 * 60; // 1 year

  response.cookies.set('intelli_insights_consent', cookieValue, {
    httpOnly: false, // Allow client-side access for consent checking
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge,
    path: '/'
  });
}

function getConsentFromCookie(request: NextRequest): ConsentSettings | null {
  try {
    const cookie = request.cookies.get('intelli_insights_consent');
    if (!cookie) return null;

    const decoded = Buffer.from(cookie.value, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validation = validateConsentRequest(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Invalid consent data', details: validation.errors },
        { status: 400 }
      );
    }

    // Create consent settings
    const consentSettings: ConsentSettings = {
      analytics: body.analytics,
      marketing: body.marketing,
      security: body.security,
      timestamp: Date.now(),
      version: body.version
    };

    // Store consent (anonymized)
    const consentRecord = {
      ...consentSettings,
      userId: body.userId || null, // Only store if explicitly provided
      ipHash: 'anonymous', // In production, hash the IP
      sessionId: body.sessionId || null
    };

    addConsent(consentRecord);

    // Create response
    const response = NextResponse.json({
      success: true,
      consent: consentSettings,
      message: 'Consent preferences updated successfully'
    });

    // Set secure cookie
    setConsentCookie(response, consentSettings);

    return response;

  } catch (error) {
    console.error('Intelli Insights consent API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get consent from cookie
    const consent = getConsentFromCookie(request);

    if (!consent) {
      return NextResponse.json(
        { error: 'No consent preferences found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      consent,
      source: 'cookie'
    });

  } catch (error) {
    console.error('Intelli Insights get consent API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Clear consent cookie
    const response = NextResponse.json({
      success: true,
      message: 'Consent preferences cleared'
    });

    response.cookies.set('intelli_insights_consent', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Intelli Insights delete consent API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}