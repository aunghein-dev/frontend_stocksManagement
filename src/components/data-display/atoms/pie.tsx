import * as React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { valueFormatter } from '@/data/pie.data';
import Link from 'next/link';

type PieChartData = {
  label: string;
  value: number;
};

export default function PieActiveArc(props: { data: PieChartData[] })  {
  // transform to the format PieChart expects
  const transformedData = props.data.map((item) => ({
    label: item.label,
    value: item.value,
  }));

  return (
    <div className="w-full px-1 pt-10 pb-2 flex justify-center items-center relative">
      <PieChart
        series={[
          {
            data: transformedData,
            highlightScope: { fade: 'global', highlight: 'item' },
            faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
            valueFormatter,
          },
        ]}
        height={170}
      />
      <Link
        href="/"
        className="bg-blue-100 hover:bg-blue-200 text-blue-600 border-[0.5px]
                   border-blue-500 absolute -top-4 right-4
                   px-3 py-1.5 rounded-sm text-xs cursor-pointer"
      >
        View Report
      </Link>
    </div>
  );
}
