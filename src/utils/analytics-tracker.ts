// Intelli Insights - Client-side Analytics Tracking Utility
// Implements privacy-aware event logging for certificate interactions

// Core Analytics Event Interface
export interface AnalyticsEvent {
  id: string;
  eventType: 'view' | 'download' | 'right_click' | 'screenshot_attempt' | 'navigation' | 'session_start' | 'session_end';
  certificateId: string;
  timestamp: number;
  sessionId: string;
  userId?: string;
  deviceInfo: {
    os: string;
    browser: string;
    screenSize: string;
    userAgent: string;
    language: string;
  };
  location: {
    country: string;
    region: string;
    timezone: string;
  };
  interactionData: {
    duration?: number;
    referrer?: string;
    pageUrl: string;
    viewportSize: string;
    scrollDepth?: number;
  };
  securityFlags: {
    isSuspicious: boolean;
    riskScore: number;
    flags: string[];
  };
  consentStatus: {
    analytics: boolean;
    marketing: boolean;
    timestamp: number;
  };
}

// Extended Event Types
export interface ViewEvent extends AnalyticsEvent {
  eventType: 'view';
  interactionData: {
    duration: number;
    scrollDepth: number;
    zoomLevel?: number;
  } & AnalyticsEvent['interactionData'];
}

export interface DownloadEvent extends AnalyticsEvent {
  eventType: 'download';
  interactionData: {
    fileSize: number;
    downloadMethod: 'direct' | 'context_menu' | 'programmatic';
    success: boolean;
  } & AnalyticsEvent['interactionData'];
}

export interface RightClickEvent extends AnalyticsEvent {
  eventType: 'right_click';
  interactionData: {
    targetElement: string;
    contextMenuItems?: string[];
  } & AnalyticsEvent['interactionData'];
}

export interface ScreenshotEvent extends AnalyticsEvent {
  eventType: 'screenshot_attempt';
  interactionData: {
    method: 'keyboard' | 'dev_tools' | 'canvas_manipulation';
    canvasSize?: string;
  } & AnalyticsEvent['interactionData'];
}

// Session Data Model
export interface UserSession {
  sessionId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  events: AnalyticsEvent[];
  deviceFingerprint: string;
  ipHash: string;
  consentGiven: boolean;
  lastActivity: number;
}

// Consent Settings
export interface ConsentSettings {
  analytics: boolean;
  marketing: boolean;
  security: boolean;
  timestamp: number;
  version: string;
}

// Global state
let currentSession: UserSession | null = null;
let consentSettings: ConsentSettings | null = null;
const SESSION_STORAGE_KEY = 'intelli_insights_session';
const CONSENT_STORAGE_KEY = 'intelli_insights_consent';

// Utility functions for device and location detection
function getDeviceInfo(): AnalyticsEvent['deviceInfo'] {
  if (typeof window === 'undefined') {
    return {
      os: 'unknown',
      browser: 'unknown',
      screenSize: 'unknown',
      userAgent: 'unknown',
      language: 'unknown'
    };
  }

  const ua = navigator.userAgent;
  const screenSize = `${window.screen.width}x${window.screen.height}`;

  // Simple OS detection
  let os = 'unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS')) os = 'iOS';

  // Simple browser detection
  let browser = 'unknown';
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';

  return {
    os,
    browser,
    screenSize,
    userAgent: ua,
    language: navigator.language || 'unknown'
  };
}

function getLocationInfo(): AnalyticsEvent['location'] {
  // Note: In a real implementation, you'd use a geolocation service
  // For privacy, we'll use timezone-based approximation
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Simple country/region detection from timezone
  let country = 'unknown';
  let region = 'unknown';

  if (timezone.includes('Europe')) {
    country = 'EU';
    region = timezone.split('/')[1] || 'unknown';
  } else if (timezone.includes('America')) {
    country = 'US';
    region = timezone.split('/')[1] || 'unknown';
  } else if (timezone.includes('Asia')) {
    country = 'Asia';
    region = timezone.split('/')[1] || 'unknown';
  }

  return { country, region, timezone };
}

function getDeviceFingerprint(): string {
  // Create a simple fingerprint from device characteristics
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx?.fillText(navigator.userAgent, 10, 10);
  const fingerprint = canvas.toDataURL();

  // Hash the fingerprint for privacy
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(36);
}

// Consent management - now uses cookie-based consent
import { hasAnalyticsConsent as checkAnalyticsConsent, getConsentStatus } from './cookie-consent';

export function getConsentSettings(): ConsentSettings | null {
  const status = getConsentStatus();
  return status.given ? {
    analytics: status.analytics,
    marketing: status.marketing,
    security: status.security,
    timestamp: status.timestamp || Date.now(),
    version: status.version
  } : null;
}

export function setConsentSettings(settings: ConsentSettings): void {
  // This is now handled by cookie-consent utilities
  // Keeping for backward compatibility
}

export function hasAnalyticsConsent(): boolean {
  return checkAnalyticsConsent();
}

// Session management
export function initializeAnalyticsSession(): string {
  console.log('initializeAnalyticsSession called');
  if (typeof window === 'undefined') {
    console.log('Window undefined, returning empty string');
    return '';
  }

  // Check if session already exists
  try {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    console.log('Stored session:', stored ? 'exists' : 'null');
    if (stored) {
      currentSession = JSON.parse(stored);
      console.log('Loaded existing session:', currentSession?.sessionId);
      return currentSession!.sessionId;
    }
  } catch (error) {
    console.log('Error parsing stored session:', error);
    // Ignore parse errors
  }

  // Create new session
  const sessionId = crypto.randomUUID();
  const deviceFingerprint = getDeviceFingerprint();
  const consentGiven = hasAnalyticsConsent();

  console.log('Creating new session:', sessionId, 'consent:', consentGiven);

  currentSession = {
    sessionId,
    startTime: Date.now(),
    events: [],
    deviceFingerprint,
    ipHash: '', // Would be set by server
    consentGiven,
    lastActivity: Date.now()
  };

  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(currentSession));
    console.log('Session stored in sessionStorage');
  } catch (error) {
    console.log('Error storing session:', error);
    // Ignore storage errors
  }

  // Log session start event
  console.log('Logging session_start event');
  logAnalyticsEvent({
    eventType: 'session_start',
    certificateId: '',
    interactionData: {
      pageUrl: window.location.href,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`
    }
  });

  return sessionId;
}

export function endAnalyticsSession(): void {
  if (!currentSession) return;

  currentSession.endTime = Date.now();
  currentSession.duration = currentSession.endTime - currentSession.startTime;

  // Log session end event
  logAnalyticsEvent({
    eventType: 'session_end',
    certificateId: '',
    interactionData: {
      duration: currentSession.duration,
      pageUrl: window.location.href,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`
    }
  });

  // Clear session
  currentSession = null;
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Ignore errors
  }
}

// Risk scoring (simplified version)
function calculateRiskScore(event: Partial<AnalyticsEvent>, session: UserSession): number {
  let score = 0;

  // Download frequency
  if (event.eventType === 'download') {
    const recentDownloads = session.events.filter(
      e => e.eventType === 'download' &&
           e.timestamp > Date.now() - 300000 // 5 minutes
    );
    score += Math.min(recentDownloads.length * 10, 40);
  }

  // Screenshot attempts
  if (event.eventType === 'screenshot_attempt') {
    score += 30;
  }

  // Right-click frequency
  if (event.eventType === 'right_click') {
    const recentClicks = session.events.filter(
      e => e.eventType === 'right_click' &&
           e.timestamp > Date.now() - 60000 // 1 minute
    );
    score += Math.min(recentClicks.length * 5, 20);
  }

  return Math.min(score, 100);
}

// Privacy-aware event logging
export async function logAnalyticsEvent(eventData: Omit<AnalyticsEvent, 'id' | 'timestamp' | 'sessionId' | 'deviceInfo' | 'location' | 'securityFlags' | 'consentStatus'>): Promise<void> {
  console.log('logAnalyticsEvent called with:', eventData);

  // Check consent
  const hasConsent = hasAnalyticsConsent();
  console.log('Analytics consent check:', hasConsent);
  if (!hasConsent) {
    console.log('No analytics consent, skipping event logging');
    return;
  }

  if (!currentSession) {
    console.log('No current session, initializing...');
    initializeAnalyticsSession();
  }

  if (!currentSession) {
    console.log('Failed to initialize session, aborting');
    return;
  }

  const fullEvent: AnalyticsEvent = {
    ...eventData,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    sessionId: currentSession.sessionId,
    deviceInfo: getDeviceInfo(),
    location: getLocationInfo(),
    securityFlags: {
      isSuspicious: false,
      riskScore: calculateRiskScore(eventData, currentSession),
      flags: []
    },
    consentStatus: {
      analytics: true,
      marketing: false,
      timestamp: Date.now()
    }
  };

  // Add to session events
  currentSession.events.push(fullEvent);
  currentSession.lastActivity = Date.now();

  // Update stored session
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(currentSession));
  } catch {
    // Ignore storage errors
  }

  // Send to API (fire and forget for performance)
  console.log('Sending event to API:', fullEvent.id);
  try {
    fetch('/api/intelli-insights/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events: [fullEvent],
        sessionId: currentSession.sessionId,
        clientVersion: '1.0.0'
      }),
    }).then(response => {
      console.log('API response status:', response.status);
      if (!response.ok) {
        console.error('API request failed:', response.status, response.statusText);
      } else {
        console.log('Event sent successfully to API');
      }
      return response.json().catch(() => ({}));
    }).then(data => {
      console.log('API response data:', data);
    }).catch((error) => {
      console.error('API request error:', error);
    });
  } catch (error) {
    console.error('Fetch setup error:', error);
  }
}

// Event detection functions
export function detectRightClick(callback: (certificateId: string, targetElement: string) => void): () => void {
  const handleContextMenu = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const certificateId = findCertificateId(target);

    if (certificateId) {
      callback(certificateId, target.tagName.toLowerCase());
    }
  };

  document.addEventListener('contextmenu', handleContextMenu);
  return () => document.removeEventListener('contextmenu', handleContextMenu);
}

export function detectScreenshotAttempt(callback: (certificateId: string, method: 'keyboard' | 'dev_tools' | 'canvas_manipulation', canvasSize?: string) => void): () => void {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Print Screen key
    if (e.key === 'PrintScreen' || e.keyCode === 44) {
      const certificateId = getCurrentCertificateId();
      if (certificateId) {
        callback(certificateId, 'keyboard');
      }
    }

    // Ctrl+Shift+I (DevTools) or F12
    if ((e.ctrlKey && e.shiftKey && e.key === 'I') || e.key === 'F12') {
      const certificateId = getCurrentCertificateId();
      if (certificateId) {
        callback(certificateId, 'dev_tools');
      }
    }
  };

  // Canvas manipulation detection (simplified)
  const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
  HTMLCanvasElement.prototype.toDataURL = function(...args) {
    const certificateId = getCurrentCertificateId();
    if (certificateId) {
      callback(certificateId, 'canvas_manipulation', `${this.width}x${this.height}`);
    }
    return originalToDataURL.apply(this, args);
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
    HTMLCanvasElement.prototype.toDataURL = originalToDataURL;
  };
}

export function trackViewDuration(certificateId: string, callback: (duration: number) => void): () => void {
  const startTime = Date.now();
  let lastActivity = Date.now();

  const updateActivity = () => {
    lastActivity = Date.now();
  };

  // Track various activities
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  events.forEach(event => {
    document.addEventListener(event, updateActivity, { passive: true });
  });

  const interval = setInterval(() => {
    const now = Date.now();
    const duration = now - startTime;
    const timeSinceActivity = now - lastActivity;

    // If inactive for more than 30 seconds, stop tracking
    if (timeSinceActivity > 30000) {
      cleanup();
      return;
    }

    callback(duration);
  }, 1000);

  const cleanup = () => {
    clearInterval(interval);
    events.forEach(event => {
      document.removeEventListener(event, updateActivity);
    });
  };

  // Cleanup on page unload
  window.addEventListener('beforeunload', cleanup);

  return cleanup;
}

export function trackNavigation(callback: (fromCertificateId: string, toCertificateId: string) => void): () => void {
  let lastCertificateId = '';

  const observer = new MutationObserver(() => {
    const currentCertificateId = getCurrentCertificateId();
    if (currentCertificateId && currentCertificateId !== lastCertificateId && lastCertificateId) {
      callback(lastCertificateId, currentCertificateId);
    }
    lastCertificateId = currentCertificateId || '';
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-cert-id']
  });

  return () => observer.disconnect();
}

// Helper functions
function findCertificateId(element: HTMLElement): string | null {
  let current = element;
  while (current && current !== document.body) {
    const certId = current.getAttribute('data-cert-id') || current.getAttribute('data-certificate-id');
    if (certId) return certId;
    current = current.parentElement!;
  }
  return null;
}

function getCurrentCertificateId(): string | null {
  // Try to find from URL
  const urlParams = new URLSearchParams(window.location.search);
  const certId = urlParams.get('id');
  if (certId) return certId;

  // Try to find from DOM
  const viewer = document.querySelector('[data-pdf-viewer]');
  if (viewer) {
    return findCertificateId(viewer as HTMLElement);
  }

  return null;
}

// Prevent context menu on certificate elements
export function preventContextMenuOnCertificates(): () => void {
  const handleContextMenu = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const certificateId = findCertificateId(target);

    if (certificateId) {
      e.preventDefault();
      return false;
    }
  };

  document.addEventListener('contextmenu', handleContextMenu);
  return () => document.removeEventListener('contextmenu', handleContextMenu);
}