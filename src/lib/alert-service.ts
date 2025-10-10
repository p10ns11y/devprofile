import { getDatabaseConnection } from './database';
import { AnalyticsEvent } from '@/utils/analytics-tracker';
import { evaluateRulesAgainstEvents, RuleEvaluationResult, updateRuleTriggerInfo } from './alert-rules';

export interface SecurityAlert {
  id: string;
  alertType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  sessionId: string;
  userId?: string;
  certificateId?: string;
  eventIds: string[];
  riskScore: number;
  description: string;
  metadata?: any;
  status: 'active' | 'investigated' | 'resolved' | 'false_positive';
  assignedTo?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertBatch {
  events: AnalyticsEvent[];
  processedAt: Date;
  alertsGenerated: number;
  processingTime: number;
}

export interface NotificationChannel {
  type: 'email' | 'slack' | 'webhook' | 'console';
  enabled: boolean;
  config: any;
}

/**
 * Process a batch of events and generate alerts
 */
export async function processEventBatch(events: AnalyticsEvent[]): Promise<AlertBatch> {
  const startTime = Date.now();

  try {
    // Evaluate rules against the events
    const ruleResults = await evaluateRulesAgainstEvents(events);

    // Deduplicate alerts
    const deduplicatedAlerts = await deduplicateAlerts(ruleResults);

    // Create and store alerts
    const alerts = await createAlertsFromRuleResults(deduplicatedAlerts);

    // Update rule trigger information
    await updateRuleTriggers(deduplicatedAlerts);

    // Send notifications for high-severity alerts
    await sendNotifications(alerts);

    const processingTime = Date.now() - startTime;

    return {
      events,
      processedAt: new Date(),
      alertsGenerated: alerts.length,
      processingTime
    };

  } catch (error) {
    console.error('Error processing event batch:', error);
    throw error;
  }
}

/**
 * Process a single event and generate alerts in real-time
 */
export async function processSingleEvent(event: AnalyticsEvent): Promise<SecurityAlert[]> {
  try {
    const ruleResults = await evaluateRulesAgainstEvents([event]);
    const deduplicatedAlerts = await deduplicateAlerts(ruleResults);
    const alerts = await createAlertsFromRuleResults(deduplicatedAlerts);
    await updateRuleTriggers(deduplicatedAlerts);
    await sendNotifications(alerts);

    return alerts;
  } catch (error) {
    console.error('Error processing single event:', error);
    throw error;
  }
}

/**
 * Create alerts from rule evaluation results
 */
async function createAlertsFromRuleResults(results: RuleEvaluationResult[]): Promise<SecurityAlert[]> {
  const alerts: SecurityAlert[] = [];

  for (const result of results) {
    const alert: SecurityAlert = {
      id: crypto.randomUUID(),
      alertType: result.rule.name,
      severity: result.severity as 'low' | 'medium' | 'high' | 'critical',
      sessionId: result.sessionId,
      userId: result.userId,
      certificateId: result.certificateId,
      eventIds: result.eventIds,
      riskScore: result.riskScore,
      description: result.description,
      metadata: {
        ruleId: result.rule.id,
        ...result.metadata
      },
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store alert in database
    await storeAlert(alert);
    alerts.push(alert);
  }

  return alerts;
}

/**
 * Store alert in database
 */
async function storeAlert(alert: SecurityAlert): Promise<void> {
  const db = await getDatabaseConnection();

  await db.query(`
    INSERT INTO security_alerts (
      id, alert_type, severity, session_id, user_id, certificate_id,
      event_ids, risk_score, description, metadata, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
  `, [
    alert.id,
    alert.alertType,
    alert.severity,
    alert.sessionId,
    alert.userId || null,
    alert.certificateId || null,
    alert.eventIds,
    alert.riskScore,
    alert.description,
    alert.metadata ? JSON.stringify(alert.metadata) : null,
    alert.status
  ]);
}

/**
 * Update rule trigger information
 */
async function updateRuleTriggers(results: RuleEvaluationResult[]): Promise<void> {
  const ruleIds = Array.from(new Set(results.map(r => r.rule.id)));

  for (const ruleId of ruleIds) {
    await updateRuleTriggerInfo(ruleId);
  }
}

/**
 * Deduplicate alerts to prevent spam
 */
async function deduplicateAlerts(results: RuleEvaluationResult[]): Promise<RuleEvaluationResult[]> {
  const db = await getDatabaseConnection();
  const deduplicated: RuleEvaluationResult[] = [];

  for (const result of results) {
    // Check for recent similar alerts (same rule, same session, within cooldown period)
    const cooldownMinutes = result.rule.cooldownMinutes;
    const existingAlert = await db.query(`
      SELECT id FROM security_alerts
      WHERE alert_type = $1
        AND session_id = $2
        AND created_at > NOW() - INTERVAL '${cooldownMinutes} minutes'
        AND status = 'active'
      LIMIT 1
    `, [result.rule.name, result.sessionId]);

    if (existingAlert.rows.length === 0) {
      deduplicated.push(result);
    }
  }

  return deduplicated;
}

/**
 * Send notifications for alerts
 */
async function sendNotifications(alerts: SecurityAlert[]): Promise<void> {
  const highSeverityAlerts = alerts.filter(alert =>
    alert.severity === 'high' || alert.severity === 'critical'
  );

  if (highSeverityAlerts.length === 0) {
    return;
  }

  // Get notification channels from configuration
  const channels = await getNotificationChannels();

  for (const channel of channels) {
    if (!channel.enabled) continue;

    try {
      switch (channel.type) {
        case 'console':
          await sendConsoleNotification(highSeverityAlerts, channel);
          break;
        case 'email':
          await sendEmailNotification(highSeverityAlerts, channel);
          break;
        case 'slack':
          await sendSlackNotification(highSeverityAlerts, channel);
          break;
        case 'webhook':
          await sendWebhookNotification(highSeverityAlerts, channel);
          break;
      }
    } catch (error) {
      console.error(`Error sending ${channel.type} notification:`, error);
    }
  }
}

/**
 * Get configured notification channels
 */
async function getNotificationChannels(): Promise<NotificationChannel[]> {
  // In a real implementation, this would load from database or config
  // For now, return console notification as default
  return [
    {
      type: 'console',
      enabled: true,
      config: {}
    }
  ];
}

/**
 * Send console notification
 */
async function sendConsoleNotification(alerts: SecurityAlert[], channel: NotificationChannel): Promise<void> {
  console.log('🚨 SECURITY ALERTS GENERATED 🚨');
  console.log(`Generated ${alerts.length} high-severity alerts:`);

  for (const alert of alerts) {
    console.log(`- ${alert.severity.toUpperCase()}: ${alert.description}`);
    console.log(`  Session: ${alert.sessionId}, Risk Score: ${alert.riskScore}`);
  }
  console.log('--- End of alerts ---');
}

/**
 * Send email notification (placeholder)
 */
async function sendEmailNotification(alerts: SecurityAlert[], channel: NotificationChannel): Promise<void> {
  // Placeholder for email implementation
  console.log(`📧 Email notification would be sent for ${alerts.length} alerts`);
  // In production, integrate with email service like SendGrid, SES, etc.
}

/**
 * Send Slack notification (placeholder)
 */
async function sendSlackNotification(alerts: SecurityAlert[], channel: NotificationChannel): Promise<void> {
  // Placeholder for Slack implementation
  console.log(`💬 Slack notification would be sent for ${alerts.length} alerts`);
  // In production, integrate with Slack API
}

/**
 * Send webhook notification (placeholder)
 */
async function sendWebhookNotification(alerts: SecurityAlert[], channel: NotificationChannel): Promise<void> {
  // Placeholder for webhook implementation
  console.log(`🔗 Webhook notification would be sent for ${alerts.length} alerts`);
  // In production, send HTTP POST to configured webhook URL
}

/**
 * Get recent alerts with filtering
 */
export async function getAlerts(filters?: {
  severity?: string;
  type?: string;
  sessionId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<SecurityAlert[]> {
  const db = await getDatabaseConnection();

  let query = `
    SELECT
      id, alert_type, severity, session_id, user_id, certificate_id,
      event_ids, risk_score, description, metadata, status,
      assigned_to, resolved_at, resolved_by, created_at, updated_at
    FROM security_alerts
    WHERE 1=1
  `;

  const params: any[] = [];
  let paramIndex = 1;

  if (filters?.severity) {
    query += ` AND severity = $${paramIndex}`;
    params.push(filters.severity);
    paramIndex++;
  }

  if (filters?.type) {
    query += ` AND alert_type = $${paramIndex}`;
    params.push(filters.type);
    paramIndex++;
  }

  if (filters?.sessionId) {
    query += ` AND session_id = $${paramIndex}`;
    params.push(filters.sessionId);
    paramIndex++;
  }

  if (filters?.status) {
    query += ` AND status = $${paramIndex}`;
    params.push(filters.status);
    paramIndex++;
  }

  query += ` ORDER BY created_at DESC`;

  if (filters?.limit) {
    query += ` LIMIT $${paramIndex}`;
    params.push(filters.limit);
    paramIndex++;
  }

  if (filters?.offset) {
    query += ` OFFSET $${paramIndex}`;
    params.push(filters.offset);
    paramIndex++;
  }

  const result = await db.query(query, params);

  return result.rows.map((row: any) => ({
    id: row.id,
    alertType: row.alert_type,
    severity: row.severity,
    sessionId: row.session_id,
    userId: row.user_id,
    certificateId: row.certificate_id,
    eventIds: row.event_ids,
    riskScore: row.risk_score,
    description: row.description,
    metadata: row.metadata,
    status: row.status,
    assignedTo: row.assigned_to,
    resolvedAt: row.resolved_at ? new Date(row.resolved_at) : undefined,
    resolvedBy: row.resolved_by,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at)
  }));
}

/**
 * Update alert status
 */
export async function updateAlertStatus(
  alertId: string,
  status: 'active' | 'investigated' | 'resolved' | 'false_positive',
  assignedTo?: string,
  resolvedBy?: string
): Promise<void> {
  const db = await getDatabaseConnection();

  const updateData: any = {
    status,
    updated_at: new Date()
  };

  if (assignedTo) updateData.assigned_to = assignedTo;
  if (resolvedBy) updateData.resolved_by = resolvedBy;
  if (status === 'resolved' || status === 'false_positive') {
    updateData.resolved_at = new Date();
  }

  const setParts: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updateData)) {
    setParts.push(`${key} = $${paramIndex}`);
    values.push(value);
    paramIndex++;
  }

  values.push(alertId);

  await db.query(
    `UPDATE security_alerts SET ${setParts.join(', ')} WHERE id = $${paramIndex}`,
    values
  );
}

/**
 * Get alert statistics
 */
export async function getAlertStatistics(timeRangeHours: number = 24): Promise<{
  total: number;
  bySeverity: Record<string, number>;
  byType: Record<string, number>;
  recent: number;
}> {
  const db = await getDatabaseConnection();

  // Get total and recent counts
  const totalResult = await db.query(`
    SELECT
      COUNT(*) as total,
      COUNT(CASE WHEN created_at >= NOW() - INTERVAL '${timeRangeHours} hours' THEN 1 END) as recent
    FROM security_alerts
  `);

  // Get counts by severity
  const severityResult = await db.query(`
    SELECT severity, COUNT(*) as count
    FROM security_alerts
    GROUP BY severity
  `);

  // Get counts by type
  const typeResult = await db.query(`
    SELECT alert_type, COUNT(*) as count
    FROM security_alerts
    GROUP BY alert_type
  `);

  const bySeverity: Record<string, number> = {};
  severityResult.rows.forEach((row: any) => {
    bySeverity[row.severity] = parseInt(row.count);
  });

  const byType: Record<string, number> = {};
  typeResult.rows.forEach((row: any) => {
    byType[row.alert_type] = parseInt(row.count);
  });

  return {
    total: parseInt(totalResult.rows[0].total),
    recent: parseInt(totalResult.rows[0].recent),
    bySeverity,
    byType
  };
}