import { AnalyticsEvent } from '@/utils/analytics-tracker';
import {
  insertAnalyticsEvents,
  getAnalyticsAggregation,
  deleteUserData as deleteUserDataFromDB,
  checkAndGenerateAlerts,
  insertSecurityAlert,
  createUserSession,
  updateUserSession,
  updateConsentSettings
} from './database-utils';

// Data management functions - now using database
export async function addEvent(event: AnalyticsEvent): Promise<void> {
  const result = await insertAnalyticsEvents({
    events: [event],
    sessionId: event.sessionId
  });

  if (result.errors.length > 0) {
    console.error('Failed to add event:', result.errors);
    throw new Error('Failed to add event');
  }
}

export async function addSession(session: any): Promise<void> {
  await createUserSession({
    sessionId: session.sessionId,
    startTime: session.startTime,
    deviceFingerprint: session.deviceFingerprint,
    ipHash: session.ipHash,
    consentGiven: session.consentGiven
  });
}

export async function updateSession(sessionId: string, updates: any): Promise<void> {
  await updateUserSession(sessionId, {
    endTime: updates.endTime,
    lastActivity: updates.lastActivity,
    consentGiven: updates.consentGiven
  });
}

export async function addConsent(consent: any): Promise<void> {
  await updateConsentSettings({
    userId: consent.userId,
    sessionId: consent.sessionId,
    analytics: consent.analytics,
    marketing: consent.marketing,
    security: consent.security,
    version: consent.version,
    ipHash: consent.ipHash,
    userAgent: consent.userAgent
  });
}

export async function addAlert(alert: any): Promise<void> {
  await insertSecurityAlert({
    id: alert.id || crypto.randomUUID(),
    alertType: alert.alertType,
    severity: alert.severity,
    sessionId: alert.sessionId,
    userId: alert.userId,
    certificateId: alert.certificateId,
    eventIds: alert.eventIds || [],
    riskScore: alert.riskScore,
    description: alert.description,
    metadata: alert.metadata
  });
}

export async function getEvents(filters?: any): Promise<AnalyticsEvent[]> {
  // For now, return empty array - implement full query if needed
  // In production, you might want to implement a full event retrieval function
  console.warn('getEvents not fully implemented - use getAnalyticsAggregation for aggregated data');
  return [];
}

export async function getAnalyticsData(filters?: any) {
  const startDate = filters?.startDate ? new Date(filters.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = filters?.endDate ? new Date(filters.endDate) : new Date();

  return await getAnalyticsAggregation(startDate, endDate, filters?.eventType, filters?.certificateId);
}

export async function deleteUserData(userId: string, adminUserId?: string, reason?: string): Promise<{ eventsDeleted: number; sessionsDeleted: number; consentDeleted: number }> {
  return await deleteUserDataFromDB(userId, adminUserId, reason);
}

export async function generateAlerts(): Promise<any[]> {
  return await checkAndGenerateAlerts();
}

// Legacy compatibility - keep empty arrays for any code that might still reference them
export let eventsStore: AnalyticsEvent[] = [];
export let sessionsStore: any[] = [];
export let consentStore: any[] = [];
export let alertsStore: any[] = [];