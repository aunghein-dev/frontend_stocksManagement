'use client';

import * as React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import type { LineChartProps } from '@mui/x-charts/LineChart';
import { useTranslation } from '@/hooks/useTranslation';

type SalesChartProps = {
  series: {
    data: number[];
    label: string;
    color: string;
    area?: boolean;
  }[];
};

export default function SalesChart({ series }: SalesChartProps) {
  const { t } = useTranslation();

  const chartYAxis: LineChartProps['yAxis'] = [
    {
      label: t('lbl_amount'),
      sx: {
        '& .MuiChartsAxis-tickLabel': {
          fontSize: 13,
          fill: '#4b5563',
        },
        '& .MuiChartsAxis-label': {
          fontSize: 14,
          fontWeight: 600,
          fill: '#1f2937',
        },
      },
    },
  ];

  const chartXAxis: LineChartProps['xAxis'] = [
    {
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      scaleType: 'point',
      label: t('lbl_weeksOfCurMonth'),
      sx: {
        '& .MuiChartsAxis-tickLabel': {
          fontSize: 12,
          fill: '#4b5563',
        },
        '& .MuiChartsAxis-label': {
          fontSize: 12,
          fontWeight: 600,
          fill: '#1f2937',
        },
      },
    },
  ];

  return (
    <div className="w-full px-1 pt-10 pb-2 flex justify-center items-center relative">
      <LineChart
        xAxis={chartXAxis}
        yAxis={chartYAxis}
        series={series}
        height={170}
        margin={{ top: 5, bottom: 5, left: 8, right: 8 }}
        grid={{ vertical: true, horizontal: true }}
        slotProps={{
          line: {
            style: {
              strokeWidth: 3,
            },
          },
          legend: {
            sx: {
              '& .MuiChartsLegend-series': {
                gap: '10px',
              },
              '& .MuiChartsLegend-mark': {
                width: '12px',
                height: '12px',
                borderRadius: '50%',
              },
              '& .MuiChartsLegend-label': {
                fontSize: 13,
                fontWeight: 500,
              },
            },
          },
          tooltip: {
            sx: {
              '& .MuiChartsTooltip-root': {
                fontSize: 13,
                fontWeight: 500,
              },
            },
          },
        }}
      />
    </div>
  );
}
