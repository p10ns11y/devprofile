import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, Eye, Trash2, UserCheck, Mail, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy - Intelli Insights',
  description: 'Privacy policy and data protection information for certificate monitoring and analytics services.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
          <p className="text-xl text-muted-foreground">
            How we collect, use, and protect your data
          </p>
          <Badge variant="outline" className="text-sm">
            Last updated: {new Date().toLocaleDateString()}
          </Badge>
        </div>

        {/* Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This privacy policy explains how Intelli Insights ("we", "us", or "our") collects,
              uses, and protects your personal data when you use our certificate viewing and
              analytics services. We are committed to protecting your privacy and complying
              with GDPR and other applicable data protection laws.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 border rounded-lg">
                <Eye className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <h3 className="font-semibold">Transparency</h3>
                <p className="text-sm text-muted-foreground">
                  Clear information about data collection and usage
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <UserCheck className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <h3 className="font-semibold">Your Control</h3>
                <p className="text-sm text-muted-foreground">
                  Easy opt-out and data management options
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Shield className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <h3 className="font-semibold">Security</h3>
                <p className="text-sm text-muted-foreground">
                  Industry-standard encryption and protection
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Collection */}
        <Card>
          <CardHeader>
            <CardTitle>What Data We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Certificate Interaction Data</h3>
              <p className="text-muted-foreground mb-3">
                When you view or interact with certificates, we may collect:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Certificate viewing duration and scroll depth</li>
                <li>Navigation patterns between certificates</li>
                <li>Download attempts and success status</li>
                <li>Right-click events and context menu usage</li>
                <li>Screenshot attempt detection</li>
                <li>Viewport size and device information</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-3">Technical Data</h3>
              <p className="text-muted-foreground mb-3">
                We automatically collect certain technical information:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>IP address (anonymized through hashing)</li>
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>Screen resolution and device type</li>
                <li>Timezone and approximate location (country/region only)</li>
                <li>Referrer URL and page navigation</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-3">Security Monitoring</h3>
              <p className="text-muted-foreground mb-3">
                For security purposes, we monitor suspicious activities:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                <li>Multiple rapid downloads from the same source</li>
                <li>Unusual navigation patterns</li>
                <li>Screenshot attempts</li>
                <li>Right-click frequency analysis</li>
                <li>Geographic anomaly detection</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Note:</strong> Security monitoring cannot be disabled as it protects
                both users and content owners from malicious activity.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Usage */}
        <Card>
          <CardHeader>
            <CardTitle>How We Use Your Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold">Analytics & Performance (Optional)</h4>
                <p className="text-sm text-muted-foreground">
                  With your consent, we use aggregated, anonymized data to improve our services,
                  optimize performance, and understand user behavior patterns.
                </p>
              </div>

              <div>
                <h4 className="font-semibold">Security & Fraud Prevention</h4>
                <p className="text-sm text-muted-foreground">
                  We use security monitoring data to detect and prevent fraudulent activities,
                  protect digital certificates, and ensure platform integrity.
                </p>
              </div>

              <div>
                <h4 className="font-semibold">Personalization (Optional)</h4>
                <p className="text-sm text-muted-foreground">
                  With your consent, we may personalize content and recommendations based on
                  your interaction patterns.
                </p>
              </div>

              <div>
                <h4 className="font-semibold">Legal Compliance</h4>
                <p className="text-sm text-muted-foreground">
                  We retain and use data as necessary to comply with legal obligations,
                  resolve disputes, and enforce our terms of service.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Protection */}
        <Card>
          <CardHeader>
            <CardTitle>How We Protect Your Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Technical Measures</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• AES-256 encryption at rest</li>
                  <li>• TLS 1.3 encryption in transit</li>
                  <li>• Secure key management</li>
                  <li>• Regular security audits</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Organizational Measures</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Access controls and permissions</li>
                  <li>• Employee training programs</li>
                  <li>• Incident response procedures</li>
                  <li>• Regular compliance reviews</li>
                </ul>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-semibold mb-2">Data Retention</h4>
              <p className="text-sm text-muted-foreground">
                We retain your data only as long as necessary for the purposes outlined above.
                Analytics data is automatically deleted after 90 days. Security logs are kept
                for 7 years for compliance purposes. You can request deletion of your data at any time.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Your GDPR Rights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Under GDPR, you have the following rights regarding your personal data:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Access
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Request a copy of all personal data we hold about you.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">Rectification</h4>
                  <p className="text-sm text-muted-foreground">
                    Request correction of inaccurate or incomplete data.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Erasure
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Request deletion of your personal data ("right to be forgotten").
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold">Restriction</h4>
                  <p className="text-sm text-muted-foreground">
                    Request limitation of how we process your data.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">Portability</h4>
                  <p className="text-sm text-muted-foreground">
                    Request your data in a structured, machine-readable format.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold">Objection</h4>
                  <p className="text-sm text-muted-foreground">
                    Object to processing based on legitimate interests.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>To exercise your rights:</strong> Use the privacy settings panel accessible
                from any page, or contact our privacy team using the information below.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cookies */}
        <Card>
          <CardHeader>
            <CardTitle>Cookies & Tracking Technologies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Consent Management</h4>
              <p className="text-sm text-muted-foreground mb-3">
                We use cookies and similar technologies to remember your consent preferences
                and provide our services. You can manage your cookie preferences at any time.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <h5 className="font-medium">Essential Cookies</h5>
                <p className="text-sm text-muted-foreground">
                  Required for basic website functionality and security. Cannot be disabled.
                </p>
              </div>

              <div>
                <h5 className="font-medium">Analytics Cookies (Optional)</h5>
                <p className="text-sm text-muted-foreground">
                  Help us understand how visitors interact with our website.
                </p>
              </div>

              <div>
                <h5 className="font-medium">Marketing Cookies (Optional)</h5>
                <p className="text-sm text-muted-foreground">
                  Used to deliver personalized content and advertisements.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              If you have questions about this privacy policy or want to exercise your data rights,
              please contact us:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">privacy@intelli-insights.dev</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Data Protection Officer</p>
                  <p className="text-sm text-muted-foreground">dpo@intelli-insights.dev</p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <p className="text-sm">
                <strong>Response Time:</strong> We aim to respond to all privacy-related inquiries
                within 30 days. For urgent security concerns, please contact us immediately.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            This privacy policy was last updated on {new Date().toLocaleDateString()}.
            We may update this policy periodically to reflect changes in our practices or legal requirements.
          </p>
        </div>
      </div>
    </div>
  );
}