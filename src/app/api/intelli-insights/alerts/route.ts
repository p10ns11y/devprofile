import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsEvent } from '@/utils/analytics-tracker';
import { getAlertProcessor } from '@/lib/alert-processor';
import { getAlerts, updateAlertStatus, getAlertStatistics } from '@/lib/alert-service';
import { initializeDefaultRules } from '@/lib/alert-rules';

function authenticateAdmin(request: NextRequest): boolean {
  // Simple API key authentication - in production, use JWT
  const apiKey = request.headers.get('x-api-key');
  const expectedKey = process.env.INTELLI_INSIGHTS_ADMIN_KEY || 'admin-key-123';

  return apiKey === expectedKey;
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
    const severity = searchParams.get('severity') as 'low' | 'medium' | 'high' | 'critical' | undefined;
    const type = searchParams.get('type');
    const sessionId = searchParams.get('sessionId');
    const status = searchParams.get('status') as 'active' | 'investigated' | 'resolved' | 'false_positive' | undefined;
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get alerts from database
    const alerts = await getAlerts({
      severity,
      type: type || undefined,
      sessionId: sessionId || undefined,
      status,
      limit,
      offset
    });

    // Get statistics
    const stats = await getAlertStatistics();

    return NextResponse.json({
      alerts: alerts.map(alert => ({
        id: alert.id,
        alertType: alert.alertType,
        severity: alert.severity,
        sessionId: alert.sessionId,
        userId: alert.userId,
        certificateId: alert.certificateId,
        riskScore: alert.riskScore,
        description: alert.description,
        metadata: alert.metadata,
        status: alert.status,
        createdAt: alert.createdAt.toISOString(),
        updatedAt: alert.updatedAt.toISOString()
      })),
      total: stats.total,
      statistics: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Intelli Insights alerts API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Real-time alert processing and management
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    if (!authenticateAdmin(request)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'process_events': {
        // Process a batch of events for real-time alerts
        const { events } = body;
        if (!events || !Array.isArray(events)) {
          return NextResponse.json(
            { error: 'Invalid events data' },
            { status: 400 }
          );
        }

        const processor = getAlertProcessor();
        const result = await processor.processRealtime(events);

        return NextResponse.json({
          success: true,
          alertsGenerated: result.alertsGenerated,
          processingTime: result.processingTime,
          timestamp: new Date().toISOString()
        });
      }

      case 'update_alert_status': {
        // Update alert status
        const { alertId, status, assignedTo, resolvedBy } = body;
        if (!alertId || !status) {
          return NextResponse.json(
            { error: 'Missing alertId or status' },
            { status: 400 }
          );
        }

        await updateAlertStatus(alertId, status, assignedTo, resolvedBy);

        return NextResponse.json({
          success: true,
          message: `Alert ${alertId} status updated to ${status}`
        });
      }

      case 'initialize_rules': {
        // Initialize default alert rules
        await initializeDefaultRules();

        return NextResponse.json({
          success: true,
          message: 'Default alert rules initialized'
        });
      }

      case 'backfill': {
        // Start backfill processing
        const { hoursBack = 24 } = body;
        const processor = getAlertProcessor();
        const jobId = await processor.backfillProcessing(hoursBack);

        return NextResponse.json({
          success: true,
          jobId,
          message: `Backfill processing started for ${hoursBack} hours of data`
        });
      }

      case 'get_job_status': {
        // Get processing job status
        const { jobId } = body;
        if (!jobId) {
          return NextResponse.json(
            { error: 'Missing jobId' },
            { status: 400 }
          );
        }

        const processor = getAlertProcessor();
        const job = processor.getJobStatus(jobId);

        if (!job) {
          return NextResponse.json(
            { error: 'Job not found' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          job: {
            ...job,
            startTime: job.startTime?.toISOString(),
            endTime: job.endTime?.toISOString()
          }
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: process_events, update_alert_status, initialize_rules, backfill, get_job_status' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Intelli Insights alerts API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}