'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { CalendarIcon, Download, Filter, RefreshCw, Shield, TrendingUp, Users } from 'lucide-react';
import { AnalyticsCards } from '@/components/admin/analytics-cards';
import { CertificateChart } from '@/components/admin/certificate-chart';
import { SecurityAlerts } from '@/components/admin/security-alerts';
import { TopCertificates } from '@/components/admin/top-certificates';
import { GeoDistribution } from '@/components/admin/geo-distribution';





export default function IntelliInsightsDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    eventType: '',
    certificateId: ''
  });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [activeCategory, setActiveCategory] = useState('dashboard');
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const router = useRouter();

  // Debounce filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [filters]);

  useEffect(() => {
    // Simple admin check - in production, use proper authentication
    const isAdmin = localStorage.getItem('admin-access') === 'true' ||
                    new URLSearchParams(window.location.search).get('admin') === 'true';

    if (!isAdmin) {
      router.push('/');
      return;
    }

    fetchDashboardData();

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [debouncedFilters]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (debouncedFilters.startDate) queryParams.set('startDate', debouncedFilters.startDate);
      if (debouncedFilters.endDate) queryParams.set('endDate', debouncedFilters.endDate);
      if (debouncedFilters.eventType) queryParams.set('eventType', debouncedFilters.eventType);
      if (debouncedFilters.certificateId) queryParams.set('certificateId', debouncedFilters.certificateId);

      const response = await fetch(`/api/intelli-insights/dashboard?${queryParams.toString()}`, {
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_INTELLI_INSIGHTS_ADMIN_KEY || 'admin-key-123'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [debouncedFilters]);

  const handleLast30Days = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    setFilters(prev => ({
      ...prev,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }));
  };

  const handleExport = () => {
    if (!data) return;

    // Create CSV content
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Events', data.summary?.totalEvents || 0],
      ['Total Views', data.summary?.totalViews || 0],
      ['Total Downloads', data.summary?.totalDownloads || 0],
      ['Total Right Clicks', data.summary?.totalRightClicks || 0],
      ['Total Screenshot Attempts', data.summary?.totalScreenshotAttempts || 0],
      ['Total Suspicious Activities', data.summary?.totalSuspiciousActivities || 0],
      ['Unique Certificates', data.summary?.uniqueCertificates || 0],
      [],
      ['Certificate Statistics'],
      ['Certificate ID', 'Views', 'Downloads', 'Right Clicks', 'Screenshot Attempts', 'Suspicious Activities', 'Avg View Duration']
    ];

    if (data.certificateStats) {
      data.certificateStats.forEach((cert: any) => {
        csvContent.push([
          cert.certificateId,
          cert.views,
          cert.downloads,
          cert.rightClicks,
          cert.screenshotAttempts,
          cert.suspiciousActivities,
          cert.avgViewDuration
        ]);
      });
    }

    // Convert to CSV string
    const csvString = csvContent.map(row => row.join(',')).join('\n');

    // Create and download file
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `intelli-insights-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button onClick={fetchDashboardData} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2">
              <Shield className="h-6 w-6" />
              <span className="font-semibold">Intelli Insights</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeCategory === 'dashboard'}
                  onClick={() => setActiveCategory('dashboard')}
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeCategory === 'security'}
                  onClick={() => setActiveCategory('security')}
                >
                  <Shield className="h-4 w-4" />
                  <span>Security</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeCategory === 'analytics'}
                  onClick={() => setActiveCategory('analytics')}
                >
                  <Users className="h-4 w-4" />
                  <span>Analytics</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">Intelli Insights Dashboard</h1>
              <Badge variant="outline">Admin</Badge>
            </div>
          </header>
          <main className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            {activeCategory === 'dashboard' && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight">Analytics Overview</h2>
                    <p className="text-muted-foreground">
                      Monitor certificate interactions and security events
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleLast30Days}>
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Last 30 days
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExport}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>

                {/* Filters */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Filters
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <label className="text-sm font-medium">Start Date</label>
                        <Dialog open={startDateOpen} onOpenChange={setStartDateOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {filters.startDate || 'Pick a date'}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={filters.startDate ? new Date(filters.startDate) : undefined}
                              onSelect={(date) => {
                                setFilters(prev => ({
                                  ...prev,
                                  startDate: date ? date.toISOString().split('T')[0] : ''
                                }));
                                setStartDateOpen(false);
                              }}
                              initialFocus
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                      <div>
                        <label className="text-sm font-medium">End Date</label>
                        <Dialog open={endDateOpen} onOpenChange={setEndDateOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {filters.endDate || 'Pick a date'}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={filters.endDate ? new Date(filters.endDate) : undefined}
                              onSelect={(date) => {
                                setFilters(prev => ({
                                  ...prev,
                                  endDate: date ? date.toISOString().split('T')[0] : ''
                                }));
                                setEndDateOpen(false);
                              }}
                              initialFocus
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Event Type</label>
                        <Input
                          placeholder="e.g., view, download"
                          value={filters.eventType}
                          onChange={(e) => setFilters(prev => ({ ...prev, eventType: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Certificate ID</label>
                        <Input
                          placeholder="e.g., cert-123"
                          value={filters.certificateId}
                          onChange={(e) => setFilters(prev => ({ ...prev, certificateId: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button onClick={fetchDashboardData} size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Apply Filters
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFilters({ startDate: '', endDate: '', eventType: '', certificateId: '' });
                          fetchDashboardData();
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <AnalyticsCards data={data} />

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                  <div className="col-span-4">
                    <CertificateChart dailyStats={data?.dailyStats || []} />
                  </div>
                  <div className="col-span-3">
                    <SecurityAlerts />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <TopCertificates certificateStats={data?.certificateStats || []} />
                  <GeoDistribution events={data?.events || []} />
                </div>
              </>
            )}

            {activeCategory === 'security' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Security Center</h2>
                  <p className="text-muted-foreground">
                    Monitor security alerts and threats
                  </p>
                </div>
                <SecurityAlerts />
              </div>
            )}

            {activeCategory === 'analytics' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
                  <p className="text-muted-foreground">
                    Detailed analytics and insights
                  </p>
                </div>
                <AnalyticsCards data={data} />
                <div className="grid gap-4 md:grid-cols-2">
                  <TopCertificates certificateStats={data?.certificateStats || []} />
                  <GeoDistribution events={data?.events || []} />
                </div>
              </div>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}