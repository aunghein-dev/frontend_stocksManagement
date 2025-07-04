
import * as React from 'react';
import { RadarChart } from '@mui/x-charts/RadarChart';
import { useTranslation } from '@/hooks/useTranslation';

export default function Radar(props: {metrics: string[], summerData: number[], rainningData: number[], winterData: number[]}) {

  if (props.metrics.length === 0) {
    return (
       <p className="text-sm text-gray-400">No radar chart data available.</p>
    );
  }

  const { t } = useTranslation();

  return (
    <div className="w-full flex justify-center items-center relative ">
      <div className="w-full max-w-xl">
        <RadarChart
          height={250} 
          width={undefined} // Let the chart auto-fit its container
          series={[{ label: t('lbl_summer'), data: props.summerData  || [] },
                   { label: t('lbl_rainning'), data: props.rainningData || [] },
                   { label: t('lbl_winter'), data: props.winterData || [] }]}
          radar={{
            max: 100,
            metrics: props.metrics || [],
          }}
        />
        
      </div>
       
    </div>
  );
}
