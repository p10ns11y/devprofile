'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface DailyStats {
  date: string;
  views: number;
  downloads: number;
  suspicious: number;
}

interface CertificateChartProps {
  dailyStats: DailyStats[];
}

const chartConfig = {
  views: {
    label: 'Views',
    color: 'hsl(var(--chart-1))',
  },
  downloads: {
    label: 'Downloads',
    color: 'hsl(var(--chart-2))',
  },
  suspicious: {
    label: 'Suspicious',
    color: 'hsl(var(--chart-3))',
  },
};

export function CertificateChart({ dailyStats }: CertificateChartProps) {
  if (!dailyStats || dailyStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Certificate Activity Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Certificate Activity (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart data={dailyStats}>
            <XAxis
              dataKey="date"
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
              labelFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                });
              }}
            />
            <Line
              type="monotone"
              dataKey="views"
              stroke="var(--color-views)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="downloads"
              stroke="var(--color-downloads)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="suspicious"
              stroke="var(--color-suspicious)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}