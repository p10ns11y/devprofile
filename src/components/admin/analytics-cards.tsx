import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Download, Shield, Users, TrendingUp, TrendingDown } from 'lucide-react';

interface AnalyticsData {
  summary: {
    totalViews: number;
    totalDownloads: number;
    totalSuspiciousActivities: number;
    uniqueCertificates: number;
  };
}

interface AnalyticsCardsProps {
  data: AnalyticsData | null;
  previousData?: AnalyticsData | null;
}

export function AnalyticsCards({ data, previousData }: AnalyticsCardsProps) {
  const calculateTrend = (current: number, previous: number) => {
    if (!previous || previous === 0) return { value: 0, isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change),
      isPositive: change >= 0
    };
  };

  const cards = [
    {
      title: 'Total Views',
      value: data?.summary?.totalViews || 0,
      icon: Eye,
      trend: previousData ? calculateTrend(data?.summary?.totalViews || 0, previousData.summary?.totalViews || 0) : null,
      description: 'Certificate views'
    },
    {
      title: 'Total Downloads',
      value: data?.summary?.totalDownloads || 0,
      icon: Download,
      trend: previousData ? calculateTrend(data?.summary?.totalDownloads || 0, previousData.summary?.totalDownloads || 0) : null,
      description: 'Certificate downloads'
    },
    {
      title: 'Suspicious Activities',
      value: data?.summary?.totalSuspiciousActivities || 0,
      icon: Shield,
      trend: previousData ? calculateTrend(data?.summary?.totalSuspiciousActivities || 0, previousData.summary?.totalSuspiciousActivities || 0) : null,
      description: 'Security events detected'
    },
    {
      title: 'Unique Certificates',
      value: data?.summary?.uniqueCertificates || 0,
      icon: Users,
      trend: null,
      description: 'Certificates tracked'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {card.trend ? (
                  <>
                    {card.trend.isPositive ? (
                      <TrendingUp className="inline h-3 w-3 mr-1 text-green-500" />
                    ) : (
                      <TrendingDown className="inline h-3 w-3 mr-1 text-red-500" />
                    )}
                    {card.trend.value.toFixed(1)}% from last period
                  </>
                ) : (
                  card.description
                )}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}