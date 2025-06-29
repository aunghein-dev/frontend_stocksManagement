'use client';

type SalesChartProps = {
  series: {
    data: number[];
    label: string;
    color: string;
    area?: boolean;
  }[];
};


import * as React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { chartXAxis, chartYAxis } from '@/data/sales.data';


export default function SalesChart({ series }: SalesChartProps) {
  return (
    <div className="w-full px-1 pt-10 pb-2 flex justify-center items-center relative">
      <LineChart
        xAxis={chartXAxis as any}
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
