import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsEvent } from '@/utils/analytics-tracker';
import { addEvent, updateSession, addSession } from '@/lib/intelli-insights-data';
import { getAlertProcessor } from '@/lib/alert-processor';

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limit: 100 events per minute per IP
const RATE_LIMIT = 100;
const RATE_WINDOW = 60 * 1000; // 1 minute

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const clientIP = request.headers.get('x-client-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) return realIP;
  if (clientIP) return clientIP;

  return 'unknown';
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitStore.get(ip);

  if (!limit || now > limit.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (limit.count >= RATE_LIMIT) {
    return false;
  }

  limit.count++;
  return true;
}

function validateAnalyticsEvent(event: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  if (!event.id || typeof event.id !== 'string') {
    errors.push('id is required and must be a string');
  }

  if (!event.eventType || !['view', 'download', 'right_click', 'screenshot_attempt', 'navigation', 'session_start', 'session_end'].includes(event.eventType)) {
    errors.push('eventType is required and must be one of: view, download, right_click, screenshot_attempt, navigation, session_start, session_end');
  }

  if (!event.certificateId || typeof event.certificateId !== 'string') {
    errors.push('certificateId is required and must be a string');
  }

  if (!event.timestamp || typeof event.timestamp !== 'number') {
    errors.push('timestamp is required and must be a number');
  }

  if (!event.sessionId || typeof event.sessionId !== 'string') {
    errors.push('sessionId is required and must be a string');
  }

  // Validate nested objects
  if (!event.deviceInfo || typeof event.deviceInfo !== 'object') {
    errors.push('deviceInfo is required and must be an object');
  }

  if (!event.location || typeof event.location !== 'object') {
    errors.push('location is required and must be an object');
  }

  if (!event.interactionData || typeof event.interactionData !== 'object') {
    errors.push('interactionData is required and must be an object');
  }

  if (!event.securityFlags || typeof event.securityFlags !== 'object') {
    errors.push('securityFlags is required and must be an object');
  }

  if (!event.consentStatus || typeof event.consentStatus !== 'object') {
    errors.push('consentStatus is required and must be an object');
  }

  return { isValid: errors.length === 0, errors };
}

function sanitizeEvent(event: any): AnalyticsEvent {
  // Deep clone and sanitize
  const sanitized = JSON.parse(JSON.stringify(event));

  // Remove any potentially harmful data
  // In a real implementation, you'd use a proper sanitization library

  return sanitized;
}

function encryptEvent(event: AnalyticsEvent): string {
  // In production, use proper encryption like AES-256
  // For demo, just base64 encode
  return Buffer.from(JSON.stringify(event)).toString('base64');
}

async function storeEvent(event: AnalyticsEvent): Promise<void> {
  console.log(`Storing event ${event.id} in database`);
  // Store event in database
  await addEvent(event);
  console.log(`Event ${event.id} stored successfully`);

  // Update session
  try {
    console.log(`Updating session ${event.sessionId}`);
    await updateSession(event.sessionId, {
      lastActivity: event.timestamp
    });
    console.log(`Session ${event.sessionId} updated successfully`);
  } catch (error) {
    console.log(`Session ${event.sessionId} update failed, creating new session`);
    // Session might not exist, create it
    await addSession({
      sessionId: event.sessionId,
      startTime: event.timestamp,
      deviceFingerprint: event.deviceInfo ? `${event.deviceInfo.os}-${event.deviceInfo.browser}` : 'unknown',
      ipHash: 'hashed-ip', // In production, hash the actual IP
      consentGiven: event.consentStatus?.analytics || false,
      lastActivity: event.timestamp
    });
    console.log(`New session ${event.sessionId} created`);
  }

  // Trigger real-time alert processing
  try {
    console.log(`Processing alerts for event ${event.id}`);
    const processor = getAlertProcessor();
    await processor.processRealtime([event]);
    console.log(`Alert processing completed for event ${event.id}`);
  } catch (error) {
    console.error('Error processing real-time alerts:', error);
    // Don't fail the event storage if alert processing fails
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Intelli Insights events API: Request received');
    const clientIP = getClientIP(request);
    console.log('Client IP:', clientIP);

    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      console.log('Rate limit exceeded for IP:', clientIP);
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));

    // Validate request structure
    if (!body.events || !Array.isArray(body.events)) {
      return NextResponse.json(
        { error: 'events array is required' },
        { status: 400 }
      );
    }

    if (!body.sessionId || typeof body.sessionId !== 'string') {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    const events = body.events as AnalyticsEvent[];
    const processed: string[] = [];
    const errors: any[] = [];

    // Process each event
    console.log(`Processing ${events.length} events`);
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      console.log(`Processing event ${i + 1}/${events.length}:`, event.id, event.eventType);
      const validation = validateAnalyticsEvent(event);

      if (!validation.isValid) {
        console.log(`Event ${event.id} validation failed:`, validation.errors);
        errors.push({
          index: i,
          eventId: event.id || 'unknown',
          errors: validation.errors
        });
        continue;
      }

      // Sanitize and store
      const sanitizedEvent = sanitizeEvent(event);
      console.log(`Storing event ${sanitizedEvent.id}`);
      await storeEvent(sanitizedEvent);
      processed.push(sanitizedEvent.id);
    }

    return NextResponse.json({
      success: errors.length === 0,
      processed: processed.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Intelli Insights events API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}