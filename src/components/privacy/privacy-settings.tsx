'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Settings, Trash2, Eye, Download, AlertTriangle } from 'lucide-react';
import {
  getConsentStatus,
  updateConsent,
  withdrawConsent,
  hasAnalyticsConsent,
  hasMarketingConsent,
  hasSecurityConsent
} from '@/utils/cookie-consent';

interface PrivacySettingsProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function PrivacySettings({ open, onOpenChange }: PrivacySettingsProps) {
  const [isOpen, setIsOpen] = useState(open || false);
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [securityConsent] = useState(true); // Always enabled
  const [isLoading, setIsLoading] = useState(false);
  const [consentStatus, setConsentStatus] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadConsentStatus();
    }
  }, [isOpen]);

  // Listen for open privacy settings event
  useEffect(() => {
    const handleOpenSettings = () => {
      setIsOpen(true);
      loadConsentStatus();
    };

    window.addEventListener('open-privacy-settings', handleOpenSettings);
    return () => window.removeEventListener('open-privacy-settings', handleOpenSettings);
  }, []);

  const loadConsentStatus = () => {
    const status = getConsentStatus();
    setConsentStatus(status);
    setAnalyticsConsent(status.analytics);
    setMarketingConsent(status.marketing);
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      const result = await updateConsent(analyticsConsent, marketingConsent, securityConsent);
      if (result.success) {
        loadConsentStatus();
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawConsent = async () => {
    if (!deleteReason.trim()) return;

    setIsLoading(true);
    try {
      const result = await withdrawConsent(deleteReason);
      if (result.success) {
        setShowDeleteConfirm(false);
        setDeleteReason('');
        loadConsentStatus();
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Failed to withdraw consent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    // In a real implementation, this would call an API to export user data
    alert('Data export functionality would be implemented here. This would generate a downloadable file containing all user data.');
  };

  const handleViewAuditLog = () => {
    // In a real implementation, this would open an audit log viewer
    alert('Audit log viewer would be implemented here. This would show a timeline of all data processing activities.');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      onOpenChange?.(open);
    }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Privacy Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Privacy Settings & Data Management</DialogTitle>
          <DialogDescription>
            Manage your privacy preferences and data rights under GDPR.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Consent Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cookie & Tracking Preferences</CardTitle>
              <CardDescription>
                Control how we collect and use your data for analytics and personalization.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Analytics & Performance</label>
                  <p className="text-xs text-muted-foreground">
                    Help us improve our services by collecting anonymous usage data and performance metrics.
                  </p>
                </div>
                <Checkbox
                  checked={analyticsConsent}
                  onCheckedChange={(checked: boolean) => setAnalyticsConsent(checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Marketing & Personalization</label>
                  <p className="text-xs text-muted-foreground">
                    Receive personalized content and recommendations based on your interests.
                  </p>
                </div>
                <Checkbox
                  checked={marketingConsent}
                  onCheckedChange={(checked: boolean) => setMarketingConsent(checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Security Monitoring</label>
                  <p className="text-xs text-muted-foreground">
                    Essential security monitoring of certificate interactions (always enabled for your protection).
                  </p>
                </div>
                <Checkbox checked={securityConsent} disabled />
              </div>

              <div className="pt-4">
                <Button onClick={handleSavePreferences} disabled={isLoading} className="w-full">
                  {isLoading ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Current Consent Status */}
          {consentStatus && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Consent Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Consent Given:</span>
                    <Badge variant={consentStatus.given ? "default" : "secondary"} className="ml-2">
                      {consentStatus.given ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Analytics:</span>
                    <Badge variant={consentStatus.analytics ? "default" : "secondary"} className="ml-2">
                      {consentStatus.analytics ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Marketing:</span>
                    <Badge variant={consentStatus.marketing ? "default" : "secondary"} className="ml-2">
                      {consentStatus.marketing ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Security:</span>
                    <Badge variant="default" className="ml-2">Always Enabled</Badge>
                  </div>
                </div>
                {consentStatus.timestamp && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Last updated: {new Date(consentStatus.timestamp).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Management & Rights</CardTitle>
              <CardDescription>
                Exercise your GDPR rights to access, export, or delete your data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button variant="outline" onClick={handleExportData} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export My Data
                </Button>

                <Button variant="outline" onClick={handleViewAuditLog} className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View Audit Log
                </Button>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium text-sm">Data Deletion Request</h4>
                <p className="text-xs text-muted-foreground">
                  Request complete deletion of all your data. This action cannot be undone.
                </p>

                {!showDeleteConfirm ? (
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Request Data Deletion
                  </Button>
                ) : (
                  <div className="space-y-3 p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        This will permanently delete all your data and cannot be undone.
                        Please provide a reason for the deletion request.
                      </AlertDescription>
                    </Alert>

                    <textarea
                      className="w-full p-2 border rounded-md text-sm"
                      placeholder="Please provide a reason for your data deletion request..."
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      rows={3}
                    />

                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        onClick={handleWithdrawConsent}
                        disabled={isLoading || !deleteReason.trim()}
                        className="flex-1"
                      >
                        {isLoading ? 'Processing...' : 'Confirm Deletion'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteReason('');
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-xs text-muted-foreground text-center">
            <p>
              For more information about how we process your data, please read our{' '}
              <a href="/privacy-policy" className="underline hover:no-underline">
                Privacy Policy
              </a>
              .
            </p>
            <p className="mt-1">
              If you have questions about your data rights, please contact our privacy team.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}