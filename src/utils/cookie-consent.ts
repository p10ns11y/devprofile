import { ConsentSettings } from './analytics-tracker';

const CONSENT_COOKIE_NAME = 'intelli_insights_consent';
const CONSENT_VERSION = '1.0';

/**
 * Cookie consent utilities for GDPR compliance
 * Handles secure cookie-based consent management
 */

export function getConsentFromCookie(): ConsentSettings | null {
  if (typeof document === 'undefined') return null;

  try {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${CONSENT_COOKIE_NAME}=`))
      ?.split('=')[1];

    console.log('Cookie read - value:', cookieValue ? 'present' : 'null');

    if (!cookieValue) return null;

    // Use btoa/atob for base64 encoding/decoding in browser
    const decoded = atob(cookieValue);
    const consent = JSON.parse(decoded);

    console.log('Cookie decoded - consent:', consent);

    // Validate consent structure - check if the required properties exist
    if (typeof consent.analytics !== 'boolean' ||
        typeof consent.marketing !== 'boolean' ||
        typeof consent.security !== 'boolean') {
      console.log('Cookie validation failed - invalid structure');
      return null;
    }

    return consent;
  } catch (error) {
    console.log('Cookie read/decode error:', error);
    return null;
  }
}

export function setConsentCookie(consent: ConsentSettings): void {
  if (typeof document === 'undefined') return;

  const consentData = {
    analytics: consent.analytics,
    marketing: consent.marketing,
    security: consent.security,
    timestamp: consent.timestamp,
    version: consent.version || CONSENT_VERSION
  };

  const cookieValue = btoa(JSON.stringify(consentData));
  const maxAge = 365 * 24 * 60 * 60; // 1 year

  const cookieString = `${CONSENT_COOKIE_NAME}=${cookieValue}; path=/; max-age=${maxAge}; SameSite=Strict; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`;
  document.cookie = cookieString;

  console.log('Cookie set:', cookieString);
  console.log('Cookie data:', consentData);
}

export function clearConsentCookie(): void {
  if (typeof document === 'undefined') return;

  document.cookie = `${CONSENT_COOKIE_NAME}=; path=/; max-age=0; SameSite=Strict; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`;
}

export function hasAnalyticsConsent(): boolean {
  const consent = getConsentFromCookie();
  const hasConsent = consent?.analytics ?? false;
  console.log('hasAnalyticsConsent check:', hasConsent, 'full consent:', consent);
  return hasConsent;
}

export function hasMarketingConsent(): boolean {
  const consent = getConsentFromCookie();
  return consent?.marketing ?? false;
}

export function hasSecurityConsent(): boolean {
  const consent = getConsentFromCookie();
  return consent?.security ?? true; // Security monitoring is always enabled by default
}

export function isConsentGiven(): boolean {
  return getConsentFromCookie() !== null;
}

export function getConsentTimestamp(): number | null {
  const consent = getConsentFromCookie();
  return consent?.timestamp ?? null;
}

export function getConsentVersion(): string {
  const consent = getConsentFromCookie();
  return consent?.version ?? CONSENT_VERSION;
}

/**
 * Update consent preferences and sync with server
 */
export async function updateConsent(
  analytics: boolean,
  marketing: boolean,
  security: boolean = true,
  userId?: string,
  sessionId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const consentSettings: ConsentSettings = {
      analytics,
      marketing,
      security,
      timestamp: Date.now(),
      version: CONSENT_VERSION
    };

    // Set cookie immediately for client-side use
    setConsentCookie(consentSettings);

    // Sync with server
    const response = await fetch('/api/intelli-insights/consent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        analytics,
        marketing,
        security,
        version: CONSENT_VERSION,
        userId,
        sessionId
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update consent on server');
    }

    return { success: true };
  } catch (error) {
    console.error('Consent update failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Withdraw consent and clear all data
 */
export async function withdrawConsent(
  reason?: string,
  userId?: string,
  sessionId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Clear local cookie
    clearConsentCookie();

    // Clear localStorage if exists
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('intelli_insights_consent');
    }

    // Request data deletion from server
    const response = await fetch('/api/intelli-insights/consent', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reason: reason || 'User withdrew consent',
        userId,
        sessionId
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to withdraw consent on server');
    }

    return { success: true };
  } catch (error) {
    console.error('Consent withdrawal failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Check if consent banner should be shown
 */
export function shouldShowConsentBanner(): boolean {
  return !isConsentGiven();
}

/**
 * Get consent status summary
 */
export function getConsentStatus(): {
  given: boolean;
  analytics: boolean;
  marketing: boolean;
  security: boolean;
  timestamp: number | null;
  version: string;
} {
  const consent = getConsentFromCookie();

  return {
    given: consent !== null,
    analytics: consent?.analytics ?? false,
    marketing: consent?.marketing ?? false,
    security: consent?.security ?? true,
    timestamp: consent?.timestamp ?? null,
    version: consent?.version ?? CONSENT_VERSION
  };
}