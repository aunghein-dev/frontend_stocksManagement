import * as React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { valueFormatter } from '@/data/pie.data';

type PieChartData = {
  label: string;
  value: number;
};

function truncateLabel(label: string, maxLength = 15) {
  if (label.length <= maxLength) return label;
  return label.slice(0, maxLength) + '...';
}

export default function PieActiveArc(props: { data: PieChartData[] }) {
  const transformedData = props.data.map((item) => ({
    label: truncateLabel(item.label, 15),
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
    </div>
  );
}
