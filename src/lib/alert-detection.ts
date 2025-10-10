import { getDatabaseConnection } from './database';
import { AnalyticsEvent } from '@/utils/analytics-tracker';

export interface AlertDetectionResult {
  triggered: boolean;
  riskScore: number;
  metadata: any;
  description: string;
}

export interface DetectionContext {
  sessionId: string;
  userId?: string;
  certificateId?: string;
  timeWindowMinutes: number;
}

/**
 * Multiple Downloads Alert
 * Detects when a user downloads multiple certificates rapidly
 */
export async function detectMultipleDownloads(
  context: DetectionContext
): Promise<AlertDetectionResult> {
  const db = await getDatabaseConnection();

  try {
    const result = await db.query(`
      SELECT
        COUNT(*) as download_count,
        array_agg(certificate_id) as certificates,
        array_agg(id) as event_ids,
        MIN(timestamp) as first_download,
        MAX(timestamp) as last_download
      FROM analytics_events
      WHERE session_id = $1
        AND event_type = 'download'
        AND timestamp >= NOW() - INTERVAL '${context.timeWindowMinutes} minutes'
    `, [context.sessionId]);

    const row = result.rows[0];
    const downloadCount = parseInt(row.download_count);

    if (downloadCount >= 5) {
      const timeSpan = new Date(row.last_download).getTime() - new Date(row.first_download).getTime();
      const avgTimeBetween = timeSpan / (downloadCount - 1);

      return {
        triggered: true,
        riskScore: Math.min(40 + (downloadCount - 5) * 5, 80),
        metadata: {
          downloadCount,
          certificates: row.certificates,
          eventIds: row.event_ids,
          timeSpanMinutes: timeSpan / (1000 * 60),
          avgTimeBetweenDownloads: avgTimeBetween / 1000
        },
        description: `${downloadCount} downloads in ${context.timeWindowMinutes} minutes from session ${context.sessionId}`
      };
    }

    return { triggered: false, riskScore: 0, metadata: {}, description: '' };
  } catch (error) {
    console.error('Error detecting multiple downloads:', error);
    return { triggered: false, riskScore: 0, metadata: {}, description: '' };
  }
}

/**
 * Rapid Navigation Alert
 * Identifies unusual browsing patterns (too many certificates viewed quickly)
 */
export async function detectRapidNavigation(
  context: DetectionContext
): Promise<AlertDetectionResult> {
  const db = await getDatabaseConnection();

  try {
    const result = await db.query(`
      SELECT
        COUNT(*) as view_count,
        array_agg(certificate_id) as certificates,
        array_agg(id) as event_ids,
        MIN(timestamp) as first_view,
        MAX(timestamp) as last_view
      FROM analytics_events
      WHERE session_id = $1
        AND event_type = 'view'
        AND timestamp >= NOW() - INTERVAL '${context.timeWindowMinutes} minutes'
    `, [context.sessionId]);

    const row = result.rows[0];
    const viewCount = parseInt(row.view_count);

    if (viewCount >= 20) {
      const timeSpan = new Date(row.last_view).getTime() - new Date(row.first_view).getTime();
      const avgTimePerView = timeSpan / viewCount;

      // Alert if average time per view is less than 5 seconds
      if (avgTimePerView < 5000) {
        return {
          triggered: true,
          riskScore: Math.min(20 + (viewCount - 20) * 2, 60),
          metadata: {
            viewCount,
            certificates: row.certificates,
            eventIds: row.event_ids,
            timeSpanMinutes: timeSpan / (1000 * 60),
            avgTimePerView: avgTimePerView / 1000
          },
          description: `${viewCount} rapid views in ${context.timeWindowMinutes} minutes from session ${context.sessionId}`
        };
      }
    }

    return { triggered: false, riskScore: 0, metadata: {}, description: '' };
  } catch (error) {
    console.error('Error detecting rapid navigation:', error);
    return { triggered: false, riskScore: 0, metadata: {}, description: '' };
  }
}

/**
 * Screenshot Attempts Alert
 * Flags repeated screenshot detection events
 */
export async function detectScreenshotAttempts(
  context: DetectionContext
): Promise<AlertDetectionResult> {
  const db = await getDatabaseConnection();

  try {
    const result = await db.query(`
      SELECT
        COUNT(*) as screenshot_count,
        array_agg(certificate_id) as certificates,
        array_agg(id) as event_ids,
        array_agg(interaction_data->>'method') as methods
      FROM analytics_events
      WHERE session_id = $1
        AND event_type = 'screenshot_attempt'
        AND timestamp >= NOW() - INTERVAL '${context.timeWindowMinutes} minutes'
    `, [context.sessionId]);

    const row = result.rows[0];
    const screenshotCount = parseInt(row.screenshot_count);

    if (screenshotCount >= 1) {
      return {
        triggered: true,
        riskScore: Math.min(30 + screenshotCount * 10, 90),
        metadata: {
          screenshotCount,
          certificates: row.certificates,
          eventIds: row.event_ids,
          methods: row.methods
        },
        description: `${screenshotCount} screenshot attempts in ${context.timeWindowMinutes} minutes from session ${context.sessionId}`
      };
    }

    return { triggered: false, riskScore: 0, metadata: {}, description: '' };
  } catch (error) {
    console.error('Error detecting screenshot attempts:', error);
    return { triggered: false, riskScore: 0, metadata: {}, description: '' };
  }
}

/**
 * Right-Click Abuse Alert
 * Monitors excessive right-click attempts
 */
export async function detectRightClickAbuse(
  context: DetectionContext
): Promise<AlertDetectionResult> {
  const db = await getDatabaseConnection();

  try {
    const result = await db.query(`
      SELECT
        COUNT(*) as right_click_count,
        array_agg(certificate_id) as certificates,
        array_agg(id) as event_ids,
        array_agg(interaction_data->>'targetElement') as target_elements
      FROM analytics_events
      WHERE session_id = $1
        AND event_type = 'right_click'
        AND timestamp >= NOW() - INTERVAL '${context.timeWindowMinutes} minutes'
    `, [context.sessionId]);

    const row = result.rows[0];
    const rightClickCount = parseInt(row.right_click_count);

    if (rightClickCount >= 10) {
      return {
        triggered: true,
        riskScore: Math.min(15 + (rightClickCount - 10) * 3, 70),
        metadata: {
          rightClickCount,
          certificates: row.certificates,
          eventIds: row.event_ids,
          targetElements: row.target_elements
        },
        description: `${rightClickCount} right-click events in ${context.timeWindowMinutes} minutes from session ${context.sessionId}`
      };
    }

    return { triggered: false, riskScore: 0, metadata: {}, description: '' };
  } catch (error) {
    console.error('Error detecting right-click abuse:', error);
    return { triggered: false, riskScore: 0, metadata: {}, description: '' };
  }
}

/**
 * Session Anomaly Alert
 * Detects suspicious session durations or patterns
 */
export async function detectSessionAnomaly(
  context: DetectionContext
): Promise<AlertDetectionResult> {
  const db = await getDatabaseConnection();

  try {
    // Get session data
    const sessionResult = await db.query(`
      SELECT
        start_time,
        end_time,
        duration,
        last_activity,
        EXTRACT(EPOCH FROM (NOW() - start_time)) / 60 as session_duration_minutes
      FROM user_sessions
      WHERE session_id = $1
    `, [context.sessionId]);

    if (sessionResult.rows.length === 0) {
      return { triggered: false, riskScore: 0, metadata: {}, description: '' };
    }

    const session = sessionResult.rows[0];
    const sessionDuration = session.session_duration_minutes;

    // Get event statistics for the session
    const eventStats = await db.query(`
      SELECT
        COUNT(*) as total_events,
        COUNT(DISTINCT certificate_id) as unique_certificates,
        AVG((security_flags->>'riskScore')::float) as avg_risk_score,
        COUNT(CASE WHEN event_type = 'download' THEN 1 END) as download_count,
        COUNT(CASE WHEN event_type = 'screenshot_attempt' THEN 1 END) as screenshot_count,
        COUNT(CASE WHEN event_type = 'right_click' THEN 1 END) as right_click_count
      FROM analytics_events
      WHERE session_id = $1
        AND timestamp >= NOW() - INTERVAL '${context.timeWindowMinutes} minutes'
    `, [context.sessionId]);

    const stats = eventStats.rows[0];
    let riskScore = 0;
    const anomalies: string[] = [];

    // Check for unusually long sessions (>8 hours)
    if (sessionDuration > 480) {
      riskScore += 25;
      anomalies.push('extended_session');
    }

    // Check for high event frequency
    const eventsPerMinute = stats.total_events / context.timeWindowMinutes;
    if (eventsPerMinute > 10) {
      riskScore += 20;
      anomalies.push('high_frequency_events');
    }

    // Check for suspicious event patterns
    if (stats.download_count > 0 && stats.screenshot_count > 0) {
      riskScore += 30;
      anomalies.push('download_with_screenshots');
    }

    if (stats.right_click_count > stats.download_count * 2) {
      riskScore += 15;
      anomalies.push('excessive_right_clicks');
    }

    // Check for low certificate diversity (same certificate viewed repeatedly)
    if (stats.total_events > 20 && stats.unique_certificates === 1) {
      riskScore += 20;
      anomalies.push('single_certificate_focus');
    }

    if (riskScore >= 40) {
      return {
        triggered: true,
        riskScore: Math.min(riskScore, 95),
        metadata: {
          sessionDuration,
          totalEvents: stats.total_events,
          uniqueCertificates: stats.unique_certificates,
          avgRiskScore: stats.avg_risk_score,
          downloadCount: stats.download_count,
          screenshotCount: stats.screenshot_count,
          rightClickCount: stats.right_click_count,
          anomalies
        },
        description: `Session anomaly detected: ${anomalies.join(', ')} in session ${context.sessionId}`
      };
    }

    return { triggered: false, riskScore: 0, metadata: {}, description: '' };
  } catch (error) {
    console.error('Error detecting session anomaly:', error);
    return { triggered: false, riskScore: 0, metadata: {}, description: '' };
  }
}

/**
 * Run all detection functions for a given context
 */
export async function runAllDetections(
  context: DetectionContext
): Promise<AlertDetectionResult[]> {
  const detections = await Promise.all([
    detectMultipleDownloads(context),
    detectRapidNavigation(context),
    detectScreenshotAttempts(context),
    detectRightClickAbuse(context),
    detectSessionAnomaly(context)
  ]);

  return detections.filter(detection => detection.triggered);
}