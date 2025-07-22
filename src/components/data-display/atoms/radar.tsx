
import * as React from 'react';
import { RadarChart } from '@mui/x-charts/RadarChart';
import { useTranslation } from '@/hooks/useTranslation';

export type RadarProps = {
  metrics: string[];
  summerData: number[];
  rainningData: number[];
  winterData: number[];
};

export default function Radar(props: RadarProps) {

  const { t } = useTranslation();

  function truncateLabel(label: string, maxLength = 15) {
    if (label.length <= maxLength) return label;
    return label.slice(0, maxLength) + '...';
  }

  const truncatedMetrics = props.metrics.map(label => truncateLabel(label, 15));

  if (props.metrics.length === 0) {
    return (
       <p className="text-sm text-gray-400">No radar chart data available.</p>
    );
  }
  return (
    <div className="w-full flex justify-center items-center relative ">
      <div className="w-full max-w-xl">
        <RadarChart
          height={250}
          width={undefined}
          series={[
            { label: t('lbl_summer'), data: props.summerData || [] },
            { label: t('lbl_rainning'), data: props.rainningData || [] },
            { label: t('lbl_winter'), data: props.winterData || [] },
          ]}
          radar={{
            max: 100,
            metrics: truncatedMetrics,
          }}/>
      </div>
       
    </div>
  );
}
