'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Shield, RefreshCw } from 'lucide-react';

interface Alert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: number;
  sessionId?: string;
  certificateIds?: string[];
  actions?: string[];
}

interface SecurityAlertsProps {
  refreshInterval?: number; // in milliseconds
}

const severityColors = {
  low: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  medium: 'bg-orange-100 text-orange-800 border-orange-200',
  high: 'bg-red-100 text-red-800 border-red-200',
  critical: 'bg-red-900 text-white border-red-900'
};

const severityIcons = {
  low: AlertTriangle,
  medium: AlertTriangle,
  high: Shield,
  critical: Shield
};

export function SecurityAlerts({ refreshInterval = 30000 }: SecurityAlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/intelli-insights/alerts', {
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_INTELLI_INSIGHTS_ADMIN_KEY || 'admin-key-123'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }

      const data = await response.json();
      setAlerts(data.alerts || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    // Set up auto-refresh
    const interval = setInterval(fetchAlerts, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  if (loading && alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading alerts...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchAlerts} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Alerts
            {alerts.length > 0 && (
              <Badge variant="secondary">{alerts.length}</Badge>
            )}
          </div>
          <Button onClick={fetchAlerts} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No security alerts at this time</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {alerts.map((alert) => {
              const Icon = severityIcons[alert.severity];
              return (
                <div
                  key={alert.id}
                  className={`p-4 border rounded-lg ${severityColors[alert.severity]}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <h4 className="font-medium">{alert.title}</h4>
                    </div>
                    <Badge
                      variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm mb-2">{alert.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(alert.timestamp)}
                    </div>
                    {alert.sessionId && (
                      <span>Session: {alert.sessionId.slice(-8)}</span>
                    )}
                  </div>
                  {alert.actions && alert.actions.length > 0 && (
                    <div className="mt-3 flex gap-2">
                      {alert.actions.slice(0, 2).map((action) => (
                        <Button key={action} variant="outline" size="sm" className="text-xs">
                          {action.replace('_', ' ')}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}