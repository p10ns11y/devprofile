'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Settings } from 'lucide-react';
import {
  shouldShowConsentBanner,
  updateConsent,
  hasAnalyticsConsent,
  hasMarketingConsent
} from '@/utils/cookie-consent';

interface ConsentBannerProps {
  onSettingsClick?: () => void;
}

export function ConsentBanner({ onSettingsClick }: ConsentBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if banner should be shown
    const shouldShow = shouldShowConsentBanner();
    const analyticsConsent = hasAnalyticsConsent();
    const marketingConsent = hasMarketingConsent();
    console.log('Consent banner check - should show:', shouldShow, 'consent given:', !shouldShow);
    console.log('Current consent - analytics:', analyticsConsent, 'marketing:', marketingConsent);
    setIsVisible(shouldShow);

    // Pre-fill with existing consent if any
    setAnalyticsConsent(analyticsConsent);
    setMarketingConsent(marketingConsent);
  }, []);

  const handleAcceptAll = async () => {
    setIsLoading(true);
    try {
      const result = await updateConsent(true, true, true);
      if (result.success) {
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Failed to accept consent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptSelected = async () => {
    setIsLoading(true);
    try {
      const result = await updateConsent(analyticsConsent, marketingConsent, true);
      if (result.success) {
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Failed to update consent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectAll = async () => {
    setIsLoading(true);
    try {
      const result = await updateConsent(false, false, true);
      if (result.success) {
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Failed to reject consent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingsClick = () => {
    // Dispatch custom event to open privacy settings
    const event = new CustomEvent('open-privacy-settings');
    window.dispatchEvent(event);
    onSettingsClick?.();
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 max-w-sm"
      role="dialog"
      aria-labelledby="consent-title"
      aria-describedby="consent-description"
    >
      <Card className="p-4 shadow-lg border">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h3 id="consent-title" className="font-semibold text-sm">
              Cookie Preferences
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0"
              aria-label="Close consent banner"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          <p id="consent-description" className="text-xs text-muted-foreground">
            We use cookies for analytics, security monitoring, and to improve your experience.
          </p>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="analytics"
                checked={analyticsConsent}
                onCheckedChange={(checked: boolean) => setAnalyticsConsent(checked)}
              />
              <label htmlFor="analytics" className="text-xs">
                Analytics
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="marketing"
                checked={marketingConsent}
                onCheckedChange={(checked: boolean) => setMarketingConsent(checked)}
              />
              <label htmlFor="marketing" className="text-xs">
                Marketing
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="security"
                checked={true}
                disabled
              />
              <label htmlFor="security" className="text-xs text-muted-foreground">
                Security (required)
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t">
            <Button
              onClick={handleAcceptAll}
              disabled={isLoading}
              size="sm"
              className="flex-1 text-xs"
            >
              {isLoading ? 'Saving...' : 'Accept All'}
            </Button>

            <Button
              variant="outline"
              onClick={handleAcceptSelected}
              disabled={isLoading}
              size="sm"
              className="flex-1 text-xs"
            >
              Accept
            </Button>

            <Button
              variant="outline"
              onClick={handleRejectAll}
              disabled={isLoading}
              size="sm"
              className="flex-1 text-xs"
            >
              Reject
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center pt-2">
            <a href="/privacy-policy" className="underline hover:no-underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}