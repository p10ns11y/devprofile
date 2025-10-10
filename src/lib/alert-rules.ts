import { getDatabaseConnection } from './database';
import { AnalyticsEvent } from '@/utils/analytics-tracker';
import {
  detectMultipleDownloads,
  detectRapidNavigation,
  detectScreenshotAttempts,
  detectRightClickAbuse,
  detectSessionAnomaly,
  DetectionContext,
  AlertDetectionResult
} from './alert-detection';

export interface AlertRule {
  id: string;
  name: string;
  description?: string;
  conditions: AlertRuleConditions;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  cooldownMinutes: number;
  lastTriggered?: Date;
  triggerCount: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface AlertRuleConditions {
  // Detection function to use
  detectionType: 'multiple_downloads' | 'rapid_navigation' | 'screenshot_attempts' | 'right_click_abuse' | 'session_anomaly';

  // Thresholds
  timeWindowMinutes: number;
  minOccurrences?: number;
  riskThreshold?: number;

  // Additional conditions
  eventTypes?: string[];
  minRiskScore?: number;
  geographicAnomaly?: boolean;
  sessionDurationThreshold?: number;

  // Custom conditions (JSON)
  customConditions?: any;
}

export interface RuleEvaluationResult {
  rule: AlertRule;
  triggered: boolean;
  riskScore: number;
  severity: string;
  metadata: any;
  description: string;
  eventIds: string[];
  sessionId: string;
  userId?: string;
  certificateId?: string;
}

/**
 * Load all enabled alert rules from database
 */
export async function loadAlertRules(): Promise<AlertRule[]> {
  const db = await getDatabaseConnection();

  const result = await db.query(`
    SELECT
      id, name, description, conditions, severity, enabled,
      cooldown_minutes, last_triggered, trigger_count,
      created_at, updated_at, created_by, updated_by
    FROM alert_rules
    WHERE enabled = true
    ORDER BY severity DESC, created_at ASC
  `);

  return result.rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    conditions: row.conditions as AlertRuleConditions,
    severity: row.severity,
    enabled: row.enabled,
    cooldownMinutes: row.cooldown_minutes,
    lastTriggered: row.last_triggered ? new Date(row.last_triggered) : undefined,
    triggerCount: row.trigger_count,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    createdBy: row.created_by,
    updatedBy: row.updated_by
  }));
}

/**
 * Evaluate a single alert rule against an event
 */
export async function evaluateRuleAgainstEvent(
  rule: AlertRule,
  event: AnalyticsEvent
): Promise<RuleEvaluationResult | null> {
  // Check if rule is in cooldown
  if (rule.lastTriggered) {
    const cooldownEnd = new Date(rule.lastTriggered.getTime() + rule.cooldownMinutes * 60000);
    if (new Date() < cooldownEnd) {
      return null; // Rule is in cooldown
    }
  }

  const conditions = rule.conditions;
  const context: DetectionContext = {
    sessionId: event.sessionId,
    userId: event.userId,
    certificateId: event.certificateId,
    timeWindowMinutes: conditions.timeWindowMinutes
  };

  let detectionResult: AlertDetectionResult;

  // Run the appropriate detection function
  switch (conditions.detectionType) {
    case 'multiple_downloads':
      detectionResult = await detectMultipleDownloads(context);
      break;
    case 'rapid_navigation':
      detectionResult = await detectRapidNavigation(context);
      break;
    case 'screenshot_attempts':
      detectionResult = await detectScreenshotAttempts(context);
      break;
    case 'right_click_abuse':
      detectionResult = await detectRightClickAbuse(context);
      break;
    case 'session_anomaly':
      detectionResult = await detectSessionAnomaly(context);
      break;
    default:
      console.warn(`Unknown detection type: ${conditions.detectionType}`);
      return null;
  }

  if (!detectionResult.triggered) {
    return null;
  }

  // Check additional conditions
  if (conditions.minRiskScore && detectionResult.riskScore < conditions.minRiskScore) {
    return null;
  }

  if (conditions.riskThreshold && detectionResult.riskScore < conditions.riskThreshold) {
    return null;
  }

  // Calculate final severity based on risk score
  const finalSeverity = calculateSeverityFromRiskScore(detectionResult.riskScore);

  return {
    rule,
    triggered: true,
    riskScore: detectionResult.riskScore,
    severity: finalSeverity,
    metadata: detectionResult.metadata,
    description: detectionResult.description,
    eventIds: detectionResult.metadata.eventIds || [event.id],
    sessionId: event.sessionId,
    userId: event.userId,
    certificateId: event.certificateId
  };
}

/**
 * Evaluate all enabled rules against an event
 */
export async function evaluateAllRulesAgainstEvent(
  event: AnalyticsEvent
): Promise<RuleEvaluationResult[]> {
  const rules = await loadAlertRules();
  const results: RuleEvaluationResult[] = [];

  for (const rule of rules) {
    try {
      const result = await evaluateRuleAgainstEvent(rule, event);
      if (result) {
        results.push(result);
      }
    } catch (error) {
      console.error(`Error evaluating rule ${rule.name}:`, error);
    }
  }

  return results;
}

/**
 * Evaluate rules against a batch of events
 */
export async function evaluateRulesAgainstEvents(
  events: AnalyticsEvent[]
): Promise<RuleEvaluationResult[]> {
  const allResults: RuleEvaluationResult[] = [];

  // Group events by session to avoid duplicate evaluations
  const eventsBySession = new Map<string, AnalyticsEvent[]>();
  for (const event of events) {
    if (!eventsBySession.has(event.sessionId)) {
      eventsBySession.set(event.sessionId, []);
    }
    eventsBySession.get(event.sessionId)!.push(event);
  }

  // Evaluate rules for each session (using the most recent event as trigger)
  for (const [sessionId, sessionEvents] of Array.from(eventsBySession.entries())) {
    const latestEvent = sessionEvents.sort((a: AnalyticsEvent, b: AnalyticsEvent) => b.timestamp - a.timestamp)[0];
    const results = await evaluateAllRulesAgainstEvent(latestEvent);
    allResults.push(...results);
  }

  return allResults;
}

/**
 * Update rule trigger information after alert generation
 */
export async function updateRuleTriggerInfo(ruleId: string): Promise<void> {
  const db = await getDatabaseConnection();

  await db.query(`
    UPDATE alert_rules
    SET last_triggered = NOW(),
        trigger_count = trigger_count + 1,
        updated_at = NOW()
    WHERE id = $1
  `, [ruleId]);
}

/**
 * Create or update an alert rule
 */
export async function saveAlertRule(
  rule: Partial<AlertRule>,
  userId?: string
): Promise<string> {
  const db = await getDatabaseConnection();

  const ruleData = {
    name: rule.name,
    description: rule.description || '',
    conditions: JSON.stringify(rule.conditions),
    severity: rule.severity,
    enabled: rule.enabled ?? true,
    cooldown_minutes: rule.cooldownMinutes ?? 60,
    created_by: userId,
    updated_by: userId
  };

  if (rule.id) {
    // Update existing rule
    await db.query(`
      UPDATE alert_rules SET
        name = $1, description = $2, conditions = $3, severity = $4,
        enabled = $5, cooldown_minutes = $6, updated_by = $7, updated_at = NOW()
      WHERE id = $8
    `, [
      ruleData.name, ruleData.description, ruleData.conditions, ruleData.severity,
      ruleData.enabled, ruleData.cooldown_minutes, ruleData.updated_by, rule.id
    ]);
    return rule.id;
  } else {
    // Create new rule
    const result = await db.query(`
      INSERT INTO alert_rules (
        name, description, conditions, severity, enabled, cooldown_minutes,
        created_by, updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [
      ruleData.name, ruleData.description, ruleData.conditions, ruleData.severity,
      ruleData.enabled, ruleData.cooldown_minutes, ruleData.created_by, ruleData.updated_by
    ]);
    return result.rows[0].id;
  }
}

/**
 * Delete an alert rule
 */
export async function deleteAlertRule(ruleId: string): Promise<void> {
  const db = await getDatabaseConnection();

  await db.query('DELETE FROM alert_rules WHERE id = $1', [ruleId]);
}

/**
 * Get alert rule by ID
 */
export async function getAlertRule(ruleId: string): Promise<AlertRule | null> {
  const db = await getDatabaseConnection();

  const result = await db.query(`
    SELECT
      id, name, description, conditions, severity, enabled,
      cooldown_minutes, last_triggered, trigger_count,
      created_at, updated_at, created_by, updated_by
    FROM alert_rules
    WHERE id = $1
  `, [ruleId]);

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    conditions: row.conditions as AlertRuleConditions,
    severity: row.severity,
    enabled: row.enabled,
    cooldownMinutes: row.cooldown_minutes,
    lastTriggered: row.last_triggered ? new Date(row.last_triggered) : undefined,
    triggerCount: row.trigger_count,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    createdBy: row.created_by,
    updatedBy: row.updated_by
  };
}

/**
 * Calculate severity level from risk score
 */
function calculateSeverityFromRiskScore(riskScore: number): string {
  if (riskScore >= 80) return 'critical';
  if (riskScore >= 60) return 'high';
  if (riskScore >= 40) return 'medium';
  return 'low';
}

/**
 * Initialize default alert rules if none exist
 */
export async function initializeDefaultRules(): Promise<void> {
  const db = await getDatabaseConnection();

  // Check if rules already exist
  const existingRules = await db.query('SELECT COUNT(*) as count FROM alert_rules');
  if (parseInt(existingRules.rows[0].count) > 0) {
    return; // Rules already exist
  }

  const defaultRules: Partial<AlertRule>[] = [
    {
      name: 'Multiple Downloads',
      description: 'Detects when a user downloads multiple certificates rapidly',
      conditions: {
        detectionType: 'multiple_downloads',
        timeWindowMinutes: 10,
        minOccurrences: 5
      },
      severity: 'medium',
      cooldownMinutes: 60
    },
    {
      name: 'Rapid Navigation',
      description: 'Identifies unusual browsing patterns with too many certificate views quickly',
      conditions: {
        detectionType: 'rapid_navigation',
        timeWindowMinutes: 5,
        minOccurrences: 20
      },
      severity: 'low',
      cooldownMinutes: 30
    },
    {
      name: 'Screenshot Attempts',
      description: 'Flags repeated screenshot detection events',
      conditions: {
        detectionType: 'screenshot_attempts',
        timeWindowMinutes: 60,
        minOccurrences: 1
      },
      severity: 'high',
      cooldownMinutes: 120
    },
    {
      name: 'Right-Click Abuse',
      description: 'Monitors excessive right-click attempts',
      conditions: {
        detectionType: 'right_click_abuse',
        timeWindowMinutes: 10,
        minOccurrences: 10
      },
      severity: 'medium',
      cooldownMinutes: 60
    },
    {
      name: 'Session Anomaly',
      description: 'Detects suspicious session durations or patterns',
      conditions: {
        detectionType: 'session_anomaly',
        timeWindowMinutes: 60,
        riskThreshold: 40
      },
      severity: 'high',
      cooldownMinutes: 180
    }
  ];

  for (const rule of defaultRules) {
    await saveAlertRule(rule, 'system');
  }

  console.log('Initialized default alert rules');
}