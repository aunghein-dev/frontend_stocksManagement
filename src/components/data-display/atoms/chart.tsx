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
import Link from 'next/link';

export default function SalesChart({ series }: SalesChartProps) {
  return (
    <div className="w-full px-1 pt-10 pb-2 flex justify-center items-center relative">
      <LineChart
        xAxis={chartXAxis as any}
        yAxis={chartYAxis}
        series={series}
        height={170}
        margin={{ top: 5, bottom: 5, left: 5, right: 5 }}
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
    <Link href='/'
               className='bg-blue-100 hover:bg-blue-200 text-blue-600 border-[0.5px]
                           border-blue-500 absolute -top-1 right-0
                           px-3 py-1.5 rounded-sm text-xs cursor-pointer'>View Report</Link>
    </div>
  );
}
