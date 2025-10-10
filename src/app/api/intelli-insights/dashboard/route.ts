import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsEvent } from '@/utils/analytics-tracker';
import { getEvents, getAnalyticsData } from '@/lib/intelli-insights-data';

interface DatabaseEvent extends Omit<AnalyticsEvent, 'timestamp'> {
  timestamp: number;
  createdAt: Date;
}

function authenticateAdmin(request: NextRequest): boolean {
  // Simple API key authentication - in production, use JWT
  const apiKey = request.headers.get('x-api-key');
  const expectedKey = process.env.INTELLI_INSIGHTS_ADMIN_KEY || 'admin-key-123';

  return apiKey === expectedKey;
}

async function aggregateAnalyticsData(query: any) {
  // Get real events from database
  const { getAnalyticsAggregation } = await import('@/lib/database-utils');

  const startDate = query.startDate ? new Date(query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = query.endDate ? new Date(query.endDate) : new Date();

  // Get aggregated data
  const aggregationData = await getAnalyticsAggregation(startDate, endDate, query.eventType, query.certificateId);

  // For individual events, we need to query them separately
  // For now, get a sample of recent events
  const { getDatabaseConnection } = await import('@/lib/database');
  const db = await getDatabaseConnection();

  const eventsQuery = `
    SELECT
      id, event_type as "eventType", certificate_id as "certificateId",
      timestamp, session_id as "sessionId", user_id as "userId",
      device_info as "deviceInfo", location, interaction_data as "interactionData",
      security_flags as "securityFlags", consent_status as "consentStatus",
      created_at as "createdAt"
    FROM analytics_events
    WHERE timestamp >= $1 AND timestamp <= $2
    ORDER BY timestamp DESC
    LIMIT 100
  `;

  const eventsResult = await db.query(eventsQuery, [startDate, endDate]);
  const filteredEvents: DatabaseEvent[] = eventsResult.rows.map((row: any) => ({
    ...row,
    timestamp: new Date(row.timestamp).getTime()
  }));

  // Pagination
  const limit = Math.min(parseInt(query.limit) || 1000, 10000);
  const offset = parseInt(query.offset) || 0;
  const paginatedEvents = filteredEvents.slice(offset, offset + limit);

  // Aggregate data
  const totalViews = filteredEvents.filter(e => e.eventType === 'view').length;
  const totalDownloads = filteredEvents.filter(e => e.eventType === 'download').length;
  const totalRightClicks = filteredEvents.filter(e => e.eventType === 'right_click').length;
  const totalScreenshotAttempts = filteredEvents.filter(e => e.eventType === 'screenshot_attempt').length;

  // Suspicious activities
  const suspiciousActivities = filteredEvents.filter(e =>
    e.securityFlags.isSuspicious ||
    e.eventType === 'screenshot_attempt' ||
    (e.eventType === 'right_click' && e.securityFlags.riskScore > 50)
  );

  // Group by certificate
  const certificateStats = filteredEvents.reduce((acc, event) => {
    if (!acc[event.certificateId]) {
      acc[event.certificateId] = {
        certificateId: event.certificateId,
        views: 0,
        downloads: 0,
        rightClicks: 0,
        screenshotAttempts: 0,
        suspiciousActivities: 0,
        avgViewDuration: 0,
        totalViewDuration: 0
      };
    }

    const stat = acc[event.certificateId];

    switch (event.eventType) {
      case 'view':
        stat.views++;
        if (event.interactionData.duration) {
          stat.totalViewDuration += event.interactionData.duration;
        }
        break;
      case 'download':
        stat.downloads++;
        break;
      case 'right_click':
        stat.rightClicks++;
        break;
      case 'screenshot_attempt':
        stat.screenshotAttempts++;
        stat.suspiciousActivities++;
        break;
    }

    if (event.securityFlags.isSuspicious) {
      stat.suspiciousActivities++;
    }

    return acc;
  }, {} as Record<string, any>);

  // Calculate averages
  Object.values(certificateStats).forEach((stat: any) => {
    if (stat.views > 0) {
      stat.avgViewDuration = Math.round(stat.totalViewDuration / stat.views);
    }
    delete stat.totalViewDuration;
  });

  // Time series data (last 30 days)
  const now = Date.now();
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
  const dailyStats = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now - (i * 24 * 60 * 60 * 1000));
    const dayStart = date.getTime();
    const dayEnd = dayStart + (24 * 60 * 60 * 1000);

    const dayEvents = filteredEvents.filter(e => e.timestamp >= dayStart && e.timestamp < dayEnd);

    dailyStats.push({
      date: date.toISOString().split('T')[0],
      views: dayEvents.filter(e => e.eventType === 'view').length,
      downloads: dayEvents.filter(e => e.eventType === 'download').length,
      suspicious: dayEvents.filter(e => e.securityFlags.isSuspicious).length
    });
  }

  return {
    summary: {
      totalEvents: filteredEvents.length,
      totalViews,
      totalDownloads,
      totalRightClicks,
      totalScreenshotAttempts,
      totalSuspiciousActivities: suspiciousActivities.length,
      uniqueCertificates: Object.keys(certificateStats).length,
      dateRange: {
        start: query.startDate || new Date(thirtyDaysAgo).toISOString(),
        end: query.endDate || new Date(now).toISOString()
      }
    },
    certificateStats: Object.values(certificateStats),
    dailyStats,
    events: paginatedEvents,
    pagination: {
      total: filteredEvents.length,
      limit,
      offset,
      hasMore: offset + limit < filteredEvents.length
    }
  };
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

    const { searchParams } = new URL(request.url);
    const query = {
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      eventType: searchParams.get('eventType'),
      certificateId: searchParams.get('certificateId'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset')
    };

    // In production, fetch from database
    // For demo, use in-memory store
    const data = await aggregateAnalyticsData(query);

    return NextResponse.json(data);

  } catch (error) {
    console.error('Intelli Insights dashboard API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}