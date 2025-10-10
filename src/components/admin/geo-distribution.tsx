import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Eye } from 'lucide-react';

interface GeoData {
  country: string;
  region: string;
  views: number;
  downloads: number;
  sessions: Set<string>;
}

interface GeoDistributionProps {
  events?: any[];
}

export function GeoDistribution({ events = [] }: GeoDistributionProps) {
  // Aggregate geographic data from events
  const geoStats = events.reduce((acc: Record<string, GeoData>, event) => {
    const key = `${event.location.country}-${event.location.region}`;
    if (!acc[key]) {
      acc[key] = {
        country: event.location.country,
        region: event.location.region,
        views: 0,
        downloads: 0,
        sessions: new Set()
      };
    }

    const stat = acc[key];
    if (event.eventType === 'view') stat.views++;
    if (event.eventType === 'download') stat.downloads++;
    stat.sessions.add(event.sessionId);

    return acc;
  }, {});

  // Convert to array and sort by total activity
  const geoData = Object.values(geoStats)
    .map((stat: any) => ({
      ...stat,
      sessions: stat.sessions.size,
      totalActivity: stat.views + stat.downloads
    }))
    .sort((a: any, b: any) => b.totalActivity - a.totalActivity)
    .slice(0, 10); // Top 10 locations

  if (!events || events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Geographic Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No geographic data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Geographic Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {geoData.map((location, index) => (
            <div key={`${location.country}-${location.region}`} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                  <span className="text-sm font-semibold text-primary">{index + 1}</span>
                </div>
                <div>
                  <div className="font-medium">{location.country}</div>
                  <div className="text-sm text-muted-foreground">{location.region}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span className="font-mono">{location.views}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span className="font-mono">{location.sessions}</span>
                </div>
                <Badge variant="outline" className="ml-2">
                  {location.totalActivity} total
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {geoData.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No location data found in events
          </div>
        )}

        {events.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Total locations tracked: {Object.keys(geoStats).length}</span>
              <span>Data from {events.length} events</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}