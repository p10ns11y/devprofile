import { getDatabaseConnection } from './database';
import { AnalyticsEvent } from '@/utils/analytics-tracker';

// Types for database operations
export interface EventBatch {
  events: AnalyticsEvent[];
  sessionId: string;
  clientVersion?: string;
}

export interface AggregationResult {
  date: string;
  eventType: string;
  eventCount: number;
  uniqueSessions: number;
  avgRiskScore: number;
  suspiciousEvents: number;
}

export interface AlertRule {
  id: string;
  name: string;
  conditions: any;
  severity: string;
  enabled: boolean;
  cooldownMinutes: number;
  lastTriggered?: Date;
}

export interface SecurityAlert {
  id: string;
  alertType: string;
  severity: string;
  sessionId?: string;
  userId?: string;
  certificateId?: string;
  eventIds: string[];
  riskScore: number;
  description: string;
  metadata?: any;
}

// Event insertion with batching
export async function insertAnalyticsEvents(batch: EventBatch): Promise<{ processed: number; errors: string[] }> {
  console.log(`insertAnalyticsEvents called with ${batch.events.length} events`);
  const db = await getDatabaseConnection();
  console.log('Database connection obtained');
  const errors: string[] = [];
  let processed = 0;

  try {
    // Start transaction
    const client = await db.getClient();
    console.log('Database client obtained, starting transaction');
    await client.query('BEGIN');

    try {
      for (const event of batch.events) {
        try {
          console.log(`Inserting event ${event.id} of type ${event.eventType}`);
          // Validate event data
          if (!event.id || !event.eventType || !event.timestamp) {
            console.log(`Event ${event.id} missing required fields`);
            errors.push(`Invalid event data: missing required fields`);
            continue;
          }

          // Insert event
          const result = await client.query(`
            INSERT INTO analytics_events (
              id, event_type, certificate_id, timestamp, session_id, user_id,
              device_info, location, interaction_data, security_flags, consent_status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          `, [
            event.id,
            event.eventType,
            event.certificateId,
            new Date(event.timestamp),
            event.sessionId,
            event.userId || null,
            JSON.stringify(event.deviceInfo),
            JSON.stringify(event.location),
            event.interactionData ? JSON.stringify(event.interactionData) : null,
            JSON.stringify(event.securityFlags),
            JSON.stringify(event.consentStatus)
          ]);

          console.log(`Event ${event.id} inserted successfully, rows affected: ${result.rowCount}`);
          processed++;
        } catch (eventError) {
          console.error('Error inserting event:', eventError);
          errors.push(`Failed to insert event ${event.id}: ${eventError instanceof Error ? eventError.message : String(eventError)}`);
        }
      }

      console.log(`Committing transaction, processed ${processed} events`);
      await client.query('COMMIT');
    } catch (batchError) {
      console.log('Rolling back transaction due to error');
      await client.query('ROLLBACK');
      throw batchError;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Batch insert failed:', error);
    errors.push(`Batch insert failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  console.log(`insertAnalyticsEvents completed: processed=${processed}, errors=${errors.length}`);
  return { processed, errors };
}

// Data aggregation for dashboard
export async function getAnalyticsAggregation(
  startDate: Date,
  endDate: Date,
  eventType?: string,
  certificateId?: string,
  limit: number = 1000
): Promise<AggregationResult[]> {
  const db = await getDatabaseConnection();

  let query = `
    SELECT
      DATE_TRUNC('day', timestamp) as date,
      event_type,
      COUNT(*) as event_count,
      COUNT(DISTINCT session_id) as unique_sessions,
      AVG((security_flags->>'riskScore')::float) as avg_risk_score,
      COUNT(CASE WHEN (security_flags->>'isSuspicious')::boolean THEN 1 END) as suspicious_events
    FROM analytics_events
    WHERE timestamp >= $1 AND timestamp <= $2
  `;

  const params: any[] = [startDate, endDate];
  let paramIndex = 3;

  if (eventType) {
    query += ` AND event_type = $${paramIndex}`;
    params.push(eventType);
    paramIndex++;
  }

  if (certificateId) {
    query += ` AND certificate_id = $${paramIndex}`;
    params.push(certificateId);
    paramIndex++;
  }

  query += `
    GROUP BY DATE_TRUNC('day', timestamp), event_type
    ORDER BY date DESC, event_count DESC
    LIMIT $${paramIndex}
  `;
  params.push(limit);

  const result = await db.query(query, params);
  return result.rows;
}

// GDPR-compliant data deletion
export async function deleteUserData(
  userId: string,
  adminUserId?: string,
  reason?: string,
  requestId?: string
): Promise<{ eventsDeleted: number; sessionsDeleted: number; consentDeleted: number }> {
  const db = await getDatabaseConnection();
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    // Get counts before deletion for audit
    const eventCount = await client.query(
      'SELECT COUNT(*) as count FROM analytics_events WHERE user_id = $1',
      [userId]
    );

    const sessionCount = await client.query(
      'SELECT COUNT(*) as count FROM user_sessions WHERE session_id IN (SELECT session_id FROM analytics_events WHERE user_id = $1)',
      [userId]
    );

    const consentCount = await client.query(
      'SELECT COUNT(*) as count FROM consent_settings WHERE user_id = $1',
      [userId]
    );

    // Delete data (order matters due to foreign keys)
    const eventsDeleted = await client.query(
      'DELETE FROM analytics_events WHERE user_id = $1',
      [userId]
    );

    const sessionsDeleted = await client.query(
      'DELETE FROM user_sessions WHERE session_id IN (SELECT session_id FROM analytics_events WHERE user_id = $1)',
      [userId]
    );

    const consentDeleted = await client.query(
      'DELETE FROM consent_settings WHERE user_id = $1',
      [userId]
    );

    // Log deletion in audit log
    await client.query(`
      INSERT INTO audit_logs (
        action_type, user_id, admin_user_id, resource_type, old_values, reason, request_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      'data_deletion',
      userId,
      adminUserId || null,
      'user_data',
      JSON.stringify({
        eventsDeleted: eventCount.rows[0].count,
        sessionsDeleted: sessionCount.rows[0].count,
        consentDeleted: consentCount.rows[0].count
      }),
      reason || 'GDPR data deletion request',
      requestId || null
    ]);

    await client.query('COMMIT');

    return {
      eventsDeleted: parseInt(eventCount.rows[0].count),
      sessionsDeleted: parseInt(sessionCount.rows[0].count),
      consentDeleted: parseInt(consentCount.rows[0].count)
    };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Alert generation logic
export async function checkAndGenerateAlerts(): Promise<SecurityAlert[]> {
  const db = await getDatabaseConnection();
  const alerts: SecurityAlert[] = [];

  try {
    // Get enabled alert rules
    const rulesResult = await db.query(
      'SELECT * FROM alert_rules WHERE enabled = true'
    );

    const rules: AlertRule[] = rulesResult.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      conditions: row.conditions,
      severity: row.severity,
      enabled: row.enabled,
      cooldownMinutes: row.cooldown_minutes,
      lastTriggered: row.last_triggered
    }));

    for (const rule of rules) {
      // Check if rule is in cooldown
      if (rule.lastTriggered) {
        const cooldownEnd = new Date(rule.lastTriggered.getTime() + rule.cooldownMinutes * 60000);
        if (new Date() < cooldownEnd) {
          continue; // Skip this rule
        }
      }

      // Evaluate rule conditions
      const triggeredAlerts = await evaluateAlertRule(rule);
      alerts.push(...triggeredAlerts);

      // Update last triggered if alerts were generated
      if (triggeredAlerts.length > 0) {
        await db.query(
          'UPDATE alert_rules SET last_triggered = NOW(), trigger_count = trigger_count + 1 WHERE id = $1',
          [rule.id]
        );
      }
    }

  } catch (error) {
    console.error('Error generating alerts:', error);
  }

  return alerts;
}

// Evaluate a single alert rule
async function evaluateAlertRule(rule: AlertRule): Promise<SecurityAlert[]> {
  const db = await getDatabaseConnection();
  const alerts: SecurityAlert[] = [];

  try {
    const conditions = rule.conditions;

    if (conditions.event_type && conditions.count && conditions.time_window_minutes) {
      // Event frequency rule
      const result = await db.query(`
        SELECT
          session_id,
          user_id,
          certificate_id,
          COUNT(*) as event_count,
          array_agg(id) as event_ids,
          AVG((security_flags->>'riskScore')::float) as avg_risk
        FROM analytics_events
        WHERE event_type = $1
          AND timestamp >= NOW() - INTERVAL '${conditions.time_window_minutes} minutes'
        GROUP BY session_id, user_id, certificate_id
        HAVING COUNT(*) >= $2
      `, [conditions.event_type, conditions.count]);

      for (const row of result.rows) {
        alerts.push({
          id: crypto.randomUUID(),
          alertType: rule.name,
          severity: rule.severity,
          sessionId: row.session_id,
          userId: row.user_id,
          certificateId: row.certificate_id,
          eventIds: row.event_ids,
          riskScore: Math.round(row.avg_risk || 50),
          description: `${rule.name}: ${row.event_count} ${conditions.event_type} events in ${conditions.time_window_minutes} minutes`,
          metadata: { ruleId: rule.id, eventCount: row.event_count }
        });
      }
    }

    // Add more rule types as needed...

  } catch (error) {
    console.error(`Error evaluating rule ${rule.name}:`, error);
  }

  return alerts;
}

// Insert security alert
export async function insertSecurityAlert(alert: SecurityAlert): Promise<void> {
  const db = await getDatabaseConnection();

  await db.query(`
    INSERT INTO security_alerts (
      id, alert_type, severity, session_id, user_id, certificate_id,
      event_ids, risk_score, description, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  `, [
    alert.id,
    alert.alertType,
    alert.severity,
    alert.sessionId || null,
    alert.userId || null,
    alert.certificateId || null,
    alert.eventIds,
    alert.riskScore,
    alert.description,
    alert.metadata ? JSON.stringify(alert.metadata) : null
  ]);
}

// Session management
export async function createUserSession(sessionData: {
  sessionId: string;
  startTime: number;
  deviceFingerprint: string;
  ipHash: string;
  consentGiven: boolean;
}): Promise<void> {
  console.log(`Creating user session: ${sessionData.sessionId}`);
  const db = await getDatabaseConnection();

  try {
    await db.query(`
      INSERT INTO user_sessions (
        session_id, start_time, device_fingerprint, ip_hash, consent_given, last_activity
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      sessionData.sessionId,
      new Date(sessionData.startTime),
      sessionData.deviceFingerprint,
      sessionData.ipHash,
      sessionData.consentGiven,
      new Date(sessionData.startTime)
    ]);
    console.log(`User session ${sessionData.sessionId} created successfully`);
  } catch (error) {
    console.error(`Failed to create user session ${sessionData.sessionId}:`, error);
    throw error;
  }
}

export async function updateUserSession(sessionId: string, updates: Partial<{
  endTime: number;
  lastActivity: number;
  consentGiven: boolean;
}>): Promise<void> {
  console.log(`Updating user session: ${sessionId}`, updates);
  const db = await getDatabaseConnection();

  const setParts: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.endTime !== undefined) {
    setParts.push(`end_time = $${paramIndex}`);
    values.push(new Date(updates.endTime));
    paramIndex++;
  }

  if (updates.lastActivity !== undefined) {
    setParts.push(`last_activity = $${paramIndex}`);
    values.push(new Date(updates.lastActivity));
    paramIndex++;
  }

  if (updates.consentGiven !== undefined) {
    setParts.push(`consent_given = $${paramIndex}`);
    values.push(updates.consentGiven);
    paramIndex++;
  }

  if (setParts.length === 0) {
    console.log(`No updates for session ${sessionId}`);
    return;
  }

  values.push(sessionId);

  try {
    const result = await db.query(
      `UPDATE user_sessions SET ${setParts.join(', ')} WHERE session_id = $${paramIndex}`,
      values
    );
    console.log(`Session ${sessionId} update result: ${result.rowCount} rows affected`);
  } catch (error) {
    console.error(`Failed to update session ${sessionId}:`, error);
    throw error;
  }
}

// Consent management
export async function updateConsentSettings(consent: {
  userId?: string;
  sessionId?: string;
  analytics: boolean;
  marketing: boolean;
  security: boolean;
  version: string;
  ipHash?: string;
  userAgent?: string;
}): Promise<void> {
  const db = await getDatabaseConnection();

  // First, try to find existing record
  const existing = await db.query(`
    SELECT id FROM consent_settings
    WHERE (user_id = $1 AND user_id IS NOT NULL)
       OR (session_id = $2 AND session_id IS NOT NULL)
    LIMIT 1
  `, [consent.userId || null, consent.sessionId || null]);

  if (existing.rows.length > 0) {
    // Update existing record
    await db.query(`
      UPDATE consent_settings SET
        analytics = $1,
        marketing = $2,
        security = $3,
        timestamp = $4,
        version = $5,
        ip_hash = $6,
        user_agent = $7,
        updated_at = NOW()
      WHERE id = $8
    `, [
      consent.analytics,
      consent.marketing,
      consent.security,
      new Date(),
      consent.version,
      consent.ipHash || null,
      consent.userAgent || null,
      existing.rows[0].id
    ]);
  } else {
    // Insert new record
    await db.query(`
      INSERT INTO consent_settings (
        user_id, session_id, analytics, marketing, security, timestamp, version, ip_hash, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      consent.userId || null,
      consent.sessionId || null,
      consent.analytics,
      consent.marketing,
      consent.security,
      new Date(),
      consent.version,
      consent.ipHash || null,
      consent.userAgent || null
    ]);
  }
}