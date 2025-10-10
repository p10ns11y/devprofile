import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, Download, Clock, TrendingUp } from 'lucide-react';

interface CertificateStat {
  certificateId: string;
  views: number;
  downloads: number;
  rightClicks: number;
  screenshotAttempts: number;
  suspiciousActivities: number;
  avgViewDuration: number;
}

interface TopCertificatesProps {
  certificateStats: CertificateStat[];
  limit?: number;
}

export function TopCertificates({ certificateStats, limit = 10 }: TopCertificatesProps) {
  // Sort by total interactions (views + downloads) and take top N
  const sortedCertificates = certificateStats
    .sort((a, b) => (b.views + b.downloads) - (a.views + a.downloads))
    .slice(0, limit);

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getPopularityBadge = (totalInteractions: number) => {
    if (totalInteractions >= 100) return <Badge className="bg-green-100 text-green-800">Very Popular</Badge>;
    if (totalInteractions >= 50) return <Badge className="bg-blue-100 text-blue-800">Popular</Badge>;
    if (totalInteractions >= 20) return <Badge className="bg-yellow-100 text-yellow-800">Moderate</Badge>;
    return <Badge variant="secondary">Low Activity</Badge>;
  };

  if (!certificateStats || certificateStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Certificates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No certificate data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Top Certificates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Certificate</TableHead>
              <TableHead className="text-center">
                <Eye className="h-4 w-4 inline mr-1" />
                Views
              </TableHead>
              <TableHead className="text-center">
                <Download className="h-4 w-4 inline mr-1" />
                Downloads
              </TableHead>
              <TableHead className="text-center">
                <Clock className="h-4 w-4 inline mr-1" />
                Avg Duration
              </TableHead>
              <TableHead className="text-center">Popularity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCertificates.map((cert, index) => {
              const totalInteractions = cert.views + cert.downloads;
              return (
                <TableRow key={cert.certificateId}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{cert.certificateId}</div>
                      <div className="text-xs text-muted-foreground">
                        {cert.suspiciousActivities > 0 && (
                          <span className="text-orange-600">
                            {cert.suspiciousActivities} suspicious
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="font-mono">{cert.views.toLocaleString()}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="font-mono">{cert.downloads.toLocaleString()}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="font-mono">
                      {cert.avgViewDuration ? formatDuration(cert.avgViewDuration / 1000) : 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {getPopularityBadge(totalInteractions)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {sortedCertificates.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No certificate interactions found
          </div>
        )}

        {certificateStats.length > limit && (
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              Showing top {limit} of {certificateStats.length} certificates
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}